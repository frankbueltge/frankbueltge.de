#!/usr/bin/env python3
"""Session 17 — corrupt results.json and index.html one way at a time and confirm check.py
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


def lat(r, rule, era, off):
    return next(x for x in r["lattice"] if x["rule"] == rule and x["era"] == era and abs(x["offset"] - off) < 1e-9)


CASES = {
    "b-positive flattened at +0.8": r_edit(lambda r: lat(r, "b+ .1", "pooled", 0.8).__setitem__("b", lat(r, "b+ .1", "pooled", 0.0)["b"])),
    "truncated fit's sample shrunk": r_edit(lambda r: lat(r, "AU<3", "2000-25", 0.4).__setitem__("n", 100)),
    "a drift halved": r_edit(lambda r: r["drift"].__setitem__("AU | 1974-99", 0.093)),
    "interaction share raised": r_edit(lambda r: r["share_of_variance"].__setitem__("rule x offset", 0.2)),
    "floor share lowered": r_edit(lambda r: r["share_of_variance"].__setitem__("offset", 0.1)),
    "a count moved into the range": r_edit(lambda r: r["counts"]["b+ .3"][2].__setitem__("total", 8000)),
    "an early share raised": r_edit(lambda r: r["counts"]["b+ .01"][8].__setitem__("share_1974_79", 0.95)),
    "an event lost": r_edit(lambda r: r.__setitem__("events", 20759)),
    "page: a script added": p_edit("</main>", "<script>1</script></main>"),
    "page: external stylesheet": p_edit("<style>", '<link rel="stylesheet" href="https://example.org/a.css"><style>'),
    "page: a prediction turned": p_edit("<strong>held</strong>", "<strong>refuted</strong>"),
    "page: interaction share doubled": p_edit("All interactions together account for <em class=\"k\">",
                                              "All interactions together account for <em class=\"k\">1"),
    "page: count span shortened": p_edit(" to 27 146", " to 17 146"),
    "page: one line removed": p_edit('<polyline class="ln c4"', '<g class="ln c4"'),
    "page: source dropped": p_edit("arXiv:2511.04521", "a package paper"),
}

caught = 0
with tempfile.TemporaryDirectory() as d:
    d = Path(d)
    for f in ("check.py", "seq.json"):
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
