#!/usr/bin/env python3
"""analysis.py: data.json -> results.json. Rule (derived in check.py and tested by simulation):
n distinct record-years in a span S=last-first; one-sided 95 % upper limit for the end of the
range = last + S*(0.05**(-1/(n-1)) - 1)  (needs n>=3 distinct years; S>0)."""
import json
D=json.load(open('data.json'))['species']
def ylist(h): return sorted(int(y) for y in (h or {}) if y.isdigit())
def upper(ys,alpha=0.05):
    n=len(ys)
    if n<3: return None
    S=ys[-1]-ys[0]
    return ys[-1]+S*(alpha**(-1/(n-1))-1)
R={"species":{}}
for k,v in D.items():
    ya,yh=ylist(v['all']),ylist(v['human'])
    late=v['late'] or {}
    R['species'][k]={"name":v['name'],"total":v['total'],"errors":bool(v['errors']),
      "n_years":len(ya),"first":ya[0] if ya else None,"last":ya[-1] if ya else None,
      "late_total":v['late_total'],"late_basis":late,
      "human_last":yh[-1] if yh else None,"human_after1990":sum(c for y,c in (v['human'] or {}).items() if y.isdigit() and int(y)>=1990),
      "upper_all":upper(ya),"upper_human":upper(yh)}
S=R['species'].values(); ok=[s for s in S if not s['errors']]
late_any=[s for s in ok if (s['late_total'] or 0)>0]
basis={}
for s in ok:
    for b,c in s['late_basis'].items(): basis[b]=basis.get(b,0)+c
n4=[s for s in ok if s['n_years']>=4]
R['summary']={"asked":len(R['species']),"answered_clean":len(ok),
 "with_record_with_year":sum(1 for s in ok if s['n_years']>0),
 "late_any":len(late_any),"late_basis":basis,"late_total":sum(basis.values()),
 "human_after1990_species":sum(1 for s in ok if s['human_after1990']>0),
 "n4":len(n4),"n4_gap_gt10":sum(1 for s in n4 if s['upper_all'] is not None and s['upper_all']-s['last']>10),
 "reach_2026_all":sorted(s['name'] for s in ok if s['upper_all'] is not None and s['upper_all']>=2026),
 "reach_2026_human":sorted(s['name'] for s in ok if s['upper_human'] is not None and s['upper_human']>=2026)}
json.dump(R,open('results.json','w'),indent=1)
print(json.dumps(R['summary'],indent=1))
# --- post-hoc split, declared as post hoc: the 13 species with >=1000 records dated 1950+ (a gap in the sorted counts: 3,625 -> 549)
big=[s for s in ok if (s['late_total'] or 0)>=1000]; rest=[s for s in ok if (s['late_total'] or 0)<1000]
def sub(L):
    b={}
    for s in L:
        for k,c in s['late_basis'].items(): b[k]=b.get(k,0)+c
    n4=[s for s in L if s['n_years']>=4]
    return {"species":len(L),"late_any":sum(1 for s in L if (s['late_total'] or 0)>0),"late_basis":b,"late_total":sum(b.values()),
     "human_after1990_species":sum(1 for s in L if s['human_after1990']>0),
     "n4":len(n4),"n4_gap_gt10":sum(1 for s in n4 if s['upper_all']-s['last']>10),
     "reach_all":sum(1 for s in L if s['upper_all'] and s['upper_all']>=2026),
     "reach_human":sum(1 for s in L if s['upper_human'] and s['upper_human']>=2026),
     "reach_differs":len({s['name'] for s in L if s['upper_all'] and s['upper_all']>=2026}^{s['name'] for s in L if s['upper_human'] and s['upper_human']>=2026})}
R['split']={"threshold":1000,"big_names":sorted(s['name'] for s in big),"big":sub(big),"rest":sub(rest)}
json.dump(R,open('results.json','w'),indent=1)
print(json.dumps(R['split']['rest'],indent=1)); print(R['split']['big']['species'],R['split']['big']['late_total'])
