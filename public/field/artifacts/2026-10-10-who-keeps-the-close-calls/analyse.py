"""Do the keepers of nuclear close calls agree on which ones count? (study 7, session 192).

Pre-registered in PREREGISTRATION.md. Usage: python3 -I analyse.py
Reads data/entries.tsv (one row per entry, with this session's event matching), and, if present,
data/blind_matching.tsv (the dispatched second matching). Writes data/results.json and
data/events.json. Standard library only.
"""
import csv, json, os, random, itertools, collections

HERE = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(HERE, 'data')
KEEPERS = ['PH', 'CH', 'FLI', 'WP']           # NTI excluded: closed door (403), see README
NAMES = {'PH': 'Phillips 1998 (Nuclear Age Peace Foundation)', 'CH': 'Chatham House 2014, Table 1',
         'FLI': 'Future of Life Institute timeline (2016)', 'WP': 'Wikipedia, Nuclear close calls'}
LO, HI = 1945, 1998

rows = list(csv.DictReader(open(os.path.join(D, 'entries.tsv'), encoding='utf-8'), delimiter='\t'))
for r in rows:
    r['year'] = int(r['date'][:4])


def sets(rows, key, window):
    """keeper -> set of event ids (within the window if given)."""
    s = {k: set() for k in KEEPERS}
    for r in rows:
        if window and not (LO <= r['year'] <= HI):
            continue
        s[r['keeper']].add(r[key])
    return s


def dice(a, b):
    return 2 * len(a & b) / (len(a) + len(b)) if (a or b) else float('nan')


def measures(s):
    union = set().union(*s.values())
    count = {e: sum(e in s[k] for k in KEEPERS) for e in union}
    pairs = {f'{a}-{b}': round(dice(s[a], s[b]), 4) for a, b in itertools.combinations(KEEPERS, 2)}
    n = len(union)
    return {
        'union': n,
        'list_length': {k: len(s[k]) for k in KEEPERS},
        'by_count': {str(c): sum(1 for v in count.values() if v == c) for c in range(1, len(KEEPERS) + 1)},
        'share_all': round(sum(1 for v in count.values() if v == len(KEEPERS)) / n, 4),
        'share_one': round(sum(1 for v in count.values() if v == 1) / n, 4),
        'dice_pairs': pairs,
        'dice_mean': round(sum(pairs.values()) / len(pairs), 4),
        'longest_over_shortest': round(max(len(v) for v in s.values()) / min(len(v) for v in s.values()), 3),
    }, count


def boot(s, reps=2000, seed=192):
    """95 % interval for mean pairwise Dice, resampling the union's events with replacement."""
    union = sorted(set().union(*s.values()))
    rng = random.Random(seed)
    out = []
    for _ in range(reps):
        draw = collections.Counter(rng.choice(union) for _ in union)
        tot = 0
        for a, b in itertools.combinations(KEEPERS, 2):
            both = sum(m for e, m in draw.items() if e in s[a] and e in s[b])
            na = sum(m for e, m in draw.items() if e in s[a])
            nb = sum(m for e, m in draw.items() if e in s[b])
            tot += 2 * both / (na + nb) if na + nb else 0
        out.append(tot / 6)
    out.sort()
    return [round(out[int(0.025 * reps)], 4), round(out[int(0.975 * reps) - 1], 4)]


def verdict(value, bar, below, margin):
    if abs(value - bar) <= margin:
        return 'undecided'
    return 'held' if (value < bar) == below else 'failed'


s_prim = sets(rows, 'event', True)
s_all = sets(rows, 'event', False)
m_prim, count_prim = measures(s_prim)
m_all, _ = measures(s_all)
m_prim['dice_mean_ci95'] = boot(s_prim)
m_all['dice_mean_ci95'] = boot(s_all)

# P4: Serpukhov (E46) and any Cuban-crisis event, in every keeper
CUBA = {'E12', 'E13', 'E14', 'E15', 'E16', 'E17', 'E18', 'E19', 'E20', 'E21', 'E23', 'E24', 'E25', 'E26', 'E27'}
p4_serp = {k: 'E46' in s_prim[k] for k in KEEPERS}
p4_cuba = {k: bool(s_prim[k] & CUBA) for k in KEEPERS}
p4 = 'held' if all(p4_serp.values()) and all(p4_cuba.values()) else 'failed'

pred = {
    'P1': {'bar': 'share listed by every keeper < 20 %', 'value': m_prim['share_all'],
           'verdict': verdict(m_prim['share_all'], 0.20, True, 0.02)},
    'P2': {'bar': 'share listed by exactly one keeper > 40 %', 'value': m_prim['share_one'],
           'verdict': verdict(m_prim['share_one'], 0.40, False, 0.02)},
    'P3': {'bar': 'mean pairwise Dice < 0.50', 'value': m_prim['dice_mean'],
           'verdict': verdict(m_prim['dice_mean'], 0.50, True, 0.05)},
    'P4': {'bar': 'Serpukhov 1983 and a Cuban-crisis event in every keeper',
           'serpukhov': p4_serp, 'cuba': p4_cuba, 'verdict': p4},
    'P5': {'bar': 'longest list > 3 x shortest', 'value': m_prim['longest_over_shortest'],
           'verdict': 'held' if m_prim['longest_over_shortest'] > 3 else 'failed'},
}
# P5's bar is a ratio; the pre-registration's margin rule covers shares and Dice only.

