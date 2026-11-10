"""Study 58: where a quiet begins. Does study 56 (and study 53 under it) start a quiet on the day the
confirmed count rose, or on the day after; and how much would the other reading move the figures this
practice has published? (The Atelier's question, bulletin of 2026-11-06, The Edge, third state.)

Usage: python3 -I analyse58.py <kivu ebola-epidemic-health-zone-figures.csv> <current 2026 drc_ebola_cases_consolidated.csv>
Predictions: PREDICTIONS58.md (committed first). Writes results58.json and data58.js beside this script.

This is a second implementation, written from calendar dates, not from study 53's day indices. A quiet
is a zone's run of days after a rise of its cumulative confirmed count (check 51's rule for a rise; the
same filters as study 53, restated here). Its day k is a calendar date:
  reading A (study 53's code, as read): day 1 = the day after the rise, day k = rise + k
  reading B (the other):                day 1 = the rise day,          day k = rise + k - 1
At day d a quiet is *counted* if no later rise falls on or before day d's date and day d's date + 42 is
inside the record; it *broke* if the next rise falls on or before day d's date + 42. Reading A must
reproduce study 53's observations exactly (P26) before reading B is read.
"""
import collections, csv, datetime as dt, hashlib, io, json, os, random, statistics, sys, tempfile, contextlib

HERE = os.path.dirname(os.path.abspath(__file__))
A53 = os.path.join(HERE, "..", "..", "cycle-012", "the-quiet-curve")
KIVU_SHA = "76c7e9997be585cde16e091a82fef70903965cbf4651931b1a25587587ed86cb"
CUR_SHA = "15e33668084c38597e186a3b828af4775773127acb9aad852656b5aee3e63dd8"   # study 56's fetch
CUT = "2026-10-29"
H, DMAX, B, SEED = 42, 120, 2000, 56
kivu_path, cur_path = sys.argv[1:3]
assert hashlib.sha256(open(kivu_path, "rb").read()).hexdigest() == KIVU_SHA
assert hashlib.sha256(open(cur_path, "rb").read()).hexdigest() == CUR_SHA
D = dt.date.fromisoformat
one = dt.timedelta(1)


# ---------- the raw series, restated ----------
def series_kivu():
    rows = list(csv.DictReader(open(kivu_path, encoding="utf-8-sig")))[1:]
    rows = [r for r in rows if r["province"] in ("North Kivu", "Ituri", "South Kivu")]
    ren = {"Kayina": "Kayna", "Rwampara (Bunia)": "Rwampara"}
    s = collections.defaultdict(dict)
    for r in rows:
        if r["health_zone"] == "N/A":
            continue
        v = r["confirmed_cases"].strip()
        if v.isdigit():
            s[ren.get(r["health_zone"], r["health_zone"])][D(r["report_date"])] = int(v)
    dates = [D(r["report_date"]) for r in rows]
    return s, min(dates), max(dates)


def series_2026():
    rows = [r for r in csv.DictReader(open(cur_path, encoding="utf-8-sig")) if r["reference_date"] <= CUT]
    s = collections.defaultdict(dict)
    for r in rows:
        if r["location_level"] == "3" and r["location_name"] != "NA" and r["measure"] == "cases" \
                and r["case_classification"] == "confirmed":
            s[r["location_name"]][D(r["reference_date"])] = int(r["value"])
    dates = [D(r["reference_date"]) for r in rows]
    return s, min(dates), max(dates)


def rise_dates(vals):
    """dates on which the cumulative count exceeds every earlier value (a first value of 0 is not a rise)"""
    m, out = -1, []
    for t in sorted(vals):
        x = vals[t]
        if x > m:
            if m >= 0 or x > 0:
                out.append(t)
            m = x
    return out


def quiets(series):
    out = []
    for z, vals in series.items():
        r = rise_dates(vals)
        for a, b in zip(r, r[1:] + [None]):
            out.append({"z": z, "rise": a, "next": b})
    return out


def observe(qs, last, reading):
    """(z, rise, d, broke) for every counted observation, d = 1..DMAX"""
    off = 0 if reading == "A" else 1
    obs = []
    for q in qs:
        for d in range(1, DMAX + 1):
            t = q["rise"] + dt.timedelta(d - off)          # day d's date
            if q["next"] is not None and q["next"] <= t:
                break                                       # broke on or before day d: not reached
            if t + dt.timedelta(H) > last:
                break                                       # window passes the record's end: left out
            obs.append((q["z"], q["rise"], d, q["next"] is not None and q["next"] <= t + dt.timedelta(H)))
    return obs


