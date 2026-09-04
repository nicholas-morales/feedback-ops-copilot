/**
 * FO Gate MCP tools. Wraps the existing HITL loop in src/feedback-ops.mjs.
 * No send_reply. No Gmail. No SMTP. No model training.
 */

import { CATEGORIES, processFeedback, isEmptyBody, shouldCreateTask } from '../feedback-ops.mjs';
import { getSendGate, isSendLikeTool, SEND_GATE_BLOCK } from './send-gate.mjs';
import { listAwaitingApproval, putInbox, putRetry, putTask } from './store.mjs';

export const TOOL_NAMES = Object.freeze([
  'classify_feedback',
  'upsert_inbox_item',
  'upsert_task',
  'list_awaiting_approval',
  'log_exception',
  'get_send_gate',
]);

const TEXT_OR_JSON = {
  type: 'object',
  properties: {
    text: { type: 'string', description: 'Pasted client message or ticket body.' },
    json: { type: 'object', description: 'FO sample-shaped ticket (from, subject, body, receivedAt).' },
    from: { type: 'string' },
    subject: { type: 'string' },
    body: { type: 'string' },
    receivedAt: { type: 'string' },
    approval: { type: 'object' },
  },
};

export const TOOL_DEFS = [
  {
    name: 'classify_feedback',
    description:
      'Classify pasted text or JSON into Bug / Feature request / Billing / Praise / Ambiguous. Returns category, priority, and a one-line summary. Does not write Notion. Does not call Gmail.',
    inputSchema: TEXT_OR_JSON,
  },
  {
    name: 'upsert_inbox_item',
    description:
      'Write an Inbox / Feedback row (Classified or Tasked). Empty-body / Ambiguous-hold creates no Task.',
    inputSchema: TEXT_OR_JSON,
  },
  {
    name: 'upsert_task',
    description:
      'Upsert a related Task with Next action + Reply draft. Approval needed stays on unless already approved. Does not flip send.',
    inputSchema: {
      ...TEXT_OR_JSON,
      properties: {
        ...TEXT_OR_JSON.properties,
        inboxId: { type: 'string', description: 'Optional related Inbox row id.' },
      },
    },
  },
  {
    name: 'list_awaiting_approval',
    description: 'List Tasks where Approval needed is on or Status is Waiting approval. Does not auto-approve.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'log_exception',
    description: 'Write a Retries / Exceptions row (empty body, 429, send-gate). Does not retry send.',
    inputSchema: {
      type: 'object',
      properties: {
        kind: {
          type: 'string',
          enum: ['empty_body', 'api_429', 'send_gate', 'other'],
        },
        error: { type: 'string' },
        event: { type: 'string' },
        stage: { type: 'string' },
      },
    },
  },
  {
    name: 'get_send_gate',
    description:
      'Return { sent: false, send_is_on: false } until a buyer writes "send is on". There is no send_reply tool.',
    inputSchema: { type: 'object', properties: {} },
  },
];

export function inputToMessage(args = {}) {
  if (args.json && typeof args.json === 'object') {
    return { ...args.json };
  }
  const body = args.body ?? args.text ?? '';
  return {
    id: args.id || null,
    from: args.from || 'operator@local.test',
    subject: args.subject || '',
    body,
    receivedAt: args.receivedAt || null,
    channel: args.channel || 'mcp-paste',
    approval: args.approval,
  };
}

function inboxRecord(result) {
  return {
    subject: result.message.subject || '(no subject)',
    from: result.message.from,
    category: result.classification.category,
    priority: result.classification.priority,
    status: result.classification.inboxStatus,
    summary: result.summary,
    receivedAt: result.message.receivedAt,
    notion: result.notion.inbox,
    emptyBody: isEmptyBody(result.message.body),
    taskCreated: Boolean(result.notion.task),
  };
}

function taskRecord(result, inboxId) {
  if (!result.notion.task) return null;
  const props = result.notion.task.properties;
  return {
    title: props.Task.title[0].text.content,
    status: props.Status.select.name,
    approvalNeeded: props['Approval needed'].checkbox,
    nextAction: props['Next action'].rich_text[0].text.content,
    replyDraft: props['Reply draft'].rich_text[0].text.content,
    relatedInboxId: inboxId || null,
    sent: false,
    notion: result.notion.task,
  };
}

