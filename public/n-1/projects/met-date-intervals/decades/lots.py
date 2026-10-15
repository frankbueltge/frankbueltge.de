"""Lots study (session 3): what unit carries a hedged-date rule -- the museum, the department, the accession
decade, the accession year, or the lot (department + credit line)? Held-out test: the rule of each group is
learned on records with even Object ID and tried on odd ones; a group unseen in training falls back to the
department's rule. Usage: python3 -I lots.py MetObjects.csv > lots.json
CSV: Met Open Access (CC0), sha256 de617b9c947458e426111207f81a65bd1379a151c0077d3ce29cfc22fc0b9183.
Output: aggregates only. Lots are reported by size and rule; the credit line is not copied for lots named
after a person (floor rule 2 / project rights note) -- those are identified by department and accession year."""
import csv, sys, re, json, collections
csv.field_size_limit(10**8)
rows = []
with open(sys.argv[1], encoding='utf-8-sig', newline='') as f:
    for x in csv.DictReader(f):
        m = re.fullmatch(r'ca\. (\d{4})', x['Object Date'].strip())
        if not m: continue
        n = int(m.group(1)); off = (int(x['Object Begin Date']) - n, int(x['Object End Date']) - n)
        ay = re.search(r'(1[89]\d\d|20[0-2]\d)', x['AccessionYear'])
        y = int(ay.group(1)) if ay else None
        rows.append((int(x['Object ID']), x['Department'], y, x['Credit Line'].strip(), off))
G = {
 'one rule for the museum': lambda r: (),
 'department': lambda r: (r[1],),
 'department + accession decade': lambda r: (r[1], None if r[2] is None else r[2] // 10),
 'department + accession year': lambda r: (r[1], r[2]),
 'department + lot (credit line)': lambda r: (r[1], r[3]),
}
train = [r for r in rows if r[0] % 2 == 0]; test = [r for r in rows if r[0] % 2 == 1]
dep_mode = {}
dc = collections.defaultdict(collections.Counter)
for r in train: dc[r[1]][r[4]] += 1
for d, c in dc.items(): dep_mode[d] = c.most_common(1)[0][0]
glob = collections.Counter(r[4] for r in train).most_common(1)[0][0]
res = {}
for name, key in G.items():
    c = collections.defaultdict(collections.Counter)
    for r in train: c[key(r)][r[4]] += 1
    mode = {k: v.most_common(1)[0][0] for k, v in c.items()}
    hit = unseen = 0
    for r in test:
        k = key(r)
        if k in mode: p = mode[k]
        else: p = dep_mode.get(r[1], glob); unseen += 1
        hit += (p == r[4])
    res[name] = {'train': len(train), 'test': len(test), 'exact_offset_hit': round(hit / len(test), 4),
                 'test_in_unseen_group': round(unseen / len(test), 4), 'groups': len(mode)}
# lots: department + credit line with >= 200 'ca. YYYY' records
lot = collections.defaultdict(collections.Counter)
dept = collections.defaultdict(collections.Counter)
yrs = collections.defaultdict(collections.Counter)
for r in rows:
    lot[(r[1], r[3])][r[4]] += 1; dept[r[1]][r[4]] += 1; yrs[(r[1], r[3])][r[2]] += 1
big = []
for (d, cl), c in lot.items():
    n = sum(c.values())
    if n < 200: continue
    mod, mn = c.most_common(1)[0]
    rest = dept[d].copy(); rest.subtract(c)
    rn = sum(rest.values())
    inst = bool(re.search(r'Museum|Institute|Library|Society|Foundation', cl)) and not re.search(r'Gift of [A-Z][a-z]+ [A-Z]', cl)
    big.append({'department': d, 'n': n, 'accession_year': yrs[(d, cl)].most_common(1)[0][0], 'lot_rule': list(mod),
                'lot_share': round(mn / n, 3), 'rest_of_department_n': rn,
                'rest_share_of_lot_rule': round(rest[mod] / rn, 3) if rn else None,
                'rest_modal_rule': list(rest.most_common(1)[0][0]) if rn else None,
                'credit_line_published': cl if inst else None})
big.sort(key=lambda b: -b['n'])
print(json.dumps({'records': len(rows), 'groupings': res, 'lots_200_plus': big}, indent=1, ensure_ascii=False))
