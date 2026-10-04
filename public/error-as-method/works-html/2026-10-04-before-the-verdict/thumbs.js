// node thumbs.js -- 550 x 350 JPEG copies of seen/*.png for the face (the PNGs stay the evidence)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 550, height: 350 } });
  for (const f of fs.readdirSync(path.join(__dirname, 'seen')).filter(f => f.endsWith('.png'))) {
    const img = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'seen', f)).toString('base64');
    await p.setContent(`<body style="margin:0"><img style="width:550px;height:350px;display:block" src="${img}">`);
    await p.waitForTimeout(100);
    await p.screenshot({ path: path.join(__dirname, 'thumbs', f.replace('.png', '.jpg')), type: 'jpeg', quality: 82 });
  }
  await b.close();
})();
