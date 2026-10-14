const {chromium}=require('/opt/node-tools/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1100,height:800}});
await p.goto('file:///tmp/claude-0/s123/mk/m02/work/index.html');
await p.screenshot({path:'/tmp/claude-0/s123/mk/m02/scratch/shot.png'});await b.close();})();
