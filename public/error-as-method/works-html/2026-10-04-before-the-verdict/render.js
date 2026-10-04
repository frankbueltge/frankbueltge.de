// node render.js <variant id> <out.png> [variants file] -- renders one variant headless, 1100 x 700
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [id, out, vf] = process.argv.slice(2);
  const html = fs.readFileSync(path.join(__dirname, 'shell.html'), 'utf8').replace('VARFILE', vf || 'variants.js').replace('VARID', String(+id));
  const tmp = path.join(__dirname, '_run.html'); fs.writeFileSync(tmp, html);
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1100, height: 700 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + tmp); await p.waitForTimeout(400);
  await p.screenshot({ path: out }); await b.close(); fs.unlinkSync(tmp);
  if (errs.length) { console.error(errs.join('\n')); process.exit(1); } console.log('rendered', out);
})();
