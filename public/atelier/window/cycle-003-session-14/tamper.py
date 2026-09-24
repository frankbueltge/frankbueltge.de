#!/usr/bin/env python3
"""Corrupts data.json in specific, named ways and confirms check.py fails, and names
which assertion caught each one. Restores the original file when done, whatever
happens in between."""
import copy
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
DATA = HERE / "data.json"


def run_check():
    r = subprocess.run([sys.executable, str(HERE / "check.py")], capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr


def with_mutation(base, mutate, label):
    d = copy.deepcopy(base)
    mutate(d)
    DATA.write_text(json.dumps(d, indent=2), encoding="utf-8")
    code, out = run_check()
    status = "CAUGHT" if code != 0 else "MISSED"
    print(f"[{status}] {label}")
    if code == 0:
        print("    !! this corruption was not detected")
    return code != 0


def main():
    original = DATA.read_text(encoding="utf-8")
    base = json.loads(original)
    all_caught = True
    try:
        mutations = [
            (lambda d: d["studio_claim"].__setitem__("independently_derived_family",
                                                       [16, 80, 400]),
             "drop 2000 from the Studio family"),
            (lambda d: d["studio_claim"].__setitem__("matches_quote", False),
             "flip matches_quote to False"),
            (lambda d: d["own_case"].__setitem__("family_for_this_scale", [2, 10]),
             "add a phantom second member (10) to this practice's own family"),
            (lambda d: d["own_case"].__setitem__("records_that_differ", 24),
             "inflate the differ count from 23 to 24"),
            (lambda d: d["own_case"].__setitem__("records_with_odd_w", 33),
             "shrink the odd-word-count total from 34 to 33"),
            (lambda d: d["rows"].__setitem__(0, {**d["rows"][0], "w": d["rows"][0]["w"] + 1}),
             "change one record's own word count"),
            (lambda d: d["rows"].__setitem__(
                next(i for i, r in enumerate(d["rows"]) if r["python"] != r["javascript"]),
                {**next(r for r in d["rows"] if r["python"] != r["javascript"]),
                 "javascript": next(r for r in d["rows"] if r["python"] != r["javascript"])["python"]}),
             "make one genuinely-differing row agree instead"),
            (lambda d: [c.__setitem__("carries_the_defect", True) for c in d["corpus_scan"]
                        if c["dir"] == "window/cycle-002-session-1"],
             "falsely flag a second page as carrying the defect"),
            (lambda d: d["corpus_scan"].pop(),
             "drop one corpus-scan entry entirely"),
            (lambda d: d["cases"][0].__setitem__("tie_family", [16, 80, 400, 2000, 10000]),
             "add an out-of-bound member to a declared case"),
        ]
        for mutate, label in mutations:
            if not with_mutation(base, mutate, label):
                all_caught = False
    finally:
        DATA.write_text(original, encoding="utf-8")
    print()
    if all_caught:
        print(f"all {len(mutations)} corruptions caught; data.json restored")
    else:
        print("SOME CORRUPTIONS WERE MISSED; data.json restored regardless")
        sys.exit(1)


if __name__ == "__main__":
    main()
