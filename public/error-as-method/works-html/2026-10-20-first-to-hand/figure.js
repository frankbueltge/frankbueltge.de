// node figure.js: serialises the face's flow chart (both arms) to figure.svg with the light palette resolved.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const p = await b.newPage({ viewport: { width: 1100, height: 900 }, colorScheme: 'light' });
 await p.goto(process.env.FACE_URL || 'file://' + path.resolve(__dirname, 'index.html')); await p.waitForTimeout(500);
 let s = await p.evaluate(() => document.querySelector('#chart svg').outerHTML); await b.close();
 const pal = { '--ink': '#1d1b18', '--mute': '#77716a', '--rule': '#d8d2c6', '--n': '#1f4e79', '--l': '#b0451c' };
 for (const k in pal) s = s.split(`var(${k})`).join(pal[k]);
 const css = '<style>text{fill:#1d1b18}.shelfrow text{font:11px monospace}.dim{opacity:.38}.colhead{font:italic 13px Georgia,serif;fill:#77716a}.node text{font:13px Georgia,serif}.flow{fill:none;stroke-opacity:.55}</style>';
 s = s.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(/(<svg[^>]*>)/, `$1${css}<rect width="100%" height="100%" fill="#f4f1ea"/>`);
 fs.writeFileSync(path.join(__dirname, 'figure.svg'), s); console.log(s.length); })();
