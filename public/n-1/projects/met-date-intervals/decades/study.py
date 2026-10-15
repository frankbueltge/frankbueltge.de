"""Decades study (session 3): does a department's rule for a hedged date hold across the decade the object
was accessioned, and across the century the date names?
Usage: python3 -I study.py MetObjects.csv > decades.json
CSV: Met Open Access (CC0), sha256 de617b9c947458e426111207f81a65bd1379a151c0077d3ce29cfc22fc0b9183,
refetched 2026-10-07 01:18Z, hash unchanged since 2026-10-05. Output: aggregates only; no names, no objects."""
import csv, sys, re, json, collections
csv.field_size_limit(10**8)
ORD = r'(\d{1,2})(?:st|nd|rd|th)'
FAM = {
 'ca. YYYY': (r'ca\. (\d{4})', 'year'),
 'early Nth century': (r'early ' + ORD + ' century', 'century'),
 'late Nth century': (r'late ' + ORD + ' century', 'century'),
}
MIN = 30  # smallest cell shown
cells = {k: collections.defaultdict(collections.Counter) for k in FAM}   # (dept, axis, bin) -> Counter(offsets)
dept_all = {k: collections.defaultdict(collections.Counter) for k in FAM}
noyear = 0; total = 0
with open(sys.argv[1], encoding='utf-8-sig', newline='') as f:
    for x in csv.DictReader(f):
        t = x['Object Date'].strip(); b = int(x['Object Begin Date']); e = int(x['Object End Date'])
        for k, (pat, kind) in FAM.items():
            m = re.fullmatch(pat, t)
            if not m: continue
            n = int(m.group(1))
            if kind == 'century' and not (1 <= n <= 20): break
            base = n if kind == 'year' else (n - 1) * 100
            off = (b - base, e - base)
            d = x['Department']
            total += 1
            dept_all[k][d][off] += 1
            ay = x['AccessionYear'].strip()
            mm = re.search(r'(1[89]\d\d|20[0-2]\d)', ay)
            if mm:
                dec = int(mm.group(1)) // 10 * 10
                cells[k][(d, 'accession', dec)][off] += 1
            else:
                noyear += 1
            cen = (n - 1) // 100 + 1 if kind == 'year' else n   # century the date names
            cells[k][(d, 'named', cen)][off] += 1
            break
out = {'min_cell': MIN, 'records_in_families': total, 'no_accession_year': noyear, 'families': {}}
for k in FAM:
    deps = [d for d, c in dept_all[k].items() if sum(c.values()) >= 100]
    deps.sort(key=lambda d: -sum(dept_all[k][d].values()))
    fam = {}
    for d in deps:
        tot = sum(dept_all[k][d].values())
        mod, modn = dept_all[k][d].most_common(1)[0]
        rec = {'n': tot, 'modal': list(mod), 'modal_share': round(modn / tot, 3), 'axes': {}}
        for axis in ('accession', 'named'):
            rows = []
            for (dd, ax, bn), c in sorted(cells[k].items(), key=lambda i: i[0][2]):
                if dd != d or ax != axis: continue
                n = sum(c.values())
                if n < MIN: continue
                tm, tn = c.most_common(1)[0]
                rows.append({'bin': bn, 'n': n, 'top': list(tm), 'share': round(tn / n, 3),
                             'share_of_dept_modal': round(c[mod] / n, 3)})
            rec['axes'][axis] = rows
        fam[d] = rec
    out['families'][k] = fam
print(json.dumps(out, indent=1, ensure_ascii=False))
