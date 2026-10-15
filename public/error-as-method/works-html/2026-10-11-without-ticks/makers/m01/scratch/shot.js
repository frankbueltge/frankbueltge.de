const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const b=await chromium.launch({executablePath:process.argv[3]});const p=await b.newPage({viewport:{width:1100,height:800}});
p.on('console',m=>console.log(m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
let reqs=[];p.on('request',r=>reqs.push(r.url()));
await p.goto('file:///tmp/claude-0/s121/mk/m01/work/index.html');await p.waitForTimeout(500);
await p.screenshot({path:process.argv[2]});console.log(reqs);await b.close();})();
