"""Study 24, step 2: are the undeclared local warnings met by a danger the below-threshold record keeps?

Rule, placebo, frame and intervals as fixed in PREREGISTRATION-24.md (pushed in 0153529, before any
storm record was fetched).

Usage: python3 -I analyse_24.py STORM_EVENTS_DIR   (the NCEI details files 2011-2026 and bp16ap26.dbx)
Writes data/results_24.json and data/met_24.tsv.gz (one row per warning in the frame).
"""
import csv, gzip, json, sys, re, random, collections, datetime as dt
from pathlib import Path

HERE = Path(__file__).parent
SE = Path(sys.argv[1])
E = dt.datetime(1970, 1, 1)
FRAME_END = (dt.datetime(2026, 4, 1) - E).total_seconds() / 60
PAD = 24 * 60
PLACEBO = 364 * 1440
cov = json.loads((HERE / "data" / "coverage_24.json").read_text())
TYPE2CLASS = {t: c for c, ts in cov["types"].items() for t in ts}

# zone -> counties (current zones), and state FIPS -> postal code
zone, st_abbr = collections.defaultdict(set), {}
for line in (SE / "bp16ap26.dbx").read_text(encoding="latin-1").splitlines():
    p = line.split("|")
    if len(p) < 7 or not p[6].isdigit():
        continue
    zone[(p[0], p[1].zfill(3))].add(p[6].zfill(5))
    st_abbr[p[6][:2].zfill(2)] = p[0]

def utc_min(ym, day, hhmm, tz):
    m = re.search(r"([-+]?\d+)$", tz or "")
    off = int(m.group(1)) if m else 0
    t = dt.datetime(int(ym[:4]), int(ym[4:]), int(day), int(hhmm.zfill(4)[:2]), int(hhmm.zfill(4)[2:]))
    return (t - dt.timedelta(hours=off) - E).total_seconds() / 60

# events by (county, class) -> list of (begin, end)
ev = collections.defaultdict(list)
stats = collections.Counter()
files = sorted(SE.glob("StormEvents_details-ftp_v1.0_d20*_c*.csv.gz"))
assert [f.name[30:34] for f in files] == [str(y) for y in range(2011, 2027)], files
for f in files:
    for r in csv.DictReader(gzip.open(f, "rt", encoding="latin-1")):
        cl = TYPE2CLASS.get(r["EVENT_TYPE"])
        if not cl:
            continue
        stats["events_in_classes"] += 1
        sf = r["STATE_FIPS"].zfill(2)
        if r["CZ_TYPE"] == "C":
            cs = {sf + r["CZ_FIPS"].zfill(3)}
        elif r["CZ_TYPE"] == "Z":
            cs = zone.get((st_abbr.get(sf, "?"), r["CZ_FIPS"].zfill(3)), set())
        else:
            cs = set()
        if not cs:
            stats["events_unmapped"] += 1
            continue
        if not re.search(r"[-+]?\d+$", r["CZ_TIMEZONE"] or ""):
            stats["events_tz_unparsed"] += 1
        b = utc_min(r["BEGIN_YEARMONTH"], r["BEGIN_DAY"], r["BEGIN_TIME"], r["CZ_TIMEZONE"])
        e = utc_min(r["END_YEARMONTH"], r["END_DAY"], r["END_TIME"], r["CZ_TIMEZONE"])
        for c in cs:
            ev[(c, cl)].append((b, max(b, e)))
for k in ev:
    ev[k].sort()

def met(counties, classes, lo, hi):
    for c in counties:
        for cl in classes:
            for b, e in ev.get((c, cl), ()):
                if b >= hi:
                    break
                if e >= lo:
                    return 1
    return 0

