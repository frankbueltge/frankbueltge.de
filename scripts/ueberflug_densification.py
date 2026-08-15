#!/usr/bin/env python3
"""Derive src/data/ueberflug/densification.json from the git history of the snapshot.

The Watchtower's target USP (USP rework #16, the audit's strongest rework direction of all
sixteen): not the view upward but its change — how the Earth-observation fleet densifies and
how the commercial/military ratio shifts. The page named this as an "open direction" and
assumed it needed a new pipeline that stops overwriting.

It does not. `src/data/ueberflug/satellites.json` is overwritten nightly in the working tree,
but every overwrite is a commit: git holds the full run of snapshots since 2026-06-12. This is
the house's own premise — git is the archive — applied to a file nobody had read backwards yet.
Same derivation pattern as the Iceberg integrity panel (scripts/parallaxe_provenance.py).

CI checkouts are shallow, so this cannot run at build time. Run it locally; commit the result.

    python3 scripts/ueberflug_densification.py

This script records counts only. It deliberately does NOT decide how satellites of unknown
ownership class enter a commercial-vs-military ratio — that rule lives in
src/lib/ueberflug/densification.ts, where it can be stated and tested in the open.
"""
import json
import pathlib
import subprocess
from collections import Counter

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = "src/data/ueberflug/satellites.json"
TARGET = ROOT / "src/data/ueberflug/densification.json"

# GCAT ownership classes, per src/lib/ueberflug/types.ts.
CLASSES = ("B", "C", "D", "A")


def git(*args: str) -> str:
    return subprocess.run(
        ["git", *args], capture_output=True, text=True, cwd=ROOT, check=True
    ).stdout


def revisions() -> list[tuple[str, str]]:
    """(sha, commit date) for every committed revision, oldest first."""
    lines = git("log", "--follow", "--format=%H %ad", "--date=short", "--", SOURCE)
    out = [tuple(line.split()) for line in lines.strip().splitlines()]
    return list(reversed(out))  # type: ignore[return-value]


def read_snapshot(sha: str) -> dict | None:
    try:
        return json.loads(git("show", f"{sha}:{SOURCE}"))
    except (subprocess.CalledProcessError, json.JSONDecodeError):
        return None  # a revision that does not parse is recorded as a gap, never guessed


def measure(snapshot: dict) -> dict:
    sats = snapshot.get("satellites", [])
    by_class = Counter((s.get("gcat") or {}).get("class") for s in sats)
    by_group = Counter(s.get("group") for s in sats)
    return {
        "fleet": len(sats),
        "by_class": {c: by_class.get(c, 0) for c in CLASSES},
        "unknown_class": by_class.get(None, 0),
        "by_group": {g: by_group.get(g, 0) for g in ("resource", "sar", "weather")},
    }


def main() -> None:
    revs = revisions()
    if not revs:
        raise SystemExit("no history found — refusing to write an empty series")

    series: list[dict] = []
    gaps: list[dict] = []
    seen_dates: set[str] = set()

    for sha, commit_date in revs:
        snapshot = read_snapshot(sha)
        if snapshot is None:
            gaps.append({"commit": sha, "commit_date": commit_date, "reason": "unreadable"})
            continue
        # The snapshot dates itself; the commit date is only the fallback.
        observed = (snapshot.get("generated_at") or commit_date)[:10]
        if observed in seen_dates:
            continue  # a day committed twice is one observation, not two
        seen_dates.add(observed)
        series.append({"date": observed, "commit": sha[:12], **measure(snapshot)})

    series.sort(key=lambda row: row["date"])

    TARGET.write_text(
        json.dumps(
            {
                "_": (
                    "Densification series — derived from the git history of "
                    f"{SOURCE}, one row per committed observation day. "
                    "Regenerate: python3 scripts/ueberflug_densification.py. "
                    "Never hand-edit numbers."
                ),
                "derivation": f"git log --follow -- {SOURCE} → git show <sha>:{SOURCE}",
                "source": SOURCE,
                "first_observation": series[0]["date"],
                "last_observation": series[-1]["date"],
                "observations": len(series),
                "gaps": gaps,
                "series": series,
            },
            indent=2,
        )
        + "\n"
    )
    print(
        f"densification: {len(series)} observations "
        f"{series[0]['date']} … {series[-1]['date']}, {len(gaps)} gaps"
    )


if __name__ == "__main__":
    main()
