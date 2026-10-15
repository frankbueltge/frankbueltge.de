// node render.js -> renders/T1.png from renders/T1.svg (Chromium, device scale 1)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const f = path.join(__dirname, 'renders', 'T1.svg'); const p = await b.newPage({ viewport: { width: 1600, height: 420 } });
 await p.goto('file://' + f); await p.screenshot({ path: path.join(__dirname, 'renders', 'T1.png') }); console.log('T1.png');
 await b.close(); })();
