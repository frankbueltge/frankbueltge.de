const fs=require('fs');
const h=fs.readFileSync(process.argv[2],'utf8');
const js=h.split('<script>')[1].split('</script>')[0];
class E{constructor(t){this.t=t;this.a={};this.c=[];this.textContent=''}setAttribute(k,v){this.a[k]=v}appendChild(c){this.c.push(c)}
 ser(){const at=Object.entries(this.a).map(([k,v])=>`${k}="${String(v).replace(/var\(--ink\)/g,'#1d2433').replace(/var\(--paper\)/g,'#f3efe6')}"`).join(' ');
 return `<${this.t} ${at}>${this.textContent.replace(/&/g,'&amp;')}${this.c.map(c=>c.ser()).join('')}</${this.t}>`}}
const root=new E('svg');root.a={xmlns:'http://www.w3.org/2000/svg','xmlns:xlink':'http://www.w3.org/1999/xlink',width:1100,height:800,viewBox:'0 0 1100 800'};
global.document={getElementById:()=>root,createElementNS:(n,t)=>new E(t)};
new Function(js)();
let s=root.ser().replace(/ href=/g,' xlink:href=');
s=s.replace('<svg ','<svg ').replace(/<text /g,'<text font-family="DejaVu Serif" fill="#1d2433" ');
fs.writeFileSync(process.argv[3],s);
