"""Named For Them — third state: the check.

Usage: python3 -I build_check.py <backup-20261109100729.tar.bz2> <the Field's data77.js> <the Field's check77/press-sample.json>

Starts nothing new. It reads the work's figures a second time against their sources and writes check.js / check.json:

  1. The Field's figures as its own check (study 77) left them: 60 public acts, not 50; whom each lands on; the harmed
     who wrote first, with the Field's estimate over the whole record and its interval; the four harmed who wrote first
     in the press. The joins of the second state (named twice and acted on) are recomputed on the checked acts.
  2. The thirty first reports, recoded by one stated rule (hand_codes.json, block "check"); the draw is asserted again.
  3. The drift of goods, split by which good: epistemic integrity, privacy, any other.
  4. Whose hand: who submitted each incident's earliest-submitted report (the snapshot carries no editor of the column).
  5. The corrections of counts the critique found: 22 and 1, not 23; what "a public act of step 2" lit.
  6. What the hand reading of names does to "someone who could claim", computed on the draw.

No text of any report is written out. No person who submitted a report is named: the account is counted, not shown.
"""
import csv, hashlib, io, json, math, os, random, re, sys, tarfile, collections

csv.field_size_limit(10**9)
HERE = os.path.dirname(os.path.abspath(__file__))
SNAP_SHA = 'c10825888fb716bb91a67319f3292324a7f962f68e6e82326aedd4d694a7aad0'
D77_SHA = 'c49de4f1569d766ec6837bf4a2f9666be44664c4a264c189290fc9580c451ccb'
P77_SHA = '171a9f88d81167eacb77d7290abcdf4a0855de2276d26a396a0fd54e11e5483b'
SEED = 20261115


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


def wilson(k, n, z=1.96):
    p = k / n
    c = (p + z * z / (2 * n)) / (1 + z * z / n)
    w = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / (1 + z * z / n)
    return [round(100 * (c - w)), round(100 * (c + w))]


snap, d77p, p77p = sys.argv[1:4]
assert sha(snap) == SNAP_SHA, 'snapshot hash differs'
assert sha(d77p) == D77_SHA, "the Field's data77.js differs from the file this check read"
assert sha(p77p) == P77_SHA, "the Field's press-sample.json differs from the file this check read"

with tarfile.open(snap, 'r:bz2') as t:
    INC = list(csv.DictReader(io.StringIO(t.extractfile('mongodump_full_snapshot/incidents.csv').read().decode('utf-8'))))
    REP = {int(r['report_number']): r
           for r in csv.DictReader(io.StringIO(t.extractfile('mongodump_full_snapshot/reports.csv').read().decode('utf-8')))}


def load_js(path):
    txt = open(path, encoding='utf-8').read()
    return json.loads(txt[txt.index('{'):txt.rindex('}') + 1])


NAMED = load_js(os.path.join(HERE, 'named.js'))
VOICE = load_js(os.path.join(HERE, 'voice.js'))
D77 = load_js(d77p)
P77 = json.load(open(p77p, encoding='utf-8'))
HAND = json.load(open(os.path.join(HERE, 'hand_codes.json'), encoding='utf-8'))
J = lambda s: json.loads(s or '[]')
F = D77['res']

# ---------------------------------------------------------------- 1. the Field's checked figures
# acts row: id, year, incident date, body, act, act date, target, deployer is a public body (by the column),
#           state, did the system work, in the first reading, borderline
acts = {a[0]: {'body': a[3], 'act': a[4], 'target': a[6], 'public_deployer': a[7], 'state': a[8], 'system': a[9],
               'first_reading': a[10], 'borderline': a[11]} for a in D77['acts']}
tc = collections.Counter(a['target'] for a in acts.values())
assert len(acts) == 60 == F['B']['public_final'] and tc['user'] == 36 and tc['maker'] == 24
assert F['B']['public_first'] == 50 == VOICE['res']['acted']
writer = {a[0]: a[2] for a in D77['A']}                       # the Field's final code of the 58
assert collections.Counter(writer.values())['harmed'] == 21 == F['A']['final_harmed']
assert writer == {int(k): v for k, v in VOICE['writer'].items()}, 'a writer code moved in the Field\'s check'
press_harmed = sorted(x['id'] for x in P77['items'] if x['code'] == 'harmed')
assert press_harmed == F['press']['harmed_ids'] and len(P77['items']) == 120
field_own_words = sum(1 for x in P77['items'] if x.get('own_words'))
assert field_own_words == F['press']['own_words']

