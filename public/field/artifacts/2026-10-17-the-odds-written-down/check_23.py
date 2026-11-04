"""Study 23 checks: a second code path over the stored update outcomes (per sequence, the largest
magnitude inside the window and circle), the 24-hour rule, sums, and a planted M9 that must be caught.
Usage: python3 -I check_23.py"""
import json, sys
from pathlib import Path
D = Path(__file__).parent / "data"
U = {json.loads(l)["id"]: json.loads(l) for l in open(D / "updates.jsonl")}
F = {json.loads(l)["id"]: json.loads(l) for l in open(D / "forecasts.jsonl")}
O = {json.loads(l)["id"]: json.loads(l) for l in open(D / "outcomes_23.jsonl")}
r = json.load(open(D / "results_23.json"))
rows = [l.rstrip("\n").split("\t") for l in open(D / "updates_cells.tsv")]
cells = [dict(zip(rows[0], x)) for x in rows[1:]]
ok = []
def chk(name, cond): ok.append(bool(cond)); print(("PASS " if cond else "FAIL ") + name)

chk("every update issued at least 24 h after its first forecast", all(u["issued"] - F[i]["issued"] >= 86400000 for i, u in U.items()))
chk("every scored update window closed before its outcomes were fetched",
    all([w for w in U[i]["windows"] if w["label"] == "1 Week"][0]["t1"] <= o["fetched"] for i, o in O.items()))
def second(O):
    hits = {}
    for i, o in O.items():
        u = U[i]; w = [w for w in u["windows"] if w["label"] == "1 Week"][0]; mc = u["Mcat"] if u["Mcat"] is not None else 3.0
        mx = max([e[2] for e in o["events"] if e[2] is not None and w["t0"] <= e[1] < w["t1"] and e[4] <= u["rkm"]], default=-9)
        for b in w["bins"]:
            if b["M"] >= mc - 1e-9: hits[(i, b["M"])] = int(round(mx, 2) >= b["M"] - 1e-9)
    return hits
h2 = second(O)
h1 = {(c["id"], float(c["M"])): int(c["hit"]) for c in cells}
chk(f"second path: same cells ({len(h1)}) and the same hit in every one", h1 == h2)
chk("observed and expected recompute", sum(h1.values()) == r["update"]["observed"]
    and abs(sum(float(c["p"]) for c in cells) - r["update"]["expected"]) < 0.01)
chk("paired first forecasts: 47 of 86.33 on the same 250 sequences",
    (r["first_same_sequences"]["observed"], r["first_same_sequences"]["expected"]) == (47, 86.33))
chk("O/E point estimates lie inside their intervals",
    r["update"]["O_over_E_ci"][0] <= r["update"]["O_over_E"] <= r["update"]["O_over_E_ci"][1]
    and r["paired_ratio"]["ci"][0] <= r["paired_ratio"]["point"] <= r["paired_ratio"]["ci"][1])
chk("2,000 paired resamples stored", len(r["paired_ratio"]["resamples"]) == 2000)
i0 = next(i for i in O if not any(v for (j, _), v in h2.items() if j == i))
u = U[i0]; w = [w for w in u["windows"] if w["label"] == "1 Week"][0]
planted = dict(O); planted[i0] = {**O[i0], "events": O[i0]["events"] + [["planted", w["t0"] + 1, 9.0, "mw", 1.0]]}
hp = second(planted)
chk("a planted M9 inside one quiet sequence's window turns all its cells to hits", sum(hp.values()) - sum(h2.values()) == sum(1 for (j, _) in h2 if j == i0) > 0)
print(f"{sum(ok)} of {len(ok)} passed")
sys.exit(0 if all(ok) else 1)
