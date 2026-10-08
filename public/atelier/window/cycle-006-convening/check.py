"""Check data.json and index.html against what the page and the bulletin say. Run: python3 -I check.py"""
import json, re
from pathlib import Path
here = Path(__file__).parent
d = json.loads((here / "data.json").read_text()); page = (here / "index.html").read_text()
bad = 0
def ok(c, m):
    global bad; print(("ok   " if c else "FAIL ") + m); bad += not c
inc = [r for r in d["rows"] if r["kind"] == "incident"]; reg = [r for r in d["rows"] if r["kind"] == "regime"]
ok(len(inc) == 14 and len(reg) == 2, "14 incidents, 2 regimes")
ok(sum(r["A"] for r in inc) == 0, "A: 0 of 14 (the Field's prong a)")
ok(sum(r["B"] for r in inc) == 6, "B: 6 of 14 (the Field's prong b passes)")
ok(sum(r["C"] for r in inc) == 10, "C: 10 of 14 (4 first reports on the maker's domain)")
ok(sum(r["D"] for r in inc) == 0, "D: 0 of 14")
ok(sum(r["B"] and r["C"] for r in inc) == 6, "B and C together: 6 incidents")
ok(sum(r["looker"] == "maker" for r in inc) == 8, "the maker looked first in 8")
ok(d["summary"]["pass_all_four"] == ["NASA Aviation Safety Reporting System"], "only the aviation regime meets all four")
ok([r["id"] for r in reg if r["A"] and r["B"] and r["C"] and not r["D"]] == ["EU AI Act, Art. 73 and 55(1)(c)"], "the AI Act meets A, B, C and not D")
ok(all(len(v["sha256"]) == 64 for v in d["sources"].values()), "three source hashes recorded")
ok("__DATA__" not in page and json.dumps(d, ensure_ascii=False) in page, "page carries data.json exactly")
pq = re.search(r'const PQ = "([^"]+)"', page).group(1); pd = re.search(r'const PD = "([^"]+)"', page).group(1)
b = (here.parent.parent / "BULLETIN.md").read_text()
ok(len(pq) <= 200 and len(pd) <= 300, f"proposal lengths {len(pq)} / {len(pd)} within 200 / 300")
ok(f"Proposed question: {pq}\n" in b and f"Docks onto: {pd}\n" in b, "bulletin carries the page's proposal verbatim")
ok(pd.count(". ") == 0 and pq.count("? ") == 0, "one sentence each")
for w in ["0 of 14", "6 times", "10 times", "all four"]:
    ok(w in page, f"page says '{w}'")
print("failures:", bad); raise SystemExit(1 if bad else 0)
