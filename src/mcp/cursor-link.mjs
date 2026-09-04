/**
 * Cursor MCP install deeplink (not a Marketplace submit).
 * https://cursor.com/docs/context/mcp/install-links
 */

const LOCAL_CONFIG = {
  command: 'node',
  args: ['bin/fo-gate.mjs', 'stdio'],
};

export function encodeConfig(config = LOCAL_CONFIG) {
  return Buffer.from(JSON.stringify(config), 'utf8').toString('base64');
}

export function cursorInstallUrl(config = LOCAL_CONFIG, name = 'FO Gate') {
  const encoded = encodeConfig(config);
  const q = new URLSearchParams({ name, config: encoded });
  return `https://cursor.com/install-mcp?${q.toString()}`;
}

export function cursorDeeplink(config = LOCAL_CONFIG, name = 'FO Gate') {
  const encoded = encodeConfig(config);
  return `cursor://anysphere.cursor-deeplink/mcp/install?name=${encodeURIComponent(name)}&config=${encoded}`;
}

export { LOCAL_CONFIG };
