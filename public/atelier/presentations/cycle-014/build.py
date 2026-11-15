"""In Whose Name — build and check.

Ten acts of public bodies along the way from the chip to the running model, each read in the
body's own text: what it did, on whom, in whose name, whether its text says "artificial
intelligence", and what stood afterwards. The reading stands in this file. Eight acts were
read by this practice; two rows (the export prosecutions and California's inquiry) are the
Field's study 70 and are taken from its file, whose hash is asserted.

Arguments: the Field's results70.json, and a directory of the texts as fetched (not
committed here: third-party source files stay out of this repository; addresses in
meta.json and in each case below). Every sentence the page quotes is asserted against the
text it was read in, with whitespace collapsed.

Run: python3 build.py results70.json texts/
"""
import hashlib
import json
import os
import re
import sys
from collections import Counter

SHA70 = "37bc61f51b3bf80885108f3f415d14c8ef22d9c1cc5f01a2cddd4216ff4871ba"
raw = open(sys.argv[1], "rb").read()
assert hashlib.sha256(raw).hexdigest() == SHA70, "not the file this was built on"
F = json.loads(raw)
TEXTS = sys.argv[2]


def text(name):
    t = open(os.path.join(TEXTS, name), encoding="utf-8", errors="replace").read()
    return re.sub(r"\s+", " ", t)


_cache = {}


def has(name, quote):
    if name not in _cache:
        _cache[name] = text(name)
    assert re.sub(r"\s+", " ", quote) in _cache[name], (name, quote)
    return quote


# The stations, in the order of the question: between the chip and the running model.
STATIONS = [
    ("border", "The border", "an export licence"),
    ("land", "Land and water", "a rezoning, an annexation, an environmental permit"),
    ("grid", "The grid", "a connection, a supply contract"),
    ("market", "The market", "a merger or contract review"),
    ("model", "The running model", "a duty on whoever trains or offers it"),
]
# What the body did. The question names the first three; the other three are also acts.
VERBS = [
    ("stopped", "Stopped", True), ("delayed", "Delayed", True),
    ("conditioned", "Put conditions on", True),
    ("passed", "Looked, and let pass", False),
    ("charged", "Charged afterwards", False),
    ("asking", "Is asking", False),
]
# How the body got hold of the party.
HOLDS = [
    ("ask", "They had to ask", "a licence, an acceptance, an annexation, a clearance: nothing goes ahead without a yes"),
    ("caught", "They were caught", "a charge for something already done"),
    ("own", "The body came by itself", "an inquiry or an order on its own motion"),
    ("suit", "A neighbour sued", "a court moved by someone affected"),
]
# The public the act names, in its own words (the category is this reader's).
PUBLICS = [
    ("nation", "A nation against another"),
    ("customers", "Customers of a grid"),
    ("residents", "Residents and their water"),
    ("market", "Buyers and rivals in a market"),
    ("subjects", "People whose data it is"),
]
# Does the act's own text say "artificial intelligence" or "AI"?
SAYS = [
    ("yes", "Says AI"),
    ("no", "Does not say AI"),
    ("aside", "Says AI only beside the act"),
    ("unread", "The act's own text was not read"),
]
# What stood afterwards, as far as the sources read here show.
AFTER = [
    ("lifted", "Lifted"), ("around", "Gone around"), ("stands", "Stands"),
    ("none", "Nothing to lift"), ("open", "Still open"),
]

U = {u["id"]: u for u in F["uses"]}
export_uses = [u for u in F["uses"] if u["law"] == "us-export"]
assert len(export_uses) == 6 and len({u["doc"] for u in export_uses}) == 5
n_parties = sum(len(u["parties"]) for u in export_uses)
assert n_parties == F["counts"]["export_parties"] == 14
assert F["counts"]["export_persons"] == 13 and F["counts"]["export_companies"] == 1
assert F["counts"]["export_admitted"] == 2 and F["counts"]["export_sentences_found"] == 0
assert F["counts"]["parties_that_are_holders"] == []
assert U["u7"]["rung"] == "inquiry" and U["u7"]["statute_named"] is False
P70 = F["passages"]
D70 = F["documents"]

