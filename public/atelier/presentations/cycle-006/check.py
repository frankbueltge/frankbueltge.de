"""Checks on results.json and the built page. Usage: python3 -I check.py"""
import json
from pathlib import Path
here = Path(__file__).resolve().parent
R = json.loads((here / "results.json").read_text()); page = (here / "index.html").read_text()
bad = 0
def ok(c, m):
    global bad; print(("ok   " if c else "FAIL ") + m); bad += not c
C = R["cells"]; n = len(C)
ok(n == 62, f"62 ledger markets ({n})")
ok(sum(v["n"] for v in R["by_class"].values()) == 62, "classes partition the ledger")
ok([R["by_class"][k]["n"] for k in ("machine", "threshold", "unnamed", "norule")] == [10, 1, 32, 19], "class sizes 10/1/32/19")
ok(R["resolved"] == 30 and R["resolved_YES"] == 0, "30 resolved, 0 YES (as the Studio's ledger)")
ok(sum(c["void"] for c in C) == 5 and all(c["cls"] == "machine" for c in C if c["void"]), "5 void clauses, all in the machine class")
W = R["worlds"]
ok(W["humans"]["NO"] + W["humans"]["silent"] == 62 and W["machines"]["YES"] + W["machines"]["YES_but_no_writer"] + W["machines"]["silent"] == 62, "each world accounts for all 62")
q = R["bkr7_price"]
ok(abs(R["implied"][0]["x"] - q) < 1e-12, "a=1 reads the price as the extinction chance")
for r in R["implied"]:
    x, a = r["x"], r["a"]; ok(abs(x * a / (1 - x + x * a) - q) < 1e-9, f"a={a}: x={x:.4f} reproduces the price")
ok(all(len(c["desc_sha256"]) == 64 for c in C), "every rule text hashed")
ok(len(R["quotes"]) == 7 and all(len(t.split()) <= 16 for _, t in R["quotes"].values()), "quotations short (≤16 words)")
K = R["correction"]["readings"]
ok([K[k]["by_class"]["machine"] for k in ("own_text", "presented", "by_reference")] == [9, 10, 12], "correction: 9 / 10 / 12 by reading")
ok([K[k]["consistent"] for k in ("own_text", "presented", "by_reference")] == [True, False, True], "correction: only the presented reading is inconsistent")
ok(all(sum(K[k]["by_class"].values()) == 62 for k in K), "correction: each reading partitions the ledger")
ok("Corrected 2026-10-08" in page and "Corrected 2026-10-08" in (here / "SUMMARY.md").read_text(), "correction marked on page and summary")
ok("/*DATA*/null" not in page and '"cells"' in page, "data inlined into index.html")
ok("For the programme:" in page, "programme line on the page")
summ = (here / "SUMMARY.md").read_text()
line = [l for l in summ.splitlines() if l.startswith("For the programme:")]
ok(len(line) == 1 and len(line[0]) <= 240, f"programme line present, ≤240 chars ({len(line[0]) if line else 0})")
for w in ("field-research", "works/2026-10-08-only-no", "the-silent-majority"):
    ok(w in page and w in summ, f"names the sibling work {w}")
print("checks failed:", bad); raise SystemExit(1 if bad else 0)
