"""Humanitarian desk — what the aid world is reporting, from two editorial feeds.

Added 2026-11-08. The ecology's map reads thirteen fields of the world's state, among them war,
hunger, health and displacement, and counts each field's attention in this ledger. Until then
the ledger read those fields only through general headlines and an encyclopaedia, so a famine
could stand "absent" while the aid world wrote about it every day. Two feeds read that desk:

  · ReliefWeb headlines — the UN OCHA service's editorial selection from agencies and NGOs;
  · UN News — the United Nations' own newsroom.

One platform, two feeds (see science_press.py for why). Headlines and links only; a feed that
fails is a note, the other still counts."""
from __future__ import annotations

import xml.etree.ElementTree as ET

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

FEEDS: tuple[tuple[str, str], ...] = (
    ("reliefweb", "https://reliefweb.int/updates/rss.xml?view=headlines"),
    ("un_news", "https://news.un.org/feed/subscribe/en/news/all/rss.xml"),
)
TOP_N = 20  # per feed


def fetch_source(ctx: Context) -> SourceResult:
    signals: list[Signal] = []
    notes: list[str] = []
    for feed, url in FEEDS:
        try:
            root = ET.fromstring(fetch(url, client=ctx.client))
        except (SourceUnavailable, ET.ParseError) as exc:
            notes.append(f"{feed}: {exc}"[:160])
            continue
        rank = 0
        for item in root.iter("item"):
            title = " ".join((item.findtext("title") or "").split())
            if not title:
                continue
            rank += 1
            signals.append(Signal(
                source="humanitarian", label=title, rank=rank, magnitude=None,
                magnitude_unit="rank", url=(item.findtext("link") or "").strip() or None,
                meta={"feed": feed},
            ))
            if rank >= TOP_N:
                break
    if not signals and notes:
        raise SourceUnavailable("; ".join(notes)[:200])
    return SourceResult(signals, as_of=ctx.today.isoformat(), notes=notes)


SPEC = SourceSpec(
    id="humanitarian", name="Humanitarian desk — ReliefWeb headlines, UN News (feeds)",
    url="https://reliefweb.int/updates/rss.xml?view=headlines",
    licence="ReliefWeb and UN terms; headlines and links only",
    fetch=fetch_source, optional=True,
)
