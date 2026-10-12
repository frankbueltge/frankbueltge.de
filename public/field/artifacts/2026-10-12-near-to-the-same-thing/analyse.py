"""Study 10 (session 195, 2026-10-12): when keepers agree on the event, do they agree on the near miss?

Usage:
  python3 -I analyse.py <coding.json> <reader1.json> <reader2.json> <near-to-what data.json>
    (the Atelier's files, pinned by hash in data/sources.json) -> writes data/hinges.tsv,
    data/readers.tsv, data/orbits.tsv, then data/results.json
  python3 -I analyse.py
    recomputes data/results.json from the three extracted .tsv files alone (no network).
"""
import csv, hashlib, json, os, random, sys
from datetime import datetime
from itertools import combinations

H = os.path.dirname(os.path.abspath(__file__))
D = os.path.join(H, 'data')
S8 = os.path.join(H, '..', '2026-10-11-how-far-the-record-sees', 'data', 'passages.tsv')
S7 = os.path.join(H, '..', '2026-10-10-who-keeps-the-close-calls', 'data', 'results.json')
PINS = {
    'coding': 'c08be42ea6da1a412147c7897f989fa2ed8f5d81bf93a40a2adffc640011fa37',
    'reader1': '369c07062a7dfc0d1f1cde8978dea0398665d7673d42721bfd94c6f51a664702',
    'reader2': 'baa3dee5d2255aff336ced52ea95234bf1b49a0c999c2a3029e065f44f099db8',
    'orbits': '57f12ebdfedb0939c31c64c0212cefa8849e6cf31ca5a1dc4ef5494d4dda2be7',
}


def sha(p):
    return hashlib.sha256(open(p, 'rb').read()).hexdigest()


def write_tsv(name, header, rows):
    with open(os.path.join(D, name), 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f, delimiter='\t', lineterminator='\n')
        w.writerow(header)
        w.writerows(rows)


def read_tsv(name):
    with open(os.path.join(D, name), encoding='utf-8') as f:
        return list(csv.DictReader(f, delimiter='\t'))


def extract(coding, r1, r2, orbits):
    for k, p in zip(PINS, (coding, r1, r2, orbits)):
        if sha(p) != PINS[k]:
            sys.exit(f'{k}: hash differs from the pinned file')
    c = json.load(open(coding, encoding='utf-8'))
    rows = []
    for e in c['events']:
        for x in e['entries']:
            rows.append([e['id'], e['year'], x['k'], x['label'], int(bool(x['hinge'])),
                         ' '.join(str(s) for s in x.get('steps', [])), x.get('kind', ''), x.get('actor', '')])
    write_tsv('hinges.tsv', ['event', 'year', 'keeper', 'keeper_label', 'hinge', 'steps', 'kind', 'actor'], rows)
    a = {x['event']: x['code'] for x in json.load(open(r1, encoding='utf-8'))}
    b = {x['event']: x['code'] for x in json.load(open(r2, encoding='utf-8'))}
    write_tsv('readers.tsv', ['event', 'reader1', 'reader2'], [[k, a[k], b[k]] for k in sorted(a)])
    o = json.load(open(orbits, encoding='utf-8'))['rows']
    write_tsv('orbits.tsv', ['des', 'cd', 'r_km', 'b_km', 'moid_km', 'h'],
              [[r['des'], r['cd'], r['r_km'], r['b_km'], r['moid_km'], r['h']] for r in o])


def pair_stats(events):
    n = named_both = same = a_named = 0
    for ev in events:
        for x, y in combinations(ev, 2):
            n += 1
            hx, hy = x['hinge'] == '1', y['hinge'] == '1'
            a_named += hx + hy
            if hx and hy:
                named_both += 1
                if set(x['steps'].split()) & set(y['steps'].split()):
                    same += 1
    return {'pairs': n, 'named_both': named_both, 'same_hinge': same,
            'share_named_both': named_both / n, 'share_same': same / n,
            'same_given_named_both': same / named_both if named_both else None,
            'dice_named': 2 * named_both / a_named if a_named else None}


def boot(events, key, n=2000, seed=195):
    rnd = random.Random(seed)
    v = []
    for _ in range(n):
        s = pair_stats([rnd.choice(events) for _ in events])[key]
        if s is not None:
            v.append(s)
    v.sort()
    return [round(v[int(0.025 * len(v))], 4), round(v[int(0.975 * len(v)) - 1], 4)]


def kappa(pairs):
    cats = sorted({c for p in pairs for c in p})
    n = len(pairs)
    po = sum(a == b for a, b in pairs) / n
    pe = sum((sum(a == c for a, _ in pairs) / n) * (sum(b == c for _, b in pairs) / n) for c in cats)
    return (po - pe) / (1 - pe), po


def verdict(ok, margin):
    return 'undecided' if margin else ('held' if ok else 'failed')