function textResult(payload) {
  return {
    content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
    structuredContent: payload,
  };
}

function errorResult(message, extra = {}) {
  return {
    isError: true,
    content: [{ type: 'text', text: JSON.stringify({ error: message, ...extra }, null, 2) }],
    structuredContent: { error: message, ...extra },
  };
}

export function runTool(name, args = {}, ctx = {}) {
  const store = ctx.store;
  const env = ctx.env || process.env;

  if (isSendLikeTool(name) || name === 'send_reply') {
    const gate = getSendGate(env);
    const retry = putRetry(store, {
      event: 'Send-gate block (no send tool)',
      stage: 'Send gate',
      error: gate.blockedReason,
      kind: 'send_gate',
      resolved: true,
    });
    return errorResult(SEND_GATE_BLOCK, {
      sent: false,
      send_is_on: gate.send_is_on,
      retry,
    });
  }

  if (name === 'classify_feedback') {
    const result = processFeedback(inputToMessage(args));
    return textResult({
      category: result.classification.category,
      priority: result.classification.priority,
      summary: result.summary,
      inboxStatus: result.classification.inboxStatus,
      reason: result.classification.reason,
      emptyBody: isEmptyBody(result.message.body),
      wouldCreateTask: shouldCreateTask(result.classification),
      sent: false,
    });
  }

  if (name === 'upsert_inbox_item') {
    const result = processFeedback(inputToMessage(args));
    const empty = isEmptyBody(result.message.body);
    const row = putInbox(store, inboxRecord(result));

    if (empty || result.classification.category === CATEGORIES.AMBIGUOUS) {
      if (empty) {
        putRetry(store, {
          event: 'Empty body — no Task created',
          stage: 'Classify',
          error: result.classification.reason,
          kind: 'empty_body',
          relatedInboxId: row.id,
          resolved: false,
        });
      }
      return textResult({
        inbox: row,
        task: null,
        taskCreated: false,
        sent: false,
        hold: empty ? 'empty_body' : 'ambiguous',
      });
    }

    return textResult({
      inbox: row,
      task: null,
      taskCreated: false,
      sent: false,
      note: 'Inbox written. Call upsert_task to create the related Task.',
    });
  }

  if (name === 'upsert_task') {
    const result = processFeedback(inputToMessage(args));
    const empty = isEmptyBody(result.message.body);
    if (empty || !result.notion.task) {
      const inbox = putInbox(store, inboxRecord(result));
      const retry = putRetry(store, {
        event: 'Task upsert skipped',
        stage: 'Upsert task',
        error: empty
          ? 'Empty body held — no Task created.'
          : 'Ambiguous classification — no Task created.',
        kind: 'empty_body',
        relatedInboxId: inbox.id,
        resolved: false,
      });
      return textResult({
        inbox,
        task: null,
        taskCreated: false,
        sent: false,
        retry,
      });
    }

    const inbox = putInbox(store, inboxRecord(result));
    const task = putTask(store, taskRecord(result, args.inboxId || inbox.id));
    return textResult({
      inbox,
      task,
      taskCreated: true,
      sent: false,
      sendGate: result.sendGate,
    });
  }

  if (name === 'list_awaiting_approval') {
    const items = listAwaitingApproval(store);
    return textResult({
      count: items.length,
      tasks: items,
      sent: false,
    });
  }

  if (name === 'log_exception') {
    const kind = args.kind || 'other';
    const stage =
      args.stage ||
      (kind === 'empty_body' ? 'Classify' : kind === 'send_gate' ? 'Send gate' : 'Ingest');
    const row = putRetry(store, {
      event: args.event || `Exception: ${kind}`,
      stage,
      error: args.error || kind,
      kind,
      resolved: kind === 'send_gate',
    });
    return textResult({ retry: row, sent: false });
  }

  if (name === 'get_send_gate') {
    return textResult(getSendGate(env));
  }

  return errorResult(`Unknown tool: ${name}`, { sent: false });
}

export { CATEGORIES };
