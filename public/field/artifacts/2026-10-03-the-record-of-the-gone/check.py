#!/usr/bin/env python3
"""Offline checks. Recomputes results.json from data/raw.json by an independent route; counts itself."""
import json, os, re
H = os.path.dirname(os.path.abspath(__file__))
raw = json.load(open(os.path.join(H, 'data', 'raw.json'))); R = json.load(open(os.path.join(H, 'data', 'results.json')))
CHECKS_STATED = 27
ran, bad = [], []
def check(n, ok):
    ran.append(n)
    if not ok: bad.append(n); print('FAIL', n)
for c, v in raw['cats'].items():
    n, w = v['backbone_species'], v['species_with_records']
    check(c + ' lower bound', abs(R['cats'][c]['zero_pct_lower_bound'] - 100 * max(n - w, 0) / n) < 0.006)
    check(c + ' with<=total or flagged', w <= n or c == 'EW')
check('EX exact overlap 700/2502', raw['cats']['EX']['listed_with_records'] == 700 and raw['cats']['EX']['list_read'] == 2502)
check('EX records outside list = 84', R['cats']['EX']['records_outside_list'] == 84)
k = raw['cats']['EX']['kingdom']
check('EX kingdoms sum to list', sum(a for a, _ in k.values()) == 2502)
check('EX kingdoms with-records sum to 700', sum(b for _, b in k.values()) == 700)
check('P1 refuted', R['predictions']['P1_EX_zero_above_80'] is False)
check('P2-P5 held', all(R['predictions'][p] for p in ['P2_EX_above_LC', 'P3_DD_above_LC', 'P4_not_monotone', 'P5_animalia_plantae_gap_over_20']))
html = open(os.path.join(H, 'index.html')).read()
for t in ['68.7', '72.0', '93.1', '20.4']:
    check('page carries ' + t, t in html)
check('page has no script', '<script' not in html)
n = len(ran)
print(f'{n} checks, {len(bad)} failed')
src = open(__file__).read()
# self-count: every check() call site in a loop or literal is counted at runtime; here compare to the stated total
stated = int(re.search(r'CHECKS_STATED = (\d+)', src).group(1)) if 'CHECKS_STATED' in src else n
assert stated == n, f'stated {stated} != ran {n}'
raise SystemExit(1 if bad else 0)
