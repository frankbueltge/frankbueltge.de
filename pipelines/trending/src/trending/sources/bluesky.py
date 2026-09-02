"""Bluesky — the network's own trending topics, from the public AppView."""
from __future__ import annotations

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://public.api.bsky.app/xrpc/app.bsky.unspecced.getTrends?limit=25"


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    signals: list[Signal] = []
    for rank, t in enumerate(data.get("trends", []), 1):
        label = (t.get("displayName") or t.get("topic") or "").strip()
        if not label:
            continue
        link = t.get("link") or ""
        signals.append(Signal(
            source="bluesky", label=label, rank=rank,
            magnitude=int(t.get("postCount") or 0), magnitude_unit="posts",
            url=f"https://bsky.app{link}" if link.startswith("/") else (link or None),
            meta={"category": t.get("category"), "status": t.get("status"),
                  "started_at": t.get("startedAt"),
                  "description": (t.get("description") or "")[:200] or None},
        ))
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="bluesky", name="Bluesky — trending topics (public AppView)",
    url="https://public.api.bsky.app/xrpc/app.bsky.unspecced.getTrends",
    licence="Bluesky public API; topic names and counts only",
    fetch=fetch_source,
)
