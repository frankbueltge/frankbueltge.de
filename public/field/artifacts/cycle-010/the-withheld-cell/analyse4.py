"""Check 42 — the single firm (PREDICTIONS-4.md). Re-reads study 39's source and splits its 1–2 firm
bin. Usage: python3 analyse4.py <sbs2021.json>. Writes data/results-4.json."""
import json, re, sys, random, hashlib, collections

SRC = sys.argv[1]
raw = open(SRC, 'rb').read()
d = json.loads(raw)
EU27 = ['BE', 'BG', 'CZ', 'DK', 'DE', 'EE', 'IE', 'EL', 'ES', 'FR', 'HR', 'IT', 'CY', 'LV', 'LT', 'LU',
        'HU', 'MT', 'NL', 'AT', 'PL', 'PT', 'RO', 'SI', 'SK', 'FI', 'SE']
LEVEL_IND = ['EMP_NR', 'SAL_NR', 'SAL_FTE_NR', 'AV_MEUR', 'VAL_OUT_MEUR', 'WAGE_MEUR', 'HW_NR',
             'EXPN_SAL_BEN_MEUR', 'SS_COST_MEUR', 'GOS_MEUR', 'GRSINV_TNCA_MEUR', 'GRSINV_MAC_MEUR',
             'PUR_MEUR', 'PUR_RS_MEUR', 'PUR_AGN_MEUR', 'PUR_NRG_MEUR', 'STK_CHG_GD_FIN_MEUR',
             'GM_GD_RS_MEUR', 'NETTUR_MEUR']
ids, size = d['id'], d['size']
idx = {k: d['dimension'][k]['category']['index'] for k in ids}
lab = d['dimension']['nace_r2']['category']['label']
strides = [1] * len(ids)
for i in range(len(ids) - 2, -1, -1):
    strides[i] = strides[i + 1] * size[i + 1]
val, st = d['value'], d.get('status', {})


def state(geo, nace, ind):
    kw = dict(freq='A', nace_r2=nace, indic_sbs=ind, geo=geo, time='2021')
    p = str(sum(idx[k][kw[k]] * s for k, s in zip(ids, strides)))
    if 'C' in st.get(p, ''):
        return 'W', None
    return ('P', val[p]) if p in val else ('S', None)


classes = [c for c in idx['nace_r2'] if re.fullmatch('[A-S][0-9]{4}', c)]
rows = []   # (geo, class, n_firms, {ind: state})
for g in EU27:
    for c in classes:
        s, v = state(g, c, 'ENT_NR')
        if s == 'P' and v in (1, 2, 3):
            rows.append((g, c, int(v), {i: state(g, c, i)[0] for i in LEVEL_IND}))


def share(rs, inds):
    k = collections.Counter(r[3][i] for r in rs for i in inds)
    return (k['W'] / (k['W'] + k['P']) if k['W'] + k['P'] else None), k['W'], k['P']


def by_n(rs, inds):
    return {n: share([r for r in rs if r[2] == n], inds) for n in (1, 2, 3)}


def boot_diff(inds, B=2000):
    random.seed(42)
    per = collections.defaultdict(list)
    for r in rows:
        per[r[0]].append(r)
    geos, out = list(per), []
    for _ in range(B):
        rs = [r for g in random.choices(geos, k=len(geos)) for r in per[g]]
        a, b = share([r for r in rs if r[2] == 1], inds)[0], share([r for r in rs if r[2] == 2], inds)[0]
        if a is not None and b is not None:
            out.append(a - b)
    out.sort()
    return [out[int(0.025 * len(out))], out[int(0.975 * len(out)) - 1]]


tt, al = ['NETTUR_MEUR'], LEVEL_IND
res = {'source': {'sha256': hashlib.sha256(raw).hexdigest()},
       'turnover': by_n(rows, tt), 'all19': by_n(rows, al),
       'turnover_diff_1_minus_2_boot': boot_diff(tt), 'all19_diff_1_minus_2_boot': boot_diff(al)}
res['P17'] = {'held': res['turnover'][1][0] < res['turnover'][2][0]}
res['P18'] = {'held': res['all19'][1][0] < res['all19'][2][0]}
single_pub = collections.Counter(r[1] for r in rows if r[2] == 1 and r[3]['NETTUR_MEUR'] == 'P')
geo_pub = collections.Counter(r[0] for r in rows if r[2] == 1 and r[3]['NETTUR_MEUR'] == 'P')
res['single_firm_turnover_published'] = {
    'classes': [[c, lab[c], k] for c, k in single_pub.most_common(10)],
    'by_state': dict(geo_pub.most_common()), 'cells': sum(single_pub.values())}
top = single_pub.most_common(1)
res['P19'] = {'top': top, 'held': bool(top) and top[0][0] == 'K6411'}
res['k6411_single_firm'] = sorted([[r[0], r[3]['NETTUR_MEUR']] for r in rows if r[1] == 'K6411' and r[2] == 1])
json.dump(res, open('data/results-4.json', 'w'), indent=1)
print(json.dumps({k: v for k, v in res.items() if k != 'source'}, indent=1))
open('data/figure4.js', 'w').write('window.CHECK42 = ' + json.dumps(res) + ';\n')
