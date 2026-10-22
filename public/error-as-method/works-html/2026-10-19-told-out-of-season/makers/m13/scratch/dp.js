const fs=require('fs');const {W,H,px}=JSON.parse(fs.readFileSync(__dirname+'/px.json'));
const mx=Math.max(...px), mn=Math.min(...px);
function dk(x,y){x=Math.min(Math.max(x,0),W-1.001);y=Math.min(Math.max(y,0),H-1.001);
 const x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0;
 const g=(a,b)=>(mx-px[b*W+a])/(mx-mn);
 return g(x0,y0)*(1-fx)*(1-fy)+g(x0+1,y0)*fx*(1-fy)+g(x0,y0+1)*(1-fx)*fy+g(x0+1,y0+1)*fx*fy;}
const N=1464,X0=+process.argv[2]||2.4,X1=+process.argv[3]||297.4;
const xs=[...Array(N)].map((_,t)=>X0+(X1-X0)*t/(N-1));
const R=2,S=H*R,ys=[...Array(S)].map((_,i)=>i/R);
const lam=0.02,mu=0.6,maxj=50*R;
let prev=ys.map(y=>1-dk(xs[0],y));const back=[];
for(let t=1;t<N;t++){const cur=new Float64Array(S),bk=new Int32Array(S);
 const c=ys.map(y=>1-dk(xs[t],y));
 for(let j=0;j<S;j++){let best=1e18,bi=0;
  for(let i=Math.max(0,j-maxj);i<Math.min(S,j+maxj+1);i++){
   const d=Math.abs(i-j)/R; let w=0;
   if(d>2){const k=Math.ceil(d/2);for(let s=1;s<k;s++){const f=s/k;w+=1-dk(xs[t-1]+(xs[t]-xs[t-1])*f,ys[i]+(ys[j]-ys[i])*f);}w/=Math.max(1,k-1);w*=d;}
   const v=prev[i]+lam*d+mu*w*0.1;
   if(v<best){best=v;bi=i;}}
  cur[j]=best+c[j];bk[j]=bi;}
 back.push(bk);prev=cur;}
let j=0;for(let k=1;k<S;k++)if(prev[k]<prev[j])j=k;const path=[j];
for(let t=N-2;t>=0;t--){j=back[t][j];path.push(j);}path.reverse();
const vals=path.map(j=>ys[j]);
fs.writeFileSync(__dirname+'/series_y.json',JSON.stringify({xs,vals}));
let fit=0;vals.forEach((y,t)=>fit+=dk(xs[t],y));console.log('mean dark',fit/N);
