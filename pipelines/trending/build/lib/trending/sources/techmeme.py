"""Techmeme — the technology front page, from its RSS feed.

An editorially curated page: its order is a human ranking, which is exactly why it is worth
reading beside the algorithmic ones. Fifteen items, headlines and permalinks only."""
from __future__ import annotations

import xml.etree.ElementTree as ET

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://www.techmeme.com/feed.xml"
TOP_N = 20


def fetch_source(ctx: Context) -> SourceResult:
    root = ET.fromstring(fetch(URL, client=ctx.client))
    signals: list[Signal] = []
    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        if not title:
            continue
        signals.append(Signal(
            source="techmeme", label=title, rank=len(signals) + 1, magnitude=None,
            magnitude_unit="rank", url=(item.findtext("link") or "").strip() or None,
            meta={},
        ))
        if len(signals) >= TOP_N:
            break
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="techmeme", name="Techmeme — front page (RSS)",
    url="https://www.techmeme.com/feed.xml",
    licence="Techmeme terms; headlines and links only",
    fetch=fetch_source, optional=True,
)
