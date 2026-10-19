const fs=require('fs');
const html=fs.readFileSync(process.argv[2],'utf8');
const js=html.split('<script>')[1].split('</script>')[0];
const root={children:[],attrs:{}};
function mk(n){return {n,attrs:{},children:[],textContent:'',setAttribute(k,v){this.attrs[k]=v},appendChild(c){this.children.push(c)}}}
const svg=mk('svg');
global.document={getElementById:()=>svg,createElementNS:(ns,n)=>mk(n)};
eval(js);
const css=html.split('<style>')[1].split('</style>')[0];
function ser(e){const a=Object.entries(e.attrs).map(([k,v])=>` ${k}="${v}"`).join('');
 return `<${e.n}${a}>${e.textContent.replace(/&/g,'&amp;')}${e.children.map(ser).join('')}</${e.n}>`}
fs.writeFileSync(process.argv[3],JSON.stringify(svg.children,(k,v)=>k==="setAttribute"||k==="appendChild"?undefined:v));process.exit(0);
fs.writeFileSync(process.argv[3],out);
