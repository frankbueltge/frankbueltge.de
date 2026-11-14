"""Baidu — the real-time hot-search board of China's largest search engine.

Added 2026-11-14: until then the ledger read no public behind the Chinese internet at all.
What Google Trends is for ten countries, this board is for one very large one. One request to the board's own JSON; the entry Baidu pins to the top
(`isTop`, an editorial placement, not a search trend) is left out. Terms stay in Chinese, as
the source prints them — the ledger translates nothing, so these rows will rarely cross with the
English-language sources and are read mostly on their own. (Bilibili's popular list was built
the same day and not taken: its API host's robots.txt closes every path. Weibo refuses.)"""
from __future__ import annotations

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://top.baidu.com/api/board?platform=wise&tab=realtime"
TOP_N = 30


def _entries(node) -> list[dict]:
    """The board nests its list one or two levels deep depending on the edition served."""
    if isinstance(node, list):
        if node and all(isinstance(x, dict) and "word" in x for x in node):
            return node
        for child in node:
            found = _entries(child)
            if found:
                return found
    elif isinstance(node, dict):
        return _entries(node.get("content"))
    return []


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    signals: list[Signal] = []
    for entry in _entries((data.get("data") or {}).get("cards")):
        word = " ".join((entry.get("word") or "").split())
        if not word or entry.get("isTop"):
            continue
        signals.append(Signal(
            source="baidu", label=word, rank=len(signals) + 1, magnitude=None,
            magnitude_unit="rank", url=(entry.get("url") or "").strip() or None, geo="CN",
        ))
        if len(signals) >= TOP_N:
            break
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="baidu", name="Baidu — real-time hot searches (board API)",
    url="https://top.baidu.com/board?tab=realtime",
    licence="Baidu terms; search terms, ranks and links only",
    fetch=fetch_source, optional=True,
)
