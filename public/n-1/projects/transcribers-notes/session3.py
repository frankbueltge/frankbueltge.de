"""Project 7, session 3: does the HTML edition keep the corrections the text-file note does not list? (SESSION3.md)

Usage: python3 session3.py <scratch_dir> [verify3.json]
Reads sources3.json, session1_verified.json, session1_rest.json and <scratch_dir>/html/pg<n>-images.html;
writes session3.json (or session3_verified.json when a verify file of struck books is given) and marks3.json (per book: count and
the first three marks with their text, for reading).
Definitions are those registered in SESSION3.md, written out here. PAIR and NOTE are imported unchanged from session1.py's text.
"""
import html, json, os, random, re, statistics, sys
from html.parser import HTMLParser

SCRATCH = sys.argv[1]
HERE = os.path.dirname(os.path.abspath(__file__))
_V = json.load(open(sys.argv[2])) if len(sys.argv) > 2 else {}
STRUCK = set(_V.get("struck_books", []))          # books whose every read mark is false
STRUCK_LISTS = set(_V.get("struck_lists", []))    # books whose every HTML list pair is false (added in session 3, JOURNAL3 item 8)

# the registered patterns of session 1, unchanged
NOTE = re.compile(r"transcriber[’'`]?s?[’'`]?\s+notes?|notes? (?:from|by) the transcriber", re.I)
QT = r"(?:[\"“]([^\"“”\n]{1,40})[\"”]|[‘']([^‘’'\n]{1,40})[’']|_([^_\n]{1,40})_)"
BARE = r"([^\s\"“”‘’_]{1,40})"
TOK = r"(?:" + QT + "|" + BARE + ")"
VERB = r"(?:changed|corrected|amended|altered|emended)\s+to"
REPL = r"replaced\s+(?:with|by)"
ARROW = r"(?:->|→|=>|==>|-->)"
PAIR = re.compile(TOK + r"\s*(?:(?:\s(?:was|has been|have been|is))?\s+(?:" + VERB + "|" + REPL + r")\s+|" + ARROW + r")\s*" + TOK)

EXCLUDED = {"abbr", "acronym", "img", "a", "link", "meta", "area", "iframe", "svg", "html", "head", "body", "table", "col", "th", "td"}
CLASS = re.compile(r"corr|typo|tn|transnote|trans-note|err|sic|change", re.I)
TITLE = re.compile(r"orig|printed|typo|sic\b|error|misprint|in (?:the )?(?:book|text|source)|was:|changed|corrected", re.I)


def is_mark(tag, attrs):
    a = dict(attrs)
    t = (a.get("title") or "").strip()
    if not t or tag in EXCLUDED:
        return False
    if tag in ("ins", "del"):
        return True
    if any(CLASS.search(c) for c in (a.get("class") or "").split()):
        return True
    return bool(TITLE.search(t))


