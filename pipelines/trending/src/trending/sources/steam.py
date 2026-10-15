"""Steam — the store's own top sellers, from the featured-categories endpoint.

The store publishes the ranking but no sales figure, so `rank` is the unit; the price is
kept in the store's own integer cents beside the discount flag. Optional: the endpoint is
undocumented, region-dependent and changes shape without notice."""
from __future__ import annotations

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://store.steampowered.com/api/featuredcategories?cc=us&l=en"
TOP_N = 20


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    items = (data.get("top_sellers") or {}).get("items") or []
    signals: list[Signal] = []
    for item in items:
        name = (item.get("name") or "").strip()
        app_id = item.get("id")
        if not name or app_id is None:
            continue
        signals.append(Signal(
            source="steam", label=name, rank=len(signals) + 1, magnitude=None,
            magnitude_unit="rank",
            url=f"https://store.steampowered.com/app/{app_id}/",
            meta={"discounted": bool(item.get("discounted")),
                  "final_price": item.get("final_price")},
        ))
        if len(signals) >= TOP_N:
            break
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="steam", name="Steam — top sellers (store featured-categories API)",
    url="https://store.steampowered.com/api/featuredcategories",
    licence="Valve store API; game names, links and list prices only",
    fetch=fetch_source, optional=True,
)