def main():
    if len(sys.argv) == 5:
        extract(*sys.argv[1:])
    hin = read_tsv('hinges.tsv')
    order = []
    by = {}
    for r in hin:
        if r['event'] not in by:
            order.append(r['event'])
            by[r['event']] = []
        by[r['event']].append(r)
    events = [by[e] for e in order]
    st = pair_stats(events)
    per_event = {e: pair_stats([by[e]]) for e in order}
    s7 = json.load(open(S7, encoding='utf-8'))
    ev_dice = s7['primary']['dice_mean']
    kinds = {}
    for r in hin:
        if r['hinge'] == '1':
            kinds[r['kind']] = kinds.get(r['kind'], 0) + 1
    # funnel per keeper pair
    kp = {}
    for ev in events:
        for x, y in combinations(sorted(ev, key=lambda r: r['keeper']), 2):
            k = f"{x['keeper']}-{y['keeper']}"
            d = kp.setdefault(k, {'pairs': 0, 'same': 0})
            d['pairs'] += 1
            d['same'] += (x['hinge'] == y['hinge'] == '1' and bool(set(x['steps'].split()) & set(y['steps'].split())))

    rd = read_tsv('readers.tsv')
    pr = [(r['reader1'], r['reader2']) for r in rd]
    k, po = kappa(pr)
    rnd = random.Random(195)
    kb = []
    for _ in range(2000):
        s = [rnd.choice(pr) for _ in pr]
        if len({c for p in s for c in p}) > 1:
            try:
                kb.append(kappa(s)[0])
            except ZeroDivisionError:
                pass
    kb.sort()

    # orbit check against study 8 (2015-2025, H 26-28, inner shell 0-2 LD)
    orb = read_tsv('orbits.tsv')
    bent = {(r['des'], datetime.strptime(r['cd'], '%Y-%b-%d %H:%M')) for r in orb if float(r['moid_km']) > float(r['b_km'])}
    pas = list(csv.DictReader(open(S8, encoding='utf-8'), delimiter='\t'))

    def is_bent(p):
        t = datetime.strptime(p['date_tdb'], '%Y-%m-%d %H:%M')
        return any(d == p['des'] and abs((t - c).total_seconds()) <= 86400 for d, c in bent_by.get(p['des'], []))
    bent_by = {}
    for d, c in bent:
        bent_by.setdefault(d, []).append((d, c))
    sel = [p for p in pas if p['H'] and p['v_inf_kms'] and p['b_ld'] and '2015' <= p['date_tdb'][:4] <= '2025'
           and 26 <= float(p['H']) < 28 and float(p['b_ld']) < 19.45]
    inner = [p for p in sel if float(p['b_ld']) < 2]
    matched_all = sum(1 for p in pas if p['b_ld'] and '2015' <= p['date_tdb'][:4] <= '2025' and is_bent(p))
    inner_bent = [p for p in inner if is_bent(p)]
    held = lambda n_all, n_inner: n_all / ((n_inner / 4.0) * 19.45 ** 2)
    res = {
        'inputs': {'coding_sha256': PINS['coding'], 'readers_sha256': [PINS['reader1'], PINS['reader2']],
                   'orbits_sha256': PINS['orbits'], 'events': len(events), 'entries': len(hin),
                   'entries_with_hinge': sum(r['hinge'] == '1' for r in hin)},
        'pairs': {k2: (round(v, 4) if isinstance(v, float) else v) for k2, v in st.items()},
        'ci95_by_event': {'share_same': boot(events, 'share_same'), 'share_named_both': boot(events, 'share_named_both'),
                          'same_given_named_both': boot(events, 'same_given_named_both')},
        'per_event': {e: {'pairs': v['pairs'], 'named_both': v['named_both'], 'same': v['same_hinge']} for e, v in per_event.items()},
        'per_keeper_pair': kp,
        'hinge_kinds': kinds,
        'funnel': {'event_dice_study7': ev_dice, 'events_on_3_or_4_lists': 14, 'events_union_study7': 53,
                   'event_agreeing_pairs': st['pairs'], 'hinge_agreeing_pairs': st['same_hinge']},
        'readers_kappa': {'n': len(pr), 'raw_agreement': round(po, 4), 'kappa': round(k, 4),
                          'kappa_ci95': [round(kb[int(0.025 * len(kb))], 4), round(kb[int(0.975 * len(kb)) - 1], 4)],
                          'codes_reader1': {c: sum(a == c for a, _ in pr) for c in 'CMN'},
                          'codes_reader2': {c: sum(b == c for _, b in pr) for c in 'CMN'},
                          'disagreements': [[r['event'], r['reader1'], r['reader2']] for r in rd if r['reader1'] != r['reader2']]},
        'orbit_check': {'atelier_rows': len(orb), 'bent_rows': len(bent), 'bent_matched_in_study8_2015_2025': matched_all,
                        'h26_28_inner_shell': len(inner), 'h26_28_inner_shell_bent': len(inner_bent),
                        'h26_28_total': len(sel),
                        'held_vs_inner_density_as_published': round(held(len(sel), len(inner)), 4),
                        'held_vs_inner_density_bent_set_aside': round(held(len(sel) - len(inner_bent), len(inner) - len(inner_bent)), 4)},
    }
    p = res['pairs']
    res['predictions'] = {
        'H1': {'bar': 'share of event-agreeing pairs with the same hinge < 0.50', 'value': p['share_same'],
               'verdict': verdict(p['share_same'] < 0.5, abs(p['share_same'] - 0.5) < 0.02), 'blind': False},
        'H2': {'bar': 'same hinge among pairs where both name one >= 0.60', 'value': p['same_given_named_both'],
               'verdict': verdict(p['same_given_named_both'] >= 0.6, abs(p['same_given_named_both'] - 0.6) < 0.02), 'blind': False},
        'H3': {'bar': 'share with the same hinge < study 7 mean event Dice', 'value': [p['share_same'], round(ev_dice, 4)],
               'verdict': verdict(p['share_same'] < ev_dice, abs(p['share_same'] - ev_dice) < 0.02), 'blind': False},
    }
    json.dump(res, open(os.path.join(D, 'results.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print(json.dumps({k2: res[k2] for k2 in ('pairs', 'ci95_by_event', 'readers_kappa', 'orbit_check', 'predictions')}, indent=1))


if __name__ == '__main__':
    main()
