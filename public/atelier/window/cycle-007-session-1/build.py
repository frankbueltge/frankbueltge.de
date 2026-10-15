"""The Hinge — build. Run:
  python3 -I build.py <phillips_extract.txt> <chatham.pdf> <fli.html> <wp.txt> <bennett.pdf>
Checks the four keepers' sources and Bennett 1984 against the sha256 recorded below, checks every
quotation in coding.json word for word against its source, counts, writes data.json, and embeds it
into template.html -> index.html. No source text is committed; the PDFs are read with pdftotext
(poppler), used as a tool.
  Phillips 1998: web-archive copy 20230712090839 of nuclearfiles.org "20 Mishaps That Might Have
    Started Accidental Nuclear War", read through the web-research extraction fallback (text only,
    so the hash below is of the extracted text, not of a page).
  Chatham House 2014: https://www.chathamhouse.org/sites/default/files/field/field_document/20140428TooCloseforComfortNuclearUseLewisWilliamsPelopidasAghlani.pdf
  FLI 2016: https://futureoflife.org/resource/nuclear-close-calls-a-timeline/
  Wikipedia: https://en.wikipedia.org/w/index.php?title=Nuclear_close_calls&action=raw
  Bennett 1984: https://www.earlymoderntexts.com/assets/jfb/countemp.pdf"""
import hashlib, html, json, re, subprocess, sys
from pathlib import Path

here = Path(__file__).parent
ph_p, ch_p, fli_p, wp_p, ben_p = map(Path, sys.argv[1:6])
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
SHA = {"CH": "36034f8de3301efee226951b4185eea02f8cb671ac53eadc7c788f2e4dfff2af",   # same bytes as the Field's study 7
       "FLI": "ae61d4d66cf51aa079cc5237e808679b9c46289d328b68ee5f9f28835fa2dbbd",
       "WP": "4bc8bfee8ca7b859f39c34768b418efc55d37faf443889f92ab191b026331ce8",
       "BEN": "f54849acfdbb281eff37d33aece10438ff8e3c13bcc29f8d9b861c7fb73fc8a9"}
for k, p in (("CH", ch_p), ("FLI", fli_p), ("WP", wp_p), ("BEN", ben_p)):
    assert sha(p) == SHA[k], f"{k}: source bytes differ from the ones coded"

def norm(t):
    t = t.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'").replace("|", " ")
    return re.sub(r"\s+", " ", t)
pdf = lambda p: subprocess.run(["pdftotext", str(p), "-"], capture_output=True, text=True, check=True).stdout

def fli_text(p):
    t = p.read_text(encoding="utf-8")
    s = t.find('\\"date\\":[{')
    def edge(i, step):          # the nearest quote that is not escaped
        while True:
            i = t.rfind('"', 0, i) if step < 0 else t.find('"', i + 1)
            k, n = i, 0
            while t[k - 1] == "\\": n += 1; k -= 1
            if n % 2 == 0: return i
    tl = json.loads(json.loads(t[edge(s, -1):edge(s, 1) + 1]))["timeline"]["date"]
    cl = lambda x: html.unescape(re.sub(r"<[^>]+>", " ", x or ""))
    return " ".join(cl(i.get("headline")) + " " + cl(i.get("text")) for i in tl), len(tl)

def wp_text(p):
    s = p.read_text(encoding="utf-8")
    s = re.sub(r"<ref[^>]*/>", "", s); s = re.sub(r"<ref.*?</ref>", "", s, flags=re.S)
    s = re.sub(r"\{\{[^{}]*\}\}", "", s); s = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]*)\]\]", r"\1", s)
    return re.sub(r"'{2,}", "", s)

fli, fli_n = fli_text(fli_p)
SRC = {"PH": norm(ph_p.read_text(encoding="utf-8")), "CH": norm(pdf(ch_p)), "FLI": norm(fli),
       "WP": norm(wp_text(wp_p)), "BEN": norm(pdf(ben_p))}
assert fli_n == 32, "FLI timeline item count moved"

c = json.loads((here / "coding.json").read_text())
checked = 0
def has(k, q):
    global checked
    assert norm(q) in SRC[k], f"quotation not found in {k}: {q[:70]}"
    checked += 1
for k, v in c["list_level"].items(): has(k, v["quote"])
for e in c["events"]:
    for x in e["entries"]:
        for f in ("quote", "quote2", "cons_quote", "note_quote"):
            if x.get(f): has(x["k"], x[f])
for o in c["observations"]:
    for k, q in o["quotes"]: has(k, q)

BEN = {
 "nixon": "Let's suppose that at moment T in 1972 if Nixon had pressed a certain button a third World War would have occurred",
 "launch": "closest P-worlds can contain miracles which launch the antecedent, not ones which intervene between antecedent and consequent.",
 "track": "a divergence miracle pushes a world off the track of the actual world, while a convergence miracle puts a world onto the exact path of the actual world.",
 "level2": "Neither contains a large miracle, but x has a smaller spatio-temporal region of perfect match with our world than y does",
 "level3": "Neither contains a large miracle, and the regions of perfect match are equal, but x contains a small miracle and y does not",
 "brain": "But from his standpoint it is a small miracle, a mere re-routing of a few electrons in one brain.",
}
for q in BEN.values(): has("BEN", q)

