"""Named For Them — second state: the voice, the two columns, the rule read by hand.

Usage: python3 -I build_voice.py <backup-20261109100729.tar.bz2> <the Field's data76.js> <the Field's coding76.json>

Adds to the first state (build.py, named.js) three things and writes voice.js / voice.json:

  1. The Field's study 76, joined by incident: who wrote each of the 58 self-published first reports
     (read by hand by the Field), and for each of the 50 incidents where a public body acted, whether
     the act lands on the person who used the AI or on a developer or deployer.
  2. Named twice: incidents where the same party slug stands in the harmed column and in the deployer
     or developer column of the same incident. A rule on the slugs, no reading.
  3. This practice's two hand readings (hand_codes.json): 150 party names drawn by seed and read
     against the rule's kinds, and 30 press-first incidents drawn by seed whose first report was read
     for the words of the harmed. The draws are recomputed here and asserted against the file.

No text of any report is written out; notes in hand_codes.json are this practice's own words.
"""
import csv, hashlib, io, json, math, os, random, sys, tarfile, collections

csv.field_size_limit(10**9)
HERE = os.path.dirname(os.path.abspath(__file__))
SNAP_SHA = 'c10825888fb716bb91a67319f3292324a7f962f68e6e82326aedd4d694a7aad0'
D76_SHA = '1107168689f3dc5950ef2596fa9e9bf9fa6d4a55fec046c7ca4b1346e5378f8f'
C76_SHA = 'aa7afb050b4efcda32f7939279e50778bd1912e70cec3235d2e9dfb0243766ef'
SEED = 20261115


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


snap, d76p, c76p = sys.argv[1:4]
assert sha(snap) == SNAP_SHA, 'snapshot hash differs'
assert sha(d76p) == D76_SHA, "the Field's data76.js differs from the file this state was built on"
assert sha(c76p) == C76_SHA, "the Field's coding76.json differs from the file this state was built on"

with tarfile.open(snap, 'r:bz2') as t:
    INC = list(csv.DictReader(io.StringIO(t.extractfile('mongodump_full_snapshot/incidents.csv').read().decode('utf-8'))))
    REP = {int(r['report_number']): (r['date_published'], r['source_domain'])
           for r in csv.DictReader(io.StringIO(t.extractfile('mongodump_full_snapshot/reports.csv').read().decode('utf-8')))}

txt = open(os.path.join(HERE, 'named.js'), encoding='utf-8').read()
NAMED = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
txt = open(d76p, encoding='utf-8').read()
D76 = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
C76 = json.load(open(c76p, encoding='utf-8'))
HAND = json.load(open(os.path.join(HERE, 'hand_codes.json'), encoding='utf-8'))
J = lambda s: json.loads(s or '[]')

# ---------------------------------------------------------------- 1. the Field's study 76 by incident
writer = {a['id']: a['code'] for a in C76['A']}                       # harmed | witness | maker | record note | unreadable
target = {b['id']: b['act_target'] for b in C76['B'] if 'P' in b['codes']}   # user | maker
assert len(writer) == 58 == D76['res']['A']['n']
assert collections.Counter(writer.values())['harmed'] == 21 == D76['res']['A']['harmed']
assert len(target) == 50 == D76['res']['B']['public_body_acted']
tc = collections.Counter(target.values())
assert tc['user'] == 30 and tc['maker'] == 20

# ---------------------------------------------------------------- 2. named twice
twice = {}
for x in INC:
    i = int(x['incident_id'])
    h = set(J(x['Alleged harmed or nearly harmed parties']))
    dep = sorted(h & set(J(x['Alleged deployer of AI system'])))
    dev = sorted(h & set(J(x['Alleged developer of AI system'])))
    if dep or dev:
        twice[i] = {'dep': dep, 'dev': dev}
