#!/usr/bin/env python3
"""Study 73 (session 271, 2026-11-14): the check of studies 71 and 72.

1. A second, independent coding of all 28 acts from their records (check73/second-coding.json), made by a
   convened coder who saw the codebook (check73/CODEBOOK.md) and the items (check73/items.json: id, date,
   body, a neutral subject, the record URLs), never the first coding. Agreement is reported per field;
   every disagreement is adjudicated against the record's own words, and the adjudication is stated.
2. The corrections that follow, applied to a copy of the register (results72.json is never rewritten).
3. Matters and ages (the Atelier's question of 2026-11-13): acts of one exchange counted once, and the age
   on the day read of every stop that stands.
4. The weakest claim chased: an act on the ground of AI's capability or control, sought where it would be.
5. The Studio's question of 2026-11-13: what the stopped parties of the four standing stops planned.
Writes results73.json and data73.js. Standard library only.
"""
import json, hashlib, datetime, os, collections

HERE = os.path.dirname(os.path.abspath(__file__))
R72 = json.load(open(os.path.join(HERE, "results72.json")))
SECOND = {x["id"]: x for x in json.load(open(os.path.join(HERE, "check73", "second-coding.json")))}
DAY = datetime.date(2026, 11, 14)

def sha(p):
    return hashlib.sha256(open(p, "rb").read()).hexdigest()

# The register's hash, so this check names exactly what it checked.
R72_SHA = sha(os.path.join(HERE, "results72.json"))

# ---- 1. agreement -------------------------------------------------------------------------------------
# p4: the coder could not open either record (both answered 403) and coded from the press; it is left out
# of every comparison, because the check asks for a coding from the source.
NOT_FROM_SOURCE = {"p4": "both records answered 403 to the second coder, who coded from press reports"}

GROUND_MAP = {"procedure": "procedure (outside the fixed codes)",
              'air (or "water or air" for an air permit)': "water or air",
              "competition / consumer protection": "competition"}

def core_grounds(gs):
    out = set()
    for g in gs:
        g = GROUND_MAP.get(g, g)
        if g.startswith("other:") or g == "?":
            continue
        out.add(g)
    return out

def size_kind(a):
    return a["size"]["kind"] if a.get("size") else "none"

FIELDS = ["point", "effect", "form", "level", "kind", "terr", "grounds", "named", "size", "after"]

def first_value(a, f):
    if f == "grounds": return core_grounds(a["grounds"])
    if f == "named": return bool(a["named"])
    if f == "size": return size_kind(a)
    if f == "after": return a["after"]["state"]
    return a[f]

def second_value(s, f):
    v = s.get(f)
    if f == "grounds": return core_grounds(v)
    if f == "named": return None if v == "?" else bool(v)
    if v == "?": return None
    return v

def kappa(pairs):
    n = len(pairs)
    po = sum(a == b for a, b in pairs) / n
    ca, cb = collections.Counter(a for a, _ in pairs), collections.Counter(b for _, b in pairs)
    pe = sum(ca[k] * cb[k] for k in set(ca) | set(cb)) / (n * n)
    return None if pe == 1 else round((po - pe) / (1 - pe), 2)

agreement, disagreements = {}, []
for f in FIELDS:
    pairs, skipped = [], []
    for a in R72["acts"]:
        if a["id"] in NOT_FROM_SOURCE:
            continue
        s = SECOND[a["id"]]
        v1, v2 = first_value(a, f), second_value(s, f)
        if v2 is None or (f == "grounds" and not v2) or (f == "after" and v2 == "unknown"):
            skipped.append(a["id"]); continue
        pairs.append((json.dumps(sorted(v1)) if f == "grounds" else v1,
                      json.dumps(sorted(v2)) if f == "grounds" else v2))
        if pairs[-1][0] != pairs[-1][1]:
            disagreements.append({"id": a["id"], "field": f,
                                  "first": sorted(v1) if f == "grounds" else v1,
                                  "second": sorted(v2) if f == "grounds" else v2})
    agree = sum(x == y for x, y in pairs)
    agreement[f] = {"compared": len(pairs), "agree": agree,
                    "kappa": kappa(pairs) if f in ("effect", "after", "kind", "size") else None,
                    "not_compared": skipped}

# Where the second coder found no later record: "stands" on the first coding often meant "no later record
# read" (the Atelier's point), and the check says how often.
stands_unconfirmed = [a["id"] for a in R72["acts"] if a["after"]["state"] == "stands"
                      and a["id"] not in NOT_FROM_SOURCE and SECOND[a["id"]]["after"] == "unknown"]
