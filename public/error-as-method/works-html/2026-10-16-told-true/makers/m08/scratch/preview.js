const fs=require('fs');
const html=fs.readFileSync('/tmp/claude-0/s130/mk/m08/work/index.html','utf8');
const js=html.split('<script>')[1].split('</script>')[0];
const W=1100,H=800,buf=new Float32Array(W*H*3);
function parse(c){if(typeof c==='object')return c;c=c.trim();if(c[0]=='#'){const n=parseInt(c.slice(1),16);return[n>>16,(n>>8)&255,n&255,1]}
 const v=c.slice(c.indexOf('(')+1,-1).split(',').map(Number);return[v[0],v[1],v[2],v.length>3?v[3]:1]}
const ctx={fillStyle:'#000',font:'',textAlign:'',scale(){},fillText(){},
 createLinearGradient(x0,y0,x1,y1){const st=[];return{y0,y1,st,addColorStop(o,c){st.push([o,parse(c)])},grad:true}},
 fillRect(x,y,w,h){const f=this.fillStyle;
  for(let yy=Math.max(0,Math.floor(y));yy<Math.min(H,Math.ceil(y+h));yy++){let c;
   if(f.grad){const t=Math.max(0,Math.min(1,(yy-f.y0)/(f.y1-f.y0)));const a=f.st[0][1],b=f.st[1][1];c=a.map((v,i)=>v+(b[i]-v)*t)}else c=parse(f);
   for(let xx=Math.max(0,Math.floor(x));xx<Math.min(W,Math.ceil(x+w));xx++){const k=(yy*W+xx)*3;for(let i=0;i<3;i++)buf[k+i]=buf[k+i]*(1-c[3])+c[i]*c[3]}}}};
const document={getElementById:()=>({getContext:()=>ctx})};
eval(js);
const out=Buffer.alloc(W*H*3);for(let i=0;i<out.length;i++)out[i]=Math.max(0,Math.min(255,Math.round(buf[i])));
fs.writeFileSync('/tmp/claude-0/s130/mk/m08/scratch/prev.ppm',Buffer.concat([Buffer.from(`P6 ${W} ${H} 255\n`),out]));
