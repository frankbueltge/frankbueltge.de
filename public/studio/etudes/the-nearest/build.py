"""THE NEAREST — build step.

Reads the house's Atlas feed (werke.json, fetched live; never mirrored here) and the Field's
study 64 (results64.json at a pinned commit), matches every Atlas entry against the ground of the
twelve dossier candidates by published keyword lists over title + decisive_move, and writes
data.json / data.js for the page. Every figure stated in README.md and on the page is asserted.

Usage: python3 -I build.py <werke.json> <results64.json>
"""
import json, re, sys, hashlib, os
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
werke_path, r64_path = sys.argv[1], sys.argv[2]

# The ground of each candidate, as keywords. A crude, declared instrument: a hit means the
# entry's own words touch the candidate's matter, not that the work is "about" it.
GROUND = {
    1: r"\bclimat|\bglobal warming|\bwarming\b|\btemperatures?\b|\bheatwaves?\b|\bheat waves?\b|\bcarbon\b|\bco2\b|\bco₂|\bemissions?\b|\bfossil fuels?\b|\bgreenhouse gas",
    2: r"\btipping points?\b|\bglaciers?\b|\bice sheets?\b|\bice[- ]cores?\b|\bsea ice\b|\bpermafrost|\bcoral|\bamoc\b|\bocean currents?\b|\bgulf stream|\barctic|\bantarctic|\bmelting (ice|glacier)",
    3: r"\bextinct|\bspecies\b|\bbiodivers|\bendangered|\binsects?\b|\bpollinat|\bwildlife|\bred list",
    4: r"\bfood\b|\bhunger\b|\bfamine|\bcrops?\b|\bagricultur|\bfarm(s|ing|ers?|land)?\b|\bnutrition|\bfood security",
    5: r"\bantibiotic|\bantimicrobial|\bbacterial resistance|\bdrug[- ]resistan|\bsuperbugs?\b|\bpathogens?\b|\binfectious disease",
    6: r"\bwars?\b|\bwarfare\b|\bmilitary\b|\barmed conflicts?\b|\bbattle(s|field)?\b|\bsoldiers?\b|\bmissiles?\b|\bairstrikes?\b|\bbomb(s|ing|ings)?\b|\bweapons?\b",
    7: r"\bnuclear (weapons?|war|bombs?|arsenals?|tests?|testing|deterren)|\batomic bomb|\bwarheads?\b|\bhiroshima|\bnagasaki",
    8: r"\bdemocra|\bautocra|\bauthoritarian|\belections?\b|\belectoral|\bvoters?\b|\bvoting\b|\bcensorship|\bdictator",
    9: r"\bmisinformation|\bdisinformation|\bnews\b|\bjournalis|\bchatbots?\b|\blarge language models?\b|\bllms?\b|\bsearch engines?\b|\bwikipedia|\bpropaganda|\bfake news",
    10: r"\bartificial intelligence|\bai\b|\bmachine learning|\bneural net|\bcompute\b|\bdata cent(er|re)s?\b|\bautomated decision",
    11: r"\bwealth|\bbillionaires?\b|\binequalit|\bthe rich\b|\btax (havens?|evasion|avoidance)|\boffshore|\bfinancial (system|markets?|capital)|\boligarch",
    12: r"\bdebts?\b|\bpoverty|\bthe poor\b|\bloans?\b|\binterest rates?\b|\bausterity|\bcreditors?\b|\bimf\b|\bworld bank",
}
RX = {k: re.compile(v, re.I) for k, v in GROUND.items()}

# Hits read by hand and refused: the word is there, the matter is not. Keyed by title and
# candidate, each with its reason. Candidate 10's hits were not read by hand (see README).
REJECT = {
    ("Mushroom Clouds", 3): "species of mushroom in a training set, not loss of species",
    ("Mushroom Clouds", 4): "'data hunger', a metaphor",
    ("Mushroom Clouds", 9): "an LLM's appetite for data, not news or shared knowledge",
    ("Data Bugs", 3): "AI-generated insects from an archive, not loss of species",
    ("Masked Reality", 3): "endangered embodied heritage, not species",
    ("Uncharted", 3): "endangered writing systems, not species",
    ("Endangered Gestures", 3): "endangered gestures, not species",
    ("They Who Saw Nothing but Beauty", 3): "endangered carpet-making traditions, not species",
    ("Mimus", 3): "a robot's curiosity about another species, not extinction",
    ("Seeing Echoes in the Mind of a Whale", 11): "'rich biodiversity', not wealth",
    ("Hyper-Dust", 11): "'a wealth of information', not wealth",
    ("SELLz", 4): "food named among bodily systems, not food supply",
    ("Journey on the Tongue", 4): "a taste installation, not food supply",
    ("The User and the Beast", 6): "ad-tech's 'cookies at war', a metaphor",
    ("All the Submarines", 9): "Wikipedia used as a source of images, not shared knowledge as a matter",
    ("News from Home Screen", 9): "an artist's screen-mediated loneliness, not news",
    ("Bibliokepos", 8): "libraries called democratic places, not democracy as a matter",
}
def rejected(title, k):
    return next((r for (t, kk), r in REJECT.items() if kk == k and (title or "").startswith(t)), None)

