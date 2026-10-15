"""The machine that labels the machine (session 188).

Usage: python3 -I analyse.py <path to mongodump_full_snapshot/>

Reads data/frame.json (fixed before reading) and data/readings.tsv (this practice's readings:
id, verdict, setting, reason; every incident read and not listed there was read as 'no'), and
writes data/results.json and data/cells.json. No incident text is written out; titles are
kept for the incidents that meet or are unclear (CC BY-SA 4.0, AI Incident Database).
"""
import csv, json, math, os, re, sys

csv.field_size_limit(10**9)
SNAP = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
D = lambda *p: os.path.join(HERE, 'data', *p)


def rows(name):
    with open(os.path.join(SNAP, name), newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def wilson(k, n, z=1.96):
    if n == 0:
        return None
    p = k / n
    d = 1 + z * z / n
    c = p + z * z / (2 * n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return [max(0.0, round((c - h) / d, 4)), round((c + h) / d, 4)]


inc = {int(r['incident_id']): r for r in rows('incidents.csv')}
mit = {int(r['Incident ID']): r for r in rows('classifications_MIT.csv')}
fr = json.load(open(D('frame.json')))
cand = set(int(i) for i in fr['candidates'])
lab71 = set(fr['labelled_7_1'])
sample = set(fr['sample'])

reading = {}
for line in open(D('readings.tsv'), encoding='utf-8'):
    if line.strip():
        i, v, s, why = line.rstrip('\n').split('\t')
        reading[int(i)] = {'verdict': v, 'setting': s, 'reason': why}

# --- what was read, and how -------------------------------------------------------------
registered = lab71 | cand | sample                      # read on description, as pre-registered
unlab = set(i for i in inc if i not in mit)
AG = re.compile(r'\bagent|autonomous|evaluation|red[- ]team|system card|Replit|Palisade|Apollo', re.I)
explor_desc = set(i for i in unlab - cand if AG.search(inc[i]['title'] + inc[i]['description']))
explor_desc |= {1152, 1230, 1469, 1627, 1642, 1685, 1275, 1674, 1714, 1723}
explor_title = unlab - cand - explor_desc               # read on title, description where the title raised it
read_all = registered | explor_desc | explor_title
assert set(reading) <= read_all, set(reading) - read_all


def verdict(i):
    return reading.get(i, {}).get('verdict', 'no')


def label(i):
    return mit[i]['Risk Subdomain'][:3] if i in mit else 'none'


def summarise(ids):
    meets = sorted(i for i in ids if verdict(i) == 'meets')
    unclear = sorted(i for i in ids if verdict(i) == 'unclear')
    return {'read': len(ids), 'meets': len(meets), 'unclear': len(unclear), 'meets_ids': meets,
            'unclear_ids': unclear,
            'meets_labelled_7_1': sum(1 for i in meets if label(i) == '7.1'),
            'meets_outside_or_unlabelled': sum(1 for i in meets if label(i) != '7.1'),
            'meets_test_setting': sum(1 for i in meets if reading[i]['setting'] == 'test')}


reg = summarise(registered)
allr = summarise(read_all)
max_classified = max(mit)
year = lambda i: int(inc[i]['date'][:4])

res = {
    'snapshot': 'backup-20261005101424',
    'incidents': len(inc), 'classified': len(mit), 'unclassified': len(unlab),
    'max_classified_id': max_classified,
    'unclassified_below_max_classified': sum(1 for i in unlab if i < max_classified),
    'frame_candidates': len(cand), 'n_terms': len(fr['terms']),
    'frame_candidates_labelled_7_1': len(cand & lab71),
    'labelled_7_1': {str(i): verdict(i) for i in sorted(lab71)},
    'sample': {'n': len(sample), 'pool': fr['sample_pool'],
               'meets': sum(1 for i in sample if verdict(i) == 'meets'),
               'wilson95': wilson(sum(1 for i in sample if verdict(i) == 'meets'), len(sample))},
    'registered': reg,
    'exploratory_added': {'read_on_description': len(explor_desc), 'read_on_title': len(explor_title)},
    'all_read': allr,
    'frame_recall_on_all_meets': [sum(1 for i in allr['meets_ids'] if i in cand), allr['meets']],
    'unclassified_census': summarise(unlab),
    'meets_by_year': {}, 'predictions': {},
}
for i in allr['meets_ids']:
    res['meets_by_year'][str(year(i))] = res['meets_by_year'].get(str(year(i)), 0) + 1
P = res['predictions']
P['P1'] = {'pred': '>= 30 candidates', 'obs': len(cand), 'held': len(cand) >= 30}
P['P2'] = {'pred': '>= 6 meet (registered reading)', 'obs': reg['meets'], 'held': reg['meets'] >= 6}
P['P3'] = {'pred': '>= half of meets outside 7.1 or unlabelled', 'obs': [reg['meets_outside_or_unlabelled'], reg['meets']],
           'held': 2 * reg['meets_outside_or_unlabelled'] >= reg['meets'] > 0}
P['P4'] = {'pred': '>= 1 of 3 labelled 7.1 does not meet', 'obs': sum(1 for i in lab71 if verdict(i) == 'no'),
           'held': sum(1 for i in lab71 if verdict(i) == 'no') >= 1}
P['P5'] = {'pred': '>= half of meets in a test setting', 'obs': [reg['meets_test_setting'], reg['meets']],
           'held': 2 * reg['meets_test_setting'] >= reg['meets'] > 0}
P['P6'] = {'pred': '0 of 60 sampled non-candidates meet', 'obs': res['sample']['meets'], 'held': res['sample']['meets'] == 0}
json.dump(res, open(D('results.json'), 'w'), indent=1)

# --- one row per incident for the page -----------------------------------------------------
cells = []
for i in sorted(inc):
    v = verdict(i) if i in read_all else 'unread'
    row = {'id': i, 'y': year(i), 'lab': label(i), 'v': v,
           'how': 'reg' if i in registered else ('desc' if i in explor_desc else ('title' if i in explor_title else 'unread'))}
    if v in ('meets', 'unclear'):
        row['t'] = inc[i]['title']
        row['why'] = reading[i]['reason']
        row['set'] = reading[i]['setting']
    cells.append(row)
json.dump(cells, open(D('cells.json'), 'w'), separators=(',', ':'))
print(json.dumps({k: res[k] for k in ('registered', 'all_read', 'predictions', 'frame_recall_on_all_meets', 'sample', 'max_classified_id', 'unclassified_below_max_classified', 'meets_by_year')}, indent=1))
