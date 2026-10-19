"""FILED UNDER, coda (session 182, increment: written nine times): builds nine.js and nine_summary.json.

Usage: python3 build_nine.py <lagged_25.jsonl> outcomes_nine.json <lagged_cells_25.tsv> outcomes.json
  lagged_25.jsonl: the Field's study 25 table, nine writings per sequence chosen by the clock alone (the earliest
  version issued at least 0, 6, 12, 24, 48, 96 h, 7, 14 or 30 days after the first), field-research @ 99ca41d,
  sha256 bcbfb914...4bbe. outcomes_nine.json: our own ComCat refetch (fetch_nine.py). lagged_cells_25.tsv
  (field-research @ 99ca41d, sha256 669da73e...0d49a) is read only to check our counts against the Field's.
Rules, fixed before counting: the card's magnitude M stays the coda's (the lowest bin at or above the first
writing's floor) in all nine; a writing's week is needed if at least one event at or above M came inside its
own circle and week, never needed if none did; the mainshock's own id is never an aftershock. Two clocks:
  living   what had come inside a writing's week before the writing was issued (its week may begin before it)
  archive  what a reader who opens each earlier week whole already sees inside a later writing's week
"""
import json, sys, math, statistics, hashlib

V = [json.loads(l) for l in open(sys.argv[1])]
O = json.load(open(sys.argv[2])); fetched = O["fetched"]; O = O["outcomes"]
cells = {}
for l in open(sys.argv[3]).read().splitlines()[1:]:
    f = l.split("\t"); cells[(int(f[0]), f[1], float(f[4]))] = int(f[6])
M0 = json.load(open(sys.argv[4]))["outcomes"]

def km(lat0, lon0, lat, lon):
    dx = (lon - lon0) * 111.32 * math.cos(math.radians(lat0))
    return round(dx, 2), round((lat - lat0) * 110.57, 2)

seq = {}
for r in V:
    k = "%s|%d" % (r["id"], r["issued"])
    if k not in O:
        continue
    wk = next(w for w in r["windows"] if w["label"] == "1 Week")
    M = O[k]["M"]
    b = next(b for b in wk["bins"] if abs(b["M"] - M) < 1e-9)
    ev = [e for e in O[k]["events"] if e["id"] != r["id"]]
    seq.setdefault(r["id"], []).append({
        "L": r["lag_rule_h"], "lag_h": r["lag_h"], "issued": r["issued"], "t0": wk["t0"], "t1": wk["t1"],
        "p": b["p"], "rkm": r["rkm"], "c": [r["rlat"], r["rlon"]], "M": M,
        "ev": [{"t": e["t"], "m": e["m"], "mt": e["mt"], "xy": km(r["rlat"], r["rlon"], e["lat"], e["lon"]), "id": e["id"]} for e in ev],
        "fate": "needed" if ev else "never_needed"})
for s in seq.values():
    s.sort(key=lambda w: w["L"])

LAGS = [0, 6, 12, 24, 48, 96, 168, 336, 720]
per_lag = []
agree = differ = 0
for L in LAGS:
    ws = [(i, w) for i, s in seq.items() for w in s if w["L"] == L]
    for i, w in ws:
        n = cells.get((L, i, w["M"]))
        if n is not None:
            agree += n == len(w["ev"]); differ += n != len(w["ev"])
    per_lag.append({"lag_rule_h": L, "weeks": len(ws), "came": sum(w["fate"] == "needed" for _, w in ws),
                    "stated": round(sum(w["p"] for _, w in ws), 1),
                    "warn": sum(w["p"] >= .5 for _, w in ws), "warn_came": sum(w["p"] >= .5 and w["fate"] == "needed" for _, w in ws),
                    "median_lag_h": round(statistics.median(w["lag_h"] for _, w in ws), 1)})

full = {i: s for i, s in seq.items() if len(s) == 9}
mixed = [i for i, s in full.items() if len({w["fate"] for w in s}) > 1]
distinct = {(i, w["issued"]): w for i, s in seq.items() for w in s}
started_before = [w for w in distinct.values() if w["t0"] < w["issued"]]
living = [w for w in distinct.values() if any(e["t"] < w["issued"] for e in w["ev"])]
# archive: for each later distinct writing, do the earlier writings' weeks, opened whole, already show one of its events?
arch = arch_n = 0
for i, s in seq.items():
    ds = sorted({w["issued"]: w for w in s}.values(), key=lambda w: w["issued"])
    for k in range(1, len(ds)):
        seen = {e["id"] for w in ds[:k] for e in w["ev"]}
        arch_n += 1
        arch += any(e["id"] in seen for e in ds[k]["ev"])
same_version = sum(len({w["issued"] for w in s}) < len(s) for s in seq.values())
S = {
    "sequences": len(seq), "sequences_all_nine_closed": len(full), "distinct_writings": len(distinct),
    "fetched": fetched, "per_lag": per_lag,
    "fate_moves_with_writing": len(mixed),
    "fate_needed_in_all_nine": sum(all(w["fate"] == "needed" for w in s) for s in full.values()),
    "fate_never_in_all_nine": sum(all(w["fate"] == "never_needed" for w in s) for s in full.values()),
    "sequences_where_a_rule_repeats_a_writing": same_version,
    "weeks_begun_before_written": len(started_before),
    "median_hours_week_begun_before_written": round(statistics.median((w["issued"] - w["t0"]) / 3.6e6 for w in started_before), 2),
    "living_already_came_when_written": len(living),
    "archive_later_weeks": arch_n, "archive_already_shown": arch,
    "field_agreement": {"same_count": agree, "different_count": differ},
    "field_source": "field-research @ 99ca41d7793c49638d59a740b35bbb3a6269d28f, artifacts/2026-10-17-the-odds-written-down/data/lagged_25.jsonl and lagged_cells_25.tsv",
}
open("nine.js", "w").write("// FILED UNDER, coda: built by build_nine.py, session 182\nconst NINE = " +
                          json.dumps(seq, separators=(",", ":")) + ";\nconst NINE_SUMMARY = " + json.dumps(S) + ";\n")
json.dump(S, open("nine_summary.json", "w"), indent=1)
print(json.dumps(S, indent=1))
