"""Answerable To — build and check.

Reads the Field's study 65 (results65.json, field-research @ bb56805, sha256 asserted) and this work's
votes.json (the owners' own proxy statements, read 2026-11-08), writes data.js for the page and
results.json, and asserts every figure the page and the bulletin state.
Run from this folder:  python3 build.py <path to results65.json>
"""
import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
SHA = "0edf831d0cbfc2e9e0d32a60241e9b2d7f6d12f6ab71af0fe680082d529beb86"
UNIT = 10_000  # one square = 10,000 H100-equivalents
Q = "2025-12-31"  # the last finished quarter (the Field's correction: 2026-03-31 is unfinished)

src = Path(sys.argv[1])
assert hashlib.sha256(src.read_bytes()).hexdigest() == SHA, "not the Field's file this was built on"
r65 = json.loads(src.read_text())
votes = json.loads((HERE / "votes.json").read_text())["owners"]

finished = [q for q in r65["quarters"] if not q["incomplete"]]
assert len(finished) == 16 and finished[-1]["q"] == Q and finished[0]["q"] == "2022-03-31"
last = finished[-1]
T = last["total"]
H = last["owner_h100e"]
assert set(H) == set(votes), (set(H), set(votes))
assert T == sum(H.values()) == 20_926_382


def pct(names):
    return round(100 * sum(H[n] for n in names) / T, 2)


founders = ["Google", "Meta", "CoreWeave"]
dispersed = ["Microsoft", "Amazon"]
notable = ["xAI", "China", "China (smuggled)", "Other"]
law = ["China", "China (smuggled)"]

# a majority of the vote held by at most three named people
for o in founders:
    assert sum(p for _, p in votes[o]["held"]) > 50, o
assert sum(p for _, p in votes["Oracle"]["held"]) < 50
for o in dispersed:
    assert max(p for _, p in votes[o]["held"]) < 10, o
for o in notable:
    assert not votes[o]["table"]

fig = {
    "founder_majority": pct(founders),
    "oracle": pct(["Oracle"]),
    "dispersed": pct(dispersed),
    "no_table": pct(notable),
    "law_written": pct(law),
    "other": pct(["Other"]),
    # the vote over the counted stock read as if divided like each owner's vote: share held by named people
    "named_vote": round(sum(100 * H[o] / T * sum(p for _, p in votes[o]["held"]) / 100
                            for o in founders + ["Oracle"]), 2),
    "named_people": sum(len(votes[o]["held"]) for o in founders + ["Oracle"]),
}
assert fig["founder_majority"] == 39.11, fig
assert fig["oracle"] == 5.47 and fig["dispersed"] == 28.03 and fig["no_table"] == 27.4, fig
assert round(fig["founder_majority"] + fig["oracle"] + fig["dispersed"] + fig["no_table"], 2) == 100.01  # rounding
assert fig["law_written"] == 8.68 and fig["other"] == 16.07
assert fig["named_vote"] == 24.48 and fig["named_people"] == 7, fig

# the cluster list: public owners exist there, not in the owner column
cl = r65["clusters"]
assert cl["public"] == 10.7 and cl["mixed"] == 3.5 and cl["n"] == 459
marks = {m["n"]: m for m in r65["cluster_marks"]}
colossus = marks["xAI Colossus Memphis Phase 3"]["h"]
assert colossus == 275796
EL_CAPITAN = 44143  # Lawrence Livermore NL El Capitan Phase 2, US Department of Energy, sector Public (Field's gpu_clusters.json)
fig["colossus"], fig["el_capitan"] = colossus, EL_CAPITAN
fig["colossus_over_el_capitan"] = round(colossus / EL_CAPITAN, 1)
fig["clusters_public"] = cl["public"]
assert fig["colossus_over_el_capitan"] == 6.2
fig["shared_owner_marks"] = sorted(m["n"] for m in r65["cluster_marks"] if "OpenAI" in m["o"])
assert len(fig["shared_owner_marks"]) == 3

squares = {o: round(h / UNIT) for o, h in H.items()}
assert sum(squares.values()) == 2092, sum(squares.values())

data = {
    "unit": UNIT,
    "quarter": Q,
    "total": T,
    "quarters": [{"q": q["q"], "total": q["total"], "h": q["owner_h100e"]} for q in finished],
    "votes": votes,
    "fig": fig,
}
(HERE / "data.js").write_text("window.ANSWERABLE = " + json.dumps(data, ensure_ascii=False) + ";\n")
(HERE / "results.json").write_text(json.dumps({"quarter": Q, "total_h100e": T, "squares": squares, **fig},
                                              indent=1, ensure_ascii=False) + "\n")
print(json.dumps(fig, indent=1))
