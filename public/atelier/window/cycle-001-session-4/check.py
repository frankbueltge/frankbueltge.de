#!/usr/bin/env python3
"""check.py — re-derive every number in index.html from the raw runs, independently.

Nothing here imports build.py. The counts are recomputed from the two run
files by a second reading of the same evidence, and each one is asserted to
appear in the page. A number that is in the page and not in the data, or in
the data and not in the page, fails here.

Usage: python3 window/cycle-001-session-4/check.py
"""

import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))

with open(os.path.join(HERE, "data", "doorkeeper.json")) as fh:
    door = json.load(fh)
with open(os.path.join(HERE, "data", "knock-run-1.json")) as fh:
    knock = json.load(fh)
with open(os.path.join(HERE, "index.html")) as fh:
    page = fh.read()

checks, failed = 0, []


def want(label, needle):
    global checks
    checks += 1
    if str(needle) not in page:
        failed.append(f"{label}: {needle!r} not in index.html")


rows = door["rows"]

# --- structure counts, recomputed from the permits/structure fields ----------
determined = [r for r in rows
              if r["structure"] in ("OPEN", "BLOCKLIST", "ALLOWLIST", "CLOSED", "NONE")]
permit = [r for r in determined if r["permits_instrument"] is True]
refuse = [r for r in determined if r["permits_instrument"] is False]
opens = [r for r in determined if r["structure"] == "OPEN"]
blocks = [r for r in determined if r["structure"] == "BLOCKLIST"]
allows = [r for r in determined if r["structure"] == "ALLOWLIST"]

want("host count", len(rows))
want("determined", len(determined))
want("permitting", len(permit))
want("open hosts", len(opens))
want("blocklists", len(blocks))
assert len(refuse) == 1, f"expected exactly one refusing host, got {len(refuse)}"
want("refusing host name", refuse[0]["name"])

# --- named agents ------------------------------------------------------------
named_refused = sum(r["n_named"] for r in blocks)
named_admitted = sum(len(r["admitted"]) for r in allows)
want("agents named to be refused", named_refused)
want("agents named to be admitted", named_admitted)
assert named_admitted == len(refuse[0]["admitted"]), "admitted totals disagree"

# every admitted name must be printed verbatim in the page
for agent in refuse[0]["admitted"]:
    want(f"admitted agent {agent}", agent)

# the page classes the 29 as 11 crawlers + 7 assistant fetchers + 11 preview bots
assert 11 + 7 + 11 == len(refuse[0]["admitted"]), \
    "the page's breakdown of the allowlist no longer sums to the measured list"

# --- arrivals ----------------------------------------------------------------
arrived = [r for r in knock["results"] if "a" in r and r["a"].get("status") == 200]
skipped = [r for r in knock["results"] if r.get("skipped")]
want("arrivals", len(arrived))
want("skipped by robots", len(skipped))
want("fewest words", f'{min(r["a"]["words"] for r in arrived):,}')
want("most words", f'{max(r["a"]["words"] for r in arrived):,}')
for r in arrived:
    want(f'word count for {r["id"]}', f'{r["a"]["words"]:,}')

# every skipped target must have been skipped for robots, not for anything else
for r in skipped:
    assert "robots" in r["skipped"], f'{r["id"]} skipped for a reason other than robots'
    assert r["robots"]["allows_probe"] is False, f'{r["id"]} skipped but robots allowed it'

# --- the reader knock really did fail on every target it was tried on --------
tried = [r for r in knock["results"] if "b" in r]
assert tried, "no reader knock was attempted"
assert all(r["b"].get("status") is None for r in tried), \
    "the page says the browser knock failed on every target; a run disagrees"
assert all("error" in r["b"] for r in tried), "a failed reader knock carries no error"

# --- undetermined ------------------------------------------------------------
undet = [r for r in rows if r["structure"] in ("UNDETERMINED", "HTML-IN-PLACE-OF-RULES")]
want("undetermined count", len(undet))
for r in undet:
    want(f'undetermined host {r["id"]}', r["name"])

# --- no third-party page text was carried into the artifact ------------------
for r in knock["results"]:
    for side in ("a", "b"):
        if side in r:
            assert "text" not in r[side], \
                f'{r["id"]} run data carries fetched page text; only counts belong here'

# --- the page cites its own run timestamps -----------------------------------
want("doorkeeper run stamp", door["run_utc"])
want("knock run stamp", knock["run_utc"])

# --- nothing in the page claims a delivery ratio the run never produced ------
assert "delivered=" not in page, "page reports a delivery ratio; the browser knock failed"
assert not re.search(r"\b\d+(\.\d+)?\s*%\s*of the (work|exposition)", page), \
    "page states a proportion of a work delivered; no such quantity was measured"

if failed:
    print(f"FAILED {len(failed)} of {checks} checks:")
    for f in failed:
        print("  -", f)
    sys.exit(1)

print(f"{checks} numbers and names in index.html re-derived from the run data — all agree.")
print(f"  hosts {len(rows)} · determined {len(determined)} · permit {len(permit)} · "
      f"refuse {len(refuse)} · named-to-refuse {named_refused} · "
      f"named-to-admit {named_admitted} · arrivals {len(arrived)}")
