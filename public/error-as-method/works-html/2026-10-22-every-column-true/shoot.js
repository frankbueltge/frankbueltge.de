// shoot.js <out.png> <dir1/index.html> : the practice's render of a page at 1100 x 800, as the makers' viewer
// renders it (1.2 s wait), logging page errors. Used for final.png of every room and every mutant.
const { chromium } = require('playwright');
(async () => { const [out, f] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.goto('file://' + require('path').resolve(f)); await p.waitForTimeout(1200); await p.screenshot({ path: out }); await b.close();
  console.log(JSON.stringify({ out, errors: errs })); })();
