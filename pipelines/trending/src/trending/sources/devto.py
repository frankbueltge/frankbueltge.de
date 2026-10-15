"""DEV — the top articles of the last day, from the Forem API.

`top=1` is the API's own "best of the last day" ranking, so the order is the platform's,
not ours. Only titles, links and the platform's own reaction and comment counts are kept;
the article's own teaser is capped, the body is never read."""
from __future__ import annotations

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://dev.to/api/articles?top=1&per_page=30"
DESCRIPTION_MAX = 200


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    signals: list[Signal] = []
    for article in data:
        title = (article.get("title") or "").strip()
        if not title:
            continue
        tags = article.get("tag_list")
        if isinstance(tags, str):
            tags = [t.strip() for t in tags.split(",") if t.strip()]
        signals.append(Signal(
            source="devto", label=title, rank=len(signals) + 1,
            magnitude=int(article.get("public_reactions_count") or 0),
            magnitude_unit="reactions",
            url=(article.get("url") or "").strip() or None,
            meta={"tags": list(tags or []),
                  "comments_count": int(article.get("comments_count") or 0),
                  "description": (article.get("description") or "").strip()[:DESCRIPTION_MAX] or None},
        ))
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="devto", name="DEV — top articles of the day (Forem API)",
    url="https://developers.forem.com/api",
    licence="Forem API terms; titles, links and counts only",
    fetch=fetch_source,
)
