// Shared Playwright capture helpers used by all étude scripts. Every
// navigation is file:// (matching pdf-render-lib.js's own method) — no
// data: URLs, no in-memory HTML strings handed to page.goto.
const fs = require('fs');
const path = require('path');

const TMP_DIR = '/tmp/claude-0/-home-user-studio/98d41e62-3b71-5f78-9da1-5a51086e8713/scratchpad/html';
fs.mkdirSync(TMP_DIR, { recursive: true });

async function writeAndGoto(context, html, name) {
  const file = path.join(TMP_DIR, name + '.html');
  fs.writeFileSync(file, html);
  const page = await context.newPage();
  await page.goto('file://' + file, { timeout: 60000 });
  // Wait for every <img> to finish loading (file:// images load async).
  await page.waitForFunction(() => Array.from(document.images).every(img => img.complete && img.naturalWidth > 0), { timeout: 60000 });
  return page;
}

// Viewport-only screenshot (NOT full page) — exactly what a visitor's first
// screen would show, whether or not the underlying #stage is scaled.
async function viewportShot(browser, html, { viewport, deviceScaleFactor, name }) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: deviceScaleFactor || 1 });
  const page = await writeAndGoto(context, html, name);
  const buf = await page.screenshot();
  await context.close();
  return buf;
}

// Full-element screenshot, regardless of viewport size — used for native
// mid-column stills, which are documents, not "what a visitor's screen
// shows."
async function elementShot(browser, html, { viewport, selector, name }) {
  const context = await browser.newContext({ viewport: viewport || { width: 900, height: 900 } });
  const page = await writeAndGoto(context, html, name);
  const el = await page.locator(selector);
  const buf = await el.screenshot();
  await context.close();
  return buf;
}

async function scrollAndShot(browser, html, { viewport, name, scrollY }) {
  const context = await browser.newContext({ viewport });
  const page = await writeAndGoto(context, html, name);
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(50);
  const buf = await page.screenshot();
  const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  await context.close();
  return { buf, scrollHeight };
}

module.exports = { writeAndGoto, viewportShot, elementShot, scrollAndShot, TMP_DIR };
