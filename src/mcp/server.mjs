/**
 * JSON-RPC 2.0 MCP server (stdio + HTTP). Zero npm dependencies.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TOOL_DEFS, TOOL_NAMES, runTool } from './tools.mjs';
import { getSendGate, isSendLikeTool } from './send-gate.mjs';
import { checkLicense } from './license.mjs';
import { defaultStore } from './store.mjs';

const PROTOCOL_VERSION = '2024-11-05';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

export function loadPricing() {
  const raw = readFileSync(resolve(ROOT, 'config/pricing.json'), 'utf8');
  return JSON.parse(raw);
}

export function serverInfo() {
  return {
    name: 'fo-gate',
    title: 'FO Gate — Feedback Ops HITL',
    version: '0.1.0',
  };
}

export function mcpInitializeResult() {
  return {
    protocolVersion: PROTOCOL_VERSION,
    capabilities: {
      tools: { listChanged: false },
    },
    serverInfo: serverInfo(),
    instructions:
      'Classify client feedback into Notion-shaped Inbox + Tasks, draft the reply, and refuse to send. sent stays false. There is no send_reply tool.',
  };
}

function rpcResult(id, result) {
  return { jsonrpc: '2.0', id, result };
}

function rpcError(id, code, message, data) {
  return { jsonrpc: '2.0', id, error: { code, message, data } };
}

export function handleMcpMessage(message, ctx = {}) {
  if (!message || typeof message !== 'object') {
    return rpcError(null, -32600, 'Invalid Request');
  }

  const { id, method, params } = message;
  const isNotification = id === undefined;

  if (method === 'initialize') {
    return rpcResult(id ?? 0, mcpInitializeResult());
  }

  if (method === 'notifications/initialized' || method === 'initialized') {
    return isNotification ? null : rpcResult(id, {});
  }

  if (method === 'ping') {
    return isNotification ? null : rpcResult(id, {});
  }

  if (method === 'tools/list') {
    return rpcResult(id, { tools: TOOL_DEFS });
  }

  if (method === 'tools/call') {
    const name = params?.name;
    const args = params?.arguments || params?.args || {};
    if (!name) {
      return rpcError(id, -32602, 'Missing tool name');
    }

    const license = checkLicense({
      authorization: ctx.authorization,
      transport: ctx.transport,
      env: ctx.env,
    });
    if (!license.ok) {
      return rpcError(id, -32001, license.reason, { status: 401, sent: false });
    }

    if (isSendLikeTool(name) || !TOOL_NAMES.includes(name)) {
      if (isSendLikeTool(name)) {
        const result = runTool(name, args, {
          store: ctx.store || defaultStore,
          env: ctx.env || process.env,
        });
        return rpcResult(id, result);
      }
      return rpcError(id, -32601, `Unknown tool: ${name}`, {
        sent: false,
        sendGate: getSendGate(ctx.env || process.env),
      });
    }

    const result = runTool(name, args, {
      store: ctx.store || defaultStore,
      env: ctx.env || process.env,
    });
    return rpcResult(id, result);
  }

  if (isNotification) return null;
  return rpcError(id, -32601, `Method not found: ${method}`);
}

export function parseJsonRpcLine(line) {
  const trimmed = String(line || '').trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
}