# events table
ev = collections.defaultdict(lambda: {'keepers': [], 'labels': {}, 'years': set()})
for r in rows:
    e = ev[r['event']]
    e['keepers'].append(r['keeper'])
    e['labels'][f"{r['keeper']} {r['entry']}"] = r['label']
    e['years'].add(r['year'])
events = []
for k, e in sorted(ev.items(), key=lambda kv: (min(kv[1]['years']), kv[0])):
    events.append({'event': k, 'year': min(e['years']), 'keepers': sorted(set(e['keepers']), key=KEEPERS.index),
                   'in_window': LO <= min(e['years']) <= HI, 'labels': e['labels'],
                   'occurrence': next(r['occurrence'] for r in rows if r['event'] == k)})

# exploratory: famous vs technical, decade profile
decade = {k: collections.Counter(f"{(r['year'] // 10) * 10}s" for r in rows
                                 if r['keeper'] == k and LO <= r['year'] <= HI) for k in KEEPERS}

out = {'keepers': NAMES, 'excluded': {'NTI': 'Close calls fact sheet: 403 to direct request and to the '
                                       'extraction fallback, 2026-10-10'},
       'window': [LO, HI], 'entries': len(rows), 'primary': m_prim, 'all_years': m_all,
       'predictions': pred, 'decade_profile': {k: dict(sorted(v.items())) for k, v in decade.items()}}

# exploratory, declared after the run: leave one keeper out; and FLI's citations of Phillips' site
loo = {}
for drop in KEEPERS:
    sub = {k: v for k, v in s_prim.items() if k != drop}
    u = set().union(*sub.values())
    c = {e: sum(e in sub[k] for k in sub) for e in u}
    pr = [dice(sub[a], sub[b]) for a, b in itertools.combinations(sub, 2)]
    loo['without_' + drop] = {'union': len(u), 'share_all': round(sum(v == 3 for v in c.values()) / len(u), 4),
                              'share_one': round(sum(v == 1 for v in c.values()) / len(u), 4),
                              'dice_mean': round(sum(pr) / 3, 4)}
out['leave_one_keeper_out'] = loo
fli_cites = {r['entry']: r['cited_domains'] for r in
             csv.DictReader(open(os.path.join(D, 'fli_cited_domains.tsv'), encoding='utf-8'), delimiter='\t')}
shared = [r for r in rows if r['keeper'] == 'FLI' and LO <= r['year'] <= HI and r['event'] in s_prim['PH']]
out['fli_shared_with_ph'] = {'shared_events': len(shared),
                             'citing_nuclearfiles': sum('nuclearfiles' in fli_cites[r['entry']] for r in shared)}
out['in_all_four'] = [e['event'] for e in events if e['in_window'] and len(e['keepers']) == 4]
out['only_one'] = {k: [e['event'] for e in events if e['in_window'] and e['keepers'] == [k]] for k in KEEPERS}

# second, blind matching
bp = os.path.join(D, 'blind_matching.tsv')
if os.path.exists(bp):
    b = {(r['keeper'], r['entry']): r['group'] for r in
         csv.DictReader(open(bp, encoding='utf-8'), delimiter='\t')}
    mine = {(r['keeper'], r['entry']): r['event'] for r in rows}
    assert set(b) == set(mine), 'blind matching does not cover the same entries'
    keys = sorted(mine)
    agree = n11 = n10 = n01 = 0
    pairs_diff = []
    for x, y in itertools.combinations(keys, 2):
        sm, sb = mine[x] == mine[y], b[x] == b[y]
        n11 += sm and sb
        n10 += sm and not sb
        n01 += sb and not sm
        if sm != sb:
            pairs_diff.append({'a': ' '.join(x), 'b': ' '.join(y), 'mine_same': sm, 'blind_same': sb})
    rows_b = [dict(r, blind=b[(r['keeper'], r['entry'])]) for r in rows]
    m_b, _ = measures(sets(rows_b, 'blind', True))
    out['second_matching'] = {
        'same_event_pairs_mine': n11 + n10, 'same_event_pairs_blind': n11 + n01, 'both': n11,
        'specific_agreement_same_event': round(2 * n11 / (2 * n11 + n10 + n01), 4),
        'differing_pairs': pairs_diff,
        'primary_under_blind_matching': {k: m_b[k] for k in
                                         ('union', 'list_length', 'by_count', 'share_all', 'share_one',
                                          'dice_pairs', 'dice_mean', 'longest_over_shortest')}}

json.dump(out, open(os.path.join(D, 'results.json'), 'w'), indent=1)
json.dump(events, open(os.path.join(D, 'events.json'), 'w'), indent=1, default=list)
print(json.dumps({k: out[k] for k in ('primary', 'predictions')}, indent=1))
if 'second_matching' in out:
    sm = out['second_matching']
    print({k: v for k, v in sm.items() if k != 'differing_pairs'})
    for p in sm['differing_pairs']:
        print(p)
