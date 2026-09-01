#!/usr/bin/env python3
"""Builds data.json for this artifact from three repositories on disk.

Every number printed on index.html comes from the file this writes, and check.py
verifies that claim mechanically. Nothing here re-implements the measurement: it
imports tools/lineage/lineage.py and calls it, so the page and the instrument
cannot drift apart.

    python3 window/cycle-001-session-2/build.py \
        --repo ulysses=/path/to/ulysses \
        --repo error-as-method=/path/to/error-as-method \
        --repo n-1=/path/to/n-1 \
        > window/cycle-001-session-2/data.json

The three repositories are read, never written. If one is absent the build stops
and says which — a partial comparison silently reported as a whole one is the
error this session is about.
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import sys
from collections import Counter
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
LINEAGE = HERE.parents[1] / "tools" / "lineage" / "lineage.py"

_spec = importlib.util.spec_from_file_location("lineage", LINEAGE)
L = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(L)

# The fork of 2026-08-10: the day the nightly line was split off and resumed under a
# restored constitution. Stated in error-as-method/PROTOCOL.md, head note.
FORK = "2026-08-10"


def measure(root: Path, dirs, globs, bare_dates_addressable=False) -> dict:
    """One run of the instrument, prose edges only. See tools/lineage/METHOD.md."""
    if bare_dates_addressable:
        saved, L.unaddressable = L.unaddressable, lambda s: False
    try:
        units = L.collect_units(root, dirs, globs)
        if not units:
            raise SystemExit(f"no units found under {root} with {dirs} {globs}")
        prose = {k: v for k, v in L.build_edges(units).items() if v == "prose"}
        out = L.summarise(units, prose)
        out["unaddressable_units"] = sorted(s for s in units if L.unaddressable(s))
        return out
    finally:
        if bare_dates_addressable:
            L.unaddressable = saved


def era_split(run: dict, cut: str) -> dict:
    """The nightly line's works before and after the fork. `cut` belongs to 'after'."""
    deg = run["degree"]
    before = sorted(s for s, d in deg.items() if d["date"] and d["date"] < cut)
    after = sorted(s for s, d in deg.items() if d["date"] and d["date"] >= cut)
    connected = lambda ss: sum(1 for s in ss if deg[s]["in"] or deg[s]["out"])
    edges = run["backward_edges"] + run["forward_edges"] + run["undated_edges"]
    return {
        "cut": cut,
        "before": {"works": len(before), "with_edge": connected(before),
                   "edges_out": sum(1 for e in edges if e[0] in before)},
        "after": {"works": len(after), "with_edge": connected(after),
                  "edges_out": sum(1 for e in edges if e[0] in after)},
        "citing_works": len({e[0] for e in edges}),
        "edges_by_source_date": dict(sorted(Counter(e[0][:10] for e in edges).items())),
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", action="append", default=[], metavar="NAME=PATH")
    args = ap.parse_args()
    repos = {}
    for spec in args.repo:
        name, _, path = spec.partition("=")
        p = Path(path).expanduser().resolve()
        if not p.is_dir():
            raise SystemExit(f"repository {name!r} not found at {p}")
        repos[name] = p
    for need in ("ulysses", "error-as-method", "n-1"):
        if need not in repos:
            raise SystemExit(f"missing --repo {need}=<path>; this comparison needs all three")

    uly, eam, n1 = repos["ulysses"], repos["error-as-method"], repos["n-1"]

    # 1. The made things, each practice measured with its own unit convention.
    made = {
        "ulysses": measure(uly, L.DEFAULT_DIRS, L.DEFAULT_GLOBS),
        "error-as-method": measure(eam, [("works", "work")], []),
        "n-1": measure(n1, [("works", "work")], [("nights/*.md", "night")]),
    }

    # 2. The nightly line's works, measured twice: in the fork-truncated copy this
    #    repository carries, and in the repository where the line continued.
    uly_works = {s for s, d in made["ulysses"]["degree"].items() if d["kind"] == "work"}
    eam_works = set(made["error-as-method"]["degree"])
    shared = sorted(uly_works & eam_works)
    conn = lambda run, ss: sum(1 for s in ss
                               if run["degree"][s]["in"] or run["degree"][s]["out"])
    w2w = lambda run: [e for e in run["backward_edges"] + run["forward_edges"]
                       + run["undated_edges"]
                       if run["degree"][e[0]]["kind"] == "work"
                       and run["degree"][e[1]]["kind"] == "work"]
    two_corpora = {
        "shared_works": len(shared),
        "only_in_truncated_copy": sorted(uly_works - eam_works),
        "only_in_continued_line": len(eam_works - uly_works),
        "with_edge_in_truncated_copy": conn(made["ulysses"], shared),
        "with_edge_in_continued_line": conn(made["error-as-method"], shared),
        "work_to_work_edges_in_truncated_copy": w2w(made["ulysses"]),
        "work_to_work_edges_in_continued_line": len(w2w(made["error-as-method"])),
    }

    # 3. The session logs, matched across the three — and what the refinement of
    #    2026-09-01 removed from each.
    logs = {}
    for name, root, glob in (("ulysses", uly, "journal/*.md"),
                             ("error-as-method", eam, "journal/*.md"),
                             ("n-1", n1, "nights/*.md")):
        after = measure(root, [], [(glob, "log")])
        before = measure(root, [], [(glob, "log")], bare_dates_addressable=True)
        logs[name] = {
            "notes": after["units"]["total"],
            "unaddressable": len(after["unaddressable_units"]),
            "before_refinement": {"edges": before["edges"]["total"],
                                  "with_edge": before["reach"]["units_with_at_least_one_edge"]},
            "after_refinement": {"edges": after["edges"]["total"],
                                 "with_edge": after["reach"]["units_with_at_least_one_edge"]},
        }
    # 4. Nameability. A unit is only citable if its slug can be written into a sentence.
    #    Measured outside the log directory itself, so it asks whether the practice's
    #    other writing can reach its own sessions at all.
    for name, root, sub in (("ulysses", uly, "journal"),
                            ("error-as-method", eam, "journal"),
                            ("n-1", n1, "nights")):
        stems = [p.stem for p in sorted((root / sub).glob("*.md"))]
        blob = []
        for p in root.rglob("*"):
            if (p.is_file() and p.suffix.lower() in L.TEXT_SUFFIXES
                    and ".git" not in p.parts and p.parent != root / sub):
                blob.append(L.read_text(p))
        blob = "\n".join(blob)
        named = sum(1 for s in stems if L.slug_pattern([s]).search(blob))
        logs[name]["slug_chars_mean"] = round(sum(len(s) for s in stems) / len(stems))
        logs[name]["named_outside_the_log"] = named

    logs["_total_edges_removed"] = sum(
        v["before_refinement"]["edges"] - v["after_refinement"]["edges"]
        for k, v in logs.items() if not k.startswith("_"))
    logs["_total_edges_before"] = sum(
        v["before_refinement"]["edges"] for k, v in logs.items() if not k.startswith("_"))

    json.dump({
        "generated": date.today().isoformat(),
        "artifact": "window/cycle-001-session-2",
        "instrument": "tools/lineage/lineage.py",
        "method": "tools/lineage/METHOD.md",
        "edge_strength": "prose only — a slug written into a sentence, never a filled-in "
                         "field or a generated table (METHOD.md, refinement of 2026-08-31)",
        "made_things": made,
        "two_corpora": two_corpora,
        "nightly_eras": era_split(made["error-as-method"], FORK),
        "session_logs": logs,
    }, sys.stdout, indent=2, ensure_ascii=False)
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()
