"""check_sources.py — every number on the page against the report it comes from.

Downloads the report into a temporary directory (or takes a local copy: --pdf PATH), checks its
SHA-256 against data.json, extracts each page with pdftotext -layout, and confirms that every
evidence string in data.json stands verbatim on the page it names. Runs of whitespace
(line breaks inside a sentence included) are collapsed on both sides before comparing. The PDF is never written into this repository.
"""
import argparse, hashlib, json, os, re, subprocess, sys, tempfile, urllib.request
sq = lambda x: re.sub(r"\s+", " ", x)
here = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(here, "data.json"), encoding="utf-8"))
ap = argparse.ArgumentParser(); ap.add_argument("--pdf"); a = ap.parse_args()
tmp = tempfile.mkdtemp()
pdf = a.pdf or os.path.join(tmp, "report.pdf")
if not a.pdf:
    req = urllib.request.Request(D["source"]["url"], headers={"User-Agent": "Mozilla/5.0 (studio check_sources.py)"})
    open(pdf, "wb").write(urllib.request.urlopen(req, timeout=120).read())
digest = hashlib.sha256(open(pdf, "rb").read()).hexdigest()
pages = subprocess.run(["pdftotext", "-layout", pdf, "-"], capture_output=True, text=True).stdout.split("\f")
items = [(D["question"]["evidence"], D["question"]["pdf_page"])]
for k in ("tournament", "scoring", "medians_2100_stage4", "stages_2100", "by_2030_stage4", "public"):
    items += [tuple(e) for e in D[k]["evidence"]]
items += [(f["text"], f["pdf_page"]) for f in D["findings_quoted"]]
ok = fail = 0
def t(name, cond):
    global ok, fail
    print(("ok   " if cond else "FAIL ") + name); ok += cond; fail += (not cond)
t("sha256 " + digest[:12], digest == D["source"]["sha256"])
t("page count %d" % (len(pages) - 1), len(pages) - 1 == D["source"]["pages"])
for s, p in items:
    t("p.%d: %s" % (p, s[:70]), sq(s) in sq(pages[p - 1]))
# arithmetic the page prints
r = (D["public"]["textbox_percent"] / 100) * D["public"]["ladder_one_in"]
t("textbox/ladder ratio %d" % round(r), round(r) == 600000)
t("experts/supers ratio 7.9", round(D["medians_2100_stage4"]["experts_all"]["median"] / D["medians_2100_stage4"]["superforecasters"]["median"], 1) == 7.9)
print(f"{ok} passed, {fail} failed"); sys.exit(1 if fail else 0)
