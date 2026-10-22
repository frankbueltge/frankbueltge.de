const fs=require('fs');const L=fs.readFileSync(process.argv[2],'utf8').split('\n').filter(l=>l&&l[0]!='#');
const R=6371e3,r=Math.PI/180;let p=37.759*r,q=-122.833*r;let recs=[];
for(const l of L){const f=l.trim().split(/\s+/);const t=Date.UTC(+f[0],f[1]-1,+f[2],+f[3],+f[4])/1000;const T=+f[9],D=+f[11];if(D==999||T==99)continue;recs.push([t,T,D,+f[1]]);}
let laps=0,mn=90,mx=-90,out=[];
for(let i=0;i<recs.length;i++){const [t,T,D,m]=recs[i];const dt=Math.min((i+1<recs.length?recs[i+1][0]:t+1800)-t,3*3600);const d=9.81*T/(2*Math.PI)*dt/R;const h=(D+180)*r;
const p2=Math.asin(Math.sin(p)*Math.cos(d)+Math.cos(p)*Math.sin(d)*Math.cos(h));const dq=Math.atan2(Math.sin(h)*Math.sin(d)*Math.cos(p),Math.cos(d)-Math.sin(p)*Math.sin(p2));p=p2;q+=dq;laps+=dq;mn=Math.min(mn,p/r);mx=Math.max(mx,p/r);if(i%500==0)out.push([m,(p/r).toFixed(1),(q/r).toFixed(0)].join(' '));}
console.log(mn,mx,laps/r/360);console.log(out.join('\n'));
