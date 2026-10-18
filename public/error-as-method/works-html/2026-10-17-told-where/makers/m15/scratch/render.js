const fs=require('fs');
const html=fs.readFileSync('/tmp/claude-0/s133/mk/m15/work/index.html','utf8');
const js=html.split('<script>')[1].split('</script>')[0];
let saved;
const ctx={createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),putImageData:(im)=>{saved=im},fillText(){},};
const document={getElementById:()=>({getContext:()=>ctx})};
new Function('document',js)(document);
fs.writeFileSync('out.raw',Buffer.from(saved.data.buffer));
