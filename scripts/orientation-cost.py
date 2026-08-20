#!/usr/bin/env python3
"""What each practice must read before it may work, in words.

The handoff of 2026-08-14 measured this once, by hand, and the number was the argument:
the Field and the Studio each read close to a hundred thousand words at orientation — a
four-hundred-page book, every night, before the first move. This is that measurement as a
loop, so the next drift shows up as a number rather than as a feeling.

What is counted is what each practice's own ROUTINE PROMPT names at orientation, not
everything in the repository. Run it from the workspace root (the directory holding the
engine checkouts), optionally against a git revision per practice:

    python3 scripts/orientation-cost.py                     # working trees, now
    python3 scripts/orientation-cost.py --rev field-research=d71572d

Two columns, because a file can be in the path in two different ways.

**read** is what a constitution orders read in full before the first move. This is the column
the 2026-08-14 table measured, and it stays comparable with it.

**recall** is what is reachable only by querying the index (`tools/memory/cli.py recall`) —
present, citable, never carried. On 2026-08-15 the whole of `memory/` moved from the first
column to the second in both practices: the Field's constitution had named `claims.md ·
open-questions.md · discarded.md · downstream-commitments.md` as "curated first" reading, 113,000
words, `claims.md` alone 57,000; the Studio had written "Memory is recall, not re-reading" into
its constitution on 2026-08-12 while its own orientation step two screens above still ordered the
opposite. Only `downstream-commitments.md` still reads in full, because it binds.
"""
import argparse
import pathlib
import re
import subprocess

ROOT = pathlib.Path(__file__).resolve().parents[2]

PLAN = {
    "field-research": {
        "files": ["PROTOCOL.md", "SEASON.md", "FIELD.md", "WORKBOARD.md", "REQUESTS.md"],
        "globs": [("field-feedback/*.md", 3), ("journal/*.md", 3)],
        # It binds — what this practice owes other people — so it still reads in full.
        "files_extra": ["memory/downstream-commitments.md"],
        "recall": [("memory/*.md", None), ("memory/dossiers/**/*.md", None)],
        "recall_except": ["memory/downstream-commitments.md"],
    },
    "studio": {
        "files": ["PROTOCOL.md", "SEASON.md", "WORKBOARD.md", "REQUESTS.md"],
        "globs": [("studio-feedback/*.md", 3), ("journal/*.md", 3)],
        "recall": [("memory/*.md", None), ("memory/dossiers/**/*.md", None),
                   ("memory/method-notes/**/*.md", None), ("memory/season-two/**/*.md", None)],
    },
    "ulysses": {
        "files": ["PROTOCOL.md", "SEASON.md", "governance/STANDING-DELEGATION.md", "REQUESTS.md"],
        "globs": [("atelier-feedback/*.md", 3)],
    },
    "error-as-method": {
        "files": ["PROTOCOL.md", "README.md", "works/position-2026-07-14.md", "REQUESTS.md"],
        "globs": [("journal/*.md", 3)],
    },
}


def words_at(repo: str, rev: str | None, path: str) -> int:
    if rev is None:
        p = ROOT / repo / path
        return len(p.read_text().split()) if p.is_file() else 0
    r = subprocess.run(["git", "-C", str(ROOT / repo), "show", f"{rev}:{path}"],
                       capture_output=True, text=True)
    return len(r.stdout.split()) if r.returncode == 0 else 0


def files_at(repo: str, rev: str | None, pattern: str) -> list[str]:
    if rev is None:
        return sorted(str(p.relative_to(ROOT / repo)) for p in (ROOT / repo).glob(pattern))
    r = subprocess.run(["git", "-C", str(ROOT / repo), "ls-tree", "-r", "--name-only", rev],
                       capture_output=True, text=True)
    # `*` must not cross a directory separator and `**/` must, exactly as pathlib.glob has it.
    # Without this a revision counts nested files the working-tree branch never sees, and the
    # before/after comparison this whole script exists for silently stops comparing.
    parts = [re.escape(seg) if seg not in ("*", "**") else seg for seg in re.split(r"(\*\*|\*)", pattern)]
    rx = re.compile("".join(
        "(?:[^/]*/)*" if seg == "**" else "[^/]*" if seg == "*" else seg for seg in parts
    ).replace("(?:[^/]*/)*/", "(?:[^/]*/)*") + r"\Z")
    return sorted(f for f in r.stdout.splitlines() if rx.match(f))


def measure(repo: str, rev: str | None = None) -> tuple[int, int, list[tuple[str, int]]]:
    """→ (counted total, named-but-uncounted total, per-component rows)."""
    plan, total, named, rows = PLAN[repo], 0, 0, []
    for f in plan["files"] + plan.get("files_extra", []):
        w = words_at(repo, rev, f)
        total += w
        rows.append((f, w))
    for pattern, newest in plan["globs"]:
        found = files_at(repo, rev, pattern)
        found = found[-newest:] if newest else found
        w = sum(words_at(repo, rev, f) for f in found)
        total += w
        rows.append((f"{pattern} (newest {len(found)})", w))
    skip = set(plan.get("recall_except", []))
    for pattern, newest in plan.get("recall", []):
        found = [f for f in files_at(repo, rev, pattern) if f not in skip]
        found = found[-newest:] if newest else found
        w = sum(words_at(repo, rev, f) for f in found)
        named += w
        rows.append((f"[recall, not read] {pattern} ({len(found)} files)", w))
    return total, named, rows


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--rev", action="append", default=[], metavar="REPO=REV",
                    help="measure one practice at a git revision instead of its working tree")
    ap.add_argument("-v", "--verbose", action="store_true", help="print every component")
    args = ap.parse_args()
    revs = dict(pair.split("=", 1) for pair in args.rev)

    print(f"{'practice':<18}{'read':>10}{'recall':>10}")
    grand = 0
    for repo in PLAN:
        total, named, rows = measure(repo, revs.get(repo))
        grand += total
        print(f"{repo:<18}{total:>10,}{named or '—':>10}")
        if args.verbose:
            for name, w in rows:
                print(f"    {w:>10,}  {name}")
    print(f"{'TOTAL':<18}{grand:>10,}")


if __name__ == "__main__":
    main()
