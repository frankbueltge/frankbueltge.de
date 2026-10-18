const fs=require('fs');
const ctx=new Proxy({},{get:(t,k)=>k in t?t[k]:(()=>{}),set:(t,k,v)=>{t[k]=v;return true}});
global.document={getElementById:()=>({getContext:()=>ctx})};
eval(fs.readFileSync('chk.js','utf8'));
console.log('ran');
