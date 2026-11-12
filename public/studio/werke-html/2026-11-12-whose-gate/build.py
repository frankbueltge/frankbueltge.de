#!/usr/bin/env python3
"""WHOSE GATE — build data.js from the Field's records.

Usage (repo root):  python3 -I works/2026-11-12-whose-gate/build.py [results65.json [results70.json]]
Without paths the Field's two files are fetched from its repository at the pinned commits.
State 1 (2026-11-12): the Field's finding of step 2 is not published yet. The stream is its
chip-owner record of step 1 (study 65); the posts and stakes are its record of the laws in force
and their uses (study 70, made in the convening). Three of the five gates the step's question
names have not been read by the Field and stand unread.
Every count the page states is asserted here; a failed assertion writes nothing.
"""
import hashlib, json, sys, urllib.request, pathlib

HERE = pathlib.Path(__file__).resolve().parent
RAW = "https://raw.githubusercontent.com/frankbueltge/field-research/"
F65 = ("bb56805c92435b909eb97fc1a9864cc17dd9c6a7",
       "artifacts/cycle-013/who-holds-the-compute/results65.json",
       "0edf831d0cbfc2e9e0d32a60241e9b2d7f6d12f6ab71af0fe680082d529beb86")
F70 = ("03cb2c2fe7e37a20b9064dae20a355dcb97fec7e",
       "artifacts/after-cycle-013/what-reaches-the-kept-share/results70.json",
       "37bc61f51b3bf80885108f3f415d14c8ef22d9c1cc5f01a2cddd4216ff4871ba")
GRAIN = 10_000          # one grain is ten thousand H100-equivalents


def load(spec, arg):
    commit, path, sha = spec
    raw = pathlib.Path(sys.argv[arg]).read_bytes() if len(sys.argv) > arg else \
        urllib.request.urlopen(RAW + commit + "/" + path).read()
    assert hashlib.sha256(raw).hexdigest() == sha, "the Field's file is not the pinned one: " + path
    return json.loads(raw)


R65, R70 = load(F65, 1), load(F70, 2)

# --- the stream: every finished quarter of the chip-owner record ------------------------------
quarters, prev_all, prev_sm = [], 0, 0
for q in R65["quarters"]:
    if q["incomplete"]:
        assert q["q"] == "2026-03-31" and q["rows"] == 8
        continue
    smug = q["total"] - q["total_ex_smuggled"]
    g_all, g_sm = round(q["total"] / GRAIN), round(smug / GRAIN)
    assert g_all >= prev_all and g_sm >= prev_sm, q["q"]
    quarters.append({"q": q["q"], "total": q["total"], "smuggled": smug,
                     "grains": g_all - prev_all, "smuggled_grains": g_sm - prev_sm})
    prev_all, prev_sm = g_all, g_sm
assert len(quarters) == 16 and quarters[0]["q"] == "2022-03-31" and quarters[-1]["q"] == "2025-12-31"
assert quarters[-1]["total"] == 20926382 and quarters[0]["total"] == 62699
assert round(quarters[-1]["total"] / quarters[0]["total"]) == 334
assert quarters[-1]["smuggled"] == round(R65["smuggled_q4_2025"]["median"]) == 662048
assert sum(q["grains"] for q in quarters) == 2093 and quarters[0]["grains"] == 6
assert sum(q["smuggled_grains"] for q in quarters) == 66
first_smuggled = next(q["q"] for q in quarters if q["smuggled"])
assert first_smuggled == "2024-03-31"
sm = R65["smuggled_q4_2025"]
smug_range = [round(sm["p5"] / GRAIN), round(sm["p95"] / GRAIN)]
assert smug_range == [29, 159]

# --- the gates: the five points the step's question names -------------------------------------
GATES = [
    {"id": "border", "name": "export licence", "at": "the border"},
    {"id": "ground", "name": "building permit", "at": "the ground"},
    {"id": "power", "name": "grid connection", "at": "the power"},
    {"id": "deal", "name": "merger or contract review", "at": "the deal"},
    {"id": "model", "name": "duty on the model", "at": "the model"},
]
# Where each law the Field read stands on the passage: this work's reading of the Field's laws.
LAW_GATE = {"us-export": "border", "ca-sb53": "model", "eu-ai-act": "model"}
PUBLIC = {"us-export": ("us", "the United States", "federal prosecutors and the export agency"),
          "ca-sb53": ("ca", "California", "its Attorney General"),
          "eu-ai-act": ("eu", "the European Union", "the Commission's AI Office")}
SINCE = {"us-export": "2018-08-13",      # the Export Control Reform Act; the Field: "2018 (the act)"
         "ca-sb53": "2026-01-01",        # second-hand in the Field's record
         "eu-ai-act": "2025-08-02"}      # duties; the power to fine a year later
