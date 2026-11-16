"""Check 79 (session 277, 2026-11-16) — the Studio's correction of this work's coding, checked at the source.

Usage: python3 -I analyse79.py [<path to mongodump_full_snapshot/>]
Reads data77.js (the 60 acts of check 77), coding78.json and results78.json (the 9 acts study 78 added) and
correction79.json (this session's reading). Writes results79.json and data79.js. With the snapshot's path it
also asserts that every quotation in correction79.json stands in the report it names. Nothing but those
quotations is taken from a report's text. Standard library only.
"""
import json, os, sys, csv, re, collections

HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda *p: json.load(open(os.path.join(HERE, *p), encoding='utf-8'))
js = lambda f: json.loads(open(os.path.join(HERE, f), encoding='utf-8').read().split('=', 1)[1].rstrip(';\n'))
D7, C8, R8, R7, K = js('data77.js'), J('coding78.json'), J('results78.json'), J('results77.json'), J('correction79.json')

# ---------------------------------------------------------------- the 69 acts as presented
acts = []
for a in D7['acts']:  # id, year, incident date, body, act, act date, target, target_public, state, system, in first reading, borderline
    acts.append({'id': a[0], 'year': a[1], 'body': a[3], 'act': a[4], 'target': a[6], 'public': a[7], 'state_was': a[8], 'from': 'response'})
assert len(acts) == 60 == R7['B']['public_final']
F8 = {x['id']: x for x in C8['first']['A']}
Y8 = {r[0]: r[1] for r in js('data78.js')['A']}
for i in R8['A']['new']:
    x = F8[i]
    acts.append({'id': i, 'year': Y8[i], 'body': x['body'], 'act': x['what'], 'target': x['act_target'], 'public': int(bool(x['target_public'])),
                 'state_was': x['state'], 'from': 'first report'})
assert len(acts) == 69 == R8['A']['all_acts_read'] and len({a['id'] for a in acts}) == 69
BY = {a['id']: a for a in acts}

# ---------------------------------------------------------------- the corrections
st = {x['id']: x for x in K['state']}
dr = {x['id']: x for x in K['direction']}
tp = {x['id']: x for x in K['target_public']}
for i, x in st.items():
    assert BY[i]['state_was'] == x['was'] and BY[i]['from'] == 'response', i
for i, x in dr.items():
    assert BY[i]['target'] == x['target'], i
for i, x in tp.items():
    assert bool(BY[i]['public']) == x['was'], i
for a in acts:
    a['state'] = st[a['id']]['now'] if a['id'] in st else a['state_was']
    a['dir'] = dr[a['id']]['now'] if a['id'] in dr else 'against'
    a['public_now'] = int(tp[a['id']]['now']) if a['id'] in tp else a['public']
    a['corrected'] = sorted(k for k, m in (('state', st), ('direction', dr), ('public', tp)) if a['id'] in m)


def tab(rows, key):
    return dict(sorted(collections.Counter(key(a) for a in rows).items()))


