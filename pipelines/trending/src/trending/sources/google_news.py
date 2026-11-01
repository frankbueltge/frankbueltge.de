"""Google News — the top stories of ten English-language editions (RSS).

Until 2026-11-02 this source read the American edition alone, which made news about three per
cent of the ledger. A matter could be quiet here only because no American front page carried it.
Ten editions now, from North America, Europe, Oceania, South and South-East Asia and three parts
of Africa. English on purpose: the house's one count matches English terms, so an edition in
another language would swell the denominator and match nothing. The Arab world has no English
edition of its own (AE, SA and LB fall back to the American one), which the method sheet names.
A story two editions carry counts once, under the first."""
from __future__ import annotations

import time
import xml.etree.ElementTree as ET

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

EDITIONS = ("US", "GB", "AU", "IN", "PK", "PH", "NG", "KE", "ET", "ZA")
TOP_N = 20
THROTTLE_S = 0.25


def edition_url(geo: str) -> str:
    return f"https://news.google.com/rss?hl=en-{geo}&gl={geo}&ceid={geo}:en"


def split_publisher(title: str) -> tuple[str, str | None]:
    """'Headline - Publisher' → ('Headline', 'Publisher')."""
    head, sep, tail = title.rpartition(" - ")
    if sep and head.strip() and tail.strip():
        return head.strip(), tail.strip()
    return title.strip(), None


def fetch_source(ctx: Context) -> SourceResult:
    signals: list[Signal] = []
    notes: list[str] = []
    seen: set[str] = set()
    for geo in EDITIONS:
        try:
            root = ET.fromstring(fetch(edition_url(geo), client=ctx.client))
        except SourceUnavailable as exc:
            notes.append(f"{geo}: {exc}"[:120])
            continue
        except ET.ParseError:
            notes.append(f"{geo}: XML parse error")
            continue
        rank = 0
        for item in root.iter("item"):
            raw = (item.findtext("title") or "").strip()
            if not raw:
                continue
            rank += 1
            label, publisher = split_publisher(raw)
            source_el = item.find("source")
            if source_el is not None and (source_el.text or "").strip():
                publisher = source_el.text.strip()
            if label.casefold() not in seen:
                seen.add(label.casefold())
                signals.append(Signal(
                    source="google_news", label=label, rank=rank, magnitude=None,
                    magnitude_unit="rank", url=(item.findtext("link") or "").strip() or None,
                    geo=geo,
                    meta={"publisher": publisher, "geo": geo,
                          "pub_date": (item.findtext("pubDate") or "").strip() or None},
                ))
            if rank >= TOP_N:
                break
        time.sleep(THROTTLE_S)
    return SourceResult(signals, as_of=ctx.today.isoformat(), notes=notes)


SPEC = SourceSpec(
    id="google_news", name="Google News — top stories (RSS, ten English-language editions)",
    url="https://news.google.com/rss",
    licence="Google News terms; headlines, publishers and links only",
    fetch=fetch_source,
)
