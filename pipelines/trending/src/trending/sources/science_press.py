"""Science press — what the research press is reporting, from three editorial feeds.

Added 2026-11-08. Until then every scholarly signal in the ledger came from arXiv, which is
mostly computer science and physics; hunger, health, climate and nature reached the day only
when a general headline carried them. Three feeds widen that, each read as a ranking by its
own editors (newest first, the order the feed gives):

  · Nature — news and comment only: the journal's feed also lists research papers, and a
    paper's title is not the press reporting on it. Nature's journalism carries the
    `d41586-` article prefix, papers do not, and only that prefix is kept;
  · Science — the magazine's news section;
  · The Conversation (global edition) — researchers writing for a general public.

One platform, three feeds, the way Wikipedia is one platform in six languages: the crossing
counts platforms, and three outlets of the research press are one public, not three.
Headlines and links only; a feed that fails is a note, the others still count."""
from __future__ import annotations

import xml.etree.ElementTree as ET

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

RSS1 = "{http://purl.org/rss/1.0/}"
ATOM = "{http://www.w3.org/2005/Atom}"

FEEDS: tuple[tuple[str, str], ...] = (
    ("nature", "https://www.nature.com/nature.rss"),
    ("science", "https://www.science.org/rss/news_current.xml"),
    ("theconversation", "https://theconversation.com/global/articles.atom"),
)
TOP_N = 20  # per feed
NATURE_JOURNALISM = "/d41586-"


def _items(text: str) -> list[tuple[str, str]]:
    """(title, link) in feed order from RSS 1.0, RSS 2.0 or Atom — the three feeds use all three."""
    root = ET.fromstring(text)
    out: list[tuple[str, str]] = []
    for item in root.iter(f"{RSS1}item"):
        out.append((item.findtext(f"{RSS1}title") or "", item.findtext(f"{RSS1}link") or ""))
    for item in root.iter("item"):
        out.append((item.findtext("title") or "", item.findtext("link") or ""))
    for entry in root.iter(f"{ATOM}entry"):
        link_el = entry.find(f"{ATOM}link[@rel='alternate']")
        if link_el is None:
            link_el = entry.find(f"{ATOM}link")
        out.append((entry.findtext(f"{ATOM}title") or "",
                    (link_el.get("href") if link_el is not None else "") or ""))
    return [(" ".join(t.split()), l.strip()) for t, l in out]


def fetch_source(ctx: Context) -> SourceResult:
    signals: list[Signal] = []
    notes: list[str] = []
    for feed, url in FEEDS:
        try:
            items = _items(fetch(url, client=ctx.client))
        except (SourceUnavailable, ET.ParseError) as exc:
            notes.append(f"{feed}: {exc}"[:160])
            continue
        rank = 0
        for title, link in items:
            if not title:
                continue
            if feed == "nature" and NATURE_JOURNALISM not in link:
                continue
            rank += 1
            signals.append(Signal(
                source="science_press", label=title, rank=rank, magnitude=None,
                magnitude_unit="rank", url=link or None, meta={"feed": feed},
            ))
            if rank >= TOP_N:
                break
    if not signals and notes:
        raise SourceUnavailable("; ".join(notes)[:200])
    return SourceResult(signals, as_of=ctx.today.isoformat(), notes=notes)


SPEC = SourceSpec(
    id="science_press", name="Science press — Nature news, Science news, The Conversation (feeds)",
    url="https://www.nature.com/nature.rss",
    licence="Publishers' terms; headlines and links only",
    fetch=fetch_source, optional=True,
)
