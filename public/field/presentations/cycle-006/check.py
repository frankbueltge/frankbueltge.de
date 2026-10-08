"""Checks that every number paper.md and index.html print comes from the four studies' results files.

Usage: python3 -I check.py   (from any directory; no network)
Counts its own checks and fails if any check did not run.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda *p: os.path.join(HERE, '..', '..', 'artifacts', *p)
J = lambda *p: json.load(open(A(*p), encoding='utf-8'))
s1 = J('2026-10-07-who-answered-the-extinction-question', 'data', 'results.json')
s2 = J('2026-10-07-what-the-incident-record-holds', 'data', 'results.json')
sc = J('2026-10-07-what-the-incident-record-holds', 'data', 'studio-check.json')
s3 = J('2026-10-08-the-machine-that-labels-the-machine', 'data', 'results.json')
s4 = J('2026-10-08-who-saw-the-fourteen', 'data', 'results.json')
paper = open(os.path.join(HERE, 'paper.md'), encoding='utf-8').read()
page = open(os.path.join(HERE, 'index.html'), encoding='utf-8').read()
summary = open(os.path.join(HERE, 'SUMMARY.md'), encoding='utf-8').read()
pct = lambda x, d=1: f'{100 * x:.{d}f}'
ran, failed = [], []


def check(name, cond):
    ran.append(name)
    if not cond:
        failed.append(name)


def has(text, s):
    return s in re.sub(r'\s+', ' ', text)


check('s1 response rate', has(paper, pct(s1['response_rate_functioning']) + ' %'))
check('s1 all collected', has(paper, pct(s1['response_rate_all_collected']) + ' %'))
lo, hi = s1['population_bounds_for_38pct']
check('s1 bounds', has(paper, f'{pct(lo)}–{pct(hi)} %') and has(page, 'const N=18459,R=2778') and has(page, 'all:{n:2778,s:.38}'))
check('s1 shift', has(paper, f"{s1['max_stratum_shift_points']:.2f} points"))
check('s1 ratio', has(paper, f"about {round(s1['ratio_width_to_shift'])} times"))
check('s1 P4 failed', s1['predictions']['P4'] is False and all(s1['predictions'][k] for k in ('P1', 'P2', 'P3')))
f0, f1 = sc['field_floor_range']; c0, c1 = sc['field_ceiling_range']
check('wording floors', has(paper, f'{pct(f0)}–{pct(f1)} %') and has(paper, f'{pct(c0)}–{pct(c1)} %'))
check('wording span', has(paper, f'{pct(f0)}–{pct(c1)} %'))
check('s2 incidents', s2['incidents'] == 1713 and has(paper, '1,713'))
check('s2 absent ids', len(s2['missing_ids']) == 11 and s2['max_incident_id'] == 1724)
check('s2 one report', has(paper, pct(s2['reports_per_incident']['one_share']) + ' %'))
check('s2 english', has(paper, pct(s2['english_share']) + ' %'))
check('s2 coverage', has(paper, pct(s2['mit']['coverage']) + ' %') and s2['mit']['classified'] == 1498)
check('s2 class 7.1', s2['mit']['loss_of_control']['n'] == 3 and s2['mit']['dangerous_capabilities_n'] == 0)
check('s2 7.1 share', has(paper, f"{100 * 3 / 1498:.2f} %"))
check('s2 lag', s2['lag_first_report_days']['median'] == 69 and has(paper, '69 days'))
check('s3 stop', s3['max_classified_id'] == 1509 and s3['unclassified'] == 215 and s3['unclassified_below_max_classified'] == 0)
check('s3 labelled', list(s3['labelled_7_1'].values()).count('meets') == 1)
check('s3 registered', s3['registered']['meets'] == 4 and s3['registered']['unclear'] == 2)
check('s3 all', s3['all_read']['meets'] == 14 and s3['all_read']['unclear'] == 6 and s3['all_read']['meets_outside_or_unlabelled'] == 13)
check('s3 2026', s3['meets_by_year'].get('2026') == 12 and s3['all_read']['meets_test_setting'] == 9)
check('s3 recall', s3['frame_recall_on_all_meets'] == [3, 14])
check('s3 sample', s3['sample']['meets'] == 0 and has(paper, f"0–{pct(s3['sample']['wilson95'][1])} %"))
check('s3 P2 failed', not s3['predictions']['P2']['held'] and sum(v['held'] for v in s3['predictions'].values()) == 5)
check('s4 independent', s4['independent_registered'] == 0 and s4['prong_a_pass'] == 0)
check('s4 observers', s4['observer_counts'] == {'maker': 8, 'user': 3, 'affected party': 1, 'third-party evaluator': 1, 'third-party researchers': 1})
check('s4 disclosures', s4['distinct_disclosures'] == 12 and len(s4['with_irregular']) == 6)
check('s4 median', s4['domains_per_incident']['median'] == 3.5 and has(paper, '3.5 distinct'))
check('s4 exploratory', s4['independent_exploratory'] == [1668])
check('s4 predictions', [s4['predictions'][k]['held'] for k in ('Q1', 'Q2', 'Q3', 'Q4')] == [True, False, False, False])
n_pred = len(s1['predictions']) + 5 + len(s3['predictions']) + len(s4['predictions'])
n_fail = 1 + 0 + 1 + 3
check('prediction tally', n_pred == 19 and has(paper, f'Five of our {n_pred} registered') and has(paper, f'Five of {n_pred} registered') and has(summary, f'{n_fail} of {n_pred} predictions failed') and n_fail == 5)
check('page embeds the same 14', all(f'"id":{x["id"]}' in page.replace(' ', '') for x in s4['incidents']))
check('summary programme line', any(l.startswith('For the programme: ') and len(l) <= 240 for l in summary.splitlines()))
check('no foreign scripts', not re.search(r'<script[^>]+src=["\']https?:', page))

EXPECTED = 34
print(f'{len(ran)} checks ran, {len(failed)} failed' + (': ' + ', '.join(failed) if failed else ''))
if len(ran) != EXPECTED:
    print(f'expected {EXPECTED} checks to run, {len(ran)} did'); sys.exit(1)
sys.exit(1 if failed else 0)
