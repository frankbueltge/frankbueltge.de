"""Check 52: does a report-day clock do what a fixed calendar wait does, in an earlier Ebola record?

Usage: python3 -I analyse52.py <kivu ebola-epidemic-health-zone-figures.csv> <2026 drc_ebola_cases_consolidated.csv>
Writes results52.json and data52.js beside this script. Predictions: PREDICTIONS.md (committed first).
The 2026 comparison reads the Field's own data51.js (check 51) beside this repository's artifacts.
"""
import csv, collections, datetime as dt, hashlib, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
KIVU_SHA = "76c7e9997be585cde16e091a82fef70903965cbf4651931b1a25587587ed86cb"
HDX26_SHA = "761e1ed4f11db45a28ff8338a22ae78d9d78fd942603177bb8cbc16fb8352dbf"
kivu, hdx26 = sys.argv[1:3]
assert hashlib.sha256(open(kivu, "rb").read()).hexdigest() == KIVU_SHA
D = dt.date.fromisoformat
T0 = 42

# ---------------- Kivu 2018-2020 ----------------
rows = list(csv.DictReader(open(kivu, encoding="utf-8-sig")))
assert rows[0]["publication_date"].startswith("#")  # HXL tag row
rows = rows[1:]
assert len(rows) == 13303  # PREDICTIONS.md wrote 13,302 from a line count; corrected below it
K = [r for r in rows if r["province"] in ("North Kivu", "Ituri", "South Kivu")]
RENAME = {"Kayina": "Kayna", "Rwampara (Bunia)": "Rwampara"}  # disjoint date ranges, checked below
named = collections.defaultdict(set); conf = collections.defaultdict(dict)
for r in K:
    z = r["health_zone"]
    if z == "N/A":
        continue
    z = RENAME.get(z, z)
    d = r["report_date"]
    assert d not in named[z] or z in RENAME.values(), (z, d)
    assert d not in conf[z], (z, d)
    named[z].add(d)
    v = r["confirmed_cases"].strip()
    if v.isdigit():
        conf[z][d] = int(v)
reports = sorted({r["report_date"] for r in K})
first, last = D(reports[0]), D(reports[-1])
cal = [(first + dt.timedelta(i)).isoformat() for i in range((last - first).days + 1)]
N = len(cal); repset = set(reports)
coverage = len(reports) / N


def runs_of(values, cal):
    """The Atelier's rule (build.py / said.py): rises over a running maximum; quiets between rises."""
    m = -1; rises = []
    for i, x in enumerate(values):
        if x is None:
            continue
        if x > m:
            if m >= 0 or x > 0:
                rises.append(i)
            m = x
    out = []
    for a, b in zip(rises, rises[1:]):
        out.append((a, b, True))
    if rises:
        out.append((rises[-1], len(cal) - 1, False))
    return out


kq = []  # every quiet: strip of day classes after the rise, up to (not incl.) the next rise or through the end
for z in sorted(conf):
    vals = [conf[z].get(d) for d in cal]
    for a, b, broke in runs_of(vals, cal):
        days = cal[a + 1:b] if broke else cal[a + 1:]
        strip = "".join(("w" if d in named[z] else "a") if d in repset else "n" for d in days)
        kq.append({"zone": z, "from": cal[a], "broke": broke, "k": strip})

# ---------------- 2026 Bundibugyo (the Field's own check 51 file) ----------------
f51 = os.path.join(HERE, "..", "2026-11-02-the-carried-zero", "data51.js")
raw = open(f51, encoding="utf-8").read()
d51 = json.loads(raw[raw.index("{"): raw.rindex("}") + 1])
bq = [{"zone": r["zone"], "from": r["from"], "broke": r["broke"], "k": "".join(r["strip"])} for r in d51["runs"]]
assert len(bq) == 22
cov26 = 1 - len(d51["noReport"]) / len(d51["cal"])


def reach(k, mode, T=T0):
    c = 0
    for x in k:
        if mode == "cal" or (mode == "rep" and x != "n") or (mode == "said" and x == "w"):
            c += 1
        if c >= T:
            return True
    return False


def compare(qs, label, cov):
    long_ = [q for q in qs if len(q["k"]) >= T0]
    for q in long_:
        q["L"] = len(q["k"]); q["R"] = sum(1 for x in q["k"] if x != "n"); q["W"] = q["k"].count("w")
        q["rep"] = q["R"] >= T0
        assert q["rep"] == reach(q["k"], "rep")
    curve = []
    for T in range(T0, 91):
        mis = [q for q in long_ if (q["L"] >= T) != q["rep"]]
        curve.append({"T": T, "mismatch": len(mis),
                      "calOnly": sum(1 for q in mis if q["L"] >= T), "repOnly": sum(1 for q in mis if q["rep"])})
    best = min(c["mismatch"] for c in curve)
    bestT = [c["T"] for c in curve if c["mismatch"] == best]
    exact = [c["T"] for c in curve if c["mismatch"] == 0]
    rep_days = sum(q["R"] for q in long_); w_days = sum(q["W"] for q in long_)
    return {"label": label, "coverage": round(cov, 4), "pivot": round(T0 / cov, 1),
            "quiets": len(qs), "long": len(long_),
            "longBroke": sum(1 for q in long_ if q["broke"]), "longHeld": sum(1 for q in long_ if not q["broke"]),
            "repReach": sum(1 for q in long_ if q["rep"]),
            "bestMismatch": best, "bestT": bestT, "exactT": exact,
            "namedShare": round(w_days / rep_days, 4) if rep_days else None, "repDaysInLong": rep_days,
            "curve": curve}, long_


rk, klong = compare(kq, "Kivu 2018-2020", coverage)
rb, blong = compare(bq, "Bundibugyo 2026", cov26)