W = list(csv.DictReader(gzip.open(HERE / "data" / "warnings_24.tsv.gz", "rt"), delimiter="\t"))
rows = []
for w in W:
    t, L = int(w["t_min"]), int(w["life_min"] or 0)
    if t >= FRAME_END or w["status"] != "covered":
        continue
    g, cl = w["counties"].split(","), w["classes"].split(",")
    rows.append({
        "i": int(w["i"]), "group": w["group"], "nn": w["nn"], "primary": w["primary"],
        "cluster": g[0] + "|" + str(t // 1440),
        "met": met(g, cl, t - PAD, t + L + PAD),
        "placebo": met(g, cl, t - PAD - PLACEBO, t + L + PAD - PLACEBO),
        "met_strict": met(g, cl, t, t + L),
        "met_72": met(g, cl, t - 3 * PAD, t + L + 3 * PAD),
    })

def boot(sel, f, n=2000, seed=24):
    by = collections.defaultdict(list)
    for r in sel:
        by[r["cluster"]].append(r)
    keys = list(by)
    rnd, out = random.Random(seed), []
    for _ in range(n):
        s = [r for k in (rnd.choice(keys) for _ in keys) for r in by[k]]
        out.append(f(s))
    out.sort()
    return [out[int(0.025 * n)], out[int(0.975 * n) - 1]], len(keys)

rate = lambda k: (lambda s: sum(r[k] for r in s) / len(s))
exc = lambda s: sum(r["met"] - r["placebo"] for r in s) / len(s)

def summary(sel):
    if not sel:
        return None
    ci_m, nk = boot(sel, rate("met"))
    ci_p, _ = boot(sel, rate("placebo"))
    ci_x, _ = boot(sel, exc)
    return {"n": len(sel), "clusters": nk, "met": sum(r["met"] for r in sel), "met_rate": rate("met")(sel),
            "met_ci": ci_m, "placebo": sum(r["placebo"] for r in sel), "placebo_rate": rate("placebo")(sel),
            "placebo_ci": ci_p, "excess": exc(sel), "excess_ci": ci_x,
            "strict_rate": rate("met_strict")(sel), "pad72_rate": rate("met_72")(sel)}

und = [r for r in rows if r["group"] == "undeclared"]
undeclared_in_frame = sum(1 for w in W if w["group"] == "undeclared" and int(w["t_min"]) < FRAME_END)
res = {
    "frame_end": "2026-04-01T00:00Z", "storm_events_files": [f.name for f in files], "stats": dict(stats),
    "undeclared_in_frame": undeclared_in_frame,
    "undeclared_covered": summary(und),
    "by_class": {c: summary([r for r in und if r["primary"] == c]) for c in sorted({r["primary"] for r in und})},
    "declared_contradicted": summary([r for r in rows if r["group"] == "declared" and r["nn"] == "contradicted"]),
    "declared_not_contradicted": summary([r for r in rows if r["group"] == "declared" and r["nn"] != "contradicted"]),
}
u = res["undeclared_covered"]
res["bound_share"] = u["excess"] * u["n"] / undeclared_in_frame
res["bound_share_ci"] = [x * u["n"] / undeclared_in_frame for x in u["excess_ci"]]
fc, fl, sv = (res["by_class"][k]["met_rate"] for k in ("fire", "flood", "severe"))
res["predictions"] = {
    "P1": {"held": u["met_rate"] >= 0.40, "value": u["met_rate"]},
    "P2": {"held": u["placebo_rate"] <= u["met_rate"] / 2 and u["excess"] >= 0.20,
           "value": [u["placebo_rate"], u["excess"]]},
    "P3": {"held": fc < fl and fc < sv and fc < 0.40 and fl > 0.50, "value": [fc, fl, sv]},
    "P4": {"held": res["declared_contradicted"]["met_rate"] >= 0.60, "value": res["declared_contradicted"]["met_rate"]},
    "P5": {"held": res["bound_share"] >= 0.10, "value": res["bound_share"]},
}
(HERE / "data" / "results_24.json").write_text(json.dumps(res, indent=1))
with gzip.open(HERE / "data" / "met_24.tsv.gz", "wt") as f:
    keys = ["i", "group", "nn", "primary", "cluster", "met", "placebo", "met_strict", "met_72"]
    f.write("\t".join(keys) + "\n")
    for r in rows:
        f.write("\t".join(str(r[k]) for k in keys) + "\n")
print(json.dumps({k: res[k] for k in ("stats", "undeclared_in_frame", "bound_share", "bound_share_ci", "predictions")}, indent=1))
for k in ("undeclared_covered", "declared_contradicted", "declared_not_contradicted"):
    print(k, {a: res[k][a] for a in ("n", "met_rate", "placebo_rate", "excess", "excess_ci", "strict_rate", "pad72_rate")})
for c, v in res["by_class"].items():
    print(c, v and {a: v[a] for a in ("n", "met_rate", "placebo_rate", "excess")})
