"""Named For Them — fifth state: after the presentation.

Usage: python3 -I build_after.py <backup-20261109100729.tar.bz2> <the Field's data79.js>

Starts no new subject. It answers what the siblings' finished findings left open in this work:

  1. The Field's correction of this page (its check 79, 2026-11-16): the act in incident 1694 lands on the vendor, not on
     the police force. Checked here against the snapshot's own response report: the parties of the ruling are read from it.
  2. The Field's public acts in their final state: 69, with whom each lands on and which way it went (against or for).
     The joins of the earlier states are recomputed on the 69.
  3. This practice's own reading of the 69 (asked_codes.json): at whose asking the body acted. Counted against the
     Field's target and direction.

Writes after.js / after.json. No text of any report is written out.
"""
import csv, hashlib, io, json, os, sys, tarfile, collections

csv.field_size_limit(10**9)
HERE = os.path.dirname(os.path.abspath(__file__))
SNAP_SHA = 'c10825888fb716bb91a67319f3292324a7f962f68e6e82326aedd4d694a7aad0'
D79_SHA = '3db8451e7592a67babafdfb23e9bec5a4f9c62fcb62ef745341fbb6b912a5e7a'


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def load_js(path):
    txt = open(path, encoding='utf-8').read()
    return json.loads(txt[txt.index('{'):txt.rindex('}') + 1])


snap, d79p = sys.argv[1:3]
assert sha(snap) == SNAP_SHA, 'snapshot hash differs'
assert sha(d79p) == D79_SHA, "the Field's data79.js differs from the file this state read"

with tarfile.open(snap, 'r:bz2') as t:
    INC = {int(r['incident_id']): r
           for r in csv.DictReader(io.StringIO(t.extractfile('mongodump_full_snapshot/incidents.csv').read().decode('utf-8')))}
    REP = {int(r['report_number']): r
           for r in csv.DictReader(io.StringIO(t.extractfile('mongodump_full_snapshot/reports.csv').read().decode('utf-8')))}

D79 = load_js(d79p)
CHECK = load_js(os.path.join(HERE, 'check.js'))
VOICE = load_js(os.path.join(HERE, 'voice.js'))
CODES = json.load(open(os.path.join(HERE, 'asked_codes.json'), encoding='utf-8'))
F = D79['res']

# ---------------------------------------------------------------- 1. the Field's 69 acts, as its check 79 left them
# act row: id, year, body, act, target, state as presented, state now, direction, deployer is a public body, found in, changed
acts = collections.OrderedDict()
for a in D79['acts']:
    acts[a[0]] = {'body': a[2], 'act': a[3], 'target': a[4], 'state': a[6], 'direction': a[7], 'public': a[8],
                  'found_in': a[9], 'changed': a[10]}
assert len(acts) == 69 == F['n69']['n']
tc = collections.Counter(a['target'] for a in acts.values())
dc = collections.Counter(a['direction'] for a in acts.values())
assert tc['user'] == F['n69']['target']['user'] == 41 and tc['maker'] == F['n69']['target']['maker'] == 28
assert dc['for'] == F['n69']['direction']['for'] == 3
assert sorted(i for i, a in acts.items() if a['direction'] == 'for') == F['for_the_party'] == [623, 1677, 1694]
public_now = sorted(i for i, a in acts.items() if a['public'])
assert public_now == F['on_a_public_body']['corrected']
public_was = sorted(int(i) for i, a in CHECK['acts'].items() if a['public_deployer'])
assert public_was == F['on_a_public_body']['presented'] == CHECK['res']['public_deployer']
in60 = {int(i) for i in CHECK['acts']}
assert len(in60) == 60 and in60 <= set(acts)
new = sorted(set(acts) - in60)
for i, a in acts.items():
    a['in60'] = i in in60
    a['system'] = CHECK['acts'][str(i)]['system'] if i in in60 else None

# ---------------------------------------------------------------- the correction of this page, checked at the source
# incident 1694: the parties of the ruling, read from the response report in the snapshot
r1694 = [REP[int(n)] for n in json.loads(INC[1694]['reports']) if int(n) in REP and 'response' in (REP[int(n)]['tags'] or '')]
assert len(r1694) == 1 and r1694[0]['source_domain'] == 'cases.justia.com'
txt = r1694[0]['text']
assert 'Michael Smith, Plaintiff' in txt and 'Flock Safety, Defendant' in txt, 'the ruling does not name these two parties'
caption = txt[txt.index('Michael Smith, Plaintiff'):txt.index('Flock Safety, Defendant') + len('Flock Safety, Defendant')]
assert 'Police' not in caption and 'Township' not in caption, 'a police force stands among the parties'
dep1694 = json.loads(INC[1694]['Alleged deployer of AI system'])
assert any('police' in s for s in dep1694)

