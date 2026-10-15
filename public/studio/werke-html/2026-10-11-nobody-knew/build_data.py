"""Join the two records. Sky: the Field's 20,753 passages (study 8) with each object's
designation and first observation. Archive: the 34 checked nuclear close calls of LONG AFTER.
Writes data.json. Run: python3 -I build_data.py (after fetch.py)."""
import csv, collections, datetime as dt, json, re, statistics as st

LETTERS = "ABCDEFGHJKLMNOPQRSTUVWXY"  # half-months; I is not used

def desig_start(full_name):
    """Start of the half-month in which the object was designated, from a provisional
    designation like '2021 AN' or '(2010 BB)'. None for old or survey designations."""
    m = re.search(r"\((\d{4}) ([A-Z])[A-Z]\d*\)", full_name) or re.fullmatch(r"\s*(\d{4}) ([A-Z])[A-Z]\d*\s*", full_name)
    if not m or m.group(2) not in LETTERS: return None
    i = LETTERS.index(m.group(2))
    return dt.date(int(m.group(1)), i // 2 + 1, 1 if i % 2 == 0 else 16)

def yfrac(d):
    return round(d.year + (d.timetuple().tm_yday - 1) / 365.25, 4)

neo = json.load(open("raw/neo_obs.json"))
obj = {}
for pdes, full, first, last, nobs in neo["data"]:
    try: fo = dt.date.fromisoformat(first) if first else None
    except ValueError: fo = None  # a few first observations are given only as a year ('2008-??-??')
    ds = desig_start(full)
    # the date the record could first hold the object: its designation half-month, or its first
    # observation if that came later (an object first seen on the 20th); for precoveries (first
    # observation found later in old images) the designation, not the old image, is the learning
    if ds and fo: learned, how = max(ds, fo), ("desig" if fo < ds else "first_obs")
    elif fo: learned, how = fo, "first_obs_only"
    else: learned, how = ds, "desig_only"
    obj[pdes] = {"full": full.strip(), "learned": learned, "how": how, "first_obs": fo}

rows = list(csv.DictReader(open("raw/passages.tsv"), delimiter="\t"))
sky, burst = [], collections.defaultdict(list)
how_n = collections.Counter()
for r in rows:
    o = obj[r["des"]]
    p = dt.date.fromisoformat(r["date_tdb"][:10])
    lag = (o["learned"] - p).days
    how_n[o["how"]] += 1
    late = lag > 0
    sky.append([r["des"], yfrac(p), yfrac(o["learned"]), round(float(r["b_ld"]), 3), float(r["H"]) if r["H"] else None, lag, round(float(r["r_ld"]), 4)])
    if late: burst[(r["des"], o["learned"])].append(r["date_tdb"][:10])

late = [s for s in sky if s[5] > 0]
lags = [s[5] for s in late]
Y = 365.25
precovery = sum(1 for r in rows if obj[r["des"]]["first_obs"] and obj[r["des"]]["first_obs"] < obj[r["des"]]["learned"]
                and (obj[r["des"]]["learned"] - dt.date.fromisoformat(r["date_tdb"][:10])).days > 0
                and dt.date.fromisoformat(r["date_tdb"][:10]) >= obj[r["des"]]["first_obs"])
bursts = sorted(([k[0], obj[k[0]]["full"], k[1].isoformat(), sorted(v)] for k, v in burst.items()), key=lambda b: -len(b[3]))
multi = collections.Counter(r["des"] for r in rows)
cd3 = [r for r in rows if r["des"] == "2020 CD3"]
# the rows study 8 set aside because they have no v-infinity: objects bound to Earth while they passed
cad = json.load(open("raw/cad_1990_2025.json")); F = cad["fields"]
LD_AU = 384400.0 / 149597870.7
bound = []
for d in cad["data"]:
    d = dict(zip(F, d))
    if d["v_inf"] is None:
        bound.append({"des": d["des"], "cd": d["cd"], "r_ld": round(float(d["dist"]) / LD_AU, 4), "v_rel": round(float(d["v_rel"]), 2), "H": float(d["h"])})
r_all = sorted(float(r["r_ld"]) for r in rows)
for x in bound: x["rank_if_kept"] = 1 + sum(1 for v in r_all if v < x["r_ld"])

# the archive: LONG AFTER's checked close calls (same repository)
la = json.load(open("../2026-10-11-long-after/data.json"))
arch = []
for e in la["events"]:
    if not e.get("ok"): continue
    arch.append({"id": e["event"], "label": e["label"], "when": e["when"], "y_hap": e["y_hap"], "y_nm": e["y_nm"],
                 "lag_days": e["lag_days"], "lag_text": e["lag_text"], "src": e["nm"]["source"], "url": e["nm"]["url"],
                 "quote": e["nm"]["quote"], "date_nm": e["nm"]["date"]})
book = collections.defaultdict(list)
for a in arch:
    key = "Sagan, The Limits of Safety (1993)" if "Limits of Safety" in a["src"] or "Sagan" in a["src"] else a["src"]
    book[key].append(a["id"])
abursts = sorted(([k, v] for k, v in book.items()), key=lambda b: -len(b[1]))
alags = [a["lag_days"] for a in arch]

def q(xs):
    xs = sorted(xs); n = len(xs)
    return [xs[n // 4], st.median(xs), xs[(3 * n) // 4]]

summary = {
    "fetched": json.load(open("raw-manifest.json"))["files"]["raw/neo_obs.json"]["fetched_utc"][:10],
    "sky_rows": len(sky), "sky_objects": len(multi), "sky_late": len(late),
    "sky_late_share": round(len(late) / len(sky), 3),
    "sky_lag_median_days": st.median(lags), "sky_lag_quartiles_days": q(lags),
    "sky_late_gt_1y": sum(l > Y for l in lags), "sky_late_gt_10y": sum(l > 10 * Y for l in lags),
    "sky_late_gt_arch_median": None,  # filled below
    "sky_bursts": len(bursts), "sky_burst_max": len(bursts[0][3]),
    "sky_bursts_ge5": sum(1 for b in bursts if len(b[3]) >= 5),
    "sky_learned_how": dict(how_n), "sky_precovery_passages": precovery,
    "arch_rows": len(arch), "arch_lag_median_days": st.median(alags), "arch_lag_quartiles_days": q(alags),
    "arch_bursts": len(abursts), "arch_burst_max": len(abursts[0][1]), "arch_burst_max_src": abursts[0][0],
    "multi_objects_ge5": sum(1 for v in multi.values() if v >= 5),
    "multi_rows_in_ge5": sum(v for v in multi.values() if v >= 5),
    "cad_rows": cad["count"] if isinstance(cad["count"], int) else int(cad["count"]),
    "bound_rows": len(bound), "bound_objects": sorted(set(x["des"] for x in bound)),
    "bound_nearest": min(bound, key=lambda x: x["r_ld"]) if bound else None,
    "bound_within_1ld": sum(1 for x in bound if x["r_ld"] < 1),
    "cd3_rows": len(cd3), "cd3_dates": [r["date_tdb"] for r in cd3], "cd3_min_b_ld": min((float(r["b_ld"]) for r in cd3), default=None),
}
summary["sky_late_gt_arch_median"] = sum(l > summary["arch_lag_median_days"] for l in lags)
json.dump({"summary": summary,
           "sky_fields": ["des", "y_pass", "y_learned", "b_ld", "H", "lag_days", "r_ld"], "sky": sky,
           "sky_bursts_top": bursts[:40], "arch": arch, "arch_bursts": abursts, "bound": bound,
           "multi_top": multi.most_common(12)},
          open("data.json", "w"), ensure_ascii=False, separators=(",", ":"))
print(json.dumps(summary, indent=1, ensure_ascii=False))
for b in bursts[:8]: print(len(b[3]), b[1], b[2], b[3][:3])
for b in abursts[:5]: print(len(b[1]), b[0][:90])
