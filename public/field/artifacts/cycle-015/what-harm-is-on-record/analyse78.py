"""Study 78 (session 276, 2026-11-15) — read for the paper.

Usage: python3 -I analyse78.py <path to mongodump_full_snapshot/>
Reads the snapshot (for the submitters and the record's own columns only), coding78.json (two codings and the
third reading), data75.js, results77.json, data77.js and check77/press-sample.json. Writes results78.json and
data78.js. No report text is written. Standard library only. Predictions: PREDICTIONS78.md.
"""
import csv, json, sys, os, collections, math, hashlib

csv.field_size_limit(10**9)
SNAP = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda *p: json.load(open(os.path.join(HERE, *p)))
JS = lambda f: json.loads(open(os.path.join(HERE, f)).read().split('=', 1)[1].rstrip(';\n'))


def rows(name):
    with open(os.path.join(SNAP, name), newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def kappa(pairs):
    n = len(pairs)
    po = sum(a == b for a, b in pairs) / n
    ca, cb = collections.Counter(a for a, _ in pairs), collections.Counter(b for _, b in pairs)
    pe = sum(ca[k] * cb[k] for k in ca) / n / n
    return {'n': n, 'agree': sum(a == b for a, b in pairs), 'kappa': round((po - pe) / (1 - pe), 2)}


def wilson(k, n, z=1.96):
    p = k / n
    c = p + z * z / (2 * n)
    h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    d = 1 + z * z / n
    return (c - h) / d, (c + h) / d


D75, R77, D77, C, PS = JS('data75.js'), J('results77.json'), JS('data77.js'), J('coding78.json'), J('check77', 'press-sample.json')
ROW = {r[0]: {'y': r[1], 'k': r[2], 'd': r[3]} for r in D75['rows']}
inc = {int(r['incident_id']): r for r in rows('incidents.csv')}
rep = {}
for r in rows('reports.csv'):
    try:
        rep[int(r['report_number'])] = r
    except ValueError:
        pass


def first_report(nums):
    cand = [rep[n] for n in nums if n in rep]

    def key(r):
        try:
            e = float(r['epoch_date_published'])
        except ValueError:
            e = None
        return (e is None, e if e is not None else 0, int(r['report_number']))
    return sorted(cand, key=key)[0] if cand else None


FR = {i: first_report(json.loads(r['reports']) if r['reports'] else []) for i, r in inc.items()}
CLASSES = ['press and other', 'research', 'self-published', 'maker', 'public body']
OUTSIDE = ['research', 'self-published', 'maker', 'public body']

# ---------------------------------------------------------------- Part A: public-body first reports
A1 = {x['id']: x for x in C['first']['A']}
A2 = {x['id']: x for x in C['second']['A']}
adjA = {(x['id'], x['field']): x for x in C['adjudication']['A']}
assert set(A1) == set(A2) == {i for i, r in ROW.items() if r['k'] == 'public body'} and len(A1) == 37
kAct = kappa([(A1[i]['act'], A2[i]['act']) for i in sorted(A1)])
assert sorted(i for i in A1 if A1[i]['act'] != A2[i]['act']) == sorted(i for (i, f) in adjA if f == 'act')
final_act = {i: (adjA[(i, 'act')]['final'] if (i, 'act') in adjA else A1[i]['act']) for i in A1}
acts = sorted(i for i in final_act if final_act[i])
border = lambda i: bool(adjA.get((i, 'act'), {}).get('borderline', A1[i]['borderline']))
target = lambda i: adjA[(i, 'act_target')]['final'] if (i, 'act_target') in adjA else A1[i]['act_target']
both = [i for i in A1 if A1[i]['act'] and A2[i]['act']]
kT = kappa([(A1[i]['act_target'], A2[i]['act_target']) for i in both])
kS = kappa([(A1[i]['state'], A2[i]['state']) for i in both])
known60 = {a[0] for a in D77['acts']}
known62 = known60 | set(R77['B']['matched_outside_the_answered'])
new = [i for i in acts if i not in known62]
answered = {b[0] for b in D77['B']}
A = {
    'n': 37, 'agreement_act': kAct, 'first_act': sum(x['act'] for x in A1.values()), 'second_act': sum(bool(x['act']) for x in A2.values()),
    'final_act': len(acts), 'final_act_firm': sum(1 for i in acts if not border(i)), 'act_ids': acts,
    'not_an_act': 37 - len(acts),
    'kind_no_act': dict(collections.Counter(A1[i]['kind'] for i in A1 if not final_act[i])),
    'target': dict(collections.Counter(target(i) for i in acts)),
    'target_agreement': kT, 'state_agreement': kS,
    'state': dict(collections.Counter(A1[i]['state'] for i in acts)),
    'system': dict(collections.Counter(A1[i]['system'] for i in acts)),
    'user_system_worked': sum(1 for i in acts if target(i) == 'user' and A1[i]['system'] == 'worked'),
    'already_in_the_60': sorted(i for i in acts if i in known60),
    'new': new, 'new_n': len(new),
    'new_target': dict(collections.Counter(target(i) for i in new)),
    'new_in_answered_record': sorted(i for i in new if i in answered),
    'floor_before': len(known62), 'floor_after': len(known62) + len(new),
    'link_error': [i for i in A1 if 'link error' in A1[i]['note']],
    'operator_filed': [i for i in A1 if 'operator filed' in A1[i]['note']],
}
# all public acts on record now: the check's 60 with their targets, plus the new ones
t60 = collections.Counter(a[6] for a in D77['acts'])
allt = collections.Counter(t60)
for i in new:
    allt[target(i)] += 1
A['all_acts_read'] = len(known60) + len(new)
A['all_target'] = dict(allt)

# ---------------------------------------------------------------- Part B: maker first reports
B1 = {x['id']: x for x in C['first']['B']}
B2 = {x['id']: x for x in C['second']['B']}
adjB = {x['id']: x for x in C['adjudication']['B']}
assert set(B1) == set(B2) == {i for i, r in ROW.items() if r['k'] == 'maker'} and len(B1) == 23
kAbout = kappa([(B1[i]['about'], B2[i]['about']) for i in sorted(B1)])
assert sorted(i for i in B1 if B1[i]['about'] != B2[i]['about']) == sorted(adjB)
about = {i: (adjB[i]['final'] if i in adjB else B1[i]['about']) for i in B1}
y26 = [i for i in B1 if ROW[i]['y'] == 2026]
own = sorted(i for i in about if about[i] == 'own failure')
agentcol = lambda i: any('ai-agent-system' in s for s in json.loads(inc[i]['Alleged deployer of AI system'] or '[]') + json.loads(inc[i]['Alleged developer of AI system'] or '[]'))
dom_of = lambda i: (FR[i]['source_domain'] or '').lower()
B = {
    'n': 23, 'agreement_about': kAbout, 'about': dict(collections.Counter(about.values())),
    'about_2026': dict(collections.Counter(about[i] for i in y26)), 'n_2026': len(y26),
    'about_before_2026': dict(collections.Counter(about[i] for i in B1 if ROW[i]['y'] != 2026)),
    'not_the_maker': [i for i in B1 if not B1[i]['is_maker']],
    'own_failure_ids': own, 'own_failure_2026': sorted(i for i in own if ROW[i]['y'] == 2026),
    'own_failure_2026_agent_column': sorted(i for i in own if ROW[i]['y'] == 2026 and agentcol(i)),
    'own_failure_2026_makers': dict(collections.Counter('.'.join(dom_of(i).split('.')[-2:]) for i in own if ROW[i]['y'] == 2026)),
    'own_failure_2026_public_act': sorted(i for i in own if ROW[i]['y'] == 2026 and i in known62),
    'own_failure_2026_classified': sum(1 for i in own if ROW[i]['y'] == 2026 and ROW[i]['d']),
    'misuse_ids': sorted(i for i in about if about[i] == 'misuse by others'),
}
# the record's own column: incidents it attributes to AI agent systems
ag = sorted(i for i in inc if FR[i] and agentcol(i))
B['agent_column'] = {
    'n': len(ag), 'by_year': dict(sorted(collections.Counter(str(ROW[i]['y']) for i in ag).items())),
    'first_reporter': dict(collections.Counter(ROW[i]['k'] for i in ag)),
    'public_act': sorted(i for i in ag if i in known62 or i in new),
    'answered': sum(1 for i in ag if i in answered),
}

# ---------------------------------------------------------------- Part C: who submitted
def names(i):
    return [s.strip() for s in (FR[i]['submitters'] or '').split(',') if s.strip()]


cnt = collections.Counter(n for i in FR if FR[i] for n in names(i))
top, top_n = cnt.most_common(1)[0]
has = [i for i in FR if FR[i]]
assert len(has) == 1801
T = [i for i in has if top in names(i)]
Rr = [i for i in has if top not in names(i)]
share = lambda ids: sum(1 for i in ids if ROW[i]['k'] in OUTSIDE) / len(ids)
cls = lambda ids: {k: sum(1 for i in ids if ROW[i]['k'] == k) for k in CLASSES}
ratio = share(Rr) / share(T)
since23 = lambda ids: [i for i in ids if (ROW[i]['y'] or 0) >= 2023]
named = collections.Counter({n: c for n, c in cnt.items() if n.lower() != 'anonymous'})
Cc = {
    'distinct_submitter_names': len(cnt), 'top_n': len(T), 'rest_n': len(Rr),
    'top_pct': round(100 * len(T) / 1801, 1),
    'top4_named_n': sum(1 for i in has if set(names(i)) & {n for n, _ in named.most_common(4)}),
    'anonymous_n': sum(1 for i in has if any(n.lower() == 'anonymous' for n in names(i))),
    'top_classes': cls(T), 'rest_classes': cls(Rr),
    'top_outside_pct': round(100 * share(T), 1), 'rest_outside_pct': round(100 * share(Rr), 1),
    'ratio_rest_to_top': round(ratio, 2),
    'top_by_year': {str(y): [sum(1 for i in T if ROW[i]['y'] == y), sum(1 for i in has if ROW[i]['y'] == y)] for y in range(2019, 2027)},
    'since_2023': {'top': [sum(1 for i in since23(T) if ROW[i]['k'] in OUTSIDE), len(since23(T))],
                   'rest': [sum(1 for i in since23(Rr) if ROW[i]['k'] in OUTSIDE), len(since23(Rr))]},
    'maker_first_by_top': sum(1 for i in T if ROW[i]['k'] == 'maker'),
    'public_first_by_top': sum(1 for i in T if ROW[i]['k'] == 'public body'),
    'atelier_count': 1059,
    'note': 'The most frequent submitter is counted where its name stands among the first report\'s submitters, alone or with others; the Atelier counts 1,059 by its own rule.',
}
Cc['top4_named_pct'] = round(100 * Cc['top4_named_n'] / 1801, 1)

# ---------------------------------------------------------------- the Atelier's case (ho-2026-11-15-atelier-8)
PRESS_ITSELF = [1715, 1725]   # a publication or its staff writing about what was done to the publication
harmed = [int(x['id']) for x in PS['items'] if x['code'] == 'harmed']
assert sorted(harmed) == [215, 1190, 1715, 1725] and set(PRESS_ITSELF) <= set(harmed)
pop = PS['population']
k_other = len(harmed) - len(PRESS_ITSELF)
lo, hi = wilson(k_other, 120)
plat = R77['A']['final_harmed']
E = {
    'handoff': 'ho-2026-11-15-atelier-8', 'result': 'holds in part',
    'press_harmed': len(harmed), 'press_itself': PRESS_ITSELF, 'not_the_press': sorted(set(harmed) - set(PRESS_ITSELF)),
    'atelier_claim': 'three of five (with incident 428, which is outside the draw of 120)',
    'in_the_draw': f'{len(PRESS_ITSELF)} of {len(harmed)}',
    'not_press_pct': round(100 * k_other / 120, 1), 'not_press_ci_pct': [round(100 * lo, 1), round(100 * hi, 1)],
    'not_press_estimate_in_class': round(k_other / 120 * pop), 'not_press_estimate_ci': [round(lo * pop), round(hi * pop)],
    'whole_record_not_press': plat + round(k_other / 120 * pop),
    'whole_record_not_press_ci': [plat + round(lo * pop), plat + round(hi * pop)],
    'whole_record_all': R77['whole_record']['estimate'],
}

# ---------------------------------------------------------------- shares by year, for the figure
YEARS = ['<2012'] + [str(y) for y in range(2012, 2027)]
yk = lambda y: None if y is None else ('<2012' if y < 2012 else str(y))
by = {y: {k: 0 for k in CLASSES} for y in YEARS}
for i in has:
    y = yk(ROW[i]['y'])
    if y in by:
        by[y][ROW[i]['k']] += 1

P114 = len(acts) >= 24 and len(new) >= 18
P115 = B['about'].get('misuse by others', 0) >= 12 and B['about_2026'].get('misuse by others', 0) >= 8
P116 = ratio >= 1.5
res = {
    'study': 78, 'session': 276, 'date': '2026-11-15', 'cycle': 15, 'programme_step': 3,
    'snapshot_sha256': 'c10825888fb716bb91a67319f3292324a7f962f68e6e82326aedd4d694a7aad0',
    'predictions_file_sha256': hashlib.sha256(open(os.path.join(HERE, 'PREDICTIONS78.md'), 'rb').read()).hexdigest(),
    'A': A, 'B': B, 'C': Cc, 'atelier_case': E, 'by_year': by,
    'predictions': {'P114': P114, 'P115': P115, 'P116': P116}, 'predictions_held': sum([P114, P115, P116]),
    'all_predictions': {'studies': {'75': [1, 3], '76': [1, 3], '77': [1, 3], '78': [sum([P114, P115, P116]), 3]},
                        'held': 3 + sum([P114, P115, P116]), 'of': 12},
}
json.dump(res, open(os.path.join(HERE, 'results78.json'), 'w'), indent=1, ensure_ascii=False)
rowsA = [[i, ROW[i]['y'], 1 if final_act[i] else 0, A1[i]['kind'], A1[i]['body'], A1[i]['what'], A1[i]['act_date'],
          target(i) if final_act[i] else None, 1 if A1[i]['target_public'] else 0, A1[i]['state'] if final_act[i] else None,
          1 if i in new else 0, 1 if border(i) else 0, A1[i]['note'], 1 if A2[i]['act'] else 0] for i in sorted(A1)]
rowsB = [[i, ROW[i]['y'], about[i], 1 if B1[i]['is_maker'] else 0, 1 if (adjB.get(i, B1[i]).get('borderline')) else 0,
          B1[i]['note'], B2[i]['about'], '.'.join(dom_of(i).split('.')[-2:])] for i in sorted(B1)]
open(os.path.join(HERE, 'data78.js'), 'w').write('window.D78=' + json.dumps({'res': res, 'A': rowsA, 'B': rowsB}, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps({k: res[k] for k in ('A', 'B', 'C', 'atelier_case', 'predictions')}, indent=1)[:6000])
