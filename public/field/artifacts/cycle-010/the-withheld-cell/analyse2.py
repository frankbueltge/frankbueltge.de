"""Study 40 — the dominant firm. Tests P7–P11 of PREDICTIONS-2.md.
Usage: python3 analyse2.py <sbs2021.json> <sc2021.json>  (fetch.sh downloads both).
Writes data/results-2.json and data/figure2.js (the page's data for figures 4 and 5)."""
import json, re, sys, random, math, hashlib, collections

raw = open(sys.argv[1], 'rb').read()
raw_sc = open(sys.argv[2], 'rb').read()
EU27 = ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU',
        'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE']
LEVEL_IND = ['EMP_NR', 'SAL_NR', 'SAL_FTE_NR', 'AV_MEUR', 'VAL_OUT_MEUR', 'WAGE_MEUR', 'HW_NR',
             'EXPN_SAL_BEN_MEUR', 'SS_COST_MEUR', 'GOS_MEUR', 'GRSINV_TNCA_MEUR', 'GRSINV_MAC_MEUR',
             'PUR_MEUR', 'PUR_RS_MEUR', 'PUR_AGN_MEUR', 'PUR_NRG_MEUR', 'STK_CHG_GD_FIN_MEUR',
             'GM_GD_RS_MEUR', 'NETTUR_MEUR']
TOTAL = 'B-S_X_O_S94'
BINS = [(1, 2), (3, 4), (5, 9), (10, 19), (20, 49), (50, 99), (100, 999), (1000, 10 ** 9)]


class Cube:
    def __init__(self, raw):
        d = json.loads(raw)
        self.ids, size = d['id'], d['size']
        self.idx = {k: d['dimension'][k]['category']['index'] for k in self.ids}
        self.labels = {k: d['dimension'][k]['category']['label'] for k in self.ids}
        self.strides = [1] * len(self.ids)
        for i in range(len(self.ids) - 2, -1, -1):
            self.strides[i] = self.strides[i + 1] * size[i + 1]
        self.val, self.st = d['value'], d.get('status', {})

    def get(self, **kw):
        if any(kw[k] not in self.idx[k] for k in kw):
            return 'S', None
        p = str(sum(self.idx[k][kw[k]] * s for k, s in zip(self.ids, self.strides)))
        if 'C' in self.st.get(p, ''):
            return 'W', None
        if p in self.val:
            return 'P', self.val[p]
        return 'S', None


A = Cube(raw)
SC = Cube(raw_sc)


def level(code):
    if not re.fullmatch('[A-S][0-9]*', code):
        return None
    return {2: 'division', 3: 'group', 4: 'class'}.get(len(code) - 1)


def cell(g, n, i):
    return A.get(freq='A', nace_r2=n, indic_sbs=i, geo=g, time='2021')


naces = [c for c in A.idx['nace_r2'] if level(c)]
classes = [n for n in naces if level(n) == 'class']
groups = [n for n in naces if level(n) == 'group']
rnd = random.Random(40)


def bin_of(e):
    for k, (lo, hi) in enumerate(BINS):
        if lo <= e <= hi:
            return k


def rows(codes):
    """(country, code, ENT_NR, withheld, published) for cells whose ENT_NR is published."""
    out = []
    for g in EU27:
        for n in codes:
            s, e = cell(g, n, 'ENT_NR')
            if s != 'P' or e < 1:
                continue
            st = [cell(g, n, i)[0] for i in LEVEL_IND]
            out.append((g, n, e, st.count('W'), st.count('P')))
    return out


R = rows(classes)
# the pooled curve: per bin, withheld / (withheld + published), over all 27
pool = collections.defaultdict(lambda: [0, 0])
for g, n, e, w, p in R:
    pool[bin_of(e)][0] += w; pool[bin_of(e)][1] += p
curve = {k: pool[k][0] / sum(pool[k]) for k in pool}


def ratio(rs):
    O = sum(w for *_, w, p in rs)
    E = sum(curve[bin_of(e)] * (w + p) for _, _, e, w, p in rs)
    return O / E if E else float('nan'), O, E


def boot(rs, B=2000):
    out = []
    for _ in range(B):
        s = [rs[rnd.randrange(len(rs))] for _ in rs]
        out.append(ratio(s)[0])
    out.sort()
    return out[int(0.025 * B)], out[int(0.975 * B) - 1]


