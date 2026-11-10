"""Answerable To — build and check.

Reads the Field's study 65 (results65.json, field-research @ bb56805, sha256 asserted), from state 2 the
Field's study 66 (data/agreements66.json, field-research @ 1ac8d8a, sha256 asserted: the record of use) and
this work's votes.json (the owners' own proxy statements, read 2026-11-08), writes data.js for the page and
results.json, and asserts every figure the page and the bulletin state.
From state 3 also the Field's study 67 (data/control67.json, field-research @ 759d15f, sha256 asserted: who can end,
restrict or suspend each agreement) and three developers' own reports that they built a frontier model on chips they hold.
From state 4 also the Field's study 68 (results68.json, field-research @ 2a17974, sha256 asserted: whether any filing divides
a holder's chips between its own models and the rest).
Run from this folder:  python3 build.py <results65.json> <agreements66.json> <control67.json> <results68.json>
"""
import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).parent
SHA = "0edf831d0cbfc2e9e0d32a60241e9b2d7f6d12f6ab71af0fe680082d529beb86"
UNIT = 10_000  # one square = 10,000 H100-equivalents
Q = "2025-12-31"  # the last finished quarter (the Field's correction: 2026-03-31 is unfinished)

SHA66 = "c10faa1c8dc765869b47057219aa5a34dbc5f42ed6e9abb03aa330d0743afaa3"
src = Path(sys.argv[1])
src66 = Path(sys.argv[2])
src67 = Path(sys.argv[3])
SHA67 = "8114a6cd4cd00ca4827d8551ea3f7e5ca5749d78c6e1e40c67cd208604c8c318"
assert hashlib.sha256(src67.read_bytes()).hexdigest() == SHA67, "not the Field's study 67 file"
assert hashlib.sha256(src66.read_bytes()).hexdigest() == SHA66, "not the Field's study 66 file"
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

# state 2 — the record of use (the Field's study 66): first-hand agreements only
a66 = [r for r in json.loads(src66.read_text())["rows"] if r["grade"] == "first"]
assert len(a66) == 19
uses = {}  # owner row -> users that name it as provider in a first-hand agreement
for r in a66:
    if r["provider"] in H:
        uses.setdefault(r["provider"], []).append([r["user"], r["id"]])
assert sorted(uses) == ["Amazon", "CoreWeave", "Google", "Microsoft", "Oracle", "xAI"], sorted(uses)
assert sum(len(v) for v in uses.values()) == 14  # the Field's "joined by name: 14 of 19"
outside = sorted({r["provider"] for r in a66 if r["provider"] not in H})
assert outside == ["Cerebras", "Fluidstack", "NVIDIA (operator not named)", "Nebius"], outside
filed = [r["id"] for r in a66 if "sec.gov" in r["url"]]
assert filed == ["A03", "A04", "A05", "A16", "A17"]
assert {r["provider"] for r in a66 if r["id"] in filed} == {"CoreWeave"}
with_chips = [r["id"] for r in a66 if r["chips"]]
assert with_chips == ["A10", "A12", "A15"]
users_own = {u: H.get(u, 0) for u in ["OpenAI", "Anthropic"]}
assert users_own == {"OpenAI": 0, "Anthropic": 0}
fig["uses"] = uses
fig["use_named"] = pct(sorted(uses))
fig["use_outside"] = outside
fig["use_filed"] = filed
fig["use_with_chips"] = with_chips
fig["use_n"] = len(a66)
assert fig["use_named"] == 64.25, fig["use_named"]

# the visitor's reading: how much of the counted stock each answer to "by whom" can name in the record
named_holders = ["Google", "Microsoft", "Amazon", "Meta", "Oracle", "CoreWeave", "xAI"]
fig["reach"] = {
    "holders": pct(named_holders),
    "voters": pct(founders + ["Oracle"] + dispersed),
    "users": fig["use_named"],
    "public": 0,
}
assert fig["reach"] == {"holders": 75.25, "voters": 72.6, "users": 64.25, "public": 0}, fig["reach"]
fig["reach_sets"] = {"holders": named_holders, "voters": founders + ["Oracle"] + dispersed,
                     "users": sorted(uses), "public": []}

# state 3 — (A) the trend in fixed text: the five named firms' share of the counted stock, every finished quarter
FIVE = ["Google", "Microsoft", "Amazon", "Meta", "Oracle"]
trend = [[q["q"], round(100 * sum(q["owner_h100e"].get(o, 0) for o in FIVE) / q["total"], 1),
          round(q["total"] / 1e6, 2)] for q in finished]
fig["five_trend"] = trend
assert trend[0][1] == 56.6 and trend[-1][1] == 68.6, (trend[0], trend[-1])
fig["growth"] = round(finished[-1]["total"] / finished[0]["total"])
assert fig["growth"] == 334, fig["growth"]

