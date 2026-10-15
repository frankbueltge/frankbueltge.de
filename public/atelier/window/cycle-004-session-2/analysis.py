#!/usr/bin/env python3
"""analysis.py -> results.json. Reads session 1's rows.json and the three pass files; no randomness."""
import json,collections,math,urllib.parse,sys
S1='window/cycle-004-session-1/'; S2='window/cycle-004-session-2/'
rows=json.load(open(S1+'rows.json'))
p={k:{r['url']:r for r in json.load(open(f))['results']} for k,f in (('p1',S1+'pass1.json'),('p2',S1+'pass2.json'),('p3',S2+'pass3.json'))}
at={k:json.load(open(f))['at'] for k,f in (('p1',S1+'pass1.json'),('p2',S1+'pass2.json'),('p3',S2+'pass3.json'))}
def cls(r):  # identical rule to session 1 analysis.py
    s=r['status']
    if s is None: return 'silent'
    if 200<=s<300 and not r['moved_domain']: return 'answers'
    if 200<=s<300: return 'answers-elsewhere'
    if s==403: return 'refused'
    if s in (404,410): return 'gone'
    return 'other'
ok=lambda c:c.startswith('answers')
for r in rows: r['c3']=cls(p['p3'][r['url']])
def wilson(k,n,z=1.96):
    pp=k/n; d=1+z*z/n; c=(pp+z*z/(2*n))/d; h=z*math.sqrt(pp*(1-pp)/n+z*z/(4*n*n))/d
    return round(100*(c-h),1),round(100*(c+h),1)
out={'passes_at':at,'urls':len(rows)}
out['classes_pass3']=dict(collections.Counter(r['c3'] for r in rows))
L=[r for r in rows if r['group']=='own' and r['c1'] in('gone','silent') and r['c2'] in('gone','silent')]
out['hard_losses']={'n':len(L),'still_fail_p3':sum(1 for r in L if not ok(r['c3'])),
  'answer_p3':[{'url':r['url'],'c3':r['c3'],'status3':p['p3'][r['url']]['status'],'final':p['p3'][r['url']]['final']} for r in L if ok(r['c3'])],
  'classes_p3':dict(collections.Counter(r['c3'] for r in L))}
B=[r for r in rows if r['group']!='rhizome' and ok(r['c1']) and ok(r['c2'])]
k=sum(1 for r in B if ok(r['c3'])); out['both_then_third']={'n':len(B),'k':k,'ci':wilson(k,len(B)),
  'fell':[{'url':r['url'],'c3':r['c3'],'status3':p['p3'][r['url']]['status']} for r in B if not ok(r['c3'])]}
Rz=[r for r in rows if r['group']=='rhizome']
out['rhizome']={'n':len(Rz),'refuse_p3':sum(1 for r in Rz if r['c3']=='refused'),'classes_p3':dict(collections.Counter(r['c3'] for r in Rz))}
ch23=[{'url':r['url'],'c2':r['c2'],'c3':r['c3']} for r in rows if r['c2']!=r['c3']]
ch12=[r for r in rows if r['c1']!=r['c2']]
out['changes_p2_p3']={'n':len(ch23),'items':ch23}; out['changes_p1_p2']=len(ch12)
out['never_answered_p3_after_answer']=sum(1 for r in rows if ok(r['c1']) and ok(r['c2']) and not ok(r['c3']))
out['unmeasured_refused_own_both_before']=[
  {'url':r['url'],'c3':r['c3']} for r in rows if r['group']=='own' and r['c1']=='refused' and r['c2']=='refused']
H=json.load(open(S2+'hosts.json'))['hosts']
out['hosts']={'n':len(H),'distinct_hosts':len({h['host'] for h in H}),
  'no_dns':[h['host'] for h in H if not h['dns']],
  'root_2xx':[h['host'] for h in H if h.get('root_status') and 200<=h['root_status']<300],
  'root_fail_dns_ok':[h['host'] for h in H if h['dns'] and not (h.get('root_status') and 200<=h['root_status']<300)]}
json.dump(out,open(S2+'results.json','w'),indent=1)
print(json.dumps({k:v for k,v in out.items() if k not in('unmeasured_refused_own_both_before',)},indent=1))