# ---------------------------------------------------------------- 2. named twice, on the 69
twice = {int(k): v for k, v in VOICE['twice'].items()}
user_twice = sorted(i for i, a in acts.items() if a['target'] == 'user' and i in twice and twice[i]['dep'])
maker_twice = sorted(i for i, a in acts.items() if a['target'] == 'maker' and i in twice)
n_dep = sum(1 for v in twice.values() if v['dep'])
by_chance = round(tc['user'] * n_dep / len(INC), 1)

# ---------------------------------------------------------------- 3. who asked
claims = {c['id']: c for c in CODES['claims']}
own = {}
for kind, ids in CODES['own'].items():
    for i in ids:
        assert i not in own and i not in claims, f'{i} coded twice'
        own[i] = kind
assert set(claims) | set(own) == set(acts) and len(claims) + len(own) == 69, 'the codes do not cover the 69 acts once each'
for c in claims.values():                                  # the report named for a claim is a response report of that incident
    assert c['report'] in [int(n) for n in json.loads(INC[c['id']]['reports'])], f"report {c['report']} is not of incident {c['id']}"
    assert c['claimant'] in ('person', 'for the harmed', 'firm', 'public body')
for b in CODES['borderline']:
    assert b['id'] in own
for i, a in acts.items():
    a['asked'] = 'claim' if i in claims else 'own'
    a['by'] = claims[i]['who'] if i in claims else own[i]
    if i in claims:
        a['claimant'] = claims[i]['claimant']
        a['note'] = claims[i]['note']
    if any(b['id'] == i for b in CODES['borderline']):
        a['borderline'] = [b['note'] for b in CODES['borderline'] if b['id'] == i][0]

cell = collections.Counter((a['asked'], a['target'], a['direction']) for a in acts.values())
at = collections.Counter((a['asked'], a['target']) for a in acts.values())
ast = collections.Counter((a['asked'], a['state']) for a in acts.values())
okind = collections.Counter(own.values())
okind_user = collections.Counter(own[i] for i in own if acts[i]['target'] == 'user')
ckind = collections.Counter(c['claimant'] for c in claims.values())
for_ids = [i for i, a in acts.items() if a['direction'] == 'for']
maker_claims = sorted(i for i in claims if acts[i]['target'] == 'maker')

res = {
    'snapshot_sha256': SNAP_SHA, 'field_data79_sha256': D79_SHA, 'date': '2026-11-16',
    'acts': 69, 'acts_presented': 60, 'acts_new': len(new),
    'on_user': tc['user'], 'on_maker': tc['maker'], 'on_user_presented': CHECK['res']['acted_on_user'],
    'on_maker_presented': CHECK['res']['acted_on_maker'],
    'against': dc['against'], 'for': dc['for'], 'for_ids': for_ids,
    'user_against': F['n69']['target_direction']['user against'], 'maker_against': F['n69']['target_direction']['maker against'],
    'public_now': public_now, 'public_n': len(public_now), 'public_was_n': len(public_was),
    'public_claim': sorted(i for i in public_now if i in claims), 'public_own': sorted(i for i in public_now if i in own),
    'concluded': F['n69']['state']['concluded'], 'opened': F['n69']['state']['opened'],
    'user_twice': user_twice, 'user_twice_n': len(user_twice), 'maker_twice': maker_twice,
    'user_twice_by_chance': by_chance,
    'claims': len(claims), 'own': len(own),
    'claim_on_maker': at[('claim', 'maker')], 'claim_on_user': at[('claim', 'user')],
    'own_on_maker': at[('own', 'maker')], 'own_on_user': at[('own', 'user')],
    'claim_maker_against': cell[('claim', 'maker', 'against')], 'claim_maker_for': cell[('claim', 'maker', 'for')],
    'own_maker_for': cell[('own', 'maker', 'for')], 'own_user_for': cell[('own', 'user', 'for')],
    'for_by_claim': sum(1 for i in for_ids if i in claims),
    'claim_concluded': ast[('claim', 'concluded')], 'own_concluded': ast[('own', 'concluded')],
    'claimant': dict(ckind), 'claimant_harmed_side': ckind['person'] + ckind['for the harmed'],
    'own_kind': dict(okind), 'own_kind_on_user': dict(okind_user),
    'court_own': okind['a court, on a filing before it'], 'court_own_on_user': okind_user['a court, on a filing before it'],
    'borderline': [b['id'] for b in CODES['borderline']],
    'claims_with_borderline': len(claims) + len(CODES['borderline']),
    'reports_opened': len(claims) + len(CODES['borderline']),
}
assert res['claim_on_maker'] + res['claim_on_user'] == res['claims']
assert res['own_on_maker'] + res['own_on_user'] == res['own']
assert res['claim_maker_against'] + res['claim_maker_for'] == res['claim_on_maker']
assert res['own_maker_for'] == 0 and res['for_by_claim'] + res['own_user_for'] == res['for']

out = {'res': res, 'acts': {str(i): a for i, a in acts.items()}, 'rule': CODES['rule']}
json.dump(out, open(os.path.join(HERE, 'after.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
open(os.path.join(HERE, 'after.js'), 'w', encoding='utf-8').write('window.AFTER=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps(res, indent=1))
