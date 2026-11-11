"""Should Always — build and check.

Reads the Field's study 69 (results69.json; not committed here: fetch it from the address in
meta.json and pass its path), lays this practice's reading of each quoted passage beside it
(the mood of the sentence, where it stands, who must act, to whom), writes data.js for the
page, and asserts every figure the page and the bulletin state.

Optional second and third arguments: the AI Act as fetched from EUR-Lex and the judgment in
Case C-162/97 as fetched from EUR-Lex. With them the script also asserts the sentences this
practice read itself (the governing verbs outside the Field's quoted words, recital 97,
Article 101, paragraph 54 of the judgment).

Second state (2026-11-11): each sentence that tells someone to act is also read for how it
picks that someone out (by a handing over, by a deed done, by a holding, by office), and with
a fourth argument, a directory of texts as fetched, the script asserts the sentences read for
the Studio's case and the Field's second case: Executive Order 14110 (eo14110.htm, govinfo),
Hohfeld 1917 (hohfeld1917.txt, the scan's text at archive.org), and the fining clauses of
Regulation No 17, Regulation 1/2003, the GDPR, the DMA and the DSA (reg17.html,
reg1_2003.html, gdpr.html, dma.html, dsa.html, EUR-Lex).

Run: python3 build.py results69.json [aiact.html nilsson.html [texts/]]
"""
import hashlib
import html
import json
import re
import sys
from collections import Counter

SHA = "680cfadd042049563133e851b6b7d480a67ed1929e2136bb9520e3c9edd4e20a"
raw = open(sys.argv[1], "rb").read()
assert hashlib.sha256(raw).hexdigest() == SHA, "not the file this was built on"
F = json.loads(raw)
P = F["passages"]
assert len(P) == 35

# Where a document stands. One reader's sorting of the Field's thirteen documents.
STAND = {
    "AIACT": "force", "SB53": "force", "EAR": "force",
    "NY8828": "notyet",
    "NY10731": "bill", "NYA": "bill",
    "EO14110": "gone", "EO14148": "gone", "BIS": "gone", "REGINFO": "gone",
    "GUIDE": "notlaw", "COP": "notlaw", "PARIS": "notlaw",
}
STANDS = [
    ("force", "Law in force, enacting terms"),
    ("preamble", "Law in force, preamble"),
    ("notyet", "Enacted, not yet in force"),
    ("bill", "Bill"),
    ("gone", "Revoked or withdrawn"),
    ("notlaw", "Not law: guideline, code, declaration"),
]
MOODS = [
    ("command", "Command", "shall, may not: someone must act or refrain"),
    ("penalty", "Penalty", "what follows if they do not"),
    ("power", "Power", "may: a body is allowed to act"),
    ("terms", "Terms", "means, applies, is exempt: what the words cover, and when"),
    ("ought", "Ought", "should: a reason or a wish"),
    ("promise", "Promise", "commit: the speaker binds itself"),
    ("record", "Record", "a list, a register entry, a statement of fact"),
]
WHO = [("developer", "who trains or provides a model"), ("holder", "who holds the chips"),
       ("exporter", "who moves chips across a border"), ("authority", "a public body"),
       ("none", "no one: the sentence sets terms or records")]

