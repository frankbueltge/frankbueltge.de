"""Who decides that a near miss counts? (study 6, session 191). Pre-registered in PREREGISTRATION.md.

Usage: python3 -I analyse.py <path to mongodump_full_snapshot/>

Reads aiidprod/classifications.bson and incidents.csv of AIID snapshot backup-20261005101424 and
writes data/results.json (aggregates, predictions) and data/cells.json (one row per incident:
id, year, final AI Harm Level and Tangible Harm, the annotators' AI Harm Level). No report text.
"""
import csv, json, os, sys, random, collections, hashlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import bsonlite

csv.field_size_limit(10**9)
SNAP = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
FIELD, TANG = 'AI Harm Level', 'Tangible Harm'
VALUES = ['AI tangible harm event', 'AI tangible harm near-miss', 'AI tangible harm issue', 'none', 'unclear']
NEAR, EVENT = VALUES[1], VALUES[0]
FOURTEEN = [65, 1152, 1604, 1627, 1628, 1629, 1633, 1642, 1649, 1668, 1673, 1685, 1700, 1707]

cls_path = os.path.join(SNAP, 'aiidprod', 'classifications.bson')
sha = hashlib.sha256(open(cls_path, 'rb').read()).hexdigest()
docs = bsonlite.read(cls_path)
with open(os.path.join(SNAP, 'incidents.csv'), newline='', encoding='utf-8') as f:
    inc = list(csv.DictReader(f))
year = {int(r['incident_id']): int(r['date'][:4]) for r in inc if r['date'][:4].isdigit()}
n_inc = len(inc)


def attr(d, name):
    for a in d.get('attributes', []):
        if a.get('short_name') == name:
            v = a.get('value_json')
            try:
                v = json.loads(v) if isinstance(v, str) else v
            except ValueError:
                pass
            return v if isinstance(v, str) else (None if v in (None, '', []) else str(v))
    return None


rec = collections.defaultdict(dict)        # namespace -> incident -> value
who = collections.defaultdict(dict)        # namespace -> incident -> annotator id
status = {}
tang = {}
multi = collections.Counter()
publish = collections.Counter()
for d in docs:
    ns = d['namespace']
    if not ns.startswith('CSETv1'):
        continue
    publish[(ns, d.get('publish'))] += 1
    for i in d.get('incidents', []):
        if i in rec[ns]:
            multi[ns] += 1
        v = attr(d, FIELD)
        rec[ns][i] = v.strip() if v else None
        who[ns][i] = attr(d, 'Annotator')
        if ns == 'CSETv1':
            status[i] = attr(d, 'Annotation Status')
        if ns == 'CSETv1':
            t = attr(d, TANG)
            tang[i] = t.strip() if t else None

final = rec['CSETv1']
ANN = ['CSETv1_Annotator-1', 'CSETv1_Annotator-2', 'CSETv1_Annotator-3']
off_list = sorted({v for ns in rec for v in rec[ns].values() if v and v not in VALUES})

# ---- coverage -------------------------------------------------------------------------
cov = len(final)
final_nb = {i: v for i, v in final.items() if v}
final_counts = collections.Counter(final_nb.values())
n_near = final_counts.get(NEAR, 0)

# ---- pairs ----------------------------------------------------------------------------
pair_who, pairs, blank_excluded, triples, all_pairs3 = [], [], 0, 0, collections.Counter()
ann_incidents = set().union(*[set(rec[a]) for a in ANN])
for i in sorted(ann_incidents):
    present = [a for a in ANN if i in rec[a]]
    vals = [(a, rec[a][i]) for a in present]
    if len(present) >= 2 and any(v is None for _, v in vals[:2]):
        blank_excluded += 1
    nb = [(a, v) for a, v in vals if v]
    if len(nb) == 3:
        triples += 1
        for x in range(3):
            for y in range(x + 1, 3):
                all_pairs3[(nb[x][1] == nb[y][1])] += 1
    if len(nb) >= 2:
        pairs.append((i, nb[0][1], nb[1][1]))
        pair_who.append((who[nb[0][0]][i], who[nb[1][0]][i]))


def kappa(ps):
    n = len(ps)
    if not n:
        return None
    po = sum(a == b for _, a, b in ps) / n
    ca = collections.Counter(a for _, a, _ in ps)
    cb = collections.Counter(b for _, _, b in ps)
    pe = sum(ca[k] * cb[k] for k in set(ca) | set(cb)) / n / n
    return (po - pe) / (1 - pe) if pe < 1 else None


def specific(ps, v):
    both = sum(a == v and b == v for _, a, b in ps)
    na = sum(a == v for _, a, _ in ps)
    nb = sum(b == v for _, _, b in ps)
    return (2 * both / (na + nb) if na + nb else None), both, na, nb


