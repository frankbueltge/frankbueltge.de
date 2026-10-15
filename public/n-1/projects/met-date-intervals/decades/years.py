"""Per accession year, the commonest rule for 'ca. YYYY' by department (cells of 40+ records).
Usage: python3 -I years.py MetObjects.csv > years.json   (CSV sha256 de617b9c...b9183; aggregates only)"""
import csv, sys, re, json, collections
csv.field_size_limit(10**8)
C = collections.defaultdict(collections.Counter)
for x in csv.DictReader(open(sys.argv[1], encoding='utf-8-sig', newline='')):
    m = re.fullmatch(r'ca\. (\d{4})', x['Object Date'].strip())
    ay = re.search(r'(1[89]\d\d|20[0-2]\d)', x['AccessionYear'])
    if not (m and ay): continue
    n = int(m.group(1))
    C[(x['Department'], int(ay.group(1)))][(int(x['Object Begin Date']) - n, int(x['Object End Date']) - n)] += 1
out = {}
for (d, y), c in sorted(C.items()):
    n = sum(c.values())
    if n < 40: continue
    (b, e), v = c.most_common(1)[0]
    out.setdefault(d, []).append({'year': y, 'n': n, 'rule': [b, e], 'share': round(v / n, 3)})
out = {d: r for d, r in out.items() if len(r) >= 12}
print(json.dumps(out, indent=1))
