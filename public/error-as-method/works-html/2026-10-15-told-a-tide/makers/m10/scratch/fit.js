const fs=require('fs');
const P=JSON.parse(fs.readFileSync(__dirname+'/pix.json','utf8'));
const W=300,H=90,N=1464;
const T=new Float64Array(W*H);
for(let i=0;i<W*H;i++)T[i]=Math.max(0,Math.min(1,(250-P[i])/215));
function run(a,b,s,alpha,passes,log){
  const X=new Float64Array(N),Y=new Float64Array(N);
  for(let i=0;i<N;i++)X[i]=a+i*b;
  // log-transparency accumulation: L = sum log(1-alpha*cov); darkness = 1-exp(L)
  const L=new Float64Array(W*H);
  const ov=(c,p)=>Math.max(0,Math.min(c+s/2,p+1)-Math.max(c-s/2,p));
  function apply(i,sign){
    const x0=Math.floor(X[i]-s/2),x1=Math.floor(X[i]+s/2),y0=Math.floor(Y[i]-s/2),y1=Math.floor(Y[i]+s/2);
    for(let x=x0;x<=x1;x++){if(x<0||x>=W)continue;const ox=ov(X[i],x);if(!ox)continue;
      for(let y=y0;y<=y1;y++){if(y<0||y>=H)continue;const c=ox*ov(Y[i],y);if(!c)continue;
        L[y*W+x]+=sign*Math.log(1-alpha*Math.min(1,c));}}
  }
  // init: column profile peaks, spread
  const colDark=x=>{const v=[];for(let y=0;y<H;y++)v.push(T[y*W+x]);return v;};
  for(let i=0;i<N;i++){const cx=Math.min(W-1,Math.max(0,Math.round(X[i])));const v=colDark(cx);
    let best=45,bv=-1;for(let y=0;y<H;y++)if(v[y]>bv){bv=v[y];best=y+0.5;}Y[i]=best;}
  for(let i=0;i<N;i++)apply(i,1);
  const err=(x,y)=>{const d=1-Math.exp(L[y*W+x])-T[y*W+x];return d*d;};
  for(let pass=0;pass<passes;pass++){
    let moved=0;
    const order=[...Array(N).keys()];
    for(let k=N-1;k>0;k--){const j=Math.floor(Math.random()*(k+1));[order[k],order[j]]=[order[j],order[k]];}
    for(const i of order){
      apply(i,-1);
      const x0=Math.max(0,Math.floor(X[i]-s/2)),x1=Math.min(W-1,Math.floor(X[i]+s/2));
      let bestY=Y[i],bestE=Infinity;
      for(let yc=0.5;yc<H;yc+=0.25){
        Y[i]=yc;apply(i,1);
        let e=0;const y0=Math.max(0,Math.floor(yc-s/2)-1),y1=Math.min(H-1,Math.floor(yc+s/2)+1);
        // delta error: compare with removal over local pixels
        for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){e+=err(x,y);}
        apply(i,-1);
        // baseline (without dot) on same window
        let e0=0;for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)e0+=err(x,y);
        const de=e-e0;
        if(de<bestE){bestE=de;bestY=yc;}
      }
      if(Math.abs(bestY-Y[i])>0.01)moved++;
      Y[i]=bestY;apply(i,1);
    }
    if(log)console.error('pass',pass,'moved',moved);
  }
  let tot=0;for(let x=0;x<W;x++)for(let y=0;y<H;y++)tot+=err(x,y);
  return {tot,X,Y};
}
const mode=process.argv[2];
if(mode==='grid'){
  for(const a of [1.8])for(const span of [295.6])for(const s of [1.3,1.5,1.7,2.0])for(const alpha of [0.6,0.75,0.9]){
    const r=run(a,span/(N-1),s,alpha,4,false);console.log(a,span,s,alpha,r.tot.toFixed(2));}
}else{
  const [a,span,s,alpha]=process.argv.slice(3).map(Number);
  const r=run(a,span/(N-1),s,alpha,14,true);console.error('err',r.tot);
  fs.writeFileSync(__dirname+'/values.json',JSON.stringify(Array.from(r.Y).map(y=>+(y.toFixed(2)))));
}
