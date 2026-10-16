const fs=require('fs');eval(fs.readFileSync('data.js','utf8').replace('const D','global.D'));
const N=1464,T=[],V=[],B=[];for(let i=0;i<D.length;i+=3){T.push(Math.max(0,Math.min(N-1,D[i])));V.push(D[i+1]);B.push(D[i+2]);}
const SIG=2.2,est=[];for(let h=0;h<N;h++){let sw=0,sv=0;for(let j=0;j<T.length;j++){const dt=T[j]-h;if(dt>-9&&dt<9){const w=Math.exp(-dt*dt/(2*SIG*SIG))*B[j];sw+=w;sv+=w*V[j];}}est.push(sv/sw);}
const r=T.map((t,j)=>[V[j]-est[Math.round(t)],t,V[j]]).sort((a,b)=>b[0]-a[0]);console.log(r.slice(0,30).map(a=>a.map(x=>x.toFixed(1)).join(' ')).join('\n'));