def boot(fn, ps, k=2000, seed=191):
    rng = random.Random(seed)
    out = []
    for _ in range(k):
        s = [ps[rng.randrange(len(ps))] for _ in ps]
        v = fn(s)
        if v is not None:
            out.append(v)
    out.sort()
    return [round(out[int(0.025 * len(out))], 4), round(out[int(0.975 * len(out)) - 1], 4)]


k = kappa(pairs)
raw = sum(a == b for _, a, b in pairs) / len(pairs) if pairs else None
spec = {v: specific(pairs, v) for v in VALUES}
k_ci = boot(kappa, pairs)
near_ci = boot(lambda s: specific(s, NEAR)[0], pairs)
event_ci = boot(lambda s: specific(s, EVENT)[0], pairs)
conf = collections.Counter((a, b) for _, a, b in pairs)
# unordered confusion
uconf = collections.Counter(tuple(sorted((a, b))) for _, a, b in pairs)

# ---- exploratory: adjudication and consistency ----------------------------------------
adjud = collections.Counter()
for i, a, b in pairs:
    if a != b:
        f = final.get(i)
        adjud['A' if f == a else 'B' if f == b else ('no final value' if f is None else 'third:' + f)] += 1
near_any = sum(1 for _, a, b in pairs if NEAR in (a, b))
near_final_when_any = sum(1 for i, a, b in pairs if NEAR in (a, b) and final.get(i) == NEAR)
near_final_from_split = sum(1 for i, a, b in pairs if (a == NEAR) != (b == NEAR) and final.get(i) == NEAR)
near_final_ids = sorted(i for i, v in final_nb.items() if v == NEAR)
tang_of_near = collections.Counter(tang.get(i) for i in near_final_ids)
by_year = collections.defaultdict(collections.Counter)
for i, v in final_nb.items():
    by_year[year.get(i)][v] += 1

# ---- exploratory, found in the reading (declared in the page as found after the run) ----
same_person_pairs = sum(1 for x, y in pair_who if x == y)
ann_records_per_final = collections.Counter(sum(1 for a in ANN if i in rec[a]) for i in final)
calls = collections.defaultdict(collections.Counter)
for a in ANN:
    for i, v in rec[a].items():
        if v:
            calls[who[a][i]][v] += 1
per_annotator = {str(w): {'calls': sum(c.values()), 'near': c.get(NEAR, 0), 'namespaces': sorted(a for a in ANN if w in set(who[a].values()))}
                 for w, c in sorted(calls.items(), key=lambda x: -sum(x[1].values()))}
diff_ci = boot(lambda s: (None if specific(s, NEAR)[0] is None or specific(s, EVENT)[0] is None
                          else specific(s, EVENT)[0] - specific(s, NEAR)[0]), pairs)
status_counts = collections.Counter(status.values())
# within pairs, the most prolific annotator against the partner on the same incident (controls incident mix)
top = max(calls, key=lambda w: sum(calls[w].values()))
paired_top = [(a if x == top else b, b if x == top else a, i) for (i, a, b), (x, y) in zip(pairs, pair_who) if top in (x, y)]
top_near_only = sum(1 for t, o, _ in paired_top if t == NEAR and o != NEAR)
partner_near_only = sum(1 for t, o, _ in paired_top if o == NEAR and t != NEAR)
# exact two-sided sign test on the discordant near-miss calls
from math import comb
nd = top_near_only + partner_near_only
kk = min(top_near_only, partner_near_only)
sign_p = min(1.0, 2 * sum(comb(nd, j) for j in range(kk + 1)) / 2 ** nd) if nd else None
final_near_with_top = sum(1 for i in near_final_ids if who[ANN[0]].get(i) == top and rec[ANN[0]].get(i) == NEAR
                          or who[ANN[1]].get(i) == top and rec[ANN[1]].get(i) == NEAR)

# ---- predictions ----------------------------------------------------------------------
def verdict(x, bar, below=True, margin=0.05):
    if x is None:
        return 'not computable'
    if abs(x - bar) < margin:
        return 'undecided'
    return 'held' if ((x < bar) if below else (x > bar)) else 'failed'

share_cov = cov / n_inc
share_near = n_near / len(final_nb) if final_nb else None
fourteen_with = [i for i in FOURTEEN if i in final]
preds = {
    'P1': {'text': 'final CSETv1 covers fewer than half of the 1,713 incidents',
           'value': round(share_cov, 4), 'verdict': verdict(share_cov, 0.5, margin=0.02)},
    'P2': {'text': 'fewer than 10 % of final non-blank AI Harm Levels are near-miss',
           'value': round(share_near, 4) if share_near is not None else None, 'verdict': verdict(share_near, 0.10, margin=0.02)},
    'P3': {'text': 'Cohen kappa between two annotators below 0.60',
           'value': round(k, 4) if k is not None else None, 'ci95': k_ci, 'verdict': verdict(k, 0.60)},
    'P4': {'text': 'specific agreement on near-miss lower than on event',
           'value': [round(spec[NEAR][0], 4) if spec[NEAR][0] is not None else None, round(spec[EVENT][0], 4) if spec[EVENT][0] is not None else None],
           'verdict': ('not computable' if spec[NEAR][0] is None or spec[EVENT][0] is None else
                       'undecided' if abs(spec[NEAR][0] - spec[EVENT][0]) < 0.05 else
                       'held' if spec[NEAR][0] < spec[EVENT][0] else 'failed')},
    'P5': {'text': 'none of the 14 incidents of study 188 carries a final CSETv1 record',
           'value': fourteen_with, 'verdict': 'held' if not fourteen_with else 'failed'},
}

