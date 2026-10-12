const fs=require('fs');const html=fs.readFileSync('/tmp/claude-0/s121/mk/m07/work/index.html','utf8');
const js=html.split('<script>')[1].split('</script>')[0];
const texts=[],shapes=[];
function mk(n){return {n,attrs:{},setAttribute(k,v){this.attrs[k]=v},appendChild(){},set textContent(t){this.t=t},get textContent(){return this.t}}}
global.document={getElementById:id=>id==='c'?{getContext:()=>({putImageData(){}})}:{appendChild(e){(e.n==='text'?texts:shapes).push(e)}},createElementNS:(ns,n)=>mk(n)};
global.ImageData=function(){};
eval(js);
const zlib=require('zlib');
// draw boxes for text onto preview
const RR=require('./render.js');const W=1100,H=800;const px=RR.renderInk(fs.readFileSync('ink.enc','utf8'),W,H);
function box(x0,y0,x1,y1,c){for(let y=Math.max(0,y0|0);y<Math.min(H,y1);y++)for(let x=Math.max(0,x0|0);x<Math.min(W,x1);x++){const o=(y*W+x)*4;px[o]=c[0];px[o+1]=c[1];px[o+2]=c[2];}}
for(const t of texts){const fs_=+t.attrs['font-size'];const w=t.t.length*fs_*0.52;let x=+t.attrs.x;const a=t.attrs['text-anchor'];if(a==='end')x-=w;if(a==='middle')x-=w/2;const y=+t.attrs.y;
 if(t.attrs.transform) continue; box(x,y-fs_*0.75,x+w,y+1,[80,200,120]);}
for(const s of shapes){if(s.n==='line'){const a=s.attrs;const n=60;for(let i=0;i<=n;i++){const x=+a.x1+(a.x2-a.x1)*i/n,y=+a.y1+(a.y2-a.y1)*i/n;box(x,y,x+1,y+1,[255,255,255]);}}
 if(s.n==='circle'){box(s.attrs.cx-2,s.attrs.cy-2,+s.attrs.cx+3,+s.attrs.cy+3,[255,0,255]);}}
box(92,26,92+370,56,[60,60,160]);box(92,66,712,123,[40,40,110]);box(92,770,1012,792,[40,40,110]);
const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++){Buffer.from(px.buffer,y*W*4,W*4).copy(raw,y*(W*4+1)+1);}
function chunk(t,d){const b=Buffer.alloc(12+d.length);b.writeUInt32BE(d.length,0);b.write(t,4);d.copy(b,8);b.writeUInt32BE(zlib.crc32(Buffer.concat([Buffer.from(t),d]))>>>0,8+d.length);return b}
const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=6;
fs.writeFileSync('layout.png',Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
console.log(texts.length,'texts ok');
