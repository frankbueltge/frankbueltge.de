const fs=require('fs');const L=fs.readFileSync(process.argv[2],'utf8').split('\n').filter(l=>l&&l[0]!='#');
const r=Math.PI/180;let recs=[];
for(const l of L){const f=l.trim().split(/\s+/);const t=Date.UTC(+f[0],f[1]-1,+f[2],+f[3],+f[4])/1000;const T=+f[9],D=+f[11];if(D==999||T==99)continue;recs.push([t,T,D,+f[1]]);}
let x=0,y=0,a=[1e9,-1e9,1e9,-1e9],out=[];
for(let i=0;i<recs.length;i++){const [t,T,D,m]=recs[i];const dt=Math.min((i+1<recs.length?recs[i+1][0]:t+1800)-t,3*3600);const d=9.81*T/(2*Math.PI)*dt/1000;const h=(D+180)*r;x+=d*Math.sin(h);y+=d*Math.cos(h);a=[Math.min(a[0],x),Math.max(a[1],x),Math.min(a[2],y),Math.max(a[3],y)];if(i%700==0)out.push(m+' '+x.toFixed(0)+' '+y.toFixed(0));}
console.log(a,x,y);console.log(out.join('\n'));
