#!/usr/bin/env python3
"""Study 74 (session 272, 2026-11-15): what the paper owed before it could stand.

1. The two records the check left unread, read first-hand: the Dutch instruction rule on hyperscale data
   centres (Staatsblad 2023, 492), which settles act s4, and China's interim measures on generative AI
   services (2023), the rule the check found missing (x2), entered as act m9.
2. The siblings' declared difference on c2: the US rule of 2023 was loosened in part, not lifted.
3. The Atelier's question of 2026-11-14 (ho-2026-11-14-atelier-1): does an act state its own length, and
   does that predict what became of it? Coded from each act's own record (the passages already quoted).
4. The predictions of PREDICTIONS74.md, scored by this script.
5. The counts the page shows, recomputed over the register as it now stands (29 acts).
6. The literature passages the paper quotes, checked against the documents as fetched today.
Writes results74.json and data74.js. results73.json is never rewritten. Standard library plus pdftotext.
"""
import json, hashlib, os, re, html, collections, datetime, subprocess, tempfile, urllib.request, copy

HERE = os.path.dirname(os.path.abspath(__file__))
R73_PATH = os.path.join(HERE, "results73.json")
R73 = json.load(open(R73_PATH))
DAY = datetime.date(2026, 11, 15)

def sha_bytes(b):
    return hashlib.sha256(b).hexdigest()

# ---- documents fetched today; never committed, only hashed and quoted -------------------------------
DOCS = {
 "NLSTB": {"url": "https://zoek.officielebekendmakingen.nl/stb-2023-492.html",
           "what": "Netherlands, Staatsblad 2023, 492: decree of 20 December 2023 amending the Besluit kwaliteit leefomgeving with an instruction rule on hyperscale data centres, with its explanatory note"},
 "CNGAI": {"url": "https://www.cac.gov.cn/2023-07/13/c_1690898327029107.htm",
           "what": "Cyberspace Administration of China and six ministries, Interim Measures for the Management of Generative Artificial Intelligence Services (order no. 15, 2023-07-10, in force 2023-08-15)"},
 "ONITIU": {"url": "https://arxiv.org/pdf/2607.22604v1",
            "what": "Onitiu, Wachter & Mittelstadt, The fallacy of sustainable Generative AI: limitations in EU environmental regulation of data centres and paths forward, arXiv:2607.22604 (2026)", "pdf": True},
 "DCW": {"url": "https://www.datacenterwatch.org/q3-q4-2025",
         "what": "Data Center Watch, Q3-Q4 2025 update (research timeline July to December 2025)"},
}

