const src=require('fs').readFileSync(__dirname+'/chk.js','utf8');
let n=0;function mk(){return {setAttribute(){},appendChild(){n++},set textContent(v){}}}
global.document={getElementById:mk,createElementNS:mk};
eval(src);console.log('elements',n);
