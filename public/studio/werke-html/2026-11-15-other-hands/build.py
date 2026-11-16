"""OTHER HANDS — build the work's data (cycle 015, step 3 of the programme).

Usage: python3 -I build.py <mongodump_full_snapshot/> <field-research checkout> <ulysses checkout>

Reads the AI Incident Database snapshot of 2026-11-09 (the CSV export; fetched whole and hashed, never
committed), the Field's studies 75 to 77 and the Atelier's check of *Named For Them*, each at a pinned
commit, and writes data.js: one row per incident with its date, the class of the address of every report
it rests on in order of publication, the Field's checked codes, and what two readers found of the harmed's
words in first reports from the press. No title, no description and no report text is written out.

The address classes are the Field's rule, not rebuilt here: the definitions are read from the Field's own
analyse75.py at the pinned commit and run. The build stops unless this run gives the Field's own class for
the first report of every one of its 1,803 rows.

Second state (session 247): the first state read study 76, one reader's first coding. This reads the
Field's check (study 77: 60 public acts, not 50) and adds the press sample and the Atelier's thirty.

Third state (session 248, the check): whether an act is concluded or only begun is read from this work's own
second reading, check/state-second-reading.json (the Field coded it once and did not check it), and two acts
that went in the maker's favour are flagged. The Field's own counts are still asserted, beside the checked ones.
"""
import csv, json, sys, os, subprocess, hashlib, collections

csv.field_size_limit(10**9)
SNAP, FIELD, ATELIER = sys.argv[1], sys.argv[2], sys.argv[3]
HERE = os.path.dirname(os.path.abspath(__file__))
COMMIT = '6b562d3e1842d3a56ca8026c69b6ccc9e0a00391'
A_COMMIT = '39c8e8aa13243a2f657a18c18ebbb2fe12edebb0'
AP = 'artifacts/cycle-015/named-for-them/'
P = 'artifacts/cycle-015/what-harm-is-on-record/'
SNAP_SHA = 'c10825888fb716bb91a67319f3292324a7f962f68e6e82326aedd4d694a7aad0'
PINS, A_PINS = {}, {}


def field(name):
    b = subprocess.run(['git', '-C', FIELD, 'show', f'{COMMIT}:{P}{name}'], capture_output=True, check=True).stdout
    PINS[name] = hashlib.sha256(b).hexdigest()
    return b.decode('utf-8')


def atelier(name):
    b = subprocess.run(['git', '-C', ATELIER, 'show', f'{A_COMMIT}:{AP}{name}'], capture_output=True, check=True).stdout
    A_PINS[name] = hashlib.sha256(b).hexdigest()
    return b.decode('utf-8')


def js(text):
    return json.loads(text[text.index('=') + 1:].rstrip().rstrip(';'))