n_dep = sum(1 for v in twice.values() if v['dep'])
n_dev = sum(1 for v in twice.values() if v['dev'])
acted_user_twice = sorted(i for i in target if target[i] == 'user' and i in twice and twice[i]['dep'])
acted_maker_twice = sorted(i for i in target if target[i] == 'maker' and i in twice)

# ---------------------------------------------------------------- 3. the hand readings: the draws, recomputed
pk = NAMED['pk']
draw = random.Random(SEED).sample(sorted(pk), 150)
assert draw == [r['slug'] for r in HAND['names']['rows']], 'the name sample is not the seeded draw'
for r in HAND['names']['rows']:
    assert r['rule'] == pk[r['slug']]
nc = collections.Counter((r['rule'], r['hand']) for r in HAND['names']['rows'])
as_ruled = sum(v for (a, b), v in nc.items() if a == b)
ruled_persons = sum(v for (a, b), v in nc.items() if a == 'persons')

pop = sorted(r[0] for r in NAMED['rows'] if r[4] == 'press and other' and any(k in (0, 1, 4) for k in r[2]))
vdraw = sorted(random.Random(SEED).sample(pop, 30))
assert vdraw == [r['id'] for r in HAND['voice']['rows']], 'the voice sample is not the seeded draw'
inc = {int(x['incident_id']): x for x in INC}
for r in HAND['voice']['rows']:
    reps = sorted((REP[n][0], n) for n in J(inc[r['id']]['reports']) if n in REP)
    assert reps[0][1] == r['report'] and REP[r['report']][1] == r['domain'], r['id']
vc = collections.Counter(r['code'] for r in HAND['voice']['rows'])


def wilson(k, n, z=1.96):
    p = k / n
    c = (p + z * z / (2 * n)) / (1 + z * z / n)
    w = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return [round(100 * (c - w)), round(100 * (c + w))]


res = {
    'field_data76_sha256': D76_SHA, 'field_coding76_sha256': C76_SHA, 'seed': SEED,
    'writer': dict(collections.Counter(writer.values())),
    'self_published_read': len(writer),
    'acted': len(target), 'acted_on_user': tc['user'], 'acted_on_maker': tc['maker'],
    'twice': len(twice), 'twice_deployer': n_dep, 'twice_developer': n_dev,
    'acted_user_twice': acted_user_twice, 'acted_maker_twice': acted_maker_twice,
    'names_n': 150, 'names_as_ruled': as_ruled, 'names_ruled_persons': ruled_persons,
    'names_persons_body': nc[('persons', 'body')], 'names_persons_thing': nc[('persons', 'thing')],
    'names_persons_users': nc[('persons', 'users')], 'names_users_persons': nc[('users', 'persons')],
    'names_persons_persons': nc[('persons', 'persons')],
    'voice_population': len(pop), 'voice_n': 30,
    'voice': {k: vc[k] for k in ('own', 'other', 'none')},
    'voice_own_interval_pct': wilson(vc['own'], 30),
    'voice_any_interval_pct': wilson(vc['own'] + vc['other'], 30),
}
assert res['names_as_ruled'] == 106 and sum(res['voice'].values()) == 30
assert res['twice'] == len(set(i for i, v in twice.items()))

out = {'res': res,
       'writer': {str(k): v for k, v in sorted(writer.items())},
       'target': {str(k): v for k, v in sorted(target.items())},
       'twice': {str(k): v for k, v in sorted(twice.items())},
       'voice': HAND['voice']['rows'],
       'names': [[r['slug'], r['rule'], r['hand']] for r in HAND['names']['rows'] if r['rule'] != r['hand']]}
with open(os.path.join(HERE, 'voice.js'), 'w', encoding='utf-8') as f:
    f.write('window.VOICE=' + json.dumps(out, separators=(',', ':'), ensure_ascii=False) + ';\n')
with open(os.path.join(HERE, 'voice.json'), 'w', encoding='utf-8') as f:
    json.dump({'res': res}, f, indent=1)
print(json.dumps(res, indent=1))
