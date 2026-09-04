#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== FO Gate smoke =="
node --test scripts/test.mjs

echo
echo "Local demo:"
echo "  npm start"
echo "  open http://127.0.0.1:8787"
echo "  open http://127.0.0.1:8787/pricing"
echo
echo "Stdio MCP:"
echo "  node bin/fo-gate.mjs stdio"
echo
echo "One-shot classify (no network):"
node bin/fo-gate.mjs classify samples/billing.example.json | head -n 20
echo
echo "sent stays false. No Gmail. No SMTP. Do not publish."
