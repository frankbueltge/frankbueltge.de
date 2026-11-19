#!/usr/bin/env python3
"""Study 85: writes data85.js for the page from items85.json, rules85.json, results85.json and atelier_mark85.json.
Standard library only. Run after analyse85.py."""
import json, os
from datetime import datetime, timezone, timedelta

HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda f: json.load(open(os.path.join(HERE, f), encoding='utf-8'))
items, rules, results, mark = J('items85.json'), J('rules85.json'), J('results85.json'), J('atelier_mark85.json')

DAY0 = datetime(2026, 7, 12, tzinfo=timezone.utc)
LAST = datetime(2026, 11, 19, tzinfo=timezone.utc)
NDAYS = (LAST - DAY0).days + 1
REPO = {'field': 'field-research', 'atelier': 'ulysses', 'studio': 'studio', 'middle': 'research-ecology'}
PRACTICE = {'field': 'Field', 'atelier': 'Atelier', 'studio': 'Studio', 'middle': 'Middle'}
ORDER = [
    ('bulletin-lines', 'Bulletin: at most 40 lines', 'lines'),
    ('bulletin-words', 'Bulletin: at most 400 words', 'words'),
    ('journal-lines', 'Journal entry: at most 40 lines', 'lines'),
    ('journal-words', 'Journal entry: at most 150 words', 'words'),
    ('score-lines', 'Score: at most 20 lines', 'lines'),
    ('critique-lines', 'Critique: at most 20 lines', 'lines'),
    ('digest-words', 'Digest: at most 2,500 words', 'words'),
    ('subject-chars', 'Commit subject: at most 100 characters', 'characters'),
    ('letter-words', 'Letter: at most 150 words', 'words'),
    ('predictions-three', 'At most three predictions a session', 'predictions'),
    ('process-never-rewritten', 'Process entries never rewritten', 'entries changed'),
    ('foreign-scripts', 'No scripts from foreign hosts', 'foreign hosts'),
    ('line-file', 'No practice edits a line file', 'practice commits'),
    ('signature', 'Signed without a product name or another person', 'faults'),
    ('product-credit', 'No AI-product credit in Git', 'credit lines'),
    ('for-the-programme', 'Summary carries "For the programme:"', 'missing'),
    ('next-step', 'Summary carries "Next step:"', 'missing'),
]
KIND = {r['rule']: r['kind'] for r in rules}
LIMIT = {r['rule']: r['limit'] for r in rules}


def day(t):
    return (datetime.fromisoformat(t).astimezone(timezone.utc).date() - DAY0.date()).days


lanes, lane_ix = [], {}
for rid, label, unit in ORDER:
    for p in ('field', 'atelier', 'studio', 'middle'):
        rs = [r for r in rules if r['rule'] == rid and r['practice'] == p]
        if not rs or not any(i['rule'] == rid and i['practice'] == p for i in items):
            continue
        spans = [[max(0, day(r['start'])), day(r['end']) if r['end'] else NDAYS - 1] for r in rs]
        src = rs[0]
        if rid == 'product-credit':
            url = 'https://github.com/frankbueltge/frankbueltge.de/blob/main/CLAUDE.md'
        else:
            url = f"https://github.com/frankbueltge/{REPO[p]}/blob/{src['commit']}/PROTOCOL.md"
        lane_ix[(rid, p)] = len(lanes)
        lanes.append({'rule': rid, 'practice': p, 'repo': REPO[p], 'spans': spans, 'source': url,
                      'start': src['start'], 'end': src['end']})

commits, cix, paths, pix, details, dix = [], {}, [], {}, [], {}
SIGN = ['practice', 'architect-name', 'other', 'product']


def ix(tab, idx, v):
    if v is None:
        return -1
    if v not in idx:
        idx[v] = len(tab)
        tab.append(v)
    return idx[v]


rows = []
for i in items:
    k = (i['rule'], i['practice'])
    if k not in lane_ix:
        continue
    if i['robust']:
        code = 2
    elif i['breach']:
        code = 1
    elif i.get('exact_breach'):
        code = 3
    else:
        code = 0
    second = i.get('blocks', i.get('ascii'))
    det = i['detail'] if (i['breach'] or i.get('exact_breach') or i['rule'] in ('subject-chars',)) else None
    if i.get('exact_breach'):
        det = 'signed ' + i['exact_detail'] + '; the constitution writes ' + i['as_written']
    rows.append([lane_ix[k], day(i['time']), code, i['value'], -1 if second is None else second,
                 ix(commits, cix, i['commit'][:12]), ix(paths, pix, i['path']), SIGN.index(i['signer']),
                 ix(details, dix, det), i['time'][11:16]])

res = {k: results[k] for k in ('bound', 'breach', 'by_practice', 'by_kind', 'by_signer', 'pairs_bound',
                               'pairs_breached', 'predictions', 'second_readings', 'p134', 'unread_blobs',
                               'journal_edits_not_counted', 'table')}
data = {
    'study': 85, 'session': 283, 'built': '2026-11-19',
    'day0': DAY0.date().isoformat(), 'ndays': NDAYS,
    'rules': [{'id': r, 'label': l, 'unit': u, 'kind': KIND[r], 'limit': LIMIT[r]} for r, l, u in ORDER],
    'practices': PRACTICE, 'lanes': lanes, 'signers': SIGN,
    'commits': commits, 'paths': paths, 'details': details, 'items': rows,
    'results': res,
    'mark': {'source': mark['source'], 'sha256': mark['sha256'], 'instruments': mark['instruments'],
             'side': mark['side']},
}
with open(os.path.join(HERE, 'data85.js'), 'w', encoding='utf-8') as f:
    f.write('/* Study 85, written by build85.py from items85.json, rules85.json, results85.json, atelier_mark85.json. */\n')
    f.write('window.DATA85=' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(len(rows), 'items', len(lanes), 'lanes', len(commits), 'commits', os.path.getsize(os.path.join(HERE, 'data85.js')), 'bytes')
