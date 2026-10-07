"""What the incident record holds (session 187).

Usage: python3 -I analyse.py <path to mongodump_full_snapshot/>

Reads the CSV export of the AI Incident Database snapshot backup-20261005101424 and writes
data/results.json (aggregates) and data/cells.json (one row per incident: id, year, report
count, MIT domain and subdomain, first-report lag; no text). Nothing from the snapshot's report
texts is written out except counts.
"""
import csv, json, sys, os, re, statistics, collections, datetime

csv.field_size_limit(10**9)
SNAP = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))


def rows(name):
    with open(os.path.join(SNAP, name), newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


inc = rows('incidents.csv')
rep = rows('reports.csv')
mit = rows('classifications_MIT.csv')
dup = rows('duplicates.csv')

ids = [int(r['incident_id']) for r in inc]
assert len(ids) == len(set(ids)), 'duplicate incident ids'
n_inc = len(inc)
missing_ids = sorted(set(range(1, max(ids) + 1)) - set(ids))

rep_by_num = {}
for r in rep:
    try:
        rep_by_num[int(r['report_number'])] = r
    except ValueError:
        pass

# --- reports per incident -------------------------------------------------------------
per_inc = {}
for r in inc:
    nums = json.loads(r['reports']) if r['reports'] else []
    per_inc[int(r['incident_id'])] = nums
counts = [len(v) for v in per_inc.values()]
linked = set(n for v in per_inc.values() for n in v)
linked_found = [rep_by_num[n] for n in linked if n in rep_by_num]

# --- years ---------------------------------------------------------------------------
year = {int(r['incident_id']): int(r['date'][:4]) for r in inc if r['date'][:4].isdigit()}
by_year = collections.Counter(year.values())

# --- lag from incident date to the first report submitted to the database ---------------
def ep(x):
    try:
        v = float(x)
        return v if v > 0 else None
    except ValueError:
        return None

lag = {}
for r in inc:
    i = int(r['incident_id'])
    subs = [ep(rep_by_num[n]['epoch_date_submitted']) for n in per_inc[i] if n in rep_by_num]
    subs = [s for s in subs if s]
    try:
        d0 = datetime.datetime.strptime(r['date'], '%Y-%m-%d').replace(tzinfo=datetime.timezone.utc).timestamp()
    except ValueError:
        continue
    if subs:
        lag[i] = (min(subs) - d0) / 86400.0

lag_by_year = {}
for y in sorted(by_year):
    v = [lag[i] for i in lag if year.get(i) == y]
    if v:
        lag_by_year[y] = {'n': len(v), 'median_days': round(statistics.median(v), 1)}

# --- languages and sources over the reports linked to incidents ------------------------
lang = collections.Counter((r['language'] or '').strip().lower() or '(none)' for r in linked_found)
dom = collections.Counter((r['source_domain'] or '').strip().lower() or '(none)' for r in linked_found)

# --- deployers ----------------------------------------------------------------------------
dep = collections.Counter()
for r in inc:
    for d in set(json.loads(r['Alleged deployer of AI system'] or '[]')):
        dep[d] += 1
top5 = dep.most_common(5)
top5_any = sum(1 for r in inc if set(json.loads(r['Alleged deployer of AI system'] or '[]')) & {d for d, _ in top5})

# --- MIT classification -----------------------------------------------------------------
mit_by = {}
for m in mit:
    mit_by.setdefault(int(m['Incident ID']), []).append(m)
mit_multi = sum(1 for v in mit_by.values() if len(v) > 1)
classified = [i for i in ids if i in mit_by]
dom_c = collections.Counter(mit_by[i][0]['Risk Domain'] for i in classified)
sub_c = collections.Counter(mit_by[i][0]['Risk Subdomain'] for i in classified)
ent_c = collections.Counter(mit_by[i][0]['Entity'] for i in classified)
tim_c = collections.Counter(mit_by[i][0]['Timing'] for i in classified)
int_c = collections.Counter(mit_by[i][0]['Intent'] for i in classified)
cov_by_year = {y: {'n': by_year[y], 'classified': sum(1 for i in classified if year.get(i) == y)} for y in sorted(by_year)}
LOC = '7.1. AI pursuing its own goals in conflict with human goals or values'
DANG = '7.2. AI possessing dangerous capabilities'
MASS = '4.2. Cyberattacks, weapon development or use, and mass harm'
title = {int(r['incident_id']): r['title'] for r in inc}
loc_ids = sorted(i for i in classified if mit_by[i][0]['Risk Subdomain'] == LOC)

# --- the word in the record -------------------------------------------------------------
WORD = re.compile(r'\b(human extinction|extinction of (humanity|the human)|existential (risk|threat))', re.I)
inc_word = sorted(int(r['incident_id']) for r in inc if WORD.search(r['title'] + ' ' + r['description']))
rep_word_inc = sorted(i for i, v in per_inc.items() if any(n in rep_by_num and WORD.search(rep_by_num[n]['text'] or '') for n in v))
rep_word_n = sum(1 for r in linked_found if WORD.search(r['text'] or ''))
word_sub = collections.Counter(mit_by[i][0]['Risk Subdomain'] if i in mit_by else '(unclassified)' for i in rep_word_inc)

res = {
    'snapshot': 'backup-20261005101424.tar.bz2',
    'snapshot_sha256': '46af6f306e09a2a0cbe18d50d6c81fd362047876572e5fc4022bc0dd4419e378',
    'incidents': n_inc,
    'max_incident_id': max(ids),
    'missing_ids': missing_ids,
    'duplicates_rows': len(dup),
    'reports_rows': len(rep),
    'reports_linked': len(linked),
    'reports_linked_found': len(linked_found),
    'reports_per_incident': {
        'median': statistics.median(counts), 'mean': round(statistics.mean(counts), 2),
        'max': max(counts), 'one': sum(1 for c in counts if c == 1),
        'one_share': round(sum(1 for c in counts if c == 1) / n_inc, 4),
        'zero': sum(1 for c in counts if c == 0),
    },
    'incidents_by_year': dict(sorted(by_year.items())),
    'lag_first_report_days': {
        'n': len(lag), 'median': round(statistics.median(lag.values()), 1),
        'share_over_365': round(sum(1 for v in lag.values() if v > 365) / len(lag), 4),
        'by_year': lag_by_year,
    },
    'languages': dict(lang.most_common()),
    'english_share': round(lang['en'] / sum(v for k, v in lang.items() if k != '(none)'), 4),
    'source_domains_top10': dom.most_common(10),
    'source_domains_distinct': len(dom),
    'deployers_distinct': len(dep),
    'deployers_top5': top5,
    'deployers_top5_any_share': round(top5_any / n_inc, 4),
    'mit': {
        'classified': len(classified), 'coverage': round(len(classified) / n_inc, 4),
        'incidents_with_more_than_one_row': mit_multi,
        'coverage_by_year': cov_by_year,
        'domains': dict(dom_c.most_common()),
        'subdomains': dict(sub_c.most_common()),
        'entity': dict(ent_c), 'timing': dict(tim_c), 'intent': dict(int_c),
        'loss_of_control': {'n': len(loc_ids), 'share_of_classified': round(len(loc_ids) / len(classified), 4),
                            'ids': loc_ids, 'titles': {i: title[i] for i in loc_ids}},
        'dangerous_capabilities_n': sub_c.get(DANG, 0),
        'mass_harm_n': sub_c.get(MASS, 0),
    },
    'extinction_words': {
        'pattern': WORD.pattern,
        'incidents_title_or_description': inc_word,
        'incidents_with_a_report_text_hit': len(rep_word_inc),
        'reports_with_hit': rep_word_n,
        'those_incidents_by_mit_subdomain': dict(word_sub.most_common()),
        'titles_title_or_description': {i: title[i] for i in inc_word},
    },
}

cells = []
for r in inc:
    i = int(r['incident_id'])
    m = mit_by.get(i, [{}])[0]
    cells.append([i, year.get(i), len(per_inc[i]), m.get('Risk Domain', '')[:1] or '-',
                  m.get('Risk Subdomain', '').split(' ')[0] or '-',
                  None if i not in lag else round(lag[i]), 1 if i in rep_word_inc else 0])
cells.sort()

os.makedirs(os.path.join(HERE, 'data'), exist_ok=True)
json.dump(res, open(os.path.join(HERE, 'data', 'results.json'), 'w'), indent=1, ensure_ascii=False)
json.dump({'columns': ['id', 'year', 'reports', 'mit_domain', 'mit_subdomain', 'lag_days', 'extinction_word_in_a_report'],
           'rows': cells}, open(os.path.join(HERE, 'data', 'cells.json'), 'w'), separators=(',', ':'))
print(json.dumps({k: res[k] for k in ['incidents', 'reports_per_incident', 'english_share', 'deployers_top5_any_share']}, indent=1))
print('mit', res['mit']['coverage'], res['mit']['loss_of_control'], res['mit']['dangerous_capabilities_n'], res['mit']['mass_harm_n'])
print('lag', res['lag_first_report_days']['median'], res['lag_first_report_days']['share_over_365'])
print('word', res['extinction_words']['incidents_title_or_description'], res['extinction_words']['incidents_with_a_report_text_hit'], res['extinction_words']['reports_with_hit'])
print(res['extinction_words']['those_incidents_by_mit_subdomain'])
print(res['mit']['coverage_by_year'])
print(res['incidents_by_year'], res['missing_ids'], res['deployers_top5'])
