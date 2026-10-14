#!/usr/bin/env python3
"""The Stand-In. What can the record of warned tornadoes say about the deaths a warning prevented?

Step 1 (once, needs the public SPC file):  python3 -I build.py extract <spc.csv>
   writes paths.tsv: per tornado 2008-2023, its track length, width and local (CST) time.
Step 2:                                     python3 -I build.py <tornadoes.tsv>
   checks both inputs against their pinned hashes, reproduces the Field's counts, and for every
   set of recorded covariates estimates the lives saved under the stand-in assumption (an
   unwarned tornado alike in those covariates shows what a warned one would have done), with a
   stratified bootstrap interval; writes results.json and index.html (from template.html)."""
import csv, hashlib, json, math, os, random, sys
here = os.path.dirname(os.path.abspath(__file__))
S = json.load(open(os.path.join(here, 'sources.json')))
sha = lambda f: hashlib.sha256(open(f, 'rb').read()).hexdigest()

if sys.argv[1] == 'extract':
    f = sys.argv[2]; assert sha(f) == S['spc']['sha256'], 'spc hash'
    with open(os.path.join(here, 'paths.tsv'), 'w') as o:
        o.write('om\tyr\tslat\tlen_mi\twid_yd\ttime_cst\n')
        for r in csv.DictReader(open(f)):
            if int(r['yr']) >= 2008 and r['sg'] in ('1', '-9'):
                assert r['tz'] == '3'
                o.write('\t'.join([r['om'], r['yr'], r['slat'], r['len'], r['wid'], r['time']]) + '\n')
    sys.exit(0)

f = sys.argv[1]; assert sha(f) == S['field']['sha256'], 'field hash'
P = os.path.join(here, 'paths.tsv'); assert sha(P) == S['paths']['sha256'], 'paths hash'
paths = {}
for r in csv.DictReader(open(P), delimiter='\t'): paths.setdefault((r['om'], r['yr']), []).append(r)
REGION = {}
for reg, sts in {'Northeast': 'CT ME MA NH RI VT NJ NY PA', 'Midwest': 'IL IN MI OH WI IA KS MN MO NE ND SD',
                 'South': 'DE FL GA MD NC SC VA DC WV AL KY MS TN AR LA OK TX PR VI',
                 'West': 'AZ CO ID MT NV NM UT WY AK CA HI OR WA'}.items():
    for s in sts.split(): REGION[s] = reg
T = []
for t in csv.DictReader(open(f), delimiter='\t'):
    c = [x for x in paths[(t['om'], t['yr'])] if abs(float(x['slat']) - float(t['slat'])) < 0.02]
    assert c, t['om']; x = c[0]; h = int(x['time_cst'][:2]); yr = int(t['yr'])
    T.append(dict(w=t['lead_registered'] != '', mag=int(t['mag']), fat=int(t['fat']), inj=int(t['inj']),
                  area=float(x['len_mi']) * float(x['wid_yd']) / 1760, night=h >= 20 or h < 6,
                  era='2008-11' if yr <= 2011 else '2012-16' if yr <= 2016 else '2017-23', region=REGION[t['st']]))
n = len(T); assert n == 19631
# the Field's numbers, reproduced (results.json of field@ae9c40d, rules.registered)
K = [t for t in T if t['fat'] > 0]
cells = dict(warned_harm=sum(t['w'] for t in K), unwarned_harm=sum(not t['w'] for t in K),
             warned_no_harm=sum(t['w'] for t in T if t['fat'] == 0), unwarned_no_harm=sum(not t['w'] for t in T if t['fat'] == 0))
