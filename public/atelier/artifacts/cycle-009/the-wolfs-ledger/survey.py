"""Coda IV of The Wolf's Ledger (2026-10-22, fifth session, after the presentation): the number and the sentence.

Material: the Field's study 37 (s223, 2026-10-22), results37.json and the record it fits, tornadoes31.tsv, at
field-research main 300be07, sha256 asserted below. Its bulletin offered this practice a case: om 315890 (OK,
2011-05-24, EF2, 32 injured where the model expected 0.6) moves study 35's ratio most, to 1.34. It also stated a limit:
the high-pull rows were not checked against the Weather Service's event narratives. This script checks them.

What it does, in three steps:
1. For each of study 37's 15 tornadoes of greatest pull, it finds the county segments in NOAA NCEI's Storm Events
   Database (the details files, public domain, sha256 asserted) that make it up: same state, begin date within a day,
   widest segment and strongest rating equal to the row's, and lengths and injuries that sum to the Field's row. Exactly one match is asserted for each.
2. It reads each segment's event narrative by a declared rule (below) and asks how many of the recorded injured the
   narrative itself accounts for with a number.
3. For the one tornado whose narrative is silent and whose forecast office kept a second account (NWS Norman's event
   page for 2011-05-24, fetched 2026-10-22, sha256 asserted), it sets the two texts side by side, and refits the
   Field's model with that tornado's injured count set to each value from 0 to 32. It first reproduces study 37's full
   fit and its leave-out of om 315890 exactly, so the refits are the Field's model with one cell changed and nothing
   else. They are my runs of the Field's model, not the Field's results.

The rule (step 2), declared before reading the 14 other narratives: a narrative "states the count" of a segment when a
sentence of it that contains "injur" or "hurt" also contains that segment's recorded injured count, in digits or as an
English number word. "Mentions injured" when such a sentence exists without the count. "Silent" when none exists.
The rule is literal: "two men and a woman" is not a count of three under it.

Usage: python3 -I survey.py RESULTS37_JSON TORNADOES31_TSV STORMEVENTS_DIR OUN_EVENT_PAGE
       (needs numpy, pandas, statsmodels; writes survey.json and survey.js here)
"""
import csv, glob, gzip, hashlib, html, json, math, re, sys, warnings, datetime as dt
from pathlib import Path
import numpy as np, pandas as pd, statsmodels.api as sm

warnings.simplefilter("ignore")
HERE = Path(__file__).parent
SHA = {"results37": "87ef907de2901904beb47d367459b341295ac3d5ec6e38a993ce03bdf8334fad",
       "tornadoes31": "a9f2e00c5eff7792bc9e7b780b0379b7516866a1f7e10bbeaeb9e4be4a08c3fc",
       "oun_page": "952b74e0dd7a1a7b4c43fbd8e53ce44d312a5100d7a8df0b988b2db6a2af4196"}
p37, ptsv, pse, poun = (Path(a) for a in sys.argv[1:5])
for k, p in (("results37", p37), ("tornadoes31", ptsv), ("oun_page", poun)):
    assert hashlib.sha256(p.read_bytes()).hexdigest() == SHA[k], k
R37 = json.loads(p37.read_text())
C = json.loads((HERE / "aside.json").read_text())
V, CROSS = C["villages"], C["crossing"]
assert R37["full"]["irr"] == C["sets"][0]["irr"] == 1.214

# ---- 1. match the Field's rows to Storm Events segments
ST = {"OK": "OKLAHOMA", "LA": "LOUISIANA", "TX": "TEXAS", "AR": "ARKANSAS", "NC": "NORTH CAROLINA", "KY": "KENTUCKY",
      "IA": "IOWA", "NE": "NEBRASKA", "MO": "MISSOURI", "MS": "MISSISSIPPI", "KS": "KANSAS"}
TOP = R37["top_delta"]
assert len(TOP) == 15
want = {(ST[t["st"]], dt.date.fromisoformat(t["date"]) + dt.timedelta(k)) for t in TOP for k in (-1, 0, 1)}
seg, files = {}, []
for f in sorted(glob.glob(str(pse / "StormEvents_details-ftp_v1.0_d*.csv.gz"))):
    used = False
    for r in csv.DictReader(gzip.open(f, "rt", encoding="latin-1")):
        if r["EVENT_TYPE"] != "Tornado": continue
        d = dt.date(int(r["BEGIN_YEARMONTH"][:4]), int(r["BEGIN_YEARMONTH"][4:]), int(r["BEGIN_DAY"]))
        if (r["STATE"], d) in want:
            seg.setdefault((r["STATE"], d), []).append(r); used = True
    if used:
        files.append({"file": Path(f).name, "sha256": hashlib.sha256(Path(f).read_bytes()).hexdigest()})

