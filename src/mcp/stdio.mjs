#!/usr/bin/env node
/**
 * Local stdio MCP transport. Cursor / Claude Code: command = node, args = src/mcp/stdio.mjs
 * License is always local (SKU A). No network Notion.
 */

import readline from 'node:readline';
import { handleMcpMessage, parseJsonRpcLine } from './server.mjs';
import { defaultStore } from './store.mjs';

const ctx = {
  transport: 'stdio',
  store: defaultStore,
  env: process.env,
};

const rl = readline.createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

rl.on('line', (line) => {
  let message;
  try {
    message = parseJsonRpcLine(line);
  } catch (err) {
    const payload = {
      jsonrpc: '2.0',
      id: null,
      error: { code: -32700, message: `Parse error: ${err.message}` },
    };
    process.stdout.write(`${JSON.stringify(payload)}\n`);
    return;
  }
  if (!message) return;

  const response = handleMcpMessage(message, ctx);
  if (response) {
    process.stdout.write(`${JSON.stringify(response)}\n`);
  }
});

rl.on('close', () => {
  process.exit(0);
});
