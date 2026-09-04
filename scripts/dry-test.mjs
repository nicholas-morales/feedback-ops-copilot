#!/usr/bin/env node
/**
 * Dry test for the redesigned buyer page.
 * Usage: BASE_URL=http://127.0.0.1:8765 node scripts/dry-test.mjs
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8765';

function hexOf(color) {
  const m = String(color).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return color;
  return [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('');
}

function luminance(hex) {
  const n = hex.replace('#', '');
  const rgb = [0, 2, 4].map((i) => {
    const v = parseInt(n.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

function contrast(a, b) {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

async function colorsOf(page, selector) {
  return page.$eval(selector, (el) => {
    const s = getComputedStyle(el);
    return { color: s.color, background: s.backgroundColor };
  });
}

async function run() {
  const browser = await chromium.launch();
  const results = [];
  const log = (name, ok, extra = '') => {
    results.push({ name, ok, extra });
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
  };

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.waitForSelector('button.sample');

    const sent = (await page.textContent('#sent-flag')).trim();
    log('Initial sent flag is false', sent.includes('false'), sent);

    await page.click('button.sample[data-id="empty-body"]');
    await page.waitForTimeout(200);
    const emptyTask = await page.textContent('#task-panel');
    log('Empty body creates no Task', /No Task created/i.test(emptyTask));
    log('Empty body sent stays false', (await page.textContent('#sent-flag')).includes('false'));

    await page.click('button.sample[data-id="approval-approved"]');
    await page.waitForTimeout(200);
    const approved = await page.textContent('#task-panel');
    log('Approved draft shows Approved', /Approved/.test(approved));
    log('Approved draft sent stays false', (await page.textContent('#sent-flag')).includes('false'));

    await page.click('#inbox-table tr[data-id="bug"]');
    await page.waitForTimeout(200);
    const tabOn = await page.getAttribute('button.sample[data-id="bug"]', 'aria-selected');
    log('Table row click activates tab', tabOn === 'true');

    await page.focus('button.sample[data-id="bug"]');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    const focused = await page.evaluate(() => document.activeElement?.dataset?.id);
    log('ArrowRight moves tab focus', Boolean(focused && focused !== 'bug'), focused);

    await page.keyboard.press('Home');
    await page.waitForTimeout(150);
    const homeId = await page.evaluate(() => document.activeElement?.dataset?.id);
    log('Home key jumps to first tab', homeId === 'billing', homeId);

    await page.keyboard.press('End');
    await page.waitForTimeout(150);
    const endId = await page.evaluate(() => document.activeElement?.dataset?.id);
    log('End key jumps to last tab', endId === 'praise', endId);

    const theme = await page.getAttribute('html', 'data-theme');
    log('Default first-paint theme is dark', theme === 'dark', theme);
    const bodyType = await page.$eval('body', (el) => {
      const s = getComputedStyle(el);
      return { size: parseFloat(s.fontSize), line: parseFloat(s.lineHeight), family: s.fontFamily };
    });
    log('Body size is at least 17px', bodyType.size >= 17, `${bodyType.size}px`);
    log('Body line-height is at least 1.6×', bodyType.line / bodyType.size >= 1.6, `${(bodyType.line / bodyType.size).toFixed(2)}`);
    log('Royal / Plex stack is in use', /Newsreader|Iowan|Palatino|IBM Plex/i.test(bodyType.family), bodyType.family);

    await page.click('#theme-toggle');
    await page.waitForTimeout(100);
    const afterToggle = await page.getAttribute('html', 'data-theme');
    log('Theme toggle flips theme', afterToggle && afterToggle !== theme, `${theme} → ${afterToggle}`);

    const stored = await page.evaluate(() => localStorage.getItem('fo-theme'));
    log('Theme choice persisted', stored === afterToggle, stored);

    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('button.sample');
    const afterReload = await page.getAttribute('html', 'data-theme');
    log('Theme persists across reload', afterReload === afterToggle, afterReload);

    const bootTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    log('No missing theme after reload (anti-flash attribute present)', Boolean(bootTheme));

    for (const mode of ['light', 'dark']) {
      await page.evaluate((m) => {
        localStorage.setItem('fo-theme', m);
        document.documentElement.setAttribute('data-theme', m);
      }, mode);
      await page.waitForTimeout(50);
      const body = await colorsOf(page, 'body');
      const h1 = await colorsOf(page, 'h1');
      const ratio = contrast(hexOf(h1.color), hexOf(body.background));
      log(`${mode} headline/body contrast ≥ 4.5`, ratio >= 4.5, ratio.toFixed(2));
    }

    const links = await page.$$eval('a[href]', (as) =>
      as.map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim() })),
    );
    log('Notion demo link present', links.some((l) => /notion\.com/.test(l.href)));
    log('GitHub repo link present', links.some((l) => /github\.com/.test(l.href)));
    log('In-page demo + offer anchors present', links.some((l) => l.href.includes('#demo')) && links.some((l) => l.href.includes('#offer')));

    await page.setViewportSize({ width: 768, height: 900 });
    await page.waitForTimeout(100);
    const tabletHero = await page.$eval('.hero-grid', (el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    log('Tablet stacks hero to one column', tabletHero === 1, String(tabletHero));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(100);
    const menuVisible = await page.$eval('.menu-toggle', (el) => getComputedStyle(el).display !== 'none');
    log('Mobile menu toggle visible', menuVisible);
    await page.click('.menu-toggle');
    const expanded = await page.getAttribute('.menu-toggle', 'aria-expanded');
    log('Mobile menu opens', expanded === 'true');
    await page.keyboard.press('Escape');
    const closed = await page.getAttribute('.menu-toggle', 'aria-expanded');
    log('Escape closes mobile menu', closed === 'false');

    const reduced = await page.evaluate(() => {
      const sheet = [...document.styleSheets].some((s) => {
        try {
          return [...s.cssRules].some((r) => String(r.cssText).includes('prefers-reduced-motion'));
        } catch {
          return false;
        }
      });
      return sheet;
    });
    log('prefers-reduced-motion rules present', reduced);

    const skip = await page.$eval('.skip-link', (el) => el.getAttribute('href'));
    log('Skip link targets #main', skip === '#main');

    const failed = results.filter((r) => !r.ok);
    console.log(`\n${results.length - failed.length}/${results.length} dry-test checks passed`);
    if (failed.length) {
      console.error('Failed:', failed.map((f) => f.name).join('; '));
      process.exitCode = 1;
    }
  } finally {
    await browser.close();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
