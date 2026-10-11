"""Cycle 007, session 2 — two nearnesses of one near-miss record.

  python3 -I analyse.py <rawdir>

<rawdir> holds the files fetched on 2026-10-11 (not committed; sha256 below, URLs in RAW):
  cad.json   JPL close-approach rows, Earth, dist <= 0.0026 au, 2015-01-01 .. 2025-12-31
  neo.json   JPL small-body database: pdes, full_name, moid, H, epoch for every NEO
  imp_<des>.json  close-approach rows <= 0.05 au, 1900..2100, for each of the Studio's 13 impactors
Writes data.json (for the page) and results.json (the counts) beside this script.
"""
import hashlib, json, math, os, sys

RAW = {
    "cad.json": "https://ssd-api.jpl.nasa.gov/cad.api?dist-max=0.0026&date-min=2015-01-01&date-max=2025-12-31&fullname=true",
    "neo.json": "https://ssd-api.jpl.nasa.gov/sbdb_query.api?fields=pdes,full_name,moid,H,epoch&sb-group=neo",
    "imp_<des>.json": "https://ssd-api.jpl.nasa.gov/cad.api?des=<des>&dist-max=0.05&date-min=1900-01-01&date-max=2100-01-01",
}
IMPACTORS = ["2008 TC3", "2014 AA", "2018 LA", "2019 MO", "2022 EB5", "2022 WJ1", "2023 CX1",
             "2024 BX1", "2024 RW1", "2024 UQ", "2024 XA1", "2026 JN4", "2026 RW1"]
AU, LD, MU, R = 149597870.7, 384400.0, 398600.4418, 6371.0
VESC2 = 2 * MU / R
LD_AU = 0.00257  # the rule of PREDICTIONS.md: one lunar distance

raw = sys.argv[1]
here = os.path.dirname(os.path.abspath(__file__))
sha = {f: hashlib.sha256(open(os.path.join(raw, f), "rb").read()).hexdigest()
       for f in sorted(os.listdir(raw)) if f.endswith(".json")}
cad = json.load(open(os.path.join(raw, "cad.json")))
neo = json.load(open(os.path.join(raw, "neo.json")))
moid = {r[0]: (float(r[2]) if r[2] else None, r[3]) for r in neo["data"]}


def geom(r_km, vinf, m_au):
    """b: unperturbed miss in the b-plane; bcap: Earth's capture radius; u: bend scale 2mu/v^2
    (an ESTIMATE of how far the passage itself can move the orbit's MOID; not a bound)."""
    b = r_km * math.sqrt(1 + 2 * MU / (r_km * vinf ** 2))
    bcap = R * math.sqrt(1 + VESC2 / vinf ** 2)
    u = 2 * MU / vinf ** 2
    m = m_au * AU
    reg = "timing" if m < bcap else "geometry"           # registered rule (PREDICTIONS.md)
    if m > b: three = "undecided"                         # post hoc: the kept orbit cannot have made this pass unbent
    elif m + u < bcap: three = "timing"
    elif m - u > bcap: three = "geometry"
    else: three = "undecided"                             # post hoc: the passage may have moved it
    return b, bcap, u, m, reg, three


F = cad["fields"]; ix = {k: F.index(k) for k in F}
rows, missing, vinf_null = [], [], []
for r in cad["data"]:
    d = float(r[ix["dist"]])
    if d > LD_AU: continue
    des = r[ix["des"]]
    if des not in moid or moid[des][0] is None:
        missing.append(des); continue
    rk = d * AU
    if r[ix["v_inf"]] is None:  # no v_inf: the object was bound to Earth (a temporary moon)
        vinf_null.append((des, r[ix["cd"]], round(rk))); continue
    v = float(r[ix["v_inf"]])
    b, bcap, u, m, reg, three = geom(rk, v, moid[des][0])
    rows.append({"des": des, "cd": r[ix["cd"]], "r_ld": round(d * AU / LD, 4), "r_km": round(rk),
                 "rmin_km": round(float(r[ix["dist_min"]]) * AU), "rmax_km": round(float(r[ix["dist_max"]]) * AU),
                 "vinf": round(v, 5), "h": r[ix["h"]], "b_km": round(b), "bcap_km": round(bcap),
                 "u_km": round(u), "moid_km": round(m), "reg": reg, "cls": three})