stands_first = [a["id"] for a in R72["acts"] if a["after"]["state"] == "stands" and a["id"] not in NOT_FROM_SOURCE]

# ---- adjudication: each disagreement read against the record's own words --------------------------------
ADJ = {
 ("m1", "effect"): ("second", "The order calls itself a provisional limitation ('limitazione provvisoria'); the fixed definition puts a suspension that is temporary or later lifted under delayed."),
 ("m5", "effect"): ("second", "The measure runs 'until further decision of this authority' ('até ulterior decisão'): a suspension, later lifted, so delayed by the fixed definition."),
 ("m7", "effect"): ("second", "The ministry's own word is a temporary cut ('pemutusan akses sementara'): delayed by the fixed definition."),
 ("s4", "effect"): ("first, flagged", "The record read (the minister's answer) states only that the instruction rule entered into force; its effect is in the rule itself, not read. The first coding (stopped outside designated sites) comes from the limit the answer names; the second from a secondary description. Left as coded and marked: the rule's text is owed to the paper."),
 ("c3", "grounds"): ("first, flagged", "The filing states the requirement, not its reason; the first coding gave the ground of the rules it applies and said so on the act. The second coder left it open, which is the stricter reading."),
 ("c4", "grounds"): ("first, flagged", "As for c3."),
 ("c6", "grounds"): ("first, flagged", "As for c3."),
 ("p1", "grounds"): ("second", "The passage the order rests on is procedural: the grid operator 'has not demonstrated' that the non-conforming terms are necessary. Recoded: procedure first, power or grid second."),
 ("p1", "named"): ("first", "Amazon Energy LLC appears once, as one of about thirty commenters; it is not a party to the agreement acted on. Definition sharpened: 'names' means names as the party acted on or the project's owner."),
 ("c3", "size"): ("first", "The filing states the $4.5 billion charge the requirement caused."),
 ("c4", "size"): ("first", "The 15 % the officials expect is a share, not the size of what was met; what passed is reported after the act ($60 million) and stays under afterwards."),
 ("m5", "size"): ("first", "The money in the vote is a daily fine for non-compliance, not the size of what was met."),
 ("s4", "size"): ("first", "A floor-area threshold in a rule is not a size met; the first coding already lists it as a threshold."),
 ("m1", "grounds"): ("second", "Read again on 2026-11-14 in the order itself: it rests also on the finding that the processing is inaccurate because the information ChatGPT gives does not always match the real data ('le informazioni fornite da ChatGPT non sempre corrispondono al dato reale'). What a model outputs was a ground from the first act at the model point, March 2023, not only since December 2025."),
 ("m2", "grounds"): ("first, flagged", "The second coder read the press release of 2023-04-12, not the order of 11 April, for this ground; not confirmed in the order this session."),
 ("m8", "grounds"): ("second", "The authority acted under consumer protection (unfair commercial practices); recoded: consumer protection beside the model's output."),
 ("s1", "grounds"): ("both partial", "Both codings name water; the codings differ only in a second reason. No count changes."),
 ("s7", "grounds"): ("both partial", "Both name land, noise or the neighbourhood; the second coder lists the ordinance's further reasons. No count that the page states changes."),
 ("s8", "grounds"): ("first, flagged", "The moratorium's own reason is time to write zoning rules, which the second coder calls procedure; the first coding's land use is the subject of those rules. Flagged."),
 ("s10", "grounds"): ("first", "Renewable fuel for backup generators is a condition the body set, not a ground it states."),
 ("s2", "size"): ("first", "The county page states the study area of 2,139 acres in the passage quoted on the act."),
 ("m2", "after"): ("first", "The limitation was lifted once the terms were met; the act that set the terms is the one coded, and it stands as met."),
}

corrections = []
for d in disagreements:
    rule = ADJ.get((d["id"], d["field"]))
    d["kept"], d["why"] = (rule if rule else ("unresolved", "No adjudication written."))
    if d["kept"] == "second":
        corrections.append({"id": d["id"], "field": d["field"], "from": d["first"], "to": d["second"], "why": d["why"]})

# Disagreements on grounds that only add an 'other:' reason are not counted (core_grounds drops them),
# but they are listed, because they show reasons the fixed vocabulary has no word for.
other_grounds = {i: [g for g in s["grounds"] if g.startswith("other:")] for i, s in SECOND.items()
                 if i not in NOT_FROM_SOURCE and any(g.startswith("other:") for g in s["grounds"])}

