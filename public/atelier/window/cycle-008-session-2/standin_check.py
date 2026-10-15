#!/usr/bin/env python3
"""Check of the Field's counter-finding (ho-2026-10-14-field-7) against The Stand-In
(window/cycle-007-convening-4/). Claim checked: the stand-ins' negative sign belongs to the pooled
count and turns when the deadliest warned tornadoes are removed.
Run: python3 -I standin_check.py <tornadoes.tsv of field@ae9c40d>  -> standin_check.json
Point estimates only (the bootstrap of The Stand-In is not repeated); same strata, same rule."""
import csv, hashlib, json, os, sys
here = os.path.dirname(os.path.abspath(__file__)); prev = os.path.join(here, '..', 'cycle-007-convening-4')
S = json.load(open(os.path.join(prev, 'sources.json')))
sha = lambda f: hashlib.sha256(open(f, 'rb').read()).hexdigest()
f = sys.argv[1]; assert sha(f) == S['field']['sha256']
P = os.path.join(prev, 'paths.tsv'); assert sha(P) == S['paths']['sha256']
paths = {}
for r in csv.DictReader(open(P), delimiter='\t'): paths.setdefault((r['om'], r['yr']), []).append(r)
REGION = {}
for reg, sts in {'Northeast': 'CT ME MA NH RI VT NJ NY PA', 'Midwest': 'IL IN MI OH WI IA KS MN MO NE ND SD',
                 'South': 'DE FL GA MD NC SC VA DC WV AL KY MS TN AR LA OK TX PR VI',
                 'West': 'AZ CO ID MT NV NM UT WY AK CA HI OR WA'}.items():
    for s in sts.split(): REGION[s] = reg
T = []
for t in csv.DictReader(open(f), delimiter='\t'):
    x = [x for x in paths[(t['om'], t['yr'])] if abs(float(x['slat']) - float(t['slat'])) < 0.02][0]
    h = int(x['time_cst'][:2]); yr = int(t['yr'])
    T.append(dict(w=t['lead_registered'] != '', mag=int(t['mag']), fat=int(t['fat']),
                  area=float(x['len_mi']) * float(x['wid_yd']) / 1760, night=h >= 20 or h < 6,
                  era='2008-11' if yr <= 2011 else '2012-16' if yr <= 2016 else '2017-23', region=REGION[t['st']]))
assert len(T) == 19631
cuts = sorted(t['area'] for t in T); n = len(T); cuts = [cuts[n // 3], cuts[2 * n // 3]]
for t in T: t['size'] = 'small' if t['area'] <= cuts[0] else 'middle' if t['area'] <= cuts[1] else 'large'
COV = ['size', 'era', 'night', 'region']; combos = [[c for i, c in enumerate(COV) if m >> i & 1] for m in range(16)]
def est(TT, cov):
    st = {}
    for t in TT:
        s = st.setdefault((t['mag'],) + tuple(t[c] for c in cov), [0, 0, 0, 0]); i = 0 if t['w'] else 2
        s[i] += 1; s[i + 1] += t['fat']
    return sum(nW * dU / nU - dW for nW, dW, nU, dU in st.values() if nW and nU)
ref = [round(est(T, c), 1) for c in combos]
R = json.load(open(os.path.join(prev, 'results.json')))['runs']
assert ref == [r['est'] for r in R if r['out'] == 'fat'], 'reproduces The Stand-In'
order = sorted(range(n), key=lambda i: -T[i]['fat'])
top = [T[i] for i in order[:12]]
rows = []
for k in range(0, 13):
    drop = set(order[:k]); TT = [t for i, t in enumerate(T) if i not in drop]
    e = [est(TT, c) for c in combos]
    rows.append(dict(k=k, deaths_removed=sum(T[i]['fat'] for i in order[:k]), warned_removed=sum(T[i]['w'] for i in order[:k]),
                     negative=sum(x < 0 for x in e), lo=round(min(e), 1), hi=round(max(e), 1)))
    print(rows[-1])
out = dict(reproduced=True, top12=[dict(fat=t['fat'], warned=t['w'], mag=t['mag']) for t in top], by_removed=rows)
json.dump(out, open(os.path.join(here, 'standin_check.json'), 'w'), indent=1)
