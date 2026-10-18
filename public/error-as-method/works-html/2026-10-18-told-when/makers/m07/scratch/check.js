const fs=require('fs');const HT=fs.readFileSync('/tmp/claude-0/s135/mk/m07/work/index.html','utf8');
const js=HT.split('<script>')[1].split('</script>')[0];
let NC=0,maxx=0,minx=1e9;function E(){return{setAttribute(k,v){if(k==='cx'){v=+v;maxx=Math.max(maxx,v);minx=Math.min(minx,v)}},appendChild(){},set textContent(v){}}}
global.document={getElementById:()=>E(),createElementNS:(ns,t)=>{if(t==='circle')NC++;return E()}};
(new Function(js))();console.log("dots",NC,'x',minx,maxx);
