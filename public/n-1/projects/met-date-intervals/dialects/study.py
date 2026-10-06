"""Dialects study: what the museum's numbers do with the same phrase, by department.
Usage: python3 -I study.py MetObjects.csv > dialects.json
CSV: Met Open Access (CC0), sha256 de617b9c947458e426111207f81a65bd1379a151c0077d3ce29cfc22fc0b9183,
refetched 2026-10-06 01:18Z, hash unchanged since 2026-10-05. Output: aggregates only; no names, no objects."""
import csv, sys, re, json, collections
csv.field_size_limit(10**8)
ORD = r'(\d{1,2})(?:st|nd|rd|th)'
FAM = {  # key: (regex, kind) ; kind 'year' offsets from the stated year, 'century' offsets from century start
 'ca. YYYY': (r'ca\. (\d{4})', 'year'),
 'early Nth century': (r'early ' + ORD + ' century', 'century'),
 'mid-Nth century': (r'mid-' + ORD + ' century', 'century'),
 'late Nth century': (r'late ' + ORD + ' century', 'century'),
 'first half of the Nth century': (r'first half (?:of the )?' + ORD + ' century', 'century'),
 'second half of the Nth century': (r'second half (?:of the )?' + ORD + ' century', 'century'),
 'Nth century': (ORD + ' century', 'century'),
}
data = {k: collections.defaultdict(collections.Counter) for k in FAM}
with open(sys.argv[1], encoding='utf-8-sig', newline='') as f:
    for x in csv.DictReader(f):
        t = x['Object Date'].strip(); b = int(x['Object Begin Date']); e = int(x['Object End Date'])
        for k, (pat, kind) in FAM.items():
            m = re.fullmatch(pat, t)
            if not m: continue
            n = int(m.group(1)); base = n if kind == 'year' else (n - 1) * 100
            if kind == 'century' and not (1 <= n <= 20): break
            data[k][x['Department']][(b - base, e - base)] += 1
            break
out = {}
for k, D in data.items():
    rows = []
    for d, c in D.items():
        n = sum(c.values())
        if n < 100: continue
        rows.append({'department': d, 'n': n, 'top': [[o[0], o[1], v, round(v / n, 3)] for o, v in c.most_common(3)]})
    rows.sort(key=lambda r: -r['n'])
    out[k] = {'kind': FAM[k][1], 'departments': rows, 'n_all': sum(r['n'] for r in rows)}
print(json.dumps(out, indent=1, ensure_ascii=False))