res = {
    'snapshot': 'backup-20261005101424', 'classifications_sha256': sha,
    'n_incidents': n_inc,
    'namespace_records': {ns: len(rec[ns]) for ns in sorted(rec)},
    'namespace_publish': {f'{a}|{b}': c for (a, b), c in sorted(publish.items(), key=str)},
    'duplicate_records_per_namespace': dict(multi),
    'off_list_values': off_list,
    'coverage': {'final': cov, 'share': round(share_cov, 4), 'max_id': max(final) if final else None,
                 'min_id': min(final) if final else None, 'final_nonblank': len(final_nb),
                 'final_blank': cov - len(final_nb),
                 'ids_above_1000': sum(1 for i in final if i > 1000)},
    'final_counts': {v: final_counts.get(v, 0) for v in VALUES},
    'final_other': {v: c for v, c in final_counts.items() if v not in VALUES},
    'pairs': {'n': len(pairs), 'blank_excluded': blank_excluded, 'incidents_with_any_annotator': len(ann_incidents),
              'triples': triples, 'triple_pairwise_agree': all_pairs3.get(True, 0), 'triple_pairwise_disagree': all_pairs3.get(False, 0),
              'kappa': round(k, 4) if k is not None else None, 'kappa_ci95': k_ci, 'raw_agreement': round(raw, 4) if raw is not None else None,
              'specific': {v: {'value': None if s[0] is None else round(s[0], 4), 'both': s[1], 'a': s[2], 'b': s[3]} for v, s in spec.items()},
              'near_ci95': near_ci, 'event_ci95': event_ci,
              'unordered_confusion': [[a, b, c] for (a, b), c in sorted(uconf.items(), key=lambda x: -x[1])]},
    'exploratory': {
        'adjudication_of_disagreements': dict(adjud),
        'pairs_where_either_says_near': near_any,
        'of_those_final_near': near_final_when_any,
        'final_near_from_split_pairs': near_final_from_split,
        'pairs_both_near': spec[NEAR][1],
        'final_near_ids': near_final_ids,
        'tangible_harm_of_final_near': {str(k2): v for k2, v in tang_of_near.items()},
        'top_annotator': {'id': top, 'records': sum(calls[top].values()), 'of_all_annotator_calls': sum(sum(c.values()) for c in calls.values()),
                          'pairs_with_top': len(paired_top), 'top_says_near_partner_not': top_near_only,
                          'partner_says_near_top_not': partner_near_only, 'sign_test_p_two_sided': None if sign_p is None else round(sign_p, 4),
                          'final_near_where_top_called_near': final_near_with_top,
                          'final_records_with_top': sum(1 for i in final if any(who[a].get(i) == top for a in ANN)),
                          'final_near_where_another_called_near': sum(1 for i in near_final_ids if any(who[a].get(i) not in (None, top) and rec[a].get(i) == NEAR for a in ANN))},
        'pairs_same_annotator_id': same_person_pairs,
        'final_by_number_of_annotator_records': {str(k2): v for k2, v in sorted(ann_records_per_final.items())},
        'per_annotator': per_annotator,
        'event_minus_near_specific_ci95': diff_ci,
        'final_annotation_status': {str(k2): v for k2, v in status_counts.most_common()},
        'incident_65': {'final': final.get(65), 'a1': rec[ANN[0]].get(65), 'a2': rec[ANN[1]].get(65), 'status': status.get(65)},
        'final_by_year': {str(y): dict(c) for y, c in sorted(by_year.items(), key=lambda x: (x[0] is None, x[0]))},
    },
    'predictions': preds,
}
json.dump(res, open(os.path.join(HERE, 'data', 'results.json'), 'w'), indent=1)
cells = [{'id': i, 'year': year.get(i), 'final': final.get(i), 'tangible': tang.get(i),
          'status': status.get(i),
          'ann': [[who[a].get(i), rec[a].get(i)] for a in ANN if i in rec[a]]}
         for i in sorted(set(final) | ann_incidents)]
json.dump(cells, open(os.path.join(HERE, 'data', 'cells.json'), 'w'))
print(json.dumps({k2: res[k2] for k2 in ('namespace_records', 'off_list_values', 'coverage', 'final_counts', 'final_other', 'predictions')}, indent=1))
print(json.dumps(res['pairs'], indent=1)); print(json.dumps(res['exploratory'], indent=1)[:3000])
