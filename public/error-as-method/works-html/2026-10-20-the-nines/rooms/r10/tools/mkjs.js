const fs=require('fs');const p=require('path');const d=p.join(__dirname,'..','data');
const t=fs.readFileSync(p.join(d,'46026h2024.txt'),'utf8');
fs.writeFileSync(p.join(d,'46026h2024.js'),'window.RAW='+JSON.stringify(t)+';\n');
