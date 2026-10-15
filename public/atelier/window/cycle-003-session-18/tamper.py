#!/usr/bin/env python3
"""Session 18 — corrupt results.json and index.html one way at a time and confirm check.py
refuses every corruption. Writes only to a temporary directory."""
import json, shutil, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
R0 = json.loads((HERE / "results.json").read_text())
P0 = (HERE / "index.html").read_text(encoding="utf-8")


def r_edit(f):
    def g():
        r = json.loads(json.dumps(R0)); f(r); return r, P0
    return g


def p_edit(a, b):
    def g():
        assert a in P0, a
        return R0, P0.replace(a, b, 1)
    return g


CASES = {
    "a night count moved": r_edit(lambda r: r["main"][0].__setitem__("night", 3600)),
    "floor ratio moved below 0.95": r_edit(lambda r: r["main"][0].__setitem__("ratio", 0.94)),
    "night slope flattened": r_edit(lambda r: r["main"][8].__setitem__("b_night", 0.85)),
    "a year's floor lowered": r_edit(lambda r: r["floors"].__setitem__("1990", 100)),
    "night climb shrunk": r_edit(lambda r: r["climb"].__setitem__("night", 0.04)),
    "an interval that misses its point": r_edit(lambda r: r["main"][4].__setitem__("ratio_ci95", [0.9, 1.0])),
    "quiet-clock count moved": r_edit(lambda r: r["exploratory"]["quiet_clock"][3].__setitem__("day", 600)),
    "a subset's climb moved": r_edit(lambda r: r["exploratory"]["subsets"]["weekend and depth >= 3 km"].__setitem__("climb", 0.02)),
    "weekend split moved": r_edit(lambda r: r["exploratory"]["split"][2]["weekend"].__setitem__("ratio", 1.2)),
    "Studio count moved": r_edit(lambda r: r["exploratory"]["studio_count"].__setitem__("night b at +0.2", 8200)),
    "a band's day count moved": r_edit(lambda r: r["bands"][4].__setitem__("day", 132)),
    "a prediction turned in results": r_edit(lambda r: r["predictions"].__setitem__("3_ratio_at_04_in_090_110", True)),
    "page: a script added": p_edit("</main>", "<script>1</script></main>"),
    "page: external stylesheet": p_edit("<style>", '<link rel="stylesheet" href="https://example.org/a.css"><style>'),
    "page: a prediction turned": p_edit("0.05: <strong>held</strong>", "0.05: <strong>refuted</strong>"),
    "page: excess ratio rounded up": p_edit("day over night is <em class=\"k\">1.18", "day over night is <em class=\"k\">1.28"),
    "page: share of climb changed": p_edit("At most about 16 %", "At most about 61 %"),
    "page: event count": p_edit("20 760", "20 670"),
    "page: interval narrowed": p_edit("at the floor it runs 0.88", "at the floor it runs 0.98"),
}

caught = 0
with tempfile.TemporaryDirectory() as d:
    d = Path(d)
    for f in ("check.py", "clock.json"):
        shutil.copy(HERE / f, d / f)
    for name, make in CASES.items():
        r, p = make()
        (d / "results.json").write_text(json.dumps(r))
        (d / "index.html").write_text(p, encoding="utf-8")
        rc = subprocess.run([sys.executable, str(d / "check.py")], capture_output=True).returncode
        caught += rc != 0
        print(("caught  " if rc else "MISSED  ") + name)
print(f"{caught} of {len(CASES)} corruptions caught")
sys.exit(0 if caught == len(CASES) else 1)
