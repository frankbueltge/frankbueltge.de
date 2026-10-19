"""Plate VIII, In the Subjunctive. Built on the Field's study 25 (field-research@99ca41d,
artifacts/2026-10-17-the-odds-written-down/data/, sha256 of each input asserted), offered to this
practice in the Field's bulletin of 2026-10-19 (s210): nine versions of each aftershock forecast,
fixed by the clock before the outcome, span only 0.56-0.94 and condemn only the first hour, while a
reader who chooses among the same nine after seeing what came reaches 0.01-3.52.

The question this plate asks of that offer is not the Field's, and nothing is rescored. It reads the
offer through Saidiya Hartman, "Venus in Two Acts" (Small Axe 26, 2008), read in full on 2026-10-19:
her distinction between filling an archive's gap "and provid[ing] closure where there is none" and a
narrative written in the subjunctive, under "narrative restraint". The plate asks whether that
distinction has a counterpart on a record of revised warnings, as a matter of grammatical MOOD: which
sentences about these 232 forecasts the record lets one write in the indicative, which only in the
subjunctive, and which in neither.

The rules, fixed before counting (2026-10-19):
  sequence    one of the 232 sequences the Field closed at all nine lags (its "common set").
  version     for lag L, the earliest version issued at least L hours after the first (the Field's
              rule); each scored on its own week, exactly as the Field scored it. One version can
              serve several lags; the plate counts distinct versions too.
  a reading   one lag per sequence; 9^232 readings exist.
  the verdict observed / stated over the chosen versions; a 95 % interval from 2,000 resamplings
              of sequences (seed 20261019); "too high" if the interval lies under 1, "too low" if
              over 1, otherwise "cannot be told from right" (the Field's words).
  the moods   INDICATIVE: a verdict whose reading was fixed before what came was shown (a clock
              rule for all, or any reading made blind). SUBJUNCTIVE: a verdict whose reading was
              chosen after what came was shown; it can only be written as "had these been the
              warnings, ... would have". NEITHER: what anyone did on reading a forecast; no file
              of the Field's or the agency's holds it, so no reading reaches it.
  event       for each sequence, whether "an aftershock came in the warned week" is the same for
              all nine versions. Where it is not, the event itself changes with the version read:
              the case in which Hartman's "what happened when" is thrown into crisis by the record,
              not by a writer.

Usage: python3 -I plate8.py FIELD_DATA_DIR    (writes plate8.json and plate8.js beside itself)
"""
import json, sys, hashlib, random, collections, datetime as dt
from pathlib import Path

HERE = Path(__file__).parent
D = Path(sys.argv[1])
COMMIT = "99ca41d7793c49638d59a740b35bbb3a6269d28f"
SHA = {"lagged_cells_25.tsv": "669da73e28c1cc2d0fdcfb0a94f3fdb6bd0257327093204041ad0253ebc0d49a",
       "results_25.json": "370d5c4581929201b5dd120623c4fc47270cba4b5c6667f83e4a589a8e9e4870",
       "explore_25.json": "9d76bcabcd7aae9d40815357c88de11dcb8e3992431b342e11d92044b5bd5ecc"}
for f, h in SHA.items():
    assert hashlib.sha256((D / f).read_bytes()).hexdigest() == h, f + " is not the Field's file at 99ca41d"

R25 = json.load(open(D / "results_25.json")); X25 = json.load(open(D / "explore_25.json"))
LAGS = R25["lags_h"]
rows = [l.rstrip("\n").split("\t") for l in open(D / "lagged_cells_25.tsv")]
cells = [dict(zip(rows[0], r)) for r in rows[1:]]
g = collections.defaultdict(lambda: collections.defaultdict(lambda: [0, 0.0]))
issued = collections.defaultdict(dict)
for c in cells:
    g[c["id"]][int(c["lag"])][0] += int(c["hit"]); g[c["id"]][int(c["lag"])][1] += float(c["p"])
    issued[c["id"]][int(c["lag"])] = c["issued"]
ids = sorted(i for i in g if all(l in g[i] for l in LAGS))
assert len(ids) == R25["common_sequences"] == 232

# reproduce the Field: every clock rule on the common set, and both sighted bounds
tot = lambda S: (sum(s[0] for s in S), sum(s[1] for s in S))
for k, L in enumerate(LAGS):
    o, e = tot([g[i][L] for i in ids]); f = R25["common_set"][k]
    assert f["lag_rule_h"] == L and o == f["observed"] and round(e, 2) == f["stated"], L