# ---- 2. the corrected register --------------------------------------------------------------------------
acts = json.loads(json.dumps(R72["acts"]))
by_id = {a["id"]: a for a in acts}
for c in corrections:
    a = by_id[c["id"]]
    if c["field"] == "effect":
        a["effect"] = c["to"]
    elif c["field"] == "grounds" and c["id"] == "p1":
        a["grounds"] = ["procedure (outside the fixed codes)", "power or grid"]
    elif c["field"] == "grounds" and c["id"] == "m1":
        a["grounds"] = ["personal data", "the model's output"]
    elif c["field"] == "grounds" and c["id"] == "m8":
        a["grounds"] = ["the model's output", "consumer protection"]
    a.setdefault("corrected", []).append({"date": "2026-11-14", "field": c["field"], "why": c["why"]})
for d in disagreements:
    if d["kept"] == "first, flagged":
        by_id[d["id"]].setdefault("flag", []).append(d["why"])

stopped = [a for a in acts if a["effect"] == "stopped"]
stopped_after = collections.Counter(a["after"]["state"] for a in stopped)
assert len(stopped) == 11, len(stopped)
assert stopped_after["stands"] == 4

# The headline claims, re-read on the second coding: no act on the ground of AI risk in either coding.
ai_risk_second = [i for i, s in SECOND.items() if any("AI risk" in g for g in s["grounds"])]
assert ai_risk_second == []
ai_risk_first = [a["id"] for a in acts if "AI risk" in a["grounds"]]
assert ai_risk_first == []
model_output = [a["id"] for a in acts if "the model's output" in a["grounds"]]
assert model_output == ["m1", "m7", "m8"], model_output
chips_second = [i for i, s in SECOND.items() if s.get("size") == "chips"]
assert chips_second == []

# ---- 3. matters and ages (the Atelier's question) -------------------------------------------------------
MATTERS = [
 ("us-chip-rules", "US controls on advanced chips for China", ["c1", "c2", "c5"]),
 ("h20", "One chip maker's China product, H20", ["c3", "c4"]),
 ("h200", "One chip maker's licence for H200", ["c6"]),
 ("tucson", "Project Blue, Tucson", ["s1"]),
 ("pw-gateway", "PW Digital Gateway, Virginia", ["s2"]),
 ("nl-hyperscale", "Hyperscale data centres, the Netherlands", ["s3", "s4"]),
 ("sg-pause", "New data centres, Singapore", ["s5"]),
 ("cerrillos", "Cerrillos data centre, Chile", ["s6"]),
 ("manatee", "Manatee County moratorium", ["s7"]),
 ("worcester", "Worcester County moratorium", ["s8"]),
 ("grange-castle", "Google's third building, Dublin", ["s9", "s10"]),
 ("susquehanna", "Co-located load at Susquehanna", ["p1"]),
 ("ie-connections", "Data-centre grid connections, Ireland", ["p2", "p3"]),
 ("memphis", "Turbines at the Memphis site", ["p4"]),
 ("chatgpt-it", "ChatGPT in Italy", ["m1", "m2"]),
 ("deepseek-it-data", "DeepSeek and personal data, Italy", ["m3"]),
 ("grok-ie", "Grok's training in Ireland", ["m4"]),
 ("meta-br", "Meta's AI training, Brazil", ["m5", "m6"]),
 ("grok-id", "Grok in Indonesia", ["m7"]),
 ("deepseek-it-output", "DeepSeek's hallucination warnings, Italy", ["m8"]),
]
assert sorted(sum((m[2] for m in MATTERS), [])) == sorted(a["id"] for a in acts)

def parse_day(s):
    p = s.split("-")
    return datetime.date(int(p[0]), int(p[1]) if len(p) > 1 else 1, int(p[2]) if len(p) > 2 else 1)

def matter_state(ids):
    ms = [by_id[i] for i in ids]
    last = ms[-1]
    has_hold = any(a["effect"] in ("stopped", "delayed") for a in ms)
    st = last["after"]["state"]
    if st == "stands" and last["effect"] == "stopped": return "stop stands"
    if st == "stands" and last["effect"] == "delayed": return "pause running"
    if st == "stands" and last["effect"] == "conditioned" and has_hold: return "ended on terms"
    if st == "stands" and last["effect"] == "conditioned": return "terms in force"
    if st == "gone around": return "gone around"
    if st == "lifted": return "lifted on terms" if any(a["effect"] == "conditioned" for a in ms) else "lifted"
    return st

