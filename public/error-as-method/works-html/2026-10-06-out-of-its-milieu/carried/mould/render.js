// node render.js iterations/N-x.js seen/N.png  -- renders one iteration headless at 1100 px, full page
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
 const [it, out] = process.argv.slice(2);
 const html = fs.readFileSync(path.join(__dirname, 'shell.html'), 'utf8').replace('ITERFILE', it);
 fs.writeFileSync(path.join(__dirname, '_shell_run.html'), html);
 const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 900 } });
 const errs = []; p.on('pageerror', e => errs.push(String(e)));
 await p.goto('file://' + path.join(__dirname, '_shell_run.html')); await p.waitForTimeout(800);
 await p.screenshot({ path: out, fullPage: true }); await b.close(); fs.unlinkSync(path.join(__dirname, '_shell_run.html'));
 if (errs.length) { console.error(errs.join('\n')); process.exit(1); } console.log('rendered', out);
})();
