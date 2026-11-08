"""Study 65 — who holds the compute. Reads data/ (Epoch AI, CC BY 4.0), writes results65.json and data65.js.
Usage: python3 -I analyse65.py
Uncertainty: each row of the chip-owners file gives a median and a 5th and 95th percentile. A row is drawn
as a split lognormal (lower and upper spread fitted separately to the two percentiles). Rows are drawn
independently in the main run; a second run draws every row at the same quantile (fully correlated), which
widens the band. Rows without percentiles are held at their value. 20,000 draws, fixed seed."""
import csv, json, math, random, collections
from pathlib import Path
H = Path(__file__).resolve().parent
TOP5 = ['Google', 'Microsoft', 'Meta', 'Amazon', 'Oracle']
rows = list(csv.DictReader(open(H / 'data/ai_chip_owners_cumulative_by_designer.csv')))
share = list(csv.DictReader(open(H / 'data/hyperscaler_compute_share.csv')))
f = lambda v: float(v) if v not in ('', None) else None
Z = 1.6448536
def draw(r, z):
    m, lo, hi = f(r['Compute estimate in H100e (median)']), f(r['H100e (5th percentile)']), f(r['H100e (95th percentile)'])
    if not lo or not hi or lo <= 0 or hi <= 0 or m <= 0: return m
    s = math.log(m / lo) / Z if z < 0 else math.log(hi / m) / Z
    return m * math.exp(s * z)
by_q = collections.defaultdict(list)
for r in rows: by_q[r['End date']].append(r)
Qs = sorted(by_q)
owners = sorted({r['Owner'] for r in rows})
def shares(rs, zs, smuggled=True):
    tot = collections.Counter()
    for r, z in zip(rs, zs):
        if not smuggled and r['Owner'] == 'China (smuggled)': continue
        tot[r['Owner']] += draw(r, z)
    T = sum(tot.values())
    return {o: tot[o] / T for o in tot}, T
rnd = random.Random(65); N = 20000
def pct(a, p): a = sorted(a); return a[min(len(a) - 1, int(p * len(a)))]
out = []
for q in Qs:
    rs = by_q[q]
    med, T = shares(rs, [0] * len(rs)); med_ns, T_ns = shares(rs, [0] * len(rs), smuggled=False)
    ind, cor, ind_ns = [], [], []
    for _ in range(N):
        zs = [rnd.gauss(0, 1) for _ in rs]
        s, _ = shares(rs, zs); ind.append(sum(s.get(o, 0) for o in TOP5))
        s, _ = shares(rs, zs, smuggled=False); ind_ns.append(sum(s.get(o, 0) for o in TOP5))
        z1 = rnd.gauss(0, 1); s, _ = shares(rs, [z1] * len(rs)); cor.append(sum(s.get(o, 0) for o in TOP5))
    incomplete = any(r['Incomplete'] == 'True' for r in rs)
    out.append({'q': q, 'rows': len(rs), 'incomplete': incomplete, 'total': round(T), 'total_ex_smuggled': round(T_ns),
                'owner_h100e': {o: round(sum(f(r['Compute estimate in H100e (median)']) for r in rs if r['Owner'] == o)) for o in owners if any(r['Owner'] == o for r in rs)},
                'owner_share': {o: round(100 * v, 2) for o, v in sorted(med.items(), key=lambda x: -x[1])},
                'top5': round(100 * sum(med.get(o, 0) for o in TOP5), 2),
                'top5_ex_smuggled': round(100 * sum(med_ns.get(o, 0) for o in TOP5), 2),
                'top5_90_independent': [round(100 * pct(ind, .05), 2), round(100 * pct(ind, .95), 2)],
                'top5_90_correlated': [round(100 * pct(cor, .05), 2), round(100 * pct(cor, .95), 2)],
                'top5_ex_smuggled_90_independent': [round(100 * pct(ind_ns, .05), 2), round(100 * pct(ind_ns, .95), 2)],
                'designers': sorted({r['Chip manufacturer'] + '/' + r['Owner'] for r in rs})})
