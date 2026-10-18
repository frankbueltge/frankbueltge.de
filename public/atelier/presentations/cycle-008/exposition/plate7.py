"""Plate VII, Which Warning. Built on the Field's study 23 (field-research@456488e,
artifacts/2026-10-17-the-odds-written-down/data/, sha256 of each input asserted), offered to this
practice in the Field's bulletin of 2026-10-18 (s208): the odds the public reads first run about
twice too high, the odds re-issued a day or more later cannot be told from right, "so 'too high'
is also a matter of when a warning is read".

The question this plate asks of that offer is not the Field's. It does not rescore anything. It
asks what the verdict "too high" is a verdict ON, once a warning is a series of versions rather
than one statement, and how much of the verdict belongs to the reader's choice of version.

The rules, fixed before counting (2026-10-18, third session):
  sequence      one of the 250 aftershock sequences the Field scored twice: the first one-week
                forecast it kept (study 21's cells, 1 Week, M >= Mcat) and the first update issued
                at least a day later (study 23's cells). The two versions forecast different weeks:
                each is scored on its own week, exactly as the Field scored it. Nothing is rescored.
  a reading     a choice, per sequence, of which version is "the warning". 2^250 readings exist.
  the verdict   observed / stated over the chosen versions, with a 95 % interval from 2,000
                resamplings of sequences (seed 20261018). "too high" if the interval lies under 1,
                "too low" if over 1, otherwise "cannot be told from right" (the Field's words).
  named readers first for all; a day later for all; the harshest and the kindest reader (the
                readings that minimise and maximise the ratio, found exactly by Dinkelbach's
                method, since the ratio is a sum over sequences divided by a sum); and the blind
                reader, who tosses a coin per sequence before seeing what came (2,000 of them for
                the ratio; 200 more, each judged against 1,000 of the resamplings, for the verdict).
  sighted       a reading is sighted if the choice of a sequence's version depends on its outcome.
                The harshest and kindest readers are sighted by construction; the three others
                are declared before the outcome.
  versions      how many versions each forecast had in the agency's catalogue when the Field
                fetched it (forecasts.jsonl, 'nversions'): what the archive keeps, of which the
                score reads two.

Usage: python3 -I plate7.py FIELD_DATA_DIR    (writes plate7.json and plate7.js beside itself)
"""
import json, sys, hashlib, random, collections, datetime as dt
from pathlib import Path

HERE = Path(__file__).parent
D = Path(sys.argv[1])
COMMIT = "456488e7a75c35ae700ce05e1211c1c3ced0b76a"
SHA = {"cells.tsv": "3977693f0a627853cf6ff2f7a77cc9057766138329e75b14c9acd3d0f7b48a9e",
       "updates_cells.tsv": "25b5c26d3dc00c4d9d224ef3ddb674568cb2abdf39e85db345c2692e8ae51d1b",
       "forecasts.jsonl": "82c8d09019cd9cfec2696e7fdc17231020d502baba67cf3e208425b733e861e5",
       "results_23.json": "89bb4f7a445f754b063440f53ef9f04698269160035469ed9e186b5d66eb92af"}
for f, h in SHA.items():
    assert hashlib.sha256((D / f).read_bytes()).hexdigest() == h, f + " is not the Field's file at 456488e"

def tsv(f):
    rows = [l.rstrip("\n").split("\t") for l in open(D / f)]
    return [dict(zip(rows[0], r)) for r in rows[1:]]

U = collections.defaultdict(lambda: [0, 0.0]); LAG = {}
for c in tsv("updates_cells.tsv"):
    U[c["id"]][0] += int(c["hit"]); U[c["id"]][1] += float(c["p"]); LAG[c["id"]] = float(c["lag_h"])
ids = sorted(U)
F = collections.defaultdict(lambda: [0, 0.0])
for c in tsv("cells.tsv"):
    if c["win"] == "1 Week" and float(c["M"]) >= float(c["Mcat"]) - 1e-9 and c["id"] in U:
        F[c["id"]][0] += int(c["hit"]); F[c["id"]][1] += float(c["p"])
META = {}
for l in open(D / "forecasts.jsonl"):
    r = json.loads(l)
    if r["id"] in U:
        META[r["id"]] = (r["place"], r["mag"], dt.datetime.utcfromtimestamp(r["time"] / 1000).strftime("%Y-%m-%d"), r["nversions"])
