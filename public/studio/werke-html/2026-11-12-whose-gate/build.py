#!/usr/bin/env python3
"""WHOSE GATE — build data.js from the Field's records.

Usage (repo root):  python3 -I works/2026-11-12-whose-gate/build.py [results65.json [results70.json [results72.json]]]
Without paths the Field's two files are fetched from its repository at the pinned commits.
State 1 (2026-11-12): the stream is the Field's chip-owner record of step 1 (study 65); the posts
and stakes are its record of the laws in force and their uses (study 70, made in the convening).
State 2 (2026-11-13): the Field's finding of step 2 (study 72, results72.json): 28 acts of public
bodies on the five points of the chain, each with its effect, its public and its state on
13 November. Each act is drawn at its gate as a bar (stop), a hatched bar (delay) or a ring
(condition); none holds a grain, because no act's record counts the chips it met.
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
F72 = ("b38141f64440763f1bb2dbea24edf6b512546385",
       "artifacts/cycle-014/where-a-public-acted/results72.json",
       "a94d5700bbbf1562c46ff1cae4c1ad40a673796bdc36623fd1aa94e6dd874239")
GRAIN = 10_000          # one grain is ten thousand H100-equivalents


def load(spec, arg):
    commit, path, sha = spec
    raw = pathlib.Path(sys.argv[arg]).read_bytes() if len(sys.argv) > arg else \
        urllib.request.urlopen(RAW + commit + "/" + path).read()
    assert hashlib.sha256(raw).hexdigest() == sha, "the Field's file is not the pinned one: " + path
    return json.loads(raw)


R65, R70, R72 = load(F65, 1), load(F70, 2), load(F72, 3)

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


# --- the acts: the Field's finding of step 2 (study 72) ----------------------------------------
POINT_GATE = {"chip": "border", "site": "ground", "power": "power", "deal": "deal", "model": "model"}
# A public is the country whose body acted; a body below the nation is drawn hollow in its colour.
COUNTRY = {"United States": "us", "Ireland": "ie", "Italy": "it", "Netherlands": "nl", "Brazil": "br",
           "Chile": "cl", "Indonesia": "id", "Singapore": "sg"}
# When each act stopped holding, or was gone around: this work's reading of the Field's notes,
# each date checked against the phrase in the Field's record it rests on. "~" marks a date the
# record gives only as an interval or a year.
ENDS = {
    "c1": ("2023-10-25", "", "October 2023"),
    "c2": ("2026-01-13", "", "since January 2026"),
    "c3": ("2025-08-01", "", "four months later"),
    "s1": ("2025-09-10", "~", "Four to six weeks later"),
    "s3": ("2024-01-01", "", "in force from 2024"),
    "s5": ("2022-07-01", "~", "Ended in 2022"),
    "s6": ("2026-10-01", "~", "October 2026"),
    "p1": ("2025-06-01", "~", "Seven months later"),
    "p2": ("2025-12-12", "", "December 2025"),
    "m1": ("2023-04-28", "~", "four weeks later"),
    "m5": ("2024-09-01", "~", "two months later"),
    "s9": ("2026-09-23", "", "25 months later"),
    "m7": ("2026-01-31", "~", "three weeks later"),
}
def iso(d):
    return d if len(d) == 10 else (d + "-01" if len(d) == 7 else d + "-01-01")
C72, acts = R72["counts"], []
assert R72["study"] in (72, "72") and len(R72["acts"]) == C72["acts"] == 28
for a in R72["acts"]:
    st, note = a["after"]["state"], a["after"]["note"]
    end = ENDS.get(a["id"])
    assert (end is not None) == (st in ("lifted", "superseded", "gone around")), a["id"]
    if end:
        assert end[2] in note, (a["id"], note)
    url = next((q["url"] for q in a["quotes"] if q.get("url")), None)
    acts.append({"id": a["id"], "gate": POINT_GATE[a["point"]], "date": iso(a["date"]), "when": a["date"],
                 "body": a["body"], "country": a["country"], "public": COUNTRY[a["country"]],
                 "local": a["level"] == "sub", "effect": a["effect"], "what": a["what"],
                 "grounds": a["grounds"], "named": a["named"], "state": st, "after": note,
                 "end": end[0] if end else None, "approx": bool(end and end[1]),
                 "size": a["size"]["text"] if a["size"] else None, "second_hand": a["was_second_hand"],
                 "url": url})
for k, v in C72["per_point"].items():
    assert sum(1 for a in acts if a["gate"] == POINT_GATE[k]) == v, k
assert C72["per_point"]["deal"] == 0
for k, g in C72["grid"].items():
    for e, n in g.items():
        assert sum(1 for a in acts if a["gate"] == POINT_GATE[k] and a["effect"] == e) == n, (k, e)
stops = [a for a in acts if a["effect"] == "stopped"]
assert len(stops) == C72["stopped_all"] == 14
from collections import Counter
assert dict(Counter(a["state"] for a in stops)) == C72["stopped_after"] == \
    {"stands": 4, "lifted": 6, "gone around": 3, "superseded": 1}
assert dict(Counter(a["country"] for a in acts)) == C72["by_country"]
assert sorted(a["id"] for a in acts if a["size"]) == sorted(C72["magnitude"]) and len(C72["magnitude"]) == 6
assert C72["ai_risk"] == [] and sorted(C72["model_output"]) == ["m7", "m8"]
# no act's record states the compute it met in chips: so no bar holds a grain
assert all("chip" not in (a["size"] or "").lower() for a in acts)
assert all(a["url"] for a in acts)
first_act = min(a["date"] for a in acts)
assert first_act == "2019-01-01" and sum(1 for a in acts if a["date"] < "2022-01-01") == 2

unread = []   # since state 2 the Field has read all five gates; at the deal it found no act

DATA = {
    "state": 2, "date": "2026-11-13", "grain": GRAIN,
    "from": "2022-01-01", "to": "2026-11-13", "counted_to": quarters[-1]["q"],
    "quarters": quarters, "gates": GATES, "laws": laws, "stakes": stakes, "unread": unread, "acts": acts,
    "smuggled": {"first": first_smuggled, "grains": 66, "range": smug_range,
                 "h100e": 662048, "p5": round(sm["p5"]), "p95": round(sm["p95"])},
    "counts": {"grains": 2093, "first_quarter_grains": 6, "h100e": 20926382, "fold": 334,
               "stakes": 7, "border_stakes": 6, "announcements": 5, "persons": 13, "companies": 1,
               "admitted": 1, "inquiries": 1, "penalties": 0, "after_last_count": 3,
               "acts": 28, "stopped": 14, "delayed": 4, "conditioned": 10, "stops_stand": 4,
               "stops_lifted": 6, "stops_gone_around": 3, "stops_superseded": 1, "sized": 6,
               "sized_in_chips": 0, "deal_acts": 0, "publics": 8},
    "field": {"study65": RAW.replace("raw.githubusercontent.com", "github.com").rstrip("/") + "/tree/" + F65[0] + "/artifacts/cycle-013/who-holds-the-compute",
              "study70": "https://github.com/frankbueltge/field-research/tree/" + F70[0] + "/artifacts/after-cycle-013/what-reaches-the-kept-share",
              "study72": "https://github.com/frankbueltge/field-research/tree/" + F72[0] + "/artifacts/cycle-014/where-a-public-acted"},
}
(HERE / "data.js").write_text("// built by build.py from the Field's studies 65, 70 and 72; do not edit\nconst DATA = "
                              + json.dumps(DATA, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("ok", len(quarters), "quarters,", DATA["counts"]["grains"], "grains,", len(stakes), "stakes,", len(acts), "acts")