PASSAGES = [
 ("nl1", "NLSTB", "het gebied waar geen hyperscale datacentra zijn toegelaten, is het grondgebied van Nederland met uitzondering van enkele locaties gelegen in de gemeenten Het Hogeland en Hollands Kroon",
  "the area where no hyperscale data centres are admitted is the territory of the Netherlands with the exception of a few locations in the municipalities of Het Hogeland and Hollands Kroon (art. 5.161bb; our translation)"),
 ("nl2", "NLSTB", "laat het omgevingsplan geen hyperscale datacentrum toe",
  "the environment plan admits no hyperscale data centre (art. 5.161bc)"),
 ("nl3", "NLSTB", "niet van toepassing voor zover activiteiten zijn toegestaan op grond van een omgevingsvergunning voor een bouwactiviteit",
  "not applicable in so far as activities are permitted under an environmental permit for a building activity (art. 5.149, third paragraph)"),
 ("nl4", "NLSTB", "vanwege het ruimtebeslag, de landschappelijke impact, het hoge energiegebruik, de beschikbaarheid van water en de belasting van de landelijke energie-infrastructuur",
  "because of the land they take, their impact on the landscape, their high energy use, the availability of water and the load on the national energy infrastructure (explanatory note, 1)"),
 ("nl5", "NLSTB", "Dit besluit treedt in werking met ingang van 1 januari 2024",
  "This decree enters into force on 1 January 2024 (art. II)"),
 ("nl6", "NLSTB", "een bebouwd vloeroppervlakte van meer dan 10 ha en een elektrisch aansluitvermogen van 70 MW of meer",
  "a built floor area of more than 10 ha and an electrical connection capacity of 70 MW or more (art. 5.161ba)"),
 ("cn1", "CNGAI", "为了促进生成式人工智能健康发展和规范应用，维护国家安全和社会公共利益，保护公民、法人和其他组织的合法权益",
  "to promote the healthy development and standardised application of generative AI, safeguard national security and the social public interest, and protect the lawful rights of citizens, legal persons and other organisations (art. 1; our translation)"),
 ("cn2", "CNGAI", "提供具有舆论属性或者社会动员能力的生成式人工智能服务的，应当按照国家有关规定开展安全评估，并按照《互联网信息服务算法推荐管理规定》履行算法备案和变更、注销备案手续",
  "a provider of a generative AI service with public-opinion attributes or the capacity for social mobilisation shall carry out a security assessment under the relevant state rules and file, change and cancel the filing of its algorithm under the provisions on algorithmic recommendation (art. 17; our translation)"),
 ("cn3", "CNGAI", "促进算力资源协同共享，提升算力资源利用效能",
  "promote the coordinated sharing of compute resources and raise the efficiency of their use (art. 6; our translation): the one place the measures name compute, and they encourage it"),
 ("cn4", "CNGAI", "国家网信部门应当通知有关机构采取技术措施和其他必要措施予以处置",
  "for services provided from outside the country that break these rules, the state cyberspace department shall notify the bodies concerned to deal with them by technical and other necessary measures (art. 20; our translation)"),
 ("cn5", "CNGAI", "本办法自2023年8月15日起施行",
  "These measures take effect on 15 August 2023 (art. 24)"),
 ("on1", "ONITIU", "current EU policy pushing for sustainable hyperscale data centre expansion appears misplaced", None),
 ("on2", "ONITIU", "Requiring data centre operators and Big Tech under the recast Energy Efficiency Directive (recast EED) to quantify, report and disclose the facility-level energy and water impacts seems to be a step into the right direction towards more transparency and accountability", None),
 ("dc1", "DCW", "In 2025, projects with publicly disclosed values totaling at least $156 billion were blocked or delayed amid coordinated local opposition, moratoria, and litigation.", None),
 ("dc2", "DCW", "Opposition extended beyond local campaigns into litigation, moratoria, and challenges to", None),
]

def norm(t):
    t = t.replace("­", "").replace("‘", "'").replace("’", "'").replace("“", '"').replace("”", '"')
    t = re.sub(r"-\s*\n\s*", "", t) if False else t
    return re.sub(r"\s+", " ", t).strip()

def html_text(b):
    for enc in ("utf-8", "gb18030"):
        try:
            t = b.decode(enc); break
        except UnicodeDecodeError:
            continue
    t = re.sub(r"<script.*?</script>|<style.*?</style>", "", t, flags=re.S)
    return norm(html.unescape(re.sub(r"<[^>]+>", " ", t)))

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (research; field-research)"})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read()

files, texts, refusals = [], {}, []
tmp = tempfile.mkdtemp()
for k, d in DOCS.items():
    try:
        b = fetch(d["url"])
    except Exception as e:  # recorded, never bridged
        refusals.append(f"{d['url']}: {type(e).__name__} {e}")
        continue
    files.append({"doc": k, "url": d["url"], "what": d["what"], "bytes": len(b), "sha256": sha_bytes(b)})
    if d.get("pdf"):
        p = os.path.join(tmp, k + ".pdf"); open(p, "wb").write(b)
        out = subprocess.run(["pdftotext", p, "-"], capture_output=True, text=True).stdout
        out = re.sub(r"(\w)-\n(\w)", r"\1\2", out)
        texts[k] = norm(out)
    else:
        texts[k] = html_text(b)

passages = []
for pid, doc, text, gloss in PASSAGES:
    ok = doc in texts and norm(text) in texts[doc]
    passages.append({"id": pid, "doc": doc, "text": text, "gloss": gloss, "found": ok,
                     "url": DOCS[doc]["url"], "source": DOCS[doc]["what"]})
