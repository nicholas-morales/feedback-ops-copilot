/**
 * Gallery HITL demo — fixtures only.
 * Never writes Notion, Twilio, Slack, Gmail, or SMTP.
 * Approve / Edit / Reject never set sent.
 */

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export const FLOW_BADGE = 'Feedback → Classify → Notion Inbox → Approve gate → Send (human)';
export const NOTHING_AUTO_SENDS = 'Nothing auto-sends';

export const PORTFOLIO_LINKS = Object.freeze({
  work: 'https://verdelabs.cloud/work',
  demo: 'https://feedback-ops-copilot.vercel.app',
});

export const QUEUE_COLUMNS = Object.freeze(['Bug', 'Feature', 'Praise', 'Churn risk']);

export const SHIP_SCENARIOS = Object.freeze([
  {
    id: 'chaos',
    number: '01',
    title: 'Inbox chaos → classified Notion queue',
    caption: 'Raw feedback in. Tagged by urgency/theme into Notion Inbox — still zero outbound.',
  },
  {
    id: 'gate',
    number: '02',
    title: 'Draft ready, human gate locked',
    caption: 'AI writes the reply. You approve. Nothing auto-sends — HITL by design.',
  },
  {
    id: 'ritual',
    number: '03',
    title: 'Same feedback, wrong autopilot vs your ritual',
    caption:
      'Commodity n8n gigs: autopilot send. Feedback Ops: draft → human → send. Built for operators who won’t risk brand.',
  },
]);

/** Kept so the flow badge stays the product ritual, not a fifth screenshot. */
export const GALLERY_STEPS = Object.freeze([
  { id: 'feedback', number: '01', label: 'Feedback', caption: FLOW_BADGE },
  { id: 'classify', number: '02', label: 'Classify', caption: FLOW_BADGE },
  { id: 'notion', number: '03', label: 'Notion Inbox', caption: FLOW_BADGE },
  { id: 'approve', number: '04', label: 'Approve gate', caption: FLOW_BADGE },
  { id: 'send', number: '05', label: 'Send (human)', caption: FLOW_BADGE },
]);

export const QUEUE_FIXTURES = Object.freeze([
  {
    id: 'bug',
    column: 'Bug',
    urgency: 'High',
    from: 'jordan.lee@northstar-widgets.example',
    channel: 'email',
    subject: 'Export CSV truncates long product names',
    body: 'Catalog → Export CSV → Sheets. Names longer than ~40 characters get cut off.',
    task: 'Fix CSV product-name truncation',
  },
  {
    id: 'feature',
    column: 'Feature',
    urgency: 'Medium',
    from: 'priya.nair@lumen-co.example',
    channel: 'slack',
    subject: 'Can we filter feedback by tag in the portal?',
    body: 'Keeps coming up on customer calls. Not urgent — still sitting in saved messages.',
    task: 'Roadmap: portal feedback tag filters',
  },
  {
    id: 'praise',
    column: 'Praise',
    urgency: 'Low',
    from: 'sam.okoye@harbor-apps.example',
    channel: 'email',
    subject: 'Support turnaround was excellent',
    body: 'You fixed our webhook retries the same day. No action needed.',
    task: 'Archive praise — Harbor Apps',
  },
  {
    id: 'churn',
    column: 'Churn risk',
    urgency: 'High',
    from: 'ap@brightline-studio.example',
    channel: 'slack',
    subject: 'We’re evaluating other tools if invoice #4821 stays broken',
    body: 'The setup fee was billed twice. If this sits another week we’re canceling.',
    task: 'Retain Brightline — credit memo + owner reply',
  },
]);

export const GATE_DRAFT = Object.freeze({
  id: 'churn',
  from: 'ap@brightline-studio.example',
  subject: 'We’re evaluating other tools if invoice #4821 stays broken',
  task: 'Retain Brightline — credit memo + owner reply',
  draft: [
    'Hi Brightline AP team,',
    '',
    'Thanks for flagging invoice #4821. We confirmed the setup fee was billed twice. A $250 credit memo is drafted and waiting on a human before anything leaves this inbox.',
    '',
    '— Support (mock draft, awaiting approval)',
  ].join('\n'),
});

export const SAME_FEEDBACK = Object.freeze({
  from: 'ap@brightline-studio.example',
  subject: 'We’re evaluating other tools if invoice #4821 stays broken',
  body: 'The setup fee was billed twice. If this sits another week we’re canceling.',
  autopilotReply: 'Thanks for reaching out! We’re sorry for the inconvenience. Best, Support Bot',
  ritualReply:
    'Hi Brightline AP team,\n\nThanks for flagging invoice #4821. Credit memo drafted. Nothing has been sent.\n\n— Support (human-approved, unsent)',
});

