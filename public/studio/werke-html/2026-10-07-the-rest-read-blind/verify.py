# Checks data.json / results.json against the committed draws and the arithmetic, and that index.html is current.
import json,subprocess,sys
from math import comb
U='../2026-10-07-the-unshown/'
d=json.load(open('data.json'));r=json.load(open('results.json'));F=d['frames']
rows={x['key']:x for x in json.load(open(U+'all_records.json'))['rows']}
k1=json.load(open(U+'draw.json'))['keys'];k2=json.load(open('draw.json'))['keys'];dr=json.load(open('draw.json'))
ok=[];
def c(n,b): ok.append(b); print(('ok  ' if b else 'FAIL'),n)
c('225 frames',len(F)==225)
c('first draw 135, further 90',len(k1)==135 and len(k2)==90)
c('draws disjoint',not set(k1)&set(k2))
c('all drawn keys exist and are unlicensed',all(k in rows and rows[k]['licence'] in('CC-BY-NC','other/none') for k in k1+k2))
c('further pool = 1255',dr['pool']==1255)
c('settled odd = 3',sum(f['cls'] in('remains','no_animal') for f in F)==3)
c('unclear = 1',sum(f['cls']=='unclear' for f in F)==1)
c('bone = 1',sum(f['cls']=='remains' for f in F)==1)
c('odd frames all in further draw',all(f['lot']=='B' for f in F if f['cls']!='living'))
c('first draw all living (as session 155)',all(f['cls']=='living' for f in F if f['lot']=='A'))
c('odd list keys are in the further draw',all(o['key'] in k2 for o in d['odd']) and len(d['odd'])==4)
def fisher(a,n1,b,n2):
    N=n1+n2;K=a+b;t=comb(N,K);pr=lambda x:comb(n1,x)*comb(n2,K-x)/t;p0=pr(a)
    return sum(pr(x) for x in range(max(0,K-n2),min(n1,K)+1) if pr(x)<=p0*(1+1e-9))
c('fisher 4/135 v 3/225 = 0.432',abs(fisher(4,135,3,225)-r['fisher']['lic4_v_unlic3_of225'])<1e-9 and round(r['fisher']['lic4_v_unlic3_of225'],2)==0.43)
c('fisher 0/135 v 3/90 = 0.063',round(r['fisher']['first0_of135_v_further3_of90'],3)==0.063)
c('index.html current',subprocess.call([sys.executable,'build.py','--check'])==0)
print(sum(ok),'of',len(ok),'passed'); sys.exit(0 if all(ok) else 1)
