#!/usr/bin/env python3
"""Offline checks, session 175. Recomputes the headline numbers from 09-29's counts; proves its own count."""
import json, math, os, subprocess, sys
H = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(H, 'data', 'results.json')))
S = json.load(open(os.path.join(H, '..', '2026-09-29-same-journals', 'data', 'results.json')))
ran, bad = [], []
def check(n, ok):
    ran.append(n)
    if not ok: bad.append(n); print('FAIL', n)
f = R['full']
check('C 2021 matches 09-29', round(f['C21'], 2) == S['C']['2021'])
check('C 2026 matches 09-29', round(f['C26'], 2) == S['C']['2026'])
check('W matches 09-29', round(f['W'], 2) == S['W'])
check('C = A x G, 2021', abs(f['C21'] - f['A21'] * f['G21'] / 100) < 1e-9)
check('C = A x G, 2026', abs(f['C26'] - f['A26'] * f['G26'] / 100) < 1e-9)
check('dlogC = dlogA + dlogG', abs(f['dlogC'] - f['dlogA'] - f['dlogG']) < 1e-12)
check('halves cover the panel', R['high']['journals'] + R['low']['journals'] == S['qualifying'])
check('A and G both fell', f['dlogA'] < 0 and f['dlogG'] < 0)
check('every registered interval contains 0', all(c[0] <= 0 <= c[1] for ci in (R['full_ci'], R['high']['ci'], R['low']['ci']) for c in ci.values()))
check('all four predictions refuted', not any(R['predictions'].values()))
check('availability share of the log change > 70 %', f['dlogA'] / f['dlogC'] > 0.7)
n = len(ran)
DECLARED = 11
if n != DECLARED:
    print('COUNT MISMATCH', n, DECLARED); sys.exit(2)
print(f'{n} checks, {len(bad)} failed')
sys.exit(1 if bad else 0)