def dinkelbach(sign):
    lam = 1.0
    for _ in range(100):
        pick = [max(LAGS, key=lambda l: sign * (g[i][l][0] - lam * g[i][l][1])) for i in ids]
        o, e = tot([g[i][l] for i, l in zip(ids, pick)])
        if abs(o / e - lam) < 1e-12: break
        lam = o / e
    return pick
harsh, kind = dinkelbach(-1), dinkelbach(1)
for p, k in ((harsh, "harshest_sighted"), (kind, "kindest_sighted")):
    o, e = tot([g[i][l] for i, l in zip(ids, p)])
    assert o == X25[k]["observed"] and round(o / e, 3) == X25[k]["ratio"], k

rng = random.Random(20261019)
BOOT = [[rng.randrange(len(ids)) for _ in ids] for _ in range(2000)]
q = lambda v, a: v[int(a * (len(v) - 1))]
def verdict(pick):
    S = [g[i][l] for i, l in zip(ids, pick)]; o, e = tot(S)
    rs = sorted(sum(S[j][0] for j in b) / sum(S[j][1] for j in b) for b in BOOT)
    lo, hi = q(rs, .025), q(rs, .975)
    return {"observed": o, "stated": round(e, 2), "ratio": round(o / e, 3), "ci": [round(lo, 3), round(hi, 3)],
            "verdict": "too high" if hi < 1 else "too low" if lo > 1 else "cannot be told from right"}

out = {"source": {"repo": "frankbueltge/field-research", "commit": COMMIT,
                  "path": "artifacts/2026-10-17-the-odds-written-down/data/", "sha256": SHA},
       "sequences": len(ids), "lags_h": LAGS, "readings_possible": "9^232",
       "declared": [{"lag_h": L, **verdict([L] * len(ids))} for L in LAGS],
       "sighted": {"harshest": verdict(harsh), "kindest": verdict(kind)}}
blind = []
for _ in range(2000):
    p = [rng.choice(LAGS) for _ in ids]; o, e = tot([g[i][l] for i, l in zip(ids, p)]); blind.append(o / e)
blind.sort()
out["blind"] = {"readers": 2000, "median": round(q(blind, .5), 3), "range_95": [round(q(blind, .025), 3), round(q(blind, .975), 3)]}
dv = [v["verdict"] for v in out["declared"]]
out["declared_words"] = dict(collections.Counter(dv))
out["declared_span"] = [min(v["ratio"] for v in out["declared"]), max(v["ratio"] for v in out["declared"])]
# the event: does "an aftershock came in the warned week" hold for all nine versions, none, or some?
ev = collections.Counter()
for i in ids:
    h = [g[i][l][0] > 0 for l in LAGS]
    ev["came_in_every_version"if all(h) else "came_in_none" if not any(h) else "changes_with_the_version"] += 1
out["event"] = dict(ev)
nd = [len(set(issued[i].values())) for i in ids]
out["distinct_versions"] = {"median": sorted(nd)[len(nd) // 2], "min": min(nd), "max": max(nd), "total": sum(nd)}
out["no_record_of_what_anyone_did"] = {"fields_in_the_cells": rows[0],
    "note": "none of these, and none of the Field's other files for study 25, records a person's act on reading a forecast"}

meta = {}
for l in open(D / "lagged_25.jsonl") if (D / "lagged_25.jsonl").exists() else []:
    r = json.loads(l); meta.setdefault(r["id"], (r["mag"], dt.datetime.fromtimestamp(r["time"] / 1000, dt.timezone.utc).strftime("%Y-%m-%d")))
li = {L: k for k, L in enumerate(LAGS)}
P = [[i, *(meta.get(i, (None, None))), [[g[i][L][0], round(g[i][L][1], 4)] for L in LAGS],
      len(set(issued[i].values())), li[harsh[n]], li[kind[n]]] for n, i in enumerate(ids)]
(HERE / "plate8.json").write_text(json.dumps(out, indent=1) + "\n")
(HERE / "plate8.js").write_text("// generated by plate8.py from the Field's study 25 (USGS aftershock forecasts and ComCat)\n"
                                "const P8=" + json.dumps(out) + ";\nconst P8R=" + json.dumps(P, separators=(",", ":")) + ";\n")
print(json.dumps({k: v for k, v in out.items() if k not in ("source", "no_record_of_what_anyone_did")}, indent=1))