missing = [p["id"] for p in passages if not p["found"]]
assert not missing, f"passages not found in the documents as fetched: {missing} (refusals: {refusals})"

P = {p["id"]: p for p in passages}

def q(pid):
    p = P[pid]
    return {"id": pid, "doc": p["doc"], "text": p["text"], "gloss": p["gloss"], "url": p["url"], "source": p["source"]}

# ---- 1 and 2: the register after this study ------------------------------------------------------------
acts = copy.deepcopy(R73["acts"])
by_id = {a["id"]: a for a in acts}
corrections = []

s4 = by_id["s4"]
s4["quotes"] = s4["quotes"] + [q("nl1"), q("nl2"), q("nl3"), q("nl4")]
s4["grounds"] = ["land, noise or the neighbourhood", "power or grid", "water"]
s4["what"] = ("A standing rule: no environment plan anywhere in the Netherlands may admit a hyperscale data centre "
              "(more than 10 ha of floor and 70 MW or more), except at a few locations in two municipalities; "
              "what already had a building permit is exempt.")
s4["flag"] = []
s4.setdefault("corrected", []).extend([
 {"date": "2026-11-15", "field": "effect",
  "why": "Read in the rule itself (Staatsblad 2023, 492): it calls the whole country, save a few locations in two municipalities, an area where no hyperscale data centre is admitted. The first coding, stopped, holds; the second reader's 'conditioned' read a description. The flag of 2026-11-14 is resolved."},
 {"date": "2026-11-15", "field": "grounds",
  "why": "The rule's explanatory note names the availability of water among its reasons, beside land, landscape, energy use and the load on the grid: water added."}])
corrections += [{"id": "s4", "field": "effect", "from": "stopped (flagged)", "to": "stopped (settled)", "why": s4["corrected"][-2]["why"]},
                {"id": "s4", "field": "grounds", "from": ["land, noise or the neighbourhood", "power or grid"], "to": s4["grounds"], "why": s4["corrected"][-1]["why"]}]

c2 = by_id["c2"]
c2["after"] = dict(c2["after"])
c2["after"]["state"] = "loosened in part"
c2["after"]["note"] = ("Loosened in part 27 months later: since January 2026 licences for the H200 class are reviewed case by case "
                       "(c5). The rest of the rule was not found lifted. Our definition of 2026-11-13 folded loosening into "
                       "'lifted'; the word overstated it, as the Atelier and the Studio both read.")
c2.setdefault("corrected", []).append({"date": "2026-11-15", "field": "afterwards",
  "why": "Coded 'lifted' under a definition that folded loosening into lifting; the siblings read it as loosened in part, and the record (BIS release of 2026-01-13) says so. Recoded 'loosened in part': it stands for all chips but one class."})
corrections.append({"id": "c2", "field": "afterwards", "from": "lifted", "to": "loosened in part", "why": c2["corrected"][-1]["why"]})

m9 = {
 "id": "m9", "point": "model", "date": "2023-07-10", "body": "Cyberspace Administration of China, with six ministries",
 "country": "China", "level": "nat", "kind": "agency", "effect": "conditioned", "form": "rule", "terr": "na",
 "grounds": ["national security", "other: the social public interest; the healthy development and standardised application of generative AI"],
 "named": None, "party": "providers of generative AI services to the public in China",
 "what": ("Interim measures: a generative AI service offered to the public in China that can sway opinion or mobilise people "
          "must pass a security assessment and file its algorithm; services from abroad that break the rules are to be dealt "
          "with by technical measures. Compute is named once, to be shared and used efficiently."),
 "limit": "which services may be offered to the public, by assessment and filing",
 "compute_quantity": False, "q": ["cn1", "cn2", "cn4"], "new": True, "was_second_hand": False,
 "found_by": "the check of 2026-11-14 (study 73, x2), read first-hand on 2026-11-15",
 "quotes": [q("cn1"), q("cn2"), q("cn4")],
 "after": {"state": "stands", "firsthand": False,
           "note": ("In force: the authority's notice of 2026-09-14 counts 1,112 generative AI services filed by 2026-08-31. That "
                    "notice was read only in a search tool's extract on 2026-11-14; the page reset the connection again on 2026-11-15."),
           "quote": None},
 "size": None, "threshold": None, "matter": "cn-genai", "corrected": [],
}
acts.append(m9)
by_id["m9"] = m9

