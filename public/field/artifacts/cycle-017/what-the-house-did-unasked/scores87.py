#!/usr/bin/env python3
"""Check 87: joins the census of study 85, the sightings of study 86, the struck limits of check87.py, the
reconciled second coding (codes87.json) and the deeds at their commits (commits87.json), and writes results87.json.
Standard library only. Run after check87.py and reconcile87.py; first87.json holds the first commit of every Atelier
score and critique file (regenerate with: python3 scores87.py --first <bare clone of ulysses>)."""
import json, os, statistics, subprocess, sys
from collections import Counter
from datetime import datetime, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import analyse85 as A  # noqa: E402

J = lambda f: json.load(open(os.path.join(HERE, f), encoding='utf-8'))
CENSUS = datetime(2026, 11, 19, 22, 29, 21, tzinfo=timezone.utc)
T = datetime.fromisoformat
days = lambda a, b: (b - a).total_seconds() / 86400
key = lambda d: (d['rule'], d['practice'], d['commit'], d['path'])
ATELIER_RULES = ('score-lines', 'critique-lines')

if len(sys.argv) == 3 and sys.argv[1] == '--first':
    paths = sorted({i['path'] for i in J('items85.json') if i['practice'] == 'atelier' and i['rule'] in ATELIER_RULES})
    first = {}
    for p in paths:
        out = subprocess.run(['git', '-C', sys.argv[2], 'log', 'main', '--diff-filter=A', '--format=%H %aI', '--', p],
                             capture_output=True, text=True, check=True).stdout.split('\n')
        h, t = [x for x in out if x][-1].split()
        first[p] = {'commit': h, 'time': t}
    json.dump(first, open(os.path.join(HERE, 'first87.json'), 'w', encoding='utf-8'), indent=1)
    sys.exit(0)


def kappa(pairs):
    n = len(pairs)
    if not n:
        return None, None
    po = sum(a == b for a, b in pairs) / n
    ca, cb = Counter(a for a, _ in pairs), Counter(b for _, b in pairs)
    pe = sum(ca[c] * cb[c] for c in set(ca) | set(cb)) / n / n
    return (round((po - pe) / (1 - pe), 3) if pe < 1 else None), round(po, 3)


def verdict(ok, informative=True):
    return 'uninformative' if not informative else ('held' if ok else 'failed')


def seer_of(signer, practice):
    if signer == practice:
        return 'the practice itself'
    if signer in ('field', 'atelier', 'studio'):
        return 'a sibling practice'
    return {'middle': 'the Middle', 'architect-name': "the architect's name", 'workflow': 'a workflow'}.get(signer, signer)


