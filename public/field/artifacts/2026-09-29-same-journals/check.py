#!/usr/bin/env python3
"""Offline checks for 'Same journals, two years' (session 174). No network.

Recomputes every headline number from the per-journal counts in data/, and proves at the
end that it ran as many checks as it says.
"""
import json
import os
import random
import re
import sys

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
R = json.load(open(os.path.join(D, 'results.json')))
M = json.load(open(os.path.join(D, 'panel-manifest.json')))
PJ = R['per_journal']
YEARS = ('2021', '2025', '2026')
ran, failed = [], []


def check(name, ok):
    ran.append(name)
    if not ok:
        failed.append(name)
        print('FAIL', name)


def pooled(js, y, k='con'):
    t = sum(PJ[j][y]['tok'] for j in js)
    return 100 * sum(PJ[j][y][k] for j in js) / t if t else float('nan')


J = sorted(PJ)
check('qualifying count equals journals listed', R['qualifying'] == len(J))
check('K1 recomputed', R['K1_fired'] == (len(J) < 30))
check('every journal has >= 10 abstracts in 2021 and 2026',
      all(PJ[j][y]['docs'] >= 10 for j in J for y in ('2021', '2026')))
check('no journal has more than 25 abstracts in a year', all(PJ[j][y]['docs'] <= 25 for j in J for y in YEARS))
for y in YEARS:
    check(f'C {y} recomputed', abs(round(pooled(J, y), 2) - R['C'][y]) < 0.006)
    check(f'S {y} recomputed', abs(round(pooled(J, y, 'rec'), 2) - R['S'][y]) < 0.006)
    check(f'documents {y} summed', sum(PJ[j][y]['docs'] for j in J) == R['docs'][y])
    check(f'manifest {y} matches counts', all(len(M['docs'][j].get(y, [])) == PJ[j][y]['docs'] for j in J))
    check(f'agreeing <= recomputable <= tokens {y}',
          all(PJ[j][y]['con'] <= PJ[j][y]['rec'] <= PJ[j][y]['tok'] for j in J))
check('K2 recomputed', R['K2_fired'] == (abs(R['C']['2021'] - 2.92) > 3))
W = pooled(J, '2026') - pooled(J, '2021')
check('W recomputed', abs(round(W, 2) - R['W']) < 0.006)
rng = random.Random(R['seed'])
b = []
for _ in range(R['draws']):
    s = [J[rng.randrange(len(J))] for _ in J]
    b.append(pooled(s, '2026') - pooled(s, '2021'))
b.sort()
lo, hi = round(b[int(0.025 * len(b))], 2), round(b[min(len(b) - 1, int(0.975 * len(b)))], 2)
check('W interval reproduced from seed', [lo, hi] == R['W_ci95'])
both = [j for j in J if PJ[j]['2021']['tok'] >= 5 and PJ[j]['2026']['tok'] >= 5]
r = {y: {j: PJ[j][y]['con'] / PJ[j][y]['tok'] for j in both} for y in ('2021', '2026')}
rose = sum(r['2026'][j] > r['2021'][j] for j in both)
fell = sum(r['2026'][j] < r['2021'][j] for j in both)
check('Wj journals', R['Wj']['journals'] == len(both))
check('Wj rose', R['Wj']['rose'] == rose)
check('Wj fell', R['Wj']['fell'] == fell)
dec = R.get('decomposition')
if dec:
    F = {y: {j: PJ[j][f'frame{y[2:]}_tok'] for j in J} for y in ('2021', '2026')}
    T = {y: sum(F[y].values()) for y in F}
    check('frame token totals match', all(T[y] == R['frames'][y]['in_t'] for y in T))
    w = {y: {j: F[y][j] / T[y] for j in J} for y in F}
    rr = {y: {j: (100 * PJ[j][y]['con'] / PJ[j][y]['tok'] if PJ[j][y]['tok'] else 0.0) for j in J} for y in F}
    comp = sum((w['2026'][j] - w['2021'][j]) * (rr['2021'][j] + rr['2026'][j]) / 2 for j in J)
    rate = sum((rr['2026'][j] - rr['2021'][j]) * (w['2021'][j] + w['2026'][j]) / 2 for j in J)
    check('composition part recomputed', abs(round(comp, 2) - dec['composition']) < 0.006)
    check('rate part recomputed', abs(round(rate, 2) - dec['rate']) < 0.006)
    fc = {y: 100 * sum(PJ[j][f'frame{y[2:]}_con'] for j in J) / T[y] for y in F}
    check('frame C in panel journals recomputed',
          all(abs(round(fc[y], 2) - R['frames'][y]['C_panel_journals_only']) < 0.006 for y in F))
    check('residual recomputed', abs(round(fc['2026'] - fc['2021'] - comp - rate, 2) - dec['residual_gap_minus_parts']) < 0.011)
    share = 100 * comp / (comp + rate)
else:
    share = None
P = R['predictions_held']
check('P1 recomputed', P['P1'] == (W > 0))
check('P2 recomputed', P['P2'] == (W < 6.94 - 2.92))
check('P3 recomputed', P['P3'] == (lo > 0 or hi < 0))
a, c = sorted([R['C']['2021'], R['C']['2026']])
check('P4 recomputed', P['P4'] == (a < R['C']['2025'] < c))
check('P5 recomputed', P['P5'] == (bool(both) and rose / len(both) > 0.5))
check('P6 recomputed', P['P6'] == (share is not None and round(share, 1) >= 50))
hexd = re.compile(r'^[0-9a-f]{64}$')
check('every digest is a SHA-256', all(hexd.match(d['sha256']) for j in M['docs'] for y in M['docs'][j] for d in M['docs'][j][y]))
check('no PMID twice within a journal-year',
      all(len({d['id'] for d in v}) == len(v) for j in M['docs'] for v in M['docs'][j].values()))
blob = ''.join(open(os.path.join(D, f)).read() for f in os.listdir(D))
check('no abstract text in data/', '"text"' not in blob)
EXPECTED = 40 if dec else 35
check('this suite ran the number of checks it declares', len(ran) + 1 == EXPECTED)
print(f'{len(ran)} checks, {len(failed)} failed')
sys.exit(1 if failed else 0)
