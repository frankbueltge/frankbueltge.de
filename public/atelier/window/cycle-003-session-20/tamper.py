#!/usr/bin/env python3
"""Session 20 — corrupt results.json and index.html one way at a time; check.py must refuse each."""
import json, subprocess, sys, tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
R0 = json.loads((HERE / "results.json").read_text())
P0 = (HERE / "index.html").read_text(encoding="utf-8")


def r_edit(f):
    def g():
        r = json.loads(json.dumps(R0)); f(r); return r, P0
    return g


def p_edit(a, b, all_=False):
    def g():
        assert a in P0, a
        return R0, P0.replace(a, b) if all_ else P0.replace(a, b, 1)
    return g


M = R0["main"]
CASES = {
    "window moved": r_edit(lambda r: r.__setitem__("W", [9, 10, 11, 12, 13, 14])),
    "surplus inflated": r_edit(lambda r: r["main"].__setitem__("above_weekend_W", M["above_weekend_W"] + 40)),
    "night surplus altered": r_edit(lambda r: r["main"].__setitem__("above_night_W", 250.0)),
    "deficit hidden": r_edit(lambda r: r["main"].__setitem__("below_weekend_W", -100.0)),
    "net sign flipped": r_edit(lambda r: r["main"].__setitem__("net_weekend_W", 60.0)),
    "weekend ratio moved": r_edit(lambda r: r["main"].__setitem__("above_we_W_ratio", 0.9)),
    "an interval reversed": r_edit(lambda r: r["ci95"].__setitem__("diff_above_W", [244.0, -244.0])),
    "an interval excludes its point": r_edit(lambda r: r["ci95"].__setitem__("above_night_W", [250.0, 300.0])),
    "prediction 2 turned": r_edit(lambda r: r["verdict"].__setitem__("2_below_smaller", True)),
    "prediction 3 turned": r_edit(lambda r: r["verdict"].__setitem__("3_net_more", True)),
    "prediction 5 turned": r_edit(lambda r: r["verdict"].__setitem__("5_outside_quiet", False)),
    "a weekday count moved": r_edit(lambda r: r["hours"]["above"]["wd"].__setitem__(11, r["hours"]["above"]["wd"][11] + 1)),
    "a weekend count moved": r_edit(lambda r: r["hours"]["below"]["we"].__setitem__(4, r["hours"]["below"]["we"][4] + 1)),
    "an excess moved": r_edit(lambda r: r["hours"]["above"]["weekend"].__setitem__(12, 1.0)),
    "page: surplus rewritten": p_edit(sg := f"+{round(M['above_weekend_W'])}", "+300", True),
    "page: verdict flipped": p_edit("<strong>refuted</strong>", "<strong>held</strong>"),
    "page: script added": p_edit("<main>", "<main><script>1</script>"),
    "page: a point dropped": p_edit('<circle class="pt c0"', '<circle class="pt c9"'),
    "page: a table row dropped": p_edit('<tr class="w"><td class="n">11</td>', ''),
    "page: refutation section removed": p_edit("What would refute this page", "Remarks"),
}
miss = []
for name, mk in CASES.items():
    r, p = mk()
    with tempfile.TemporaryDirectory() as d:
        (Path(d) / "results.json").write_text(json.dumps(r))
        (Path(d) / "index.html").write_text(p, encoding="utf-8")
        rc = subprocess.run([sys.executable, str(HERE / "check.py"), d], capture_output=True).returncode
    if rc == 0:
        miss.append(name)
print(f"{len(CASES) - len(miss)} of {len(CASES)} corruptions caught")
for m in miss:
    print("MISSED", m)
sys.exit(1 if miss else 0)
