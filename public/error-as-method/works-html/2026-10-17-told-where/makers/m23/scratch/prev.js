const fs=require('fs');
const html=fs.readFileSync('/tmp/claude-0/s133/mk/m23/work/index.html','utf8');
const js=html.split('<script>')[1].split('</script>')[0];
let main=null,lightImg=null;
function mkctx(isMain){return{createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4),width:w,height:h}),
 putImageData:(im)=>{if(isMain)main=im;else lightImg=im;},save(){},restore(){},drawImage(){},fillText(){},set filter(v){},set globalAlpha(v){},set globalCompositeOperation(v){},set fillStyle(v){},set font(v){},set textAlign(v){},set textBaseline(v){}};}
const document={getElementById:(id)=>id==='c'?{getContext:()=>mkctx(true)}:{style:{}},createElement:()=>({getContext:()=>mkctx(false)})};
eval(js);
// crude bloom: box blur of light added
const W=1100,H=800,d=main.data,l=lightImg.data;
const acc=new Float32Array(W*H*3);const R=8;
for(let c=0;c<3;c++){const tmp=new Float32Array(W*H);
 for(let y=0;y<H;y++){let s=0;for(let x=-R;x<W+R;x++){if(x+R<W){const k=(y*W+x+R)*4;s+=l[k+c]*l[k+3]/255;} if(x-R-1>=0){const k=(y*W+x-R-1)*4;s-=l[k+c]*l[k+3]/255;} if(x>=0&&x<W)tmp[y*W+x]=s/(2*R+1);}}
 for(let x=0;x<W;x++){let s=0;for(let y=-R;y<H+R;y++){if(y+R<H)s+=tmp[(y+R)*W+x]; if(y-R-1>=0)s-=tmp[(y-R-1)*W+x]; if(y>=0&&y<H)acc[(y*W+x)*3+c]=s/(2*R+1);}}}
let out=Buffer.alloc(W*H*3);
for(let i=0;i<W*H;i++)for(let c=0;c<3;c++)out[i*3+c]=Math.min(255,d[i*4+c]+0.32*acc[i*3+c]);
fs.writeFileSync('/tmp/claude-0/s133/mk/m23/scratch/prev.ppm',Buffer.concat([Buffer.from(`P6 ${W} ${H} 255\n`),out]));