# state 3 — (B) use is not only renting: holders that build frontier models on chips they hold, by their own reports
SELF = {
    "Google": ["Gemini", "https://arxiv.org/abs/2312.11805",
               "Training Gemini Ultra used a large fleet of TPUv4 accelerators owned by Google across multiple datacenters"],
    "Meta": ["Llama 3", "https://arxiv.org/abs/2407.21783",
             "As we scaled further, the training for Llama 3 was migrated to Meta's production clusters"],
    "xAI": ["Grok 3", "https://x.ai/news/grok-3", "Trained on our Colossus supercluster"],
}
assert set(SELF) <= set(H)
fig["self_use"] = SELF
fig["providers_hold"] = fig["use_named"]  # the named providers hold 64.3 %
users_any = sorted(set(uses) | set(SELF))
fig["reach_sets"]["users"] = users_any
fig["reach"]["users"] = pct(users_any)
assert fig["reach"]["users"] == 75.25 == fig["reach"]["holders"]  # every named holder is a user somewhere in the record
fig["self_only"] = pct(["Meta"])  # held by a firm that builds on it, named by no renter in a first-hand agreement
assert "Meta" not in uses

# state 3 — (C) a public in this record: not an owner; it shows as law
fig["law_written"] = pct(["China (smuggled)"])  # only "smuggled" is a category a law wrote; "China" is a country bucket
assert fig["law_written"] == 3.16, fig["law_written"]
fig["china_bucket"] = pct(["China"])
c67 = {r["id"]: r for r in json.loads(src67.read_text())["rows"]}
assert sorted(c67) == sorted(r["id"] for r in a66)
ends = {i: r["end"] for i, r in c67.items() if r["end"]}
assert ends == {"A03": "user", "A05": "either", "A15": "either", "A16": "either", "A18": "user"}, ends
levers = sorted(i for i, r in c67.items() if r["state_lever"])
assert levers == ["A05", "A16"]
by_id = {r["id"]: r for r in a66}
assert {by_id[i]["provider"] for i in levers} == {"CoreWeave"}
fig["ctrl_n"] = len(c67)
fig["ctrl_silent"] = sum(1 for r in c67.values() if not r["end"] and not r["use_restriction"] and not r["state_lever"] and not r["exclusivity"])
fig["ctrl_ends"] = ends
fig["ctrl_levers"] = levers
fig["ctrl_lever_text"] = {i: c67[i]["state_lever"] for i in levers}
fig["ctrl_provider_end"] = sum(1 for v in ends.values() if v == "provider")
assert fig["ctrl_provider_end"] == 0
# whom the visitor may now also choose: a court or regulator. The record names one for the smuggled stock (a law forbids
# it) and for CoreWeave's chips (both contracts filed in full let an order suspend the use). Nothing else.
fig["reach_sets"]["law"] = ["CoreWeave", "China (smuggled)"]
fig["reach"]["law"] = pct(fig["reach_sets"]["law"])
assert fig["reach"]["law"] == 7.14, fig["reach"]["law"]
assert fig["ctrl_silent"] == 13 and fig["self_only"] == 11.0 and fig["china_bucket"] == 5.52

# state 4 — inside the firm: compute a holder keeps for its own models is allocated by its own decision, through no
# contract, so no clause a law could appear in; and no filing gives that share a number (the Field's study 68)
src68 = Path(sys.argv[4])
SHA68 = "ca5dffac0d92acbac73972b6b03391b1645b63dc05ae29a0108faa64b3aaca92"
assert hashlib.sha256(src68.read_bytes()).hexdigest() == SHA68, "not the Field's study 68 file"
r68 = json.loads(src68.read_text())
assert r68["missing"] == 0 and all(p["found"] for p in r68["passages"])
assert all(v == [] for v in r68["numbers_for_own_models"].values()) and len(r68["numbers_for_own_models"]) == 3
assert all(p["held"] for p in r68["predictions"]) and len(r68["predictions"]) == 4
REALLOC = "This structure allows us to monetize unused compute capacity in our infrastructure, while still permitting reallocation of the capacity for our own internal initiatives if needed in the future."
assert any(p["quote"] == REALLOC and p["kind"] == "lever" for p in r68["passages"])
fig["inside"] = sorted(SELF)
fig["inside_pct"] = pct(sorted(SELF))
assert fig["inside_pct"] == 37.78, fig["inside_pct"]
fig["own_numbers_docs"] = len(r68["numbers_for_own_models"])
fig["xai_keeps_max"] = r68["xai_bound"]["xai_keeps_at_most_share_of_power"]
assert fig["xai_keeps_max"] == 0.7
fig["realloc"] = REALLOC
# neither edge of the market where law shows (a border, a traded right) covers a holder's own use
assert not set(fig["reach_sets"]["law"]) & set(SELF)

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
