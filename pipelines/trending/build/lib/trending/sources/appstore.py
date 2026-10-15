"""App Store — the top free apps of two storefronts, from Apple's Marketing Tools RSS.

Two storefronts, US and DE, so the chart can be read against the German one instead of
standing in for the world. The feed publishes a rank and nothing countable, so `rank` is
the magnitude unit and `magnitude` stays empty. One storefront failing is a note, not a
crash, and the storefront code travels in `geo`."""
from __future__ import annotations

import time

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

STOREFRONTS = (("us", "US"), ("de", "DE"))
URL = "https://rss.marketingtools.apple.com/api/v2/{store}/apps/top-free/25/apps.json"
THROTTLE_S = 0.5


def _genre(app: dict) -> str | None:
    genres = app.get("genres") or []
    if not genres:
        return None
    first = genres[0]
    if isinstance(first, dict):
        return (first.get("name") or "").strip() or None
    return str(first).strip() or None


def fetch_source(ctx: Context) -> SourceResult:
    signals: list[Signal] = []
    notes: list[str] = []
    for store, geo in STOREFRONTS:
        try:
            data = fetch(URL.format(store=store), client=ctx.client, expect="json")
        except SourceUnavailable as exc:
            notes.append(f"{geo}: {exc}"[:120])
            continue
        rank = 0
        for app in data.get("feed", {}).get("results", []):
            name = (app.get("name") or "").strip()
            if not name:
                continue
            rank += 1
            signals.append(Signal(
                source="appstore", label=name, rank=rank, magnitude=None,
                magnitude_unit="rank", url=(app.get("url") or "").strip() or None, geo=geo,
                meta={"artist_name": (app.get("artistName") or "").strip() or None,
                      "genre": _genre(app), "store": store},
            ))
        time.sleep(THROTTLE_S)
    return SourceResult(signals, as_of=ctx.today.isoformat(), notes=notes)


SPEC = SourceSpec(
    id="appstore", name="App Store — top free apps, US and DE (Apple Marketing Tools RSS)",
    url="https://rss.marketingtools.apple.com/",
    licence="Apple terms; names, ranks and links only",
    fetch=fetch_source,
)