REC = {}
for label, (s, first, last) in (("Kivu 2018-2020", series_kivu()), ("Congo 2026", series_2026())):
    qs = quiets(s)
    REC[label] = {"first": first, "last": last, "quiets": qs, "A": observe(qs, last, "A"), "B": observe(qs, last, "B")}

# ---------- P26: reading A against study 53's own observations ----------
tmp = tempfile.mkdtemp()
cut_path = os.path.join(tmp, "cut.csv")
rows = list(csv.DictReader(open(cur_path, encoding="utf-8-sig")))
with open(cut_path, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader()
    for r in rows:
        if r["reference_date"] <= CUT:
            w.writerow(r)
src = open(os.path.join(A53, "analyse53.py")).read()
line = 'assert hashlib.sha256(open(hdx26_path, "rb").read()).hexdigest() == HDX26_SHA'
assert src.count(line) == 1
src = src.replace(line, "pass  # study 56's reproduction check stands in")
ns = {"__file__": os.path.join(tmp, "analyse53.py"), "__name__": "a53"}
argv, sys.argv = sys.argv, ["analyse53.py", kivu_path, cut_path]
with contextlib.redirect_stdout(io.StringIO()):
    exec(compile(src, "analyse53.py", "exec"), ns)
sys.argv = argv
ref = json.load(open(os.path.join(A53, "results53.json")))
mine = json.load(open(os.path.join(tmp, "results53.json")))
assert all(mine[k] == ref[k] for k in ref if k not in ("session", "date")), "study 53 not reproduced"
p26 = {}
for label, o in (("Kivu 2018-2020", ns["kv"]), ("Congo 2026", ns["bd"])):
    theirs = sorted((o["quiets"][qi]["z"], D(o["cal"][o["quiets"][qi]["a"]]), d, y) for qi, d, y, nb in o["obs"][42])
    ours = sorted(REC[label]["A"])
    nq = (len(o["quiets"]), len(REC[label]["quiets"]))
    p26[label] = {"observations": [len(theirs), len(ours)], "quiets": list(nq), "identical": theirs == ours and nq[0] == nq[1]}


# ---------- what reading B moves ----------
def at(obs, d):
    return [(z, a, y) for z, a, dd, y in obs if dd == d]


def per_d(obs):
    out = []
    for d in range(1, DMAX + 1):
        p = at(obs, d)
        out.append({"d": d, "n": len(p), "k": sum(y for *_, y in p)})
    return out


def first_below(c, thr, nmin=10):     # study 53's rule, on k/n
    for x in c:
        if x["n"] >= nmin and x["k"] / x["n"] <= thr:
            if all(y["k"] / y["n"] <= thr for y in c if y["d"] >= x["d"] and y["n"] >= nmin):
                return x["d"]
    return None


def first_edge(o, reading):
    """first d >= 21 at which some quiet has reached d but is left out by the record's end (study 56's figure)"""
    off = 0 if reading == "A" else 1
    for d in range(21, DMAX + 1):
        for q in o["quiets"]:
            t = q["rise"] + dt.timedelta(d - off)
            if (q["next"] is None or q["next"] > t) and t + dt.timedelta(H) > o["last"] and t <= o["last"]:
                return d
    return None


def s56(o, reading):
    """study 56's figures under one reading: populations at 42 and 60, the edge band, the composition gap"""
    obs = o[reading]
    off = 0 if reading == "A" else 1
    cut60 = o["last"] - dt.timedelta(60 - off + H)        # latest rise admissible at d = 60
    p42, p60 = at(obs, 42), at(obs, 60)
    band = [x for x in p42 if x[1] > cut60]
    matched = [x for x in p42 if x[1] <= cut60]
    sh = lambda p: sum(y for *_, y in p) / len(p) if p else None
    gap = sh(p42) - sh(matched)
    rng = random.Random(SEED)
    zones = sorted({z for z, *_ in p42})
    byz = collections.defaultdict(list)
    for z, a, y in p42:
        byz[z].append((a <= cut60, y))
    gaps = []
    for _ in range(B):
        draw = [rng.choice(zones) for _ in zones]
        al = [y for z in draw for m, y in byz[z]]; mt = [y for z in draw for m, y in byz[z] if m]
        if al and mt:
            gaps.append(sum(al) / len(al) - sum(mt) / len(mt))
    gaps.sort()
    med = lambda p: (o["first"] + dt.timedelta(statistics.median((a - o["first"]).days for _, a, _ in p))).isoformat() if p else None
    c = per_d(obs)
    return {"p42": [sum(y for *_, y in p42), len(p42)], "p60": [sum(y for *_, y in p60), len(p60)],
            "med42": med(p42), "med60": med(p60), "band": [sum(y for *_, y in band), len(band)],
            "gap": gap, "gapCI": [gaps[int(0.025 * len(gaps))], gaps[int(0.975 * len(gaps)) - 1]],
            "firstEdge": first_edge(o, reading),
            "below10": first_below(c, 0.10), "below5": first_below(c, 0.05), "perD": c}


S = {lab: {r: s56(o, r) for r in "AB"} for lab, o in REC.items()}


def verdicts(r):
    k, c = S["Kivu 2018-2020"][r], S["Congo 2026"][r]
    return {"P15": k["med60"] < k["med42"] and c["med60"] < c["med42"],
            "P16": c["band"][1] / c["p42"][1] >= 0.20 and k["band"][1] / k["p42"][1] <= 0.10,
            "P17": k["gapCI"][0] <= 0 <= k["gapCI"][1],
            "P18": c["gap"] < 0}


V = {r: verdicts(r) for r in "AB"}
# reading A must equal study 56's committed figures
r56 = json.load(open(os.path.join(HERE, "results56.json")))
for p in V["A"]:
    assert V["A"][p] == r56["predictions"][p]["held"], p
for lab in S:
    rr = r56["records"][lab]
    assert S[lab]["A"]["p42"] == [rr["p42"]["k"], rr["p42"]["n"]] and S[lab]["A"]["p60"] == [rr["p60"]["k"], rr["p60"]["n"]]
    assert S[lab]["A"]["band"] == [rr["band"]["k"], rr["band"]["n"]] and abs(S[lab]["A"]["gap"] - rr["gap"]) < 1e-12
assert S["Kivu 2018-2020"]["A"]["firstEdge"] == 80
assert S["Kivu 2018-2020"]["A"]["below10"] == 97 and S["Kivu 2018-2020"]["A"]["below5"] == 114
# the derivation: B at d equals A at d - 1, for d >= 2
derived = all(S[l]["B"]["perD"][d - 1] == dict(S[l]["A"]["perD"][d - 2], d=d) for l in S for d in range(2, DMAX + 1))

kA, kB, cA, cB = S["Kivu 2018-2020"]["A"], S["Kivu 2018-2020"]["B"], S["Congo 2026"]["A"], S["Congo 2026"]["B"]
pred = {
    "P23": {"text": "at day 42 the counted population and the broken count move by at most 2 in each record",
            "value": {"Kivu": [kA["p42"], kB["p42"]], "2026": [cA["p42"], cB["p42"]]},
            "held": all(abs(x["A"]["p42"][i] - x["B"]["p42"][i]) <= 2 for x in S.values() for i in (0, 1))},
    "P24": {"text": "no verdict of study 56 changes under the other reading",
            "value": {"A": V["A"], "B": V["B"]}, "held": V["A"] == V["B"]},
    "P25": {"text": "2026, the record's end leaves out 4 of the day-42 population at day 60 under both readings",
            "value": [cA["band"][1], cB["band"][1]], "held": cA["band"][1] == 4 and cB["band"][1] == 4},
    "P26": {"text": "the second implementation reproduces study 53's observations exactly under reading A",
            "value": p26, "held": all(v["identical"] for v in p26.values())},
}
strip = lambda x: {k: v for k, v in x.items() if k != "perD"}
out = {"study": 58, "session": 256, "date": "2026-11-06", "predictions": pred, "derivationHolds": derived,
       "readings": {"A": "day 1 = the day after the rise (study 53's code)", "B": "day 1 = the rise day"},
       "records": {lab: {r: strip(S[lab][r]) for r in "AB"} for lab in S},
       "sources": {"kivu_sha256": KIVU_SHA, "hdx2026_current_sha256": CUR_SHA, "hdx2026_cut": CUT},
       "params": {"horizon": H, "dmax": DMAX, "bootstrap": B, "seed": SEED}}
json.dump(out, open(os.path.join(HERE, "results58.json"), "w"), indent=1, default=str)
page = {lab: {r: {"perD": S[lab][r]["perD"], **{k: v for k, v in strip(S[lab][r]).items()}} for r in "AB"} for lab in S}
with open(os.path.join(HERE, "data58.js"), "w") as f:
    f.write("// written by analyse58.py; do not edit\nwindow.DATA58 = " + json.dumps(page, separators=(",", ":"), default=str) +
            ";\nwindow.PRED58 = " + json.dumps(pred, separators=(",", ":"), default=str) + ";\n")
print("derivation B(d) = A(d-1):", derived)
for p, v in pred.items():
    print(p, "held" if v["held"] else "FAILED", json.dumps(v["value"], default=str))
for lab in S:
    for r in "AB":
        print(lab, r, json.dumps(strip(S[lab][r]), default=str))
