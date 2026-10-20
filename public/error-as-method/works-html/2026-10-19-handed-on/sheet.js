// node sheet.js <out.png> <cols> <img>... : a contact sheet of kept renders at 1/3 size, labelled by file name.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const [out, cols, ...imgs] = process.argv.slice(2); const w = 367, h = 267;
 const html = '<body style="margin:0;background:#fff;font:12px monospace">' + imgs.map(f =>
  `<div style="display:inline-block;width:${w}px;margin:2px"><img src="file://${path.resolve(f)}" width=${w} height=${h}><br>${path.basename(f)}</div>`).join('') + '</body>';
 const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const p = await b.newPage({ viewport: { width: cols * (w + 4) + 4, height: 300 } });
 const fs = require('fs'); const t = out + '.html'; fs.writeFileSync(t, html); await p.goto('file://' + path.resolve(t)); await p.waitForTimeout(500); await p.screenshot({ path: out, fullPage: true }); await b.close(); fs.unlinkSync(t); })();