matters = []
for slug, name, ids in MATTERS:
    ms = [by_id[i] for i in ids]
    first = min(parse_day(a["date"]) for a in ms)
    state = matter_state(ids)
    m = {"matter": slug, "name": name, "acts": ids, "began": first.isoformat(), "state": state,
         "had_stop": any(a["effect"] == "stopped" for a in ms),
         "had_hold": any(a["effect"] in ("stopped", "delayed") for a in ms)}
    if state in ("stop stands", "pause running", "terms in force", "ended on terms"):
        m["age_days"] = (DAY - first).days
    for a in ms:
        a["matter"] = slug
    matters.append(m)

# Ages of the standing stops, each from the first act of its matter (the Dutch rule from its 2022 pause).
standing = [m for m in matters if m["state"] == "stop stands"]
assert len(standing) == 4
matter_counts = collections.Counter(m["state"] for m in matters)
matters_with_hold = [m for m in matters if m["had_hold"]]

# ---- 4. the weakest claim chased ------------------------------------------------------------------------
CHASE = {
 "claim": "No act rests on the capability or control of AI.",
 "where_sought": "Where such an act would sit: the duties on frontier models now in force (the EU AI Act's obligations on general-purpose models with systemic risk, enforceable by the Commission since 2026-08-02; California SB 53), and China's filing regime for public generative AI services. Study 70 (11-11) found no penalty imposed under the three laws in force.",
 "found": [
  {"id": "x1", "point": "model", "date": "2026-10-14", "body": "European Commission, AI Office",
   "what": "Requests for information to providers of general-purpose AI models, on security, external evaluation and how their models are used; confirmed by the Commission's Executive Vice-President, who names among the risks the Act covers the loss of control of models.",
   "status": "not an act", "why": "a request for information is an inquiry, which the fixed definition leaves out; the Commission names no recipient",
   "quotes": ["Our AI Office has started enforcing these rules, and sent Requests for Information addressing issues such as security, external evaluation and monitoring how models are used.",
              "This includes risks from losing control of models, biological weapons, mass manipulation that could affect elections, and cyberattacks."],
   "url": "https://ec.europa.eu/commission/presscorner/api/files/document/print/en/speech_26_2150/SPEECH_26_2150_EN.pdf",
   "source": "European Commission, speech by Executive Vice-President Virkkunen at the International AI Summit in Dublin, 2026-10-14",
   "sha256": "9f22603377655aea49b9e3c98cfb0c4df8510a0d5a3aab9757ed940aee44d0e2", "bytes": 79185},
  {"id": "x2", "point": "model", "date": "2026-09-14", "body": "Cyberspace Administration of China",
   "what": "A filing regime that conditions every public generative AI service in China: 1,112 services filed and 731 applications registered by 2026-08-31, under the interim measures on generative AI services.",
   "status": "found by the check, in no count yet",
   "why": "a rule that conditions models, missed by the model point's searches; read in a search tool's extract of the body's own page (the page itself reset the connection), not hashed. Its stated purpose is to promote the development and orderly application of the services, not AI risk. The paper decides how it enters",
   "quotes": ["截至8月31日，累计有1112款生成式人工智能服务完成备案，731款生成式人工智能应用或功能完成登记。"],
   "url": "https://www.cac.gov.cn/2026-09/14/c_1791136833136332.htm",
   "source": "Cyberspace Administration of China, notice on filed generative AI services, July to August 2026 (2026-09-14)"},
 ],
 "verdict": "The claim holds as stated and is narrowed: the first step a public body has taken on the ground of a model's capability or control is an inquiry (the AI Office's requests for information since August 2026), and an inquiry is not an act. The register also missed a rule that conditions models at scale (China's filing regime), whose stated ground is not AI risk.",
}
for f in CHASE["found"]:
    if "sha256" in f:
        p = "/tmp/claude-0/-home-user/d7f6772c-ed10-5d6f-bb32-b3de530b47b9/scratchpad/dl/speech.pdf"
        if os.path.exists(p):
            assert sha(p) == f["sha256"]

