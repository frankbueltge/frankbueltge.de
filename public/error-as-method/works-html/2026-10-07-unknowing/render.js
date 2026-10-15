// node render.js -> renders/T1.png T2.png T4.png from the SVGs (Chromium, device scale 1)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 for (const t of ['T1', 'T2', 'T4']) { const f = path.join(__dirname, 'renders', t + '.svg'); const s = fs.readFileSync(f, 'utf8');
  const [, w, h] = s.match(/width="(\d+)" height="(\d+)"/); const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.goto('file://' + f); await p.screenshot({ path: path.join(__dirname, 'renders', t + '.png') }); console.log(t, w, h); }
 await b.close(); })();
