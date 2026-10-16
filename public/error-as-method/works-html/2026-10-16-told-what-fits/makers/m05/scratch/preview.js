// run the page's script in node with a fake canvas, write a PPM
const fs=require('fs');
const html=fs.readFileSync('/tmp/claude-0/s131/mk/m05/work/index.html','utf8');
const js=html.split('<script>')[1].split('</script>')[0];
let out;
const ctx={scale(){},createImageData(w,h){return {width:w,height:h,data:new Uint8ClampedArray(w*h*4)}},putImageData(i){out=i},beginPath(){},arc(){},fill(){},set fillStyle(v){}};
global.window={devicePixelRatio:1};
global.document={getElementById:()=>({getContext:()=>ctx,set width(v){},set height(v){}})};
eval(js);
const {width:w,height:h,data}=out;const buf=Buffer.alloc(w*h*3);
for(let i=0;i<w*h;i++){buf[i*3]=data[i*4];buf[i*3+1]=data[i*4+1];buf[i*3+2]=data[i*4+2];}
fs.writeFileSync('prev.ppm',Buffer.concat([Buffer.from(`P6 ${w} ${h} 255\n`),buf]));