# The reading. id: (mood, who must act, to whom, place, the words that carry the mood,
#                   outside) — outside: None when the mood word stands in the quoted passage;
# "checked" when the governing verb stands outside it and was read in the text as fetched;
# "unchecked" when it stands outside and this practice did not fetch the text.
R = {
 "a1": ("terms", "none", None, "Article 2(1)(a)", "placing on the market", "checked"),
 "a2": ("terms", "none", None, "Article 51(2)", "when", "checked"),
 "a3": ("command", "developer", "the Commission", "Article 52(1)", "shall notify", None),
 "a4": ("ought", "developer", None, "Recital 97", "should always be subject", None),
 "a5": ("terms", "none", None, "Article 3(63)", "except", None),
 "a6": ("command", "developer", None, "Article 55(1)(b)", "assess and mitigate", "checked"),
 "a7": ("command", "developer", None, "Article 55(1)(d)", "ensure", "checked"),
 "a8": ("command", "developer", "the AI Office, on request", "Annex XI, under Article 53(1)(a)", "the computational resources used to train the model", "checked"),
 "a9": ("terms", "none", None, "Article 113", "shall apply from", None),
 "a10": ("command", "authority", "the public", "Article 52(6)", "shall ensure", None),
 "g1": ("terms", "none", None, "Commission guidelines", "is used for internal processes", None),
 "g2": ("record", "none", None, "Commission guidelines", "are not binding", None),
 "c1": ("record", "none", None, "Code of practice, signatories", "signed up", None),
 "c2": ("record", "none", None, "Code of practice, signatories", "Google", None),
 "e1": ("command", "holder", None, "Executive Order 14110, section 4.2", "to report", "checked"),
 "e2": ("terms", "none", None, "Executive Order 14110, section 4.2", "greater than", None),
 "e3": ("record", "none", None, "Executive Order 14148", "Executive Order 14110", None),
 "b1": ("record", "none", None, "Proposed rule, 15 CFR 702", "establishing reporting requirements", None),
 "b2": ("record", "none", None, "Unified Agenda", "will be withdrawn", None),
 "b3": ("record", "none", None, "Unified Agenda", "Withdrawn", None),
 "x1": ("command", "exporter", None, "15 CFR 744.23", "may not export, reexport, or transfer", None),
 "p1": ("promise", "developer", None, "Paris Call", "commit", None),
 "p2": ("record", "none", None, "Paris Call, signatories", "Companies:", None),
 "n1": ("terms", "none", None, "New York S8828", "means", None),
 "n2": ("command", "developer", "the state's office", "New York S8828", "shall transmit", None),
 "n3": ("terms", "none", None, "New York S8828", "shall take effect", None),
 "n4": ("terms", "none", None, "New York S8828", "shall only apply", None),
 "m1": ("command", "developer", None, "New York S10731", "the percentage of computing power", "unchecked"),
 "m2": ("power", "authority", None, "New York S10731", "may limit", None),
 "m3": ("record", "none", None, "New York Assembly, bill actions", "REFERRED TO RULES", None),
 "s1": ("terms", "none", None, "California SB 53", "means", None),
 "s2": ("terms", "none", None, "California SB 53", "means", None),
 "s3": ("command", "developer", "the Office of Emergency Services", "California SB 53", "shall transmit", None),
 "s4": ("terms", "none", "withheld from the public", "California SB 53", "are exempt", None),
 "s5": ("penalty", "developer", None, "California SB 53", "shall be subject to a civil penalty", None),
}
assert set(R) == set(P)

# Second state. How a sentence picks out the one who must act. id: (handle, the words that pick,
# via) — via: None when the words stand in the passage itself; another passage's id when they
# stand in the definition or scope clause the Field quoted from the same text; "unchecked" when
# this practice did not read the bill's definition.
HANDLES = [
    ("hand", "By a handing over", "places on the market, exports: an act at the moment something changes hands"),
    ("done", "By a deed done", "has trained, develops: an act that stays done"),
    ("held", "By a holding", "acquire, develop, or possess: a having"),
    ("office", "By office", "the Commission, an order: a public body, named"),
]
H = {
 "a3": ("hand", "placing on the market", "a1"), "a4": ("hand", "placing on the market", "a1"),
 "a6": ("hand", "placing on the market", "a1"), "a7": ("hand", "placing on the market", "a1"),
 "a8": ("hand", "placing on the market", "a1"),
 "x1": ("hand", "export, reexport, or transfer", None),
 "s3": ("done", "has trained, or initiated the training of", "s1"),
 "s5": ("done", "has trained, or initiated the training of", "s1"),
 "n2": ("done", "has trained, or initiated the training of", "n1"),
 "m1": ("done", "large frontier developer", "unchecked"),
 "p1": ("done", "Developers", None),
 "e1": ("held", "acquire, develop, or possess", None),
 "a10": ("office", "The Commission", None),
 "m2": ("office", "Such order", None),
}
assert set(H) == {k for k in R if R[k][1] != "none"}
for k, (h, w, via) in H.items():
    if via is None:
        assert w in P[k]["quote"], (k, w)
    elif via != "unchecked":
        assert w in P[via]["quote"] and P[via]["doc"] == P[k]["doc"], (k, via)

rows = []
for k, p in P.items():
    mood, who, to, place, words, outside = R[k]
    assert words in p["quote"], (k, words)          # the mood is read from the quoted words
    stand = "preamble" if k == "a4" else STAND[p["doc"]]
    doc = F["documents"][p["doc"]]
    rows.append({"id": k, "doc": p["doc"], "what": doc["what"], "url": doc["url"],
                 "quote": p["quote"].replace("10\\26\\", "10^26").replace("10 25", "10^25"),
                 "found": p["found"], "mood": mood, "who": who, "to": to, "place": place,
                 "words": words, "outside": outside, "stand": stand,
                 "handle": H[k][0] if k in H else None, "hwords": H[k][1] if k in H else None,
                 "hvia": H[k][2] if k in H else None})

# What the page states.
n = len(rows)
force = [r for r in rows if r["stand"] == "force"]
lever = [r for r in force if r["mood"] in ("command", "penalty")]
who_lever = Counter(r["who"] for r in lever)
cmd_holder = [r["id"] for r in rows if r["mood"] in ("command", "penalty") and r["who"] == "holder"]
public_given = [r["id"] for r in force if r["to"] == "the public"]
public_withheld = [r["id"] for r in force if r["to"] == "withheld from the public"]
by_stand = Counter(r["stand"] for r in rows)
by_mood = Counter(r["mood"] for r in rows)
unverified = [r["id"] for r in rows if r["found"] is not True]

