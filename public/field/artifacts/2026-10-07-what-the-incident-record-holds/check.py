"""Checks for session 187. Counts itself: prints how many checks ran and asserts it equals the list length."""
import json, os
H = os.path.dirname(os.path.abspath(__file__))
R = json.load(open(os.path.join(H, 'data', 'results.json')))
C = json.load(open(os.path.join(H, 'data', 'cells.json')))['rows']
S = json.load(open(os.path.join(H, 'data', 'studio-check.json')))
page = open(os.path.join(H, 'index.html')).read()
checks = [
 ('one cell per incident', len(C) == R['incidents'] == 1713),
 ('ids unique', len({c[0] for c in C}) == len(C)),
 ('ids + missing span 1..max', len(C) + len(R['missing_ids']) == R['max_incident_id']),
 ('7.1 cells equal 7.1 count', sum(1 for c in C if c[4] == '7.1.') == R['mit']['loss_of_control']['n'] == 3),
 ('classified cells equal classified count', sum(1 for c in C if c[3] != '-') == R['mit']['classified']),
 ('coverage by year sums', sum(v['classified'] for v in R['mit']['coverage_by_year'].values()) == R['mit']['classified']),
 ('one-report count from cells', sum(1 for c in C if c[2] == 1) == R['reports_per_incident']['one']),
 ('word cells equal word count', sum(c[6] for c in C) == R['extinction_words']['incidents_with_a_report_text_hit']),
 ('studio reproduces with 2778', S['studio_recomputed_with_2778']['floor'] == [0.062, 0.0774]),
 ('field floor below studio floor', S['field_floor_range'][1] < S['studio_as_published']['population_lower'][0]),
 ('page inlines data', '/*RESULTS*/null' not in page and '/*CELLS*/null' not in page),
 ('no unsourced extinction class claim', '7.2' in page and R['mit']['dangerous_capabilities_n'] == 0),
]
failed = [n for n, ok in checks if not ok]
ran = 0
for n, ok in checks:
    ran += 1
    print(('ok   ' if ok else 'FAIL ') + n)
assert ran == len(checks)
print(f'{ran} checks, {len(failed)} failed')
raise SystemExit(1 if failed else 0)
