#!/usr/bin/env node
/**
 * npx / local bin:
 *   node bin/fo-gate.mjs stdio
 *   node bin/fo-gate.mjs serve
 *   node bin/fo-gate.mjs classify samples/billing.example.json
 */

const cmd = process.argv[2] || 'stdio';

if (cmd === 'serve' || cmd === 'http') {
  await import('../src/mcp/http.mjs');
} else if (cmd === 'classify') {
  const { readFile } = await import('node:fs/promises');
  const { resolve } = await import('node:path');
  const { processFeedback } = await import('../src/feedback-ops.mjs');
  const target = process.argv[3] || 'samples/billing.example.json';
  const raw = await readFile(resolve(process.cwd(), target), 'utf8');
  const result = processFeedback(JSON.parse(raw));
  console.log(JSON.stringify({ ...result, sent: false }, null, 2));
} else if (cmd === 'stdio' || cmd === 'mcp') {
  await import('../src/mcp/stdio.mjs');
} else {
  console.error(`Unknown command: ${cmd}`);
  console.error('Usage: fo-gate [stdio|serve|classify [sample.json]]');
  process.exit(1);
}
