const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1100,height:800}});
await p.goto('file:///tmp/claude-0/s133/mk/m21/work/index.html');
p.on('console',m=>console.log(m.text()));
await p.screenshot({path:'/tmp/claude-0/s133/mk/m21/scratch/shot.png'});await b.close();})();
