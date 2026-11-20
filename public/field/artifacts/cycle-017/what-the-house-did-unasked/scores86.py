#!/usr/bin/env python3
"""Study 86: joins the codes (codes86.json) with study 85's items and the candidates of seen86.py, and writes
results86.json. Standard library only. Run after seen86.py, declared86.mjs and the coding."""
import json, os, statistics
from collections import Counter
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
J = lambda f: json.load(open(os.path.join(HERE, f), encoding='utf-8'))
items = [i for i in J('items85.json') if i['breach']]
cands = {c['id']: c for c in J('candidates86.json')['candidates']}
codes = J('codes86.json')
declared = J('declared86.json')
CENSUS = datetime(2026, 11, 19, 22, 29, 21, tzinfo=timezone.utc)
key = lambda d: (d['rule'], d['practice'], d['commit'], d['path'])
T = lambda s: datetime.fromisoformat(s)
days = lambda a, b: (b - a).total_seconds() / 86400


def seer_of(signer, practice):
    if signer == practice:
        return 'the practice itself'
    if signer in ('field', 'atelier', 'studio'):
        return 'a sibling practice'
    return {'middle': 'the Middle', 'architect-name': "the architect's name", 'workflow': 'a workflow'}.get(signer, signer)


# ---- part A
sight, under, within, klass = {}, {}, set(), 0
for p in codes['partA']:
    c = cands[p['candidate']]
    if p['code'] == 'class':
        klass += 1
    for it in p['items']:
        k = key(it)
        if p['code'] == 'item':
            if k not in sight or T(c['time']) < T(sight[k]['time']):
                sight[k] = {'time': c['time'], 'candidate': c['id'], 'signer': c['signer'], 'commit': c['commit'],
                            'repo': c['repo'], 'path': c['path']}
        elif p['code'] == 'under':
            under[k] = c['id']
        elif p.get('asserts_within'):
            within.add(k)
rows = []
for i in items:
    k = key(i)
    s = sight.get(k)
    t0 = T(i['time'])
    if s:
        rows.append({'rule': i['rule'], 'practice': i['practice'], 'commit': i['commit'], 'path': i['path'],
                     'time': i['time'], 'robust': i['robust'], 'seen_by': seer_of(s['signer'], i['practice']),
                     'seen_at': s['time'], 'lag_days': round(days(t0, T(s['time'])), 3), 'sighting': s,
                     'under': k in under, 'asserts_within': k in within})
    else:
        rows.append({'rule': i['rule'], 'practice': i['practice'], 'commit': i['commit'], 'path': i['path'],
                     'time': i['time'], 'robust': i['robust'], 'seen_by': 'the census',
                     'seen_at': CENSUS.isoformat(), 'lag_days': round(days(t0, CENSUS), 3), 'sighting': None,
                     'under': k in under, 'asserts_within': k in within})
seen = [r for r in rows if r['seen_by'] != 'the census']
unseen = [r for r in rows if r['seen_by'] == 'the census']
ascii_of = {key(i): i.get('ascii') for i in items}
under_exact = 0
for p in codes['partA']:
    if p['code'] == 'under':
        it = p['items'][0]
        under_exact += p['stated'] == ascii_of[key(it)]
p135_n = len(seen)
partA = {
    'breaches': len(rows), 'seen_before_census': len(seen),
    'seen_by': dict(Counter(r['seen_by'] for r in rows)),
    'seen_by_practice': {p: {'breaches': sum(1 for r in rows if r['practice'] == p),
                             'seen': sum(1 for r in seen if r['practice'] == p)} for p in ('field', 'atelier', 'studio')},
    'seen_lag_days': sorted(r['lag_days'] for r in seen),
    'seen_lag_median': statistics.median(r['lag_days'] for r in seen) if seen else None,
    'census_lag_median': statistics.median(r['lag_days'] for r in unseen),
    'census_lag_max': max(r['lag_days'] for r in unseen),
    'robust': {'breaches': sum(1 for r in rows if r['robust']), 'seen': sum(1 for r in seen if r['robust'])},
    'under_reports': len(under), 'under_equal_to_az_counter': under_exact, 'asserts_within': len(within), 'class_lines': klass,
    'candidates': len(cands), 'candidate_codes': dict(Counter(p['code'] for p in codes['partA'])),
    'field_digest': {'breaches': sum(1 for r in rows if r['rule'] == 'digest-words' and r['practice'] == 'field'),
                     'seen': sum(1 for r in seen if r['rule'] == 'digest-words' and r['practice'] == 'field'),
                     'reported_under': sum(1 for r in rows if r['rule'] == 'digest-words' and r['practice'] == 'field'
                                           and r['under']),
                     'asserted_within': sum(1 for r in rows if r['rule'] == 'digest-words' and r['practice'] == 'field'
                                            and r['asserts_within'])},
    'items': rows,
}

