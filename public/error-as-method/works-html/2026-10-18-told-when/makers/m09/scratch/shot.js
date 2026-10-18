const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1100,height:800}});
const reqs=[];p.on('request',r=>reqs.push(r.url()));
await p.goto('file:///tmp/claude-0/s135/mk/m09/work/index.html');
console.log('hours',await p.getAttribute('#w','data-hours'),'requests',reqs.length);
await p.screenshot({path:'/tmp/claude-0/s135/mk/m09/scratch/shot.png'});await b.close();})();