def rows(name):
    with open(os.path.join(SNAP, name), newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


inc, rep = rows('incidents.csv'), rows('reports.csv')
rep_by_num = {}
for r in rep:
    try:
        rep_by_num[int(r['report_number'])] = r
    except ValueError:
        pass

# ---- the Field's rule, run from its own file
src = field('analyse75.py')
a = src.index('# ---------------------------------------------------------------- reporter classes (fixed)')
b = src.index('mit_by = {}')
ns = {'rep_by_num': rep_by_num, 'json': json}
exec(src[a:b], ns)
klass, tokens = ns['klass'], ns['tokens']


def pubkey(r):
    try:
        e = float(r['epoch_date_published'])
    except ValueError:
        e = None
    return (e is None, e if e is not None else 0, int(r['report_number']))


D75 = js(field('data75.js'))
R75 = {r[0]: r for r in D75['rows']}
D77 = js(field('data77.js'))
R77 = json.loads(field('results77.json'))
ADJ = json.loads(field('check77/adjudication.json'))
CHK = js(atelier('check.js'))
RA = json.loads(atelier('check.json'))['res']
assert D77['res']['snapshot_sha256'] == SNAP_SHA == D75['res']['snapshot']['sha256'] == RA['snapshot_sha256']
assert RA['field_data77_sha256'] == PINS['data77.js']          # the Atelier read the same file of the Field
A = {x[0]: x for x in D77['A']}          # id, year, final code, first, second
B = {x[0]: x for x in D77['B']}          # id, year, domain, codes, target, borderline, note
ACT = {x[0]: x for x in D77['acts']}     # id, year, incident date, body, act, act date, target, public deployer,
#                                          state, system, in the first reading, borderline
PRESS = {x[0]: x for x in D77['C']}      # id, year, code, own words, writer
VOICE = {x['id']: x for x in CHK['voice']}
GM = ADJ['frontier']['general_model_makers']
GENERAL = set(GM['concluded'] + GM['opened'] + GM['inquiry_into_the_incident'] + GM['for_the_maker'])
PUBLIC_PARTY = set(R77['B']['target_is_public_body']['by_deployer_column'])
CHECK = json.load(open(os.path.join(HERE, 'check', 'state-second-reading.json'), encoding='utf-8'))
STATE = {x['id']: x for x in CHECK['acts']}
FOR_MAKER = {int(k) for k in CHECK['for_the_maker'] if k.isdigit()}
assert len(STATE) == 60 and all(STATE[i]['field'] == ACT[i][8] for i in ACT)      # the check read the Field's 60

LETTER = {'press and other': 'p', 'research': 'r', 'self-published': 's', 'maker': 'm', 'public body': 'g',
          'unknown': 'u'}
ACODE = {'harmed': 'H', 'witness': 'w', 'maker': 'm', 'record note': 'n', 'unreadable': 'x'}
VCODE = {'own': 'q', 'body': 'b', 'other': 'o', 'none': 'e'}
out, words, resp_words = [], 0, 0
notes_a, notes_act, notes_v = {}, {}, {}
for r in inc:
    i = int(r['incident_id'])
    nums = json.loads(r['reports']) if r['reports'] else []
    makers = tokens(json.loads(r['Alleged deployer of AI system'] or '[]') +
                    json.loads(r['Alleged developer of AI system'] or '[]'))
    cand = sorted((rep_by_num[n] for n in nums if n in rep_by_num), key=pubkey)
    ks = [klass(c['source_domain'], makers) for c in cand]
    first = ks[0] if ks else 'no report'
    assert first == R75[i][2], (i, first, R75[i][2])           # the Field's own class, reproduced
    hands = ''.join(LETTER[k] for k in ks)
    rs = ''.join('1' if 'response' in (c['tags'] or '') else '0' for c in cand)
    assert ('1' in rs) == bool(R75[i][5]), i
    words += len(hands)
    resp_words += rs.count('1')
    row = [i, r['date'], hands, rs]
    a, b, act = A.get(i), B.get(i), ACT.get(i)
    row.append(ACODE[a[2]] if a else '')
    row.append(b[3] if b else '')
    row.append({'user': 'u', 'maker': 'k'}[act[6]] if act else '')
    row.append({'concluded': 'c', 'opened': 'o'}[STATE[i]['final']] if act else '')
    row.append((('b' if i in PUBLIC_PARTY else '') + ('g' if i in GENERAL else '') + ('' if act[10] else 'n') +
                (('v' if i in FOR_MAKER else '') + ('s' if STATE[i]['final'] != act[8] else ''))) if act else '')
    # the harmed's words in a first report that was not self-published: the Atelier's finer code where both read it
    v = ''
    if i in VOICE:
        v = VCODE[VOICE[i]['code']]
        assert cand and int(cand[0]['report_number']) == VOICE[i]['report'], i     # it read this first report
        notes_v[str(i)] = VOICE[i]['note']
    elif i in PRESS:
        p = PRESS[i]
        v = 'W' if p[2] == 'harmed' else ('f' if p[3] else 'e')
        notes_v[str(i)] = p[4]
    row.append(v)
    out.append(row)
    if a:
        assert first == 'self-published', i
        notes_a[str(i)] = None
    if v:
        assert first != 'self-published' and not a, i
    if act:
        assert 'P' in b[3] and b[4] == act[6], i
        notes_act[str(i)] = [act[3], act[4], act[5]]
    else:
        assert not b or 'P' not in b[3], i
out.sort(key=lambda x: (x[1], x[0]))

# ---- counts, each asserted against the Field's and the Atelier's results
RB = R77['B']
n_first = sum(1 for x in out if x[2])
harmed = [x[0] for x in out if x[4] == 'H']
acted = [x for x in out if 'P' in x[5]]
c_first = collections.Counter(x[2][0] for x in out if x[2])
cv = collections.Counter(x[9] for x in out if x[9])
st = collections.Counter(x[6] + x[7] for x in acted)
assert len(out) == 1803 == D75['res']['incidents']
assert n_first == 1801 == R77['all_first_reports']
assert len(harmed) == 21 == R77['A']['final_harmed']
assert sum(1 for x in out if x[5]) == 176 == RB['n']
assert sum(1 for x in out if 'M' in x[5]) == 79 == RB['counts']['M']['first']
assert sum(1 for x in out if 'O' in x[5]) == 65 == RB['counts']['O']['first']
assert len(acted) == 60 == RB['public_final'] == RA['acted']
assert sum(1 for x in acted if x[6] == 'u') == 36 == RB['target']['user'] == RA['acted_on_user']
assert sum(1 for x in acted if x[6] == 'k') == 24 == RB['target']['maker'] == RA['acted_on_maker']
stf = collections.Counter(x[6] + ACT[x[0]][8][0] for x in acted)                    # the Field's own states
assert stf == {'uc': RB['state']['user concluded'], 'uo': RB['state']['user opened'],
               'kc': RB['state']['maker concluded'], 'ko': RB['state']['maker opened']}, stf
CF = CHECK['counts']['final']
assert st == {'uc': CF['user concluded'], 'uo': CF['user opened'], 'kc': CF['maker concluded'], 'ko': CF['maker opened']}, st
assert sum(1 for x in acted if 's' in x[8]) == len(CHECK['changed']) == 4
assert sum(1 for x in acted if 'v' in x[8]) == 2 and all(x[6] == 'k' for x in acted if 'v' in x[8])
assert sum(1 for x in acted if 'b' in x[8]) == 6 and all(x[6] == 'k' for x in acted if 'b' in x[8])
assert sum(1 for x in acted if 'g' in x[8]) == 5 and sum(1 for x in acted if 'n' in x[8]) == 10 == RB['missed_by_reading_the_opening']
assert c_first['p'] == 1659 and c_first['m'] == 23 and c_first['g'] == 37 and c_first['r'] == 24 and c_first['s'] == 58
acodes = collections.Counter(x[4] for x in out if x[4])
assert acodes == {'H': 21, 'w': 28, 'n': 6, 'm': 2, 'x': 1} == {ACODE[k]: v for k, v in R77['A']['final_codes'].items()}, acodes
PR = R77['press']
assert len(PRESS) == 120 == PR['drawn'] and len(VOICE) == 30
both = sorted(set(PRESS) & set(VOICE))
assert cv['W'] == 4 == PR['harmed'] == RA['press_harmed']
assert sum(1 for p in PRESS.values() if p[3]) == 50 == PR['own_words'] == RA['field_own_words']
field_carried = sum(1 for p in PRESS.values() if p[3] and p[2] != 'harmed')
field_none = sum(1 for p in PRESS.values() if not p[3])
va = collections.Counter(VCODE[v['code']] for v in VOICE.values())
assert va == {'q': RA['voice']['own'], 'b': RA['voice']['body'], 'o': RA['voice']['other'], 'e': RA['voice']['none']}
# every incident read twice was read the same way by both (no word of the harmed), so the union is not ambiguous
assert all(PRESS[i][3] == 0 and VOICE[i]['code'] == 'none' for i in both), both
assert cv['f'] == field_carried and cv['q'] == va['q'] and cv['b'] == va['b'] and cv['o'] == va['o']
assert cv['e'] == field_none + va['e'] - len(both)
press_read = sum(cv.values())
assert press_read == 120 + 30 - len(both)
WR = R77['whole_record']

meta = {
    'incidents': len(out), 'with_report': n_first, 'words': words, 'response_words': resp_words,
    'reports_in_snapshot': len(rep),
    'first': {'press': c_first['p'], 'research': c_first['r'], 'maker': c_first['m'], 'public': c_first['g'],
              'self': c_first['s']},
    'read_by_hand': 58, 'harmed': 21, 'witness': 28, 'record_note': 6, 'maker_on_platform': 2, 'unreadable': 1,
    'press_read': press_read, 'read_twice': len(both),
    'field_press': 120, 'press_wrote': cv['W'], 'field_carried': field_carried, 'field_none': field_none,
    'atelier_press': 30, 'own_words': va['q'], 'body_words': va['b'], 'through_another': va['o'], 'atelier_none': va['e'],
    'carried': cv['f'] + cv['b'] + cv['o'], 'read_none': cv['e'], 'first_read': 58 + press_read,
    'wrote_found': 21 + cv['W'],
    'estimate': WR['estimate'], 'estimate_lo': WR['estimate_ci'][0], 'estimate_hi': WR['estimate_ci'][1],
    'estimate_not_found': WR['estimate'] - 21 - cv['W'],
    'answered': 176, 'maker_answered': 79, 'other_answered': 65,
    'public_acted': 60, 'public_first_reading': RB['public_first'], 'found_by_check': 10,
    'on_user': 36, 'on_maker': 24,
    'user_concluded': st['uc'], 'user_opened': st['uo'], 'maker_concluded': st['kc'], 'maker_opened': st['ko'],
    'on_public_body': 6, 'general_model': 5,
    'concluded': st['uc'] + st['kc'], 'begun': st['uo'] + st['ko'],
    'state_read_again': CHECK['n'], 'state_agree': CHECK['agree'], 'state_changed': len(CHECK['changed']),
    'state_changed_ids': CHECK['changed'], 'field_concluded': stf['uc'] + stf['kc'], 'field_begun': stf['uo'] + stf['ko'],
    'for_maker': 2, 'for_maker_ids': sorted(FOR_MAKER), 'against_maker': 24 - 2,
    'red': 21 + cv['W'] + cv['q'] + cv['f'] + cv['b'] + cv['o'], 'words_inside': cv['q'] + cv['f'] + cv['b'] + cv['o'],
    'never_read': n_first - 58 - press_read,
    'first_date': out[0][1], 'last_date': out[-1][1],
    'snapshot': 'backup-20261109100729.tar.bz2', 'snapshot_sha256': SNAP_SHA,
    'field_commit': COMMIT, 'field_pins': PINS, 'atelier_commit': A_COMMIT, 'atelier_pins': A_PINS,
}
# the Field's short notes on who wrote the 58 (its first coding; the codes shown are the checked ones)
C76 = json.loads(field('coding76.json'))
notes_a = {str(x['id']): x['writer'] for x in C76['A']}
assert set(notes_a) == set(str(i) for i in A)
with open(os.path.join(HERE, 'data.js'), 'w', encoding='utf-8') as f:
    f.write('window.OH=' + json.dumps({'meta': meta, 'inc': out, 'na': notes_a, 'act': notes_act, 'nv': notes_v},
                                      ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps(meta, indent=1))