inj = lambda r: int(r["INJURIES_DIRECT"]) + int(r["INJURIES_INDIRECT"])
def match(t):
    d0 = dt.date.fromisoformat(t["date"])
    cand = [r for k in (-1, 0, 1) for r in seg.get((ST[t["st"]], d0 + dt.timedelta(k)), [])
            if int(float(r["TOR_WIDTH"])) <= t["wid_yd"] and r["TOR_F_SCALE"][-1:] in "012345"[:t["ef"] + 1]]
    hits = []
    for n in (1, 2):
        for i in range(len(cand)):
            for j in range(i, len(cand)) if n == 2 else [i]:
                g = [cand[i]] if n == 1 else ([cand[i], cand[j]] if j != i else None)
                if not g: continue
                if (abs(sum(float(r["TOR_LENGTH"]) for r in g) - t["len_mi"]) < 0.02 and sum(map(inj, g)) == t["inj"]
                        and max(int(float(r["TOR_WIDTH"])) for r in g) == t["wid_yd"]
                        and max(r["TOR_F_SCALE"][-1] for r in g) == str(t["ef"])):
                    hits.append(g)
        if hits: break
    assert len(hits) == 1, (t["om"], len(hits))
    return hits[0]

# ---- 2. the declared rule
WORDS = "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen " \
        "seventeen eighteen nineteen twenty".split()
TENS = {20: "twenty", 30: "thirty", 40: "forty", 50: "fifty", 60: "sixty", 70: "seventy", 80: "eighty", 90: "ninety"}
def word(n):
    if n < 21: return WORDS[n]
    return TENS[n - n % 10] + ("" if n % 10 == 0 else "-" + WORDS[n % 10])
def read(narr, n):
    sents = [s for s in re.split(r"(?<=[.!?])\s+", narr) if re.search(r"injur|hurt", s, re.I)]
    if not sents: return "silent", []
    pat = re.compile(r"\b(%d|%s)\b" % (n, re.escape(word(n))), re.I)
    return ("states" if any(pat.search(s) for s in sents) else "mentions"), sents

rows = []
for t in TOP:
    g = match(t)
    segs = []
    for r in g:
        cls, sents = read(r["EVENT_NARRATIVE"], inj(r))
        segs.append({"event_id": int(r["EVENT_ID"]), "county": r["CZ_NAME"].title(), "begin": r["BEGIN_DATE_TIME"],
                     "inj": inj(r), "class": cls, "sentences": sents, "source": r["SOURCE"]})
    acc = sum(s["inj"] for s in segs if s["class"] == "states")
    cls = "states" if acc == t["inj"] else ("silent" if all(s["class"] == "silent" for s in segs) else "mentions")
    if cls == "mentions" and acc > 0: cls = "part"
    rows.append({k: t[k] for k in ("om", "date", "st", "cat", "ef", "len_mi", "wid_yd", "inj", "mu", "u", "delta",
                                   "rank_delta")} | {"segments": segs, "accounted": acc, "class": cls})

# ---- 3. the second account of om 315890, and the refits
txt = poun.read_text(encoding="utf-8", errors="replace")
txt = re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<script.*?</script>|<style.*?</style>", "", txt, flags=re.S))))
i = txt.index('Tornado D3 - The "McLoud Tornado" of May 24, 2011')
d3 = txt[i:i + 1500]
m = re.search(r"D3 05/24/2011 1736-1739 2 50 EF2 (\d+) (\d+) Pottawatomie", d3)
oun_killed, oun_inj = int(m.group(1)), int(m.group(2))
oun_narr = d3[d3.index("This tornado developed"):d3.index("Monetary damage estimates were not available.") + 46]
oun_total = int(re.search(r"resulted in 11 deaths and (\d+) injuries", txt).group(1))
mc = next(r for r in rows if r["om"] == 315890)
se_narr = next(r for r in seg[("OKLAHOMA", dt.date(2011, 5, 24))] if r["EVENT_ID"] == "315890")
ok_day = sum(inj(r) for r in seg[("OKLAHOMA", dt.date(2011, 5, 24))])
DROPPED = ", and injuring the truck driver"
assert DROPPED in oun_narr and "injuring" not in se_narr["EVENT_NARRATIVE"]
assert "lofting the pieces to the north" + DROPPED in oun_narr and "lofting the pieces to the north." in se_narr["EVENT_NARRATIVE"]

