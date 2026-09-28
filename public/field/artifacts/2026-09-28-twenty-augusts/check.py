#!/usr/bin/env python3
"""Twenty Augusts — re-derive every number on the page from data/. No network.

    check.py [artifact_dir]      exit 0 only if every check ran and passed
"""
import hashlib
import json
import os
import re
import sys

D = sys.argv[1] if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
EXPECTED = 24
ran, failed = [], []


def check(name, cond):
    ran.append(name)
    if not cond:
        failed.append(name)
        print('FAIL', name)


j = lambda f: json.load(open(os.path.join(D, 'data', f)))
Y, X, C, P, R = (j('years.json')['years'], j('explore.json'), j('corpora.json'),
                 j('predictions.json'), j('readback.json'))
page = open(os.path.join(D, 'index.html'), encoding='utf-8').read()
YS = ['2006', '2011', '2016', '2021', '2026']
r2 = lambda v: round(v + 1e-9, 2)

check('years: five Augusts of 1,000', [Y[k]['documents'] for k in YS] == [1000] * 5)
check('S recomputes from totals', all(r2(100 * Y[k]['totals']['recomputable'] / Y[k]['totals']['tokens']) == Y[k]['rates']['S'] for k in YS))
check('C recomputes from totals', all(r2(100 * Y[k]['totals']['consistent'] / Y[k]['totals']['tokens']) == Y[k]['rates']['C'] for k in YS))
check("S' recomputes from totals", all(r2(100 * Y[k]['totals']['recomputable_wo'] / Y[k]['totals']['tokens_wo']) == Y[k]['rates']['S_wo'] for k in YS))
check('paired = agree + complement + disagree', all(Y[k]['totals']['recomputable'] == Y[k]['totals']['consistent'] + Y[k]['totals']['complement'] + Y[k]['totals']['inconsistent'] for k in YS))
check('each C inside its own interval', all(Y[k]['ci95']['C'][0] <= Y[k]['rates']['C'] <= Y[k]['ci95']['C'][1] for k in YS))
check('K3: 2026 reproduces 09-23 (4166/314/289/25)', [Y['2026']['totals'][x] for x in ('tokens', 'recomputable', 'consistent', 'inconsistent')] == [4166, 314, 289, 25])
check('K2: 1,000 of 1,000 pins matched', Y['2026']['audit_2026'] == {'pinned': 1000, 'returned': 1000, 'digest_matched': 1000})
pin = os.path.join(D, '..', '2026-09-23-a-number-you-cannot-check', 'data', 'corpora.json')
check('2026 corpus digest equals the 09-23 pin', C['2026']['corpus_digest'] == json.load(open(pin))['M']['corpus_digest'])
check('corpus digests recompute from their rows', all(hashlib.sha256(''.join(d['sha256'] for d in C[k]['docs']).encode()).hexdigest() == C[k]['corpus_digest'] and len(C[k]['docs']) == 1000 for k in YS))
check('no identifier repeats within a year', all(len({d['id'] for d in C[k]['docs']}) == 1000 for k in YS))
c = {k: Y[k]['rates']['C'] for k in YS}
s = [Y[k]['rates']['S'] for k in YS]
exp = {'P1': c['2016'] > c['2006'], 'P2': abs(c['2026'] - c['2021']) < 1.5, 'P3': max(s) < 50,
       'P4': all(a < b for a, b in zip(s, s[1:])),
       'P5': Y['2026']['pct_per_abstract'] > Y['2006']['pct_per_abstract'],
       'P6': (c['2026'] > c['2006']) == (Y['2026']['rates']['S_wo'] > Y['2006']['rates']['S_wo'])}
check('prediction verdicts follow from the data', all((p['verdict'] == 'held') == exp[p['id']] for p in P) and len(P) == 6)
check('page: three of six refuted', sum(p['verdict'] == 'refuted' for p in P) == 3 and 'Three of the six predictions' in page)
check('page: 2006-2021 range of C stated', f"between {min(c[k] for k in YS[:4]):.2f} % and {max(c[k] for k in YS[:4]):.2f} %" in page)
check('page: more than nine in ten uncheckable', max(s) < 10)
check('page: every C and S printed', all(f"{Y[k]['rates']['C']:.2f}" in page and f"{Y[k]['rates']['S']:.2f}" in page for k in YS))
F = X['frames']
check('explore: seven frames of 1,000', len(F) == 7 and all(v['documents'] == 1000 for v in F.values()))
check('explore: pinned and today share <= 1000', 0 < X['overlap_2026_pinned_vs_today'] <= 1000)
check('page: 2026 and 2021 journal intervals do not overlap', F['2026']['C_ci95_journal_clustered'][0] > F['2021']['C_ci95_journal_clustered'][1])
check('page: 2025 above 2021 and its interval overlaps', F['2025']['rates']['C'] > F['2021']['rates']['C'] and F['2025']['C_ci95_journal_clustered'][0] <= F['2021']['C_ci95_journal_clustered'][1])
check('page: earlier top-10 shares within 8-14 %', all(8 <= F[k]['top10_share_of_records'] <= 14 for k in ('2006', '2011', '2016', '2021', '2025')))
check('explore agrees with primary on the five years', all(F[k]['rates'] == Y[k]['rates'] for k in YS))
check('read-back adds up', R['read'] == 32 and R['genuine'] + len(R['ambiguous']) + R['false'] == R['read'])
check('page carries no script', '<script' not in page.lower())

print(f'{len(ran)} checks ran, {len(failed)} failed')
if len(ran) != EXPECTED:
    print(f'FAIL self-count: expected {EXPECTED}, ran {len(ran)}')
    sys.exit(1)
sys.exit(1 if failed else 0)
