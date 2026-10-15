"""How near — build. Run: python3 -I build.py <cset_brief.pdf> <iep_luck.html>
Checks every quotation word for word against its fetched source (sha256 recorded), then embeds
data.json (written by analyse.py) and the quotations into template.html -> index.html.
  CSET brief: https://cset.georgetown.edu/wp-content/uploads/20230022-Adding-structure-to-AI-Harm-FINAL.pdf
  IEP, "Luck" (F. Broncano-Berrocal): https://iep.utm.edu/luck/
The PDF is read with pdftotext (poppler), used as a tool."""
import hashlib, html, json, re, subprocess, sys
from pathlib import Path

here = Path(__file__).parent
pdf, iep = Path(sys.argv[1]), Path(sys.argv[2])
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
norm = lambda t: re.sub(r"\s+", " ", t).replace("“", '"').replace("”", '"').replace("’", "'")
cset = norm(subprocess.run(["pdftotext", str(pdf), "-"], capture_output=True, text=True, check=True).stdout)
luck = norm(html.unescape(re.sub(r"<[^>]+>", "", iep.read_text(encoding="utf-8"))))

Q = {
    "cset_near": (cset, 'AI is considered to present an imminent potential for harm in incidents describing "near miss" situations, where harm would have occurred had it not been for randomness, luck, or atypical intervention.'),
    "iep_easy": (luck, "Modal accounts accordingly explain luck in terms of the notion of easy possibility."),
    "iep_lottery": (luck, "According to M1, one is lucky to win a fair lottery because in a wide class of close possible worlds one would lose."),
    "iep_close": (luck, "Closeness is simply assumed to be a function of how intuitively similar possible worlds are to the actual world."),
    "iep_context": (luck, "Pritchard leaves as a contextual matter what features of the actual world need to be fixed in our evaluation of close possible worlds."),
    "iep_riggs": (luck, "Riggs (2007) argues that M1 is defective precisely because there is no non-arbitrary way to fix the relevant initial conditions."),
}
for k, (src, s) in Q.items():
    assert s in src, f"quotation {k} not found in its source"

d = json.loads((here / "data.json").read_text())
r = d["results"]; x = d["exploratory"]
# the counts the page states in prose; the build fails if the data moved under them
assert (r["pairs"], r["no_near_language"]["either_near"], r["no_near_language"]["both_near"]) == (158, 14, 3)
assert r["P4_near_calls_on_texts_without_near_language"] == 17 and r["near_language"]["pairs"] == 1
assert (x["near_miss_calls"], x["calls_description_has"], x["calls_note_has_counterfactual"], x["calls_note_empty"], x["calls_any_report_has"]) == (26, 0, 9, 4, 21)
assert (x["pairs_whose_reports_carry_near_language"]["pairs"], x["pairs_whose_reports_carry_near_language"]["either_near"]) == (121, 10)
assert (x["pairs_whose_reports_do_not"]["pairs"], x["pairs_whose_reports_do_not"]["either_near"]) == (37, 4)
assert len(d["cases"]) == 23 and sum(1 for c in d["cases"] if (c["final"] or {}).get("level") == "AI tangible harm near-miss") == 10

d["quotes"] = {k: s for k, (_, s) in Q.items()}
d["sources"] = {"cset_brief": {"sha256": sha(pdf), "url": "https://cset.georgetown.edu/wp-content/uploads/20230022-Adding-structure-to-AI-Harm-FINAL.pdf",
                               "cite": "Mia Hoffmann and Heather Frase, Adding Structure to AI Harm: An Introduction to CSET's AI Harm Framework, CSET Issue Brief, July 2023"},
                "iep_luck": {"sha256": sha(iep), "url": "https://iep.utm.edu/luck/",
                             "cite": "Fernando Broncano-Berrocal, \"Luck\", Internet Encyclopedia of Philosophy, section 4, Modal Accounts (read 2026-10-09)"}}
(here / "data.json").write_text(json.dumps(d, indent=1, ensure_ascii=False) + "\n")
page = (here / "template.html").read_text().replace("__DATA__", json.dumps(d, ensure_ascii=False).replace("</", "<\\/"))
(here / "index.html").write_text(page)
print("built:", len(page), "bytes")
