#!/usr/bin/env python3
"""Two parts of one small number — session 175. Offline; reads 09-29's committed counts."""
import json, math, os, random, statistics

HERE = os.path.dirname(os.path.abspath(__file__))
S = os.path.join(HERE, '..', '2026-09-29-same-journals', 'data')
R = json.load(open(os.path.join(S, 'results.json')))
M = json.load(open(os.path.join(S, 'panel-manifest.json')))['candidates']
PJ = R['per_journal']
J = sorted(PJ)


def sums(js, y):
    return (sum(PJ[j][y]['tok'] for j in js), sum(PJ[j][y]['rec'] for j in js),
            sum(PJ[j][y]['con'] for j in js))


def parts(js):
    t0, r0, c0 = sums(js, '2021'); t1, r1, c1 = sums(js, '2026')
    A0, A1, G0, G1 = r0 / t0, r1 / t1, c0 / r0, c1 / r1
    return {'C21': 100 * c0 / t0, 'C26': 100 * c1 / t1, 'W': 100 * (c1 / t1 - c0 / t0),
            'A21': 100 * A0, 'A26': 100 * A1, 'G21': 100 * G0, 'G26': 100 * G1,
            'dlogA': math.log(A1 / A0), 'dlogG': math.log(G1 / G0),
            'dlogC': math.log((c1 / t1) / (c0 / t0))}


def boot(js, keys, n=2000, seed=20261002):
    rng = random.Random(seed); out = {k: [] for k in keys}
    for _ in range(n):
        p = parts([rng.choice(js) for _ in js])
        for k in keys: out[k].append(p[k])
    ci = {}
    for k, v in out.items():
        v.sort(); ci[k] = [round(v[int(.025 * n)], 4), round(v[int(.975 * n) - 1], 4)]
    return ci


full = parts(J)
assert round(full['C21'], 2) == R['C']['2021'] and round(full['C26'], 2) == R['C']['2026'], 'does not reproduce 09-29'
vol = {j: (M[j]['2021'] + M[j]['2026']) / 2 for j in J}
med = statistics.median(vol.values())
hi = [j for j in J if vol[j] > med]; lo = [j for j in J if vol[j] <= med]
keys = ['W', 'dlogA', 'dlogG', 'dlogC']
out = {'median_volume': med, 'full': full, 'full_ci': boot(J, keys)}
for name, js in (('high', hi), ('low', lo)):
    out[name] = {'journals': len(js), **parts(js), 'ci': boot(js, keys)}
f, h, l = full, out['high'], out['low']
fc = out['full_ci']
out['predictions'] = {
    'P1': (f['dlogA'] > 0) != (f['dlogG'] > 0),
    'P2': (h['W'] > 0) != (l['W'] > 0),
    'P3': any(not (fc[k][0] <= 0 <= fc[k][1]) for k in ('dlogA', 'dlogG')),
    'P4': any(not (x['ci']['W'][0] <= 0 <= x['ci']['W'][1]) for x in (h, l))}
json.dump(out, open(os.path.join(HERE, 'data', 'results.json'), 'w'), indent=1)
print(json.dumps(out, indent=1))
