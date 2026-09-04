/**
 * In-memory Inbox / Tasks / Retries. Default path never talks to Notion.
 * Live writes stay off unless FO_GATE_NOTION_WRITES=1 AND a token is present.
 */

import { randomUUID } from 'node:crypto';

export function createStore() {
  return {
    inbox: new Map(),
    tasks: new Map(),
    retries: new Map(),
  };
}

export const defaultStore = createStore();

export function notionWritesEnabled(env = process.env) {
  return env.FO_GATE_NOTION_WRITES === '1' && Boolean(env.FO_GATE_NOTION_TOKEN);
}

export function putInbox(store, record) {
  const id = record.id || randomUUID();
  const row = { ...record, id };
  store.inbox.set(id, row);
  return row;
}

export function putTask(store, record) {
  const id = record.id || randomUUID();
  const row = { ...record, id };
  store.tasks.set(id, row);
  return row;
}

export function putRetry(store, record) {
  const id = record.id || randomUUID();
  const row = { ...record, id, resolved: Boolean(record.resolved) };
  store.retries.set(id, row);
  return row;
}

export function listAwaitingApproval(store) {
  return [...store.tasks.values()].filter((task) => {
    return task.approvalNeeded === true || task.status === 'Waiting approval';
  });
}

export function resetStore(store = defaultStore) {
  store.inbox.clear();
  store.tasks.clear();
  store.retries.clear();
  return store;
}
