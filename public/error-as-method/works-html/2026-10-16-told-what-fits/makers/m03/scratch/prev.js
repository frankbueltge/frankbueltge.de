const fs=require('fs');
const html=fs.readFileSync('../work/index.html','utf8');
const js=html.split('<script>')[1].split('</script>')[0];
function mk(n){return {n,a:{},c:[],textContent:'',setAttribute(k,v){this.a[k]=v},appendChild(e){this.c.push(e)}}}
const root=mk('svg'); root.a={xmlns:'http://www.w3.org/2000/svg',width:1100,height:800,viewBox:'0 0 1100 800'};
global.document={getElementById:()=>root,createElementNS:(ns,n)=>mk(n)};
eval(js);
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
function ser(e){const at=Object.entries(e.a).map(([k,v])=>`${k}="${esc(v)}"`).join(' ');
 if(e.n==='text') at; const st=e.n==='text'?' font-family="serif" fill="#3a2a1c"':'';
 return `<${e.n} ${at}${st}>${e.c.map(ser).join('')}${esc(e.textContent)}</${e.n}>`}
fs.writeFileSync('prev.svg',ser(root));
