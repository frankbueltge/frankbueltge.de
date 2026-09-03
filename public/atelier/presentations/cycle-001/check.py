#!/usr/bin/env python3
"""Re-derive every number on the cycle-001 presentation, independently.

This file does not import `build.py`. It reads the same four committed session
records, computes the headline numbers a second time by its own route, compares
them with `data.json`, and then asserts that each one is actually printed in
`index.html` — a number that is right in the record and wrong on the page is
still wrong.

    python3 presentations/cycle-001/check.py        # from the repository root

Exit code 0 and a count of the checks that passed, or a non-zero exit and the
first disagreement.
"""

from __future__ import annotations

import json
import pathlib
import re
import statistics
import sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
HERE = pathlib.Path(__file__).resolve().parent

FAILS: list[str] = []
CHECKS = 0


def eq(label: str, got, want) -> None:
    global CHECKS
    CHECKS += 1
    if got != want:
        FAILS.append(f"{label}: re-derived {got!r}, data.json says {want!r}")


def on_page(label: str, needle: str, page: str) -> None:
    global CHECKS
    CHECKS += 1
    if needle not in page:
        FAILS.append(f"{label}: {needle!r} is not printed on the page")


def main() -> int:
    global CHECKS
    d = json.loads((HERE / "data.json").read_text(encoding="utf-8"))
    page = (HERE / "index.html").read_text(encoding="utf-8")
    s1 = json.loads((ROOT / d["sources"]["s1"]).read_text(encoding="utf-8"))
    s2 = json.loads((ROOT / d["sources"]["s2"]).read_text(encoding="utf-8"))
    s3 = json.loads((ROOT / d["sources"]["s3"]).read_text(encoding="utf-8"))
    s4 = json.loads((ROOT / d["sources"]["s4"]).read_text(encoding="utf-8"))

    # ---- I. the clause ---------------------------------------------------
    c = d["clause"]
    night = s2["made_things"]["error-as-method"]
    cut = c["cut"]
    # count the eras straight off the edge list and the degree table, not off
    # the summary block session 2 wrote
    dates = {slug: deg["date"] for slug, deg in night["degree"].items()}
    before_works = sum(1 for v in dates.values() if v < cut)
    after_works = sum(1 for v in dates.values() if v >= cut)
    before_edges = sum(1 for a, _b, _n, _k in night["backward_edges"] if dates[a] < cut)
    after_edges = sum(1 for a, _b, _n, _k in night["backward_edges"] if dates[a] >= cut)
    eq("works before the clause", before_works, c["before"]["works"])
    eq("works after the clause", after_works, c["after"]["works"])
    eq("references before the clause", before_edges, c["before"]["edges_out"])
    eq("references after the clause", after_edges, c["after"]["edges_out"])
    eq("works in total", len(dates), c["works_total"])
    eq("references in total", len(night["backward_edges"]), c["edges_total"])
    eq("works drawn", len(c["works"]), c["works_total"])
    eq("arcs drawn", len(c["edges"]), c["edges_total"])
    touched = {a for a, _b, _n, _k in night["backward_edges"]} | {
        b for _a, b, _n, _k in night["backward_edges"]
    }
    eq("works with at least one reference", len(touched), c["with_edge"])
    eq("works with none", len(dates) - len(touched), c["orphans"])
    eq("session 1 units", s1["all_edges"]["units"]["total"], c["s1_units"])
    eq("continued line, work-to-work", s2["two_corpora"]["work_to_work_edges_in_continued_line"],
       c["continued_work_to_work_edges"])
    eq("truncated copy, work-to-work",
       len(s2["two_corpora"]["work_to_work_edges_in_truncated_copy"]),
       c["truncated_work_to_work_edges"])
    for k in ("ulysses", "error-as-method", "n-1"):
        eq(f"{k} mean slug length", s2["session_logs"][k]["slug_chars_mean"],
           c["handles"][k]["slug_chars_mean"])
        eq(f"{k} notes named elsewhere", s2["session_logs"][k]["named_outside_the_log"],
           c["handles"][k]["named_outside_the_log"])

    # ---- II. the threshold ----------------------------------------------
    t = d["threshold"]
    run = s3["runs"][t["run"]]
    total_at_analytic = 0
    total_surviving = 0
    louder = 0
    for lane in t["lanes"]:
        src = run["detectors"][lane["key"]]
        nulls = src["null_all_log10p"]
        eq(f"{lane['key']}: shuffles", len(nulls), t["perms"])
        eq(f"{lane['key']}: shuffles carried to the page", len(lane["null"]), t["perms"])
        eq(f"{lane['key']}: loudest shuffle", min(nulls), lane["null_loudest"])
        eq(f"{lane['key']}: quietest shuffle", max(nulls), lane["null_quietest"])
        eq(f"{lane['key']}: assumed cut", src["analytic_cut_log10p"], lane["analytic"])
        eq(f"{lane['key']}: measured cut", src["empirical_cut_log10p"], lane["empirical"])
        eq(f"{lane['key']}: orders apart",
           round(src["analytic_cut_log10p"] - src["empirical_cut_log10p"], 1), lane["offset"])
        eq(f"{lane['key']}: shuffles louder than the assumed cut",
           sum(1 for x in nulls if x < src["analytic_cut_log10p"]),
           lane["null_louder_than_analytic"])
        eq(f"{lane['key']}: surviving events", len(src["events"]), lane["n_events"])
        total_at_analytic += src["events_over_analytic_cut"]
        total_surviving += src["n_events"]
        louder += lane["null_louder_than_analytic"]
        # the sign of the offset is the claim, so state it twice
        if lane["key"] == "remainder" and lane["offset"] >= 0:
            FAILS.append("remainder: the formula is claimed to be too strict; the sign says otherwise")
        CHECKS += 1
    eq("events at the assumed cut", total_at_analytic, t["events_at_analytic_cut"])
    eq("events surviving the shuffles", total_surviving, t["events_surviving"])
    eq("shuffles in all", sum(len(l["null"]) for l in t["lanes"]), t["null_total"])
    eq("shuffles louder than the assumed cut", louder, t["null_louder_than_analytic_total"])
    eq("the run this page reports", t["run"], "df-global")
    # a median, computed here and nowhere else, as a second look at the cloud
    atelier = next(l for l in t["lanes"] if l["key"] == "atelier")
    if not (atelier["null_loudest"] <= statistics.median(atelier["null"]) <= atelier["null_quietest"]):
        FAILS.append("atelier: the median of the shuffles falls outside their own range")
    CHECKS += 1

    # ---- III. the list ---------------------------------------------------
    l = d["list"]
    hosts = s4["hosts"]
    eq("hosts asked", len(hosts), l["n_hosts"])
    eq("hosts that answered readably", sum(1 for h in hosts if h["permits_instrument"] is not None),
       l["n_determined"])
    eq("hosts that did not", sum(1 for h in hosts if h["permits_instrument"] is None),
       l["n_undetermined"])
    eq("hosts that permit", sum(1 for h in hosts if h["permits_instrument"] is True), l["n_permit"])
    eq("hosts that refuse", sum(1 for h in hosts if h["permits_instrument"] is False), l["n_refuse"])
    eq("open rules", sum(1 for h in hosts if h["structure"] == "OPEN"), l["n_open"])
    eq("blocklists", sum(1 for h in hosts if h["structure"] == "BLOCKLIST"), l["n_blocklist"])
    eq("allowlists", sum(1 for h in hosts if h["structure"] == "ALLOWLIST"), l["n_allowlist"])
    eq("agents named to be refused",
       sum(h["n_named"] for h in hosts if h["structure"] == "BLOCKLIST"), l["named_refused_total"])
    eq("agents named to be admitted",
       sum(h["n_named"] for h in hosts if h["structure"] == "ALLOWLIST"), l["named_admitted_total"])
    eq("rows drawn", len(l["hosts"]), l["n_hosts"])
    eq("documents that arrived", len(s4["arrivals"]), l["arrived"])
    eq("arrived from the refusing host",
       sum(1 for a in s4["arrivals"] if "researchcatalogue.net" in a["url"]),
       l["arrived_from_refusing_host"])
    eq("arrived from the abstract host",
       sum(1 for a in s4["arrivals"] if "jar-online.net" in a["url"]),
       l["arrived_from_abstract_host"])
    eq("paths skipped because the rule said so", s4["n_skipped_by_robots"], l["skipped_by_rule"])
    # the correction this page publishes rests on exactly this: nothing arrived
    # from the refusing host, and the pages that did belong to another one
    if l["arrived_from_refusing_host"] != 0:
        FAILS.append("the correction claims nothing arrived from the refusing host; the record disagrees")
    CHECKS += 1

    # ---- the page prints what the record says -----------------------------
    for label, value in [
        ("references before", c["before"]["edges_out"]),
        ("references after", c["after"]["edges_out"]),
        ("works before", c["before"]["works"]),
        ("works after", c["after"]["works"]),
        ("works in total", c["works_total"]),
        ("events at the assumed cut", t["events_at_analytic_cut"]),
        ("events surviving", t["events_surviving"]),
        ("shuffles per record", t["perms"]),
        ("shuffles in all", t["null_total"]),
        ("hosts asked", l["n_hosts"]),
        ("hosts that permit", l["n_permit"]),
        ("agents named to be admitted", l["named_admitted_total"]),
        ("agents named to be refused", l["named_refused_total"]),
        ("expositions skipped", l["skipped_by_rule"]),
    ]:
        on_page(label, str(value), page)
    for lane in t["lanes"]:
        on_page(f"{lane['key']} offset", str(abs(lane["offset"])), page)

    # the page must open on its own: no network, no library, no tracker
    for forbidden in ("http://", "src=", "@import", "fetch(", "XMLHttpRequest"):
        CHECKS += 1
        if forbidden in page:
            FAILS.append(f"the page is not self-contained: it carries {forbidden!r}")
    # and it must carry a complete figure before any script runs
    body = page.split("<script", 1)[0]
    for fig in ("fig-clause", "fig-threshold", "fig-list"):
        CHECKS += 1
        if f'id="{fig}"' not in body or "<svg" not in body:
            FAILS.append(f"{fig} is not drawn in the markup itself")
    CHECKS += 1
    if body.count("<circle") < c["works_total"]:
        FAILS.append("fewer works are drawn in the markup than the record holds")
    # a control that only works with script must not be on show when script is off:
    # every control group is hidden in the markup and unhidden by the script, and the
    # class's own `display` must not defeat the `hidden` attribute
    CHECKS += 1
    if ".controls[hidden]{display:none}" not in page:
        FAILS.append("the control groups' class overrides [hidden]: dead controls with script off")
    for group in re.findall(r'<div class="controls"[^>]*>', page):
        CHECKS += 1
        if "hidden" not in group:
            FAILS.append(f"a control group is shown before the script wires it: {group}")
    CHECKS += 1
    if page.count("hidden=false") < 2:
        FAILS.append("the script does not unhide the control groups it wires")

    if FAILS:
        print(f"{len(FAILS)} of {CHECKS} checks failed:", file=sys.stderr)
        for f in FAILS:
            print("  -", f, file=sys.stderr)
        return 1
    print(f"{CHECKS} checks passed — every number on the page re-derived from the four session records")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
