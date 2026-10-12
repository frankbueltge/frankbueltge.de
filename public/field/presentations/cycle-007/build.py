"""Builds index.html from template.html and the five studies' results files (no network)."""
import csv, json, os
H = os.path.dirname(os.path.abspath(__file__))
A = lambda *p: os.path.join(H, '..', '..', 'artifacts', *p)
J = lambda *p: json.load(open(A(*p), encoding='utf-8'))
s1 = J('2026-10-09-the-near-miss-in-the-record', 'data', 'results.json')
s2 = J('2026-10-10-who-keeps-the-close-calls', 'data', 'results.json')
s3 = J('2026-10-11-could-they-have-known', 'data', 'results.json')
s4 = J('2026-10-12-near-to-the-same-thing', 'data', 'results.json')
s5 = J('2026-10-11-how-far-the-record-sees', 'data', 'results.json')
cells = J('2026-10-09-the-near-miss-in-the-record', 'data', 'cells.json')
short = {'AI tangible harm near-miss': 'near miss', 'AI tangible harm issue': 'issue', 'AI tangible harm event': 'harm event'}
near = [{'id': x['id'], 'ann': [[a, short.get(v, v)] for a, v in x['ann']]} for x in cells if x['final'] == 'AI tangible harm near-miss']
hin = list(csv.DictReader(open(A('2026-10-12-near-to-the-same-thing', 'data', 'hinges.tsv'), encoding='utf-8'), delimiter='\t'))
names = {e['event']: e['label'] for e in s3['events']}
d = {
    'ai': {'specific': {k: [v['value'], v['both'], v['a'] + v['b']] for k, v in s1['pairs']['specific'].items()},
           'kappa': s1['pairs']['kappa'], 'pairs': s1['pairs']['n'], 'final_near': s1['exploratory']['final_near_ids'], 'near': near,
           'top_called': s1['exploratory']['top_annotator']['final_near_where_top_called_near'],
           'other_called': s1['exploratory']['top_annotator']['final_near_where_another_called_near']},
    'nuc': {'by_count': s2['primary']['by_count'], 'union': s2['primary']['union'], 'dice': s2['primary']['dice_pairs'],
            'dice_mean': s2['primary']['dice_mean'], 'adj': s3['primary']['dice_adjusted'], 'unadj': s3['primary']['dice_unadjusted'],
            'structural': s3['primary']['omissions']['structural'], 'omissions': s3['primary']['omissions']['total'],
            'pairs': s4['pairs'], 'per_event': s4['per_event']},
    'hinges': [{'e': r['event'], 'y': r['year'], 'k': r['keeper'], 'h': r['hinge'] == '1', 's': r['steps'], 'a': r['actor'], 'kind': r['kind']} for r in hin],
    'names': {e: names.get(e, e) for e in s4['per_event']},
    'sky': [{'bin': b, 'n': v['n'], 'C': v['C'], 'ci': v['C_ci95'], 'held': v.get('held_vs_inner_density')} for b, v in s5['primary_2015_2025']['by_bin'].items()],
}
emb = json.dumps(d, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
t = open(os.path.join(H, 'template.html'), encoding='utf-8').read()
open(os.path.join(H, 'index.html'), 'w', encoding='utf-8').write(t.replace('__DATA__', emb))
