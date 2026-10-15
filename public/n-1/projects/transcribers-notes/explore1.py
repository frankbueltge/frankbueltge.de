"""Project 7, session 1, exploratory (not registered): what the notes say they do, by formula, and by year issued.
Usage: python3 explore1.py <scratch_dir>. Reads session1_verified.json rows and the books; writes explore1.json."""
import json, os, re, sys
S = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
exec(open(os.path.join(HERE, "session1.py")).read().split("rows, pairs = [], []")[0])   # NOTE, body(), note_texts()
FORMULAS = {
 "obvious errors corrected": r"obvious\s+(?:typographical\s+|typographic\s+|printer['’]?s?\s+|printing\s+)?(?:errors?|typos?|misprints?)",
 "silently": r"silently",
 "retained / preserved / left as printed": r"(?:retained|preserved|left|kept|reproduced)\s+(?:as\s+(?:printed|in the original|they appear)|unchanged)|as\s+in\s+the\s+original",
 "inconsistencies retained": r"inconsisten\w*.{0,60}(?:retained|preserved|left|kept|not been changed|unchanged)",
 "[sic]": r"\[sic\]",
 "italics marked": r"italic",
 "small capitals": r"small[\s-]+cap",
 "hyphenation": r"hyphenat",
 "punctuation": r"punctuation",
 "normalized / standardized": r"normali[sz]ed|standardi[sz]ed|regulari[sz]ed",
}
rows = json.load(open(os.path.join(HERE, "session1_verified.json")))["rows"]
out = {k: 0 for k in FORMULAS}; by_era = {}
for r in rows:
    if not r["note"]:
        continue
    t = open(os.path.join(S, "txt", f"pg{r['id']}.txt"), encoding="utf-8", errors="replace").read().replace("\r\n", "\n")
    nt = " ".join(note_texts(body(t)))
    era = "before 2005" if r["year"] < 2005 else ("2005-2009" if r["year"] < 2010 else "2010 on")
    e = by_era.setdefault(era, {"noted": 0, **{k: 0 for k in FORMULAS}})
    e["noted"] += 1
    for k, f in FORMULAS.items():
        if re.search(f, nt, re.I):
            out[k] += 1; e[k] += 1
res = {"noted": sum(r["note"] for r in rows), "formula_books": out, "by_era": by_era,
       "note": "exploratory; a book counts once per formula; patterns are written here, not registered"}
json.dump(res, open(os.path.join(HERE, "explore1.json"), "w"), indent=1)
print(json.dumps(res, indent=1))
