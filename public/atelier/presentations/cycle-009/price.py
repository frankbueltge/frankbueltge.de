"""Coda II, The Price of an Hour. The Wolf's Ledger, cycle 009, added 2026-10-22 after the presentation.

The Field offered this practice a number (relay ho-2026-10-21-field-3, its study 34, s219): priced at its central
values, plate IV's amber band corresponds to an hour under a warning worth $5.74-8.82, and at $15 for a quarter of
an hour the public's B / L is 0.50-0.63. results34.json and analyse34.py, field-research at 690e2af, sha256 asserted.
Study 34 read this practice's plate4.json at ulysses 522c7c3; the file here is that file (sha256 asserted).

Plate IV let the visitor set B / L and then switch the record. That holds B / L fixed while the record moves. The
Field's L is not fixed by the record: it is the loss the public averts per met warning, the same casualties spread
over the warnings the record calls met (analyse34.py, r(): B per warning over e * V / (P_met * N)). A record that
finds more warnings met also finds each meeting averting less, so B / L rises with P_met, and linearly in the price
of an hour v. So this script, a check and not a test (no predictions were written; the $7.09-7.14 band was seen in
the Field's numbers before this was written):

  - recomputes the Field's P_met for both records from plate4.json's classes, as analyse34.py does, and asserts
    them equal to results34.json's;
  - takes k[rec] = r_central[rec] / v_central, the B / L of one dollar an hour, by each record;
  - gives each stated word the price of an hour below which Hand's line owes it, v* = P_word[rec] / k[rec];
  - asserts the Field's breakeven_hour_value from these, and gives the share of empty warnings Hand charges to
    the warner at the federal minimum wage ($7.25, Fair Labor Standards Act, 29 U.S.C. 206(a)(1)(C), in force
    since 24 July 2009) and at the Field's central $15, by both records.

Usage: python3 -I price.py FIELD_RESULTS34_JSON FIELD_ANALYSE34_PY   (writes price.json and price.js here)
"""
import json, sys, hashlib
from pathlib import Path

HERE = Path(__file__).parent
SHA = {"results34": "7c5c5f231801f0d69e58bda6e031a951c429bac28a84a1396066acec7c50e8dc",
       "analyse34": "29cc4024003a4b9552cff70037bc76ec1dfcefc8827be0943c0781c5f31d2c81",
       "plate4": "220ff73b938b96eafff560dc362c1a21828e7526279cb32b87e7f876ad9a6c0a"}
raw = {"results34": Path(sys.argv[1]).read_bytes(), "analyse34": Path(sys.argv[2]).read_bytes(),
       "plate4": (HERE / "plate4.json").read_bytes()}
for k, b in raw.items():
    assert hashlib.sha256(b).hexdigest() == SHA[k], k
F, P4 = json.loads(raw["results34"]), json.loads(raw["plate4"])
src = raw["analyse34"].decode()
CENTRAL = '{"vsl": 9.1e6, "inj": 0.047, "e": 0.5, "h": 0.25, "v": 15.0}'
assert CENTRAL in src  # the Field's central values, quoted on the page
V0, RECS, ORDER = 15.0, ("hour", "later"), ["N", "R", "O", "RC", "OC", "CAT"]
C = P4["classes"]
n_all = sum(c["n"] for c in C.values())
P_met = {r: 1 - sum(c[f"empty_{r}"] for c in C.values()) / n_all for r in RECS}
for r in RECS:
    assert abs(P_met[r] - F["P_met"][r]) < 1e-12, r
k = {r: F["r_central"][r] / V0 for r in RECS}
# the Field's B / L is proportional to P_met: same k / P_met under both records
assert abs(k["hour"] / P_met["hour"] - k["later"] / P_met["later"]) < 1e-12
vstar = {r: {w: C[w][f"P_{r}"] / k[r] for w in ORDER} for r in RECS}
for r in RECS:
    for b in F["band"]:
        assert abs(b / k[r] - F["breakeven_hour_value"][f"{r}@{b:.3f}"]) < 1e-9


def charged(v, r):
    """empties in classes whose chance does not exceed B / L at v dollars an hour (plate4-ui.js, book())."""
    b = v * k[r]
    return sum(C[w][f"empty_{r}"] for w in ORDER if not C[w][f"P_{r}"] > b)


MIN_WAGE = 7.25
at = {f"{v:g}": {r: {"b": v * k[r], "charged": charged(v, r), "all": P4[f"empty_{r}"]} for r in RECS}
      for v in (MIN_WAGE, V0)}
out = {
    "field": {"commit": "690e2af", "results": "artifacts/cycle-009/after-the-empty-warnings/data/results34.json",
              "script": "artifacts/cycle-009/after-the-empty-warnings/analyse34.py",
              "sha256": {"results34": SHA["results34"], "analyse34": SHA["analyse34"]},
              "handoff": "ho-2026-10-21-field-3", "central": json.loads(CENTRAL),
              "n_warnings": F["n_warnings"], "deaths": F["deaths"], "injuries": F["injuries"],
              "people_median": F["people"]["median"], "breakeven_hour_value": F["breakeven_hour_value"]},
    "plate4_sha256": SHA["plate4"], "P_met": P_met, "k": k, "vstar": vstar,
    "band_dollars": sorted([vstar["hour"]["R"], vstar["later"]["R"]]),
    "band_ratio": P4["band"], "min_wage": MIN_WAGE, "at": at,
    "word_order_by_vstar": {r: sorted(ORDER, key=lambda w: vstar[r][w]) for r in RECS},
}
(HERE / "price.json").write_text(json.dumps(out, indent=1) + "\n")
(HERE / "price.js").write_text("window.PRICE=" + json.dumps(out, separators=(",", ":")) + ";\n")
print(json.dumps({"band_dollars": out["band_dollars"], "vstar": vstar, "at": at}, indent=1))