# ---- the Atelier's correction (ho-2026-11-20-atelier-1), read against the items
items85 = J('items85.json')
res85 = J('results85.json')
rules85 = J('rules85.json')
first = J('first87.json')
start = {r['practice']: r['start'] for r in rules85 if r['practice'] == 'atelier' and r['rule'] in ATELIER_RULES}['atelier']
mine = [i for i in items85 if i['practice'] == 'atelier' and i['rule'] in ATELIER_RULES]
art_blobs = {(i['rule'], i['blob']) for i in mine if not i['path'].startswith('presentations/')}
copy = {key(i) for i in mine if i['path'].startswith('presentations/') and (i['rule'], i['blob']) in art_blobs}
pre = {key(i) for i in mine if T(first[i['path']]['time']) < T(start)}
drop = copy | pre
kept = [i for i in items85 if key(i) not in drop]
gone = [i for i in items85 if key(i) in drop]
c85 = A.summarise(kept, rules85, res85['unread_blobs'], res85['journal_edits_not_counted'], res85['signatures'])
correction = {
    'relay': 'ho-2026-11-20-atelier-1', 'date': '2026-11-20', 'holds': True,
    'atelier_marks': {'bound': len(mine), 'breach': sum(i['breach'] for i in mine)},
    'presentation_copies': {'bound': len(copy), 'breach': sum(i['breach'] for i in mine if key(i) in copy),
                            'not_a_copy': sum(1 for i in mine if i['path'].startswith('presentations/') and key(i) not in copy)},
    'before_the_rule': {'files': sorted({i['path'] for i in mine if key(i) in pre}), 'rule_start': start,
                        'bound': len(pre), 'breach': sum(i['breach'] for i in mine if key(i) in pre),
                        'first_commits': {p: first[p] for p in sorted({i['path'] for i in mine if key(i) in pre})}},
    'removed': {'bound': len(gone), 'breach': sum(i['breach'] for i in gone),
                'robust': sum(1 for i in gone if i['breach'] and i['robust'])},
    'standing': [{'path': i['path'], 'commit': i['commit'], 'rule': i['rule'], 'value': i['value']}
                 for i in mine if i['breach'] and key(i) not in drop],
    'census_was': {'bound': res85['bound'], 'breach': res85['breach'], 'limit': res85['by_kind']['limit'],
                   'robust': res85['second_readings']['robust']['breach'],
                   'by_practice': res85['by_practice'], 'p134': {k: res85['p134'][k] for k in (
                       'early', 'early_breach', 'early_share', 'late', 'late_breach', 'late_share')},
                   'predictions': res85['predictions'],
                   'score_lines_as_paragraphs': res85['second_readings']['blocks']['score-lines']},
    'census_now': {'bound': c85['bound'], 'breach': c85['breach'], 'limit': c85['by_kind']['limit'],
                   'robust': c85['second_readings']['robust']['breach'],
                   'by_practice': c85['by_practice'], 'p134': {k: c85['p134'][k] for k in (
                       'early', 'early_breach', 'early_share', 'late', 'late_breach', 'late_share')},
                   'p134_without_first_day': c85['p134']['without_first_day'],
                   'predictions': c85['predictions'], 'pairs_bound': c85['pairs_bound'],
                   'pairs_breached': c85['pairs_breached'],
                   'score_lines_as_paragraphs': c85['second_readings']['blocks']['score-lines']},
}

# ---- part A: the struck limits and their sightings, with the decision log as a fifth record
partA87 = J('partA87.json')
items87 = J('items87.json')
cands = {c['id']: c for c in J('candidates87.json')['candidates']}
codesA = J('codesA87.json')
sight, under = {}, {}
for p in codesA:
    c = cands[p['candidate']]
    for it in p['items']:
        k = key(it)
        if p['code'] == 'item' and (k not in sight or T(c['time']) < T(sight[k]['time'])):
            sight[k] = {'time': c['time'], 'candidate': c['id'], 'signer': c['signer'], 'commit': c['commit'],
                        'repo': c['repo'], 'path': c['path']}
        elif p['code'] == 'under':
            under.setdefault(k, []).append(c['id'])
struck = []
for i in items87:
    if not i['breach']:
        continue
    s, t0 = sight.get(key(i)), T(i['time'])
    struck.append({'rule': i['rule'], 'practice': i['practice'], 'commit': i['commit'], 'path': i['path'],
                   'time': i['time'], 'value': i['value'], 'robust': i['robust'],
                   'seen_by': seer_of(s['signer'], i['practice']) if s else 'the census',
                   'seen_at': s['time'] if s else CENSUS.isoformat(),
                   'lag_days': round(days(t0, T(s['time']) if s else CENSUS), 3), 'sighting': s,
                   'under': under.get(key(i), [])})
r86 = J('results86.json')
old = [r for r in r86['partA']['items'] if key(r) not in drop]
old_seen = [r for r in old if r['seen_by'] != 'the census']
st_seen = [r for r in struck if r['seen_by'] != 'the census']
log_codes = Counter(p['code'] for p in codesA if cands[p['candidate']]['repo'] == 'frankbueltge.de')
log_items = sum(1 for p in codesA if cands[p['candidate']]['repo'] == 'frankbueltge.de' and p['code'] == 'item')
by_rule = {}
for r in sorted({(x['rule'], x['practice']) for x in items87}):
    its = [x for x in items87 if (x['rule'], x['practice']) == r]
    br = [x for x in struck if (x['rule'], x['practice']) == r]
    by_rule['/'.join(r)] = {'bound': len(its), 'breach': len(br), 'robust': sum(1 for x in br if x['robust']),
                            'seen': sum(1 for x in br if x['seen_by'] != 'the census'),
                            'max': max((x['value'] for x in its), default=None)}
