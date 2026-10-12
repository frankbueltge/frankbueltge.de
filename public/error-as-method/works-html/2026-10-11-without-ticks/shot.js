// node shot.js <maker> [mask]: renders makers/<maker>/index.html at 1100x800 -> shots/<maker>.png, and a second
// frame 3 s later to check the brief's "still". With "mask", all HTML and SVG text is made transparent first
// (thread 5: a coder without captions) -> shots/masked/<maker>.png. Text drawn on a canvas is not reached.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const m = process.argv[2], mask = process.argv[3] === 'mask'; const f = path.join(__dirname, 'makers', m, 'index.html');
 const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const p = await b.newPage({ viewport: { width: 1100, height: 800 } }); const errs = [], reqs = [];
 p.on('pageerror', e => errs.push(String(e))); p.on('request', r => { if (!r.url().startsWith('data:') && r.url() !== 'file://' + f) reqs.push(r.url()); });
 await p.goto('file://' + f); await p.waitForTimeout(1500);
 let canvasText = null;
 if (mask) { await p.addStyleTag({ content: '*{color:transparent !important;text-shadow:none !important} text,tspan,textPath{fill:transparent !important;stroke:transparent !important}' });
   canvasText = await p.evaluate(() => document.querySelectorAll('canvas').length); await p.waitForTimeout(300); }
 const dir = path.join(__dirname, 'shots', mask ? 'masked' : ''); fs.mkdirSync(dir, { recursive: true });
 const a = await p.screenshot({ path: path.join(dir, m + '.png') });
 await p.waitForTimeout(3000); const c = await p.screenshot();
 const sw = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight]);
 console.log(JSON.stringify({ maker: m, mask, canvases: canvasText, bytes: fs.statSync(f).size, errors: errs, requests: reqs, scroll: sw, still: a.equals(c) }));
 await b.close(); })();
