const fs=require('fs'),path=require('path');
const dir=path.resolve(__dirname,'..');
const L=fs.readFileSync(path.join(dir,'data/46026h2024.txt'),'utf8').split('\n').filter(l=>l&&l[0]!='#');
const N=366*144, H=new Array(N).fill(-1), T=new Array(N).fill(-1), W=new Array(N).fill(-1), D=new Array(N).fill(-1);
const t0=Date.UTC(2024,0,1);
for(const l of L){const f=l.trim().split(/\s+/);const i=Math.floor((Date.UTC(+f[0],f[1]-1,+f[2],+f[3],+f[4])-t0)/600000);
 if(i<0||i>=N)continue; if(f[8]!=='99.00')H[i]=Math.round(+f[8]*100); if(f[14]!=='999.0')T[i]=Math.round(+f[14]*10);
 if(f[6]!=='99.0')W[i]=Math.round(+f[6]*10); if(f[9]!=='99.00')D[i]=Math.round(+f[9]*10);}
fs.writeFileSync(path.join(dir,'data/buoy.js'),'// derived from 46026h2024.txt by tools/build.js; 10-min slots of 2024 UTC, -1 = the file said 99/999\nvar BUOY={H:['+H+'],T:['+T+'],W:['+W+'],D:['+D+']};\n');