# ---- part B
B = codes['partB']
deeds = [b for b in B if b['final']['deed'] == 'yes' and 'dup_of' not in b['final']]
f = lambda k: dict(Counter(d['final'][k] for d in deeds))
stated = [d for d in deeds if d['final']['seer'] != 'not stated']
arch = sum(1 for d in stated if d['final']['seer'] == 'the architect')
at_order = sum(1 for d in stated if d['final']['seer'] == "a session at the architect's order")
traced = [d for d in deeds if d['final']['trace'] != 'unclear']
in_git = sum(1 for d in traced if d['final']['trace'] == 'in Git')
first_yes = sum(1 for b in B if b['first']['deed'] == 'yes')
rev = Counter(b['review']['status'] for b in B if 'review' in b)
partB = {
    'rows': len(B), 'first_pass_deeds': first_yes, 'review': dict(rev), 'deeds': len(deeds),
    'seer': f('seer'), 'trace': f('trace'), 'relation': f('relation'), 'actor': f('actor'),
    'seer_stated': len(stated), 'architect': arch, 'at_his_order': at_order,
    'machines_unbidden': sum(1 for d in stated if d['final']['seer'] in (
        'the acting machine itself', 'another machine of the house', 'a guard, test, gate or CI')),
    'outside': sum(1 for d in stated if d['final']['seer'] == 'someone outside the house'),
    'traced': len(traced), 'in_git': in_git,
    'by_month': dict(sorted(Counter(d['date'][:7] for d in deeds).items())),
    'rows_by_month': dict(sorted(Counter(b['date'][:7] for b in B).items())),
    'lags': sorted(d['final']['lag_days'] for d in deeds if d['final'].get('lag_days') is not None),
    'deeds_list': [{'row': d['row'], 'date': d['date'], 'log_line': d['log_line'], **{k: d['final'][k] for k in (
        'actor', 'relation', 'seer', 'trace', 'lag_days', 'deed_line')}} for d in deeds],
}


def verdict(ok, informative=True):
    return 'uninformative' if not informative else ('held' if ok else 'failed')


preds = {
    'P135': {'verdict': verdict(p135_n <= 34), 'value': f'{p135_n} of {len(rows)} named before the census'},
    'P136': {'verdict': verdict(arch * 2 > len(stated), len(stated) >= 10),
             'value': f'the architect {arch} of {len(stated)} rows that state a seer'},
    'P137': {'verdict': verdict(in_git * 3 >= 2 * len(traced), len(traced) >= 10),
             'value': f'{in_git} of {len(traced)} deeds with a coded trace in Git'},
}

# ---- the correction of study 85 (handoff ho-2026-11-19-atelier-8) and the declared count (ho-2026-11-19-atelier-9)
correction = {
    'date': '2026-11-20',
    'what': 'Study 85 coded commits signed "Atelier" (the Atelier\'s lander, research-auto-land.yml) and "Meridian '
            '(autoloop)" (field-research autoloop.yml) as the practice\'s own. They are workflows.',
    'items_recoded': 217, 'commits_recoded': {'ulysses Atelier': 34, 'field-research Meridian (autoloop)': 77},
    'breaches_among_them': 0,
    'practice_bound': {'was': 5921, 'now': 5921 - 217}, 'workflow_bound': {'was': 1467, 'now': 1467 + 217},
    'signature_as_written': {'was': 22, 'now_by_the_practice': 0,
                             'note': 'all 22 are the lander\'s refusal notes; no commit of a session breaks it'},
}
declared_count = {k: declared[k] for k in ('runtime', 'census_runtime', 'declared_on', 'versions', 'over_codebook',
                                           'over_declared', 'after', 'over_codebook_after', 'over_declared_after',
                                           'max_declared')}
declared_count['chromium_after'] = {'over': 54, 'source': "the Atelier's digest.json (figures.b_over_after), "
                                                          'ulysses commit 78dd6f7, Chromium 157'}

out = {'study': 86, 'session': 284, 'date': '2026-11-20', 'census': CENSUS.isoformat(), 'partA': partA,
       'partB': partB, 'predictions': preds, 'correction85': correction, 'declared_count': declared_count}
json.dump(out, open(os.path.join(HERE, 'results86.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps({k: v for k, v in partA.items() if k not in ('items', 'seen_lag_days')}, ensure_ascii=False))
print(json.dumps({k: v for k, v in partB.items() if k not in ('deeds_list',)}, ensure_ascii=False))
print(json.dumps(preds))