first60 = [a for a in acts if a['from'] == 'response']
res = {
    'study': 79, 'kind': 'check after the presentation', 'session': 277, 'date': '2026-11-16', 'cycle': 15, 'programme_step': 3,
    'snapshot_sha256': K['snapshot_sha256'],
    'offered': {'by': 'studio', 'commit': '1cdfe75', 'path': 'works/2026-11-15-other-hands/check/state-second-reading.json',
                'state_claims': 4, 'direction_claims': 2, 'held': sum(x['holds'] for x in K['state'] + K['direction'] if x['offered_by'] == 'studio'),
                'studio_agreement_on_state': [55, 60]},
    'found_by_this_check': [x['id'] for x in K['direction'] if x['offered_by'] == 'field'],
    'n60': {'presented': tab(first60, lambda a: a['state_was']), 'corrected': tab(first60, lambda a: a['state']),
            'presented_by_target': tab(first60, lambda a: a['target'] + ' ' + a['state_was']),
            'corrected_by_target': tab(first60, lambda a: a['target'] + ' ' + a['state'])},
    'n69': {'n': len(acts), 'state': tab(acts, lambda a: a['state']), 'state_presented': tab(acts, lambda a: a['state_was']),
            'direction': tab(acts, lambda a: a['dir']), 'target': tab(acts, lambda a: a['target']),
            'target_direction': tab(acts, lambda a: a['target'] + ' ' + a['dir']),
            'cells': tab(acts, lambda a: a['target'] + ' ' + a['dir'] + ' ' + a['state'])},
    'for_the_party': sorted(a['id'] for a in acts if a['dir'] == 'for'),
    'state_changed': sorted(st),
    'against_maker': {
        'n': sum(a['target'] == 'maker' and a['dir'] == 'against' for a in acts),
        'concluded': sorted(a['id'] for a in acts if a['target'] == 'maker' and a['dir'] == 'against' and a['state'] == 'concluded'),
        'concluded_on_a_public_body': sorted(a['id'] for a in acts if a['target'] == 'maker' and a['dir'] == 'against' and a['state'] == 'concluded' and a['public_now']),
    },
    'on_a_public_body': {'presented': sorted(a['id'] for a in acts if a['public']), 'corrected': sorted(a['id'] for a in acts if a['public_now'])},
    'frontier_unchanged': R7['B']['frontier'],
}
am = res['against_maker']
am['concluded_n'] = len(am['concluded'])
am['concluded_on_a_firm_n'] = am['concluded_n'] - len(am['concluded_on_a_public_body'])
assert res['n60']['presented'] == {'concluded': 34, 'opened': 26}
assert sum(res['n69']['direction'].values()) == 69 and sum(res['n69']['state'].values()) == 69

# ---------------------------------------------------------------- the quotations, against the snapshot
if len(sys.argv) > 1:
    csv.field_size_limit(10**9)
    rep = {}
    with open(os.path.join(sys.argv[1], 'reports.csv'), newline='', encoding='utf-8') as f:
        for r in csv.DictReader(f):
            if r['report_number'].isdigit():
                rep[int(r['report_number'])] = r
    inc = {}
    with open(os.path.join(sys.argv[1], 'incidents.csv'), newline='', encoding='utf-8') as f:
        for r in csv.DictReader(f):
            inc[int(r['incident_id'])] = json.loads(r['reports'] or '[]')
    norm = lambda t: re.sub(r'\s+', ' ', (t or '').replace('’', "'").replace('‘', "'"))
    n = 0
    for x in K['state'] + K['direction']:
        r = rep[x['report']]
        assert x['report'] in inc[x['id']] and 'response' in (r['tags'] or ''), x['id']
        assert r['source_domain'] == x['host'], (x['id'], r['source_domain'])
        assert x['quote'] in norm(r['title']) + ' ' + norm(r['text']), x['id']
        n += 1
    # 1118: no response report states a sentence passed
    t1118 = ' '.join(norm(rep[k]['text']) for k in inc[1118] if k in rep and 'response' in (rep[k]['tags'] or ''))
    assert not re.search(r'\b(was|were|been) sentenced\b|sentenced to', t1118)
    res['quotations_found_in_snapshot'] = n
else:
    res['quotations_found_in_snapshot'] = J('results79.json')['quotations_found_in_snapshot'] if os.path.exists(os.path.join(HERE, 'results79.json')) else None

json.dump(res, open(os.path.join(HERE, 'results79.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
rows = [[a['id'], a['year'], a['body'], a['act'], a['target'], a['state_was'], a['state'], a['dir'], a['public_now'], a['from'], a['corrected']] for a in acts]
ev = {x['id']: {'report': x['report'], 'host': x['host'], 'quote': x['quote'], 'why': x['why'], 'by': x['offered_by']} for x in K['state'] + K['direction']}
with open(os.path.join(HERE, 'data79.js'), 'w', encoding='utf-8') as f:
    f.write('window.D79=' + json.dumps({'res': res, 'acts': rows, 'ev': ev, 'pub': {str(k): v['why'] for k, v in tp.items()}}, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps({k: res[k] for k in ('n60', 'n69', 'for_the_party', 'against_maker', 'on_a_public_body', 'quotations_found_in_snapshot')}, indent=1))
