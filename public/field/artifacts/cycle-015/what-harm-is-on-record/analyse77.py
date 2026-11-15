"""Check 77 (session 275, 2026-11-15) — the check of studies 75 and 76.

Usage: python3 -I analyse77.py
Reads coding76.json (first coding), check77/second-coding.json (second, blind coding, read whole),
check77/press-sample.json (a seeded draw of 120 press and research first reports), check77/adjudication.json
(the third reading of every disagreement on the two tested codes) and data75.js. Writes results77.json and
data77.js. No report text is read or written here. Standard library only.
"""
import json, os, collections, hashlib, math, datetime, statistics

HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda *p: json.load(open(os.path.join(HERE, *p)))
C, S, PS, ADJ = J('coding76.json'), J('check77', 'second-coding.json'), J('check77', 'press-sample.json'), J('check77', 'adjudication.json')
D = json.loads(open(os.path.join(HERE, 'data75.js')).read().split('=', 1)[1].rstrip(';\n'))
R75 = D['res']
ROW = {r[0]: {'y': r[1], 'k': r[2], 'd': r[3]} for r in D['rows']}
N_FIRST = R75['incidents_with_first_report']


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


# ---------------------------------------------------------------- Part A: the 58 self-published first reports
A1 = {a['id']: a for a in C['A']}
A2 = {int(a['id']): a for a in S['A']}
assert set(A1) == set(A2) and len(A1) == 58
kA = kappa([(A1[i]['code'], A2[i]['code']) for i in sorted(A1)])
adjA = {x['id']: x for x in ADJ['A']}
disA = sorted(i for i in A1 if A1[i]['code'] != A2[i]['code'])
assert disA == sorted(adjA)
finalA = {i: (adjA[i]['final'] if i in adjA else A1[i]['code']) for i in A1}
harmedA = sorted(i for i in finalA if finalA[i] == 'harmed')
harmedA_firm = [i for i in harmedA if not (adjA[i]['borderline'] if i in adjA else A1[i]['borderline'])]

# ---------------------------------------------------------------- the press and research class, sampled
items = PS['items']
assert len(items) == 120 and all(ROW[int(x['id'])]['k'] in ('press and other', 'research') for x in items)
pop = sum(1 for r in ROW.values() if r['k'] in ('press and other', 'research'))
assert pop == PS['population']
sh = sorted(int(x['id']) for x in items if x['code'] == 'harmed')
assert sh == sorted(x['id'] for x in ADJ['press_sample_harmed'] if x['holds'])
lo, hi = wilson(len(sh), 120)
est = lambda p: round(p * pop)
press = {
    'population': pop, 'drawn': 120, 'seed': PS['seed'],
    'codes': dict(collections.Counter(x['code'] for x in items)),
    'harmed': len(sh), 'harmed_ids': sh,
    'harmed_firm': sum(1 for x in ADJ['press_sample_harmed'] if x['holds'] and not x['borderline']),
    'harmed_pct': round(100 * len(sh) / 120, 1), 'ci95_pct': [round(100 * lo, 1), round(100 * hi, 1)],
    'estimated_in_class': est(len(sh) / 120), 'estimated_in_class_ci': [est(lo), est(hi)],
    'own_words': sum(1 for x in items if x.get('own_words')),
    'own_words_pct': round(100 * sum(1 for x in items if x.get('own_words')) / 120, 1),
}
whole = {
    'floor_read': len(harmedA),
    'estimate': len(harmedA) + press['estimated_in_class'],
    'estimate_ci': [len(harmedA) + press['estimated_in_class_ci'][0], len(harmedA) + press['estimated_in_class_ci'][1]],
}
whole['estimate_pct'] = round(100 * whole['estimate'] / N_FIRST, 1)
whole['estimate_pct_ci'] = [round(100 * v / N_FIRST, 1) for v in whole['estimate_ci']]
whole['floor_pct'] = round(100 * len(harmedA) / N_FIRST, 2)

# ---------------------------------------------------------------- Part B: the 176 answered incidents
B1 = {b['id']: b for b in C['B']}
B2 = {int(b['id']): b for b in S['B']}
assert set(B1) == set(B2) and len(B1) == 176
ids = sorted(B1)
kB = {c: kappa([(c in B1[i]['codes'], c in B2[i]['codes']) for i in ids]) for c in 'MPO'}
cnt = {c: {'first': sum(c in B1[i]['codes'] for i in ids), 'second': sum(c in B2[i]['codes'] for i in ids),
           'both': sum(c in B1[i]['codes'] and c in B2[i]['codes'] for i in ids)} for c in 'MPO'}
