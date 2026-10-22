const fs=require('fs');const build=require('./art.js');
const G=fs.readFileSync('grid.txt','utf8').split('\n');
fs.writeFileSync('prev.svg',build(G));
