/**
 * FO Gate send lock.
 *
 * `sent` stays false until a buyer writes the exact phrase "send is on"
 * (VALIDATE.md). This MVP still ships no send_reply tool — even when the
 * phrase is present, nothing transmits.
 */

const SEND_ON_RE = /\bsend is on\b/i;

export const SEND_GATE_BLOCK =
  'Send gate blocked: sent stays false. There is no send_reply tool. Nothing transmits until a buyer writes "send is on".';

export function readBuyerNote(env = process.env) {
  return String(env.FO_GATE_BUYER_NOTE || env.FO_GATE_SEND_PHRASE || '');
}

export function isSendOn(env = process.env) {
  return SEND_ON_RE.test(readBuyerNote(env));
}

export function getSendGate(env = process.env) {
  const sendIsOn = isSendOn(env);
  return {
    sent: false,
    send_is_on: sendIsOn,
    has_send_reply_tool: false,
    blockedReason: sendIsOn
      ? 'Buyer wrote "send is on", but this MVP has no send_reply tool. Nothing transmitted.'
      : SEND_GATE_BLOCK,
    channel: null,
  };
}

export function isSendLikeTool(name) {
  const n = String(name || '').toLowerCase();
  return (
    n === 'send_reply' ||
    n === 'send_email' ||
    n === 'send_message' ||
    n.startsWith('send_') ||
    n.includes('smtp') ||
    n.includes('gmail')
  );
}