# ---- 3: does an act state its own length? ----------------------------------------------------------------
# Coded from the act's own record: the passages quoted beside it (ids given), or, where the passage carries
# no length, the record's summary as read (marked 'record'). Kinds: fixed, condition, definitive, none.
LENGTH = {
 "c1": ("none", None), "c2": ("none", "c2b"), "c3": ("none", None), "c4": ("none", None), "c5": ("none", None), "c6": ("none", None),
 "s1": ("none", None), "s2": ("none", None), "s3": ("fixed", "Dit voorbereidingsbesluit gold voor de (wettelijke) periode van negen maanden"),
 "s4": ("none", "nl5"), "s5": ("condition", "temporary pause in the growth of DCs in 2019 and embarked on a review"),
 "s6": ("condition", "el proyecto no puede ser ejecutado hasta no contar con esta última resolución"),
 "s7": ("fixed", "temporary, 12-month moratorium"), "s8": ("condition", "temporary moratorium"),
 "s9": ("none", None), "s10": ("none", None),
 "p1": ("none", None), "p2": ("none", None), "p3": ("none", None), "p4": ("fixed", "record: the permit runs to January 2027"),
 "m1": ("condition", "limitazione provvisoria"), "m2": ("condition", "Only in that case will the Italian SA lift its order"),
 "m3": ("definitive", "limitazione definitiva"), "m4": ("none", "agreement to suspend its processing"),
 "m5": ("condition", "ATÉ ULTERIOR DECISÃO DESTA AUTORIDADE"), "m6": ("condition", "COM A DETERMINAÇÃO DE CUMPRIMENTO INTEGRAL DO PLANO DE CONFORMIDADE"),
 "m7": ("condition", "pemutusan akses sementara"), "m8": ("none", None),
 "m9": ("condition", "暂行办法 (interim measures, by its title)"),
}
assert set(LENGTH) == set(by_id), set(by_id) ^ set(LENGTH)
for a in acts:
    kind, basis = LENGTH[a["id"]]
    a["length"] = {"kind": kind, "basis": basis}
    if basis and not basis.startswith("record") and not re.fullmatch(r"[a-z]+\d+[a-z]?", basis or "") and a["id"] != "m9":
        texts_here = " ".join(x["text"] for x in a["quotes"]) + " " + (a["after"].get("quote") or {}).get("text", "")
        assert basis in texts_here, (a["id"], basis)

ENDED = {"lifted", "superseded", "gone around"}
def ended(a):
    return a["after"]["state"] in ENDED

base = [a for a in acts if a["id"] != "m9"]  # the 28 the predictions were written about
stated = [a for a in base if a["length"]["kind"] in ("fixed", "condition")]
unstated = [a for a in base if a["length"]["kind"] == "none"]
model28 = [a for a in base if a["point"] == "model"]
other28 = [a for a in base if a["point"] != "model"]

def share(xs, f):
    n = sum(1 for x in xs if f(x)); return {"n": n, "of": len(xs), "ids": [x["id"] for x in xs if f(x)]}

none_other = share(other28, lambda a: a["length"]["kind"] == "none")
none_model = share(model28, lambda a: a["length"]["kind"] == "none")
ended_stated = share(stated, ended)
ended_unstated = share(unstated, ended)

# Holds only (stopped or delayed), which is what the Atelier asked about: does a stated length predict the afterwards?
holds = [a for a in base if a["effect"] in ("stopped", "delayed")]
def term_due(a):
    """A stated fixed term or condition that has not yet run out on the day read (a running moratorium)."""
    return a["id"] in ("s7", "s8")
hold_rows = []
for a in sorted(holds, key=lambda x: (x["length"]["kind"], x["date"])):
    hold_rows.append({"id": a["id"], "point": a["point"], "effect": a["effect"], "length": a["length"]["kind"],
                      "after": a["after"]["state"], "running": term_due(a), "body": a["body"], "date": a["date"]})
