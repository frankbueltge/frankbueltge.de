#!/usr/bin/env python3
"""Recompute every count on index.html from the data files. Non-zero exit if any drifts.

Usage: python3 check.py
"""
import csv, json, re, sys
from pathlib import Path

HERE = Path(__file__).parent
HTML = (HERE / "index.html").read_text()

def cohort_rows():
    with (HERE / "data" / "cohort.csv").open() as f:
        return list(csv.DictReader(f))

def version_rows():
    with (HERE / "data" / "versions.csv").open() as f:
        return list(csv.DictReader(f))

errors = []
def check(label, expected, found):
    if str(expected) != str(found):
        errors.append(f"{label}: page says {found!r}, data says {expected!r}")
    else:
        print(f"OK  {label}: {expected}")

rows = cohort_rows()
vers = version_rows()

# 1. Cohort size printed in the lede as "five"
check("cohort size (lede)", 5, len(rows))
assert "identified <strong>five</strong> such papers" in HTML, "lede text drifted"
print("OK  lede text carries 'five'")

# 2. "Not one still serves the injection" — verify from data
still_injecting = [r for r in rows if r["injection_in_current_version"].lower() == "true"]
check("papers currently serving injection", 0, len(still_injecting))
assert "Not one still serves the injection" in HTML, "no-injection sentence drifted"

# 3. 4 removed before 2025-07-01, 1 withdrawn after
before = [r for r in rows if r["removal_relative_to_public_exposure"] == "before-2025-07-01"]
after = [r for r in rows if r["removal_relative_to_public_exposure"] == "after-2025-07-01"]
check("removed BEFORE 2025-07-01 (Nikkei)", 4, len(before))
check("removed AFTER 2025-07-01 (Nikkei)", 1, len(after))
assert "4 of 5" in HTML and "before</em>" in HTML, "before-count text drifted"

# 4. Only one withdrawal
withdrawn = [r for r in rows if r["withdrawn"].lower() == "true"]
check("withdrawn papers", 1, len(withdrawn))
assert withdrawn[0]["arxiv_id"] == "2505.15075", "withdrawal arXiv id drift"

# 5. Two authored by the same first author at KAIST
kaist_lee = [r for r in rows if r["first_author"].strip() == "Junghyun Lee"]
check("Junghyun Lee papers", 2, len(kaist_lee))
assert all("KAIST" in r["institutions_visible"] for r in kaist_lee), "KAIST attribution drift"

# 6. Per-paper days_v1_to_removal_or_withdrawal are consistent with dates
from datetime import date
def diff(a, b):
    da = date.fromisoformat(a); db = date.fromisoformat(b)
    return (db - da).days

for r in rows:
    if r["injection_first_removed_at_date"] and r["days_v1_to_removal_or_withdrawal"]:
        base = r["v1_date"]
        # For 2502.19918, the injection was introduced at v2, not v1, so the "days" field is v2->v3
        if r["arxiv_id"] == "2502.19918":
            base = "2025-05-22"  # v2 date
        d = diff(base, r["injection_first_removed_at_date"])
        check(f"days for {r['arxiv_id']}", d, int(r["days_v1_to_removal_or_withdrawal"]))

# 7. Version rows: for each paper, presence should agree with cohort's injection_in_current_version
for aid in {r["arxiv_id"] for r in rows}:
    pv = [v for v in vers if v["arxiv_id"] == aid]
    pv.sort(key=lambda v: v["version"])
    if not pv: continue
    latest = pv[-1]
    if latest["injection_present"] == "true":
        cohort_row = [r for r in rows if r["arxiv_id"] == aid][0]
        assert cohort_row["injection_in_current_version"].lower() == "true", f"contradiction for {aid}"

# 8. Every date in versions.csv is ISO-parseable
for v in vers:
    try:
        date.fromisoformat(v["version_date"])
    except ValueError:
        errors.append(f"bad date in versions.csv: {v}")

if errors:
    print("\nDRIFT:", file=sys.stderr)
    for e in errors: print(" -", e, file=sys.stderr)
    sys.exit(1)

print("\nALL CHECKS PASS")