# counts
E = [x for e in c["events"] for x in e["entries"]]
H = [x for x in E if x["hinge"]]
multi = [e for e in c["events"] if sum(x["hinge"] for x in e["entries"]) >= 2]
diff = [e["id"] for e in multi if e["same"] is False]
assert all(e["same"] is not None for e in multi) and all(e["same"] is None for e in c["events"] if e not in multi)
kinds = {k: sum(x["kind"] == k for x in H) for k in ("person", "system", "chance")}
cons = {k: sum(x["cons"] == k for x in E) for k in ("war", "detonation", "misreading", "other", "unstated")}
stated = len(E) - cons["unstated"]
by_keeper = {k: {"entries": sum(x["k"] == k for x in E), "hinge": sum(x["k"] == k for x in H)} for k in c["keepers"]}
R = {"events": len(c["events"]), "entries": len(E), "hinge": len(H), "no_hinge": len(E) - len(H),
     "multi": len(multi), "different": len(diff), "different_ids": diff, "kinds": kinds, "cons": cons,
     "cons_stated": stated, "by_keeper": by_keeper}
P = [
 {"p": "P1", "bar": "at least 30 % of entries name no hinge", "value": f"{R['no_hinge']} of {R['entries']} ({100*R['no_hinge']/R['entries']:.1f} %)", "verdict": "held" if R["no_hinge"] / R["entries"] >= .30 else "failed"},
 {"p": "P2", "bar": "of events with two or more hinges, at least a quarter carry different ones", "value": f"{R['different']} of {R['multi']} ({100*R['different']/R['multi']:.0f} %)", "verdict": "held" if R["different"] / R["multi"] >= .25 else "failed"},
 {"p": "P3", "bar": "a person in more than half the named hinges", "value": f"{kinds['person']} of {R['hinge']} ({100*kinds['person']/R['hinge']:.0f} %)", "verdict": "held" if kinds["person"] / R["hinge"] > .5 else "failed"},
 {"p": "P4", "bar": "war in more than half the stated consequents", "value": f"{cons['war']} of {stated} ({100*cons['war']/stated:.0f} %)", "verdict": "held" if cons["war"] / stated > .5 else "failed"},
]
# the numbers the page states in prose; the build fails if the coding moved under them
assert (R["entries"], R["hinge"], R["no_hinge"], R["multi"], R["different"]) == (45, 26, 19, 9, 4), R
assert kinds == {"person": 20, "system": 4, "chance": 2} and (cons["war"], stated) == (8, 17), (kinds, cons)
assert [p["verdict"] for p in P] == ["held", "held", "held", "failed"]

d = {"coding": c, "results": R, "predictions": P, "bennett": BEN, "quotations_checked": checked,
     "sources": {
      "PH": {"cite": "Alan F. Phillips, 20 Mishaps That Might Have Started Accidental Nuclear War, Nuclear Age Peace Foundation (nuclearfiles.org), page copyright 1998", "url": "http://www.nuclearfiles.org/menu/key-issues/nuclear-weapons/issues/accidents/20-mishaps-maybe-caused-nuclear-war.htm", "access": "direct request and web-archive copy: connection reset; web-archive copy 20230712090839 read through the web-research extraction fallback", "sha256_of_extracted_text": sha(ph_p)},
      "CH": {"cite": "Patricia Lewis, Heather Williams, Benoit Pelopidas, Sasan Aghlani, Too Close for Comfort: Cases of Near Nuclear Use and Options for Policy, Chatham House, April 2014", "url": "https://www.chathamhouse.org/sites/default/files/field/field_document/20140428TooCloseforComfortNuclearUseLewisWilliamsPelopidasAghlani.pdf", "sha256": SHA["CH"]},
      "FLI": {"cite": "Ariel Conn, Accidental Nuclear War: a Timeline of Close Calls, Future of Life Institute, 23 February 2016, as served 2026-10-10", "url": "https://futureoflife.org/resource/nuclear-close-calls-a-timeline/", "sha256": SHA["FLI"]},
      "WP": {"cite": "Wikipedia, Nuclear close calls, wikitext as served 2026-10-10 (revision id not obtained)", "url": "https://en.wikipedia.org/w/index.php?title=Nuclear_close_calls&action=raw", "sha256": SHA["WP"]},
      "BEN": {"cite": "Jonathan Bennett, Counterfactuals and temporal direction, The Philosophical Review 93 (1984), pp. 57-91; the author's own copy", "url": "https://www.earlymoderntexts.com/assets/jfb/countemp.pdf", "sha256": SHA["BEN"]},
      "FIELD": {"cite": "The Field, study 7, Who keeps the close calls (2026-10-10): event matching and keeper lists", "url": "https://github.com/frankbueltge/field-research/tree/main/artifacts/2026-10-10-who-keeps-the-close-calls"}}}
(here / "data.json").write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n")
page = (here / "template.html").read_text().replace("__DATA__", json.dumps(d, ensure_ascii=False).replace("</", "<\\/"))
(here / "index.html").write_text(page)
print(f"quotations checked: {checked}; entries {R['entries']}, hinges {R['hinge']}; built {len(page)} bytes")
