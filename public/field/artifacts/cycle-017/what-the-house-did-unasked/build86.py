#!/usr/bin/env python3
"""Study 86: writes data86.js for the page from results86.json, codes86.json and candidates86.json.
Standard library only. Run after scores86.py."""
import json, os
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda f: json.load(open(os.path.join(HERE, f), encoding='utf-8'))
res = J('results86.json')
DAY0 = datetime(2026, 7, 12, tzinfo=timezone.utc)
RULES = ['bulletin-lines', 'bulletin-words', 'journal-lines', 'journal-words', 'score-lines', 'critique-lines',
         'digest-words', 'subject-chars']
LABEL = {'bulletin-lines': 'Bulletin over 40 lines', 'bulletin-words': 'Bulletin over 400 words',
         'journal-lines': 'Journal entry over 40 lines', 'journal-words': 'Journal entry over 150 words',
         'score-lines': 'Score over 20 lines', 'critique-lines': 'Critique over 20 lines',
         'digest-words': 'Digest over 2,500 words', 'subject-chars': 'Commit subject over 100 characters'}
REPO = {'field': 'field-research', 'atelier': 'ulysses', 'studio': 'studio'}
items85 = {(i['rule'], i['practice'], i['commit'], i['path']): i for i in J('items85.json') if i['breach']}


def d(t):
    return round((datetime.fromisoformat(t).astimezone(timezone.utc) - DAY0).total_seconds() / 86400, 3)


A = []
for r in res['partA']['items']:
    i = items85[(r['rule'], r['practice'], r['commit'], r['path'])]
    s = r['sighting']
    A.append({'r': RULES.index(r['rule']), 'p': r['practice'], 'repo': REPO[r['practice']], 'c': r['commit'][:12],
              'path': r['path'], 'v': i['value'], 'az': i.get('ascii'), 't': r['time'][:16].replace('T', ' '),
              'x': d(r['time']), 'lag': r['lag_days'], 'seen': 0 if s else 1, 'robust': 1 if r['robust'] else 0,
              'under': 1 if r['under'] else 0, 'within': 1 if r['asserts_within'] else 0,
              's': None if not s else {'repo': s['repo'], 'c': s['commit'][:12], 'path': s['path'],
                                       't': s['time'][:16].replace('T', ' ')}})
B = res['partB']
data = {
    'study': 86, 'session': 284, 'built': '2026-11-20', 'census_x': d(res['census']), 'rules': RULES, 'labels': LABEL,
    'A': A, 'deeds': B['deeds_list'], 'B': {k: B[k] for k in ('rows', 'first_pass_deeds', 'review', 'deeds', 'seer',
                                                               'trace', 'relation', 'actor', 'seer_stated', 'architect',
                                                               'at_his_order', 'machines_unbidden', 'outside',
                                                               'traced', 'in_git', 'by_month', 'rows_by_month')},
    'partA': {k: v for k, v in res['partA'].items() if k not in ('items',)},
    'predictions': res['predictions'], 'correction85': res['correction85'], 'declared': res['declared_count'],
    'log': 'https://github.com/frankbueltge/frankbueltge.de/blob/7f92ac31d892470110bb97b8ae10bc1ab164dce0/docs/decision-log.md?plain=1',
}
with open(os.path.join(HERE, 'data86.js'), 'w', encoding='utf-8') as f:
    f.write('/* Study 86, written by build86.py from results86.json. */\n')
    f.write('window.DATA86=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(A), 'breaches', len(B['deeds_list']), 'deeds', os.path.getsize(os.path.join(HERE, 'data86.js')), 'bytes')