share85, share85c = 8 / 171, len(old_seen) / len(old)
share_st = len(st_seen) / len(struck) if struck else None
PROCESS_RECORD = [  # every statement found that a record stood over 3,000 words (reader rule; nothing decides it)
    {'date': '2026-08-05', 'repo': 'studio', 'commit': '0118e1f8a328156ce0a01f0cb053b7e1531f9d05',
     'signer': 'the Studio (Ensemble)', 'what': 'its own record measured at 3,013 words'},
    {'date': '2026-08-07', 'repo': 'field-research', 'commit': '93387946', 'signer': 'the Field (Meridian)',
     'what': 'a record brought from 3,673 words to 2,999'},
    {'date': '2026-08-07', 'repo': 'studio', 'commit': 'fb566159', 'signer': 'the Studio (Ensemble)',
     'what': 'a ceiling figure of 3,857 or 3,747 words, published'},
    {'date': '2026-08-08', 'repo': 'studio', 'commit': '0fa6c5ab1025a69f5b3f2c209648cbaa7f8d78d9',
     'signer': "the architect's name", 'what': 'the ceiling breached at 3,747 words against 3,000 on 7 August'},
    {'date': '2026-08-12', 'repo': 'frankbueltge.de', 'commit': 'a2e362d0', 'signer': "the architect's name (decision log)",
     'what': "the Atelier's process record at 195,965 words and its score at 40,691, measured by a session at his order; the row was rewritten on 15 August (86532f40)"},
    {'date': '2026-08-12', 'repo': 'ulysses', 'commit': '90454852f49c928ee90a2cd034fafee229eea9e7',
     'signer': "the architect's name", 'what': 'a record of 196,000 words, 69 % of it narration'},
    {'date': '2026-08-15', 'repo': 'field-research', 'commit': 'e44a470a', 'signer': "the architect's name",
     'what': 'the row of 7 August, archived with the workboard'},
    {'date': '2026-08-16', 'repo': 'studio', 'commit': '73674912', 'signer': 'the Studio (Ensemble)',
     'what': 'a project over the cap, reported in the journal and on the board rather than trimmed'},
    {'date': '2026-08-26', 'repo': 'field-research', 'commit': '3c291e2b', 'signer': "the Field's convened reader",
     'what': 'a record at 4,811 words against 3,000'},
    {'date': '2026-08-26', 'repo': 'field-research', 'commit': '653d843f', 'signer': 'the Field (Meridian)',
     'what': "a stopped arc's record at 400,242 words against 3,000 (revised the same hour, df1ae8c5)"},
]
partA = {
    'rules': partA87['rules'], 'by_rule': by_rule,
    'foundation_4000': 'bound by nothing: no commit changed either named file while the limit stood',
    'struck': {'bound': len(items87), 'breach': len(struck), 'seen_before_census': len(st_seen),
               'robust': sum(1 for x in struck if x['robust']),
               'seen_by': dict(Counter(x['seen_by'] for x in struck)),
               'seen_lag_median': statistics.median(x['lag_days'] for x in st_seen) if st_seen else None,
               'census_lag_median': statistics.median(x['lag_days'] for x in struck if x['seen_by'] == 'the census'),
               'under_reports': {'candidates': sum(len(v) for v in under.values()), 'items': len(under),
                                 'breaches': sum(1 for x in struck if x['under'])},
               'class_lines': sum(1 for p in codesA if p['code'] == 'class')},
    'line_chars_160': 'a standing limit study 85 missed: in force since 25 October in all three constitutions',
    'candidates': {'all': len(cands), 'coded_by_86': len(cands) - len(codesA), 'new': len(codesA),
                   'codes_new': dict(Counter(p['code'] for p in codesA)),
                   'decision_log': {'candidates': sum(log_codes.values()), 'codes': dict(log_codes), 'items': log_items}},
    'process_record_3000': PROCESS_RECORD,
    'p135': {
        'rules_of_85': {'breaches': len(old), 'seen': len(old_seen), 'share': share85c,
                        'verdict': verdict(len(old_seen) * 5 <= len(old))},
        'struck_added': {'breaches': len(old) + len(struck), 'seen': len(old_seen) + len(st_seen),
                         'share': (len(old_seen) + len(st_seen)) / (len(old) + len(struck)),
                         'verdict': verdict((len(old_seen) + len(st_seen)) * 5 <= len(old) + len(struck))},
        'decision_log_added': {'sightings_added': log_items,
                               'note': 'the log names no breach of a counted limit as an item, of either set'},
    },
    'items': struck,
}

