"""Lobsters — the hottest stories of the computing community, from its own JSON feed.

A story submitted as a discussion carries no outward link; the comments page is then the
item's own address, which is what the feed itself offers as `comments_url`."""
from __future__ import annotations

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://lobste.rs/hottest.json"
TOP_N = 25
DESCRIPTION_MAX = 200


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    signals: list[Signal] = []
    for story in data:
        title = (story.get("title") or "").strip()
        if not title:
            continue
        description = (story.get("description_plain") or story.get("description") or "").strip()
        signals.append(Signal(
            source="lobsters", label=title, rank=len(signals) + 1,
            magnitude=int(story.get("score") or 0), magnitude_unit="points",
            url=(story.get("url") or "").strip() or story.get("comments_url") or None,
            meta={"comment_count": int(story.get("comment_count") or 0),
                  "tags": list(story.get("tags") or []),
                  "discussion": story.get("comments_url") or None,
                  "description": description[:DESCRIPTION_MAX] or None},
        ))
        if len(signals) >= TOP_N:
            break
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="lobsters", name="Lobsters — hottest stories (JSON feed)",
    url="https://lobste.rs/hottest.json",
    licence="Lobsters public feed; titles, links and counts only",
    fetch=fetch_source,
)