laws = []
assert sorted(l["id"] for l in R70["laws"]) == sorted(LAW_GATE) and len(R70["laws"]) == 3
for l in R70["laws"]:
    k = l["id"]
    assert l["rungs"]["written"] and l["rungs"]["applicable"] and l["rungs"]["penalty"] is False
    assert l["duties_since"].startswith(SINCE[k][:4])
    laws.append({"id": k, "name": l["name"], "body": l["body"], "gate": LAW_GATE[k],
                 "public": PUBLIC[k][0], "public_name": PUBLIC[k][1], "hand": PUBLIC[k][2],
                 "since": SINCE[k], "note": l["note"],
                 "power_since": l["applicable_since"] if k == "eu-ai-act" else None})
assert next(l for l in laws if l["id"] == "eu-ai-act")["power_since"] == "2026-08-02"

# --- the stakes: every use of those laws the Field's record names ------------------------------
docs = R70["documents"]
stakes = []
for u in R70["uses"]:
    persons = sum(1 for p in u["parties"] if p[1] == "person")
    others = [p for p in u["parties"] if p[1] != "person"]
    d = docs[u["doc"]]
    assert d["sha256"] and d["route"] == "direct", u["id"]
    # people charged are not named on the page; a developer is named as the release names it
    named = [p[0] for p in others if p[1].startswith("developer")]
    stakes.append({"id": u["id"], "law": u["law"], "gate": LAW_GATE[u["law"]],
                   "public": PUBLIC[u["law"]][0], "date": u["date"], "rung": u["rung"],
                   "statute_named": u["statute_named"], "what": u["what"]
                   .replace(" through a small company (ALX Solutions Inc.)", " through a small company")
                   .replace("; the export agency's annual report calls the three Super Micro executives", ""),
                   "persons": persons, "companies": len(others) - len(named), "named": named,
                   "release": d["what"], "url": d["url"]})
C = R70["counts"]
assert len(stakes) == 7
border = [s for s in stakes if s["gate"] == "border"]
model = [s for s in stakes if s["gate"] == "model"]
assert len(border) == 6 and len(model) == 1 and model[0]["rung"] == "inquiry"
assert model[0]["named"] == ["OpenAI"] and model[0]["statute_named"] is False
assert len({s["url"] for s in border}) == C["export_announcements"] == 5
assert sum(s["persons"] for s in border) == C["export_persons"] == 13
assert sum(s["companies"] for s in border) == C["export_companies"] == 1
assert [s["id"] for s in border if s["rung"] == "admitted"] == ["u3"] and C["export_admitted"] == 2
assert C["export_sentences_found"] == 0 and C["export_civil_penalties_on_chips_found"] == 0
assert C["penalties_on_frontier_duty_found"] == 0 and C["parties_that_are_holders"] == []
assert not any(s["public"] == "eu" for s in stakes)
assert min(s["date"] for s in stakes) == "2025-08-05" and max(s["date"] for s in stakes) == "2026-10-01"
# every stake at the border was planted after its chips had left: each release charges an export made
for s in border:
    assert any(w in s["what"] for w in ("exported", "transshipped", "smuggling", "smuggle", "diverted", "sent")), s["id"]
after_count = [s["id"] for s in stakes if s["date"] > quarters[-1]["q"]]
assert after_count == ["u5", "u6", "u7"]

unread = [g["id"] for g in GATES if g["id"] not in LAW_GATE.values()]
assert unread == ["ground", "power", "deal"]

DATA = {
    "state": 1, "date": "2026-11-12", "grain": GRAIN,
    "from": "2022-01-01", "to": "2026-11-12", "counted_to": quarters[-1]["q"],
    "quarters": quarters, "gates": GATES, "laws": laws, "stakes": stakes, "unread": unread,
    "smuggled": {"first": first_smuggled, "grains": 66, "range": smug_range,
                 "h100e": 662048, "p5": round(sm["p5"]), "p95": round(sm["p95"])},
    "counts": {"grains": 2093, "first_quarter_grains": 6, "h100e": 20926382, "fold": 334,
               "stakes": 7, "border_stakes": 6, "announcements": 5, "persons": 13, "companies": 1,
               "admitted": 1, "inquiries": 1, "penalties": 0, "stops": 0, "after_last_count": 3},
    "field": {"study65": RAW.replace("raw.githubusercontent.com", "github.com").rstrip("/") + "/tree/" + F65[0] + "/artifacts/cycle-013/who-holds-the-compute",
              "study70": "https://github.com/frankbueltge/field-research/tree/" + F70[0] + "/artifacts/after-cycle-013/what-reaches-the-kept-share"},
}
(HERE / "data.js").write_text("// built by build.py from the Field's studies 65 and 70; do not edit\nconst DATA = "
                              + json.dumps(DATA, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("ok", len(quarters), "quarters,", DATA["counts"]["grains"], "grains,", len(stakes), "stakes,", len(unread), "gates unread")