d = pd.read_csv(ptsv, sep="\t"); d = d[d.warned == 1].copy().reset_index(drop=True)
assert len(d) == R37["n_warned"] and int(d.loc[d.om == 315890, "inj"].iloc[0]) == 32
d["ef"] = d.mag.clip(lower=0).clip(upper=4)
for k in (1, 2, 3, 4): d[f"EF{k}"] = (d.ef == k).astype(float)
d["region"] = d.region.replace({"other": "South"})
for r in ("Northeast", "Midwest", "West"): d[r] = (d.region == r).astype(float)
d["e2"] = d.yr.between(2012, 2016).astype(float); d["e3"] = (d.yr >= 2017).astype(float)
d["ll"] = np.log(d.len_mi + 0.01); d["lw"] = np.log(d.wid_yd); d["ld"] = np.log(d.density)
d["lx"] = np.log(d.exposure + 1); d["night"] = d.night.astype(float)
cat = np.where(d.warnings_county_1y == 0, "none", np.where(d.run_county == 0, "hit", np.where(d.run_county <= 2, "run12", "run3")))
for c in ("none", "run12", "run3"): d["c_" + c] = (cat == c).astype(float)
COLS = ["c_none", "c_run12", "c_run3", "EF1", "EF2", "EF3", "EF4", "ll", "lw", "night", "e2", "e3",
        "Northeast", "Midwest", "West", "ld", "lx"]
def fit(df):  # study 35's NB2 fit as analyse37.py writes it
    X = sm.add_constant(df[COLS]); p = sm.GLM(df.inj, X, family=sm.families.Poisson()).fit()
    mod = sm.NegativeBinomial(df.inj, X, loglike_method="nb2")
    r = mod.fit(start_params=np.append(p.params.values, 1.0), cov_type="HC0", disp=0, maxiter=2000, method="nm")
    r = mod.fit(start_params=r.params, cov_type="HC0", disp=0, maxiter=200, method="newton")
    ci = r.conf_int()
    return {"irr": round(float(np.exp(r.params.c_run3)), 3), "lo": round(float(np.exp(ci.loc["c_run3", 0])), 3),
            "hi": round(float(np.exp(ci.loc["c_run3", 1])), 3)}
full = fit(d)
assert full == {k: R37["full"][k] for k in ("irr", "lo", "hi")}, full
loo = fit(d[d.om != 315890].reset_index(drop=True))
assert loo == {k: R37["refits"][0]["refit"][k] for k in ("irr", "lo", "hi")} and R37["refits"][0]["om"] == 315890, loo

def est(f):  # coda I's estimate, as aside.py makes it
    lp = math.log(f["irr"]); se = (math.log(f["hi"]) - math.log(f["lo"])) / (2 * 1.96)
    mm = {k: ((1.96 * se) / abs(lp - math.log(p))) ** 2 for k, p in V.items()}
    return f | {"all_inside": all(f["lo"] <= p <= f["hi"] for p in V.values()), "multiple_to_exclude": mm,
                "first_of_two": min(("learning", "habit"), key=lambda k: mm[k])}
sweep = []
for n in range(0, 33):
    e = d.copy(); e.loc[e.om == 315890, "inj"] = n
    sweep.append({"inj": n} | est(fit(e)))
assert sweep[32]["irr"] == full["irr"]
flip = min(s["inj"] for s in sweep if s["first_of_two"] == "habit")

out = {"field": {"commit": "300be07", "results37_sha256": SHA["results37"], "tornadoes31_sha256": SHA["tornadoes31"],
                 "study": 37, "full": full, "without_315890": loo},
       "storm_events": {"source": "https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/", "fetched": "2026-10-22",
                        "files": files},
       "rule": "states: a sentence with 'injur' or 'hurt' contains the segment's recorded count (digits or number word); "
               "mentions: such a sentence without the count; silent: none",
       "rows": rows,
       "counts": {c: sum(r["class"] == c for r in rows) for c in ("states", "part", "mentions", "silent")},
       "pull_share_silent": round(sum(abs(r["delta"]) for r in rows if r["class"] == "silent") / sum(abs(r["delta"]) for r in rows), 3),
       "mcloud": {"oun_page": "https://www.weather.gov/oun/events-20110524", "oun_sha256": SHA["oun_page"], "fetched": "2026-10-22",
                  "oun_killed": oun_killed, "oun_injured": oun_inj, "oun_day_injuries": oun_total,
                  "storm_events_day_injuries_ok": ok_day, "oun_narrative": oun_narr,
                  "storm_events_narrative": se_narr["EVENT_NARRATIVE"], "dropped": DROPPED,
                  "storm_events_injured": inj(se_narr)},
       "sweep": sweep, "habit_first_from": flip, "villages": V, "crossing": CROSS}
(HERE / "survey.json").write_text(json.dumps(out, indent=1) + "\n")
(HERE / "survey.js").write_text("window.SURVEY=" + json.dumps(out, separators=(",", ":")) + ";\n")
print(json.dumps({k: out[k] for k in ("counts", "pull_share_silent", "habit_first_from")}),
      [(r["om"], r["class"], r["accounted"], r["inj"]) for r in rows], sweep[1]["irr"], sweep[1]["first_of_two"], ok_day, oun_total)
