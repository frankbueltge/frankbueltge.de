const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1100,height:800}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('requestfailed',r=>errs.push('req '+r.url()));
await p.goto('file:///tmp/claude-0/s123/mk/m10/work/index.html');await p.screenshot({path:'/tmp/claude-0/s123/mk/m10/scratch/shot.png'});
console.log('errors',errs);await b.close();})();
