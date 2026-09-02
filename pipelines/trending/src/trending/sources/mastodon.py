"""Mastodon — trending hashtags and trending links on mastodon.social."""
from __future__ import annotations

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

TAGS_URL = "https://mastodon.social/api/v1/trends/tags?limit=20"
LINKS_URL = "https://mastodon.social/api/v1/trends/links?limit=20"


def _uses(entry: dict) -> tuple[int | None, int | None]:
    history = entry.get("history") or []
    if not history:
        return None, None
    today = history[0]
    try:
        return int(today.get("uses") or 0), int(today.get("accounts") or 0)
    except (TypeError, ValueError):
        return None, None


def fetch_source(ctx: Context) -> SourceResult:
    signals: list[Signal] = []
    notes: list[str] = []
    try:
        for rank, tag in enumerate(fetch(TAGS_URL, client=ctx.client, expect="json"), 1):
            name = (tag.get("name") or "").strip()
            if not name:
                continue
            uses, accounts = _uses(tag)
            signals.append(Signal(
                source="mastodon", label=name, rank=rank, magnitude=uses, magnitude_unit="uses",
                url=tag.get("url"), meta={"kind": "tag", "accounts": accounts},
            ))
    except SourceUnavailable as exc:
        notes.append(f"tags: {exc}"[:120])
    try:
        for rank, link in enumerate(fetch(LINKS_URL, client=ctx.client, expect="json"), 1):
            title = (link.get("title") or "").strip()
            if not title:
                continue
            uses, _ = _uses(link)
            signals.append(Signal(
                source="mastodon", label=title, rank=rank, magnitude=uses, magnitude_unit="shares",
                url=link.get("url"),
                meta={"kind": "link", "provider": (link.get("provider_name") or "").strip() or None},
            ))
    except SourceUnavailable as exc:
        notes.append(f"links: {exc}"[:120])
    return SourceResult(signals, as_of=ctx.today.isoformat(), notes=notes)


SPEC = SourceSpec(
    id="mastodon", name="Mastodon — trending tags and links (mastodon.social)",
    url="https://docs.joinmastodon.org/methods/trends/",
    licence="Mastodon public API; tag names, link titles and counts only",
    fetch=fetch_source,
)
