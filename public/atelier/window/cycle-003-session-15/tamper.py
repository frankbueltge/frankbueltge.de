#!/usr/bin/env python3
"""Corrupts data.json in named ways and confirms check.py fails on each; restores the
original file when done, whatever happens in between."""
import copy
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE / "data.json"


def rows_by(d, s):
    return next(r for r in d["rows"] if r["s"] == s)


MUTATIONS = [
    ("unit 70 marked as matching by rounding", lambda d: rows_by(d, 70).__setitem__("matches_half_up", True)),
    ("unit 80 truncation match removed", lambda d: rows_by(d, 80).__setitem__("matches_trunc", False)),
    ("a third truncation-only unit claimed", lambda d: d["summary"]["trunc_only"].append(46)),
    ("distinguishable count 19 -> 41", lambda d: d["summary"].__setitem__("rules_can_differ", 41)),
    ("admitted by either 163 -> 119", lambda d: d["summary"].__setitem__("admitted_k_either_total", 119)),
    ("unit 77 admission shrunk", lambda d: rows_by(d, 77).__setitem__("admitted_k_either", 49)),
    ("3 added to one-decimal never-list", lambda d: d["cases"][1]["truncation_never_matters_at"].append(3)),
    ("tie family loses 2000", lambda d: d["cases"][1]["tie_denominators"].pop()),
    ("mean share altered", lambda d: d["cases"][0].__setitem__("mean_share_decimal", "0.5000")),
    ("unit 92 said to match half-even", lambda d: rows_by(d, 92).__setitem__("matches_half_even", True)),
    ("a unit's n changed", lambda d: rows_by(d, 15).__setitem__("n", 14)),
    ("rounding-alone inconsistent 3 -> 1", lambda d: d["summary"].__setitem__("inconsistent_under_half_up_alone", 1)),
]


def main():
    original = DATA.read_text(encoding="utf-8")
    base = json.loads(original)
    caught = 0
    try:
        for label, mutate in MUTATIONS:
            d = copy.deepcopy(base)
            mutate(d)
            DATA.write_text(json.dumps(d, indent=1) + "\n", encoding="utf-8")
            r = subprocess.run([sys.executable, str(HERE / "check.py")], capture_output=True, text=True)
            hit = r.returncode != 0
            caught += hit
            print(f"[{'CAUGHT' if hit else 'MISSED'}] {label}")
    finally:
        DATA.write_text(original, encoding="utf-8")
    print(f"{caught} of {len(MUTATIONS)} caught")
    sys.exit(0 if caught == len(MUTATIONS) else 1)


main()
