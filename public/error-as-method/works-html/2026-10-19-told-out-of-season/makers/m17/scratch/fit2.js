const fs=require('fs');
const NF=+(process.argv[7]||6);
const G=JSON.parse(fs.readFileSync('gray.json'));const W=G.W,H=G.H,D=G.d;
const N=1464, X0=+process.argv[2]||3.2, X1=+process.argv[3]||297.2, SIG=0.85, AMP=1.0, LAM=+process.argv[4]||0.02;
const xs=[];for(let h=0;h<N;h++)xs.push(X0+(X1-X0)*h/(N-1));
// pred buffer (sum of contributions)
const S=[];for(let x=0;x<W;x++)S.push(new Float64Array(H));
function contrib(h,y,sign){const cx=xs[h];for(let x=Math.floor(cx-2);x<=Math.ceil(cx+2);x++){if(x<0||x>=W)continue;const dx=x-cx;for(let yy=Math.max(0,Math.floor(y-3));yy<=Math.min(H-1,Math.ceil(y+3));yy++){const dy=yy-y;S[x][yy]+=sign*AMP*Math.exp(-(dx*dx+dy*dy)/(2*SIG*SIG));}}}
function local(h,y){ // data cost over affected columns, with dot at y
 contrib(h,y,1);let c=0;const cx=xs[h];
 for(let x=Math.floor(cx-2);x<=Math.ceil(cx+2);x++){if(x<0||x>=W)continue;for(let yy=0;yy<H;yy++){const p=Math.min(1,S[x][yy]);const e=p-D[x][yy];c+=e*e;}}
 contrib(h,y,-1);return c;}

function TVr(h,g){let c=0;for(let i=Math.max(1,h);i<=Math.min(N-1,g+1);i++)c+=Math.abs(Y[i]-Y[i-1]);return c}
function dc(h,g,ya,yb){contrib(h,ya,1);contrib(g,yb,1);let c=0;
 for(let x=Math.floor(xs[h]-2);x<=Math.ceil(xs[g]+2);x++){if(x<0||x>=W)continue;for(let yy=0;yy<H;yy++){const p=Math.min(1,S[x][yy]);const e=p-D[x][yy];c+=e*e;}}
 contrib(h,ya,-1);contrib(g,yb,-1);return c}
// init: column centroid of darkness
const Y=new Float64Array(N);
for(let h=0;h<N;h++){const x=Math.round(xs[h]);let s=0,m=0;for(let y=0;y<H;y++){const d=D[x][y]>0.3?D[x][y]:0;s+=d;m+=d*y}Y[h]=s?m/s:60;}
// spread init within column ranges for diversity
for(let h=0;h<N;h++)contrib(h,Y[h],1);
for(let it=0;it<+(process.argv[6]||12);it++){let moved=0;
 const order=[...Array(N).keys()]; if(it%2)order.reverse();
 for(const h of order){contrib(h,Y[h],-1);let best=Y[h],bc=Infinity;
  const lo=it<NF?0:Math.max(0,Y[h]-6),hi=it<NF?H-1:Math.min(H-1,Y[h]+6),st=it<NF?0.5:0.25;
  for(let y=lo;y<=hi;y+=st){let c=local(h,y);
   if(h>0)c+=LAM*Math.abs(y-Y[h-1]);if(h<N-1)c+=LAM*Math.abs(y-Y[h+1]);
   if(c<bc){bc=c;best=y}}
  if(Math.abs(best-Y[h])>0.01)moved++;Y[h]=best;contrib(h,Y[h],1);}

 // swap moves
 const tv=(h,a)=>{let c=0;if(h>0)c+=Math.abs(a-Y[h-1]);if(h<N-1)c+=Math.abs(a-Y[h+1]);return c};
 for(let pass=0;pass<4;pass++)for(let k=1;k<=3;k++)for(let h=0;h+k<N;h++){const g=h+k;
  const before=LAM*(TVr(h,g));
  const a=Y[h],b=Y[g];
  contrib(h,a,-1);contrib(g,b,-1);
  const c0=dc(h,g,a,b), c1=dc(h,g,b,a);
  Y[h]=b;Y[g]=a;const after=LAM*TVr(h,g);
  if(c1+after<c0+before-1e-9){contrib(h,b,1);contrib(g,a,1);moved++;} else {Y[h]=a;Y[g]=b;contrib(h,a,1);contrib(g,b,1);}
 }
 let tot=0;for(let x=0;x<W;x++)for(let y=0;y<H;y++){const e=Math.min(1,S[x][y])-D[x][y];tot+=e*e}
 console.error('it',it,'moved',moved,'cost',tot.toFixed(1));}
fs.writeFileSync(process.argv[5]||'series.json',JSON.stringify(Array.from(Y,v=>+v.toFixed(2))));