assert len(ids) == 250 and all(i in F and i in META for i in ids)

R23 = json.load(open(D / "results_23.json"))
tot = lambda ch: (sum(t[0] for t in ch), sum(t[1] for t in ch))
of, ef = tot([F[i] for i in ids]); ou, eu = tot([U[i] for i in ids])
assert (of, round(ef, 2)) == (R23["first_same_sequences"]["observed"], R23["first_same_sequences"]["expected"])
assert (ou, round(eu, 2)) == (R23["update"]["observed"], R23["update"]["expected"])

def extreme(sign):
    lam = 0.6
    for _ in range(100):
        pick = [0 if sign * (F[i][0] - lam * F[i][1]) >= sign * (U[i][0] - lam * U[i][1]) else 1 for i in ids]
        o, e = tot([(F, U)[k][i] for k, i in zip(pick, ids)])
        if abs(o / e - lam) < 1e-12: break
        lam = o / e
    return pick

rng = random.Random(20261018)
BOOT = [[rng.randrange(250) for _ in ids] for _ in range(2000)]
q = lambda v, a: v[int(a * (len(v) - 1))]

def verdict(pick):
    return verdict_n(pick, len(BOOT))

def verdict_n(pick, nb):
    S = [(F, U)[k][i] for k, i in zip(pick, ids)]
    o, e = tot(S)
    rs = sorted(sum(S[j][0] for j in b) / sum(S[j][1] for j in b) for b in BOOT[:nb])
    lo, hi = q(rs, .025), q(rs, .975)
    word = "too high" if hi < 1 else "too low" if lo > 1 else "cannot be told from right"
    return {"observed": o, "stated": round(e, 2), "ratio": round(o / e, 3), "ci": [round(lo, 3), round(hi, 3)],
            "verdict": word, "versions_a_day_later": sum(pick)}

readers = {"first": [0] * 250, "later": [1] * 250, "harshest": extreme(-1), "kindest": extreme(1)}
out = {"source": {"repo": "frankbueltge/field-research", "commit": COMMIT,
                  "path": "artifacts/2026-10-17-the-odds-written-down/data/", "sha256": SHA},
       "sequences": 250, "readings_possible": "2^250",
       "readers": {k: {**verdict(v), "sighted": k in ("harshest", "kindest")} for k, v in readers.items()}}
blind = []
for _ in range(2000):
    pick = [rng.randrange(2) for _ in ids]
    o, e = tot([(F, U)[k][i] for k, i in zip(pick, ids)]); blind.append(o / e)
blind.sort()
out["blind"] = {"readers": 2000, "ratio_median": round(q(blind, .5), 3), "ratio_95": [round(q(blind, .025), 3), round(q(blind, .975), 3)]}
# the verdict of the first 200 further coin readers, each against 1,000 of the same resamplings
vs = collections.Counter(verdict_n([rng.randrange(2) for _ in ids], 1000)["verdict"] for _ in range(200))
out["blind"]["verdicts_of_200"] = dict(vs)
nv = sorted(META[i][3] for i in ids)
out["versions"] = {"median": nv[125], "min": nv[0], "max": nv[-1], "total": sum(nv), "read_by_the_score": 500}
out["outcomes_differ"] = sum(1 for i in ids if F[i][0] != U[i][0])
out["no_aftershock_in_either_week"] = sum(1 for i in ids if F[i][0] == 0 and U[i][0] == 0)
out["lag_h"] = {"median": sorted(LAG.values())[125], "min": min(LAG.values()), "max": max(LAG.values())}

rows = [[i, META[i][0], META[i][1], META[i][2], META[i][3], F[i][0], round(F[i][1], 4), U[i][0], round(U[i][1], 4),
         round(LAG[i], 1), readers["harshest"][n], readers["kindest"][n]] for n, i in enumerate(ids)]
(HERE / "plate7.json").write_text(json.dumps(out, indent=1) + "\n")
(HERE / "plate7.js").write_text("// generated by plate7.py from the Field's study 23 (USGS aftershock forecasts and ComCat)\n"
                                "const P7=" + json.dumps(out) + ";\nconst P7R=" + json.dumps(rows, ensure_ascii=False) + ";\n")
print(json.dumps(out, indent=1))
