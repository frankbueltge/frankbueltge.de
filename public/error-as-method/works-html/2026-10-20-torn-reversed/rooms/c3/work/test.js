const fs=require('fs');const ex=require('./extract.js');
const r=ex(fs.readFileSync(__dirname+'/../data/selborne.txt','utf8'));
console.log(r.length, r.filter(x=>x.words.length).length, r.reduce((a,x)=>a+x.words.length,0));
const per=new Array(12).fill(0);r.forEach(x=>per[Math.min(11,Math.floor(x.d/30.5))]+=x.words.length);console.log(per.join(' '));
r.filter(x=>x.words.length).slice(0,30).forEach(x=>console.log(x.d,x.words.map(w=>w[0]).join(','),'|',x.s.slice(0,110)));
