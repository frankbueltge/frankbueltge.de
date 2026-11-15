"""OTHER HANDS — build the work's data (cycle 015, step 3 of the programme).

Usage: python3 -I build.py <path to mongodump_full_snapshot/> <path to a field-research checkout>

Reads the AI Incident Database snapshot of 2026-11-09 (the CSV export; fetched whole and hashed, never
committed) and the Field's studies 75 and 76 at a pinned commit, and writes data.js: one row per incident
with its date, the class of the address of every report it rests on in order of publication, and the
Field's hand codes. No title, no description and no report text is written out.

The address classes are the Field's rule, not rebuilt here: the definitions are read from the Field's own
analyse75.py at the pinned commit and run. The build stops unless this run gives the Field's own class for
the first report of every one of its 1,803 rows.
"""
import csv, json, sys, os, subprocess, hashlib, collections

csv.field_size_limit(10**9)
SNAP, FIELD = sys.argv[1], sys.argv[2]
HERE = os.path.dirname(os.path.abspath(__file__))
COMMIT = '88429e5028e2c847d72a6c52e079b35f1aa34abb'
P = 'artifacts/cycle-015/what-harm-is-on-record/'
SNAP_SHA = 'c10825888fb716bb91a67319f3292324a7f962f68e6e82326aedd4d694a7aad0'
PINS = {
    'analyse75.py': None, 'data75.js': None, 'coding76.json': None, 'results76.json': None, 'data76.js': None,
}


def field(name):
    b = subprocess.run(['git', '-C', FIELD, 'show', f'{COMMIT}:{P}{name}'], capture_output=True, check=True).stdout
    PINS[name] = hashlib.sha256(b).hexdigest()
    return b.decode('utf-8')


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


D75 = json.loads(field('data75.js').split('=', 1)[1].rstrip(';\n'))
R75 = {r[0]: r for r in D75['rows']}
C76 = json.loads(field('coding76.json'))
R76 = json.loads(field('results76.json'))
field('data76.js')
assert C76['snapshot_sha256'] == SNAP_SHA == D75['res']['snapshot']['sha256']
A = {x['id']: x for x in C76['A']}
B = {x['id']: x for x in C76['B']}

LETTER = {'press and other': 'p', 'research': 'r', 'self-published': 's', 'maker': 'm', 'public body': 'g',
          'unknown': 'u'}
ACODE = {'harmed': 'H', 'witness': 'w', 'maker': 'm', 'record note': 'n', 'unreadable': 'x'}
out, words, resp_words = [], 0, 0
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
    a76 = A.get(i)
    b76 = B.get(i)
    row.append(ACODE[a76['code']] if a76 else '')
    row.append(''.join(b76['codes']) if b76 else '')
    row.append({'user': 'u', 'maker': 'k'}.get(b76.get('act_target'), '') if b76 else '')
    out.append(row)
    if a76:
        assert first == 'self-published', i
out.sort(key=lambda x: (x[1], x[0]))

# ---- counts, each asserted against the Field's results
n_first = sum(1 for x in out if x[2])
harmed = [x[0] for x in out if x[4] == 'H']
acted = [x for x in out if 'P' in x[5]]
c_first = collections.Counter(x[2][0] for x in out if x[2])
assert len(out) == 1803 == D75['res']['incidents']
assert n_first == 1801 == R76['A']['all_first_reports']
assert sorted(harmed) == sorted(R76['A']['harmed_ids']) and len(harmed) == 21
assert sum(1 for x in out if x[5]) == 176 == R76['B']['n']
assert sum(1 for x in out if 'M' in x[5]) == 79 == R76['B']['maker_responded']
assert len(acted) == 50 == R76['B']['public_body_acted']
assert sum(1 for x in out if 'O' in x[5]) == 65 == R76['B']['other_responded']
assert sum(1 for x in acted if x[6] == 'u') == 30 == R76['B']['act_target']['user']
assert sum(1 for x in acted if x[6] == 'k') == 20 == R76['B']['act_target']['maker']
assert c_first['p'] == 1659 and c_first['m'] == 23 and c_first['g'] == 37 and c_first['r'] == 24 and c_first['s'] == 58
acodes = collections.Counter(x[4] for x in out if x[4])
assert acodes == {'H': 21, 'w': 28, 'n': 6, 'm': 2, 'x': 1}, acodes

meta = {
    'incidents': len(out), 'with_report': n_first, 'words': words, 'response_words': resp_words,
    'reports_in_snapshot': len(rep),
    'first': {'press': c_first['p'], 'research': c_first['r'], 'maker': c_first['m'], 'public': c_first['g'],
              'self': c_first['s']},
    'read_by_hand': 58, 'harmed': 21, 'witness': 28, 'record_note': 6, 'maker_on_platform': 2, 'unreadable': 1,
    'answered': 176, 'maker_answered': 79, 'public_acted': 50, 'other_answered': 65,
    'on_user': 30, 'on_maker': 20,
    'first_date': out[0][1], 'last_date': out[-1][1],
    'snapshot': 'backup-20261109100729.tar.bz2', 'snapshot_sha256': SNAP_SHA,
    'field_commit': COMMIT, 'field_pins': PINS,
}
notes_a = {str(i): x['writer'] for i, x in A.items()}
notes_b = {str(i): x['note'] for i, x in B.items() if x.get('note')}
with open(os.path.join(HERE, 'data.js'), 'w', encoding='utf-8') as f:
    f.write('window.OH=' + json.dumps({'meta': meta, 'inc': out, 'na': notes_a, 'nb': notes_b},
                                      ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps(meta, indent=1))
