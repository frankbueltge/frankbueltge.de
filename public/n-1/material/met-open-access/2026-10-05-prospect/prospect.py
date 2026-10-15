"""Aggregates over the Met Open Access CSV (CC0). Usage: python3 prospect.py MetObjects.csv
The CSV (317,650,992 bytes, sha256 de617b9c...b9183, fetched 2026-10-05 01:22Z from
media.githubusercontent.com/media/metmuseum/openaccess/master/MetObjects.csv) is not committed.
Output: aggregates only; object numbers for the inverted intervals; no names."""
import csv, sys, re, json, collections
csv.field_size_limit(10**8)
rows = []
with open(sys.argv[1], encoding='utf-8-sig', newline='') as f:
    for x in csv.DictReader(f):
        rows.append((int(x['Object ID']), x['Department'], x['Object Date'], int(x['Object Begin Date']), int(x['Object End Date'])))
out = {'objects': len(rows)}
inv = [r for r in rows if r[4] < r[3]]
out['inverted'] = len(inv)
ok = [r for r in rows if r[4] >= r[3]]
W = [r[4]-r[3] for r in ok]
Ws = sorted(W)
out['width_quantiles'] = {str(q): Ws[int(q*(len(Ws)-1))] for q in (.1,.25,.5,.75,.9,.99)}
out['non_negative_width_n'] = len(W)
out['zero_zero'] = sum(1 for r in ok if r[3] == 0 and r[4] == 0)
out['width_zero'] = sum(1 for w in W if w == 0)
# widths that are one short of a round span: a calendar convention (e.g. 1700-1799), not a measurement
for k in (9, 24, 49, 99, 199, 999):
    out[f'width_eq_{k}'] = sum(1 for w in W if w == k)
out['width_eq_99_199_999_share'] = round(sum(1 for w in W if w in (99, 199, 999)) / len(W), 4)
# does the free text say what the numbers say?
cen = [r for r in ok if re.search(r'century', r[2], re.I)]
out['text_mentions_century'] = len(cen)
out['century_text_width_99'] = sum(1 for r in cen if r[4]-r[3] == 99)
ca = [r for r in ok if re.search(r'\bca\.|about|probably', r[2], re.I)]
out['text_mentions_ca'] = len(ca)
out['ca_width_zero'] = sum(1 for r in ca if r[4] == r[3])
nodate = [r for r in ok if r[2].strip() == '']
out['empty_date_text'] = len(nodate)
out['inverted_examples'] = [(r[0], r[2], r[3], r[4]) for r in inv[:12]]
out['inverted_text_bc'] = sum(1 for r in inv if re.search(r'B\.?C', r[2]))
out['wide_ge_5000'] = [(r[0], r[1], r[2], r[3], r[4]) for r in ok if r[4]-r[3] >= 5000][:20]
out['wide_ge_5000_n'] = sum(1 for r in ok if r[4]-r[3] >= 5000)
print(json.dumps(out, indent=1, ensure_ascii=False))