twice = {int(k): v for k, v in VOICE['twice'].items()}
acted_user_twice = sorted(i for i, a in acts.items() if a['target'] == 'user' and i in twice and twice[i]['dep'])
acted_maker_twice = sorted(i for i, a in acts.items() if a['target'] == 'maker' and i in twice)
n_dep = sum(1 for v in twice.values() if v['dep'])
by_chance = round(tc['user'] * n_dep / len(INC), 1)
user_worked = sum(1 for a in acts.values() if a['target'] == 'user' and a['system'] == 'worked')
public_deployer = sorted(i for i, a in acts.items() if a['public_deployer'])

# ---------------------------------------------------------------- 2. the thirty, by one rule
pop = sorted(r[0] for r in NAMED['rows'] if r[4] == 'press and other' and any(k in (0, 1, 4) for k in r[2]))
vdraw = sorted(random.Random(SEED).sample(pop, 30))
rows = HAND['check']['rows']
assert vdraw == [r['id'] for r in rows], 'the recoded sample is not the seeded draw'
first = {r['id']: r['code'] for r in HAND['voice']['rows']}
for r in rows:
    assert r['first'] == first[r['id']] and r['code'] in ('own', 'body', 'other', 'none')
vc = collections.Counter(r['code'] for r in rows)
moved = [[r['id'], r['first'], r['code']] for r in rows if r['first'] != r['code']]
assert vc['own'] + vc['body'] + len([m for m in moved if m[1] == 'own' and m[2] == 'other']) == VOICE['res']['voice']['own']
in_field_sample = sorted(set(vdraw) & {x['id'] for x in P77['items']})

