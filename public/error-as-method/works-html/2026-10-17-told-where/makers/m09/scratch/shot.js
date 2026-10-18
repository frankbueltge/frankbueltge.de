const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
const reqs=[];p.on('request',r=>reqs.push(r.url()));
await p.goto('file:///tmp/claude-0/s133/mk/m09/work/index.html');
await p.screenshot({path:'/tmp/claude-0/s133/mk/m09/scratch/shot.png'});
console.log(reqs);await b.close();})().catch(e=>{console.error(e.message);process.exit(1)});
