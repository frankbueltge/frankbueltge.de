#!/usr/bin/env python3
"""check.py (from repo root): recount keep.json by a second route and read numbers off index.html."""
import json,re,sys
K=json.load(open('window/cycle-004-session-3/keep.json'))
page=open('window/cycle-004-session-3/index.html').read(); txt=re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',page)); f=[]
def ok(c,m):
    if not c: f.append(m)
kept=lambda u:any(x['snap'] for x in K['ask'][u]); one=lambda u:bool(K['ask'][u][0]['snap'])
S={s:d['urls'] for s,d in K['sets'].items()}
ok([len(S[s]) for s in 'ABCD']==[7,80,40,6],'sizes')
ok(sum(map(kept,S['A']))==6 and sum(map(kept,S['B']))==67 and sum(map(kept,S['C']))==31 and sum(map(kept,S['D']))==4,'kept')
ok(sum(map(one,S['B']))==51 and sum(map(one,S['A']))==4,'first-ask')
allu=[u for s in 'ABCD' for u in S[s]]
ok(len(set(allu))==len(allu)==133,'disjoint 133')
ok(sum(1 for u in allu if not one(u))==53 and sum(1 for u in allu if not one(u) and kept(u))==28,'53/28')
ok(sum(len(K['ask'][u]) for u in allu)==217 and not any(x['err'] for u in allu for x in K['ask'][u]),'217 no errors')
for n in('6 of 7','67 of 80','83.8 %','63.8 %','28 turned','80, ask 2 for 22, ask 3 for 6, and not at all for 25','held','refuted','cannot be opened' if False else 'could not be opened'):
    ok(n in txt,'page lacks '+n)
ok('<script' not in page,'script')
print('FAIL' if f else 'PASS',len(f)); [print(' -',x) for x in f]; sys.exit(1 if f else 0)