CASES = [
 dict(
  id="h20", short="Nvidia, 2025", station="border", date="2025-04-09", place="United States",
  body="The US government, as the addressee reported it",
  party="Nvidia", thing="H20 chips bound for China",
  verb="stopped", hold="ask", public="nation", says="no", after="lifted",
  act=has("nvda_8k.txt", "the USG requires a license for export to China (including Hong Kong and Macau) and D:5 countries"),
  name=has("nvda_8k.txt", "the risk that the covered products may be used in, or diverted to, a supercomputer in China"),
  law="US export controls. The notice itself is not public; it is known from the company's filing, which names no statute.",
  says_note="The filing's account of the notice speaks of a supercomputer. It does not say artificial intelligence.",
  then=[has("nvda_10q.txt", "In August 2025, the USG granted licenses that would allow us to ship certain H20 products to certain China-based customers"),
        has("nvda_10q.txt", "USG officials have expressed an expectation that the USG will receive 15% or more of the revenue generated from licensed sales of our products, but to date, the USG has not published a regulation codifying such requirement")],
  then_plain="Four months later licences were granted. The company reports that officials expect a share of the revenue, under no published rule.",
  days=None, months=4,
  src=[("Nvidia, Form 8-K, report of 9 April 2025", "https://www.sec.gov/Archives/edgar/data/1045810/000104581025000082/nvda-20250409.htm", "through a reading service; sec.gov refused the direct fetch"),
       ("Nvidia, Form 10-Q, quarter ended 26 October 2025", "https://www.sec.gov/Archives/edgar/data/1045810/000104581025000230/nvda-20251026.htm", "through a reading service")],
 ),
 dict(
  id="smug", short="14 charged, 2025 to 2026", station="border", date="2025-08-05", date_to="2026-10-01", place="United States",
  body="US Department of Justice, five announcements",
  party="13 people and one small company", thing="chips and servers sent to China without a licence",
  verb="charged", hold="caught", public="nation", says="yes", after="open",
  act=P70["d1"]["quote"],
  name=has("doj1208.txt", "pleaded guilty to smuggling cutting-edge Artificial Intelligence (AI) technology out of the United States"),
  law="Export Control Reform Act (2018), named in four of the six charging entries the Field recorded.",
  says_note="The release of 8 December 2025 is headed with AI and calls the chips AI technology.",
  then=[P70["d4"]["quote"]],
  then_plain="Two guilty pleas; the Field found no sentence and no penalty imposed. None of the fourteen holds a counted chip.",
  days=None, months=None,
  src=[("The Field, study 70, results70.json (the count, the parties, the quoted passages)", "https://github.com/frankbueltge/field-research/blob/main/artifacts/after-cycle-013/what-reaches-the-kept-share/results70.json", "sibling material, hash asserted"),
       ("US Department of Justice, release of 8 December 2025", D70["DOJ1208"]["url"], "direct")],
 ),
 dict(
  id="tucson", short="Project Blue, 2025", station="land", date="2025-08-06", place="Tucson, Arizona",
  body="Mayor and Council of the City of Tucson",
  party="Beale Infrastructure (Project Blue)", thing="a data centre campus on 290 acres, to be annexed and given city water",
  verb="stopped", hold="ask", public="residents", says="unread", after="around",
  act=has("pima_memo.txt", "the City of Tucson Mayor and Council voted to not proceed with annexation of the project site"),
  name=has("pima_memo.txt", "construction of an 18-mile reclaimed water line to serve the cooling needs for the project"),
  law="A city's power to annex land and to serve it with water.",
  says_note="The city's own minute was not read. The county's memorandum and the developer's letter, read here, do not say artificial intelligence.",
  then=[has("pima_memo.txt", "Contemplates the sale proceeding without annexation"),
        has("pima_memo.txt", "will consume no water, potable or otherwise, for industrial cooling")],
  then_plain="The same site, outside the city: the county's sale stood, the design changed to air cooling, and four months later the state's utility commission approved the power contract (the next gate).",
  days=None, months=4,
  src=[("Pima County Administrator, memorandum of 17 September 2025, with the developer's letter", "https://content.civicplus.com/api/assets/2192e865-fe7e-48f4-8a0c-7c1c8b5cd32c", "direct")],
 ),
 dict(
  id="chile", short="Google, 2024", station="land", date="2024-02-27", place="Santiago, Chile",
  body="Segundo Tribunal Ambiental (Second Environmental Court)",
  party="Google (Cerrillos Data Center)", thing="a data centre cooled with groundwater",
  verb="delayed", hold="suit", public="residents", says="no", after="open",
  act=has("tribunal_cl.html.txt", "el proyecto no puede ser ejecutado hasta no contar con esta última resolución"),
  act_en="the project cannot be carried out until it has this last resolution",
  name=has("tribunal_cl.html.txt", "impactos significativos sobre el Acuífero Santiago Central"),
  name_en="significant impacts on the Santiago Central aquifer",
  law="Chile's environmental assessment: the permit was annulled in part and sent back.",
  says_note="The court's notice speaks of servers, cooling and an aquifer.",
  then=[has("tribunal_cl.html.txt", "La acción solo fue continuada por una vecina"),
        has("tribunal_cl.html.txt", "reemplazar las torres de enfriamiento en base a agua por enfriadoras de condensación por aire")],
  then_en=["The action was carried on by one neighbour alone",
           "to replace the water-based cooling towers with air-condensing chillers"],
  then_plain="Fourteen residents and the municipality had sued; all but one withdrew when the firm said it would cool with air. What became of the project after the judgment was not read here.",
  days=None, months=None,
  src=[("Tribunal Ambiental, notice of the judgment in R-27/270-2020, 27 February 2024", "https://tribunalambiental.cl/sentencia-r27-270-2020-cerrillos-data-center", "direct; the translations are this practice's")],
 ),
 dict(
  id="ferc", short="Amazon and Talen, 2024", station="grid", date="2024-11-01", place="United States",
  body="Federal Energy Regulatory Commission",
  party="PJM, Susquehanna Nuclear (Talen) and a data centre campus of Amazon's", thing="raising the load fed straight from a nuclear plant from 300 to 480 megawatts",
  verb="stopped", hold="ask", public="customers", says="aside", after="around",
  act=has("ferc_order.txt", "we reject the Amended ISA"),
  name=has("ferc_order.txt", "huge ramifications for grid reliability and consumer costs"),
  law="Federal Power Act (1935), section 205: an agreement that departs from the standard form must be shown to be necessary.",
  says_note="The order rests on a burden not met. It says AI once, in a line quoted from a reliability body's list of large loads. The dissent spells it out, as the reason not to stop: \""
            + has("ferc_order.txt", "maintaining U.S. leadership in Artificial Intelligence (AI) is necessary to maintaining our national security")
            + "\". The words on consumer costs are the concurring commissioner's.",
  then=[has("talen.txt", "Talen will provide Amazon with 1,920 megawatts of carbon-free nuclear power through 2042"),
        has("talen.txt", "arrangement after the completion of transmission reconfigurations expected in the Spring of 2026")],
  then_plain="Seven months later the two firms agreed four times the refused load, delivered through the grid instead of behind the meter.",
  days=None, months=7,
  src=[("FERC, order of 1 November 2024, 189 FERC ¶ 61,078, with concurrence and dissent", "https://www.ferc.gov/sites/default/files/2024-11/20241101-3061_ER24-2172-000.pdf", "direct"),
       ("Talen Energy, release of 11 June 2025", "https://ir.talenenergy.com/news-releases/news-release-details/talen-energy-expands-nuclear-energy-relationship-amazon", "through a search service's excerpt; the site refused the direct fetch")],
 ),
 dict(
  id="acc", short="Project Blue, 2025", station="grid", date="2025-12-03", place="Arizona",
  body="Arizona Corporation Commission",
  party="Tucson Electric Power and Humphrey's Peak Power (the Project Blue site)", thing="a ten-year contract to supply the campus",
  verb="conditioned", hold="ask", public="customers", says="no", after="stands",
  act=has("acc.html.txt", "voted 4-1 on Wednesday, December 3, 2025"),
  name=has("acc.html.txt", "to ensure that residential ratepayers are protected from cost shifts"),
  law="A state utility commission's review of a special contract.",
  says_note="The commission's release speaks of a data center campus and of ratepayers.",
  then=[has("acc.html.txt", "minimum monthly billing requirements")],
  then_plain="Approved, with terms: minimum bills, a slow ramp, the campus pays for its own lines. No later act was looked for.",
  days=None, months=None,
  src=[("Arizona Corporation Commission, release of 5 December 2025", "https://www.azcc.gov/Rene-Lopez/news/2025/12/05/acc-approves-tep-energy-supply-agreement--ensures-customer-protections-from-costs-related-to-data-center-project", "direct")],
 ),
 dict(
  id="cma", short="Microsoft and OpenAI, 2025", station="market", date="2025-03-05", place="United Kingdom",
  body="Competition and Markets Authority",
  party="Microsoft and OpenAI", thing="a partnership in which one firm was the other's only supplier of compute",
  verb="passed", hold="own", public="market", says="yes", after="none",
  act=has("cma_summary.txt", "the CMA does not believe that it is or may be the case that the Partnership, in its current form, gives rise to a relevant merger situation"),
  name=has("cma_summary.txt", "substantial lessening of competition (SLC) in the UK"),
  law="Enterprise Act 2002: the authority may act only where one firm gains control of another.",
  says_note="The decision speaks of AI throughout, and records that "
            + has("cma_summary.txt", "Microsoft has been the exclusive supplier of compute infrastructure to OpenAI") + ".",
  then=[],
  then_plain="Opened on 8 December 2023, closed fifteen months later without a reference. Nothing was stopped, so nothing was lifted.",
  days=None, months=None,
  src=[("CMA, Microsoft / OpenAI partnership, summary of the decision, 5 March 2025", "https://assets.publishing.service.gov.uk/media/67c841d6d0fba2f1334cf276/1._MS.OAI_-_Summary.pdf", "direct")],
 ),
 dict(
  id="ec", short="Nvidia and Run:ai, 2024", station="market", date="2024-12-20", place="European Union",
  body="European Commission",
  party="Nvidia and Run:ai", thing="the chip maker buying software that schedules work on its chips",
  verb="passed", hold="ask", public="market", says="yes", after="none",
  act=has("ec_runai.txt", "It therefore cleared the transaction unconditionally"),
  name=has("ec_runai.txt", "would not raise competition concerns on any of the markets examined in the EEA or in Italy"),
  law="EU Merger Regulation (2004), after Italy called the deal in and referred it.",
  says_note="The release speaks of customers' artificial intelligence compute infrastructure.",
  then=[],
  then_plain="Cleared without conditions. Nothing was stopped, so nothing was lifted.",
  days=None, months=None,
  src=[("European Commission, press release IP/24/6548, 20 December 2024", "https://ec.europa.eu/commission/presscorner/detail/en/ip_24_6548", "direct, through the press corner's document address")],
 ),
 dict(
  id="garante", short="ChatGPT, 2023", station="model", date="2023-03-30", place="Italy",
  body="Garante per la protezione dei dati personali",
  party="OpenAI (ChatGPT)", thing="the service, for everyone in Italy",
  verb="stopped", hold="own", public="subjects", says="aside", after="lifted",
  act=has("garante_it.html.txt", "la misura della limitazione provvisoria"),
  act_en="the measure of a provisional limitation",
  name=has("garante_it.html.txt", "interessati stabiliti nel territorio italiano"),
  name_en="data subjects established on Italian territory",
  law="General Data Protection Regulation (2016), Article 58(2)(f).",
  says_note="The order speaks of personal data, users and their age. Artificial intelligence stands in the headline of the authority's press release, not in the order.",
  then=[has("garante_lift.html.txt", "OpenAI ha reso nuovamente accessibile ChatGPT agli utenti italiani")],
  then_en=["OpenAI has made ChatGPT accessible again to Italian users"],
  then_plain="Twenty-nine days later, after the firm had changed its notices and added a way to object, the service was back.",
  days=29, months=1,
  src=[("Garante, order of 30 March 2023 [9870832]", "https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9870832", "direct; the translations are this practice's"),
       ("Garante, release of 28 April 2023 [9881490]", "https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9881490", "direct")],
 ),
 dict(
  id="ca", short="OpenAI, 2026", station="model", date="2026-09-30", place="California",
  body="Attorney General of California",
  party="OpenAI", thing="incidents from the operation of its models",
  verb="asking", hold="own", public="subjects", says="yes", after="open",
  act=P70["o1"]["quote"],
  name=P70["o2"]["quote"],
  law="The release names no statute (the Field, study 70).",
  says_note="The release names the firm's artificial intelligence (AI) models. It names no public beyond the office itself; it is filed here with the people a harm would fall on, which is this reader's choice.",
  then=[],
  then_plain="A subpoena was served. Nothing has been stopped, delayed or made conditional.",
  days=None, months=None,
  src=[("The Field, study 70, results70.json", "https://github.com/frankbueltge/field-research/blob/main/artifacts/after-cycle-013/what-reaches-the-kept-share/results70.json", "sibling material, hash asserted"),
       ("Attorney General of California, release of 1 October 2026", D70["OAG1001"]["url"], "as the Field fetched it")],
 ),
]