rows.sort(key=lambda x: x["r_km"])
n = len(rows)
band = lambda x: "inner" if x["r_ld"] <= 0.25 else ("middle" if x["r_ld"] <= 0.5 else "outer")
B = {k: [x for x in rows if band(x) == k] for k in ("inner", "middle", "outer")}
share = {k: (sum(x["reg"] == "timing" for x in v), len(v)) for k, v in B.items()}
timing = [x for x in rows if x["reg"] == "timing"]
ten = rows[:10]

imp = []
for des in IMPACTORS:
    f = os.path.join(raw, "imp_" + des.replace(" ", "_") + ".json")
    d = json.load(open(f)); m_au = moid[des][0] if des in moid else None
    for r in d.get("data", []):
        dist = float(r[4]); v = float(r[8])
        b, bcap, u, m, reg, three = geom(dist * AU, v, m_au)
        imp.append({"des": des, "cd": r[3], "r_ld": round(dist * AU / LD, 3), "r_km": round(dist * AU),
                    "rmin_km": round(float(r[5]) * AU), "rmax_km": round(float(r[6]) * AU),
                    "vinf": round(v, 5), "b_km": round(b), "bcap_km": round(bcap), "u_km": round(u),
                    "moid_km": round(m), "reg": reg, "cls": three})
impmoid = {des: (round(moid[des][0] * AU) if des in moid else None) for des in IMPACTORS}

P = {
    "P1": {"claim": "fewer than one passage in ten is timing-only", "value": f"{len(timing)} of {n}",
           "held": len(timing) * 10 < n},
    "P2": {"claim": "of the 10 nearest by distance, at least 6 are timing-only",
           "value": f"{sum(x['reg']=='timing' for x in ten)} of 10", "held": sum(x['reg'] == 'timing' for x in ten) >= 6},
    "P3": {"claim": "inner-band timing-only share at least 3x the outer band's",
           "value": f"inner {share['inner'][0]}/{share['inner'][1]}, outer {share['outer'][0]}/{share['outer'][1]}",
           "held": share["inner"][0] / share["inner"][1] >= 3 * share["outer"][0] / share["outer"][1]},
    "P4": {"claim": "at least 10 timing-only passages in the outer band", "value": str(share["outer"][0]),
           "held": share["outer"][0] >= 10},
    "P5": {"claim": "every earlier row of the impactors is timing-only and lies beyond 1 LD",
           "value": f"{sum(x['reg']=='timing' for x in imp)} of {len(imp)} timing-only; {sum(x['r_ld']>1 for x in imp)} of {len(imp)} beyond 1 LD",
           "held": all(x["reg"] == "timing" and x["r_ld"] > 1 for x in imp)},
}
three = {k: sum(x["cls"] == k for x in rows) for k in ("timing", "undecided", "geometry")}
three_ten = {k: sum(x["cls"] == k for x in ten) for k in ("timing", "undecided", "geometry")}
sens = {}
for f in (0.5, 1, 2):
    c = {"timing": 0, "undecided": 0, "geometry": 0}
    for x in rows:
        uu = x["u_km"] * f
        if x["moid_km"] > x["b_km"]: c["undecided"] += 1; continue
        c["timing" if x["moid_km"] + uu < x["bcap_km"] else "geometry" if x["moid_km"] - uu > x["bcap_km"] else "undecided"] += 1
    sens[str(f)] = c
over = sum(x["moid_km"] > x["b_km"] for x in rows)
res = {"n_rows_le_1ld": n, "rows_without_moid": missing, "bound_rows_excluded": vinf_null, "predictions": P, "bands": share,
       "three_classes": three, "three_classes_nearest10": three_ten, "bend_sensitivity": sens,
       "moid_now_exceeds_b": over, "nearest10": [(x["des"], x["r_km"], x["moid_km"], x["bcap_km"], x["cls"]) for x in ten],
       "timing_farthest": [(x["des"], x["cd"], x["r_ld"], x["moid_km"], x["bcap_km"]) for x in sorted(
           [x for x in rows if x["cls"] == "timing"], key=lambda x: -x["r_km"])[:5]],
       "impactor_moid_km": impmoid, "impactor_rows": len(imp), "sha256": sha, "sources": RAW}
json.dump(res, open(os.path.join(here, "results.json"), "w"), indent=1)
json.dump({"rows": rows, "bound": vinf_null, "impactor_rows": imp, "impactor_moid_km": impmoid, "results": res},
          open(os.path.join(here, "data.json"), "w"), separators=(",", ":"))
print(json.dumps({k: res[k] for k in res if k not in ("sha256", "sources")}, indent=1))
