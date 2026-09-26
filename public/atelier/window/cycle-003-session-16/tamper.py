#!/usr/bin/env python3
"""Session 16 — corrupt results.json and index.html one way at a time and confirm check.py
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
    "studio total off by one": r_edit(lambda r: r["studio"].__setitem__("total", 7044)),
    "studio range widened": r_edit(lambda r: r["studio"].__setitem__("range", [5000, 8164])),
    "MBS total moved inside": r_edit(lambda r: r["methods"]["MBS"].__setitem__("total_own_b", 8000)),
    "GFT-90 floor for 1990 moved": r_edit(lambda r: r["methods"]["GFT-90"]["floors"].__setitem__("1990", 2.5)),
    "scan b flattened at +0.8": r_edit(lambda r: r["scan"][-1].__setitem__("b", r["scan"][-2]["b"])),
    "scan held total climbs": r_edit(lambda r: [s.__setitem__("total_studio_b", 9000 + i) for i, s in enumerate(r["scan"][3:])]),
    "early share raised": r_edit(lambda r: r["methods"]["MAXC"].__setitem__("share_1974_79", 0.96)),
    "a year dropped from <200 list": r_edit(lambda r: r["years_with_magnitude_lt_200"].pop()),
    "page: a script added": p_edit("</main>", "<script>1</script></main>"),
    "page: external font": p_edit("<style>", "<link href=\"https://example.org/f.css\" rel=\"stylesheet\"><style>"),
    "page: lede total changed": p_edit("about 7 043", "about 7 403"),
    "page: ten times becomes five": p_edit("about 10 times", "about 5 times"),
    "page: three of five becomes four": p_edit("three of five", "four of five"),
    "page: handbook warning dropped": p_edit("may not overlap", "may overlap"),
}

caught = 0
with tempfile.TemporaryDirectory() as d:
    d = Path(d)
    for f in ("check.py", "fmd.json"):
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
