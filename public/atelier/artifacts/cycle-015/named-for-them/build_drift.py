"""Named For Them — fourth state: is the drift the world's or the rule's?

Usage: python3 -I build_drift.py <the Field's data75.js> <the Field's data77.js> <backup-20261109100729.tar.bz2>

The third state left one sentence without a cause: the column of the harmed "learned to name goods". Two causes are
possible. The incidents changed (the world, or what the database admits), or incidents of one kind came to be named
differently (the rule). The record lets the two be told apart over most of its length, because it carries a second
column: the class each incident has in the MIT AI Risk Repository's domains, which the Field's study 75 read from the
snapshot's classifications_MIT.csv and published per incident (data75.js, fourth field; 0 = no class yet).

This script reads this work's own named.js (one row per incident, built by build.py from the snapshot) and joins the
class by incident number. Per block of 200 incident numbers and per kind of incident it counts the incidents and how
many name a good among the harmed. Then it holds one of the two still:

  kinds held   every block gets the same mix of kinds (that of all classed incidents no. 1 to 1400) and keeps its own
               naming: what the count would be had the incidents not changed
  naming held  every block keeps its own mix and gets the same naming (the pooled share per kind, no. 1 to 1400):
               what the count would be had the naming not changed

Inside the largest kind (a person doing harm with a system) the snapshot's own subdomain is read as well, so that one
finer kind, fraud and scams, can be followed through the blocks by itself.

Both are direct standardisations. They are two counterfactuals, not two shares of one total: they do not add up.

Writes drift.js (window.DRIFT) and drift.json. No text of any report or incident is read or written.
"""
import csv, hashlib, io, json, os, sys, tarfile, collections

csv.field_size_limit(10**9)

HERE = os.path.dirname(os.path.abspath(__file__))
D75_SHA = '05e6fe40dfcae543eb68f909405cbbc2510e0c6fb7f6478d0c97409cd909f2cb'
D77_SHA = 'c49de4f1569d766ec6837bf4a2f9666be44664c4a264c189290fc9580c451ccb'
SNAP_SHA = 'c10825888fb716bb91a67319f3292324a7f962f68e6e82326aedd4d694a7aad0'


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def js(path):
    t = open(path, encoding='utf-8').read()
    return json.loads(t[t.index('{'):t.rindex('}') + 1])


d75, d77, snap = sys.argv[1], sys.argv[2], sys.argv[3]
assert sha(snap) == SNAP_SHA, 'snapshot hash differs'
assert sha(d75) == D75_SHA, "the Field's data75.js differs from the file this work was built on"
assert sha(d77) == D77_SHA, "the Field's data77.js differs from the file the check was built on"
N = js(os.path.join(HERE, 'named.js'))
CHECK = json.load(open(os.path.join(HERE, 'check.json')))['res']
DOM = {row[0]: row[3] for row in js(d75)['rows']}
D77 = js(d77)
ROWS = N['rows']                       # id, year, kinds, slugs, first reporter, response, act
VALUE = N['kinds'].index('value')

# the class as the snapshot itself carries it: the first classification of each incident, as the Field took it
with tarfile.open(snap, 'r:bz2') as t:
    raw = t.extractfile('mongodump_full_snapshot/classifications_MIT.csv').read().decode('utf-8')
MIT = {}
for m in csv.DictReader(io.StringIO(raw)):
    MIT.setdefault(int(m['Incident ID']), m)
for i, m in MIT.items():
    assert DOM[i] == int(m['Risk Domain'].split('.')[0]), ('the Field and the snapshot differ on the class of', i)
assert sum(1 for d in DOM.values() if d) == len(MIT)
SUBS = {'4.1': 'disinformation, surveillance and influence at scale', '4.3': 'fraud, scams and targeted manipulation'}

# ------------------------------------------------------------------ the kinds of incident, fixed before any count
# MIT AI Risk Repository domain number -> this page's group. 5 and 6 are too few to stand alone (65 together).
GROUPS = [
    ('M', [4], 'a person doing harm with a system', 'malicious actors and misuse'),
    ('F', [3], 'false or misleading information', 'misinformation'),
    ('P', [2], 'privacy and security', 'privacy and security'),
    ('D', [1], 'discrimination and toxicity', 'discrimination and toxicity'),
    ('S', [7], 'the system itself failing', 'AI system safety, failures and limitations'),
    ('O', [5, 6], 'other', 'human-computer interaction; socioeconomic and environmental'),
]
ORDER = [g[0] for g in GROUPS]
OF = {d: g[0] for g in GROUPS for d in g[1]}

