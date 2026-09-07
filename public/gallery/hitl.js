/**
 * Gallery HITL demo state machine.
 *
 * Local / fixture only. Never writes Notion, Twilio, Slack, Gmail, or SMTP.
 * Approve never sets sent. sent becomes true only after explicit humanSend().
 */

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export const GALLERY_STEPS = Object.freeze([
  {
    id: 'feedback',
    number: '01',
    label: 'Feedback',
    title: 'A customer note lands',
    caption: 'The note arrives from Slack or email. Nobody replies yet — ingest only.',
  },
  {
    id: 'classify',
    number: '02',
    label: 'Classify',
    title: 'Tag it before anyone types',
    caption: 'Bug, billing, feature, or praise — classified so the pile becomes a queue.',
  },
  {
    id: 'notion',
    number: '03',
    label: 'Notion Inbox',
    title: 'Tracked row, not a lost ping',
    caption: 'Inbox upsert with owner fields. Empty bodies stay Classified — no fake Task.',
  },
  {
    id: 'approve',
    number: '04',
    label: 'Approve gate',
    title: 'A human reads the draft',
    caption: 'Approve prepares the reply. It never sends. sent stays false.',
  },
  {
    id: 'send',
    number: '05',
    label: 'Send (human)',
    title: 'Only a person hits Send',
    caption: 'Explicit human action. This demo records it locally — no live channel.',
  },
]);

export const NOTHING_AUTO_SENDS = 'Nothing auto-sends';

export const BEFORE_CAPTION =
  'Before: Slack + email pile. Unread, unowned, missed replies.';

export const AFTER_CAPTION =
  'After: HITL board. Classified work waits for a human, not a bot.';

export function seedGalleryItem(sample) {
  const source = clone(sample);
  const approved = source.sendGate?.approved === true && source.task != null;
  return {
    id: source.id,
    label: source.label,
    walkthrough: source.walkthrough,
    input: source.input,
    inbox: source.inbox,
    task: source.task,
    classification: source.classification,
    retries: source.retries ?? [],
    sendGate: {
      approved,
      sent: false,
      blockedReason:
        source.sendGate?.blockedReason ||
        'Send gate blocked: Approval needed still checked. No email sent (by design).',
      channel: null,
    },
    approved,
    sent: false,
    sendBlocked: false,
    demoWrite: null,
  };
}

export function seedGalleryBoard(samples) {
  return (samples ?? []).map(seedGalleryItem);
}

export function boardColumn(item) {
  if (item?.sent) return 'sent';
  if (item?.approved) return 'approved';
  if (item?.task && item.task['Approval needed'] === false) return 'approved';
  return 'waiting';
}

/**
 * Human approve. Draft is ready. sent stays false. No network.
 */
export function applyApprove(item) {
  const next = clone(item);
  next.sendBlocked = false;
  next.demoWrite = null;

  if (!next.task) {
    next.approved = false;
    next.sent = false;
    next.sendGate = {
      approved: false,
      sent: false,
      blockedReason: 'No Task to approve. Empty-body / Ambiguous items stay held.',
      channel: null,
    };
    return next;
  }

  next.approved = true;
  next.sent = false;
  next.task.Status = 'Approved';
  next.task['Approval needed'] = false;
  if (typeof next.task['Reply draft'] === 'string' && !/human-approved/i.test(next.task['Reply draft'])) {
    next.task['Reply draft'] = next.task['Reply draft'].replace(
      /— Support \(mock draft(?:, awaiting approval)?\)/,
      '— Support (mock draft, human-approved)',
    );
  }
  next.sendGate = {
    approved: true,
    sent: false,
    blockedReason: 'Approved. Nothing auto-sends. Waiting for a human Send.',
    channel: null,
  };
  return next;
}

/**
 * Explicit human send. Demo-local only. No Notion / Twilio / Slack write.
 */
export function applyHumanSend(item) {
  const next = clone(item);
  next.demoWrite = null;

  if (!next.task) {
    next.sent = false;
    next.sendBlocked = true;
    next.sendGate = {
      approved: false,
      sent: false,
      blockedReason: 'Send blocked: no Task. Nothing left the demo.',
      channel: null,
    };
    return next;
  }

  if (!next.approved) {
    next.sent = false;
    next.sendBlocked = true;
    next.sendGate = {
      approved: false,
      sent: false,
      blockedReason: 'Send blocked: approve first. Nothing auto-sends.',
      channel: null,
    };
    return next;
  }

  next.sent = true;
  next.sendBlocked = false;
  next.demoWrite = 'demo-local';
  next.sendGate = {
    approved: true,
    sent: true,
    blockedReason: 'Human send recorded in demo. No Notion / Twilio / Slack write.',
    channel: 'demo-local',
  };
  return next;
}

export function isLiveChannel(item) {
  const channel = item?.sendGate?.channel ?? item?.demoWrite ?? null;
  return channel != null && channel !== 'demo-local';
}

export function canApprove(item) {
  return Boolean(item?.task) && item.approved !== true && item.task['Approval needed'] === true;
}

export function canHumanSend(item) {
  return Boolean(item?.task) && item.approved === true && item.sent !== true;
}
