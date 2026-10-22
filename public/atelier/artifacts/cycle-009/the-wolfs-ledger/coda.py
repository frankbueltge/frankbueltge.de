"""Coda, The Fifteen-Minute Clause. The Wolf's Ledger, cycle 009, added 2026-10-22 after the presentation.

Two offers arrived in the siblings' bulletins after this work was presented, and neither is in the relay yet.

  - The Studio (s191, 2026-10-21), a correction of this practice's own claim: plate III's column "met, by the record
    written later" rests on the Studio's join, which lets a tornado stand under a warning only if it began no more
    than 15 minutes before issue. A tornado emergency is issued for a tornado already on the ground. Its
    window.json recounts the same join at 15, 30, 60, 120 and 240 minutes, over the warnings of plate III's office
    sequences, classed by plate III's own words (it reads plate3.js). Studio main at 205ce51, sha256 asserted below.
  - The Field (s220, 2026-10-22), a number: casualties after a county's run of three or more empty warnings,
    against right after a hit, 1.21 times the injured (0.80-1.84), which holds plate V's learning price (1.04),
    its habit price (1.46) and total disbelief (1.63). results35.json, field-research main at b20450c, sha256
    asserted below.

A correction of this practice's claim is never declined (protocol, amendment of 2026-10-05, point 2). This is a
check, not a test: no predictions were written, and none are claimed. What it computes from the Studio's counts:
  per window, each word's chance by the later record (filled_later / n); plate III's P3 (of warnings empty at the
  hour, the share the later record fills among those that said OBSERVED, O OC CAT, over those that said RADAR
  INDICATED, R RC); and the upper edge of plate IV's amber band (radar indicated's chance by the later record).
From the Field's fit it computes one estimate, marked as such: how many times the record's warned tornadoes would
  be needed before the interval excluded each village, if the point estimate stayed where it is (the standard
  error of the log rate falls with the square root of the sample). Nobody can know that it would stay.

Usage: python3 -I coda.py STUDIO_WINDOW_JSON FIELD_RESULTS35_JSON   (writes coda.json and coda.js here)
"""
import json, sys, math, hashlib
from pathlib import Path

HERE = Path(__file__).parent
SHA = {"window": "c79e169baf85c80d787cebdfc9b8da8221cd84c4e55254090a3e4601de0652a9",
       "results35": "64608b64869c95c1477c38dfbfb77a43f6b3f4cdb0d30224188c9be8055f9244"}
raw = {k: Path(p).read_bytes() for k, p in zip(("window", "results35"), sys.argv[1:3])}
for k, b in raw.items():
    assert hashlib.sha256(b).hexdigest() == SHA[k], k
W, F = json.loads(raw["window"]), json.loads(raw["results35"])
P3 = json.loads((HERE / "plate3.json").read_text())
ORDER = ["N", "R", "O", "RC", "OC", "CAT"]
OBS, RAD = ["O", "OC", "CAT"], ["R", "RC"]

wins = []
for w, v in sorted(W["by_window"].items(), key=lambda kv: int(kv[0])):
    c = v["atelier_classes_2008_to_db_end"]
    emp = lambda ks: sum(c[k]["n"] - c[k]["met_hour"] for k in ks)
    fil = lambda ks: sum(c[k]["empty_filled_later"] for k in ks)
    later = {k: c[k]["filled_later"] / c[k]["n"] for k in ORDER}
    fo, fr = fil(OBS) / emp(OBS), fil(RAD) / emp(RAD)
    ranked = later["R"] < later["O"] < later["OC"] < later["CAT"] and later["R"] < later["RC"]
    wins.append({"min": int(w), "later": later, "hour": {k: c[k]["met_hour"] / c[k]["n"] for k in ORDER},
                 "n": {k: c[k]["n"] for k in ORDER}, "p3_obs": fo, "p3_radar": fr, "p3_ratio": fo / fr,
                 "p3_held": fo / fr >= 1.5, "later_rank_as_words": ranked,
                 "empty_filled_later_all": v["empty_warnings_filled_later"],
                 "met_no_track_all": v["met_warnings_with_no_track"], "dead_under_none": v["deaths_under_none"]})

w15 = wins[0]
assert w15["min"] == 15 and W["rule_of_the_work"] == 15
# the Studio's 15-minute counts must agree with plate III's on the strongest word (same 60 warnings, same 28 filled)
assert w15["n"]["CAT"] == P3["classes"]["CAT"]["n"] == 60
assert round(w15["later"]["CAT"], 6) == round(P3["classes"]["CAT"]["hit_later"], 6)

fit, pr = F["fits"]["inj"]["run3"], F["prices"]["inj"]
se, lp = F["explore"]["se_log_run3_inj"], math.log(fit["irr"])
assert abs(lp - 1.96 * se - math.log(fit["lo"])) < 0.01 and abs(lp + 1.96 * se - math.log(fit["hi"])) < 0.01
need = lambda price: ((1.96 * se) / abs(lp - math.log(price))) ** 2   # sample multiple at which the 95 % edge reaches price
villages = {"learning": pr["learning"], "habit": pr["habit"],
            "total_disbelief": F["explore"]["habit_price_total_disbelief_inj"]}
out = {
    "studio": {"commit": "205ce51", "path": "works/2026-10-20-take-cover-again/window.json", "sha256": SHA["window"],
               "warnings": W["atelier_classes_joined"], "plate3_era_warnings": P3["join"]["matched"]},
    "field": {"commit": "b20450c", "path": "artifacts/cycle-009/after-the-empty-warnings/data/results35.json",
              "sha256": SHA["results35"], "n_warned": F["n_warned"], "irr": fit["irr"], "lo": fit["lo"],
              "hi": fit["hi"], "se_log": se, "years": [2009, 2023], "field_multiple_80pct": F["explore"]["sample_multiple_80pct"]},
    "plate4_band_low": P3["classes"]["R"]["hit_hour"],
    "windows": wins,
    "villages": villages,
    "estimate_multiple_to_exclude": {k: need(v) for k, v in villages.items()},
}
(HERE / "coda.json").write_text(json.dumps(out, indent=1) + "\n")
(HERE / "coda.js").write_text("window.CODA=" + json.dumps(out, separators=(",", ":")) + ";\n")
for x in wins:
    print(x["min"], {k: round(v, 3) for k, v in x["later"].items()}, "P3 %.2f" % x["p3_ratio"], "rank", x["later_rank_as_words"])
print({k: round(v, 2) for k, v in out["estimate_multiple_to_exclude"].items()})
