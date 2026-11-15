"""Study 76 — who wrote the self-published first reports, and who answered (session 274).

Usage: python3 -I analyse76.py
Reads coding76.json (one reader's codes, made from the snapshot's texts by sheet76.py) and data75.js (study 75's
row per incident), and writes results76.json and data76.js. No report text is read or written here.
"""
import json, os, collections, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
C = json.load(open(os.path.join(HERE, 'coding76.json')))
D = json.loads(open(os.path.join(HERE, 'data75.js')).read().split('=', 1)[1].rstrip(';\n'))
R75 = {r[0]: {'y': r[1], 'k': r[2], 'd': r[3], 'act': r[4], 'resp': r[5]} for r in D['rows']}
N_FIRST = D['res']['incidents_with_first_report']

# ---------------------------------------------------------------- Part A
A = C['A']
ca = collections.Counter(a['code'] for a in A)
readable = [a for a in A if a['code'] not in ('record note', 'unreadable')]
harmed = [a for a in A if a['code'] == 'harmed']
harmed_strict = [a for a in harmed if not a['borderline']]
assert len(A) == 58 and all(R75[a['id']]['k'] == 'self-published' for a in A)

# ---------------------------------------------------------------- Part B
B = C['B']
assert len(B) == 176 and all(R75[b['id']]['resp'] == 1 for b in B)
assert len(B) == sum(1 for r in R75.values() if r['resp'])
def has(b, c): return c in b['codes']
nM = sum(has(b, 'M') for b in B)
nP = sum(has(b, 'P') for b in B)
nO = sum(has(b, 'O') for b in B)
P_inc = [b for b in B if has(b, 'P')]
P_strict = [b for b in P_inc if not b['borderline']]
tgt = collections.Counter(b['act_target'] for b in P_inc)
d7_P = sum(1 for b in P_inc if R75[b['id']]['d'] == 7)
P_classified = [b for b in P_inc if R75[b['id']]['d']]
by_dom = {}
for b in B:
    d = R75[b['id']]['d']
    x = by_dom.setdefault(d, {'n': 0, 'M': 0, 'P': 0, 'O': 0, 'P_maker': 0})
    x['n'] += 1
    for c in 'MPO':
        x[c] += has(b, c)
    x['P_maker'] += has(b, 'P') and b.get('act_target') == 'maker'
only_P = sum(1 for b in B if b['codes'] == ['P'])
only_M = sum(1 for b in B if b['codes'] == ['M'])
maker_side_P = [b['id'] for b in P_inc if b['act_target'] == 'maker']

P108 = len(harmed) <= 19
P109 = nM >= len(B) / 2 and nP <= len(B) / 5
P110 = d7_P < len(P_inc) / 4

res = {
    'study': 76, 'session': 274, 'date': '2026-11-15', 'cycle': 15, 'programme_step': 3,
    'snapshot_sha256': C['snapshot_sha256'],
    'predictions_file_sha256': hashlib.sha256(open(os.path.join(HERE, 'PREDICTIONS76.md'), 'rb').read()).hexdigest(),
    'coding': 'coding76.json — one reader, first coding; the second coding is the next session\'s check',
    'A': {
        'n': len(A), 'codes': dict(ca), 'readable': len(readable),
        'harmed': len(harmed), 'harmed_without_borderline': len(harmed_strict),
        'harmed_pct_readable': round(100 * len(harmed) / len(readable), 1),
        'harmed_first_of_all_first_reports': len(harmed), 'all_first_reports': N_FIRST,
        'harmed_first_pct_all': round(100 * len(harmed) / N_FIRST, 2),
        'harmed_ids': [a['id'] for a in harmed],
        'address_misread': {'record note': ca['record note'], 'maker': ca['maker'],
                            'note': 'Of the 58 first reports the address rule put on a self-published platform, 6 are the database\'s own note (incidents converted to issues), 2 are the maker\'s own text, and several are press on a platform (coded witness under the fixed rule).'},
    },
    'B': {
        'n': len(B), 'maker_responded': nM, 'public_body_acted': nP, 'other_responded': nO,
        'maker_pct': round(100 * nM / len(B), 1), 'public_pct': round(100 * nP / len(B), 1),
        'other_pct': round(100 * nO / len(B), 1),
        'public_without_borderline': len(P_strict),
        'act_target': dict(tgt), 'act_on_maker_ids': maker_side_P,
        'act_for_the_maker': [1677],
        'public_in_domain7': d7_P, 'public_classified': len(P_classified),
        'public_domain7_pct_of_acted': round(100 * d7_P / len(P_inc), 1),
        'only_maker': only_M, 'only_public': only_P,
        'by_domain': {str(k): v for k, v in sorted(by_dom.items())},
        'unclassified_note': 'Domain 0 = the incident carries no MIT classification yet (most entries since late 2025).',
    },
    'predictions': {'P108': P108, 'P109': P109, 'P110': P110},
    'predictions_held': sum([P108, P109, P110]),
}
json.dump(res, open(os.path.join(HERE, 'results76.json'), 'w'), indent=1, ensure_ascii=False)
rowsA = [[a['id'], R75[a['id']]['y'], a['code'], 1 if a['borderline'] else 0, a['writer']] for a in A]
rowsB = [[b['id'], R75[b['id']]['y'], R75[b['id']]['d'], ''.join(sorted(b['codes'])), b.get('act_target', ''),
          1 if b['borderline'] else 0, b['note']] for b in B]
with open(os.path.join(HERE, 'data76.js'), 'w') as f:
    f.write('window.D76=' + json.dumps({'A': rowsA, 'B': rowsB, 'res': res}, ensure_ascii=False,
                                       separators=(',', ':')) + ';\n')
print(json.dumps({k: res[k] for k in ('A', 'predictions')}, indent=1))
print(json.dumps({k: v for k, v in res['B'].items() if k != 'by_domain'}, indent=1))
