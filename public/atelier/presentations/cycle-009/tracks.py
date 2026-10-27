"""Coda IV, corrected again (2026-10-23, seventh session, after the presentation): one tornado, two rows.

The relay's open handoff ho-2026-10-22-field-7 is a correction of this work's claim: the point coda III's 1.23 parting
stands on moves to 1.33-1.42 "when two records are read as the Weather Service wrote them" (the Field's study 38,
results38.json at field-research@932b774). The two records are McLoud (om 315890: 1 injured on NWS Norman's event page,
32 in the database) and a Louisiana tornado of 2016-02-23 that the Storm Prediction Center's file carries as two
tornadoes (om 613558, Assumption Parish, EF3, 0 injured; om 613559, St James Parish, EF2, 75 injured, 2 dead) and the
Weather Service's own narratives as one ("crossed into St. James Parish"; "moved out of Assumption Parish").

This script checks the correction. It:
1. reproduces the Field's four fits of study 38 exactly (as fitted; McLoud at 1; Louisiana as one track; both), from
   its tornadoes31.tsv and its own construction of the joined row (analyse38.py: strongest rating, summed length,
   widest width, the earlier row dropped), sha256 asserted;
2. reads the two Louisiana segments in NOAA NCEI's Storm Events details file of 2016 (public domain, sha256 asserted)
   and the two rows in the SPC file, and asserts what makes them one track: the first segment's end point is the
   second's start point, to the fourth decimal, at the same minute, and both narratives say the tornado crossed;
3. places each fit against coda III's parting (1.231) and coda I's estimate, as aside.py and survey.py make it.

The refits are my runs of the Field's model and agree with its figures to the third decimal (asserted); the reading of
which accounts are "the record" is mine.

Usage: /usr/bin/python3 -I tracks.py RESULTS38_JSON TORNADOES31_TSV STORMEVENTS_2016_GZ SPC_CSV
       (needs numpy, pandas, statsmodels; writes tracks.json and tracks.js here)
"""
import csv, gzip, hashlib, json, math, re, sys, warnings
from pathlib import Path
import numpy as np, pandas as pd, statsmodels.api as sm

warnings.simplefilter("ignore")
HERE = Path(__file__).parent
SHA = {"results38": "e98655bcab780aedabcf75ac231ae99b1fb9ea71a2c003f0cfc273a080e70410",
       "tornadoes31": "a9f2e00c5eff7792bc9e7b780b0379b7516866a1f7e10bbeaeb9e4be4a08c3fc",
       "storm_events_2016": "d8e1389897df3557e74ba36820357f6962a7c0ca922595400fe74d883f7a5036",
       "spc": "cd6dc7b14d0efffe19bd39266b09e4d0b65da70ae132316825c511ecdb776cf2"}  # the file accounts.py read the same day
p38, ptsv, pse, pspc = (Path(a) for a in sys.argv[1:5])
for k, p in zip(SHA, (p38, ptsv, pse, pspc)):
    assert hashlib.sha256(p.read_bytes()).hexdigest() == SHA[k], k
R38 = json.loads(p38.read_text())
C = json.loads((HERE / "aside.json").read_text())
A = json.loads((HERE / "accounts.json").read_text())
V, CROSS = C["villages"], C["crossing"]

# ---- 2. the Louisiana track, in the Weather Service's database and in the SPC file
seg = {r["EVENT_ID"]: r for r in csv.DictReader(gzip.open(pse, "rt", encoding="latin-1")) if r["EVENT_ID"] in ("617674", "613449")}
a, b = seg["617674"], seg["613449"]
assert (a["CZ_NAME"], b["CZ_NAME"]) == ("ASSUMPTION", "ST. JAMES") and a["EPISODE_ID"] == b["EPISODE_ID"]
assert (a["END_LAT"], a["END_LON"]) == (b["BEGIN_LAT"], b["BEGIN_LON"]) and a["END_DATE_TIME"] == b["BEGIN_DATE_TIME"]
assert "crossed into St. James Parish" in a["EVENT_NARRATIVE"] and "moved out of Assumption Parish" in b["EVENT_NARRATIVE"]
assert "peak intensity of EF-3 occurred in Assumption Parish" in b["EVENT_NARRATIVE"]
spc = {r["om"]: r for r in csv.DictReader(pspc.open()) if r["om"] in ("613558", "613559") and r["yr"] == "2016"}
assert all(spc[o]["ns"] == spc[o]["sn"] == spc[o]["sg"] == "1" for o in spc)  # each carried as one whole tornado
assert (spc["613558"]["elat"], spc["613558"]["elon"]) == (spc["613559"]["slat"], spc["613559"]["slon"])
inj = lambda r: int(r["INJURIES_DIRECT"]) + int(r["INJURIES_INDIRECT"])
track = {"segments": [{"event_id": int(r["EVENT_ID"]), "parish": r["CZ_NAME"].title(), "begin": r["BEGIN_DATE_TIME"],
                       "end": r["END_DATE_TIME"], "ef": r["TOR_F_SCALE"], "len_mi": float(r["TOR_LENGTH"]),
                       "wid_yd": int(r["TOR_WIDTH"]), "inj": inj(r), "deaths": int(r["DEATHS_DIRECT"]) + int(r["DEATHS_INDIRECT"]),
                       "start": [r["BEGIN_LAT"], r["BEGIN_LON"]], "stop": [r["END_LAT"], r["END_LON"]],
                       "crossing_sentence": re.search(r"(The tornado continued moving to the northeast and crossed into St\. James Parish\.|A strong tornado moved out of Assumption Parish into St James Parish[^.]*\.)", r["EVENT_NARRATIVE"]).group(1)}
                      for r in (a, b)],
         "spc_rows": [{"om": int(o), "ef": int(spc[o]["mag"]), "inj": int(spc[o]["inj"]), "len_mi": float(spc[o]["len"]),
                       "counted_as": "one whole tornado (ns=1, sn=1, sg=1)"} for o in ("613558", "613559")]}

