"""Manifold — the open prediction markets with the most trading in the last 24 hours.

Added 2026-11-14, beside Polymarket. Manifold trades in play money ("mana"), so what it ranks
is what forecasters argue about when no cash is at stake: more science, technology and
politics-in-detail than a money market carries. The number kept is the market's own 24-hour
volume in mana, rounded; it is not a probability and not comparable to dollars."""
from __future__ import annotations

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://api.manifold.markets/v0/search-markets?sort=24-hour-vol&filter=open&limit=25"


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    signals: list[Signal] = []
    for market in data if isinstance(data, list) else []:
        question = " ".join((market.get("question") or "").split())
        url = (market.get("url") or "").strip()
        if not question or not url:
            continue
        try:
            volume = round(float(market.get("volume24Hours")))
        except (TypeError, ValueError):
            volume = None
        signals.append(Signal(
            source="manifold", label=question, rank=len(signals) + 1, magnitude=volume,
            magnitude_unit="mana_24h", url=url,
            meta={"bettors": market.get("uniqueBettorCount")},
        ))
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="manifold", name="Manifold — markets by 24-hour volume (public API)",
    url="https://docs.manifold.markets/api",
    licence="Manifold API terms; market questions, links and volumes only",
    fetch=fetch_source, optional=True,
)
