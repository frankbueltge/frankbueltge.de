#!/usr/bin/env python3
"""analysis.py <werke.json> pass1.json pass2.json -> results.json. Wilson 95 % intervals; no randomness."""
import json,sys,re,math,collections,urllib.parse
W,P1,P2=sys.argv[1:4]
ents=json.load(open(W))['entries']
p1={r['url']:r for r in json.load(open(P1))['results']}
p2={r['url']:r for r in json.load(open(P2))['results']}
RECORD={'ars.electronica.art','dataphys.org'}
def host(u): return urllib.parse.urlparse(u).netloc
def group(u):
    h=host(u)
    if h=='artbase.rhizome.org': return 'rhizome'
    if h in RECORD: return 'record'
    return 'own'
def cls(r):
    s=r['status']
    if s is None: return 'silent'
    if 200<=s<300 and not r['moved_domain']: return 'answers'
    if 200<=s<300: return 'answers-elsewhere'
    if s==403: return 'refused'
    if s in (404,410): return 'gone'
    return 'other'
def wilson(k,n,z=1.96):
    if n==0: return (None,None)
    p=k/n; d=1+z*z/n; c=(p+z*z/(2*n))/d; h=z*math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d
    return (round(100*(c-h),1),round(100*(c+h),1))
def year(e):
    m=re.fullmatch(r'\s*(\d{4})\s*',str(e.get('year','')))
    return int(m.group(1)) if m else None
# one row per distinct url; the earliest-listed entry gives the year, entries sharing a url are counted
rows={}
for e in ents:
    u=e.get('source_url')
    if not u: continue
    rows.setdefault(u,{'url':u,'years':[],'n_entries':0})
    rows[u]['n_entries']+=1; rows[u]['years'].append(year(e))
for u,r in rows.items():
    r['group']=group(u); r['c1']=cls(p1[u]); r['c2']=cls(p2[u])
    ys=[y for y in r['years'] if y]; r['year']=min(ys) if ys else None
    r['both_answer']=r['c1'].startswith('answers') and r['c2'].startswith('answers')
R=list(rows.values())
def stat(rs,key='both_answer'):
    n=len(rs); k=sum(1 for r in rs if r[key]); lo,hi=wilson(k,n)
    return {'n':n,'k':k,'pct':round(100*k/n,1) if n else None,'lo':lo,'hi':hi}
out={'urls':len(R),'entries':sum(r['n_entries'] for r in R)}
out['classes_pass1']=dict(collections.Counter(r['c1'] for r in R))
out['classes_pass2']=dict(collections.Counter(r['c2'] for r in R))
out['by_group']={g:{**stat([r for r in R if r['group']==g]),
    'pass1':dict(collections.Counter(r['c1'] for r in R if r['group']==g))} for g in ('rhizome','record','own')}
out['measurable']=stat([r for r in R if r['group']!='rhizome'])
out['all_urls_both_answer']=stat(R)
out['flips']=[{'url':r['url'],'c1':r['c1'],'c2':r['c2']} for r in R if r['c1']!=r['c2']]
out['moved_domain_pass1']=sum(1 for r in R if p1[r['url']]['moved_domain'])
out['moved_domain_pass2']=sum(1 for r in R if p2[r['url']]['moved_domain'])
own=[r for r in R if r['group']=='own']
def era(r):
    y=r['year']
    if y is None: return 'undated'
    return '2001-2010' if 2001<=y<=2010 else '2011-2019' if 2011<=y<=2019 else '2020-2026' if 2020<=y<=2026 else 'other'
out['own_by_era']={e:stat([r for r in own if era(r)==e]) for e in ('2001-2010','2011-2019','2020-2026','undated','other')}
out['own_not_answering']=[{'url':r['url'],'year':r['year'],'c1':r['c1'],'c2':r['c2']} for r in own if not r['both_answer']]
a=out['own_by_era']['2001-2010']; b=out['own_by_era']['2020-2026']
out['era_gap_points']=round(b['pct']-a['pct'],1) if a['n'] and b['n'] else None
g=out['by_group']; out['record_minus_own_points']=round(g['record']['pct']-g['own']['pct'],1)
out['share_moved_domain_pass2_pct']=round(100*out['moved_domain_pass2']/len(R),1)
hard=lambda r: r['c1'] in ('gone','silent') and r['c2'] in ('gone','silent')
for r in R: r['hard_loss']=hard(r)
out['own_hard_loss']=stat(own,'hard_loss')
out['own_hard_loss_gone']=sum(1 for r in own if r['c1']=='gone' and r['c2']=='gone')
out['own_hard_loss_silent']=sum(1 for r in own if r['c1']=='silent' and r['c2']=='silent')
out['own_refused_both']=sum(1 for r in own if r['c1']=='refused' and r['c2']=='refused')
out['own_hard_loss_by_era']={e:stat([r for r in own if era(r)==e],'hard_loss') for e in ('2011-2019','2020-2026','undated')}
json.dump(out,open('results.json','w'),indent=1)
json.dump(R,open('rows.json','w'))
print(json.dumps({k:out[k] for k in ('urls','by_group','measurable','all_urls_both_answer','own_by_era','era_gap_points','record_minus_own_points','share_moved_domain_pass2_pct')},indent=1)); print(len(out['flips']),'flips')
