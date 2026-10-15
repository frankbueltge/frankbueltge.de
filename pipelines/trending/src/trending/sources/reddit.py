"""Reddit — r/popular as an Atom feed. Optional: Reddit blocks freely, and a missing day
must never block the ledger."""
from __future__ import annotations

import xml.etree.ElementTree as ET

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

# r/popular is localised by the caller's IP; the global filter makes the feed the same from
# a laptop in Lisbon and from a runner in Iowa, which is what a committed archive needs.
URL = "https://www.reddit.com/r/popular/.rss?geo_filter=GLOBAL"
NS = {"a": "http://www.w3.org/2005/Atom"}
TOP_N = 25


def fetch_source(ctx: Context) -> SourceResult:
    root = ET.fromstring(fetch(URL, client=ctx.client))
    signals: list[Signal] = []
    for entry in root.findall("a:entry", NS):
        title = (entry.findtext("a:title", namespaces=NS) or "").strip()
        if not title:
            continue
        link_el = entry.find("a:link", NS)
        cat_el = entry.find("a:category", NS)
        signals.append(Signal(
            source="reddit", label=title, rank=len(signals) + 1, magnitude=None,
            magnitude_unit="rank",
            url=(link_el.get("href") if link_el is not None else None),
            meta={"subreddit": (cat_el.get("term") if cat_el is not None else None)},
        ))
        if len(signals) >= TOP_N:
            break
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="reddit", name="Reddit — r/popular (Atom feed)",
    url="https://www.reddit.com/r/popular/",
    licence="Reddit terms; titles and links only",
    fetch=fetch_source, optional=True,
)
