set -e
cd /tmp/claude-0/s121/mk/m11/scratch
python3 -c "
t=open('template.html').read(); d=open('data.txt').read()
open('../work/index.html','w').write(t.replace('__DATA__',d))"
node -e "
const fs=require('fs');const h=fs.readFileSync('../work/index.html','utf8');
const js=h.split('<script>')[1].split('</script>')[0];
let out;global.document={getElementById:()=>({set innerHTML(v){out=v}})};
eval(js);fs.writeFileSync('out.svg',out);"
python3 render.py out.svg out.png
