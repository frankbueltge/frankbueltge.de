#!/usr/bin/env python3
"""check.py (from repo root): recount data.json by a second route, simulate the interval's coverage, read the page."""
import json,re,sys,random
P='window/cycle-004-session-4/'
D=json.load(open(P+'data.json'))['species']; page=open(P+'index.html').read(); txt=re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',page)); f=[]
def ok(c,m):
    if not c: f.append(m)
ok(len(D)==156 and not any(v['errors'] for v in D.values()),'156 clean')
late={k:sum(c for c in (v['late'] or {}).values()) for k,v in D.items()}
# second route: late records from the all-years histogram, years >=1950
late2={k:sum(c for y,c in (v['all'] or {}).items() if y.isdigit() and int(y)>=1950) for k,v in D.items()}
diff=[k for k in D if late[k]!=late2[k]]
big=[k for k in D if late[k]>=1000]
ok(len(big)==13,'13 big')
bt=sum(late[k] for k in big); rt=sum(late[k] for k in D if k not in big)
ok(bt==10510053 and rt==1809,'totals %d %d'%(bt,rt))
ok(sum(1 for k in D if late[k]>0)==65,'65 species with a late record')
ok(sum(v['late'].get('HUMAN_OBSERVATION',0) for k,v in D.items() if k not in big)==471,'471')
# coverage of the upper limit: n uniform points on [0,1] (unknown start), true end 1
random.seed(4)
for n in(4,6,12):
    hit=0;N=20000
    for _ in range(N):
        x=sorted(random.random() for _ in range(n)); S=x[-1]-x[0]
        hit+= 1<= x[-1]+S*(0.05**(-1/(n-1))-1)
    ok(0.94<=hit/N<=0.97,'coverage n=%d %.3f'%(n,hit/N))
for n in('13 of them','10,510,053','1809','74.0 %','held','refuted','fired','PMC4005750','my derivation','were not opened'):
    ok(n in txt,'page lacks '+n)
ok('<script' not in page,'script')
print('late records whose year-facet total differs from the basis facet:',len(diff))
print('FAIL' if f else 'PASS',len(f)); [print(' -',x) for x in f]; sys.exit(1 if f else 0)