# ---- part B: agreement, the final deeds, P136 by kind, P139
c86 = {c['row']: c for c in J('codes86.json')['partB']}
blind = {r['row']: r for r in J('blind87.json')['rows']}
B = J('codes87.json')['partB']
k_deed = kappa([(c86[r['row']]['final']['deed'] == 'yes', bool(blind[r['row']]['deeds'])) for r in B])
both = [r for r in B if r['decision'] == 'both']
agree = {}
for f in ('relation', 'seer', 'trace', 'actor'):
    k, po = kappa([(c86[r['row']]['final'][f], blind[r['row']]['deeds'][r['blind_match']][f]) for r in both])
    agree[f] = {'kappa': k, 'raw': po, 'n': len(both)}
agree['deed'] = {'kappa': k_deed[0], 'raw': k_deed[1], 'n': len(B),
                 'both_yes': len(both), 'blind_only': sum(1 for r in B if r['published'] == 'no' and r['blind'] == 'yes'),
                 'published_only': sum(1 for r in B if r['published'] == 'yes' and r['blind'] == 'no'),
                 'neither': sum(1 for r in B if r['published'] == 'no' and r['blind'] == 'no')}
deeds = [dict(d, row=r['row'], log_line=r['log_line'], date=r['date'], n=i + 1)
         for r in B for i, d in enumerate(r['deeds'])]
F = lambda k, ds=deeds: dict(Counter(d[k] for d in ds))


def seers(ds):
    st = [d for d in ds if d['seer'] != 'not stated']
    a = sum(1 for d in st if d['seer'] == 'the architect')
    return {'deeds': len(ds), 'stated': len(st), 'architect': a,
            'at_his_order': sum(1 for d in st if d['seer'] == "a session at the architect's order"),
            'machines': sum(1 for d in st if d['seer'] in (
                'the acting machine itself', 'another machine of the house', 'a guard, test, gate or CI'))}


by_kind = {k: seers([d for d in deeds if d['kind'] == k]) for k in ('fault', 'authority', 'unclear')}
allS = seers(deeds)
auth = by_kind['authority']
partB = {
    'rows': len(B), 'agreement': agree, 'decisions': dict(Counter(r['decision'] for r in B)),
    'rows_with_deeds': sum(1 for r in B if r['deeds']), 'deeds': len(deeds),
    'kind': F('kind'), 'seer': F('seer'), 'relation': F('relation'), 'actor': F('actor'), 'trace': F('trace'),
    'source': F('source'), 'seers_all': allS, 'seers_by_kind': by_kind,
    'by_month': dict(sorted(Counter(d['date'][:7] for d in deeds).items())),
    'authority_deeds': [{k: d[k] for k in ('row', 'n', 'date', 'log_line', 'seer', 'relation', 'deed_line')}
                        for d in deeds if d['kind'] == 'authority'],
}

# ---- part C: each deed at its commit
C = {(c['row'], c['deed']): c for c in J('commits87.json')['deeds']}
for d in deeds:
    c = C[(d['row'], d['n'])]
    d.update({'found': c['found'], 'legible': c['legible'], 'signed': c['signed'],
              'commits': [x['hash'][:7] for x in c['commits']], 'repair': (c['repair'] or '')[:7] or None})