complete = [o for o in out if not o['incomplete']]
epoch = {(r['End date'], r['Owner']): (float(r['H100-equivalents']), float(r['Share of global AI compute'])) for r in share}
epoch_top5 = [{'q': d, 'share': s} for (d, o), (h, s) in sorted(epoch.items()) if o.startswith('Top 5')]
falls = [(a['q'], b['q'], round(b['share'] - a['share'], 1)) for a, b in zip(epoch_top5, epoch_top5[1:]) if b['share'] < a['share']]
# implied global total behind Epoch's own share column
implied = [{'q': d, 'implied_total': round(h / (s / 100))} for (d, o), (h, s) in sorted(epoch.items()) if o.startswith('Top 5')]
last_full, q126 = complete[-1], out[-1]
missing126 = sorted(set(x for o in complete[-1:] for x in o['designers']) - set(q126['designers']))
sm = by_q[last_full['q']]; smr = [r for r in sm if r['Owner'] == 'China (smuggled)'][0]
clusters = json.loads((H / 'data/gpu_clusters.json').read_text())['rows']
cl = [r for r in clusters if f(r['H100 equivalents'])]
CT = sum(f(r['H100 equivalents']) for r in cl)
def capshare(key, val): return round(100 * sum(f(r['H100 equivalents']) for r in cl if r[key] == val) / CT, 1)
cn = [r for r in cl if r['Country'] == 'China']
res = {
  'quarters': out, 'epoch_top5': epoch_top5, 'epoch_falls': falls, 'epoch_implied_total': implied,
  'q1_2026_rows': q126['rows'], 'q4_2025_rows': last_full['rows'], 'q1_2026_missing_series': missing126,
  'q1_2026_total_change_pct': round(100 * (q126['total'] / last_full['total'] - 1), 1),
  'smuggled_q4_2025': {'median': f(smr['Compute estimate in H100e (median)']), 'p5': f(smr['H100e (5th percentile)']), 'p95': f(smr['H100e (95th percentile)'])},
  'clusters': {'n': len(cl), 'h100e': round(CT), 'private': capshare('Sector', 'Private'), 'public': capshare('Sector', 'Public'),
               'mixed': capshare('Sector', 'Public/Private'), 'us': capshare('Country', 'United States of America'), 'china': capshare('Country', 'China'),
               'no_owner': sum(1 for r in cl if not r['Owner'].strip()), 'china_n': len(cn), 'china_no_owner': sum(1 for r in cn if not r['Owner'].strip()),
               'china_anonymised': sum(1 for r in cn if r['Name'].startswith('Anonymized')), 'likely': sum(1 for r in cl if r['Certainty'] == 'Likely'),
               'no_owner_or_likely': sum(1 for r in cl if not r['Owner'].strip() or r['Certainty'] != 'Confirmed')},
}
res['cluster_marks'] = sorted(({'n': r['Name'], 'o': r['Owner'].strip(), 'c': r['Country'], 'h': round(f(r['H100 equivalents']))} for r in cl),
                              key=lambda m: (0 if m['o'] else 1, -m['h']))
c = res['clusters']; e = {o['q']: o['share'] for o in epoch_top5}
res['predictions'] = [
  {'id': 'P54', 'text': 'Top-5 share rises in every quarter after the first.', 'held': not falls, 'result': '; '.join(f"falls {d} pts from {x} to {y}" for x, y, d in falls) or 'no quarter falls'},
  {'id': 'P55', 'text': 'Top-5 share at 2024 Q1 below 65 %.', 'held': e['2024-03-31'] < 65, 'result': f"{e['2024-03-31']} %"},
  {'id': 'P56', 'text': 'No uncertainty column in the share table; no interval printed beside 75.8 %.', 'held': True,
   'result': 'columns: ' + ', '.join(share[0].keys()) + '; the page prints none (read 11-08)'},
  {'id': 'P57', 'text': 'Clusters: private >= 70 % of capacity, state <= 25 %.', 'held': c['private'] >= 70 and c['public'] <= 25, 'result': f"private {c['private']} %, public {c['public']} %, mixed {c['mixed']} %"},
  {'id': 'P58', 'text': 'Clusters: US >= 60 %, China < 20 %, and the record says in words that Chinese capacity is undercounted.', 'held': False,
   'result': f"US {c['us']} %, China {c['china']} % (both parts held); the words failed: Epoch puts its coverage of Chinese compute at about 20 % and of major US companies at about 15 %"},
  {'id': 'P59', 'text': '>= 25 % of clusters lack an owner or are not confirmed.', 'held': c['no_owner_or_likely'] / c['n'] >= .25, 'result': f"{c['no_owner_or_likely']} of {c['n']}"},
]
(H / 'results65.json').write_text(json.dumps(res, indent=1))
(H / 'data65.js').write_text('window.D65=' + json.dumps(res) + ';\n')
for o in out: print(o['q'], o['rows'], o['incomplete'], o['top5'], o['top5_90_independent'], o['top5_90_correlated'], o['top5_ex_smuggled'])
print({k: v for k, v in res.items() if k not in ('quarters', 'epoch_top5', 'epoch_implied_total', 'predictions')})
for p in res['predictions']: print(p['id'], p['held'], p['result'])
print([i for i in implied])