# ---- checks on the reading ------------------------------------------------------------
ids = lambda key, val: [c["id"] for c in CASES if c[key] == val]
for key, table in (("station", STATIONS), ("verb", VERBS), ("hold", HOLDS), ("public", PUBLICS),
                   ("says", SAYS), ("after", AFTER)):
    allowed = {t[0] for t in table}
    assert all(c[key] in allowed for c in CASES), key
assert len(CASES) == 10 and len({c["id"] for c in CASES}) == 10

# The Garante's order itself, between its opening formula and its operative part, names no AI.
g = text("garante_it.html.txt")
gi, gk = g.find("IL GARANTE PER LA PROTEZIONE"), g.find("In Roma, 30 marzo 2023")
assert 0 < gi < gk, "order not located"
assert not re.search(r"intelligenza artificiale", g[gi:gk], re.I)
assert "Intelligenza artificiale: il Garante blocca ChatGPT" in text("garante_en.html.txt")
# FERC: the order (before the dissent) says AI once, inside a line it quotes from a reliability
# body's task force; "Artificial Intelligence" is spelled out only in the dissent; the
# concurrence (printed after the dissent) does not say it.
f = text("ferc_order.txt")
fd, fc = f.find("PHILLIPS, Chairman, dissenting:"), f.find("CHRISTIE, Commissioner, concurring:")
assert 0 < fd < fc
assert not re.search(r"Artificial Intelligence", f[:fd])
assert re.findall(r"\bAI\b", f[:fd]) == ["AI"] and "Data Centers (including crypto and AI)" in f[:fd]
assert re.search(r"Artificial Intelligence", f[fd:fc])
assert not re.search(r"Artificial Intelligence|\bAI\b", f[fc:])
assert "huge ramifications for grid reliability and consumer costs" in f[fc:]
for name in ("pima_memo.txt", "acc.html.txt", "tribunal_cl.html.txt", "nvda_8k.txt"):
    assert not re.search(r"artificial intelligence|inteligencia artificial|\bAI\b|\bIA\b", text(name)), name
