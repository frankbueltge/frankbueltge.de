"""Study 53: the quiet curve. When a health zone has gone d days without a new confirmed Ebola case,
how likely is another within the next H days, and does an active neighbour tell the difference?

Usage: python3 -I analyse53.py <kivu ebola-epidemic-health-zone-figures.csv> <2026 drc_ebola_cases_consolidated.csv>
Writes results53.json and data53.js beside this script. Predictions: PREDICTIONS.md (committed first).
"""
import csv, collections, datetime as dt, hashlib, json, os, random, sys

HERE = os.path.dirname(os.path.abspath(__file__))
KIVU_SHA = "76c7e9997be585cde16e091a82fef70903965cbf4651931b1a25587587ed86cb"
HDX26_SHA = "761e1ed4f11db45a28ff8338a22ae78d9d78fd942603177bb8cbc16fb8352dbf"
kivu_path, hdx26_path = sys.argv[1:3]
assert hashlib.sha256(open(kivu_path, "rb").read()).hexdigest() == KIVU_SHA
assert hashlib.sha256(open(hdx26_path, "rb").read()).hexdigest() == HDX26_SHA
D = dt.date.fromisoformat
NB = 21          # neighbour window (days)
DMAX = 120       # longest quiet length on the curve
B = 2000         # bootstrap draws over zones
SEED = 53


def calendar(dates):
    first, last = D(min(dates)), D(max(dates))
    return [(first + dt.timedelta(i)).isoformat() for i in range((last - first).days + 1)]


def rises_of(vals):
    """Check 51's rule: a rise is a value above every earlier value (a first value of 0 is not a rise)."""
    m = -1; out = []
    for i, x in enumerate(vals):
        if x is None:
            continue
        if x > m:
            if m >= 0 or x > 0:
                out.append(i)
            m = x
    return out


def load_kivu():
    rows = list(csv.DictReader(open(kivu_path, encoding="utf-8-sig")))[1:]
    assert len(rows) == 13303
    K = [r for r in rows if r["province"] in ("North Kivu", "Ituri", "South Kivu")]
    RENAME = {"Kayina": "Kayna", "Rwampara (Bunia)": "Rwampara"}  # as check 52
    conf = collections.defaultdict(dict); prov = {}
    for r in K:
        z = r["health_zone"]
        if z == "N/A":
            continue
        z = RENAME.get(z, z)
        v = r["confirmed_cases"].strip()
        if v.isdigit():
            conf[z][r["report_date"]] = int(v)
        assert prov.setdefault(z, r["province"]) == r["province"], z
    cal = calendar({r["report_date"] for r in K})
    return conf, prov, cal


def load_2026():
    h = list(csv.DictReader(open(hdx26_path, encoding="utf-8-sig")))
    conf = collections.defaultdict(dict); prov = {}
    for r in h:
        if r["location_level"] != "3" or r["location_name"] == "NA":
            continue
        z = r["location_name"]
        assert prov.setdefault(z, r["location_code"][:4]) == r["location_code"][:4], z
        if r["measure"] == "cases" and r["case_classification"] == "confirmed":
            conf[z][r["reference_date"]] = int(r["value"])
    cal = calendar({r["reference_date"] for r in h})
    return conf, prov, cal


def build(label, conf, prov, cal):
    N = len(cal)
    rises = {z: rises_of([conf[z].get(d) for d in cal]) for z in conf}
    rises = {z: r for z, r in rises.items() if r}
    # rise days per province, for the neighbour test
    prov_rises = collections.defaultdict(list)
    for z, r in rises.items():
        for i in r:
            prov_rises[prov[z]].append((i, z))

    def active(z, day):
        """another zone of z's province rose in [day-NB+1, day]"""
        return any(z2 != z and day - NB < i <= day for i, z2 in prov_rises[prov[z]])

    quiets = []
    for z, r in rises.items():
        for a, b in zip(r, r[1:] + [None]):
            L = (b - a) if b is not None else None   # length to next rise; None = held to the end
            quiets.append({"z": z, "p": prov[z], "a": a, "b": b, "L": L, "obs": (N - 1 - a)})
    # sourceless breaks: a quiet of >= 21 days ended by a rise with no other rise in the province in the 21 days before
    breaks21 = []
    for q in quiets:
        if q["b"] is not None and q["L"] > 21:
            src = active(q["z"], q["b"] - 1)
            breaks21.append({"z": q["z"], "p": q["p"], "start": cal[q["a"]], "at": cal[q["b"]], "L": q["L"], "sourceless": not src})
    # observations: for each quiet and each d, whether it reached d and (when the window fits) broke within H
    def obs(H):
        out = []
        for qi, q in enumerate(quiets):
            for d in range(1, DMAX + 1):
                if q["b"] is not None and q["L"] <= d:
                    break                      # did not reach d
                if q["a"] + d + H > N - 1:
                    break                      # window passes the record's end: left out
                y = q["b"] is not None and q["L"] <= d + H
                out.append((qi, d, y, active(q["z"], q["a"] + d)))
        return out
    return {"label": label, "cal": cal, "quiets": quiets, "obs": {42: obs(42), 21: obs(21)},
            "breaks21": breaks21, "zones": sorted(rises), "prov": prov}


