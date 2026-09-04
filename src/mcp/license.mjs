/**
 * Hosted seats require a license key. Local stdio / FO_GATE_MODE=local do not.
 * Unlicensed hosted calls must not write Inbox / Tasks / Retries.
 */

export function modeFromEnv(env = process.env) {
  const raw = String(env.FO_GATE_MODE || '').toLowerCase();
  if (raw === 'hosted') return 'hosted';
  if (raw === 'local' || raw === 'proof' || raw === 'stdio') return 'local';
  return env.FO_GATE_LICENSE_KEYS ? 'hosted' : 'local';
}

export function configuredKeys(env = process.env) {
  return String(env.FO_GATE_LICENSE_KEYS || env.FO_GATE_LICENSE || '')
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

export function extractBearer(authorization) {
  const raw = String(authorization || '').trim();
  if (!raw) return '';
  const m = raw.match(/^Bearer\s+(.+)$/i);
  return (m ? m[1] : raw).trim();
}

export function checkLicense({ authorization, transport, env = process.env } = {}) {
  const mode = modeFromEnv(env);
  if (mode === 'local' || transport === 'stdio') {
    return {
      ok: true,
      mode: 'local',
      sku: 'A',
      reason: 'Local / proof path — no license required.',
    };
  }

  const presented = extractBearer(authorization);
  const keys = configuredKeys(env);
  if (!presented || !keys.includes(presented)) {
    return {
      ok: false,
      mode: 'hosted',
      sku: null,
      status: 401,
      reason: 'Unlicensed. Hosted FO Gate requires a B ($19/mo) or C ($49/mo) seat key. No Notion write performed.',
    };
  }

  const sku = env.FO_GATE_LICENSE_SKU === 'C' ? 'C' : 'B';
  return {
    ok: true,
    mode: 'hosted',
    sku,
    reason: `Licensed ${sku} seat.`,
  };
}