blocks = collections.OrderedDict()
for r in ROWS:
    b = (r[0] - 1) // 200 * 200 + 1
    B = blocks.setdefault(b, {'n': 0, 'good': 0, 'first': r[0], 'last': r[0], 'classed': 0, 'classed_good': 0,
                              'unclassed': 0, 'unclassed_good': 0, 'last_classed': 0,
                              'cells': {g: [0, 0, 0] for g in ORDER}, 'sub': {k: [0, 0] for k in SUBS}})
    good = VALUE in r[2]
    ei = 'epistemic-integrity' in r[3]
    B['n'] += 1; B['good'] += good; B['last'] = max(B['last'], r[0])
    d = DOM.get(r[0], 0)
    if d:
        c = B['cells'][OF[d]]
        c[0] += 1; c[1] += good; c[2] += ei
        B['classed'] += 1; B['classed_good'] += good; B['last_classed'] = max(B['last_classed'], r[0])
        sd = MIT[r[0]]['Risk Subdomain'][:3]
        if sd in SUBS:
            B['sub'][sd][0] += 1; B['sub'][sd][1] += good
    else:
        B['unclassed'] += 1; B['unclassed_good'] += good

# the blocks agree with the third state's count of goods per block
for b, B in blocks.items():
    assert B['good'] == CHECK['blocks'][str(b)]['value'] and B['n'] == CHECK['blocks'][str(b)]['n'], b

FULL = [b for b, B in blocks.items() if B['unclassed'] == 0]            # every incident classed
PART = [b for b, B in blocks.items() if B['classed'] and B['unclassed']]  # the class runs out inside
NONE = [b for b, B in blocks.items() if not B['classed']]
assert FULL == [1, 201, 401, 601, 801, 1001, 1201] and PART == [1401] and NONE == [1601, 1801]
# in the partial block the classed incidents are the earlier ones, with no unclassed number among them
p = blocks[1401]
assert all(DOM.get(r[0], 0) for r in ROWS if 1401 <= r[0] <= p['last_classed'])
assert not any(DOM.get(r[0], 0) for r in ROWS if r[0] > p['last_classed'])

pool = {g: [sum(blocks[b]['cells'][g][0] for b in FULL), sum(blocks[b]['cells'][g][1] for b in FULL)] for g in ORDER}
POOL_N = sum(v[0] for v in pool.values())
MIX = {g: pool[g][0] / POOL_N for g in ORDER}
RATE = {g: pool[g][1] / pool[g][0] for g in ORDER}

out_blocks = {}
for b in FULL + PART:
    B = blocks[b]
    n = B['classed']
    assert all(B['cells'][g][0] > 0 for g in ORDER), ('an empty cell', b)
    actual = 100 * B['classed_good'] / n
    kinds_held = 100 * sum(MIX[g] * B['cells'][g][1] / B['cells'][g][0] for g in ORDER)
    naming_held = 100 * sum(B['cells'][g][0] / n * RATE[g] for g in ORDER)
    out_blocks[str(b)] = {
        'from': b, 'to': B['last_classed'], 'n': n, 'good': B['classed_good'], 'partial': b in PART,
        'cells': B['cells'], 'sub': B['sub'], 'actual': round(actual), 'kinds_held': round(kinds_held), 'naming_held': round(naming_held)}

total_classed = sum(B['classed'] for B in blocks.values())
total_unclassed = sum(B['unclassed'] for B in blocks.values())
# 1,498 incidents carry a class; the Field counts 1,496, leaving out two incidents with no report on record
assert total_classed == 1498 and total_classed + total_unclassed == len(ROWS) == 1803
NO_REPORT = [row[0] for row in js(d75)['rows'] if row[2] == 'no report' and row[3]]
assert total_classed - len(NO_REPORT) == js(d75)['res']['classified_mit'] == 1496
dom_n = collections.Counter(OF[d] for d in DOM.values() if d)
assert dom_n['M'] == 566

