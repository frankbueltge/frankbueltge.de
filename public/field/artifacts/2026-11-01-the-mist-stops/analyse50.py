"""Check 50: does the zone-level Ebola record stop writing suspicion? Usage: python3 -I analyse50.py <drc_ebola_cases_consolidated.csv>"""
import csv, sys, json, hashlib, datetime as dt
from collections import defaultdict
path = sys.argv[1]
sha = hashlib.sha256(open(path, 'rb').read()).hexdigest()
rows = list(csv.DictReader(open(path, encoding='utf-8')))
D = lambda s: dt.date.fromisoformat(s[:10])
# series key -> {date: value}; later duplicates (manual overrides) win
ser = defaultdict(dict); dupes = 0
for r in rows:
    k = (r['location_level'], r['location_name'], r['measure'], r['case_classification'])
    d = r['reference_date'][:10]
    if d in ser[k]: dupes += 1
    if d not in ser[k] or r['data_quality_flag'] == 'manual':
        ser[k][d] = float(r['value'])
zones = sorted({k[1] for k in ser if k[0] == '3'})
last = max(d for s in ser.values() for d in s)
out = {"sha256": sha, "rows": len(rows), "duplicate_keys": dupes, "zones": len(zones), "last_date": last}
# F1
zs = sorted({d for k, s in ser.items() if k[0] == '3' and k[3] == 'suspected' and k[2] in ('cases', 'deaths') for d in s})
out["F1"] = {"zone_suspected_dates": len(zs), "first": zs[0] if zs else None, "last": zs[-1] if zs else None,
             "holds": len(zs) <= 15 and (not zs or zs[-1] <= '2026-05-30')}
# F2
cs = sorted({d for k, s in ser.items() if k[0] == '0' and k[3] == 'suspected' for d in s})
out["F2"] = {"country_suspected_dates": len(cs), "first": cs[0], "last": cs[-1],
             "holds": cs[-1] > '2026-05-30' and cs[-1] <= '2026-08-04'}
# F3
conf_days = {(k[1], d) for k, s in ser.items() if k[0] == '3' and k[2] == 'cases' and k[3] == 'confirmed' for d in s}
sd_days = {(k[1], d) for k, s in ser.items() if k[0] == '3' and k[2] == 'deaths' and k[3] == 'suspected' for d in s}
both = conf_days & sd_days
out["F3"] = {"zone_days_confirmed": len(conf_days), "with_suspected_deaths": len(both),
             "share": round(len(both) / len(conf_days), 4), "holds": len(both) / len(conf_days) < 0.15}
# F4
def zsum(measure, d):
    v = [s[d] for k, s in ser.items() if k[0] == '3' and k[2] == measure and k[3] == 'confirmed' and d in s]
    return sum(v), len(v)
f4 = {}
for m in ('deaths', 'cases'):
    nat = ser[('0', next(k[1] for k in ser if k[0] == '0'), m, 'confirmed')]
    zdates = {d for k, s in ser.items() if k[0] == '3' and k[2] == m and k[3] == 'confirmed' for d in s}
    d = max(set(nat) & zdates)
    zv, n = zsum(m, d)
    f4[m] = {"date": d, "country": nat[d], "zone_sum": zv, "zones_reporting": n, "rel_diff": round((zv - nat[d]) / nat[d], 4)}
out["F4"] = f4 | {"holds": abs(f4['deaths']['rel_diff']) > 0.01 and abs(f4['cases']['rel_diff']) < 0.01}
# F5
f5 = {}
for z in ('Jiba', 'Karisimbi'):
    ks = [k for k in ser if k[0] == '3' and k[1].lower() == z.lower()]
    f5[z] = {"series": [list(k[2:]) for k in ks],
             "confirmed_values": sum(len(ser[k]) for k in ks if k[3] == 'confirmed'),
             "last_row": max((d for k in ks for d in ser[k]), default=None)}
out["F5"] = f5 | {"holds": all(v['series'] and v['confirmed_values'] == 0 and v['last_row'] <= '2026-05-30' for v in f5.values())}
# downward revisions of cumulative series
rev = 0
for k, s in ser.items():
    ds = sorted(s)
    rev += sum(1 for a, b in zip(ds, ds[1:]) if s[b] < s[a])
out["downward_revisions"] = rev
# exploratory: quiet days per zone; plus the page's data
L = D(last); page = []
for z in zones:
    c = ser.get(('3', z, 'cases', 'confirmed'), {})
    cd = ser.get(('3', z, 'deaths', 'confirmed'), {})
    sc = ser.get(('3', z, 'cases', 'suspected'), {})
    sdd = ser.get(('3', z, 'deaths', 'suspected'), {})
    ct = ser.get(('3', z, 'contacts', ''), {})
    ds = sorted(c); rise = None; prev = None
    for d in ds:
        if (prev is None and c[d] > 0) or (prev is not None and c[d] > prev): rise = d
        prev = c[d] if prev is None else max(prev, c[d])
    page.append({"z": z, "conf": [[d, c[d]] for d in ds], "cdeath": [[d, cd[d]] for d in sorted(cd)],
                 "susp": [[d, sc[d]] for d in sorted(sc)], "sdeath": [[d, sdd[d]] for d in sorted(sdd)],
                 "contacts": [[d, ct[d]] for d in sorted(ct)],
                 "last_rise": rise, "quiet_days": (L - D(rise)).days if rise else None,
                 "last_conf_row": ds[-1] if ds else None})
qd = [p['quiet_days'] for p in page if p['quiet_days'] is not None]
out["explore_quiet"] = {"zones_with_confirmed": len(qd), "quiet_ge_42": sum(q >= 42 for q in qd),
                        "quiet_ge_21": sum(q >= 21 for q in qd), "quiet_0": sum(q == 0 for q in qd),
                        "zones_whose_confirmed_series_ends_before_last": sum(1 for p in page if p['last_conf_row'] and p['last_conf_row'] < last)}
# post hoc: country series ends, and the zone picture on the last day of zone suspicion
nat = {k[2:]: ser[k] for k in ser if k[0] == '0'}
out["posthoc_country"] = {f"{m}|{c}": {"first": min(v), "last": max(v), "days": len(v), "last_value": v[max(v)]} for (m, c), v in nat.items()}
d0 = '2026-05-30'
zsum30 = lambda m, c: sum(s[d0] for k, s in ser.items() if k[0] == '3' and k[2] == m and k[3] == c and d0 in s)
out["posthoc_zones_2026_05_30"] = {"confirmed_cases": zsum30('cases', 'confirmed'), "suspected_cases": zsum30('cases', 'suspected'),
    "confirmed_deaths": zsum30('deaths', 'confirmed'), "suspected_deaths": zsum30('deaths', 'suspected'), "contacts": zsum30('contacts', '')}
nat_name = next(k[1] for k in ser if k[0] == '0')
national = {f"{m}|{c}": sorted(ser[k].items()) for k in ser if k[0] == '0' for (m, c) in [(k[2], k[3])]}
json.dump(out, open('results50.json', 'w'), indent=1)
open('data50.js', 'w').write('window.D50=' + json.dumps({"last": last, "zones": page, "national": national, "sha": sha}, separators=(',', ':')) + ';')
print(json.dumps(out, indent=1))
