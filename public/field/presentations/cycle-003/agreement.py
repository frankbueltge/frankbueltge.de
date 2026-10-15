#!/usr/bin/env python3
"""POST-HOC, DECLARED: do the cycle's operationalisations of "unusable" agree on a common item set?

Session 159, cycle 003. Governed by presentations/cycle-003/PREREGISTRATION.md §2, which declares
before anything else that **the numbers this file produces were seen before that document was
written**. It scores no prediction.

Why it exists. STATE-OF-THE-FIELD.md §4.6 and the artifact of 2026-09-12 both say that four
operationalisations of "unusable" agree pairwise at kappa between -0.0667 and 0.0378. That sentence
is not supported as written: those kappas were computed in different sessions on DIFFERENT item
sets, and at least one of them is structurally zero because one rater had no variance at all. The
claim has never been computed as a matrix on one common set of items.

For three of the four it can be, because
artifacts/cycle-003/2026-09-12-what-a-description-is-for/data/task-rows.json carries, per item, on
one common set of 60 held-out items per arm:

  * screen_broad   - the hollowness screen's broad verdict (R1 or R2 or R3 or R4), frozen 09-08
  * screen_strict  - the same screen's strict verdict
  * narrowing      - the model-free instrument: this masked value does NOT pick out one record
  * task_fail      - a blind human reader, given the masked value and five candidates, chose wrong

The fourth - the blind reader's OPINION of emptiness, 2026-09-11 - cannot join: that sheet was
anonymised by design (audit-sheet.json carries an opaque aid and the value text and nothing else),
so its items cannot be matched to any other measurement. A consequence of a good decision, reported
and not repaired.

Cohen's kappa is imported from tools/hollow/hollow.py, unchanged, so the statistic on this page is
the statistic the cycle used throughout.

No model is called anywhere in this file. Standard library only. It reads committed data and takes
no network.

Usage: python3 presentations/cycle-003/agreement.py
"""

from __future__ import annotations

import itertools
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, "tools", "hollow"))

import hollow  # noqa: E402

SRC = os.path.join(ROOT, "artifacts", "cycle-003", "2026-09-12-what-a-description-is-for",
                   "data", "task-rows.json")
OUT = os.path.join(HERE, "data", "agreement.json")

ARMS = ["atlas-masked", "uk-masked", "atlas-unmasked"]
OPS = ["screen_broad", "screen_strict", "narrowing", "task_fail"]

LABELS = {
    "screen_broad": "screen, broad (R1-R4)",
    "screen_strict": "screen, strict",
    "narrowing": "narrowing: does not pick out one record",
    "task_fail": "blind reader picked the wrong record",
}


def vectors(rows: list[dict]) -> dict[str, list[int]]:
    return {
        "screen_broad": [1 if r["hollow_broad"] else 0 for r in rows],
        "screen_strict": [1 if r["hollow_strict"] else 0 for r in rows],
        "narrowing": [0 if r["identifies_uniquely"] else 1 for r in rows],
        "task_fail": [0 if r["correct"] else 1 for r in rows],
    }


def agreement_pct(a: list[int], b: list[int]) -> float:
    return round(100.0 * sum(1 for x, y in zip(a, b) if x == y) / len(a), 2)


def build() -> dict:
    with open(SRC, encoding="utf-8") as fh:
        src = json.load(fh)

    out = {
        "_status": "POST-HOC, DECLARED. The numbers here were seen before "
                   "presentations/cycle-003/PREREGISTRATION.md was written; that document declares "
                   "it in §0.1. Scores no prediction.",
        "generated_by": "presentations/cycle-003/agreement.py",
        "date": "2026-09-13",
        "session": 159,
        "cycle": 3,
        "source": "artifacts/cycle-003/2026-09-12-what-a-description-is-for/data/task-rows.json",
        "source_committed": "2026-09-12, before this session existed; untouched tonight",
        "operationalisations": LABELS,
        "cannot_join": {
            "which": "the blind reader's opinion of emptiness, 2026-09-11 "
                     "(artifacts/cycle-003/2026-09-11-does-it-travel/data/audit-labels.json)",
            "why": "its sheet was anonymised by design - an opaque identifier and the value text "
                   "and nothing else - so its 60 items cannot be matched to any other "
                   "measurement's items. Its kappa against the screen (0.0919) is therefore a "
                   "number from a different sample and may not be read as a cell of this matrix.",
            "kappa_against_screen_2026_09_11": 0.0919,
        },
        "arms": {},
    }

    for arm in ARMS:
        rows = src[arm]
        vec = vectors(rows)
        cells = {}
        for x, y in itertools.combinations(OPS, 2):
            a, b = vec[x], vec[y]
            deg = (sum(a) in (0, len(a))) or (sum(b) in (0, len(b)))
            cells[f"{x}|{y}"] = {
                "kappa": round(hollow.cohen_kappa(a, b), 4),
                "agreement_pct": agreement_pct(a, b),
                "degenerate": deg,
                "note": ("one rater has zero variance on this arm, so kappa is identically 0 "
                         "whatever the other says - no information, not disagreement")
                        if deg else None,
            }
        out["arms"][arm] = {
            "n": len(rows),
            "positives": {k: sum(v) for k, v in vec.items()},
            "pairs": cells,
        }

    # The two families, named after the matrix is in hand and labelled as such.
    mech = ["screen_broad|screen_strict", "screen_broad|narrowing", "screen_strict|narrowing"]
    human = ["screen_broad|task_fail", "screen_strict|task_fail", "narrowing|task_fail"]
    summary = {}
    for arm in ARMS:
        cells = out["arms"][arm]["pairs"]
        live_mech = [cells[k]["kappa"] for k in mech if not cells[k]["degenerate"]]
        live_human = [cells[k]["kappa"] for k in human if not cells[k]["degenerate"]]
        summary[arm] = {
            "machine_machine_kappas": live_mech,
            "machine_machine_min": min(live_mech) if live_mech else None,
            "machine_machine_max": max(live_mech) if live_mech else None,
            "machine_human_kappas": live_human,
            "machine_human_min": min(live_human) if live_human else None,
            "machine_human_max": max(live_human) if live_human else None,
            "degenerate_cells": [k for k, v in cells.items() if v["degenerate"]],
        }
    out["summary"] = summary
    out["published_range_2026_09_12"] = {
        "as_written": "four operationalisations agree pairwise at kappa between -0.0667 and 0.0378",
        "where": "STATE-OF-THE-FIELD.md §4.6 and "
                 "artifacts/cycle-003/2026-09-12-what-a-description-is-for/SUMMARY.md",
        "what_is_wrong_with_it": "the kappas in it come from different item sets in different "
                                 "sessions, and at least one is a degenerate cell where a rater "
                                 "had no variance. On a common item set the picture is not one "
                                 "range: the mechanical instruments agree with each other, and "
                                 "neither agrees with the human task.",
    }
    return out


def main() -> int:
    out = build()
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(out, fh, indent=1, ensure_ascii=False)
    print(json.dumps(out["summary"], indent=1))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
