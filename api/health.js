import { getSendGate } from '../src/mcp/send-gate.mjs';

export default function handler(req, res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(
    JSON.stringify({
      status: 'ok',
      service: 'fo-gate',
      sent: false,
      send_is_on: getSendGate(process.env).send_is_on,
    }),
  );
}