size_ = {g: cell(g, TOTAL, 'ENT_NR')[1] for g in EU27}
countries = []
for g in EU27:
    rs = [r for r in R if r[0] == g]
    q, O, E = ratio(rs)
    lo, hi = boot(rs)
    above = [r for r in rs if r[2] >= 20]
    qa, Oa, Ea = ratio(above)
    countries.append({'geo': g, 'name': A.labels['geo'][g], 'enterprises': size_[g], 'ratio': q,
                      'lo': lo, 'hi': hi, 'observed': O, 'expected': E, 'classes': len(rs),
                      'ratio_above20': qa, 'observed_above20': Oa, 'expected_above20': Ea,
                      'raw_rate': O / sum(w + p for *_, w, p in rs)})
by = {c['geo']: c for c in countries}
res = {'source': {'sbs_ovw_act_sha256': hashlib.sha256(raw).hexdigest(),
                  'sbs_sc_ovw': {'label': json.loads(raw_sc)['label'],
                                 'sha256': hashlib.sha256(raw_sc).hexdigest(), 'bytes': len(raw_sc)}},
       'curve': [{'bin': list(BINS[k]), 'rate': curve[k], 'withheld': pool[k][0],
                  'published': pool[k][1]} for k in sorted(curve)],
       'countries': countries}
res['P7'] = {'IE': by['IE']['ratio'], 'ci': [by['IE']['lo'], by['IE']['hi']], 'held': by['IE']['ratio'] >= 2}
res['P8'] = {'CY': by['CY']['ratio'], 'ci': [by['CY']['lo'], by['CY']['hi']], 'held': by['CY']['ratio'] <= 1.2}


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
    return num / math.sqrt(sum((x - ma) ** 2 for x in ra) * sum((y - mb) ** 2 for y in rb))


xs = [c['enterprises'] for c in countries]; ys = [c['ratio'] for c in countries]
rho = spearman(xs, ys)
bs = []
for _ in range(2000):
    s = [rnd.randrange(27) for _ in range(27)]
    if len(set(s)) > 2:
        bs.append(spearman([xs[i] for i in s], [ys[i] for i in s]))
bs.sort()
res['P9'] = {'rho': rho, 'ci': [bs[int(0.025 * len(bs))], bs[int(0.975 * len(bs)) - 1]],
             'held': -0.3 < rho < 0.3}


def wilson(k, n, z=1.96):
    p = k / n; den = 1 + z * z / n
    c0 = (p + z * z / (2 * n)) / den; h = z * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / den
    return [c0 - h, c0 + h]


def band(g, n):
    s, v = SC.get(freq='A', indic_sbs='ENT_NR', nace_r2=n, size_emp='GE250', geo=g, time='2021')
    if s == 'W':
        return 'withheld'
    if s == 'S':
        return 'absent'
    return '0' if v == 0 else '1-2' if v <= 2 else '3+'


G = [r for r in rows(groups) if r[2] >= 20]
bands = collections.defaultdict(lambda: [0, 0, 0])   # withheld, published, cells
gcells = []
for g, n, e, w, p in G:
    b = band(g, n)
    bands[b][0] += w; bands[b][1] += p; bands[b][2] += 1
    gcells.append({'geo': g, 'nace': n, 'ent': e, 'band': b, 'W': w, 'P': p})
res['bands'] = {b: {'withheld': v[0], 'published': v[1], 'cells': v[2], 'rate': v[0] / (v[0] + v[1]),
                    'wilson': wilson(v[0], v[0] + v[1])} for b, v in bands.items()}
r12, r0 = res['bands']['1-2']['rate'], res['bands']['0']['rate']
res['P10'] = {'rate_1_2': r12, 'rate_0': r0, 'ratio': r12 / r0, 'held': r12 >= 3 * r0}
# per band, also within Ireland and within the other 26
for scope, keep in [('IE', lambda g: g == 'IE'), ('other26', lambda g: g != 'IE')]:
    t = collections.defaultdict(lambda: [0, 0, 0])
    for c in gcells:
        if keep(c['geo']):
            t[c['band']][0] += c['W']; t[c['band']][1] += c['P']; t[c['band']][2] += 1
    res['bands_' + scope] = {b: {'withheld': v[0], 'published': v[1], 'cells': v[2],
                                 'rate': v[0] / (v[0] + v[1]) if v[0] + v[1] else None}
                             for b, v in t.items()}
