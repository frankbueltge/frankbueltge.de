const fs=require('fs');
const obs=JSON.parse(fs.readFileSync(__dirname+'/obs.json','utf8'));
const W=300,H=90,N=1464;
function run(sigma,amp,x0,xs,lambda,sweeps,verbose){
  const xi=[...Array(N)].map((_,i)=>x0+(i+0.5)*xs*W/N-0.5);
  const L=new Float64Array(W*H);
  const R=3;
  function kern(i,y,cb){ // cb(pixelIndex, logterm)
    const cx=xi[i];
    for(let px=Math.max(0,Math.floor(cx)-R);px<=Math.min(W-1,Math.ceil(cx)+R);px++)
      for(let py=Math.max(0,Math.floor(y)-R);py<=Math.min(H-1,Math.ceil(y)+R);py++){
        const g=Math.exp(-((px-cx)**2+(py-y)**2)/(2*sigma*sigma));
        if(g<1e-3)continue;
        cb(py*W+px,Math.log(1-amp*g));
      }
  }
  // init: column weighted median
  const y=new Float64Array(N);
  for(let i=0;i<N;i++){const c=Math.round(xi[i]);let s=0,t=0;for(let r=0;r<H;r++)t+=obs[r*W+Math.max(0,Math.min(W-1,c))];let r=0;for(;r<H;r++){s+=obs[r*W+c];if(s>=t/2)break;}y[i]=r;}
  for(let i=0;i<N;i++)kern(i,y[i],(k,l)=>L[k]+=l);
  const pred=k=>255*(1-Math.exp(L[k]));
  for(let s=0;s<sweeps;s++){
    let order=[...Array(N).keys()];
    if(s%2)order.reverse();
    let moved=0;
    for(const i of order){
      kern(i,y[i],(k,l)=>L[k]-=l);
      let best=Infinity,by=y[i];
      for(let cy=0;cy<=H-1;cy+=0.25){
        let d=0;
        kern(i,cy,(k,l)=>{const p0=255*(1-Math.exp(L[k])),p1=255*(1-Math.exp(L[k]+l));d+=(obs[k]-p1)**2-(obs[k]-p0)**2;});
        if(lambda){const nb=[];if(i>0)nb.push(y[i-1]);if(i<N-1)nb.push(y[i+1]);for(const v of nb)d+=lambda*Math.abs(cy-v);}
        if(d<best){best=d;by=cy;}
      }
      if(by!==y[i])moved++;
      y[i]=by;kern(i,y[i],(k,l)=>L[k]+=l);
    }
    if(verbose){let e=0;for(let k=0;k<W*H;k++)e+=(obs[k]-pred(k))**2;console.error('sweep',s,'moved',moved,'err',Math.round(e));}
  }
  let e=0;for(let k=0;k<W*H;k++)e+=(obs[k]-pred(k))**2;
  return {e,y:Array.from(y)};
}
module.exports=run;
if(require.main===module){
  const a=process.argv.slice(2).map(Number);
  const r=run(a[0],a[1],a[2],a[3],a[4],a[5],true);
  console.log(JSON.stringify({e:r.e}));
  if(a[6])fs.writeFileSync(__dirname+'/y.json',JSON.stringify(r.y));
}