assert re.search(r"\bAI\b", text("cma_summary.txt"))
assert "artificial intelligence compute infrastructure" in text("ec_runai.txt")
# Dates of the two lifts and the two ways around.
assert "Roma, 28 aprile 2023" in text("garante_lift.html.txt")
assert "September 17, 2025" in text("pima_memo.txt")

verbs = Counter(c["verb"] for c in CASES)
assert verbs == Counter(stopped=4, passed=2, delayed=1, conditioned=1, charged=1, asking=1)
stops = [c for c in CASES if c["verb"] == "stopped"]
assert sorted(c["id"] for c in stops) == ["ferc", "garante", "h20", "tucson"]
assert Counter(c["after"] for c in stops) == Counter(lifted=2, around=2)
assert max(c["months"] for c in stops) == 7
assert Counter(c["says"] for c in stops) == Counter(no=1, aside=2, unread=1)
assert sorted(ids("says", "yes")) == ["ca", "cma", "ec", "smug"]
assert {c["verb"] for c in CASES if c["says"] == "yes"} == {"charged", "passed", "asking"}
in_question = [c for c in CASES if c["verb"] in ("stopped", "delayed", "conditioned")]
assert len(in_question) == 6 and all(c["says"] != "yes" for c in in_question)
holds = Counter(c["hold"] for c in CASES)
assert holds == Counter(ask=5, own=3, caught=1, suit=1)
assert Counter(c["hold"] for c in stops) == Counter(ask=3, own=1)
publics = Counter(c["public"] for c in CASES)
assert publics == Counter(nation=2, customers=2, residents=2, market=2, subjects=2)
assert Counter(c["public"] for c in stops) == Counter(nation=1, customers=1, residents=1, subjects=1)

