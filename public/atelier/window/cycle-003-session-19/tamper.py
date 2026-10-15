#!/usr/bin/env python3
"""Session 19 — corrupt results.json and index.html one way at a time and confirm check.py
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
    "window W widened": r_edit(lambda r: r.__setitem__("W", [9, 10, 11, 12, 13, 14, 15])),
    "a year's floor lowered": r_edit(lambda r: r["floors"].__setitem__("1990", 100)),
    "night baseline moved": r_edit(lambda r: r["main"].__setitem__("base_wd", 430.0)),
    "11 o'clock ratio raised past 1.3": r_edit(lambda r: r["main"].__setitem__("r11", 1.31)),
    "prediction 2 turned": r_edit(lambda r: r["verdict"].__setitem__("2_place", True)),
    "prediction 5 turned": r_edit(lambda r: r["verdict"].__setitem__("5_slope", False)),
    "climb change moved": r_edit(lambda r: r["main"].__setitem__("d_climb", -0.035)),
    "a placebo block moved": r_edit(lambda r: r["explore2"]["placebo"][8].__setitem__("d_climb", -0.01)),
    "surplus inflated": r_edit(lambda r: r["explore2"]["dec"].__setitem__("W_all_above", 295.0)),
    "deficit hidden": r_edit(lambda r: r["explore2"]["dec"].__setitem__("W_all_below", 0.0)),
    "an interval reversed": r_edit(lambda r: r["explore2"]["dec_ci95"].__setitem__("W_all_above", [371.0, 32.0])),
    "weekend surplus invented": r_edit(lambda r: r["explore2"]["weekend_W"].__setitem__("above", 60.0)),
    "an era moved": r_edit(lambda r: r["explore"]["eras"][5].__setitem__("excess_w", 10.0)),
    "a labelled hour moved": r_edit(lambda r: r["explore"]["labelled_hist_wd"].__setitem__(11, 700)),
    "a band's labelled count moved": r_edit(lambda r: r["explore"]["bands"][7].__setitem__("labelled_wd_w", 400)),
    "page: a script added": p_edit("</main>", "<script>1</script></main>"),
    "page: external stylesheet": p_edit("<style>", '<link rel="stylesheet" href="https://example.org/a.css"><style>'),
    "page: the 818 changed": p_edit("The Studio counted 818", "The Studio counted 808"),
    "page: deficit shrunk": p_edit('short by <em class="k">134', 'short by <em class="k">34'),
    "page: estimate doubled": p_edit("about 200 events", "about 400 events"),
    "page: prediction 1 turned": p_edit("<strong>refuted</strong> (1.11;", "<strong>held</strong> (1.11;"),
    "page: placebo bound rounded up": p_edit("lowers it by more than 0.012", "lowers it by more than 0.013"),
    "page: a figure bar dropped": p_edit('<rect class="bar lab"', '<rect class="gone"'),
    "page: an hour row changed": p_edit('<td class="n">11</td><td class="n">806</td>', '<td class="n">11</td><td class="n">860</td>'),
}

caught = 0
with tempfile.TemporaryDirectory() as d:
    d = Path(d) / "cycle-003-session-19"
    (d.parent / "cycle-003-session-18").mkdir(parents=True)
    d.mkdir()
    shutil.copy(HERE.parent / "cycle-003-session-18" / "results.json", d.parent / "cycle-003-session-18")
    for f in ("check.py", "wall.json"):
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