# ---- 5. the Studio's question: what the stopped parties planned ----------------------------------------
ACRE_SQFT = 43560
PW = [
 {"case": "REZ2022-00032 Digital Gateway North", "applicant": "GW Acquisition Co., LLC and GW Acquisition I, LLC",
  "acres": 534, "far": 0.30, "quote_acres": "“Rezoning”:      ±534 acres",
  "quote_far": "at no greater than an overall 0.30 floor area ratio (“FAR”)",
  "url": "https://www.pwcva.gov/assets/2023-12/REZ2022-00032%20Proffers%20Packet%2020231210.pdf",
  "sha256": "828174185a2cfb76e6ea0b5120708d4883a800d149dc99d1e2f7d8ab3fbc7bc5"},
 {"case": "REZ2022-00033 Digital Gateway South", "applicant": "GW Acquisition Co., LLC and GW Acquisition I, LLC",
  "acres": 342, "far": 0.25, "quote_acres": "“Rezoning”:      ±342 acres",
  "quote_far": "at no greater than an overall 0.25 floor area ratio (“FAR”)",
  "url": "https://www.pwcva.gov/assets/2023-12/REZ2022-00033%20Proffers%20Packet%2020231210.pdf",
  "sha256": "57199edb25e864279593308a4a329e10afed51ef5e0a0128e34b5efaac418935"},
 {"case": "REZ2022-00036 Compass Datacenters Prince William County Campus 1", "applicant": "H&H Acquisitions, LLC and Compass Datacenters",
  "stated_sqft_floor": 11_000_000, "quote": "developing over 11 million square feet of nonresidential development over a 15 to 20-year time period",
  "url": "https://www.pwcva.gov/assets/2023-12/REZ2022-00036%20Proffer%20Response%2020231211.pdf",
  "sha256": "e7f5dd31065c9024b09aa8ae245121eb4b44301e0ef556dd7c3f7f7f1c12c105"},
]
for p in PW:
    if "acres" in p:
        p["ceiling_sqft"] = round(p["acres"] * ACRE_SQFT * p["far"])
pw_total = sum(p.get("ceiling_sqft", 0) for p in PW) + PW[2]["stated_sqft_floor"]
STUDIO_ANSWER = {
 "question": "For the four stops that stand, does a filing of the stopped party state what it planned there (megawatts, chips, floor area)?",
 "s2": {"answer": "Floor area only. The three rezoning applications the court voided state ceilings: two proffers cap floor area at 0.30 and 0.25 of ±534 and ±342 acres (a ceiling, not a plan), and the third applicant writes of over 11 million square feet over 15 to 20 years.",
        "ceiling_sqft_about": pw_total, "megawatts": None, "chips": None, "sources": PW},
 "s4": {"answer": "No party: a rule for a class (new hyperscale data centres), so no stopped party's plan exists to read."},
 "m3": {"answer": "No physical size applies: the order limits the processing of personal data of people in Italy; no record of the two firms states chips or megawatts used for Italy."},
 "m4": {"answer": "No physical size applies: X's undertaking concerns the use of EU and EEA users' posts to train Grok; the regulator's releases state no compute."},
 "summary": "Of the four standing stops, one has a stopped party whose filings state a planned size, and that size is floor area (a ceiling of about 21.7 million square feet across the three applications), not megawatts or chips. A stop that worked cannot be sized in compute from the record, which is the Studio's blank drawn in numbers.",
}
assert round(pw_total / 1e6, 1) == 21.7, pw_total

# ---- output ---------------------------------------------------------------------------------------------
out = {
 "study": 73, "session": 271, "date": "2026-11-14", "cycle": 14, "programme_step": 2,
 "checks": {"register": "results72.json", "sha256": R72_SHA},
 "second_coder": "a convened sub-agent that did not build the work, given the codebook and the items only (check73/)",
 "not_from_source": NOT_FROM_SOURCE,
 "agreement": agreement, "disagreements": disagreements, "corrections": corrections,
 "other_grounds": other_grounds,
 "stands": {"first_coded": stands_first, "second_found_no_later_record": stands_unconfirmed},
 "counts": {"acts": len(acts), "stopped": len(stopped), "stopped_after": dict(stopped_after),
            "delayed": sum(a["effect"] == "delayed" for a in acts),
            "conditioned": sum(a["effect"] == "conditioned" for a in acts),
            "matters": len(matters), "matter_states": dict(matter_counts),
            "matters_with_hold": len(matters_with_hold),
            "ai_risk_first": len(ai_risk_first), "ai_risk_second": len(ai_risk_second),
            "chips_second": len(chips_second), "model_output": model_output},
 "matters": matters, "standing": standing, "chase": CHASE, "studio": STUDIO_ANSWER,
 "acts": acts,
}
json.dump(out, open(os.path.join(HERE, "results73.json"), "w"), indent=1, ensure_ascii=False)
open(os.path.join(HERE, "data73.js"), "w").write("window.DATA73=" + json.dumps(out, ensure_ascii=False) + ";\n")
print(json.dumps({k: out["counts"][k] for k in out["counts"]}, ensure_ascii=False))
print({f: (v["agree"], v["compared"], v["kappa"]) for f, v in agreement.items()})
for d in disagreements: print(d["id"], d["field"], d["first"], "|", d["second"], "->", d["kept"])
print("stands unconfirmed:", stands_unconfirmed, "of", len(stands_first))
for m in standing: print(m["name"], m["began"], m["age_days"])