# the Atelier's 2026 statement, reproduced from check 51's file
assert rb["long"] == 22 and rb["repReach"] == 18 and 49 in rb["exactT"], rb["exactT"]

# ---------------- predictions ----------------
k = rk
P = {
    "P1": {"text": "Kivu report coverage 75-95 %", "value": k["coverage"], "held": 0.75 <= k["coverage"] <= 0.95},
    "P2": {"text": "no single T in 43-70 matches the report clock exactly",
           "value": [t for t in k["exactT"] if 43 <= t <= 70], "held": not any(43 <= t <= 70 for t in k["exactT"])},
    "P3": {"text": "best T within 3 days of 42/coverage",
           "value": {"bestT": k["bestT"], "pivot": k["pivot"]},
           "held": any(abs(t - k["pivot"]) <= 3 for t in k["bestT"])},
    "P4": {"text": "mismatch at best T below 10 % of long quiets",
           "value": round(k["bestMismatch"] / k["long"], 4), "held": k["bestMismatch"] / k["long"] < 0.10},
    "P5": {"text": "zone named on at least 95 % of report days within long quiets",
           "value": k["namedShare"], "held": k["namedShare"] >= 0.95},
}

# per-quiet records for the page
def slim(q):
    return {"z": q["zone"], "f": q["from"], "b": q["broke"], "L": q["L"], "R": q["R"], "k": q["k"]}

# gap structure of Kivu reports (post hoc, descriptive)
gaps = collections.Counter()
run = 0
for d in cal:
    if d in repset:
        if run:
            gaps[run] += 1
        run = 0
    else:
        run += 1
wd = collections.Counter(D(d).weekday() for d in cal if d not in repset)
gaps26 = collections.Counter(); run = 0; nr26 = set(d51["noReport"])
for d in d51["cal"]:
    if d in nr26:
        run += 1
    else:
        if run:
            gaps26[run] += 1
        run = 0
hole = [(a, b) for a, b in zip(reports, reports[1:]) if (D(b) - D(a)).days - 1 > 30]
assert hole == [("2020-03-07", "2020-06-10")], hole
# post hoc: the two quiets the clocks disagree on at T = 42..44 both cross the hole
mis42 = sorted((q["zone"], q["from"], q["L"], q["R"]) for q in klong if (q["L"] >= 42) != q["rep"])
assert mis42 == [("Beni", "2020-02-17", 113, 18), ("Mabalako", "2020-01-29", 140, 41)], mis42
beni = {d: conf["Beni"].get(d) for d in ("2020-02-17", "2020-03-07", "2020-06-10")}
assert beni == {"2020-02-17": 721, "2020-03-07": 721, "2020-06-10": 728}, beni

# ---------------- the Studio's lookup: 7-8 Oct 2026 ----------------
assert hashlib.sha256(open(hdx26, "rb").read()).hexdigest() == HDX26_SHA
h = list(csv.DictReader(open(hdx26, encoding="utf-8-sig")))
oct_rows = {d: sum(1 for r in h if r["reference_date"] == d) for d in ("2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09")}
nat = {r["reference_date"]: int(r["value"]) for r in h if r["location_level"] == "0" and r["measure"] == "cases"
       and r["case_classification"] == "confirmed" and r["reference_date"] in ("2026-10-05", "2026-10-06", "2026-10-09")}
assert oct_rows["2026-10-07"] == 0 and oct_rows["2026-10-08"] == 0 and nat == {"2026-10-05": 8665, "2026-10-06": 8728, "2026-10-09": 8914}
studio = {"rowsPerDate": oct_rows, "nationalConfirmed": nat,
          "inNoReport51": [d for d in ("2026-10-07", "2026-10-08") if d in d51["noReport"]],
          "sitrepOf51": {d: d51["sitrepOf"].get(d) for d in ("2026-10-06", "2026-10-07", "2026-10-08", "2026-10-09")}}

res = {"check": 52, "session": 249, "date": "2026-11-03",
       "kivu": {k_: v for k_, v in rk.items()}, "bundibugyo": rb,
       "kivuWindow": [cal[0], cal[-1]], "kivuDays": N, "kivuReports": len(reports),
       "kivuGaps": dict(sorted(gaps.items())), "kivuMissingByWeekday": [wd[i] for i in range(7)],
       "bdbvGaps": dict(sorted(gaps26.items())), "kivuHole": hole[0], "mismatchAt42": mis42, "beniCumConfirmed": beni,
       "predictions": P, "studio": studio,
       "sources": {"kivu_sha256": KIVU_SHA, "hdx2026_sha256": HDX26_SHA}}
json.dump(res, open(os.path.join(HERE, "results52.json"), "w"), indent=1)
page = {"kivu": {"cal": [cal[0], cal[-1]], "cov": rk["coverage"], "pivot": rk["pivot"], "curve": rk["curve"],
                 "q": [slim(q) for q in klong], "hole": hole[0]},
        "bdbv": {"cal": [d51["cal"][0], d51["cal"][-1]], "cov": rb["coverage"], "pivot": rb["pivot"], "curve": rb["curve"],
                 "q": [slim(q) for q in blong]}}
open(os.path.join(HERE, "data52.js"), "w").write("window.D52=" + json.dumps(page, separators=(",", ":")) + ";\n")
for n, p in P.items():
    print(n, "HELD" if p["held"] else "FAILED", p["value"])
for r_ in (rk, rb):
    print(r_["label"], {x: r_[x] for x in r_ if x != "curve"})
print("gaps", dict(sorted(gaps.items())), "missing by weekday Mon..Sun", [wd[i] for i in range(7)])
print("studio", studio)
print("gaps26", dict(sorted(gaps26.items())), "mis42", mis42, beni)
