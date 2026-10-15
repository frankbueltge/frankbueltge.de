"""Google News — the top-stories RSS (US edition, English)."""
from __future__ import annotations

import xml.etree.ElementTree as ET

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en"
TOP_N = 30


def split_publisher(title: str) -> tuple[str, str | None]:
    """'Headline - Publisher' → ('Headline', 'Publisher')."""
    head, sep, tail = title.rpartition(" - ")
    if sep and head.strip() and tail.strip():
        return head.strip(), tail.strip()
    return title.strip(), None


def fetch_source(ctx: Context) -> SourceResult:
    root = ET.fromstring(fetch(URL, client=ctx.client))
    signals: list[Signal] = []
    for item in root.iter("item"):
        raw = (item.findtext("title") or "").strip()
        if not raw:
            continue
        label, publisher = split_publisher(raw)
        source_el = item.find("source")
        if source_el is not None and (source_el.text or "").strip():
            publisher = source_el.text.strip()
        signals.append(Signal(
            source="google_news", label=label, rank=len(signals) + 1, magnitude=None,
            magnitude_unit="rank", url=(item.findtext("link") or "").strip() or None,
            meta={"publisher": publisher, "pub_date": (item.findtext("pubDate") or "").strip() or None},
        ))
        if len(signals) >= TOP_N:
            break
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="google_news", name="Google News — top stories (RSS, US edition)",
    url="https://news.google.com/rss",
    licence="Google News terms; headlines, publishers and links only",
    fetch=fetch_source,
)
