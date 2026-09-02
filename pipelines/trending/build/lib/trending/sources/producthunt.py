"""Product Hunt — the newest products, from the public Atom feed.

The feed carries no vote count, so the only number here is the feed's own order. Optional:
the feed is rate-limited and occasionally answers with a challenge page."""
from __future__ import annotations

import xml.etree.ElementTree as ET

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://www.producthunt.com/feed"
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
        author = (entry.findtext("a:author/a:name", namespaces=NS) or "").strip()
        signals.append(Signal(
            source="producthunt", label=title, rank=len(signals) + 1, magnitude=None,
            magnitude_unit="rank",
            url=(link_el.get("href") if link_el is not None else None),
            meta={"author": author or None},
        ))
        if len(signals) >= TOP_N:
            break
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="producthunt", name="Product Hunt — newest products (Atom feed)",
    url="https://www.producthunt.com/feed",
    licence="Product Hunt terms; product names, links and submitter names only",
    fetch=fetch_source, optional=True,
)