assert n == 35
assert len(force) == 15 and by_stand == {"force": 15, "preamble": 1, "notyet": 4, "bill": 3, "gone": 6, "notlaw": 6}
assert by_mood == {"command": 10, "penalty": 1, "power": 1, "terms": 12, "ought": 1, "promise": 1, "record": 9}
assert sorted(r["id"] for r in lever) == ["a10", "a3", "a6", "a7", "a8", "s3", "s5", "x1"]
assert who_lever == {"developer": 6, "authority": 1, "exporter": 1} and who_lever["holder"] == 0
assert cmd_holder == ["e1"] and STAND[P["e1"]["doc"]] == "gone"
lever_handle = Counter(r["handle"] for r in lever)
all_handle = Counter(r["handle"] for r in rows if r["handle"])
assert lever_handle == {"hand": 5, "done": 2, "office": 1} and lever_handle["held"] == 0
assert all_handle == {"hand": 6, "done": 5, "held": 1, "office": 2}
assert [r["id"] for r in rows if r["handle"] == "held"] == ["e1"]
# the two commands in force that reach internal use are the two picked by a deed done
assert sorted(r["id"] for r in lever if r["handle"] == "done") == ["s3", "s5"]
assert public_given == ["a10"] and public_withheld == ["s4"]
assert [r["id"] for r in rows if r["mood"] == "ought"] == ["a4"]
assert [r["id"] for r in rows if r["stand"] == "preamble"] == ["a4"]
assert unverified == ["s1", "s2", "s3", "s4", "s5"]      # the Field reached California's text only through a page-fetch service
# The Field's own counts, which this reading must not contradict.
assert F["counts"]["in_force"] == 3 and F["counts"]["in_force_addressing_holder"] == 0
assert F["kept_share"]["total_pct"] == 37.78

RECITAL = {"should": 10, "shall": 0}    # recital 97's verbs, counted in the Act as fetched (asserted below when the file is given)

results = {
    "recital_97": RECITAL,
    "built_on": {"file": "results69.json", "sha256": SHA, "study": F["study"], "date": F["date"]},
    "passages": n, "by_stand": dict(by_stand), "by_mood": dict(by_mood),
    "in_force_enacting": len(force),
    "lever_in_force": sorted(r["id"] for r in lever),
    "lever_in_force_by_who": {"developer": 6, "authority": 1, "exporter": 1, "holder": 0},
    "command_to_holder_any_standing": cmd_holder,
    "in_force_handed_to_public": public_given, "in_force_withheld_from_public": public_withheld,
    "mood_word_outside_quote": {"checked": [k for k in R if R[k][5] == "checked"],
                                "unchecked": [k for k in R if R[k][5] == "unchecked"]},
    "not_checked_against_publisher_bytes": unverified,
    "kept_share_pct": F["kept_share"]["total_pct"],
    "handle_all": dict(all_handle),
    "lever_in_force_by_handle": {"hand": 5, "done": 2, "office": 1, "held": 0},
}

# The Field's second case (its session 268): one relation written from two ends. Read in the texts as fetched.
FINES = [
 (1962, "Regulation No 17", "Article 15(1)", "the Commission", "power", "The Commission may by decision impose on undertakings or associations of undertakings fines", "reg17"),
 (2003, "Regulation (EC) No 1/2003", "Article 23(1)", "the Commission", "power", "The Commission may by decision impose on undertakings and associations of undertakings fines", "reg1_2003"),
 (2016, "GDPR", "Article 83(4)", "each state's supervisory authority", "liability", "be subject to administrative fines up to 10 000 000 EUR", "gdpr"),
 (2022, "Digital Markets Act", "Article 30(1)", "the Commission", "power", "the Commission may impose on a gatekeeper fines", "dma"),
 (2022, "Digital Services Act", "Article 74(1)", "the Commission", "power", "the Commission may impose on the provider of the very large online platform", "dsa"),
 (2024, "AI Act", "Article 99(3)", "each state's authorities, under rules the state lays down", "liability", "shall be subject to administrative fines of up to EUR 35 000 000", "aiact"),
 (2024, "AI Act", "Article 100(1) and (2)", "the European Data Protection Supervisor", "both", "The European Data Protection Supervisor may impose administrative fines on Union institutions", "aiact"),
 (2024, "AI Act", "Article 101(1)", "the Commission", "power", "The Commission may impose on providers of general-purpose AI models fines", "aiact"),
]
results["fining_clauses"] = {"power": sum(f[4] == "power" for f in FINES), "liability": sum(f[4] == "liability" for f in FINES), "both": sum(f[4] == "both" for f in FINES)}
assert results["fining_clauses"] == {"power": 5, "liability": 2, "both": 1}
assert all((f[4] == "power") == (f[3] == "the Commission") for f in FINES if f[4] != "both")

