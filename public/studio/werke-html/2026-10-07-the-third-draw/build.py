# data (from the earlier works + this draw) + template.html -> data.json + index.html. `--check` fails if index.html has drifted.
import json,sys,re
W='../'
cen=json.load(open(W+'2026-10-06-every-open-one/census.json'))['rows']
rd=json.load(open(W+'2026-10-06-every-open-one/reading.json'))
over={'5828667135':('no-animal',"Re-read at 2000 px (session 156): a clod of mud and matted grass, a rubber boot at the corner; no limb, plate or rim of a shell."),
      '2013737414':('alive',"Re-read at 2000 px (session 156): a domed reddish shell in long grass with a painted mark; the head dark against the grass at the right edge.")}
lic=[]
for r in cen:
    k=str(r['key']);c=rd[k]['reading'];n=rd[k]['note']
    if k in over:c,n=over[k]
    lic.append(dict(key=k,img=r['img'].replace('original','medium'),src=r['src'],by=r['creator'] or 'unknown',lic=r['licence'],yr=r['year'],c={'alive':'alive','remains':'remains','no-animal':'none'}[c],n=n))
B=json.load(open(W+'2026-10-07-the-rest-read-blind/reading.json'))['odd']
lotB=[]
for i in range(90):
    o=B.get(str(i));lotB.append(dict(c={'remains':'remains','no_animal':'none','unclear':'unclear'}[o['class']],n=o['note']) if o else dict(c='alive'))
C=json.load(open('reading.json'))
res=json.load(open('results.json'))
D=dict(lic=lic,A=[dict(c='alive') for _ in range(135)],B=lotB,C=[dict(c='alive') for _ in range(90)],
 C_judged=C['judged_living_with_no_head_or_limb_clear'],R=res)
json.dump(D,open('data.json','w'))
t=open('template.html').read().replace('__DATA__',json.dumps(D,separators=(',',':')))
if '--check' in sys.argv:
    assert open('index.html').read()==t,'index.html drifted';print('ok')
else: open('index.html','w').write(t);print('built',len(t))
