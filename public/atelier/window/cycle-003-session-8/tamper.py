#!/usr/bin/env python3
"""tamper.py — break this page's own evidence on purpose and see whether check.py notices.

A check suite that has never failed is a claim, not a check. This one copies the four committed
files into a temporary directory, corrupts one load-bearing thing at a time, runs `check.py`
against the corrupted copy and asserts that it fails. The committed files are never written to.

Each corruption is one a careless or dishonest session could actually make: a number forged in
the page but not in the data, a term nudged by one, a record quietly dropped from the evidence,
a reading promoted out of the class that refuses it.

    python3 window/cycle-003-session-8/tamper.py

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


def forge_repair(d, c, h):
    """The headline itself: claim nothing was filled when one cell was."""
    d["repair"]["cells_filled"] = 0
    return d, c, h


def drop_a_row(d, c, h):
    """Remove one record from the evidence and leave every published number as it was."""
    f = next(x for x in c["feeds"] if x["key"] == "papers")
    f["rows"] = f["rows"][:-1]
    return d, c, h


def nudge_a_term(d, c, h):
    """Move the arrival term of R1 by one — the split would then not be an identity."""
    next(s for s in d["series"] if s["id"] == "R1")["arrived"] += 1
    return d, c, h


def forge_shape_truth(d, c, h):
    """Claim the departing records took their shapes with them. They did not."""
    d["shapes"]["lost_from_record"] = d["shapes"]["carried_by_departures"]
    return d, c, h


def forge_the_page(d, c, h):
    """Change a number in the served page and nowhere else."""
    return d, c, h.replace("915", "916")


def forge_membership(d, c, h):
    """Report last night's headline count as tonight's departures."""
    d["membership"]["papers"]["left"] = 157
    return d, c, h


def promote_a_holistic_reading(d, c, h):
    """Say the distinct-shape count admits the split. Its residual is 0, so only the class
    can catch this — which is the page's own argument, tested on itself."""
    next(s for s in d["series"] if s["id"] == "R3")["admits"] = True
    return d, c, h


def forge_the_return(d, c, h):
    """Claim the departed cohort came back."""
    d["condition"]["arxiv_arrivals_tonight"] = d["condition"]["arxiv_lost"]
    return d, c, h


CORRUPTIONS = [
    ("the repair term forged", forge_repair),
    ("a record dropped from the evidence", drop_a_row),
    ("an arrival term nudged by one", nudge_a_term),
    ("the shape truth forged", forge_shape_truth),
    ("a number changed in the page only", forge_the_page),
    ("membership forged", forge_membership),
    ("a holistic reading promoted", promote_a_holistic_reading),
    ("the cohort's return forged", forge_the_return),
]


def main() -> int:
    bad = []
    with tempfile.TemporaryDirectory() as tmp:
        root = pathlib.Path(tmp)
        # check.py reads the two prior nights by relative path, so the neighbourhood comes too.
        for name in ("cycle-003-session-6", "cycle-003-session-7"):
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
