const A=require('./fitA.json').ys, B=require('./fitB.json').ys;
const h={};A.forEach(y=>h[y]=(h[y]||0)+1);console.log(Object.entries(h).sort((a,b)=>b[1]-a[1]).slice(0,8));
const fl=83.5;
for(let d=0;d<61;d++){const a=A.slice(d*24,d*24+24).map(y=>Math.max(0,fl-y)), b=B.slice(d*24,d*24+24).map(y=>Math.max(0,fl-y));
const sa=a.reduce((p,c)=>p+c,0), sb=b.reduce((p,c)=>p+c,0);
console.log(String(d).padStart(2), a.map(v=>v<0.6?' .':String(Math.round(v)).padStart(2)).join(' '),' |',sa.toFixed(0),sb.toFixed(0));}
