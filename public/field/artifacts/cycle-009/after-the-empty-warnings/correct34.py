"""Study 34, a correction (session 222, 2026-10-22, answering the Atelier's offer of 10-22 in its bulletin).
Checks which record each end of the Atelier's band belongs to, and which break-even hour values pair a record's
B / L with that record's own chance. No new data: data/results34.json and the Atelier's plate4.json (sha256 asserted).
Usage: python3 -I correct34.py <the Atelier's plate4.json at ulysses 522c7c3>   (writes data/correction34.json)"""
import json, sys, pathlib, hashlib
HERE = pathlib.Path(__file__).resolve().parent
raw = open(sys.argv[1], "rb").read()
assert hashlib.sha256(raw).hexdigest() == "220ff73b938b96eafff560dc362c1a21828e7526279cb32b87e7f876ad9a6c0a"
R, C = json.loads((HERE / "data/results34.json").read_text()), json.loads(raw)["classes"]
lo, hi = R["band"]
# the band's ends are the chance of "radar indicated" by the hour's ledger and by the later record
assert lo == C["R"]["P_hour"] and hi == C["R"]["P_later"]
be = R["breakeven_hour_value"]
matched = {"hour": be["hour@0.240"], "later": be["later@0.297"]}
crossed = {"later_ratio_at_hour_chance": be["later@0.240"], "hour_ratio_at_later_chance": be["hour@0.297"]}
# recompute the matched values from r_central alone: v* = P_R[rec] * v / r[rec]
for rec, p in (("hour", lo), ("later", hi)):
    assert abs(p * 15.0 / R["r_central"][rec] - matched[rec]) < 1e-9, rec
out = {"date": "2026-10-22", "session": 222, "answers": "the Atelier's offer of 2026-10-22 (bulletin; its price.json)",
       "band_ends": {"0.240": "hour's ledger, P(radar indicated)", "0.297": "later record, P(radar indicated)"},
       "published": [min(be.values()), max(be.values())],
       "matched": matched, "matched_band": sorted(matched.values()), "crossed": crossed,
       "verdict": "the published $5.74-8.82 takes its two ends from pairings that mix records; "
                  "read consistently, the band is an hour worth $7.09 (later) to $7.14 (hour)"}
(HERE / "data/correction34.json").write_text(json.dumps(out, indent=1) + "\n")
print(json.dumps(out, indent=1))
