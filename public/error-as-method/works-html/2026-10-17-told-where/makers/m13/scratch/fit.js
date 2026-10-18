const fs=require('fs');
const P=JSON.parse(fs.readFileSync('/tmp/claude-0/s133/mk/m13/scratch/px.json'));
const W=300,H=90,N=1464;
const X0=+process.argv[2]||3.05, B=+process.argv[3]||0.20087, R=+process.argv[4]||0.8, LAM=+(process.argv[5]||0.0);
const SS=8;
const xs=[];for(let i=0;i<N;i++)xs.push(X0+B*i);
// coverage of pixel (px,py) by disk at (cx,cy)
function cov(px,py,cx,cy){let c=0;for(let a=0;a<SS;a++)for(let b=0;b<SS;b++){const dx=px+(a+.5)/SS-cx,dy=py+(b+.5)/SS-cy;if(dx*dx+dy*dy<=R*R)c++;}return c/(SS*SS);}
const ys=new Float64Array(N).fill(84);
// transmittance product per pixel: store log(1-cov) sums; cov can be 1 -> clamp
const LT=[];for(let y=0;y<H;y++)LT.push(new Float64Array(W));
const EPS=1e-3;
function stamp(i,y,sgn){const cx=xs[i];for(let px=Math.floor(cx-R)-1;px<=Math.floor(cx+R)+1;px++)for(let py=Math.floor(y-R)-1;py<=Math.floor(y+R)+1;py++){if(px<0||px>=W||py<0||py>=H)continue;const c=cov(px,py,cx,y);if(c>0)LT[py][px]+=sgn*Math.log(Math.max(EPS,1-c));}}
for(let i=0;i<N;i++)stamp(i,ys[i],1);
function pixErr(){let e=0;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const m=255*(1-Math.exp(LT[y][x]));e+=(m-P[y][x])**2;}return e;}
const cand=[];for(let y=4;y<=84.001;y+=0.25)cand.push(y);
function localErr(i,y){ // error over neighborhood region given dot i at y (dot i already removed)
}
function sweep(order){
 for(const i of order){
  stamp(i,ys[i],-1);
  const cx=xs[i];const x1=Math.max(0,Math.floor(cx-R)-1),x2=Math.min(W-1,Math.floor(cx+R)+1);
  let best=1e18,by=ys[i];
  for(const y of cand){
   // compute error change only over the column strip x1..x2, rows near y
   let e=0;
   for(let px=x1;px<=x2;px++)for(let py=Math.max(0,Math.floor(y-R)-1);py<=Math.min(H-1,Math.floor(y+R)+1);py++){
     const c=cov(px,py,cx,y);if(c<=0)continue;
     const base=LT[py][px];const m0=255*(1-Math.exp(base)),m1=255*(1-Math.exp(base+Math.log(Math.max(EPS,1-c))));
     e+=(m1-P[py][px])**2-(m0-P[py][px])**2;
   }
   if(LAM>0){if(i>0)e+=LAM*(y-ys[i-1])**2;if(i<N-1)e+=LAM*(y-ys[i+1])**2;}
   if(e<best){best=e;by=y;}
  }
  ys[i]=by;stamp(i,by,1);
 }
}
let order=[...Array(N).keys()];
let seed=1;function rnd(){seed=(seed*16807)%2147483647;return seed/2147483647;}
for(let s=0;s<6;s++){for(let i=N-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[order[i],order[j]]=[order[j],order[i]];}sweep(order);console.error('sweep',s,pixErr().toExponential(4));}
fs.writeFileSync('/tmp/claude-0/s133/mk/m13/scratch/ys.json',JSON.stringify(Array.from(ys)));
console.log(pixErr());
