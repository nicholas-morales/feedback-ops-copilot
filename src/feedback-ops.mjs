/**
 * Feedback Ops Copilot — deterministic mock pipeline.
 *
 * Ingest → classify/summarize stub → Notion upsert JSON →
 * human-approval send gate → retries log.
 *
 * Mock contract: `sent` is always false. No Gmail/SMTP. No live Notion writes.
 */

export const CATEGORIES = Object.freeze({
  BUG: 'Bug',
  FEATURE: 'Feature request',
  BILLING: 'Billing',
  PRAISE: 'Praise',
  AMBIGUOUS: 'Ambiguous',
});

export const PRIORITIES = Object.freeze({
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
});

export const INBOX_STATUSES = Object.freeze({
  NEW: 'New',
  CLASSIFIED: 'Classified',
  TASKED: 'Tasked',
  CLOSED: 'Closed',
});

export const TASK_STATUSES = Object.freeze({
  OPEN: 'Open',
  WAITING_APPROVAL: 'Waiting approval',
  APPROVED: 'Approved',
  DONE: 'Done',
});

export const RETRY_STAGES = Object.freeze({
  INGEST: 'Ingest',
  CLASSIFY: 'Classify',
  UPSERT_TASK: 'Upsert task',
  DRAFT_REPLY: 'Draft reply',
  SEND_GATE: 'Send gate',
});

/** Public demo DBs (read-only walkthrough). Never treated as credentials. */
export const DEMO_NOTION = Object.freeze({
  pageUrl: 'https://app.notion.com/p/3ceeb1cdb78b813bbf92f7f21591e482',
  inboxDatabaseId: 'e7ef4cee56c14c42a2976b82980830a8',
  tasksDatabaseId: '9bc2938020014c3182bacca4f626bc3f',
  retriesDatabaseId: '6e7d1e89ed5a40c38a3a838647a22f4f',
});

const BILLING_RE =
  /\b(invoice|invoices|billing|billed|charge[ds]?|refund|payment|credit memo|double[- ]charg|setup fee|ap team)\b/i;
