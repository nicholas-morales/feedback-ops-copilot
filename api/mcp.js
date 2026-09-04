import { handleMcpMessage } from '../src/mcp/server.mjs';
import { checkLicense } from '../src/mcp/license.mjs';
import { defaultStore } from '../src/mcp/store.mjs';

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'GET') {
    res.statusCode = 200;
    res.end(JSON.stringify({ transport: 'streamable-http', sent: false }));
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const license = checkLicense({
    authorization: req.headers.authorization,
    transport: 'http',
    env: process.env,
  });
  if (!license.ok) {
    res.statusCode = 401;
    res.end(JSON.stringify({ error: license.reason, sent: false, notionWrite: false }));
    return;
  }

  let message;
  try {
    const raw = await readBody(req);
    message = JSON.parse(raw || '{}');
  } catch {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Invalid JSON' }));
    return;
  }

  const response = handleMcpMessage(message, {
    store: defaultStore,
    env: process.env,
    transport: 'http',
    authorization: req.headers.authorization,
  });
  res.statusCode = 200;
  res.end(JSON.stringify(response || { ok: true }));
}
