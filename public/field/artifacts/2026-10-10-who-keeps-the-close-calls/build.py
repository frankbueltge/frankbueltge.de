"""Builds index.html from template.html and the data files. Usage: python3 -I build.py"""
import json, os, csv
H = os.path.dirname(os.path.abspath(__file__)); D = os.path.join(H, 'data')
ev = json.load(open(os.path.join(D, 'events.json')))
res = json.load(open(os.path.join(D, 'results.json')))
cf = json.load(open(os.path.join(D, 'counterfactual.json')))
cites = {r['entry']: r['cited_domains'] for r in csv.DictReader(open(os.path.join(D, 'fli_cited_domains.tsv')), delimiter='\t')}
for e in ev:
    fl = [k.split(' ')[1] for k in e['labels'] if k.startswith('FLI ')]
    e['fli_cites_ph'] = any('nuclearfiles' in cites.get(x, '') for x in fl)
data = {'events': ev, 'results': {k: res[k] for k in ('primary', 'all_years', 'predictions', 'leave_one_keeper_out',
                                                      'fli_shared_with_ph', 'second_matching', 'keepers')},
        'cf': {'FLI': cf['FLI_summary'], 'WP': cf['WP_summary']}}
data['results']['second_matching'] = {k: v for k, v in res['second_matching'].items() if k != 'differing_pairs'}
t = open(os.path.join(H, 'template.html'), encoding='utf-8').read()
open(os.path.join(H, 'index.html'), 'w', encoding='utf-8').write(t.replace('/*DATA*/null', json.dumps(data, separators=(',', ':'))))
print('index.html written,', len(ev), 'events')
