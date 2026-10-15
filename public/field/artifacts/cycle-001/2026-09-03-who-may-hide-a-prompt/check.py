#!/usr/bin/env python3
"""Re-derive every headline number from data/cohort.csv.

Exit non-zero if any headline drifts from the CSV, or if any coded row
lacks the evidence field required by the pre-registration.
"""
from __future__ import annotations

import csv
import sys
from pathlib import Path

HERE = Path(__file__).parent
COHORT = HERE / "data" / "cohort.csv"


def load_cohort() -> list[dict]:
    with COHORT.open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def check_evidence_present(rows: list[dict]) -> list[str]:
    """A coded row (not `silent`) must carry a non-empty evidence field."""
    problems: list[str] = []
    for row in rows:
        v = row["venue_year"]
        for axis in ("a1", "a2", "a3_own", "a4"):
            code = row[f"code_{axis}"]
            ev = row[f"evidence_{axis}"].strip()
            # `silent` and `silent-at-fetched-url` and `none` may have empty
            # evidence; anything else must not.
            if code in ("silent", "silent-at-fetched-url", "none", ""):
                continue
            if not ev:
                problems.append(f"{v}: code_{axis}={code} but evidence empty")
        # A3-external: `attributed-deployed` must carry the attribution.
        if row["code_a3_external"] == "attributed-deployed" and not row["evidence_a3_external"].strip():
            problems.append(f"{v}: a3_external=attributed-deployed but evidence empty")
    return problems


def count(rows: list[dict], axis: str, value: str) -> int:
    return sum(1 for r in rows if r[f"code_{axis}"] == value)


def headline(rows: list[dict]) -> dict[str, int]:
    n = len(rows)
    return {
        "N": n,
        # A1 — author-side rule.
        "A1_forbidden_with_consequence": count(rows, "a1", "explicit-forbidden-with-consequence"),
        "A1_forbidden_no_consequence": count(rows, "a1", "explicit-forbidden-no-consequence"),
        "A1_silent_pure": count(rows, "a1", "silent"),
        "A1_silent_at_fetched_url": count(rows, "a1", "silent-at-fetched-url"),
        # A2 — reviewer-side LLM rule.
        "A2_forbidden": count(rows, "a2", "forbidden"),
        "A2_restricted_permitted": count(rows, "a2", "restricted-permitted"),
        "A2_silent": count(rows, "a2", "silent"),
        # A3 — venue-embedded probe at venue's own record.
        "A3own_deployed": count(rows, "a3_own", "deployed"),
        "A3own_permitted_not_deployed": count(rows, "a3_own", "permitted-not-deployed"),
        "A3own_silent": count(rows, "a3_own", "silent"),
        # A3-external.
        "A3ext_attributed_deployed": count(rows, "a3_external", "attributed-deployed"),
        # A4 — accountability.
        "A4_both": count(rows, "a4", "both"),
        "A4_author_only": count(rows, "a4", "author-only"),
        "A4_silent": count(rows, "a4", "silent"),
    }


def kill_conditions(h: dict[str, int]) -> list[str]:
    """Report which pre-registered kill conditions fired."""
    lines = []
    # Door-census kill: >=7/9 explicit-forbidden-with-consequence on A1.
    threshold = 7
    fired = h["A1_forbidden_with_consequence"] >= threshold
    lines.append(
        f"Door-census kill (A1 explicit-forbidden-with-consequence >= {threshold}/{h['N']}): "
        f"{h['A1_forbidden_with_consequence']}/{h['N']} — {'FIRED' if fired else 'NOT FIRED'}"
    )
    # Link kill: >=3/9 pure silent on A1.
    fired = h["A1_silent_pure"] >= 3
    lines.append(
        f"Link kill (A1 silent >= 3/{h['N']}): "
        f"{h['A1_silent_pure']}/{h['N']} — {'FIRED' if fired else 'NOT FIRED'}"
    )
    return lines


def prediction(h: dict[str, int], rows: list[dict]) -> list[str]:
    """Does at least one venue-year both forbid authors AND deploy/permit
    the same act itself?
    """
    hits = []
    for r in rows:
        forbids = r["code_a1"] in (
            "explicit-forbidden-with-consequence",
            "explicit-forbidden-no-consequence",
        )
        does_or_permits = r["code_a3_own"] in ("deployed", "permitted-not-deployed")
        if forbids and does_or_permits:
            hits.append(r["venue_year"])
    return hits


def main() -> int:
    rows = load_cohort()
    problems = check_evidence_present(rows)
    if problems:
        for p in problems:
            print("EVIDENCE MISSING:", p, file=sys.stderr)
        return 1

    h = headline(rows)
    print(f"cohort N = {h['N']}")
    print()
    print("A1 — author-side rule on hidden / injected prompts:")
    print(f"  explicit-forbidden-with-consequence: {h['A1_forbidden_with_consequence']}/{h['N']}")
    print(f"  explicit-forbidden-no-consequence:   {h['A1_forbidden_no_consequence']}/{h['N']}")
    print(f"  silent at fetched URL:                {h['A1_silent_at_fetched_url']}/{h['N']}")
    print(f"  silent (no rule found):               {h['A1_silent_pure']}/{h['N']}")
    print()
    print("A3 — venue-embedded probe at the venue's own record:")
    print(f"  deployed (first-person confirmation): {h['A3own_deployed']}/{h['N']}")
    print(f"  permitted, not deployed:              {h['A3own_permitted_not_deployed']}/{h['N']}")
    print(f"  silent:                                {h['A3own_silent']}/{h['N']}")
    print(f"  attributed-deployed (third-party):    {h['A3ext_attributed_deployed']}/{h['N']}")
    print()
    print("A4 — accountability distribution:")
    print(f"  both author and reviewer: {h['A4_both']}/{h['N']}")
    print(f"  author only:              {h['A4_author_only']}/{h['N']}")
    print(f"  silent:                   {h['A4_silent']}/{h['N']}")
    print()

    for line in kill_conditions(h):
        print(line)
    print()

    hits = prediction(h, rows)
    if hits:
        print(f"PREDICTION HOLDS at {len(hits)} venue-year(s): {', '.join(hits)}")
    else:
        print("PREDICTION FAILS: no venue-year both forbids authors and deploys/permits the same act itself.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
