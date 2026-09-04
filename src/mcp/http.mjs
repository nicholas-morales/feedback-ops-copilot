#!/usr/bin/env node
/**
 * Local HTTP host: static landing + /health + POST /mcp.
 * FO_GATE_MODE=local (default) skips license. Hosted mode requires Bearer key.
 * Do not deploy from this PR. Hobby-compatible handlers also live in /api.
 */

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleMcpMessage } from './server.mjs';
import { checkLicense } from './license.mjs';
import { defaultStore } from './store.mjs';
import { getSendGate } from './send-gate.mjs';

const ROOT = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const PUBLIC = join(ROOT, 'public');
const PORT = Number(process.env.PORT || process.env.FO_GATE_PORT || 8787);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
};

function json(res, status, body, extraHeaders = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders,
  });
  res.end(JSON.stringify(body));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString('utf8');
}

function safePublicPath(urlPath) {
  const cleaned = decodeURIComponent(urlPath.split('?')[0]);
  const relative = cleaned === '/' ? '/index.html' : cleaned;
  const resolved = normalize(join(PUBLIC, relative));
  if (!resolved.startsWith(PUBLIC)) return null;
  return resolved;
}

export async function handleHttpRequest(req, res, ctx = {}) {
  const host = req.headers.host || '127.0.0.1';
  const url = new URL(req.url || '/', `http://${host}`);
  const store = ctx.store || defaultStore;
  const env = ctx.env || process.env;

  if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/api/health')) {
    json(res, 200, {
      status: 'ok',
      service: 'fo-gate',
      sent: false,
      send_is_on: getSendGate(env).send_is_on,
      tools: [
        'classify_feedback',
        'upsert_inbox_item',
        'upsert_task',
        'list_awaiting_approval',
        'log_exception',
        'get_send_gate',
      ],
    });
    return;
  }

  if (url.pathname === '/mcp' || url.pathname === '/api/mcp') {
    if (req.method === 'GET') {
      json(res, 200, {
        transport: 'streamable-http',
        initialize: 'POST JSON-RPC method=initialize',
        sent: false,
      });
      return;
    }

    if (req.method !== 'POST') {
      json(res, 405, { error: 'Method not allowed' });
      return;
    }

    const license = checkLicense({
      authorization: req.headers.authorization,
      transport: 'http',
      env,
    });
    if (!license.ok) {
      json(res, 401, { error: license.reason, sent: false, notionWrite: false });
      return;
    }

    let message;
    try {
      const raw = await readBody(req);
      message = JSON.parse(raw || '{}');
    } catch {
      json(res, 400, { error: 'Invalid JSON' });
      return;
    }

    const response = handleMcpMessage(message, {
      store,
      env,
      transport: 'http',
      authorization: req.headers.authorization,
    });
    json(res, 200, response || { ok: true });
    return;
  }

  if (req.method === 'GET') {
    const filePath = safePublicPath(url.pathname);
    if (filePath && existsSync(filePath)) {
      const body = await readFile(filePath);
      res.writeHead(200, { 'Content-Type': MIME[extname(filePath)] || 'application/octet-stream' });
      res.end(body);
      return;
    }
    if (url.pathname === '/pricing' && existsSync(join(PUBLIC, 'pricing.html'))) {
      const body = await readFile(join(PUBLIC, 'pricing.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(body);
      return;
    }
    json(res, 404, { error: 'Not found' });
    return;
  }

  json(res, 405, { error: 'Method not allowed' });
}

export function startServer({ port = PORT, store, env } = {}) {
  const server = createServer((req, res) => {
    handleHttpRequest(req, res, { store, env }).catch((err) => {
      if (!res.headersSent) json(res, 500, { error: err.message });
    });
  });
  return new Promise((resolvePromise) => {
    server.listen(port, '127.0.0.1', () => {
      resolvePromise(server);
    });
  });
}

const invokedDirectly =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]) &&
  process.env.FO_GATE_HTTP_LISTEN !== '0';

if (invokedDirectly) {
  const server = await startServer();
  const addr = server.address();
  console.error(`FO Gate local host http://127.0.0.1:${addr.port}`);
  console.error('Health: GET /health   MCP: POST /mcp   Landing: /   Pricing: /pricing');
  console.error('sent stays false. No Gmail. No SMTP. Do not publish.');
}