# ---- the texts beside the cases ---------------------------------------------------------
DEWEY = "dewey1927.txt"
dw = re.sub(r"(\w)- (\w)", r"\1\2", text(DEWEY))  # line-end hyphens of the scan's text


def dewey(q):
    assert q in dw, q
    return q


VOICES = dict(
 dewey=[dewey("The lasting, extensive and serious consequences of associated activity bring into existence a public. In itself it is unorganized and formless. By means of officials and their special powers it becomes a state."),
        dewey("There is too much public, a public too diffused and scattered and too intricate in composition. And there are too many publics"),
        dewey("the resultant public cannot identify and distinguish itself")],
 sastry=has("sastry_abs.html", "it is detectable, excludable, and quantifiable, and is produced via an extremely concentrated supply chain"),
 dcw=[has("dcw.txt", "$64 billion in U.S. data center projects have been blocked or delayed by a growing wave of local, bipartisan opposition"),
      has("dcw.txt", "attributing delays exclusively to these factors oversimplifies a complex landscape")],
)

out = dict(
 stations=[dict(id=a, name=b, how=c) for a, b, c in STATIONS],
 verbs=[dict(id=a, name=b, asked=c) for a, b, c in VERBS],
 holds=[dict(id=a, name=b, how=c) for a, b, c in HOLDS],
 publics=[dict(id=a, name=b) for a, b in PUBLICS],
 says=[dict(id=a, name=b) for a, b in SAYS],
 after=[dict(id=a, name=b) for a, b in AFTER],
 cases=[{k: v for k, v in c.items()} for c in CASES],
 voices=VOICES,
 field=dict(parties=n_parties, persons=13, companies=1, announcements=5, admitted=2, holders=0),
)
here = os.path.dirname(os.path.abspath(__file__))
with open(os.path.join(here, "data.js"), "w", encoding="utf-8") as fh:
    fh.write("// Written by build.py. The reading stands there; do not edit here.\n")
    fh.write("window.IWN = " + json.dumps(out, ensure_ascii=False, indent=1) + ";\n")
results = dict(
 built="2026-11-12", cases=len(CASES), read_by_this_practice=8, from_the_field=2,
 verbs=dict(verbs), in_the_questions_three_verbs=len(in_question),
 stops=dict(n=len(stops), afterwards=dict(Counter(c["after"] for c in stops)),
            longest_months=max(c["months"] for c in stops),
            says=dict(Counter(c["says"] for c in stops)),
            hold=dict(Counter(c["hold"] for c in stops))),
 says=dict(Counter(c["says"] for c in CASES)),
 says_ai_by_verb={v: sorted(c["id"] for c in CASES if c["says"] == "yes" and c["verb"] == v)
                  for v in ("charged", "passed", "asking")},
 acts_in_question_whose_text_says_ai=0,
 holds=dict(holds), publics=dict(publics),
 field_study_70=dict(sha256=SHA70, export_parties=n_parties, holders_among_them=0),
 note="Ten acts chosen by one reader, two to a station; not a sample and not a count of all acts. The count is the Field's part of this step.",
)
with open(os.path.join(here, "results.json"), "w", encoding="utf-8") as fh:
    json.dump(results, fh, ensure_ascii=False, indent=1)
print("ok", json.dumps(results["stops"]), dict(verbs))
