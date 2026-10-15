"""Polymarket — the open markets with the most money moved in the last 24 hours.

What a prediction market ranks is attention with a price attached: the question people are
willing to bet on today. The number kept is the market's own 24-hour volume in US dollars,
rounded to whole dollars — not a probability, and nothing is derived from it here.

Optional: the Gamma API is public but unversioned in its ordering parameters."""
from __future__ import annotations

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = ("https://gamma-api.polymarket.com/markets"
       "?closed=false&order=volume24hr&ascending=false&limit=20")


def _volume(raw) -> int | None:
    try:
        return round(float(raw))
    except (TypeError, ValueError):
        return None


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    signals: list[Signal] = []
    for market in data:
        question = (market.get("question") or "").strip()
        slug = (market.get("slug") or "").strip()
        if not question or not slug:
            continue
        signals.append(Signal(
            source="polymarket", label=question, rank=len(signals) + 1,
            magnitude=_volume(market.get("volume24hr")), magnitude_unit="usd_24h",
            url=f"https://polymarket.com/market/{slug}",
            meta={"slug": slug, "end_date": (market.get("endDate") or "").strip() or None},
        ))
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="polymarket", name="Polymarket — markets by 24-hour volume (Gamma API)",
    url="https://docs.polymarket.com/",
    licence="Polymarket Gamma API; market questions, links and volumes only",
    fetch=fetch_source, optional=True,
)
