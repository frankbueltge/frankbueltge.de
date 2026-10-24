"""Context for P1 (not a prediction): where the three mostly-silent indicators are silent, by NACE section,
class level, EU27. Usage: python3 silence_by_section.py <sbs2021.json>. Writes data/silence_by_section.json."""
import json, sys, re, collections
d = json.load(open(sys.argv[1]))
ids, size = d['id'], d['size']
idx = {k: d['dimension'][k]['category']['index'] for k in ids}
strides = [1] * len(ids)
for i in range(len(ids) - 2, -1, -1):
    strides[i] = strides[i + 1] * size[i + 1]
EU27 = 'BE BG CZ DK DE EE IE EL ES FR HR IT CY LV LT LU HU MT NL AT PL PT RO SI SK FI SE'.split()
out = {}
for ind in ['PUR_NRG_MEUR', 'STK_CHG_GD_FIN_MEUR', 'GM_GD_RS_MEUR', 'PUR_RS_MEUR']:
    c = collections.defaultdict(collections.Counter)
    for n in idx['nace_r2']:
        if not re.fullmatch('[A-S][0-9]{4}', n):
            continue
        for g in EU27:
            p = str(sum(idx[k][v] * s for k, v, s in zip(ids, ['A', n, ind, g, '2021'], strides)))
            f = d['status'].get(p, '')
            c[n[0]]['W' if 'C' in f else 'P' if p in d['value'] else 'S'] += 1
    out[ind] = {s: dict(v) for s, v in sorted(c.items())}
    print(ind, {s: round(v['S'] / sum(v.values()), 2) for s, v in sorted(c.items())})
json.dump(out, open('data/silence_by_section.json', 'w'), indent=1)
