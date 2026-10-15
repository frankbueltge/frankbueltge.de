"""Who saw the fourteen (session 189).

Usage: python3 -I analyse.py <path to mongodump_full_snapshot/>

Reads data/coding.tsv (this practice's coding of each incident's first observer and of prong (a),
under the rule in PREREGISTRATION.md) and the snapshot's incidents.csv and reports.csv, and writes
data/results.json. Only ids, dates, source domains and report titles are written out
(AI Incident Database, CC BY-SA 4.0; report titles keep their own rights and are short).
"""
import csv, json, os, re, statistics, sys

csv.field_size_limit(10**9)
SNAP = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
D = lambda *p: os.path.join(HERE, 'data', *p)
IDS = [65, 1152, 1604, 1627, 1628, 1629, 1633, 1642, 1649, 1668, 1673, 1685, 1700, 1707]
SETTING = {i: s for i, s in [(65, 'test'), (1152, 'deployed'), (1604, 'test'), (1627, 'test'),
           (1628, 'test'), (1629, 'test'), (1633, 'test'), (1642, 'deployed'), (1649, 'test'),
           (1668, 'other'), (1673, 'deployed'), (1685, 'test'), (1700, 'test'), (1707, 'deployed')]}
# Exploratory, not registered: a standing public record whose recording rule predates the event
# (a wiki's public edit history; a public URL-scanning service's logs) read as passing prong (a).
EXPLORATORY_A = {1668: 'public edit history of the wiki', 1707: 'public URL-scanning service logs (related attempts)'}


def rows(name):
    with open(os.path.join(SNAP, name), newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


inc = {int(r['incident_id']): r for r in rows('incidents.csv')}
rep = {r['report_number']: r for r in rows('reports.csv')}
code = {}
for line in open(D('coding.tsv'), encoding='utf-8'):
    if line.strip():
        i, obs, a, why = line.rstrip('\n').split('\t')
        code[int(i)] = {'observer': obs, 'prong_a': a, 'reason': why}
assert sorted(code) == IDS

out = []
for i in IDS:
    r = inc[i]
    rs = sorted((rep[n] for n in re.findall(r'\d+', r['reports']) if n in rep), key=lambda x: x['date_published'])
    c = code[i]
    b = 'fail' if c['observer'] == 'maker' else 'pass'
    out.append({'id': i, 'title': r['title'], 'incident_date': r['date'], 'setting': SETTING[i],
                'deployers': json.loads(r['Alleged deployer of AI system']),
                'reports': len(rs), 'domains': sorted({x['source_domain'] for x in rs}),
                'first_report': {'date': rs[0]['date_published'][:10], 'domain': rs[0]['source_domain'],
                                 'title': rs[0]['title']},
                'report_set': '|'.join(sorted(x['report_number'] for x in rs)),
                'observer': c['observer'], 'prong_a': c['prong_a'], 'prong_b': b,
                'independent': c['prong_a'] == 'pass' and b == 'pass',
                'independent_exploratory': b == 'pass' and (c['prong_a'] == 'pass' or i in EXPLORATORY_A),
                'reason': c['reason']})

n_dom = [len(x['domains']) for x in out]
deployed = [x for x in out if x['setting'] == 'deployed']
obs_counts = {}
for x in out:
    obs_counts[x['observer']] = obs_counts.get(x['observer'], 0) + 1
res = {
    'snapshot': 'backup-20261005101424',
    'n': len(out),
    'observer_counts': obs_counts,
    'prong_b_fail': sum(x['prong_b'] == 'fail' for x in out),
    'prong_a_pass': sum(x['prong_a'] == 'pass' for x in out),
    'independent_registered': sum(x['independent'] for x in out),
    'independent_exploratory': [x['id'] for x in out if x['independent_exploratory']],
    'distinct_disclosures': len({x['report_set'] for x in out}),
    'with_irregular': [x['id'] for x in out if 'irregular' in x['deployers']],
    'domains_per_incident': {'values': n_dom, 'median': statistics.median(n_dom)},
    'deployed': {'n': len(deployed), 'b_pass_a_fail': sum(x['prong_b'] == 'pass' and x['prong_a'] == 'fail' for x in deployed)},
    'first_report_is_maker_domain': [x['id'] for x in out if x['first_report']['domain'] in
                                     ('blog.openai.com', 'openai.com', 'anthropic.com')],
}
res['predictions'] = {
    'Q1': {'pred': '0 of 14 pass both prongs', 'obs': res['independent_registered'], 'held': res['independent_registered'] == 0},
    'Q2': {'pred': '>= 9 fail prong (b)', 'obs': res['prong_b_fail'], 'held': res['prong_b_fail'] >= 9},
    'Q3': {'pred': '>= 4 of the deployed pass (b) and fail (a); registered as "of the 5", there are 4',
           'obs': [res['deployed']['b_pass_a_fail'], res['deployed']['n']], 'held': res['deployed']['b_pass_a_fail'] >= 4},
    'Q4': {'pred': 'median distinct source domains <= 3', 'obs': res['domains_per_incident']['median'],
           'held': res['domains_per_incident']['median'] <= 3},
}
res['incidents'] = out
json.dump(res, open(D('results.json'), 'w'), indent=1, ensure_ascii=False)
print(json.dumps({k: v for k, v in res.items() if k != 'incidents'}, indent=1))
