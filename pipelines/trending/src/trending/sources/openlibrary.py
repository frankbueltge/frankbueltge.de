"""Open Library — the books readers are borrowing, logging and looking up today.

Added 2026-11-14: the one keyless daily ranking of books. Open Library (Internet Archive)
publishes a "trending today" list computed from its readers' activity. The author is part of
the label, for the reason given in apple_music.py: a title alone is often a common word."""
from __future__ import annotations

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://openlibrary.org/trending/daily.json?limit=25"


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    signals: list[Signal] = []
    for work in data.get("works") or []:
        title = " ".join((work.get("title") or "").split())
        key = (work.get("key") or "").strip()
        if not title or not key:
            continue
        authors = [a for a in (work.get("author_name") or []) if isinstance(a, str) and a.strip()]
        label = f"{title} — {authors[0].strip()}" if authors else title
        signals.append(Signal(
            source="openlibrary", label=label, rank=len(signals) + 1, magnitude=None,
            magnitude_unit="rank", url=f"https://openlibrary.org{key}",
            meta={"title": title, "authors": authors[:3],
                  "first_published": work.get("first_publish_year")},
        ))
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="openlibrary", name="Open Library — trending books today (public API)",
    url="https://openlibrary.org/trending/daily",
    licence="Open Library data (CC0); titles, authors and links only",
    fetch=fetch_source, optional=True,
)
