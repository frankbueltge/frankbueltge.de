const fs=require('fs');
const html=fs.readFileSync('/tmp/claude-0/s124/mk/m07/work/index.html','utf8');
const js=html.split('<script>')[1].split('</script>')[0];
const Wc=1100,Hc=800,buf=new Uint8ClampedArray(Wc*Hc*3).fill(0);
let fill=[0,0,0],stroke=[0,0,0],lw=1,path=[];
const parse=s=>(s.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
const put=(x,y,c,a=1)=>{x|=0;y|=0;if(x<0||y<0||x>=Wc||y>=Hc)return;const o=(y*Wc+x)*3;for(let i=0;i<3;i++)buf[o+i]=buf[o+i]*(1-a)+c[i]*a;};
const ctx={set fillStyle(s){fill=parse(s);},set strokeStyle(s){const m=parse(s);stroke=m;},set lineWidth(v){lw=v},set lineCap(v){},
fillRect(x,y,w,h){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)put(i,j,fill);},
getImageData(x,y,w,h){return {x,y,w,h,data:new Uint8ClampedArray(w*h*4)}},
putImageData(im,x,y){for(let j=0;j<im.h;j++)for(let i=0;i<im.w;i++){const o=(j*im.w+i)*4;put(x+i,y+j,[im.data[o],im.data[o+1],im.data[o+2]]);}},
beginPath(){path=[]},moveTo(x,y){path.push([x,y])},lineTo(x,y){path.push([x,y])},
stroke(){const [a,b]=path;const n=Math.max(1,Math.hypot(b[0]-a[0],b[1]-a[1])*2);for(let t=0;t<=n;t++){const x=a[0]+(b[0]-a[0])*t/n,y=a[1]+(b[1]-a[1])*t/n;for(let dx=-lw/2;dx<=lw/2;dx+=0.5)put(x+dx,y,stroke,0.5);}},
arc(x,y,r){path=[[x,y,r]]},fill(){const [x,y,r]=path[0];for(let j=-r;j<=r;j+=0.5)for(let i=-r;i<=r;i+=0.5)if(i*i+j*j<=r*r)put(x+i,y+j,fill);}};
global.document={getElementById:()=>({getContext:()=>ctx})};
global.atob=s=>Buffer.from(s,'base64').toString('latin1');
eval(js);
fs.writeFileSync('/tmp/claude-0/s124/mk/m07/scratch/prev.ppm',Buffer.concat([Buffer.from(`P6 ${Wc} ${Hc} 255\n`),Buffer.from(buf)]));