# ---------------------------------------------------------------- 3. the drift, by which good
kinds = NAMED['pk']
blocks = collections.OrderedDict()
for x in INC:
    i = int(x['incident_id'])
    h = J(x['Alleged harmed or nearly harmed parties'])
    goods = [s for s in h if kinds.get(s) == 'value']
    b = str((i - 1) // 200 * 200 + 1)
    c = blocks.setdefault(b, collections.Counter())
    c['n'] += 1
    if not goods:
        continue
    c['value'] += 1
    c['ei' if 'epistemic-integrity' in goods else ('privacy' if 'privacy' in goods else 'othergood')] += 1
blocks = collections.OrderedDict(sorted(blocks.items(), key=lambda kv: int(kv[0])))
for b, c in blocks.items():
    assert c['value'] == NAMED['res']['by_entry_block_of_200'][b]['value'] == c['ei'] + c['privacy'] + c['othergood']

# ---------------------------------------------------------------- 4. whose hand
# The incidents table of the snapshot has no editor field. The reports table names who submitted each report.
# Per incident: the submitters field of its earliest-submitted report (lowest report number on a tie).
sub_of, good_of = {}, {}
for x in INC:
    i = int(x['incident_id'])
    reps = [REP[n] for n in J(x['reports']) if n in REP]
    if not reps:
        continue
    f0 = min(reps, key=lambda r: (r['date_submitted'], int(r['report_number'])))
    sub_of[i] = f0['submitters']
    good_of[i] = any(kinds.get(s) == 'value' for s in J(x['Alleged harmed or nearly harmed parties']))
top, top_n = collections.Counter(sub_of.values()).most_common(1)[0]
hand = collections.OrderedDict()
for i, s in sorted(sub_of.items()):
    b = str((i - 1) // 200 * 200 + 1)
    c = hand.setdefault(b, collections.Counter())
    c['n'] += 1
    if s == top:
        c['top'] += 1
        c['top_good'] += good_of[i]
    else:
        c['rest'] += 1
        c['rest_good'] += good_of[i]

# ---------------------------------------------------------------- 5. counts the critique found wrong
R = NAMED['rows']
no_claimant = sum(1 for r in R if r[3] and not any(k in (0, 1, 4) for k in r[2]))
none_named = sum(1 for r in R if not r[3])
step2_matched = sorted(r[0] for r in R if r[6])
assert no_claimant == NAMED['res']['no_claimant'] == 22 and none_named == 1

# ---------------------------------------------------------------- 6. the hand reading of names and "could claim"
things = [r['slug'] for r in HAND['names']['rows'] if r['hand'] == 'thing']
thing_inc, thing_sole = set(), set()
for x in INC:
    h = J(x['Alleged harmed or nearly harmed parties'])
    if any(s in things for s in h):
        i = int(x['incident_id'])
        thing_inc.add(i)
        if not any(kinds.get(s) in ('persons', 'users', 'maker') and s not in things for s in h):
            thing_sole.add(i)

res = {
    'snapshot_sha256': SNAP_SHA, 'field_data77_sha256': D77_SHA, 'field_press_sample_sha256': P77_SHA, 'seed': SEED,
    'acted': len(acts), 'acted_first_reading': F['B']['public_first'], 'acted_on_user': tc['user'], 'acted_on_maker': tc['maker'],
    'acted_user_twice': acted_user_twice, 'acted_maker_twice': acted_maker_twice, 'twice_deployer': n_dep,
    'user_twice_by_chance': by_chance, 'user_system_worked': user_worked, 'public_deployer': public_deployer,
    'writer_harmed': F['A']['final_harmed'], 'writer_agree': F['A']['agreement']['agree'], 'writer_n': F['A']['agreement']['n'],
    'writer_kappa': F['A']['agreement']['kappa'],
    'press_read': 120, 'press_harmed': len(press_harmed), 'press_harmed_ids': press_harmed,
    'press_harmed_ci_pct': F['press']['ci95_pct'],
    'whole_estimate': F['whole_record']['estimate'], 'whole_estimate_ci': F['whole_record']['estimate_ci'],
    'field_own_words': field_own_words, 'field_own_words_ci_pct': wilson(field_own_words, 120),
    'voice': {k: vc[k] for k in ('own', 'body', 'other', 'none')},
    'voice_first': VOICE['res']['voice'],
    'voice_own_ci_pct': wilson(vc['own'], 30),
    'voice_own_or_body_ci_pct': wilson(vc['own'] + vc['body'], 30),
    'voice_moved': moved, 'voice_in_field_sample': in_field_sample,
    'blocks': {b: {k: c[k] for k in ('n', 'value', 'ei', 'privacy', 'othergood')} for b, c in blocks.items()},
    'hand_incidents': len(sub_of), 'hand_top_n': top_n,
    'hand_blocks': {b: {k: c[k] for k in ('n', 'top', 'top_good', 'rest', 'rest_good')} for b, c in hand.items()},
    'no_claimant': no_claimant, 'none_named': none_named, 'step2_matched': step2_matched,
    'acts_added': sum(1 for a in acts.values() if not a['first_reading']), 'acts_borderline': sum(1 for a in acts.values() if a['borderline']),
    'hand_min_since_601': min(c['top'] for b, c in hand.items() if int(b) >= 601 and c['n'] == 200),
    'thing_names': len(things), 'thing_incidents': len(thing_inc), 'thing_sole_claimant': sorted(thing_sole),
}
assert sum(res['voice'].values()) == 30
out = {'res': res,
       'acts': {str(i): a for i, a in sorted(acts.items())},
       'press_harmed': {str(x['id']): x['writer'] for x in P77['items'] if x['code'] == 'harmed'},
       'voice': rows, 'rule': HAND['check']['rule']}
with open(os.path.join(HERE, 'check.js'), 'w', encoding='utf-8') as f:
    f.write('window.CHECK=' + json.dumps(out, separators=(',', ':'), ensure_ascii=False) + ';\n')
with open(os.path.join(HERE, 'check.json'), 'w', encoding='utf-8') as f:
    json.dump({'res': res}, f, indent=1)
print(json.dumps(res, indent=1))