function stamp() {
  return '2026-09-07T16:02:00.000Z';
}

export function createGateTicket() {
  return {
    id: GATE_DRAFT.id,
    from: GATE_DRAFT.from,
    subject: GATE_DRAFT.subject,
    task: GATE_DRAFT.task,
    draft: GATE_DRAFT.draft,
    decision: 'awaiting',
    approved: false,
    rejected: false,
    sent: false,
    sendGate: {
      approved: false,
      sent: false,
      blockedReason: 'Send gate locked. Approve / Edit / Reject only. Nothing auto-sends.',
      channel: null,
    },
    audit: [
      {
        at: '2026-09-07T16:00:00.000Z',
        line: 'Draft written by classifier. sent: false. Gate locked.',
      },
    ],
  };
}

export function canApprove(item) {
  return Boolean(item?.draft) && item.approved !== true && item.rejected !== true && item.sent !== true;
}

export function canEdit(item) {
  return Boolean(item?.draft) && item.sent !== true;
}

export function canReject(item) {
  return Boolean(item?.draft) && item.rejected !== true && item.sent !== true;
}

export function applyApprove(item) {
  const next = clone(item);
  if (!canApprove(item)) {
    next.sent = false;
    return next;
  }
  next.approved = true;
  next.rejected = false;
  next.decision = 'approved';
  next.sent = false;
  next.sendGate = {
    approved: true,
    sent: false,
    blockedReason: 'Approved. Nothing auto-sends — HITL by design.',
    channel: null,
  };
  next.audit = [
    ...(next.audit ?? []),
    { at: stamp(), line: 'ops@example.test approved draft. sent: false. No outbound.' },
  ];
  return next;
}

export function applyEdit(item, draftText) {
  const next = clone(item);
  if (!canEdit(item)) {
    next.sent = false;
    return next;
  }
  next.draft = String(draftText ?? next.draft);
  next.approved = false;
  next.rejected = false;
  next.decision = 'edited';
  next.sent = false;
  next.sendGate = {
    approved: false,
    sent: false,
    blockedReason: 'Draft edited. Gate still locked. Nothing auto-sends.',
    channel: null,
  };
  next.audit = [
    ...(next.audit ?? []),
    { at: stamp(), line: 'ops@example.test edited draft. sent: false. Gate locked.' },
  ];
  return next;
}

export function applyReject(item) {
  const next = clone(item);
  if (!canReject(item)) {
    next.sent = false;
    return next;
  }
  next.approved = false;
  next.rejected = true;
  next.decision = 'rejected';
  next.sent = false;
  next.sendGate = {
    approved: false,
    sent: false,
    blockedReason: 'Rejected. Draft held. Nothing auto-sends.',
    channel: null,
  };
  next.audit = [
    ...(next.audit ?? []),
    { at: stamp(), line: 'ops@example.test rejected draft. sent: false. No outbound.' },
  ];
  return next;
}

/** Demo-local send helper. Gallery UI does not expose this on the locked gate. */
export function applyHumanSend(item) {
  const next = clone(item);
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

export function captionsText() {
  const lines = [
    ...SHIP_SCENARIOS.map((s) => `${s.number} ${s.title} — ${s.caption}`),
    `${NOTHING_AUTO_SENDS}. ${FLOW_BADGE}`,
    PORTFOLIO_LINKS.work,
    PORTFOLIO_LINKS.demo,
  ];
  return lines.join('\n');
}

/** @deprecated scenario-1 board is category columns, not approval columns */
export function boardColumn(item) {
  return item?.column || 'Bug';
}

export function seedGalleryItem(sample) {
  const source = clone(sample);
  return {
    id: source.id,
    label: source.label,
    inbox: source.inbox,
    task: source.task,
    classification: source.classification,
    approved: source.sendGate?.approved === true && source.task != null,
    sent: false,
    sendGate: { approved: false, sent: false, blockedReason: 'Gate locked.', channel: null },
    draft: source.task?.['Reply draft'] || '',
    rejected: false,
  };
}

export function seedGalleryBoard(samples) {
  return (samples ?? []).map(seedGalleryItem);
}

export function canHumanSend(item) {
  return item?.approved === true && item.sent !== true;
}
