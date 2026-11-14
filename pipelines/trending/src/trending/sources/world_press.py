"""World press — the front pages of seven newsrooms, read from their own feeds.

Added 2026-11-14. Until then the day's headlines reached the ledger through one aggregator,
Google News, in ten English-language editions. These are the newsrooms themselves, chosen to
sit on different continents: BBC (London), The Guardian (London), Al Jazeera (Doha), Deutsche
Welle (Bonn), NPR (Washington), France 24 (Paris) and ABC (Sydney), each in its English edition
and in the order its own editors give.

The press is ONE public for the crossing. A story on Google News and on the BBC is one press
carrying it, not two independent platforms agreeing, so this source shares the platform of
`google_news` (the way GitHub's two lists are one platform). Headlines and links only; a feed
that fails is a note, the others still count. The list runs newsroom by newsroom within a
rank (every first headline, then every second), so its first lines are seven front pages."""
from __future__ import annotations

import xml.etree.ElementTree as ET

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec, interleave
from trending.sources.science_press import _items

FEEDS: tuple[tuple[str, str], ...] = (
    ("bbc", "https://feeds.bbci.co.uk/news/world/rss.xml"),
    ("guardian", "https://www.theguardian.com/world/rss"),
    ("aljazeera", "https://www.aljazeera.com/xml/rss/all.xml"),
    ("dw", "https://rss.dw.com/rdf/rss-en-all"),
    ("npr", "https://feeds.npr.org/1001/rss.xml"),
    ("france24", "https://www.france24.com/en/rss"),
    ("abc_au", "https://www.abc.net.au/news/feed/51120/rss.xml"),
)
TOP_N = 10  # per feed


def fetch_source(ctx: Context) -> SourceResult:
    signals: list[Signal] = []
    notes: list[str] = []
    seen: set[str] = set()
    for feed, url in FEEDS:
        try:
            items = _items(fetch(url, client=ctx.client))
        except (SourceUnavailable, ET.ParseError) as exc:
            notes.append(f"{feed}: {exc}"[:160])
            continue
        rank = 0
        for title, link in items:
            if not title or title.casefold() in seen:
                continue
            seen.add(title.casefold())
            rank += 1
            signals.append(Signal(
                source="world_press", label=title, rank=rank, magnitude=None,
                magnitude_unit="rank", url=link or None, meta={"feed": feed},
            ))
            if rank >= TOP_N:
                break
    if not signals and notes:
        raise SourceUnavailable("; ".join(notes)[:200])
    return SourceResult(interleave(signals), as_of=ctx.today.isoformat(), notes=notes)


SPEC = SourceSpec(
    id="world_press",
    name="World press — BBC, The Guardian, Al Jazeera, DW, NPR, France 24, ABC (feeds)",
    url="https://feeds.bbci.co.uk/news/world/rss.xml",
    licence="Publishers' terms; headlines and links only",
    fetch=fetch_source, optional=True, platform="google_news",
)
