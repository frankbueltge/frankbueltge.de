#!/usr/bin/env python3
"""analysis.py (run from repo root) -> results.json. No randomness; reads keep.json only."""
import json,math,statistics,datetime
K=json.load(open('window/cycle-004-session-3/keep.json'))
t0=datetime.datetime.strptime(K['started'],'%Y-%m-%dT%H:%M:%SZ')
def wilson(k,n,z=1.96):
    if n==0: return None
    p=k/n; d=1+z*z/n; c=(p+z*z/(2*n))/d; h=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d
    return [round(100*(c-h),1),round(100*(c+h),1)]
def final(u):
    a=K['ask'][u]
    for x in a:
        if x['snap']: return x
    return a[-1]
out={'started':K['started'],'finished':K['finished'],'sets':{}}
allq=0;allerr=0;flips=0;empties=0
for s,d in K['sets'].items():
    U=d['urls']; kept=[u for u in U if final(u)['snap']]
    errs=[u for u in U if final(u)['err'] and not final(u)['snap']]
    flip=[u for u in U if K['ask'][u][0]['snap'] is None and final(u)['snap']]
    first_empty=[u for u in U if K['ask'][u][0]['snap'] is None]
    ages=[]; non200=0
    for u in kept:
        sn=final(u)['snap']; ts=datetime.datetime.strptime(sn['timestamp'],'%Y%m%d%H%M%S')
        ages.append((t0-ts).days)
        if sn.get('status')!='200': non200+=1
    out['sets'][s]={'n':len(U),'kept':len(kept),'ci':wilson(len(kept),len(U)),'errors_after_retries':len(errs),
      'first_answer_empty':len(first_empty),'flipped_on_reask':len(flip),
      'age_days_median':statistics.median(ages) if ages else None,'age_days_min':min(ages) if ages else None,'age_days_max':max(ages) if ages else None,
      'snapshot_status_not_200':non200,
      'detail':[{'url':u,'kept':bool(final(u)['snap']),'tries':len(K['ask'][u]),'err':final(u)['err'],
                 'snap':(final(u)['snap'] or {}).get('timestamp'),'snap_status':(final(u)['snap'] or {}).get('status')} for u in U]}
    for u in U:
        for x in K['ask'][u]:
            allq+=1; allerr+= 1 if x['err'] else 0
out['queries']=allq;out['query_errors']=allerr;out['error_rate']=round(allerr/allq,3)
json.dump(out,open('window/cycle-004-session-3/results.json','w'),indent=0)
for s,v in out['sets'].items(): print(s,{k:v[k] for k in v if k!='detail'})
print('queries',allq,'errors',allerr)
