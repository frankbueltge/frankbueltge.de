"""Stocktwits — the tickers retail investors are talking about right now.

Added 2026-11-14. CoinGecko says which coins are searched; this is the same question for
listed companies, from the largest investor chat. The label is the company's name as
Stocktwits prints it, the ticker travels in `meta`, and the number kept is how many accounts
watch the symbol. Nothing here is a price or advice."""
from __future__ import annotations

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://api.stocktwits.com/api/2/trending/symbols.json"
TOP_N = 25


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    signals: list[Signal] = []
    for row in data.get("symbols") or []:
        symbol = (row.get("symbol") or "").strip()
        title = " ".join((row.get("title") or "").split()) or symbol
        if not symbol:
            continue
        watchers = row.get("watchlist_count")
        signals.append(Signal(
            source="stocktwits", label=title, rank=len(signals) + 1,
            magnitude=watchers if isinstance(watchers, int) else None, magnitude_unit="watchers",
            url=f"https://stocktwits.com/symbol/{symbol}", meta={"symbol": symbol},
        ))
        if len(signals) >= TOP_N:
            break
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="stocktwits", name="Stocktwits — trending symbols (public API)",
    url="https://stocktwits.com/", licence="Stocktwits terms; names, symbols and counts only",
    fetch=fetch_source, optional=True,
)
