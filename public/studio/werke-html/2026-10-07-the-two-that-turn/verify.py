# python3 verify.py — the page's data against the committed readings of the two earlier works, and the page against its data
import json,math,re,subprocess,sys
ok=bad=0
def c(n,cond,note=''):
    global ok,bad
    if cond: ok+=1
    else: bad+=1;print('FAIL',n,note)
D=json.load(open('data.json'));prev=json.load(open('../2026-10-06-every-open-one/reading.json'));cen={r['key']:r for r in json.load(open('../2026-10-06-every-open-one/census.json'))['rows']}
un=json.load(open('../2026-10-07-the-unshown/results.json'))
c('five frames',len(D['frames'])==5)
for f in D['frames']:
    k=f['id'];p=prev[k];r=cen[int(k)]
    c('licensed '+k,r['licence'] in('CC0','CC-BY'))
    c('credit matches census '+k,r['creator']==f['creator'] and str(f['photo']) in r['img'])
    if f['settled']: c('settled frame was not alive '+k,p['reading'] in('remains','no-animal'))
    else: c('open frame was unclear '+k,p['reading']=='unclear')
c('earlier counts',sum(1 for v in prev.values() if v['reading']!='alive')==5)
c('strata match the unshown work',D['strata']['NL']==un['licensed'] and D['strata']['NU']==un['unlicensed'] and D['strata']['nU']==un['drawn'] and un['non_living']==0)
c('drawn b* from cluster sizes',abs(D['strata']['bU']-2.1556)<1e-3)
def pr(c1,n,r1,x): return math.comb(c1,x)*math.comb(n-c1,r1-x)/math.comb(n,r1)
def fisher(a,b,cc,d):
    n=a+b+cc+d;r1=a+b;c1=a+cc;p0=pr(c1,n,r1,a);return sum(pr(c1,n,r1,x) for x in range(max(0,r1-(n-c1)),min(r1,c1)+1) if pr(c1,n,r1,x)<=p0*(1+1e-9))
c('fisher 5 v 0',abs(fisher(5,130,0,135)-0.0602)<5e-4);c('fisher 4 v 0 = 0.122',abs(fisher(4,131,0,135)-0.1222)<5e-4)
c('page up to date',subprocess.run([sys.executable,'build.py','--check']).returncode==0)
h=open('index.html').read();c('no foreign script',not re.search(r'<script[^>]+src=',h))
c('credits for CC BY on page','CC BY 4.0' in h and 'Bruce Slater' in h)
print(f'{ok} passed, {bad} failed');sys.exit(1 if bad else 0)
