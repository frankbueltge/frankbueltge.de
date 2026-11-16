"""Named For Them — build (the Atelier, cycle 015, step 3 of the programme).

Usage: python3 -I build.py <path to backup-20261109100729.tar.bz2> <path to the Field's data75.js>

Reads one column of the AI Incident Database snapshot of 2026-11-09, "Alleged harmed or nearly harmed
parties", with the two columns beside it (alleged developer, alleged deployer), sorts every named party
into one of six kinds by the fixed rule below, joins the Field's study 75 (who wrote each incident's
first report, and whether a report tagged as a response is on record), and writes:

  named.js     window.NAMED = one row per incident and the totals the page states
  named.json   the same totals, and every party slug with its kind (so the rule can be read back)

Nothing from a report's or an incident's text is written out; only slugs the database itself publishes
as entity names. Every count the page states is computed here and asserted at the end.
"""
import csv, hashlib, io, json, os, re, sys, tarfile, collections

csv.field_size_limit(10**9)
HERE = os.path.dirname(os.path.abspath(__file__))
SNAP_SHA = 'c10825888fb716bb91a67319f3292324a7f962f68e6e82326aedd4d694a7aad0'
D75_SHA = '05e6fe40dfcae543eb68f909405cbbc2510e0c6fb7f6478d0c97409cd909f2cb'


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


snap, d75 = sys.argv[1], sys.argv[2]
assert sha(snap) == SNAP_SHA, 'snapshot hash differs'
assert sha(d75) == D75_SHA, "the Field's data75.js differs from the file this work was built on"

with tarfile.open(snap, 'r:bz2') as t:
    raw = t.extractfile('mongodump_full_snapshot/incidents.csv').read().decode('utf-8')
INC = list(csv.DictReader(io.StringIO(raw)))

txt = open(d75, encoding='utf-8').read()
D75 = json.loads(txt[txt.index('{'):txt.rindex('}') + 1])
FIELD = {row[0]: row for row in D75['rows']}   # id, year, first reporter, MIT domain, act, response


def J(s):
    return json.loads(s or '[]')


# ------------------------------------------------------------------ the rule, fixed before any count
# Six kinds of harmed party, tested in this order; the first that fits decides.
VALUE = re.compile(r'(integrity|privacy|security|safety|trust|rights|discourse|ecosystem|health|democracy|'
                   r'sovereignty|autonomy|stability|wellbeing|well-being)$')
NOT_VALUE = re.compile(r'(department|nhs|foundation|catholic|pindrop|dr\.|florida-title|organizations|'
                       r'patients|followers|office|agency|ministry|commission|council|authority|-inc|-ltd)')
PUBLIC = re.compile(r'^(general-public|the-public|public$|society|citizens|humanity|everyone|people$|'
                    r'global-population|world-population|internet-users$)')
USERS = re.compile(r'-(users|customers|subscribers|clients|account-holders|owners|drivers|passengers|'
                   r'players|viewers|listeners|readers|followers|members)$')
UNKNOWN = {'unknown', 'none', 'unknown-parties', 'unknown-victims', 'unspecified'}

developers = set()
for x in INC:
    developers |= set(J(x['Alleged developer of AI system']))


def kind(slug):
    if slug in UNKNOWN:
        return 'unnamed'
    if VALUE.search(slug) and not NOT_VALUE.search(slug):
        return 'value'
    if PUBLIC.search(slug):
        return 'public'
    if USERS.search(slug):
        return 'users'
    if slug in developers:
        return 'maker'
    return 'persons'


KINDS = ['persons', 'users', 'public', 'value', 'maker', 'unnamed']
# persons  — people, singly or as a group named by what they are or do (minors, teachers, a named person)
# users    — people named by the product they use (facebook-users, tesla-drivers): the maker's word for them
# public   — the general public, of a country or of all
# value    — no person at all: a good named as harmed (epistemic-integrity, privacy, democratic-integrity)
# maker    — a party that also stands in the record as the developer of some AI system (a firm, an office)
# unnamed  — "unknown", "none"

# Who could make a claim (Felstiner, Abel and Sarat 1980-81, p. 635: a claim is voiced by "someone with a
# grievance ... to the person or entity believed to be responsible"): persons, users and makers can; the
# public acts only through officials; a value cannot feel wronged.
CAN_CLAIM = {'persons', 'users', 'maker'}

