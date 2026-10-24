"""Study 39 — the withheld cell. Reads Eurostat sbs_ovw_act (2021, JSON-stat) and tests P1–P6 of
PREDICTIONS.md. Usage: python3 analyse.py <sbs2021.json>  (fetch.sh downloads it and checks its digest).
Writes data/results.json and data/figure.js (the page's data)."""
import json, re, sys, random, math, hashlib, collections

SRC = sys.argv[1]
raw = open(SRC, 'rb').read()
d = json.loads(raw)
EU27 = ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU',
        'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE']
LEVEL_IND = ['EMP_NR', 'SAL_NR', 'SAL_FTE_NR', 'AV_MEUR', 'VAL_OUT_MEUR', 'WAGE_MEUR', 'HW_NR',
             'EXPN_SAL_BEN_MEUR', 'SS_COST_MEUR', 'GOS_MEUR', 'GRSINV_TNCA_MEUR', 'GRSINV_MAC_MEUR',
             'PUR_MEUR', 'PUR_RS_MEUR', 'PUR_AGN_MEUR', 'PUR_NRG_MEUR', 'STK_CHG_GD_FIN_MEUR',
             'GM_GD_RS_MEUR', 'NETTUR_MEUR']
TOTAL = 'B-S_X_O_S94'

ids, size = d['id'], d['size']
idx = {k: d['dimension'][k]['category']['index'] for k in ids}
labels = {k: d['dimension'][k]['category']['label'] for k in ids}
strides = [1] * len(ids)
for i in range(len(ids) - 2, -1, -1):
    strides[i] = strides[i + 1] * size[i + 1]
val, st = d['value'], d.get('status', {})


def pos(**kw):
    return str(sum(idx[k][kw[k]] * s for k, s in zip(ids, strides)))


def state(geo, nace, ind):
    p = pos(freq='A', nace_r2=nace, indic_sbs=ind, geo=geo, time='2021')
    flag = st.get(p, '')
    if 'C' in flag:
        return 'W', val.get(p)
    if p in val:
        return 'P', val[p]
    return ('F' if flag else 'S'), None   # F: flagged empty, no C (none expected)


def level(code):
    if not re.fullmatch('[A-S][0-9]*', code):
        return None
    return {2: 'division', 3: 'group', 4: 'class'}.get(len(code) - 1)


naces = [c for c in idx['nace_r2'] if level(c)]
cells = {}   # (geo, nace, ind) -> state
withheld_with_value = 0
for g in EU27:
    for n in naces:
        for i in LEVEL_IND + ['ENT_NR']:
            s, v = state(g, n, i)
            cells[(g, n, i)] = s
            if s == 'W' and v is not None:
                withheld_with_value += 1

def rate(sel):
    c = collections.Counter(sel)
    return c['W'] / (c['W'] + c['P']) if c['W'] + c['P'] else float('nan'), c

