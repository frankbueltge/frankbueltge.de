const fs=require('fs');
const P=JSON.parse(fs.readFileSync('/tmp/claude-0/s133/mk/m23/scratch/px.json'));
const H=P.length,W=P[0].length;
const N=1464;
const x0=+process.argv[2]||1.5, b=+process.argv[3]||(297/1463);
const S=+process.argv[4]||0.75, A=+process.argv[5]||0.85, LAM=+process.argv[6]||0.002;
const base=83.5;
const D=new Float64Array(W*H);
for(let y=0;y<H;y++)for(let x=0;x<W;x++){let d=(255-P[y][x])/255; D[y*W+x]=d<0.1?0:d;}
const L=new Float64Array(W*H); // sum log(1-f)
const ys=new Float64Array(N).fill(base);
function contrib(i,y,sign){const xc=x0+i*b;
  for(let py=Math.max(0,Math.floor(y-3));py<=Math.min(H-1,Math.ceil(y+3));py++)
  for(let px=Math.max(0,Math.floor(xc-3));px<=Math.min(W-1,Math.ceil(xc+3));px++){
    const dx=px+0.5-xc, dy=py+0.5-y; const f=A*Math.exp(-(dx*dx+dy*dy)/(2*S*S));
    if(f>1e-4) L[py*W+px]+=sign*Math.log(1-f);}}
for(let i=0;i<N;i++)contrib(i,ys[i],1);
function dErr(i,y){const xc=x0+i*b;let e=0;
  for(let py=Math.max(0,Math.floor(y-3));py<=Math.min(H-1,Math.ceil(y+3));py++)
  for(let px=Math.max(0,Math.floor(xc-3));px<=Math.min(W-1,Math.ceil(xc+3));px++){
    const dx=px+0.5-xc, dy=py+0.5-y; const f=A*Math.exp(-(dx*dx+dy*dy)/(2*S*S));
    if(f<1e-4)continue; const k=py*W+px; const m0=1-Math.exp(L[k]); const m1=1-Math.exp(L[k]+Math.log(1-f));
    const d=D[k]; e+=(d-m1)*(d-m1)-(d-m0)*(d-m0);}
  return e;}
function totalErr(){let e=0;for(let k=0;k<W*H;k++){const m=1-Math.exp(L[k]);e+=(D[k]-m)**2;}return e;}
const cand=[];for(let y=2;y<=base;y+=0.25)cand.push(y);cand.push(base);
for(let pass=0;pass<14;pass++){
  const lam=LAM*(pass<6?4:1);
  const order=[...Array(N).keys()]; if(pass%2)order.reverse();
  for(const i of order){contrib(i,ys[i],-1);
    let best=Infinity,by=ys[i];
    for(const y of cand){let e=dErr(i,y);
      if(i>0)e+=lam*(y-ys[i-1])**2/100; if(i<N-1)e+=lam*(y-ys[i+1])**2/100;
      if(e<best){best=e;by=y;}}
    ys[i]=by;contrib(i,by,1);}
  console.error('pass',pass,totalErr().toFixed(2));
}
console.log(JSON.stringify({x0,b,S,A,err:totalErr(),ys:Array.from(ys)}));