rows, party_kind = [], {}
by_year = collections.defaultdict(lambda: collections.Counter())
tot = collections.Counter()
mentions = collections.Counter()
inc_kind = collections.Counter()
by_entry = collections.defaultdict(collections.Counter)
first_by_claim = collections.defaultdict(collections.Counter)
resp_by_claim = collections.Counter()
for x in INC:
    i = int(x['incident_id'])
    y = int(x['date'][:4])
    harmed = J(x['Alleged harmed or nearly harmed parties'])
    ks = []
    for s in harmed:
        k = kind(s)
        party_kind[s] = k
        ks.append(k)
        mentions[k] += 1
    present = sorted(set(ks), key=KINDS.index)
    claimant = any(k in CAN_CLAIM for k in ks)
    has_value = 'value' in ks
    f = FIELD.get(i)
    first = f[2] if f else 'no report'
    resp = bool(f[5]) if f else False
    tot['incidents'] += 1
    for k in present:
        inc_kind[k] += 1
    blk = (i - 1) // 200
    by_entry[blk]['n'] += 1
    by_entry[blk]['value'] += has_value
    tot['named_none'] += (len(harmed) == 0)
    tot['with_value'] += has_value
    tot['no_claimant'] += (len(harmed) > 0 and not claimant)
    tot['only_value'] += (len(harmed) > 0 and set(ks) <= {'value'})
    by_year[y]['n'] += 1
    by_year[y]['value'] += has_value
    by_year[y]['no_claimant'] += (len(harmed) > 0 and not claimant)
    lane = 'claimant' if claimant else ('none named' if not harmed else 'no claimant')
    first_by_claim[lane][first] += 1
    resp_by_claim[lane] += resp
    # compact row: id, year, kinds present (indexes), the party slugs as the record names them, first reporter, response, act
    rows.append([i, y, [KINDS.index(k) for k in present], harmed, first, 1 if resp else 0,
                 (f[4] if f else '')])

rows.sort(key=lambda r: r[0])   # entry order: the database numbers incidents as it admits them
years = sorted(by_year)
res = {
    'snapshot_sha256': SNAP_SHA,
    'field_data75_sha256': D75_SHA,
    'incidents': tot['incidents'],
    'distinct_parties': len(party_kind),
    'mentions': {k: mentions[k] for k in KINDS},
    'parties_by_kind': {k: sum(1 for s in party_kind if party_kind[s] == k) for k in KINDS},
    'named_none': tot['named_none'],
    'incidents_with_kind': {k: inc_kind[k] for k in KINDS},
    'by_entry_block_of_200': {str(b * 200 + 1): dict(by_entry[b]) for b in sorted(by_entry)},
    'with_value': tot['with_value'],
    'no_claimant': tot['no_claimant'],
    'only_value': tot['only_value'],
    'by_year': {str(y): dict(by_year[y]) for y in years},
    'first_by_lane': {k: dict(v) for k, v in first_by_claim.items()},
    'response_by_lane': dict(resp_by_claim),
    'lane_n': {k: sum(v.values()) for k, v in first_by_claim.items()},
    'top_value': collections.Counter({s: 0 for s in party_kind if party_kind[s] == 'value'}).most_common(0),
}
cnt = collections.Counter()
for x in INC:
    for s in J(x['Alleged harmed or nearly harmed parties']):
        cnt[s] += 1
res['top'] = {k: [[s, cnt[s]] for s, _ in sorted(((s, cnt[s]) for s in party_kind if party_kind[s] == k),
                                                    key=lambda t: (-t[1], t[0]))[:8]] for k in KINDS}
del res['top_value']


# value share before and after the record began naming goods as harmed: first year with a value party
def share(lo, hi, key):
    n = sum(by_year[y]['n'] for y in years if lo <= y <= hi)
    v = sum(by_year[y][key] for y in years if lo <= y <= hi)
    return n, v


res['value_2015_2022'] = share(2015, 2022, 'value')
res['value_2023_2026'] = share(2023, 2026, 'value')
res['noclaim_2015_2022'] = share(2015, 2022, 'no_claimant')
res['noclaim_2023_2026'] = share(2023, 2026, 'no_claimant')

# ------------------------------------------------------------------ assertions
assert res['incidents'] == 1803 == D75['res']['incidents']
assert sum(res['lane_n'].values()) == res['incidents']
assert res['lane_n'].get('none named', 0) == res['named_none']
assert res['lane_n'].get('no claimant', 0) == res['no_claimant']
assert sum(res['parties_by_kind'].values()) == res['distinct_parties']
assert res['only_value'] <= res['no_claimant']
assert sum(r[5] for r in rows) == D75['res']['incidents_with_response_report']

with open(os.path.join(HERE, 'named.js'), 'w', encoding='utf-8') as f:
    f.write('window.NAMED=' + json.dumps({'kinds': KINDS, 'rows': rows, 'res': res, 'pk': party_kind}, separators=(',', ':')) + ';\n')
with open(os.path.join(HERE, 'named.json'), 'w', encoding='utf-8') as f:
    json.dump({'res': res, 'party_kind': dict(sorted(party_kind.items()))}, f, indent=1, ensure_ascii=False)
print(json.dumps({k: res[k] for k in res if k not in ('by_year', 'party_kind')}, indent=1))