stated_holds = [r for r in hold_rows if r["length"] in ("fixed", "condition")]
stated_holds_due = [r for r in stated_holds if not r["running"]]
unstated_holds = [r for r in hold_rows if r["length"] == "none"]
atelier = {
 "question": "Do acts at the other points state their own length, and does it predict the afterwards? (ho-2026-11-14-atelier-1)",
 "none_other": none_other, "none_model": none_model,
 "stated_holds": len(stated_holds), "stated_holds_due": len(stated_holds_due),
 "stated_holds_due_ended": sum(1 for r in stated_holds_due if r["after"] in ENDED),
 "stated_holds_due_ended_ids": [r["id"] for r in stated_holds_due if r["after"] in ENDED],
 "unstated_holds": len(unstated_holds),
 "unstated_holds_ended": sum(1 for r in unstated_holds if r["after"] in ENDED),
 "unstated_holds_ended_ids": [r["id"] for r in unstated_holds if r["after"] in ENDED],
 "unstated_holds_standing_ids": [r["id"] for r in unstated_holds if r["after"] not in ENDED],
 "hardened": ["s3", "c1"],
 "rows": hold_rows,
}
atelier["answer"] = (
 f"Mostly not, away from the model. {none_other['n']} of {none_other['of']} acts at the chip, site and power points state no "
 f"length of their own, against {none_model['n']} of {none_model['of']} at the model point. Among the stops and pauses, every one "
 f"whose stated term or condition has come due ended ({atelier['stated_holds_due_ended']} of {atelier['stated_holds_due']}), and two "
 f"more are running inside their term. But more than half of the stops that state no length ended too: "
 f"{atelier['unstated_holds_ended']} of {atelier['unstated_holds']}. A stated length predicts that a stop will end; its absence "
 f"does not predict that it will last. Two temporary stops did not end in release but hardened into wider standing acts (the "
 f"Dutch pause into the rule of 2024; the US rule of 2022 into that of 2023).")

# ---- matters ----------------------------------------------------------------------------------------------
matters = copy.deepcopy(R73["matters"])
for m in matters:
    if m["matter"] == "us-chip-rules":
        m["state"] = "loosened in part"
        m["note"] = "c2 stands for all chips but the H200 class, which c5 allows on terms"
matters.append({"matter": "cn-genai", "name": "Generative AI services, China", "acts": ["m9"], "began": "2023-07-10",
                "state": "terms in force", "had_stop": False, "had_hold": False, "age_days": (DAY - datetime.date(2023, 7, 10)).days})
for m in matters:
    if m.get("age_days") is not None and m["matter"] != "cn-genai":
        m["age_days"] += 1  # one day later than the check

# ---- 5: counts over the register as it now stands ----------------------------------------------------------
def counts_for(xs):
    C = collections.Counter
    c = {"acts": len(xs),
         "per_point": {k: sum(1 for a in xs if a["point"] == k) for k in ("chip", "site", "power", "deal", "model")},
         "grid": {k: {e: sum(1 for a in xs if a["point"] == k and a["effect"] == e) for e in ("stopped", "delayed", "conditioned")} for k in ("chip", "site", "power", "deal", "model")},
         "by_effect": dict(C(a["effect"] for a in xs)), "by_kind": dict(C(a["kind"] for a in xs)),
         "by_level": dict(C(a["level"] for a in xs)), "by_country": dict(C(a["country"] for a in xs)),
         "grounds": dict(C(g for a in xs for g in a["grounds"] if not g.startswith("other:"))),
         "named": [a["id"] for a in xs if a["named"]], "elected": [a["id"] for a in xs if a["kind"] == "elected"],
         "inside": [a["id"] for a in xs if a["terr"] == "inside"],
         "ai_risk": [a["id"] for a in xs if "AI risk" in a["grounds"]],
         "model_output": [a["id"] for a in xs if "the model's output" in a["grounds"]],
         "compute_quantity": [a["id"] for a in xs if a["compute_quantity"]],
         "after_all": dict(C(a["after"]["state"] for a in xs)),
         "magnitude": [a["id"] for a in xs if a.get("size")], "thresholds": [a["id"] for a in xs if a.get("threshold")]}
    stops = [a for a in xs if a["effect"] == "stopped"]
    c["stopped"] = len(stops)
    c["stopped_after"] = dict(C(a["after"]["state"] for a in stops))
    return c

