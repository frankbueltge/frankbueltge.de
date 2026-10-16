const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1100,height:800}});
p.on('console',m=>console.log('console',m.text()));p.on('pageerror',e=>console.log('err',e.message));
await p.goto('file:///tmp/claude-0/s130/mk/m16/work/index.html');await p.screenshot({path:'/tmp/claude-0/s130/mk/m16/scratch/shot.png'});await b.close();})();
