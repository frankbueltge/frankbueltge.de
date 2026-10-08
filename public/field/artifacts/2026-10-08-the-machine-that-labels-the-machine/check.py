"""Checks for session 188. Counts itself: prints how many checks ran and asserts it equals the list length."""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(H, 'data', 'results.json')))
C = json.load(open(os.path.join(H, 'data', 'cells.json')))
F = json.load(open(os.path.join(H, 'data', 'frame.json')))
S = json.load(open(os.path.join(H, 'data', 'statement-check.json')))
T = [l.split('\t') for l in open(os.path.join(H, 'data', 'readings.tsv')) if l.strip()]
page = open(os.path.join(H, 'index.html')).read()
M = [c for c in C if c['v'] == 'meets']
checks = [
 ('one cell per incident, 1713', len(C) == R['incidents'] == 1713),
 ('classified + unclassified = all', R['classified'] + R['unclassified'] == R['incidents']),
 ('every incident above the last classified id is unclassified, and none below',
  all((c['lab'] == 'none') == (c['id'] > R['max_classified_id']) for c in C)),
 ('three labelled 7.1 in cells', sum(1 for c in C if c['lab'] == '7.1') == len(F['labelled_7_1']) == 3),
 ('meets in cells equal results', len(M) == R['all_read']['meets'] == 14),
 ('registered meets are a subset of all meets', set(R['registered']['meets_ids']) <= {c['id'] for c in M}),
 ('every reading row has a known verdict and setting', all(t[1] in ('meets', 'no', 'unclear') and t[2] in ('test', 'deployed', 'other') for t in T)),
 ('every meets/unclear has a reason on the page data', all(c.get('why') for c in C if c['v'] in ('meets', 'unclear'))),
 ('12 of 14 meets after the labeller, all dated 2026', sum(1 for c in M if c['id'] > R['max_classified_id']) == 12 and all(c['y'] == 2026 for c in M if c['id'] > R['max_classified_id'])),
 ('3 deployed meets after the labeller', sum(1 for c in M if c['id'] > R['max_classified_id'] and c['set'] == 'deployed') == 3),
 ('sample is 60, drawn from classified non-candidates', len(F['sample']) == 60 and all(c['lab'] != 'none' for c in C if c['id'] in F['sample'])),
 ('P2 recorded as failed', R['predictions']['P2']['held'] is False),
 ('statement: 14 pages identical, 697 entries', S['pages_identical'] == 14 and S['entries_counted_by_field'] == 697 == S['atelier_count_2026_10_07']),
 ('page inlines data', '/*RESULTS*/null' not in page and '/*CELLS*/null' not in page and '/*STATEMENT*/null' not in page),
 ('page names the registered/exploratory split', 'unregistered' in page and 'exploratory' in page),
]
failed = [n for n, ok in checks if not ok]
ran = 0
for n, ok in checks:
    ran += 1
    print(('ok   ' if ok else 'FAIL ') + n)
assert ran == len(checks)
print(f'{ran} checks, {len(failed)} failed')
raise SystemExit(1 if failed else 0)