counts = counts_for(acts)
counts28 = counts_for(base)
assert counts28["stopped"] == 11 and counts28["stopped_after"].get("stands") == 4
assert counts28["stopped_after"].get("loosened in part") == 1 and counts28["stopped_after"].get("lifted") == 2

# ---- 4: predictions ------------------------------------------------------------------------------------------
p102 = none_other["n"] * 2 >= none_other["of"] and none_model["n"] * 4 <= none_model["of"]
p103a = ended_stated["n"] * 3 >= ended_stated["of"] * 2
p103b = ended_unstated["n"] * 2 <= ended_unstated["of"]
p104a = s4["effect"] == "conditioned"   # what was predicted; the rule's own text says otherwise
p104b = (not m9["compute_quantity"]) and "AI risk" not in m9["grounds"]
predictions = [
 {"id": "P102", "text": "At least half of the acts at the chip, site and power points state no length of their own, against at most a quarter at the model point.",
  "held": p102, "found": f"{none_other['n']} of {none_other['of']} state none away from the model; {none_model['n']} of {none_model['of']} at the model point."},
 {"id": "P103", "text": "Of the acts that state a fixed term or a condition, at least two thirds have ended; of those that state none, at most half have.",
  "held": p103a and p103b, "found": f"Stated: {ended_stated['n']} of {ended_stated['of']} ended ({', '.join(ended_stated['ids'])}); five still in force, two of them moratoria inside their term and two the conditions that ended a suspension. None stated: {ended_unstated['n']} of {ended_unstated['of']} ended. The first half fails."},
 {"id": "P104", "text": "The Dutch rule limits hyperscale data centres to named places rather than forbidding them, so its effect is conditioned; and the Chinese rules state no quantity of compute and no ground of a model's capability or control.",
  "held": p104a and p104b, "found": "The Dutch rule forbids them everywhere save a few locations in two municipalities, in its own words an exclusion area, so the first coding (stopped) stands and the first half fails. The Chinese measures name compute once, to encourage its sharing, and rest on national security, the public interest and rights: the second half holds."},
]
held = sum(1 for p in predictions if p["held"])

# ---- 6: literature -------------------------------------------------------------------------------------------
literature = [p for p in passages if p["doc"] in ("ONITIU", "DCW")]

out = {
 "study": 74, "session": 272, "date": DAY.isoformat(), "cycle": 14, "programme_step": 2,
 "builds_on": {"register": "results73.json", "sha256": sha_bytes(open(R73_PATH, "rb").read())},
 "corrections": corrections, "atelier": atelier,
 "length_counts": {"stated_28": len(stated), "unstated_28": len(unstated), "definitive_28": sum(1 for a in base if a["length"]["kind"] == "definitive"),
                   "ended_stated": ended_stated, "ended_unstated": ended_unstated},
 "predictions": predictions, "predictions_held": f"{held} of {len(predictions)}",
 "counts": counts, "counts_28": counts28, "matters": matters, "acts": acts,
 "passages": passages, "literature": literature, "files": files, "refusals": refusals,
}
json.dump(out, open(os.path.join(HERE, "results74.json"), "w"), ensure_ascii=False, indent=1)
open(os.path.join(HERE, "data74.js"), "w").write("window.DATA74=" + json.dumps(out, ensure_ascii=False) + ";\n")
print(json.dumps({"predictions": [(p["id"], p["held"], p["found"]) for p in predictions], "atelier": atelier["answer"],
                  "stopped_after_28": counts28["stopped_after"], "counts_acts": counts["acts"], "after_all": counts["after_all"],
                  "named": counts["named"], "files": [(f["doc"], f["bytes"], f["sha256"][:12]) for f in files]}, ensure_ascii=False, indent=1))
