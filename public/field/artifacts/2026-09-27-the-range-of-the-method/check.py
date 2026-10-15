#!/usr/bin/env python3
"""Offline checks for session 172 (2026-09-27). No network, no raw corpus.

Every check is named, counted as it runs, and the total run is compared with the total
declared, so the suite cannot report checks it did not run (the 09-22 lesson).
"""
import itertools
import json
import os
import subprocess
import sys

ART = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(ART, '..', '..'))
TOOLS = os.path.join(ROOT, 'tools', 'range-of-the-method')
D = os.path.join(ART, 'data')
sys.path.insert(0, TOOLS)
import lattice as LT                                                 # noqa: E402

L = json.load(open(os.path.join(D, 'lattice.json')))
E = json.load(open(os.path.join(D, 'evaluation.json')))
ERR = json.load(open(os.path.join(D, 'errors.json')))
R = json.load(open(os.path.join(D, 'render-check.json')))
HTML = open(os.path.join(ART, 'index.html'), encoding='utf-8').read()
SK = ['window', 'conn', 'split', 'pairing', 'text']
BASE = L['base']
ran, failed = [], []


def check(name, cond):
    ran.append(name)
    if not cond:
        failed.append(name)
        print('FAIL', name)


def is_base(r, keys):
    return all(r[k] == BASE[k] for k in keys)


# lattice shape
combos = set(itertools.product(LT.WINDOWS, LT.CONNECTIVES, LT.SPLITS, LT.PAIRINGS, LT.TEXTS))
check('lattice has 300 screen rows', len(L['screens']) == 300)
check('screen rows are the registered product, once each',
      {tuple(r[k] for k in SK) for r in L['screens']} == combos)
check('lattice has 1,200 flag rows', len(L['flags']) == 1200)
check('flag rows are the product with four matchers, once each',
      {tuple(r[k] for k in SK + ['match']) for r in L['flags']} ==
      {c + (m,) for c in combos for m in LT.MATCHERS})

# K1, K2
b = next(r for r in L['screens'] if is_base(r, SK))
bf = next(r for r in L['flags'] if is_base(r, SK + ['match']))
check('K1: baseline M tokens 4,166 and recomputable 314', (b['M']['tokens'], b['M']['recomputable']) == (4166, 314))
check('K1: baseline M consistent 289, inconsistent 25', (bf['M']['consistent'], bf['M']['inconsistent']) == (289, 25))
check('K2: A has 998 digest-matched documents', L['audit']['A']['digest_matched'] == 998)
check('K2: A baseline 851 tokens, 27 recomputable', (b['A']['tokens'], b['A']['recomputable']) == (851, 27))
check('M: all 1,000 digests matched', L['audit']['M']['digest_matched'] == 1000)

# internal consistency
screens = {tuple(r[k] for k in SK): r for r in L['screens']}
check('every flag row partitions its recomputable tokens',
      all(sum(f[c][v] for v in ('consistent', 'complement', 'inconsistent')) ==
          screens[tuple(f[k] for k in SK)][c]['recomputable'] for f in L['flags'] for c in 'MAF'))
check('every rate equals recomputable / tokens',
      all(abs(r[c]['rate'] - round(100.0 * r[c]['recomputable'] / r[c]['tokens'], 4)) < 1e-9
          for r in L['screens'] for c in 'MAF'))
check('matching arithmetic never changes the screen',
      all(len({screens[tuple(f[k] for k in SK)][c]['recomputable'] for f in L['flags']
               if tuple(f[k] for k in SK) == s}) == 1 for s in combos for c in 'MAF'))
check('bootstrap intervals contain the baseline rate',
      all(L['bootstrap_base'][c]['low'] <= b[c]['rate'] <= L['bootstrap_base'][c]['high'] for c in 'MAF'))
check('no raw text stored in lattice.json', '"text": "' not in json.dumps(L).replace('"text": "fetched"', '').replace('"text": "decoded"', ''))

# evaluation and errors re-derived
before = json.dumps(E, sort_keys=True)
subprocess.run([sys.executable, os.path.join(TOOLS, 'evaluate.py')], capture_output=True, check=True)
check('evaluation.json re-derives identically', json.dumps(json.load(open(os.path.join(D, 'evaluation.json'))), sort_keys=True) == before)
before = json.dumps(ERR, sort_keys=True)
subprocess.run([sys.executable, os.path.join(TOOLS, 'errors.py')], capture_output=True, check=True)
check('errors.json re-derives identically', json.dumps(json.load(open(os.path.join(D, 'errors.json'))), sort_keys=True) == before)
check('six known errors, all flagged under the registered matcher', ERR['totals']['round-or-trunc'] == {'errors': 6, 'documents': 4})
check('errors kept in lattice baseline equal errors.json', bf['known_real_errors_flagged'] == 6)
for m in LT.MATCHERS:
    row = next(r for r in L['flags'] if is_base(r, SK) and r['match'] == m)
    check(f'lattice and errors.json agree under {m}', row['known_real_errors_flagged'] == ERR['totals'][m]['errors'])
check('four predictions held, P3 and P5 refuted',
      [k for k, v in sorted(E['predictions'].items()) if not v['held']] == ['P3', 'P5'])

# page
r = subprocess.run([sys.executable, os.path.join(TOOLS, 'build.py'), '--check'], capture_output=True, text=True)
check('index.html matches a rebuild byte for byte', r.returncode == 0)
check('page carries no script element', '<script' not in HTML.lower())
check('page makes no outside request', 'http://' not in HTML and 'src="http' not in HTML and 'href="http' not in HTML)
check('page has 1,200 readout groups', HTML.count('<tbody class="row ') == 1200)
check('exactly one readout group is the baseline', HTML.count(' base"><tr>') == 1)
for lit in ('7.54 %', 'from 289 to', 'from 25 to', 'against 314', '998 of 1,000', '26 of 30'):
    check(f'prose literal present: {lit}', lit in HTML)
check('prose 26 of 30 matches the audit', L['audit']['F']['digest_matched'] == 26)
check('prose 7.54 matches baseline', f"{b['M']['rate']:.2f}" == '7.54')

# render record
check('no horizontal overflow at any width, scripting on or off',
      len(R['widths']) == 6 and not any(w['horizontal_overflow'] for w in R['widths']))
check('no console errors, no network requests', all(w['console_errors'] == 0 and w['network_requests'] == 0 for w in R['widths']))
ops = R['operated'][1:]
check('three operated states recorded, each showing exactly one row', len(ops) == 3 and all(o['visible_rows'] == 1 for o in ops))
ok = True
for o in ops:
    st = dict(s.split('-', 1) for s in o['state'])
    inv = {'all': None, 'semi': '.;!?', 'nosemi': '.!?', 'full': 'all+slash'}
    key = []
    for k, full in zip('wcspt', SK):
        v = st[k]
        v = inv.get(v, v)
        key.append(int(v) if isinstance(v, str) and v.isdigit() else v)
    ok &= o['M_rate_shown'] == [f"{screens[tuple(key)]['M']['rate']:.2f} %"]
check('each operated state shows the M rate the data holds for it', ok)

declared = 40
print(f'{len(ran)} checks run, {len(failed)} failed (declared {declared})')
if len(ran) != declared:
    print('FAIL the suite ran a different number of checks than it declares')
    sys.exit(1)
sys.exit(1 if failed else 0)
