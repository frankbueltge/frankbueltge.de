"""Correction of 2026-10-08 (convening, session 2): three readings of the rules given by reference.

The presented count (10 rules name a machine as the writer of YES) read one rule by reference and
two not. The Field (blind second reading, handoff in its bulletin of 10-08) read all three by
reference: 12. The Studio (blind second reading, offered the same day) read none: 9. This script
fetches both readings, checks that the three differ only on the three by-reference markets, and adds
a `correction` block to results.json beside the presented numbers, which stay as presented.

Usage: python3 -I correction.py <dir for the sibling files, fetched if absent>
"""
import hashlib, json, sys, urllib.request
from pathlib import Path

here = Path(__file__).resolve().parent
d = Path(sys.argv[1]); d.mkdir(exist_ok=True)
SRC = {
    "field": "https://raw.githubusercontent.com/frankbueltge/field-research/main/artifacts/"
             "2026-10-08-does-the-rule-move-the-price/data/results.json",
    "studio": "https://raw.githubusercontent.com/frankbueltge/studio/main/works/2026-10-08-only-no/second_reading.json",
}
def get(k):
    f = d / f"{k}.json"
    if not f.exists():
        with urllib.request.urlopen(SRC[k], timeout=30) as r:
            f.write_bytes(r.read())
    b = f.read_bytes(); return json.loads(b), hashlib.sha256(b).hexdigest()

R = json.loads((here / "results.json").read_text()); R.pop("correction", None)
cells = R["cells"]; ids = [c["id"] for c in cells]
field, fh = get("field"); studio, sh = get("studio")
st = {r["id"]: r["cls"] for r in studio}
fd = {x["id"]: x["field"] for x in field["A"]["disagreements"]}
fl = {c["id"]: fd.get(c["id"], c["cls"]) for c in cells}  # the Field lists only where it differs
assert field["A"]["field_counts"] == {k: sum(v == k for v in fl.values()) for k in field["A"]["field_counts"]}

# The three markets whose rule is given by reference to another market (rule text read 2026-10-08).
REF = {
    "Ide0brMftTAknwNsOSJG": ("BKr7KGDSkT6U3dGlqxIk", "This is an intentional duplicate of"),
    "NxLWsWJvo1DCN6FtHZiP": ("mZoOercJWPMFPM6XxKfI", "Like this Market exept 50 years later."),
    "BmSlE6p5YlTavbXly9Ow": ("mZoOercJWPMFPM6XxKfI", "Like this Market exept 100 years later."),
}
for i, (_, q) in REF.items():  # each quotation checked against the rule text the presentation hashed
    with urllib.request.urlopen(f"https://api.manifold.markets/v0/market/{i}", timeout=30) as r:
        text = (json.loads(r.read()).get("textDescription") or "").strip()
    c = next(c for c in cells if c["id"] == i)
    assert q in text and hashlib.sha256(text.encode()).hexdigest() == c["desc_sha256"], i
cls = {c["id"]: c["cls"] for c in cells}
void = {c["id"] for c in cells if c["void"]}
readings = {
    "own_text": {"label": "only a rule written in the market's own text counts (the Studio's reading)",
                 "cls": {i: ("norule" if i in REF else cls[i]) for i in ids},
                 "void": void - set(REF)},
    "presented": {"label": "as presented: one rule by reference counted, two not",
                  "cls": dict(cls), "void": set(void)},
    "by_reference": {"label": "a rule given by reference counts as the referenced rule (the Field's reading)",
                     "cls": {i: (cls[REF[i][0]] if i in REF else cls[i]) for i in ids},
                     "void": void | {i for i in REF if REF[i][0] in void}},
}
# Every disagreement between the three readings lies on the three by-reference markets, and nowhere else.
for name, other in (("studio", st), ("field", fl)):
    diff = {i for i in ids if other[i] != cls[i]}
    assert diff <= set(REF), (name, diff)
assert readings["own_text"]["cls"] == st, "the own-text reading is the Studio's reading"
assert readings["by_reference"]["cls"] == fl, "the by-reference reading is the Field's reading"

out = {}
for k, r in readings.items():
    n = {c: sum(v == c for v in r["cls"].values()) for c in ("machine", "threshold", "unnamed", "norule")}
    out[k] = {"label": r["label"], "by_class": n, "void": len(r["void"]),
              "consistent": len({r["cls"][i] == cls[REF[i][0]] for i in REF}) == 1,
              "cls": {i: r["cls"][i] for i in REF}, "void_ids": sorted(r["void"] & set(REF))}
R["correction"] = {
    "date": "2026-10-08",
    "what": "The presented count of rules naming a machine as writer of YES (10) read the three rules given "
            "by reference inconsistently. Consistently read it is 12 (by reference) or 9 (own text only).",
    "by_reference": {i: {"refers_to": t, "quote": q} for i, (t, q) in REF.items()},
    "readings": out,
    "sources": {"field": {"url": SRC["field"], "sha256": fh, "kappa": field["A"]["kappa"], "agree": field["A"]["agree"]},
                "studio": {"url": SRC["studio"], "sha256": sh, "agree": sum(st[i] == cls[i] for i in ids)}},
    "also_corrected": "The method note said the two 'no rule' markets point to a sibling market without naming "
                      "which; their text names it (the 2100 market, mZoO).",
}
(here / "results.json").write_text(json.dumps(R, indent=1, ensure_ascii=False) + "\n")
print(json.dumps({k: (v["by_class"], v["void"], v["consistent"]) for k, v in out.items()}, indent=1))