bothP = [i for i in ids if 'P' in B1[i]['codes'] and 'P' in B2[i]['codes']]
kT = kappa([(B1[i]['act_target'], B2[i]['act_target']) for i in bothP])
adjP = {x['id']: x for x in ADJ['B_public_act']}
disP = sorted(i for i in ids if ('P' in B1[i]['codes']) != ('P' in B2[i]['codes']))
assert disP == sorted(adjP)
admitted = sorted(i for i in adjP if adjP[i]['admit'])
finalP = sorted(set(bothP) | set(admitted))
target = {i: (adjP[i]['target'] if i in adjP else B1[i]['act_target']) for i in finalP}
assert all(target[i] == B2[i]['act_target'] for i in finalP)
borderP = {i: bool(adjP[i]['borderline'] if i in adjP else B1[i]['borderline']) for i in finalP}
tg = collections.Counter(target.values())
pub_read = sorted(i for i in finalP if B2[i].get('target_public'))
pub_column = sorted(ADJ_i for ADJ_i in (807, 1400, 1694, 1770, 1771, 1801))
assert all(i in finalP and target[i] == 'maker' for i in pub_column) and set(pub_read) <= set(pub_column)
state = collections.Counter((target[i], B2[i]['state']) for i in finalP)
system = collections.Counter((target[i], B2[i]['system']) for i in finalP)
dom = lambda i: ROW[i]['d']
classified = [i for i in finalP if dom(i)]
d7 = [i for i in finalP if dom(i) == 7]
d7_all = [i for i in ids if dom(i) == 7]
by_dom = {}
for i in ids:
    x = by_dom.setdefault(str(dom(i)), {'n': 0, 'P': 0, 'P_user': 0, 'P_maker': 0})
    x['n'] += 1
    if i in target:
        x['P'] += 1
        x['P_' + target[i]] += 1


def day(s):
    try:
        return datetime.date.fromisoformat(s)
    except (TypeError, ValueError):
        return None


lags = []
for i in finalP:
    a, b = day(B2[i]['incident_date']), day(B2[i].get('act_date'))
    if a and b:
        lags.append((b - a).days)
FR = ADJ['frontier']['general_model_makers']

# ---------------------------------------------------------------- the critique's counts (studies 75 and 76)
maker_year = collections.Counter(r['y'] for r in ROW.values() if r['k'] == 'maker')
n_year = collections.Counter(r['y'] for r in ROW.values() if r['k'] != 'no report')
dom_n = {k: v['n'] for k, v in R75['by_domain'].items()}
matched = R75['incidents_matched']
matched_outside = [i for i in matched if i not in finalP]

P111 = kA['kappa'] >= 0.60
P112 = 42 <= cnt['P']['second'] <= 58 and kB['P']['kappa'] >= 0.70
P113 = len(sh) <= 2

