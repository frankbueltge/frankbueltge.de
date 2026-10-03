#!/usr/bin/env python3
"""check.py <werke.json>: recount pass 3 and the 13 from raw files by a second route; read numbers off index.html."""
import json,re,sys,urllib.parse
S1='../cycle-004-session-1/'
P={k:{r['url']:r for r in json.load(open(f))['results']} for k,f in (('1',S1+'pass1.json'),('2',S1+'pass2.json'),('3','pass3.json'))}
H=json.load(open('hosts.json'))['hosts']
page=open('index.html').read(); txt=re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',page)); f=[]
def ok(c,m):
    if not c: f.append(m)
good=lambda r:r['status'] is not None and 200<=r['status']<300
urls=sorted(P['1']); ok(len(urls)==505,'505')
rh=[u for u in urls if urllib.parse.urlparse(u).netloc=='artbase.rhizome.org']
ok(len(rh)==188 and all(P['3'][u]['status']==403 for u in rh),'rhizome')
B=[u for u in urls if u not in rh and good(P['1'][u]) and good(P['2'][u])]
ok(len(B)==286 and all(good(P['3'][u]) for u in B),'286 again')
def c(s): return 'n' if s is None else 'a' if 200<=s<300 else 'r' if s==403 else 'g' if s in(404,410) else 'o'
ok(sum(c(P['2'][u]['status'])!=c(P['3'][u]['status']) for u in urls)==3,'3 changes')
ok(sum(c(P['1'][u]['status'])!=c(P['2'][u]['status']) for u in urls)==4,'4 changes')
L=[u for u in urls if urllib.parse.urlparse(u).netloc not in('artbase.rhizome.org','ars.electronica.art','dataphys.org') and P['1'][u]['status'] in(404,410,None) and P['2'][u]['status'] in(404,410,None)]
ok(len(L)==13,'13')
firm=[u for u in L if P['3'][u]['status'] in(404,410)]; ok(len(firm)==7,'7 firm')
ok(sum(good(P['3'][u]) for u in L)==1,'1 weather')
ok(len(H)==13 and sum(1 for h in H if h.get('root_status') and 200<=h['root_status']<300)==8,'8 roots')
ok(sum(1 for h in H if not h['dns'])==1,'1 nodns')
fh={urllib.parse.urlparse(u).netloc for u in firm}
ok(all(any(h['host']==x and h.get('root_status') and 200<=h['root_status']<300 for h in H) for x in fh),'firm hosts alive')
ok(P['3'][urls[0]] and json.load(open('pass3.json'))['at'][:10]=='2026-10-03','date')
for n in('286 of 286','188 Rhizome','3 of 505','17 hours 54 minutes','3.6 %','1.8–7.3','12 of 193','Four of five held','12 of 13','cannot be told'):
    ok(n in txt,'page lacks '+n)
ok('<script' not in page,'script')
print('FAIL' if f else 'PASS',len(f)); [print(' -',x) for x in f]; sys.exit(1 if f else 0)