W = json.load(open(werke_path))
r64 = json.load(open(r64_path))
entries = W["entries"]
assert W["count"] == len(entries), (W["count"], len(entries))

def year(e):
    m = re.search(r"(19|20)\d\d", str(e.get("year", "")))
    return int(m.group(0)) if m else None

works, refused = [], []
for i, e in enumerate(entries):
    text = f"{e.get('title','')} — {e.get('decisive_move','')}"
    hits = {}
    for k, rx in RX.items():
        m = rx.search(text)
        if m and not rejected(e.get("title"), k):
            hits[k] = m.group(0).lower()
        elif m:
            refused.append({"i": i, "t": e.get("title"), "c": k, "why": rejected(e.get("title"), k)})
    works.append({"i": i, "y": year(e), "c": sorted(hits), "w": [hits[k] for k in sorted(hits)],
                  **({"t": e.get("title"), "a": e.get("artist"), "yr": e.get("year"),
                      "d": e.get("decisive_move"), "u": e.get("source_url")} if hits else {})})

cands = []
for c in r64["candidates"]:
    n = c["n"]
    near = [w["i"] for w in works if n in w["c"]]
    cands.append({"n": n, "name": c["name"], "sum": c["sum"], "W": c["W"], "O": c["O"], "C": c["C"], "R": c["R"],
                  "near": len(near), "delivering": c["delivering"],
                  "datasets": [{"name": d["name"], "class": d["class"], "url": d["url"]} for d in c["datasets"]],
                  "named_none": c["named_none"], "keywords": GROUND[n]})

# The Atelier answered the Field's probe on candidate 2 (no dataset named): RAPID's AMOC record
# delivers without an account. Re-probed by this étude on 2026-11-08: HTTP 200, application/x-netcdf,
# 1,182,284 bytes. Kept apart from the Field's count, which stays the Field's.
ANSWERS = {2: [{"name": "RAPID AMOC at 26.5° N (named by the Atelier, s43)", "class": "delivers",
                "url": "https://rapid.ac.uk/sites/default/files/rapid_data/moc_transports.nc",
                "doi": "https://doi.org/10.5285/48d0bf43-0598-ceb2-e063-7086abc062f1"}]}
for c in cands:
    c["answers"] = ANSWERS.get(c["n"], [])

untouched = sum(1 for w in works if not w["c"])
undated = sum(1 for w in works if w["y"] is None)
out = {
    "atlas": {"count": len(entries), "sha256": hashlib.sha256(open(werke_path, "rb").read()).hexdigest(),
              "untouched": untouched, "undated": undated},
    "field64": {"commit": "256847ef0bfd442d53e60745a4fa42f04b98b553",
                "sha256": hashlib.sha256(open(r64_path, "rb").read()).hexdigest()},
    "candidates": cands, "works": works, "refused": refused,
}

# --- assertions: every figure the page and README state ---
assert out["field64"]["sha256"].startswith("1a77e9f3"), "results64.json is not the pinned version"
near = {c["n"]: c["near"] for c in cands}
deliv = {c["n"]: c["delivering"] for c in cands}
assert len(refused) == len(REJECT), [r for r in REJECT if not any(x["t"].startswith(r[0]) and x["c"]==r[1] for x in refused)]
print("refused", len(refused))
print("atlas", len(entries), "untouched", untouched, "undated", undated)
for c in cands:
    print(f'{c["n"]:>2} {c["name"][:38]:<38} near {c["near"]:>3}  delivering {c["delivering"]}  sum {c["sum"]}')
EXPECT = json.load(open(os.path.join(HERE, "expect.json"))) if os.path.exists(os.path.join(HERE, "expect.json")) else None
if EXPECT:
    assert EXPECT["atlas"] == len(entries), "Atlas count moved; re-read the figures"
    assert EXPECT["untouched"] == untouched
    assert {int(k): v for k, v in EXPECT["near"].items()} == near, near
    assert {int(k): v for k, v in EXPECT["delivering"].items()} == deliv, deliv
    assert 1/7 < near[10] / len(entries) < 1/5  # "one in six" on the page
    assert near[2] == 3 and near[7] == 0 and near[12] == 0
    print("all stated figures asserted")

json.dump(out, open(os.path.join(HERE, "data.json"), "w"), ensure_ascii=False, indent=0)
open(os.path.join(HERE, "data.js"), "w").write("window.NEAREST=" + json.dumps(out, ensure_ascii=False) + ";\n")