first, turn0, turn1, last = out_blocks['1'], out_blocks['801'], out_blocks['1201'], out_blocks['1401']
acts4 = D77['res']['B']['by_domain']['4']
res = {
    'field_data75_sha256': D75_SHA, 'field_data77_sha256': D77_SHA,
    'classed': total_classed, 'classed_field': total_classed - len(NO_REPORT), 'unclassed': total_unclassed, 'first_unclassed': p['last_classed'] + 1,
    'pool_n': POOL_N, 'pool_to': blocks[FULL[-1]]['last'],
    'mix_pct': {g: round(100 * MIX[g]) for g in ORDER}, 'rate_pct': {g: round(100 * RATE[g]) for g in ORDER},
    'pool': pool,
    'misuse_all': dom_n['M'],
    # the three readings at the two ends of the fully classed record
    'actual_first': first['actual'], 'actual_last': turn1['actual'],
    'kinds_held_first': first['kinds_held'], 'kinds_held_last': turn1['kinds_held'],
    'naming_held_first': first['naming_held'], 'naming_held_last': turn1['naming_held'],
    'naming_held_from_601': [out_blocks[str(b)]['naming_held'] for b in (601, 801, 1001, 1201)],
    # the turn: two blocks with nearly one mix of kinds
    'turn_misuse_n': [turn0['cells']['M'][0], turn1['cells']['M'][0]],
    'turn_misuse_good': [turn0['cells']['M'][1], turn1['cells']['M'][1]],
    'turn_misuse_ei': [turn0['cells']['M'][2], turn1['cells']['M'][2]],
    'turn_false_n': [turn0['cells']['F'][0], turn1['cells']['F'][0]],
    'turn_false_good': [turn0['cells']['F'][1], turn1['cells']['F'][1]],
    'turn_good': [turn0['good'], turn1['good']],
    'turn_fraud_n': [turn0['sub']['4.3'][0], turn1['sub']['4.3'][0]],
    'turn_fraud_good': [turn0['sub']['4.3'][1], turn1['sub']['4.3'][1]],
    'before_fraud_n': out_blocks['1001']['sub']['4.3'][0], 'before_fraud_good': out_blocks['1001']['sub']['4.3'][1],
    'partial_fraud_n': last['sub']['4.3'][0], 'partial_fraud_good': last['sub']['4.3'][1],
    'fraud_all': sum(1 for m in MIT.values() if m['Risk Subdomain'][:3] == '4.3'),
    # the turn of the record itself
    'first_misuse': first['cells']['M'][0], 'first_failing': first['cells']['S'][0], 'first_n': first['n'],
    'last_misuse': turn1['cells']['M'][0], 'last_failing': turn1['cells']['S'][0], 'last_n': turn1['n'],
    'failing_good': pool['S'][1], 'failing_n': pool['S'][0],
    'partial_misuse_good': last['cells']['M'][1], 'partial_misuse_n': last['cells']['M'][0],
    'partial_n': last['n'], 'partial_to': last['to'],
    # where nothing failed: the Field's checked acts inside the class of misuse
    'misuse_answered': acts4['n'], 'misuse_acts': acts4['P'], 'misuse_acts_on_user': acts4['P_user'],
    'misuse_acts_on_maker': acts4['P_maker'],
}
assert res['misuse_acts'] == res['misuse_acts_on_user'] + res['misuse_acts_on_maker']

groups = [{'k': g[0], 'mit': g[1], 'name': g[2], 'mit_name': g[3]} for g in GROUPS]
payload = {'groups': groups, 'subs': SUBS, 'blocks': out_blocks, 'res': res}
with open(os.path.join(HERE, 'drift.js'), 'w', encoding='utf-8') as f:
    f.write('window.DRIFT=' + json.dumps(payload, separators=(',', ':')) + ';\n')
with open(os.path.join(HERE, 'drift.json'), 'w', encoding='utf-8') as f:
    json.dump(payload, f, indent=1)
print(json.dumps(res, indent=1))
for b, B in out_blocks.items():
    print(b, B['n'], B['actual'], B['kinds_held'], B['naming_held'], B['cells'])
