"""Draw the committed deletion sample from the newspool — the receipt.

On run day R the chamber commits a random sample of pool day R−1
(`src/data/redaction/world/samples/<poolday>.json`). The next night rechecks
it, when its articles are ~29–53 hours old (midpoint ≈ 40 h, mirroring the
sealed spike). Because the manifest — URL, domain, title, first-seen — is in
git a night before the recheck, the house holds the receipt for every
vanished item: our own history proves what stood there.

The draw is seeded by the pool day, so a rerun of the same night draws the
same sample; an already-committed manifest is never redrawn (receipts are
immutable, like every archive JSON of the house).
"""
from __future__ import annotations

import random
import sys
from datetime import datetime, timezone
from pathlib import Path

from redaction.world import SAMPLE_SIZE, SAMPLE_STEP_MINUTES

# The raw-file fetch layer is shared with pipelines/newspool (single source of
# truth) — same import path trick as pipelines/consensus and pipelines/balance.
# Two candidates because the package runs both from a source checkout and as an
# installed package with the repo as cwd (the nightly workflow).
for _candidate in (
    Path.cwd() / "pipelines" / "newspool",
    Path(__file__).resolve().parents[4] / "newspool",
):
    if (_candidate / "fetch_pool.py").exists():
        sys.path.insert(0, str(_candidate))
        break
import fetch_pool  # noqa: E402


def _dedupe(rows: list[dict]) -> list[dict]:
    """First sighting wins — the pool's first-seen timestamp is the receipt."""
    seen: dict[str, dict] = {}
    for row in sorted(rows, key=lambda r: r["seen"]):
        seen.setdefault(row["url"], row)
    return list(seen.values())


def draw(
    pool_day: str,
    *,
    size: int = SAMPLE_SIZE,
    step_minutes: int = SAMPLE_STEP_MINUTES,
    fetch_slot=None,
    parse_gkg=None,
) -> dict:
    fetch_slot = fetch_slot or fetch_pool.fetch_slot
    parse_gkg = parse_gkg or fetch_pool.parse_gkg

    day = datetime.strptime(pool_day, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    slots = fetch_pool.slots_for_day(day, step_minutes)
    rows: list[dict] = []
    gaps: list[str] = []
    for stamp in slots:
        raw = fetch_slot(stamp)
        if raw is None:
            gaps.append(stamp)
            continue
        rows.extend(parse_gkg(raw))

    pool = _dedupe(rows)
    rng = random.Random(f"world-sample-{pool_day}")
    picked = rng.sample(pool, min(size, len(pool))) if pool else []
    items = sorted(
        (
            {"url": r["url"], "domain": r["domain"], "title": r["title"],
             "first_seen": r["seen"]}
            for r in picked
        ),
        key=lambda r: r["url"],
    )
    return {
        "pool_day": pool_day,
        "drawn_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "step_minutes": step_minutes,
        "slots_expected": len(slots),
        "slots_fetched": len(slots) - len(gaps),
        "gaps": gaps,
        "pool_size": len(pool),
        "sample_size": len(items),
        "items": items,
        "source": {
            "name": "GDELT GKG 2.1 raw files (English-monitored stream)",
            "url": "https://www.gdeltproject.org/",
            "notice": "Data: The GDELT Project — https://www.gdeltproject.org/",
        },
    }
