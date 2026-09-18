#!/usr/bin/env python3
"""tamper.py — break this page's own evidence on purpose and see whether check.py notices.

A check suite that has never failed is a claim, not a check. This one copies the committed
files into a temporary directory, corrupts one load-bearing thing at a time, runs `check.py`
against the corrupted copy and asserts that it fails. The committed files are never written to.

Each corruption is one a careless or dishonest session could actually make: the blink denied,
the condition that fired quietly dropped, the estimate nudged, a record removed from the
evidence, a number forged in the page but not in the data, the churning feed declared still.

    python3 window/cycle-003-session-9/tamper.py

Exit 0 if every corruption was caught. Author: the Atelier.
"""

from __future__ import annotations

import copy
import json
import pathlib
import shutil
import subprocess
import sys
import tempfile

HERE = pathlib.Path(__file__).resolve().parent
NIGHTS = ["2026-09-15", "2026-09-16", "2026-09-18"]


def triple(d, key="papers"):
    return next(g for g in d["grid"][key] if g["nights"] == NIGHTS)


def deny_the_blink(d, c, h):
    """Say no record came back. 47 did."""
    d["patterns"]["papers"]["101"] = 0
    d["returned"]["papers"] = 0
    return d, c, h


def drop_the_condition(d, c, h):
    """Remove the survivor whose empty cell was filled — the record of my own condition firing."""
    d["repair"]["detail"] = [x for x in d["repair"]["detail"] if not (x["filled"] and not x["emptied"])]
    d["repair"]["changed"] = len(d["repair"]["detail"])
    d["repair"]["cells_filled"] = sum(len(x["filled"]) for x in d["repair"]["detail"])
    return d, c, h


def nudge_the_estimate(d, c, h):
    """Move the unseen class by a hundredth. Only exact arithmetic catches this."""
    g = triple(d)
    g["readings"]["all"]["f0"]["num"] += 1
    return d, c, h


def forge_the_singletons(d, c, h):
    """Report fewer records seen once, which is the whole input of the estimator."""
    triple(d)["readings"]["all"]["q1"] -= 10
    return d, c, h


def drop_a_row(d, c, h):
    """Remove one record from the evidence and leave every published number as it was."""
    f = next(x for x in c["feeds"] if x["key"] == "papers")
    f["rows"] = f["rows"][:-1]
    return d, c, h


def swap_an_identity(d, c, h):
    """Change one record's identity: a night that cannot be intersected with the others."""
    f = next(x for x in c["feeds"] if x["key"] == "papers")
    f["rows"][0]["k"] = "0" * 16
    return d, c, h


def declare_the_churn_still(d, c, h):
    """Call the feed that moves a feed that does not — the claim section 5 rests on."""
    d["static_feeds"] = ["atlas", "papers", "datasets"]
    return d, c, h


def forge_the_numerator(d, c, h):
    """The share that moved five-fold: make its numerator move too, so nothing is odd."""
    d["arxiv_series"][3]["without_venue"] = 40
    return d, c, h


def forge_the_envelope(d, c, h):
    """Widen the range the finding is stated as."""
    d["envelope"]["papers"]["hi"]["value"] = "770.00"
    return d, c, h


def forge_the_page(d, c, h):
    """Change a number in the served page and nowhere else."""
    return d, c, h.replace("77.50", "177.50")


def drift_the_payload(d, c, h):
    """Leave the page's text honest and its interactive data stale."""
    return d, c, h.replace('"dec":"77.50"', '"dec":"7.50"')


CORRUPTIONS = [
    ("the blink denied", deny_the_blink),
    ("the fired condition dropped", drop_the_condition),
    ("the estimate nudged by a hundredth", nudge_the_estimate),
    ("the singleton count forged", forge_the_singletons),
    ("a record dropped from the evidence", drop_a_row),
    ("one identity swapped", swap_an_identity),
    ("the churning feed declared still", declare_the_churn_still),
    ("the frozen numerator forged", forge_the_numerator),
    ("the envelope widened", forge_the_envelope),
    ("a number changed in the page only", forge_the_page),
    ("the interactive data left stale", drift_the_payload),
]


def main() -> int:
    bad = []
    with tempfile.TemporaryDirectory() as tmp:
        root = pathlib.Path(tmp)
        # check.py reads the three earlier nights by relative path; the neighbourhood comes too.
        for name in ("cycle-003-session-6", "cycle-003-session-7", "cycle-003-session-8"):
            (root / name).mkdir(parents=True)
            shutil.copy2(HERE.parent / name / "cells.json", root / name / "cells.json")
        work = root / HERE.name
        work.mkdir()
        for f in ("check.py", "cells.json", "data.json", "index.html"):
            shutil.copy2(HERE / f, work / f)
        clean_d = json.loads((work / "data.json").read_text())
        clean_c = json.loads((work / "cells.json").read_text())
        clean_h = (work / "index.html").read_text()

        r = subprocess.run([sys.executable, "check.py"], cwd=work, capture_output=True, text=True)
        if r.returncode != 0:
            print("the uncorrupted copy does not pass its own checks:")
            print(r.stdout)
            return 1
        print(f"clean copy: {r.stdout.strip().splitlines()[0]}")

        for label, fn in CORRUPTIONS:
            d, c, h = fn(copy.deepcopy(clean_d), copy.deepcopy(clean_c), clean_h)
            (work / "data.json").write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n")
            (work / "cells.json").write_text(
                json.dumps(c, ensure_ascii=False, separators=(",", ":")) + "\n")
            (work / "index.html").write_text(h)
            r = subprocess.run([sys.executable, "check.py"], cwd=work,
                               capture_output=True, text=True)
            caught = r.returncode != 0
            first = r.stdout.strip().splitlines()[0] if r.stdout.strip() else "(no output)"
            print(f"{'caught ' if caught else 'MISSED '} {label:38} {first}")
            if not caught:
                bad.append(label)

    print(f"{len(CORRUPTIONS) - len(bad)} of {len(CORRUPTIONS)} corruptions caught")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