ie_w = [c for c in gcells if c['geo'] == 'IE' and c['W'] > 0]
known = [c for c in ie_w if c['band'] not in ('withheld', 'absent')]
res['P11'] = {'ireland_withheld_groups_above20': len(ie_w), 'band_known': len(known),
              'in_1_2': sum(c['band'] == '1-2' for c in known),
              'band_counts': dict(collections.Counter(c['band'] for c in ie_w)),
              'held': bool(known) and sum(c['band'] == '1-2' for c in known) >= len(known) / 2}
res['ireland_groups'] = sorted([dict(c, label=A.labels['nace_r2'][c['nace']]) for c in gcells
                                if c['geo'] == 'IE'], key=lambda c: -c['W'])

# ---- context, computed after P7–P11 were scored (not predicted): two practices of withholding.
# Per state, class level: withheld figures beside a published count, against figures withheld together
# with the enterprise count of their class. The standardized ratio above can see only the first kind.
regimes = []
for g in EU27:
    t = collections.Counter()
    for n in classes:
        es = cell(g, n, 'ENT_NR')[0]
        for i in LEVEL_IND:
            s = cell(g, n, i)[0]
            if s in 'WP':
                t[s + es] += 1
    W = t['WP'] + t['WW'] + t['WS']
    regimes.append({'geo': g, 'name': A.labels['geo'][g], 'enterprises': size_[g],
                    'withheld_beside_count': t['WP'], 'withheld_with_count': t['WW'] + t['WS'],
                    'published': t['PP'] + t['PW'] + t['PS'], 'rate': W / (W + t['PP'] + t['PW'] + t['PS']),
                    'share_with_count': (t['WW'] + t['WS']) / W if W else None})
res['regimes'] = regimes
# where a class's count is withheld but its group's count is published, the group total minus the
# published sibling counts bounds the withheld classes' firms: their mean count per withheld class.
hidden = {}
for g in EU27:
    t = collections.Counter(); means = []
    for gr in groups:
        ks = [(c, cell(g, c, 'ENT_NR')) for c in classes if c.startswith(gr)]
        wk = [c for c, (s, v) in ks if s == 'W']
        if not wk:
            continue
        t['withheld_counts'] += len(wk)
        gs, gv = cell(g, gr, 'ENT_NR')
        if gs != 'P':
            t['in_withheld_group'] += len(wk); continue
        t['in_published_group'] += len(wk)
        t['alone_in_group'] += len(wk) == 1   # recoverable by subtraction; counted, never printed
        means += [(gv - sum(v for _, (s, v) in ks if s == 'P')) / len(wk)] * len(wk)
    means.sort()
    if t:
        hidden[g] = dict(t, median_mean_firms=means[len(means) // 2] if means else None,
                         share_mean_ge20=sum(m >= 20 for m in means) / len(means) if means else None)
res['hidden_counts'] = hidden
# the count tables agree: group ENT_NR in sbs_ovw_act against TOTAL in sbs_sc_ovw
agree = collections.Counter()
for g in EU27:
    for n in groups:
        a = cell(g, n, 'ENT_NR'); b = SC.get(freq='A', indic_sbs='ENT_NR', nace_r2=n, size_emp='TOTAL', geo=g, time='2021')
        agree['same_state' if a[0] == b[0] else 'different_state'] += 1
        agree['value_mismatch'] += a[0] == b[0] == 'P' and a[1] != b[1]
res['tables_agree'] = dict(agree)

json.dump(res, open('data/results-2.json', 'w'), indent=1)
open('data/figure2.js', 'w').write('window.STUDY40 = ' + json.dumps(res) + ';\n')
for k in ['P7', 'P8', 'P9', 'P10', 'P11']:
    print(k, json.dumps(res[k]))
print('hidden', json.dumps(res['hidden_counts']))
print('agree', res['tables_agree'])
for r in sorted(regimes, key=lambda r: -(r['share_with_count'] or 0)):
    print(r['geo'], round(r['rate'], 3), r['withheld_beside_count'], r['withheld_with_count'])
for b in ['bands', 'bands_IE', 'bands_other26']:
    print(b, json.dumps(res[b]))
print('curve', [round(c['rate'], 3) for c in res['curve']])
for c in sorted(countries, key=lambda c: -c['ratio']):
    print(c['geo'], c['enterprises'], 'raw', round(c['raw_rate'], 3), 'ratio', round(c['ratio'], 2),
          round(c['lo'], 2), round(c['hi'], 2), 'above20', round(c['ratio_above20'], 2))
