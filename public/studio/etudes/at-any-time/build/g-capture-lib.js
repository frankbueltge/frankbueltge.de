// One addition to capture-lib.js's helpers: a full-page screenshot at a
// fixed viewport WIDTH but unlimited height (Playwright's fullPage:true),
// used for the gap-traversal stills on the adopted ground, where the whole
// point is to show the grey margins flanking the paper for the entire
// scrolled distance, not just one viewport's worth.
const { writeAndGoto } = require('./capture-lib.js');

async function fullPageShot(browser, html, { viewport, name }) {
  const context = await browser.newContext({ viewport });
  const page = await writeAndGoto(context, html, name);
  const buf = await page.screenshot({ fullPage: true });
  await context.close();
  return buf;
}

module.exports = { fullPageShot };