found = [d for d in deeds if d['found'] == 'at its commit']
dm = sum(1 for d in found if d['legible'] == 'deed and maker')
pub = [d for d in deeds if d['source'] == 'published']
partC = {
    'found': F('found'), 'legible': F('legible'), 'signed': F('signed'),
    'found_signed': F('signed', found), 'found_legible': F('legible', found),
    'by_kind': {k: {'deeds': sum(1 for d in deeds if d['kind'] == k),
                    'found': sum(1 for d in found if d['kind'] == k),
                    'deed_and_maker': sum(1 for d in found if d['kind'] == k and d['legible'] == 'deed and maker'),
                    'signed_architect': sum(1 for d in found if d['kind'] == k and d['signed'] == "the architect's name")}
                for k in ('fault', 'authority', 'unclear')},
    'published_34': {'deeds': len(pub), 'found': sum(1 for d in pub if d['found'] == 'at its commit'),
                     'deed_and_maker': sum(1 for d in pub if d['found'] == 'at its commit' and d['legible'] == 'deed and maker')},
}
traced = [d for d in deeds if d['trace'] != 'unclear']
preds = {
    'P138': {'verdict': verdict(share_st is not None and share_st >= 3 * share85, len(struck) >= 20),
             'value': f'{len(st_seen)} of {len(struck)} struck-limit breaches named before the census '
                      f'({100 * share_st:.1f} %), against 8 of 171 ({100 * share85:.1f} %); '
                      f'{len(old_seen)} of {len(old)} ({100 * share85c:.1f} %) after the correction'},
    'P139': {'verdict': verdict(auth['architect'] * 2 > auth['stated'], auth['stated'] >= 6),
             'value': f"the architect {auth['architect']} of {auth['stated']} authority deeds that state a seer "
                      f"({auth['deeds']} authority deeds)"},
    'P140': {'verdict': verdict(dm * 2 <= len(found), len(found) >= 10),
             'value': f'{dm} of {len(found)} deeds found at their commit legible from Git as deed and maker'},
    'P135_again': {'value': partA['p135']},
    'P136_again': {'verdict': verdict(allS['architect'] * 2 > allS['stated'], allS['stated'] >= 10),
                   'value': f"the architect {allS['architect']} of {allS['stated']} final deeds that state a seer; "
                            f"faults {by_kind['fault']['architect']} of {by_kind['fault']['stated']}"},
    'P137_again': {'verdict': verdict(len(found) * 3 >= 2 * len(deeds), len(deeds) >= 10),
                   'value': f'{len(found)} of {len(deeds)} final deeds found at their commit; by the rows\' own '
                            f"account {sum(1 for d in traced if d['trace'] == 'in Git')} of {len(traced)}"},
}
out = {'check': 87, 'session': 285, 'date': '2026-11-20', 'census': CENSUS.isoformat(),
       'correction85': correction, 'partA': partA, 'partB': partB, 'partC': partC, 'predictions': preds,
       'deeds': [{k: d.get(k) for k in ('row', 'n', 'date', 'log_line', 'kind', 'actor', 'relation', 'seer', 'trace',
                                        'lag_days', 'source', 'found', 'legible', 'signed', 'commits', 'repair',
                                        'deed_line')} for d in deeds]}
json.dump(out, open(os.path.join(HERE, 'results87.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(json.dumps({k: v for k, v in correction.items() if k not in ('census_was', 'standing')}, ensure_ascii=False))
print(json.dumps({k: correction['census_now'][k] for k in ('bound', 'breach', 'limit', 'robust', 'p134')}))
print(json.dumps({k: v for k, v in partA.items() if k not in ('items', 'rules', 'process_record_3000')}, ensure_ascii=False))
print(json.dumps({k: v for k, v in partB.items() if k != 'authority_deeds'}, ensure_ascii=False))
print(json.dumps(partC, ensure_ascii=False))
print(json.dumps(preds, ensure_ascii=False))