# ---- 1. study 38's model and its joined row, as analyse38.py writes them
d = pd.read_csv(ptsv, sep="\t"); d["date"] = d.start_utc.str[:10]  # as analyse38.py keys its rows
def design(x):
    x = x[x.warned == 1].copy().reset_index(drop=True)
    x["ef"] = x.mag.clip(lower=0).clip(upper=4)
    for k in (1, 2, 3, 4): x[f"EF{k}"] = (x.ef == k).astype(float)
    x["region"] = x.region.replace({"other": "South"})
    for r in ("Northeast", "Midwest", "West"): x[r] = (x.region == r).astype(float)
    x["e2"] = x.yr.between(2012, 2016).astype(float); x["e3"] = (x.yr >= 2017).astype(float)
    x["ll"] = np.log(x.len_mi + 0.01); x["lw"] = np.log(x.wid_yd); x["ld"] = np.log(x.density)
    x["lx"] = np.log(x.exposure + 1); x["night"] = x.night.astype(float)
    cat = np.where(x.warnings_county_1y == 0, "none", np.where(x.run_county == 0, "hit", np.where(x.run_county <= 2, "run12", "run3")))
    for c in ("none", "run12", "run3"): x["c_" + c] = (cat == c).astype(float)
    return x
COLS = ["c_none", "c_run12", "c_run3", "EF1", "EF2", "EF3", "EF4", "ll", "lw", "night", "e2", "e3",
        "Northeast", "Midwest", "West", "ld", "lx"]
def fit(df):
    X = sm.add_constant(df[COLS]); p = sm.GLM(df.inj, X, family=sm.families.Poisson()).fit()
    mod = sm.NegativeBinomial(df.inj, X, loglike_method="nb2")
    r = mod.fit(start_params=np.append(p.params.values, 1.0), cov_type="HC0", disp=0, maxiter=2000, method="nm")
    r = mod.fit(start_params=r.params, cov_type="HC0", disp=0, maxiter=200, method="newton")
    ci = r.conf_int()
    return {"irr": round(float(np.exp(r.params.c_run3)), 3), "lo": round(float(np.exp(ci.loc["c_run3", 0])), 3),
            "hi": round(float(np.exp(ci.loc["c_run3", 1])), 3), "n": int(len(df))}
def corrected(mcloud, louisiana):
    x = d.copy()
    if mcloud: x.loc[(x.om == 315890) & (x.date == "2011-05-24"), "inj"] = 1
    if louisiana:
        i = x.index[(x.om == 613559) & (x.date == "2016-02-23")][0]
        x.loc[i, "mag"] = max(int(x.loc[i, "mag"]), 3); x.loc[i, "len_mi"] = 12.95 + 7.78; x.loc[i, "wid_yd"] = 350.0
        x = x[~((x.om == 613558) & (x.date == "2016-02-23"))]
    return design(x)
def est(f):  # coda I's estimate, as aside.py makes it
    lp = math.log(f["irr"]); se = (math.log(f["hi"]) - math.log(f["lo"])) / (2 * 1.96)
    mm = {k: ((1.96 * se) / abs(lp - math.log(p))) ** 2 for k, p in V.items()}
    return f | {"all_inside": all(f["lo"] <= p <= f["hi"] for p in V.values()), "multiple_to_exclude": mm,
                "first_of_two": min(("learning", "habit"), key=lambda k: mm[k]), "above_parting": f["irr"] > CROSS}
FKEY = {(False, False): "full", (True, False): "mcloud_1_injured", (False, True): "louisiana_one_track", (True, True): "both"}
cells = []
for (mc, la), key in FKEY.items():
    f = fit(corrected(mc, la))
    assert {k: f[k] for k in ("irr", "lo", "hi")} == {k: R38["fits"][key][k] for k in ("irr", "lo", "hi")}, (key, f)
    cells.append({"mcloud": 1 if mc else 32, "louisiana": "one track" if la else "two rows", "field_key": key} | est(f))

off = next(x for x in A["accounts"] if x["official"] is True)
assert off["D3"] == 32
out = {"handoff": "ho-2026-10-22-field-7",
       "field": {"commit": "932b774", "study": 38, "results38_sha256": SHA["results38"], "tornadoes31_sha256": SHA["tornadoes31"]},
       "sources": {"storm_events_2016": {"url": "https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d2016_c20260323.csv.gz",
                                         "sha256": SHA["storm_events_2016"], "fetched": "2026-10-23"},
                   "spc": {"url": "https://www.spc.noaa.gov/wcm/data/1950-2024_actual_tornadoes.csv", "sha256": SHA["spc"], "fetched": "2026-10-23"}},
       "track": track, "cells": cells, "villages": V, "crossing": CROSS,
       "official_mcloud": off["D3"]}
(HERE / "tracks.json").write_text(json.dumps(out, indent=1) + "\n")
(HERE / "tracks.js").write_text("window.TRACKS=" + json.dumps(out, separators=(",", ":")) + ";\n")
for c in cells: print(c["mcloud"], c["louisiana"], c["irr"], c["lo"], c["hi"], c["first_of_two"], round(c["multiple_to_exclude"]["learning"], 1), round(c["multiple_to_exclude"]["habit"], 1))
