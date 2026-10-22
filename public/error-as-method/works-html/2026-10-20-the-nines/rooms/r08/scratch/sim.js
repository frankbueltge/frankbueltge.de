const fs=require('fs');const L=fs.readFileSync(process.argv[2],'utf8').split('\n').filter(l=>l&&l[0]!='#');
const R=6371e3;let lat=37.759*Math.PI/180,lon=-122.833*Math.PI/180;let recs=[];
for(const l of L){const f=l.trim().split(/\s+/);const t=Date.UTC(+f[0],f[1]-1,+f[2],+f[3],+f[4])/1000;const T=+f[9],D=+f[11];if(D==999||T==99)continue;recs.push([t,T,D]);}
let tot=0,minl=90,maxl=-90,lonacc=0;
for(let i=0;i<recs.length;i++){const [t,T,D]=recs[i];const dt=Math.min((i+1<recs.length?recs[i+1][0]:t+1800)-t,3*3600);const c=9.81*T/(2*Math.PI);const d=c*dt;const h=(D+180)*Math.PI/180;
const dn=d*Math.cos(h),de=d*Math.sin(h);lat+=dn/R;lon+=de/(R*Math.cos(lat));lonacc+=de/(R*Math.cos(lat));tot+=d;minl=Math.min(minl,lat*180/Math.PI);maxl=Math.max(maxl,lat*180/Math.PI);}
console.log(recs.length,tot/1000,minl,maxl,lonacc*180/Math.PI/360,lat*180/Math.PI);
