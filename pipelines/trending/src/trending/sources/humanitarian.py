"""Humanitarian desk — what the aid world is reporting, from four editorial feeds.

Added 2026-11-08. The ecology's map reads thirteen fields of the world's state, among them war,
hunger, health and displacement, and counts each field's attention in this ledger. Until then
the ledger read those fields only through general headlines and an encyclopaedia, so a famine
could stand "absent" while the aid world wrote about it every day. Four feeds read that desk:

  · OCHA — the United Nations' humanitarian coordination office, whose news section opens
    most days with its own "Today's top news" across the crises it is working in (the feed
    is the whole site's; only items of the news section are kept);
  · The New Humanitarian, MSF and the ICRC — added on 2026-11-09.

Until 2026-11-13 the list began with ReliefWeb's headlines feed and the UN News feed. Neither
ever answered a nightly run (an empty body and a 404, from the first run on), and on 2026-11-14
their robots.txt files were read: both disallow these feed paths to automated agents, so the
refusal is a rule and not a fault. They were taken out and OCHA, which runs ReliefWeb, was put
in. ReliefWeb's own door for machines is its API, which wants a registered application name.

One platform, four feeds (see science_press.py for why). Headlines and links only; a feed that
fails is a note, the others still count. The list runs feed by feed within a rank."""
from __future__ import annotations

import xml.etree.ElementTree as ET

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec, interleave

FEEDS: tuple[tuple[str, str], ...] = (
    ("ocha", "https://www.unocha.org/rss.xml"),
    ("thenewhumanitarian", "https://www.thenewhumanitarian.org/rss/all.xml"),
    ("msf", "https://www.msf.org/rss/all"),
    ("icrc", "https://www.icrc.org/en/rss/news"),
)
TOP_N = 15  # per feed
# OCHA's feed is the whole site's: staff pages and media advisories beside the news. Only its
# news section is the desk (the same kind of cut as Nature's journalism prefix).
OCHA_NEWS = "/news/"


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
            link = (item.findtext("link") or "").strip()
            if not title:
                continue
            if feed == "ocha" and OCHA_NEWS not in link:
                continue
            rank += 1
            signals.append(Signal(
                source="humanitarian", label=title, rank=rank, magnitude=None,
                magnitude_unit="rank", url=link or None, meta={"feed": feed},
            ))
            if rank >= TOP_N:
                break
    if not signals and notes:
        raise SourceUnavailable("; ".join(notes)[:200])
    return SourceResult(interleave(signals), as_of=ctx.today.isoformat(), notes=notes)


SPEC = SourceSpec(
    id="humanitarian", name="Humanitarian desk — OCHA, The New Humanitarian, MSF, ICRC (feeds)",
    url="https://www.unocha.org/rss.xml",
    licence="UN and publishers' terms; headlines and links only",
    fetch=fetch_source, optional=True,
)