class Marks(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.marks, self.open, self.text = [], [], []

    def handle_starttag(self, tag, attrs):
        if is_mark(tag, attrs):
            self.marks.append({"tag": tag, "class": dict(attrs).get("class"), "title": dict(attrs).get("title").strip(), "text": ""})
            self.open.append((tag, len(self.marks) - 1))

    def handle_endtag(self, tag):
        if self.open and self.open[-1][0] == tag:
            self.open.pop()

    def handle_data(self, d):
        self.text.append(d)
        for _, k in self.open:
            if len(self.marks[k]["text"]) < 60:
                self.marks[k]["text"] += d


def html_pairs(text):
    out = []
    for m in NOTE.finditer(text):
        seg = text[m.start(): m.start() + 8000]
        cut = re.search(r"\n[ \t]*\n[ \t]*\n[ \t]*\n", seg)
        seg = seg[: cut.start()] if cut else seg
        for p in PAIR.finditer(seg):
            g = p.groups()
            x = next((v for v in g[:4] if v), None)
            y = next((v for v in g[4:] if v), None)
            if x and y:
                out.append((x, y))
    return out


def analyse(raw):
    p = Marks()
    p.feed(raw)
    return p.marks, html_pairs("".join(p.text).replace("\r\n", "\n"))


if __name__ == "__main__" and SCRATCH == "--selftest":
    for s in ['<span class="corr" title="Original: teh">the</span>', '<ins title="was: vogage">voyage</ins>',
              '<abbr title="Mister">Mr.</abbr>', '<span title="Greek: logos">λόγος</span>', '<span class="pagenum" title="12">12</span>',
              '<span title="sic">recieve</span>', '<a class="corr" title="orig">x</a>', '<td title="printed: 1880">1890</td>',
              '<p>Transcriber\'s Note</p><p>"vogage" changed to "voyage"</p>']:
        print(repr(s), "->", [(m["tag"], m["title"], m["text"]) for m in analyse(s)[0]], analyse(s)[1])
    sys.exit()

rows = json.load(open(os.path.join(HERE, "session1_verified.json")))["rows"] + json.load(open(os.path.join(HERE, "session1_rest.json")))["rows"]
year = {r["id"]: r["year"] for r in rows}
src = json.load(open(os.path.join(HERE, "sources3.json")))["files"]
books, marks_out = [], {}
for i, v in src.items():
    i = int(i)
    path = os.path.join(SCRATCH, "html", f"pg{i}-images.html")
    if "error" in v or not os.path.exists(path):
        books.append({"id": i, "group": v["group"], "year": year[i], "html": False})
        continue
    marks, pairs = analyse(open(path, encoding="utf-8", errors="replace").read())
    nm = 0 if i in STRUCK else len(marks)
    if i in STRUCK_LISTS:
        pairs = []
    books.append({"id": i, "group": v["group"], "year": year[i], "html": True, "marks": nm, "html_pairs": len(pairs),
                  "record": nm > 0 or len(pairs) > 0})
    if marks:
        marks_out[i] = {"n": len(marks), "first": marks[:3], "pairs": pairs[:3]}


def share(g, key="record"):
    b = [x for x in books if x["group"] == g and x["html"]]
    return {"books_html": len(b), "with": sum(1 for x in b if x[key]), "share": round(sum(1 for x in b if x[key]) / len(b), 4) if b else None}


res = {g: share(g) for g in "SLO"}
for g in "SLO":
    b = [x for x in books if x["group"] == g and x["html"]]
    res[g]["with_marks"] = sum(1 for x in b if x["marks"])
    res[g]["with_html_list"] = sum(1 for x in b if x["html_pairs"])
    res[g]["no_html"] = sum(1 for x in books if x["group"] == g and not x["html"])
marked = [x["marks"] for x in books if x["html"] and x["marks"]]
L = [x for x in books if x["group"] == "L" and x["html"]]
res["predictions"] = {
    "P1_S_record_share_below_one_third": res["S"]["share"] is not None and res["S"]["share"] < 1 / 3,
    "P2_L_half_with_marks": bool(L) and sum(1 for x in L if x["marks"]) / len(L) >= 0.5,
    "P3_S_share_at_least_O": res["S"]["share"] is not None and res["O"]["share"] is not None and res["S"]["share"] >= res["O"]["share"],
    "P4_median_marks_at_least_5": bool(marked) and statistics.median(marked) >= 5,
}
res["median_marks_where_marked"] = statistics.median(marked) if marked else None
res["read_sample_seed3"] = sorted(random.Random(3).sample(sorted(marks_out), min(40, len(marks_out))))
name = "session3_verified.json" if STRUCK else "session3.json"
json.dump({"result": res, "books": books}, open(os.path.join(HERE, name), "w"), indent=0)
json.dump(marks_out, open(os.path.join(HERE, "marks3.json"), "w"), indent=0, ensure_ascii=False)
print(json.dumps(res, indent=1))
