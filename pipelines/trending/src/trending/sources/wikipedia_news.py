"""Wikipedia, "In the news" — the handful of events the encyclopaedia's editors agreed to post.

Added 2026-11-14. The most-read list says what readers opened; this box on the English main
page says what a community of editors judged to be an event worth a line, by open discussion.
It changes a few times a week, not every day, and a line stays until newer ones push it off,
so the same line can stand in several days' ledgers. Read from Wikimedia's documented
Feed API; the line's markup is reduced to its text and the first linked article is the link.

One platform with `wikipedia`: the same public, a second list."""
from __future__ import annotations

import html
import re
from datetime import timedelta

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://api.wikimedia.org/feed/v1/wikipedia/en/featured/{y:04d}/{m:02d}/{d:02d}"
_COMMENT = re.compile(r"<!--.*?-->", re.S)
_TAG = re.compile(r"<[^>]+>")


def story_text(markup: str) -> str:
    text = _TAG.sub("", _COMMENT.sub("", markup or ""))
    return " ".join(html.unescape(text).split())


def fetch_source(ctx: Context) -> SourceResult:
    data = None
    last: SourceUnavailable | None = None
    # The feed of a UTC day can be missing in its first minutes; yesterday's box is the same box.
    for back in (0, 1):
        day = ctx.today - timedelta(days=back)
        try:
            data = fetch(URL.format(y=day.year, m=day.month, d=day.day), client=ctx.client,
                         expect="json")
            as_of = day.isoformat()
            break
        except SourceUnavailable as exc:
            last = exc
    if data is None:
        raise last  # type: ignore[misc]
    signals: list[Signal] = []
    for item in data.get("news") or []:
        label = story_text(item.get("story") or "")
        if not label:
            continue
        links = item.get("links") or []
        url = None
        articles = []
        for link in links:
            title = ((link.get("titles") or {}).get("normalized") or "").strip()
            if title:
                articles.append(title)
            if url is None:
                url = (((link.get("content_urls") or {}).get("desktop") or {}).get("page") or None)
        signals.append(Signal(
            source="wikipedia_news", label=label, rank=len(signals) + 1, magnitude=None,
            magnitude_unit="rank", url=url, geo="en", meta={"articles": articles[:6]},
        ))
    return SourceResult(signals, as_of=as_of)


SPEC = SourceSpec(
    id="wikipedia_news", name="Wikipedia — In the news (Wikimedia Feed API, en)",
    url="https://en.wikipedia.org/wiki/Wikipedia:In_the_news",
    licence="CC BY-SA 4.0 (Wikipedia text)",
    fetch=fetch_source, optional=True, platform="wikipedia",
)