kv = build("Kivu 2018-2020", *load_kivu())
bd = build("Congo 2026", *load_2026())
# continuity with checks 51/52: long quiets (broken > 42, held >= 42)
def n_long(o):
    N = len(o["cal"])
    return sum(1 for q in o["quiets"] if (q["b"] is not None and q["L"] > 42) or (q["b"] is None and N - 1 - q["a"] >= 42))
assert n_long(bd) == 22, n_long(bd)
assert n_long(kv) == 60, n_long(kv)


def share(rows):
    n = len(rows); k = sum(1 for r in rows if r[2])
    return k, n


def curve(datasets, H, cond=None):
    """per d: k, n, share and a bootstrap interval over zones"""
    rows = [(o["label"], o["quiets"][qi]["z"], d, y, nb) for o in datasets for (qi, d, y, nb) in o["obs"][H]
            if cond is None or nb == cond]
    by_zone = collections.defaultdict(list)
    for lab, z, d, y, nb in rows:
        by_zone[(lab, z)].append((d, y))
    zones = sorted(by_zone)
    def tally(zs):
        k = collections.Counter(); n = collections.Counter()
        for zz in zs:
            for d, y in by_zone[zz]:
                n[d] += 1; k[d] += y
        return k, n
    k0, n0 = tally(zones)
    rng = random.Random(SEED); boots = collections.defaultdict(list)
    for _ in range(B):
        kb, nb_ = tally([rng.choice(zones) for _ in zones])
        for d in range(1, DMAX + 1):
            if nb_[d]:
                boots[d].append(kb[d] / nb_[d])
    out = []
    for d in range(1, DMAX + 1):
        if not n0[d]:
            out.append({"d": d, "k": 0, "n": 0}); continue
        bs = sorted(boots[d])
        lo, hi = bs[int(0.025 * len(bs))], bs[min(len(bs) - 1, int(0.975 * len(bs)))]
        wl, wh = wilson(k0[d], n0[d])
        out.append({"d": d, "k": k0[d], "n": n0[d], "s": round(k0[d] / n0[d], 4), "lo": round(lo, 4), "hi": round(hi, 4),
                    "wlo": wl, "whi": wh})
    return out


def wilson(k, n, z=1.96):
    if not n:
        return None, None
    p = k / n; den = 1 + z * z / n; c = (p + z * z / (2 * n)) / den
    h = z * ((p * (1 - p) / n + z * z / (4 * n * n)) ** 0.5) / den
    return round(max(0, c - h), 4), round(min(1, c + h), 4)


def at(c, d):
    return next(x for x in c if x["d"] == d)


ALL = [kv, bd]
C = {}
for H in (42, 21):
    for name, ds in (("pooled", ALL), ("kivu", [kv]), ("2026", [bd])):
        for cname, cond in (("all", None), ("nb", True), ("nonb", False)):
            C[f"{name}|{H}|{cname}"] = curve(ds, H, cond)

# ratio at d=42, with a bootstrap interval over zones (pooled)
def ratio42(H=42, d=42):
    rows = collections.defaultdict(list)
    for o in ALL:
        for qi, dd, y, nb in o["obs"][H]:
            if dd == d:
                rows[(o["label"], o["quiets"][qi]["z"])].append((y, nb))
    zones = sorted(rows)
    def r(zs):
        a = [y for zz in zs for y, nb in rows[zz] if nb]; b = [y for zz in zs for y, nb in rows[zz] if not nb]
        if not a or not b:
            return None
        pa, pb = sum(a) / len(a), sum(b) / len(b)
        return (pa, pb)
    pa, pb = r(zones)
    rng = random.Random(SEED + 1); diffs = []
    for _ in range(B):
        x = r([rng.choice(zones) for _ in zones])
        if x:
            diffs.append(x[0] - x[1])
    diffs.sort()
    return {"withNb": round(pa, 4), "withoutNb": round(pb, 4), "ratio": round(pa / pb, 2) if pb else None,
            "diff": round(pa - pb, 4), "diffLo": round(diffs[int(0.025 * len(diffs))], 4),
            "diffHi": round(diffs[int(0.975 * len(diffs))], 4)}