res = {'source': {'dataset': 'sbs_ovw_act', 'label': d['label'], 'updated': d['updated'],
                  'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)},
       'withheld_cells_carrying_a_value': withheld_with_value}

# P1 — silence vs withholding among empty level-indicator cells
lv = [cells[(g, n, i)] for g in EU27 for n in naces for i in LEVEL_IND]
c = collections.Counter(lv)
empty = c['W'] + c['S'] + c['F']
res['P1'] = {'counts': dict(c), 'withheld_share_of_empty': c['W'] / empty,
             'held': c['W'] / empty < 0.5}
# the structural check: where do silent cells sit relative to ENT_NR?
sil = collections.Counter()
for g in EU27:
    for n in naces:
        e = cells[(g, n, 'ENT_NR')]
        ev = val.get(pos(freq='A', nace_r2=n, indic_sbs='ENT_NR', geo=g, time='2021'))
        key = 'ENT_NR withheld' if e == 'W' else 'ENT_NR absent' if e in 'SF' else \
              'ENT_NR = 0' if ev == 0 else 'ENT_NR > 0'
        for i in LEVEL_IND:
            if cells[(g, n, i)] == 'S':
                sil[key] += 1
res['P1']['silent_cells_by_ENT_NR'] = dict(sil)
# silent rows: whole country × code with nothing in any level indicator
blank_rows = sum(1 for g in EU27 for n in naces
                 if all(cells[(g, n, i)] == 'S' for i in LEVEL_IND))
res['P1']['country_codes_all_19_silent'] = blank_rows
res['P1']['country_codes_total'] = len(EU27) * len(naces)
# silence per indicator, pooled
res['P1']['silent_share_by_indicator'] = {
    i: sum(cells[(g, n, i)] == 'S' for g in EU27 for n in naces) / (len(EU27) * len(naces))
    for i in LEVEL_IND}

# context, added after P1 was scored: silence that is the schema's — a (NACE section, indicator) block
# silent in every member state and every code — against silence that falls on single countries.
blocks = collections.defaultdict(collections.Counter)
for g in EU27:
    for n in naces:
        for i in LEVEL_IND:
            blocks[(n[0], i)][cells[(g, n, i)]] += 1
schema = {k for k, v in blocks.items() if v['S'] == sum(v.values())}
s_out = sum(v['S'] for k, v in blocks.items() if k not in schema)
res['P1']['schema_blocks_all_silent'] = sorted(f'{a}|{b}' for a, b in schema)
res['P1']['silent_outside_schema_blocks'] = s_out
res['P1']['withheld_share_of_empty_outside_schema_blocks'] = c['W'] / (c['W'] + s_out)

# country size
size_ ={g: val.get(pos(freq='A', nace_r2=TOTAL, indic_sbs='ENT_NR', geo=g, time='2021')) for g in EU27}
res['size'] = size_

classes = [n for n in naces if level(n) == 'class']
rnd = random.Random(39)


def country_rate(g, codes):
    w = p = 0
    for n in codes:
        for i in LEVEL_IND:
            s = cells[(g, n, i)]
            w += s == 'W'; p += s == 'P'
    return w / (w + p) if w + p else float('nan'), w, p


def boot_country(g, codes, B=2000):
    per = []
    for n in codes:
        w = sum(cells[(g, n, i)] == 'W' for i in LEVEL_IND)
        p = sum(cells[(g, n, i)] == 'P' for i in LEVEL_IND)
        if w + p:
            per.append((w, p))
    out = []
    for _ in range(B):
        s = [per[rnd.randrange(len(per))] for _ in per]
        W = sum(a for a, _ in s); P = sum(b for _, b in s)
        out.append(W / (W + P))
    out.sort()
    return out[int(0.025 * B)], out[int(0.975 * B) - 1], len(per)


countries = []
for g in EU27:
    r, w, p = country_rate(g, classes)
    lo, hi, k = boot_country(g, classes)
    rd, _, _ = country_rate(g, [n for n in naces if level(n) == 'division'])
    s_c = collections.Counter(cells[(g, n, i)] for n in classes for i in LEVEL_IND)
    countries.append({'geo': g, 'name': labels['geo'][g], 'enterprises': size_[g], 'rate': r,
                      'lo': lo, 'hi': hi, 'withheld': w, 'published': p,
                      'silent': s_c['S'], 'classes_with_data': k, 'rate_division': rd})


def ranks(x):
    o = sorted(range(len(x)), key=lambda i: x[i])
    r = [0.0] * len(x); i = 0
    while i < len(o):
        j = i
        while j + 1 < len(o) and x[o[j + 1]] == x[o[i]]:
            j += 1
        for k in range(i, j + 1):
            r[o[k]] = (i + j) / 2 + 1
        i = j + 1
    return r


def spearman(a, b):
    ra, rb = ranks(a), ranks(b)
    ma, mb = sum(ra) / len(ra), sum(rb) / len(rb)
    num = sum((x - ma) * (y - mb) for x, y in zip(ra, rb))
    den = math.sqrt(sum((x - ma) ** 2 for x in ra) * sum((y - mb) ** 2 for y in rb))
    return num / den


xs = [c_['enterprises'] for c_ in countries]
ys = [c_['rate'] for c_ in countries]
rho = spearman(xs, ys)
bs = []
for _ in range(2000):
    s = [rnd.randrange(len(xs)) for _ in xs]
    bx = [xs[i] for i in s]; by = [ys[i] for i in s]
    if len(set(bx)) > 2:
        bs.append(spearman(bx, by))
bs.sort()
res['P2'] = {'rho': rho, 'ci': [bs[int(0.025 * len(bs))], bs[int(0.975 * len(bs)) - 1]],
             'held': rho <= -0.5}

smallest = sorted(countries, key=lambda c_: c_['enterprises'])[:3]
by_rate = sorted(countries, key=lambda c_: -c_['rate'])
rank_of = {c_['geo']: k + 1 for k, c_ in enumerate(by_rate)}
res['P3'] = {'smallest': [(c_['geo'], c_['enterprises'], rank_of[c_['geo']]) for c_ in smallest],
             'held': all(rank_of[c_['geo']] <= 9 for c_ in smallest)}

lev_rates = {}
for L in ['division', 'group', 'class']:
    sel = [cells[(g, n, i)] for g in EU27 for n in naces if level(n) == L for i in LEVEL_IND]
    lev_rates[L] = rate(sel)[0]
res['P4'] = {'rates': lev_rates, 'ratio_class_to_division': lev_rates['class'] / lev_rates['division'],
             'held': lev_rates['class'] >= 3 * lev_rates['division']}


def wilson(k, n, z=1.96):
    if n == 0:
        return [float('nan')] * 2
    p = k / n; den = 1 + z * z / n
    c0 = (p + z * z / (2 * n)) / den; h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return [c0 - h, c0 + h]


BINS = [(1, 2), (3, 4), (5, 9), (10, 19), (20, 49), (50, 99), (100, 999), (1000, 10 ** 9)]
thr = []
for lo_, hi_ in BINS:
    w = p = cellsn = 0
    for g in EU27:
        for n in classes:
            if cells[(g, n, 'ENT_NR')] != 'P':
                continue
            e = val[pos(freq='A', nace_r2=n, indic_sbs='ENT_NR', geo=g, time='2021')]
            if not lo_ <= e <= hi_:
                continue
            cellsn += 1
            for i in LEVEL_IND:
                s = cells[(g, n, i)]
                w += s == 'W'; p += s == 'P'
    thr.append({'bin': [lo_, hi_], 'country_classes': cellsn, 'withheld': w, 'published': p,
                'rate': w / (w + p) if w + p else None, 'wilson': wilson(w, w + p)})
res['P5'] = {'bins': thr, 'held': thr[0]['rate'] >= 0.8 and all(
    b['rate'] <= 0.10 for b in thr if b['bin'][0] >= 50)}

ent = collections.Counter(cells[(g, n, 'ENT_NR')] for g in EU27 for n in classes)
res['P6'] = {'counts': dict(ent), 'rate': ent['W'] / (ent['W'] + ent['P']),
             'held': ent['W'] / (ent['W'] + ent['P']) < 0.02}
res['countries'] = countries

# a matrix for the page: per country, per NACE section, class-level rate
sections = sorted(set(n[0] for n in classes))
res['sections'] = {s: labels['nace_r2'].get(s, s) for s in sections}
mat = {}
for g in EU27:
    for s in sections:
        sel = [cells[(g, n, i)] for n in classes if n[0] == s for i in LEVEL_IND]
        r_, cc = rate(sel)
        mat[f'{g}|{s}'] = {'rate': None if math.isnan(r_) else r_, 'W': cc['W'], 'P': cc['P'], 'S': cc['S']}
res['matrix'] = mat

json.dump(res, open('data/results.json', 'w'), indent=1)
open('data/figure.js', 'w').write('window.STUDY39 = ' + json.dumps(res) + ';\n')
for k in ['P1', 'P2', 'P3', 'P4', 'P5', 'P6']:
    print(k, json.dumps({x: y for x, y in res[k].items() if x != 'bins'})[:400])
for b in thr:
    print(b)
print('withheld cells carrying a value:', withheld_with_value)
for c_ in sorted(countries, key=lambda c_: c_['enterprises']):
    print(c_['geo'], c_['enterprises'], round(c_['rate'], 3), round(c_['lo'], 3), round(c_['hi'], 3),
          'silent', c_['silent'], 'div', round(c_['rate_division'], 3))
