const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const js=html.match(/<script>([\s\S]*)<\/script>/)[1];
function E(t){return {t,a:{},c:[],textContent:null,setAttribute(k,v){this.a[k]=v},appendChild(e){this.c.push(e)}};}
const root=E('svg');root.a={xmlns:'http://www.w3.org/2000/svg',width:1100,height:800};
global.document={getElementById:()=>root,createElementNS:(n,t)=>E(t)};
eval(js);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
function ser(e){const a=Object.entries(e.a).map(([k,v])=>`${k}="${esc(v)}"`).join(' ');
 return `<${e.t} ${a}>${e.textContent!=null?esc(e.textContent):''}${e.c.map(ser).join('')}</${e.t}>`;}
root.c.unshift({t:'rect',a:{width:1100,height:800,fill:'#f3efe6'},c:[],textContent:null});
fs.writeFileSync(process.argv[3],ser(root).replace('<svg ','<svg font-family="DejaVu Serif" '));
