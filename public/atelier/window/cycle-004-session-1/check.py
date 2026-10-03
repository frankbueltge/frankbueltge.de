#!/usr/bin/env python3
"""check.py: recount from the raw pass files by a second route (plain dict passes, no helpers shared with
analysis.py) and read every headline number back off index.html. Exit 1 on any failure."""
import json,re,sys,urllib.parse
ents=json.load(open(sys.argv[1]))['entries']
P1={r['url']:r for r in json.load(open('pass1.json'))['results']}
P2={r['url']:r for r in json.load(open('pass2.json'))['results']}
page=open('index.html').read(); txt=re.sub(r'<[^>]+>',' ',page)
fails=[]
def ok(c,m):
    if not c: fails.append(m)
urls={e['source_url'] for e in ents if e.get('source_url')}
ok(len(urls)==505,'urls'); ok(len(ents)==523,'entries')
def good(r):
    s=r['status']; return s is not None and 200<=s<300
n=dict(rh=0,rec=0,own=0); k=dict(rh=0,rec=0,own=0); hard=0; gone=0; silent=0; refboth=0; flips=0
for u in urls:
    h=urllib.parse.urlparse(u).netloc
    g='rh' if h=='artbase.rhizome.org' else 'rec' if h in('ars.electronica.art','dataphys.org') else 'own'
    n[g]+=1
    a,b=P1[u]['status'],P2[u]['status']
    if good(P1[u]) and good(P2[u]): k[g]+=1
    if g=='own':
        if a in(404,410,None) and b in(404,410,None): hard+=1; gone+=(a in(404,410) and b in(404,410)); silent+=(a is None and b is None)
        refboth+=(a==403 and b==403)
    # class change as analysis defines it: compare coarse class
    def c(s): return 'n' if s is None else 'a' if 200<=s<300 else 'r' if s==403 else 'g' if s in(404,410) else 'o'
    flips+=(c(a)!=c(b))
ok(n=={'rh':188,'rec':124,'own':193},f'group sizes {n}')
ok(k=={'rh':0,'rec':124,'own':162},f'answering {k}')
ok(sum(k.values())==286,'286 total'); ok(round(100*286/317,1)==90.2,'measurable pct')
ok((hard,gone,silent,refboth)==(13,7,6,12),f'hard loss {(hard,gone,silent,refboth)}')
ok(flips==4,f'flips {flips}')
ok(round(100*162/193,1)==83.9,'own pct')
for needle in ('286 of those','90.2 %','83.9','100.0','13 (6.7 %','188','0 of 188','7 returned 404','6 did not answer','12 refused both','4 URLs changed class','Here the River Lies','75.7','92.6','13.5 %','3.7 %'):
    ok(needle in re.sub(r'\s+',' ',txt),'page lacks: '+needle)
ok('<script' not in page,'script in page')
ok(page.count('<li><code>http')>=7+4,'listed urls')
print(f'{"FAIL" if fails else "PASS"}: {len(fails)} failures'); [print(' -',f) for f in fails]; sys.exit(1 if fails else 0)
