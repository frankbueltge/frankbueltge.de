"""Checks that the numbers paper.md, SUMMARY.md and index.html print come from the five studies' results files.

Usage: python3 -I check.py   (from any directory; no network)
Counts its own checks and fails if any check did not run.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda *p: os.path.join(HERE, '..', '..', 'artifacts', *p)
J = lambda *p: json.load(open(A(*p), encoding='utf-8'))
s1 = J('2026-10-09-the-near-miss-in-the-record', 'data', 'results.json')
s2 = J('2026-10-10-who-keeps-the-close-calls', 'data', 'results.json')
s3 = J('2026-10-11-could-they-have-known', 'data', 'results.json')
s4 = J('2026-10-12-near-to-the-same-thing', 'data', 'results.json')
s5 = J('2026-10-11-how-far-the-record-sees', 'data', 'results.json')
T = lambda n: re.sub(r'\s+', ' ', open(os.path.join(HERE, n), encoding='utf-8').read())
paper, summary, page = T('paper.md'), T('SUMMARY.md'), T('index.html')
pct = lambda x, d=0: f'{100 * x:.{d}f}'
ran, failed = [], []


def check(name, cond):
    ran.append(name)
    if not cond:
        failed.append(name)


p1 = s1['pairs']
check('s1 kappa', f"κ = {p1['kappa']:.2f}" in paper and f"{p1['kappa_ci95'][0]:.2f}–{p1['kappa_ci95'][1]:.2f}" in paper and p1['n'] == 158)
check('s1 near 35, event 72', pct(p1['specific']['AI tangible harm near-miss']['value']) + ' %' in paper and pct(p1['specific']['AI tangible harm event']['value']) + ' %' in paper)
diag = sum(n for a, b, n in p1['unordered_confusion'] if a == b)
check('s1 raw agreement', diag == 126 and pct(diag / p1['n'], 1) + ' %' in paper)
check('s1 near calls 17, both 3', p1['specific']['AI tangible harm near-miss']['a'] + p1['specific']['AI tangible harm near-miss']['b'] == 17 and p1['specific']['AI tangible harm near-miss']['both'] == 3)
ta = s1['exploratory']['top_annotator']
check('s1 one annotator 10, other 2', ta['final_near_where_top_called_near'] == 10 == len(s1['exploratory']['final_near_ids']) and ta['final_near_where_another_called_near'] == 2)
check('s1 coverage', s1['coverage']['final'] == 214 and s1['coverage']['max_id'] == 619 and '12.5 %' in paper)
pr = s2['primary']
check('s2 union and counts', pr['union'] == 53 and pr['by_count'] == {'1': 26, '2': 13, '3': 11, '4': 3} and '| 26 | 13 | 11 | 3 |' in paper)
check('s2 one-list share', pct(pr['share_one'], 1) + ' %' in paper)
check('s2 dice', f"**{pr['dice_mean']:.2f}** ({pr['dice_mean_ci95'][0]:.2f}–{pr['dice_mean_ci95'][1]:.2f})" in paper)
check('s2 extremes', f"{min(pr['dice_pairs'].values()):.2f}" in paper and f"**{max(pr['dice_pairs'].values()):.2f}**" in paper)
check('s2 copying', s2['fli_shared_with_ph'] == {'shared_events': 16, 'citing_nuclearfiles': 13})
check('s2 leave-one-out', f"{s2['leave_one_keeper_out']['without_FLI']['dice_mean']:.2f}" in paper and pct(s2['leave_one_keeper_out']['without_WP']['share_one']) + ' %' in paper)
q = s3['primary']
check('s3 structural', q['omissions']['structural'] == 8 and q['omissions']['total'] == 74 and pct(q['omissions']['structural_share'], 1) + ' %' in paper)
check('s3 by keeper', {k: v['structural'] for k, v in q['omissions']['by_keeper'].items()} == {'PH': 4, 'CH': 3, 'FLI': 1, 'WP': 0})
check('s3 dice gain', f"**{q['dice_unadjusted']:.2f} to {q['dice_adjusted']:.2f}**" in paper and f"gain {q['dice_gain']:.3f}" in paper)
check('s3 sensitivity', s3['sensitivity_same_year_unavailable']['omissions']['structural'] == 9 and s3['sensitivity_all_dated_incl_unchecked']['omissions']['structural'] == 13)
check('s3 rho', f"ρ = +{s3['spearman_nm_year_vs_keepers']['rho']:.2f}" in paper)
p4 = s4['pairs']
check('s4 pairs', (p4['pairs'], p4['named_both'], p4['same_hinge']) == (51, 22, 16) and pct(p4['share_same']) + ' %' in paper)
lo, hi = s4['ci95_by_event']['share_same']
check('s4 interval', f"{pct(lo)}–{pct(hi)} %" in paper)
check('s4 given both', pct(p4['same_given_named_both']) + ' %' in paper)
check('s4 kinds', s4['hinge_kinds'] == {'person': 20, 'system': 4, 'chance': 2})
check('s4 orbit check', f"{100 * s4['orbit_check']['held_vs_inner_density_bent_set_aside']:.1f} %" in paper and s4['orbit_check']['h26_28_inner_shell_bent'] == 54)
check('s4 readers kappa', f"κ = {s4['readers_kappa']['kappa']:.2f}" in paper)
bb = s5['primary_2015_2025']['by_bin']
check('s5 n', s5['primary_2015_2025']['n'] == 14536 and '14,536' in paper)
check('s5 C per bin', all(f"{v['C']:.2f}" in paper for v in bb.values()))
check('s5 held 26-28', f"**{100 * bb['26-28']['held_vs_inner_density']:.1f} %** ({100 * bb['26-28']['held_ci95'][0]:.1f}–{100 * bb['26-28']['held_ci95'][1]:.1f})" in paper)
check('s5 held others', all(f"{100 * bb[k]['held_vs_inner_density']:.{d}f} %" in paper for k, d in (('22-24', 0), ('24-26', 0), ('28-30', 1), ('>=30', 1))))
check('s5 excluded 17', s5['excluded']['no_v_inf'] == 17)
fails = (1  # s1 P5 (README of study 6; not in its results file)
         + sum(v['verdict'] == 'failed' for v in s2['predictions'].values())
         + sum(v['verdict'] == 'failed' for v in s3['predictions'].values())
         + sum(v['verdict'] == 'failed' for v in s4['predictions'].values())
         + sum(v['verdict'] == 'failed' for v in s5['predictions'].values()))
n_pred = 5 + len(s2['predictions']) + len(s3['predictions']) + len(s4['predictions']) + len(s5['predictions'])
check('prediction tally', n_pred == 23 and fails == 6 and 'Six of our 23 predictions failed' in paper and '6 of 23 predictions failed' in summary)
check('programme line', any(l.startswith('For the programme: ') and len(l) <= 240 for l in open(os.path.join(HERE, 'SUMMARY.md'), encoding='utf-8').read().splitlines()))
check('page embeds the same data', '"same_hinge":16' in page and '"union":53' in page and '"structural":8' in page)
check('no foreign scripts', not re.search(r'<script[^>]+src=["\']https?:', page))

EXPECTED = 32
print(f'{len(ran)} checks ran, {len(failed)} failed' + (': ' + ', '.join(failed) if failed else ''))
if len(ran) != EXPECTED:
    print(f'expected {EXPECTED} checks to run, {len(ran)} did'); sys.exit(1)
sys.exit(1 if failed else 0)
