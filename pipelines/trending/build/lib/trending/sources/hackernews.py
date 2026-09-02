"""Hacker News — the front page, via the official Firebase API."""
from __future__ import annotations

import time

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

BASE = "https://hacker-news.firebaseio.com/v0"
TOP_N = 30
THROTTLE_S = 0.05


def fetch_source(ctx: Context) -> SourceResult:
    ids = fetch(f"{BASE}/topstories.json", client=ctx.client, expect="json")[:TOP_N]
    signals: list[Signal] = []
    notes: list[str] = []
    for rank, item_id in enumerate(ids, 1):
        try:
            item = fetch(f"{BASE}/item/{item_id}.json", client=ctx.client, expect="json")
        except SourceUnavailable as exc:
            notes.append(f"item {item_id}: {exc}"[:120])
            continue
        if not item or not item.get("title"):
            continue
        hn_url = f"https://news.ycombinator.com/item?id={item_id}"
        signals.append(Signal(
            source="hackernews", label=item["title"].strip(), rank=rank,
            magnitude=int(item.get("score") or 0), magnitude_unit="points",
            url=item.get("url") or hn_url,
            meta={"comments": int(item.get("descendants") or 0), "id": item_id,
                  "discussion": hn_url},
        ))
        time.sleep(THROTTLE_S)
    return SourceResult(signals, as_of=ctx.today.isoformat(), notes=notes)


SPEC = SourceSpec(
    id="hackernews", name="Hacker News — front page (official API)",
    url="https://github.com/HackerNews/API",
    licence="Y Combinator API terms; titles, links and counts only",
    fetch=fetch_source,
)