if len(sys.argv) > 3:
    def text(path):
        t = open(path, encoding="utf-8").read()
        return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t)))
    A, N = text(sys.argv[2]), text(sys.argv[3])
    def before(k, lead, span=700):
        q = re.sub(r"\s+", " ", P[k]["quote"])
        i = A.find(q)
        assert i >= 0, k
        assert lead in A[max(0, i - span):i], (k, lead)
    before("a1", "Article 2 Scope 1. This Regulation applies to: (a)", 80)
    before("a2", "A general-purpose AI model shall be presumed to have high impact capabilities", 140)
    before("a6", "providers of general-purpose AI models with systemic risk shall: (a)")
    before("a7", "providers of general-purpose AI models with systemic risk shall: (a)", 1100)
    assert ("Providers of general-purpose AI models shall: (a) draw up and keep up-to-date the technical documentation "
            "of the model, including its training and testing process and the results of its evaluation, which shall "
            "contain, at a minimum, the information set out in Annex XI for the purpose of providing it, upon request, "
            "to the AI Office and the national competent authorities") in A
    assert ("It should be understood that the obligations for the providers of general-purpose AI models should apply "
            "once the general-purpose AI models are placed on the market.") in A
    i = A.find("(97) The notion of general-purpose AI models")
    j = A.find("should always be subject to the relevant obligations under this Regulation")
    assert 0 < i < j < A.find("(98)", i)                    # the sentence stands in recital 97
    rec = A[i:A.find("(98)", i)]
    assert {"should": len(re.findall(r"\bshould\b", rec)), "shall": len(re.findall(r"\bshall\b", rec))} == RECITAL
    assert "The Commission may impose on providers of general-purpose AI models fines not exceeding 3 %" in A
    assert ("the preamble to a Community act has no binding legal force and cannot be relied on as a ground for "
            "derogating from the actual provisions of the act in question") in N
    results["own_reading_asserted"] = True

if len(sys.argv) > 4:
    import os
    d = sys.argv[4]
    def text2(name):
        t = open(os.path.join(d, name), encoding="utf-8", errors="replace").read()
        return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", t)))
    T = {"aiact": A, "reg17": text2("reg17.html"), "reg1_2003": text2("reg1_2003.html"), "gdpr": text2("gdpr.html"),
         "dma": text2("dma.html"), "dsa": text2("dsa.html")}
    for f in FINES:
        assert f[5] in T[f[6]], f[:3]
    assert "shall be subject to administrative fines of up to EUR 1 500 000" in A            # Article 100(2): both ends in one article
    assert "Each supervisory authority shall ensure that the imposition of administrative fines" in T["gdpr"]
    assert "Member States shall lay down the rules on penalties and other enforcement measures" in A
    assert A.count("When deciding whether to impose an administrative fine") == 2            # Articles 99(7) and 100(1)
    assert ("\u2018provider\u2019 means a natural or legal person, public authority, agency or other body that develops an AI system "
            "or a general-purpose AI model or that has an AI system or a general-purpose AI model developed and places it "
            "on the market") in A
    E = text2("eo14110.htm")
    q = re.sub(r"\s+", " ", P["e1"]["quote"])
    i = E.find(q)
    assert i >= 0 and "the Secretary of Commerce shall require: (i)" in E[i - 1800:i]     # e1's governing verb
    Hf = re.sub(r"\s+", " ", open(os.path.join(d, "hohfeld1917.txt"), encoding="utf-8", errors="replace").read()).replace("- ", "")
    for s in ['A right in rem is not a right "against a thing"',
              "that all rights in rem are against persons",
              "In the one case the money is owed to A ; in the other case it is owned by A.",
              "are the legal liabilities, in other persons",
              "subject, nolens volens, to the changes of jural relations involved in the exercise of A's powers",
              "power immunity Correlatives"]:
        assert s in Hf, s
    results["second_state_reading_asserted"] = True

open("results.json", "w").write(json.dumps(results, indent=1) + "\n")
open("data.js", "w").write("const D=" + json.dumps(
    {"rows": rows, "stands": STANDS, "moods": MOODS, "who": WHO, "recital": RECITAL, "handles": HANDLES,
     "fines": [dict(zip(("year", "act", "place", "by", "end", "words"), f[:6])) for f in FINES]}, ensure_ascii=False, separators=(",", ":")) + ";\n")
print("ok", n, "passages;", len(lever), "levers in force;", dict(who_lever), RECITAL)