const BUG_RE =
  /\b(bug|broken|crash(?:es|ed)?|error|truncat(?:e|es|ed|ion)|doesn'?t work|not working|repro)\b/i;
const FEATURE_RE =
  /\b(can we|could we|feature|request|would it be possible|wishlist|add(?:ing)?|filter[s]?)\b/i;
const PRAISE_RE =
  /\b(thank(?:s| you)?|excellent|love|great|awesome|amazing|no action(?: needed)?)\b/i;

export function isEmptyBody(body) {
  return String(body ?? '').trim().length === 0;
}

export function normalizeMessage(input = {}) {
  const from = String(input.from ?? '').trim();
  const subject = String(input.subject ?? '').trim();
  const body = String(input.body ?? '');
  const receivedAt = input.receivedAt || input.received || null;

  return {
    id: input.id || null,
    from,
    subject,
    body,
    receivedAt,
    channel: input.channel || 'mock-ingest',
    approval: normalizeApproval(input.approval),
  };
}

export function normalizeApproval(approval) {
  if (!approval || typeof approval !== 'object') {
    return { approved: false, approvedBy: null, approvedAt: null };
  }
  return {
    approved: approval.approved === true,
    approvedBy: approval.approvedBy || null,
    approvedAt: approval.approvedAt || null,
  };
}

export function classify(message) {
  const { subject, body, from } = normalizeMessage(message);
  const haystack = `${subject}\n${body}`;

  if (isEmptyBody(body)) {
    return {
      category: CATEGORIES.AMBIGUOUS,
      priority: PRIORITIES.MEDIUM,
      inboxStatus: INBOX_STATUSES.CLASSIFIED,
      reason: 'Empty body held for human triage before task upsert.',
      bounceLike: /mailer-daemon|noreply|no-reply/i.test(from),
    };
  }

  if (BILLING_RE.test(haystack)) {
    return {
      category: CATEGORIES.BILLING,
      priority: PRIORITIES.HIGH,
      inboxStatus: INBOX_STATUSES.TASKED,
      reason: 'Billing keywords matched.',
      bounceLike: false,
    };
  }

  if (BUG_RE.test(haystack)) {
    return {
      category: CATEGORIES.BUG,
      priority: PRIORITIES.HIGH,
      inboxStatus: INBOX_STATUSES.TASKED,
      reason: 'Bug keywords matched.',
      bounceLike: false,
    };
  }

  if (FEATURE_RE.test(haystack)) {
    return {
      category: CATEGORIES.FEATURE,
      priority: PRIORITIES.MEDIUM,
      inboxStatus: INBOX_STATUSES.TASKED,
      reason: 'Feature-request keywords matched.',
      bounceLike: false,
    };
  }

  if (PRAISE_RE.test(haystack)) {
    return {
      category: CATEGORIES.PRAISE,
      priority: PRIORITIES.LOW,
      inboxStatus: INBOX_STATUSES.CLOSED,
      reason: 'Praise keywords matched.',
      bounceLike: false,
    };
  }

  return {
    category: CATEGORIES.AMBIGUOUS,
    priority: PRIORITIES.MEDIUM,
    inboxStatus: INBOX_STATUSES.CLASSIFIED,
    reason: 'No category keywords matched.',
    bounceLike: false,
  };
}

export function firstSentence(text, max = 180) {
  const cleaned = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return '';
  const match = cleaned.match(/.*?[.!?](?:\s|$)/);
  const sentence = (match ? match[0] : cleaned).trim();
  if (sentence.length <= max) return sentence;
  return `${sentence.slice(0, max - 1).trim()}…`;
}

export function summarize(message, classification = classify(message)) {
  const { subject, body } = normalizeMessage(message);

  if (classification.category === CATEGORIES.AMBIGUOUS && isEmptyBody(body)) {
    return 'Empty body / bounce-like sender; held for human triage before task upsert.';
  }

  if (classification.category === CATEGORIES.BILLING) {
    const invoice = (body + ' ' + subject).match(/#\s?\d+/);
    const invoiceBit = invoice ? ` (${invoice[0].replace(/\s/g, '')})` : '';
    return firstSentence(body) || `Billing issue${invoiceBit}: ${subject}`;
  }

  if (classification.category === CATEGORIES.PRAISE) {
    return firstSentence(body) || `Thanks note; no action required. (${subject})`;
  }

  return firstSentence(body) || firstSentence(subject) || 'No summary available.';
}

export function companyFromEmail(email) {
  const domain = String(email || '').split('@')[1] || '';
  const slug = domain.replace(/\.(example|test|invalid)$/i, '');
  if (!slug) return 'Unknown';
  return slug
    .split(/[-.]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function dateOnly(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    const m = String(value).match(/\d{4}-\d{2}-\d{2}/);
    return m ? m[0] : new Date().toISOString().slice(0, 10);
  }
  return d.toISOString().slice(0, 10);
}

function titleProp(content) {
  return { title: [{ type: 'text', text: { content: String(content || '').slice(0, 2000) } }] };
}

function richTextProp(content) {
  return {
    rich_text: [{ type: 'text', text: { content: String(content || '').slice(0, 2000) } }],
  };
}

function selectProp(name) {
  return { select: { name } };
}

function emailProp(email) {
  return { email: email || null };
}

function dateProp(start) {
  return { date: { start: dateOnly(start) } };
}

function checkboxProp(checked) {
  return { checkbox: Boolean(checked) };
}

function numberProp(n) {
  return { number: Number(n) || 0 };
}

export function shouldCreateTask(classification) {
  return classification.category !== CATEGORIES.AMBIGUOUS;
}

export function taskTitleFor(message, classification) {
  const { subject, from } = normalizeMessage(message);
  const company = companyFromEmail(from);

  switch (classification.category) {
    case CATEGORIES.BUG:
      return subject.toLowerCase().includes('truncat')
        ? 'Fix CSV product-name truncation'
        : `Fix: ${subject || 'reported bug'}`;
    case CATEGORIES.FEATURE:
      return subject.toLowerCase().includes('tag') || subject.toLowerCase().includes('filter')
        ? 'Roadmap: portal feedback tag filters'
        : `Roadmap: ${subject || 'feature request'}`;
    case CATEGORIES.BILLING:
      return /setup fee|double/i.test(`${subject} ${message.body || ''}`)
        ? 'Issue credit memo for double setup fee'
        : `Resolve billing: ${subject || 'invoice'}`;
    case CATEGORIES.PRAISE:
      return `Archive praise — ${company}`;
    default:
      return subject || 'Triage feedback';
  }
}

export function nextActionFor(classification) {
  switch (classification.category) {
    case CATEGORIES.BUG:
      return 'Engineering triage; draft ETA for the reporter.';
    case CATEGORIES.FEATURE:
      return 'Add to roadmap; soft acknowledge.';
    case CATEGORIES.BILLING:
      return 'Confirm credit memo issued; close after AP confirms.';
    case CATEGORIES.PRAISE:
      return 'No reply needed; archive praise for CS metrics.';
    default:
      return 'Human triage before task upsert.';
  }
}

export function replyDraftFor(message, classification, approval) {
  const { from, subject, body } = normalizeMessage(message);
  const company = companyFromEmail(from);
  const firstName = String(from.split('@')[0] || 'there')
    .split(/[._-]/)[0]
    .replace(/^\w/, (c) => c.toUpperCase());

  if (classification.category === CATEGORIES.BILLING) {
    const invoiceNo = (`${body} ${subject}`.match(/#\s?(\d+)/) || [])[1];
    const invoiceLabel = invoiceNo ? `invoice #${invoiceNo}` : 'the invoice';
    const approvedNote = approval?.approved ? ', human-approved' : '';
    return [
      `Hi ${company} AP team,`,
      '',
      `Thanks for flagging ${invoiceLabel}. We confirmed the setup fee was billed twice in error. A credit memo for $250 will post to your account within 1 business day, and you'll receive the PDF by email.`,
      '',
      "If anything still looks off after that, reply to this thread and we'll dig in.",
      '',
      `— Support (mock draft${approvedNote})`,
    ].join('\n');
  }

  if (classification.category === CATEGORIES.BUG) {
    return [
      `Hi ${firstName},`,
      '',
      `Thanks for the clear repro on ${subject || 'the reported issue'}. We've logged this as a High bug. I'll follow up with an ETA once engineering confirms the fix window.`,
      '',
      '— Support (mock draft, awaiting approval)',
    ].join('\n');
  }

  if (classification.category === CATEGORIES.FEATURE) {
    return [
      `Hi ${firstName},`,
      '',
      `Appreciate the feature request. We've captured it and will prioritize against the next sprint. Happy to share timing once it's sequenced.`,
      '',
      '— Support (mock draft)',
    ].join('\n');
  }

  if (classification.category === CATEGORIES.PRAISE) {
    return '(optional thank-you already closed — no send)';
  }

  return '';
}

export function taskStatusFor(classification, approval) {
  if (classification.category === CATEGORIES.PRAISE) return TASK_STATUSES.DONE;
  if (approval?.approved) return TASK_STATUSES.APPROVED;
  return TASK_STATUSES.WAITING_APPROVAL;
}

export function approvalNeededFor(classification, approval) {
  if (classification.category === CATEGORIES.PRAISE) return false;
  if (approval?.approved) return false;
  return true;
}

export function buildInboxUpsert(message, classification, summary) {
  const msg = normalizeMessage(message);
  return {
    parent: { database_id: DEMO_NOTION.inboxDatabaseId },
    properties: {
      Subject: titleProp(msg.subject || '(no subject)'),
      From: emailProp(msg.from || null),
      Category: selectProp(classification.category),
      Priority: selectProp(classification.priority),
      Status: selectProp(classification.inboxStatus),
      Summary: richTextProp(summary),
      Received: dateProp(msg.receivedAt),
    },
  };
}

export function buildTaskUpsert(message, classification, summary, approval) {
  if (!shouldCreateTask(classification)) return null;
  const status = taskStatusFor(classification, approval);
  const needed = approvalNeededFor(classification, approval);
  return {
    parent: { database_id: DEMO_NOTION.tasksDatabaseId },
    properties: {
      Task: titleProp(taskTitleFor(message, classification)),
      Status: selectProp(status),
      'Approval needed': checkboxProp(needed),
      'Next action': richTextProp(nextActionFor(classification)),
      'Reply draft': richTextProp(replyDraftFor(message, classification, approval)),
    },
  };
}

export function buildRetryEvent({ event, stage, error, retryCount = 0, resolved = false, occurred }) {
  return {
    parent: { database_id: DEMO_NOTION.retriesDatabaseId },
    properties: {
      Event: titleProp(event),
      Stage: selectProp(stage),
      Error: richTextProp(error),
      'Retry count': numberProp(retryCount),
      Resolved: checkboxProp(resolved),
      Occurred: dateProp(occurred),
    },
  };
}

export function collectRetries(message, classification, sendGate) {
  const msg = normalizeMessage(message);
  const retries = [];

  if (classification.category === CATEGORIES.AMBIGUOUS && isEmptyBody(msg.body)) {
    retries.push(
      buildRetryEvent({
        event: 'Empty body — classify skipped',
        stage: RETRY_STAGES.CLASSIFY,
        error: `Classifier returned empty-body hold for ${msg.from || 'unknown sender'}; routed to human triage.`,
        retryCount: 0,
        resolved: false,
        occurred: msg.receivedAt,
      }),
    );
  }

  if (sendGate.blockedReason) {
    retries.push(
      buildRetryEvent({
        event: sendGate.approved
          ? 'Send skipped (mock never sends)'
          : 'Send gate blocked (approval)',
        stage: RETRY_STAGES.SEND_GATE,
        error: sendGate.blockedReason,
        retryCount: 0,
        resolved: true,
        occurred: msg.receivedAt,
      }),
    );
  }

  return retries;
}

/**
 * Human-approval send gate. Mock contract: `sent` is always false,
 * even when a human has approved the draft.
 */
export function applySendGate({ approval, classification } = {}) {
  const approved = approval?.approved === true;
  const praise = classification?.category === CATEGORIES.PRAISE;
  const ambiguous = classification?.category === CATEGORIES.AMBIGUOUS;

  let blockedReason;
  if (ambiguous) {
    blockedReason = 'Send gate blocked: ambiguous/empty-body item has no task. No email sent (by design).';
  } else if (praise) {
    blockedReason = 'Send gate skipped: praise archived, no send required. Mock never sends.';
  } else if (!approved) {
    blockedReason = 'Send gate blocked: Approval needed still checked. No email sent (by design).';
  } else {
    blockedReason = 'Send skipped: mock mode — sent is always false even after human approval.';
  }

  return {
    approved,
    sent: false,
    blockedReason,
    channel: null,
  };
}

export function processFeedback(input = {}) {
  const message = normalizeMessage(input);
  const classification = classify(message);
  const summary = summarize(message, classification);
  const sendGate = applySendGate({
    approval: message.approval,
    classification,
  });
  const inbox = buildInboxUpsert(message, classification, summary);
  const task = buildTaskUpsert(message, classification, summary, message.approval);
  const retries = collectRetries(message, classification, sendGate);

  return {
    message,
    classification,
    summary,
    notion: {
      inbox,
      task,
      retries,
    },
    sendGate,
    sent: false,
  };
}

export function processMany(inputs) {
  return inputs.map((item) => processFeedback(item));
}
