#!/usr/bin/env python3
"""Regenerate src/data/parallaxe/provenance.json from git history.

The Iceberg integrity panel (USP rework #2) shows how long the register has run and how
many committed revisions it carries — the process differentiator the audit named (a
standing, never-retconned public register, vs. papers and dead demos). CI checkouts are
shallow, so the page cannot derive this at build time; this script derives it from a full
local checkout and commits the dated snapshot. Run it whenever the number should refresh
(the weekly currency sweep may also run it).
"""
import json, subprocess, datetime, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
TARGET = ROOT / "src/data/parallaxe/provenance.json"
CMD = ["git", "log", "--format=%ad", "--date=short", "--follow", "--", "src/data/parallaxe/register.json"]

dates = subprocess.run(CMD, capture_output=True, text=True, cwd=ROOT, check=True).stdout.split()
if not dates:
    raise SystemExit("no history found — refusing to write an empty provenance")

TARGET.write_text(json.dumps({
    "_": "Register provenance — derived from git history, dated. Regenerate: python3 scripts/parallaxe_provenance.py. Never hand-edit numbers.",
    "derivation": " ".join(CMD),
    "snapshot_date": datetime.date.today().isoformat(),
    "first_commit": dates[-1],
    "committed_revisions": len(dates),
}, indent=2) + "\n")
print(f"provenance: {len(dates)} revisions since {dates[-1]}")