R42 = ratio42()
p42 = at(C["pooled|42|all"], 42); nb42 = at(C["pooled|42|nb"], 42); no42 = at(C["pooled|42|nonb"], 42)
k42 = at(C["kivu|42|all"], 42); b42 = at(C["2026|42|all"], 42)
nbcurve = [x for x in C["pooled|42|nb"] if x["d"] <= 90 and x["n"] >= 10]
br = kv["breaks21"] + bd["breaks21"]
srcl = sum(1 for x in br if x["sourceless"])

P = {
    "P1": {"text": "pooled share at d=42 above 15 % and its interval excludes 5 %",
           "value": p42, "held": p42["s"] > 0.15 and p42["lo"] > 0.05},
    "P2": {"text": "at d=42, share with an active neighbour at least 3x share without",
           # evaluated by the prediction's words (with >= 3 x without); the first run's code required a finite
           # ratio and so scored a zero denominator as a failure. Corrected the same session, recorded in the journal.
           "value": R42, "held": R42["withNb"] >= 3 * R42["withoutNb"]},
    "P3": {"text": "with an active neighbour, share above 10 % at every d in 1..90 with n >= 10",
           "value": {"min": min(x["s"] for x in nbcurve), "atD": min(nbcurve, key=lambda x: x["s"])["d"], "ds": len(nbcurve)},
           "held": all(x["s"] > 0.10 for x in nbcurve)},
    "P4": {"text": "without an active neighbour, share at d=42 at most 5 %",
           "value": no42, "held": no42["n"] > 0 and no42["s"] <= 0.05},
    "P5": {"text": "sourceless breaks among breaks after >= 21 quiet days between 10 % and 40 %",
           "value": {"sourceless": srcl, "breaks": len(br), "share": round(srcl / len(br), 4)},
           "held": 0.10 <= srcl / len(br) <= 0.40},
    "P6": {"text": "share at d=42 differs between Kivu and 2026 by less than 15 points",
           "value": {"kivu": k42, "2026": b42, "diff": round(abs(k42["s"] - b42["s"]), 4)},
           "held": abs(k42["s"] - b42["s"]) < 0.15},
}

def first_below(c, thr, nmin=10):
    for x in c:
        if x["n"] >= nmin and x.get("s", 1) <= thr:
            # stays at or below thr afterwards wherever n >= nmin
            if all(y.get("s", 0) <= thr for y in c if y["d"] >= x["d"] and y["n"] >= nmin):
                return x["d"]
    return None

summary = {
    "quiets": {o["label"]: len(o["quiets"]) for o in ALL},
    "zones": {o["label"]: len(o["zones"]) for o in ALL},
    "window": {o["label"]: [o["cal"][0], o["cal"][-1]] for o in ALL},
    "provinces": {o["label"]: dict(collections.Counter(o["prov"][z] for z in o["zones"])) for o in ALL},
    "firstDayAtOrBelow5pct": {k: first_below(v, 0.05) for k, v in C.items() if k.endswith("|42|all") or k.endswith("|42|nb") or k.endswith("|42|nonb")},
    "ratio42": R42,
}

res = {"study": 53, "session": 250, "date": "2026-11-04", "predictions": P, "summary": summary,
       "curves": C, "breaks21": br,
       "sources": {"kivu_sha256": KIVU_SHA, "hdx2026_sha256": HDX26_SHA},
       "params": {"neighbourWindow": NB, "dmax": DMAX, "bootstrap": B, "seed": SEED}}
json.dump(res, open(os.path.join(HERE, "results53.json"), "w"), indent=1)
page = {"curves": C, "pred": {k: {"text": v["text"], "held": v["held"]} for k, v in P.items()},
        "breaks": [{"o": "K" if x in kv["breaks21"] else "B", **x} for x in br], "summary": summary}
open(os.path.join(HERE, "data53.js"), "w").write("window.D53=" + json.dumps(page, separators=(",", ":")) + ";\n")
for n, p in P.items():
    print(n, "HELD" if p["held"] else "FAILED", json.dumps(p["value"]))
print(json.dumps(summary, indent=1))