res = {
    'study': 77, 'kind': 'check', 'session': 275, 'date': '2026-11-15', 'cycle': 15, 'programme_step': 3,
    'snapshot_sha256': C['snapshot_sha256'],
    'predictions_file_sha256': hashlib.sha256(open(os.path.join(HERE, 'PREDICTIONS77.md'), 'rb').read()).hexdigest(),
    'A': {'agreement': kA, 'disagreements': disA, 'first_harmed': sum(a['code'] == 'harmed' for a in C['A']),
          'second_harmed': sum(a['code'] == 'harmed' for a in S['A']), 'final_harmed': len(harmedA),
          'final_harmed_firm': len(harmedA_firm), 'final_codes': dict(collections.Counter(finalA.values()))},
    'press': press, 'whole_record': whole, 'all_first_reports': N_FIRST,
    'B': {'n': 176, 'agreement': kB, 'counts': cnt, 'target_agreement': kT,
          'public_first': cnt['P']['first'], 'public_second': cnt['P']['second'], 'second_only': disP,
          'admitted': admitted, 'not_admitted': [i for i in disP if i not in admitted],
          'public_final': len(finalP), 'public_final_pct': round(100 * len(finalP) / 176, 1),
          'public_final_firm': sum(1 for i in finalP if not borderP[i]),
          'missed_by_reading_the_opening': len(admitted),
          'target': dict(tg),
          'target_is_public_body': {'by_second_reading': pub_read, 'by_deployer_column': pub_column},
          'state': {f'{a} {b}': n for (a, b), n in sorted(state.items())},
          'system': {f'{a} {b}': n for (a, b), n in sorted(system.items())},
          'user_system_worked': system[('user', 'worked')], 'maker_system_failed': system[('maker', 'failed')],
          'classified': len(classified), 'domain7': len(d7), 'domain7_ids': d7,
          'domain7_answered': len(d7_all), 'domain7_maker_first': sum('M' in B1[i]['codes'] for i in d7_all),
          'domain7_maker_second': sum('M' in B2[i]['codes'] for i in d7_all),
          'by_domain': by_dom,
          'lag_days': {'n': len(lags), 'median': int(statistics.median(lags)), 'within_30': sum(1 for v in lags if 0 <= v <= 30),
                       'over_365': sum(1 for v in lags if v > 365), 'before_incident_date': sum(1 for v in lags if v < 0)},
          'frontier': {'concluded': FR['concluded'], 'opened': FR['opened'], 'inquiry': FR['inquiry_into_the_incident'],
                       'for_the_maker': FR['for_the_maker'], 'other_system': ADJ['frontier']['other_system_of_a_frontier_firm']},
          'matched_to_step2': matched, 'matched_outside_the_answered': matched_outside,
          'public_act_on_record_at_least': len(finalP) + len(matched_outside)},
    'critique': {
        'maker_first_by_year': {str(y): [maker_year[y], n_year[y]] for y in sorted(n_year) if y and y >= 2019},
        'maker_first_2026': [maker_year[2026], n_year[2026]], 'maker_first_all': R75['first_reporter']['maker'],
        'maker_first_before_2026': [R75['first_reporter']['maker'] - maker_year[2026], N_FIRST - n_year[2026]],
        'maker_domain7': [R75['by_domain']['7']['maker'], R75['domain7_n']],
        'maker_classified': [sum(v['maker'] for v in R75['by_domain'].values()), R75['classified_mit']],
        'domain_n': dom_n, 'classified': R75['classified_mit'], 'unclassified': N_FIRST - R75['classified_mit'],
    },
    'predictions': {'P111': P111, 'P112': P112, 'P113': P113}, 'predictions_held': sum([P111, P112, P113]),
}
json.dump(res, open(os.path.join(HERE, 'results77.json'), 'w'), indent=1, ensure_ascii=False)
# rows for the page: Part B in study 76's row shape, the public code and target as the check leaves them
rowsB = []
for i in ids:
    codes = set(B1[i]['codes']) - {'P'} | ({'P'} if i in target else set())
    note = B1[i]['note']
    if i in adjP and adjP[i]['admit']:
        note = 'Found by the check: ' + adjP[i]['why']
    rowsB.append([i, ROW[i]['y'], dom(i), ''.join(sorted(codes)), target.get(i, ''), 1 if borderP.get(i, B1[i]['borderline']) else 0, note])
acts = [[i, ROW[i]['y'], B2[i]['incident_date'], B2[i]['body'], B2[i]['act'], B2[i].get('act_date') or '', target[i],
         1 if i in pub_column else 0, B2[i]['state'], B2[i]['system'], 0 if i in admitted else 1, 1 if borderP[i] else 0] for i in finalP]
rowsA = [[i, ROW[i]['y'], finalA[i], A1[i]['code'], A2[i]['code']] for i in sorted(A1)]
rowsC = [[int(x['id']), ROW[int(x['id'])]['y'], x['code'], 1 if x.get('own_words') else 0, x['writer']] for x in items]
with open(os.path.join(HERE, 'data77.js'), 'w') as f:
    f.write('window.D77=' + json.dumps({'res': res, 'B': rowsB, 'acts': acts, 'A': rowsA, 'C': rowsC}, ensure_ascii=False, separators=(',', ':')) + ';\n')
print(json.dumps({k: res[k] for k in ('A', 'press', 'whole_record', 'critique', 'predictions')}, indent=1))
print(json.dumps({k: v for k, v in res['B'].items() if k not in ('by_domain',)}, indent=1))
