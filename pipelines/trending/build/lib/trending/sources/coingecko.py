"""CoinGecko — the coins its own visitors searched for most in the last day.

A search ranking, not a price ranking: the list says what people looked up, and the number
recorded beside each coin is its market-capitalisation rank, which the API supplies and
which is a rank, not a price. Optional: the keyless tier is rate-limited per minute."""
from __future__ import annotations

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://api.coingecko.com/api/v3/search/trending"


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    signals: list[Signal] = []
    for coin in data.get("coins", []):
        item = coin.get("item") or {}
        name = (item.get("name") or "").strip()
        coin_id = (item.get("id") or "").strip()
        if not name or not coin_id:
            continue
        cap_rank = item.get("market_cap_rank")
        signals.append(Signal(
            source="coingecko", label=name, rank=len(signals) + 1,
            magnitude=(int(cap_rank) if cap_rank is not None else None),
            magnitude_unit="rank",
            url=f"https://www.coingecko.com/en/coins/{coin_id}",
            meta={"symbol": (item.get("symbol") or "").strip() or None, "coin_id": coin_id},
        ))
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="coingecko", name="CoinGecko — trending searches (public API)",
    url="https://docs.coingecko.com/reference/trending-search",
    licence="CoinGecko public API terms; coin names, links and ranks only",
    fetch=fetch_source, optional=True,
)