assert cells == dict(warned_harm=227, unwarned_harm=87, warned_no_harm=10315, unwarned_no_harm=9002), cells
D = {o: sum(t[o] for t in T) for o in ('fat', 'inj')}; DW = {o: sum(t[o] for t in T if t['w']) for o in ('fat', 'inj')}
assert (D['fat'], DW['fat'], D['inj'], DW['inj']) == (1347, 1148, 15842, 12624)
cuts = sorted(t['area'] for t in T); cuts = [cuts[n // 3], cuts[2 * n // 3]]
for t in T: t['size'] = 'small' if t['area'] <= cuts[0] else 'middle' if t['area'] <= cuts[1] else 'large'
COV = ['size', 'era', 'night', 'region']
LAB = {'size': 'track area (thirds)', 'era': 'era', 'night': 'night (20-06 CST)', 'region': 'census region'}

def binom(k, p, rnd):  # number of successes in k trials, by geometric skips; O(successes)
    if p <= 0: return 0
    if p >= 1: return k
    lq, i, s = math.log1p(-p), -1, 0
    while True:
        i += int(math.log(1.0 - rnd.random()) / lq) + 1
        if i >= k: return s
        s += 1

def resum(g, rnd):  # bootstrap sum of a group: g = (size, nonzero values)
    k, v = g
    if not v: return 0
    return sum(v[rnd.randrange(len(v))] for _ in range(binom(k, len(v) / k, rnd)))

def run(cov, out, B=2000):
    strata = {}
    for t in T:
        key = (t['mag'],) + tuple(t[c] for c in cov)
        s = strata.setdefault(key, {'W': [0, []], 'U': [0, []]})
        g = s['W' if t['w'] else 'U']; g[0] += 1
        if t[out]: g[1].append(t[out])
    rows, est, orphan, orphan_n = [], 0.0, 0, 0
    for key in sorted(strata, key=str):
        s = strata[key]; nW, nU = s['W'][0], s['U'][0]; dW, dU = sum(s['W'][1]), sum(s['U'][1])
        row = dict(key=list(key), nW=nW, dW=dW, nU=nU, dU=dU)
        if nW and not nU: orphan += dW; orphan_n += nW; row['saved'] = None
        elif nW: row['saved'] = nW * dU / nU - dW; est += row['saved']
        else: row['saved'] = 0.0
        rows.append(row)
    rnd = random.Random(20261014); bs = []
    live = [s for s in strata.values() if s['W'][0] and s['U'][0]]
    for _ in range(B):
        bs.append(sum(s['W'][0] * resum(s['U'], rnd) / s['U'][0] - resum(s['W'], rnd) for s in live))
    bs.sort()
    return dict(cov=cov, out=out, est=round(est, 1), lo=round(bs[int(.025 * B)], 1), hi=round(bs[int(.975 * B) - 1], 1),
                p_neg=round(sum(b < 0 for b in bs) / B, 4), q=[round(bs[int((i + .5) * B / 100)], 1) for i in range(100)], strata=len(strata), orphan=orphan, orphan_n=orphan_n,
                total_warned=DW[out], rows=rows)

combos = [[c for i, c in enumerate(COV) if m >> i & 1] for m in range(16)]
R = [run(c, o) for o in ('fat', 'inj') for c in combos]
for r in R: print(f"{r['out']} rating+{'+'.join(r['cov']) or '-':28s} saved {r['est']:8.1f} [{r['lo']:8.1f}, {r['hi']:8.1f}] "
                  f"P(<0)={r['p_neg']:.3f}  strata {r['strata']:3d}  no stand-in {r['orphan']} ({r['orphan_n']} tornadoes)")
fat = [r for r in R if r['out'] == 'fat']
summary = dict(n=n, cells=cells, deaths=D['fat'], deaths_warned=DW['fat'], injuries=D['inj'], injuries_warned=DW['inj'],
               area_cuts_sqmi=[round(c, 4) for c in cuts], combos=16,
               fat_all_negative=sum(r['est'] < 0 for r in fat), fat_ci_below_zero=sum(r['hi'] < 0 for r in fat),
               fat_est_range=[min(r['est'] for r in fat), max(r['est'] for r in fat)],
               fat_hi_range=[min(r['hi'] for r in fat), max(r['hi'] for r in fat)], fat_lo_range=[min(r['lo'] for r in fat), max(r['lo'] for r in fat)],
               fat_orphan_rating_only=fat[0]['orphan'], fat_pneg_range=[min(r['p_neg'] for r in fat), max(r['p_neg'] for r in fat)],
               inj_all_negative=sum(r['est'] < 0 for r in R if r['out'] == 'inj'),
               inj_ci_below_zero=sum(r['hi'] < 0 for r in R if r['out'] == 'inj'))
print(json.dumps(summary))
res = dict(summary=summary, labels=LAB, runs=R, method='stratified bootstrap, 2000 draws per set, seed 20261014; '
           'strata = EF rating x the chosen covariates; a stratum with warned tornadoes and no unwarned one has no stand-in')
json.dump(res, open(os.path.join(here, 'results.json'), 'w'), indent=1)
tpl = open(os.path.join(here, 'template.html')).read()
slim = dict(summary=summary, labels=LAB, runs=R)
open(os.path.join(here, 'index.html'), 'w').write(tpl.replace('/*DATA*/null', json.dumps(slim, separators=(',', ':'))))
print('wrote results.json and index.html')
