"""Apple Music — the most-played songs of three storefronts, from Apple's Marketing Tools RSS.

Added 2026-11-14: what people are listening to, which no other source in the ledger reads.
Three storefronts (US, GB, DE), the same feed family as `appstore`; the feed gives a rank and
nothing countable. One storefront failing is a note. The list runs storefront by storefront
within a rank, so its first lines are three countries."""
from __future__ import annotations

import time

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec, interleave

STOREFRONTS = (("us", "US"), ("gb", "GB"), ("de", "DE"))
URL = "https://rss.marketingtools.apple.com/api/v2/{store}/music/most-played/25/songs.json"
THROTTLE_S = 0.5
TOP_N = 15  # per storefront


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
        for row in data.get("feed", {}).get("results", []):
            name = " ".join((row.get("name") or "").split())
            if not name:
                continue
            rank += 1
            by = " ".join((row.get("artistName") or "").split())
            # The maker is part of the label: a title alone ("Golden", "The Daily") is a common
            # word, and the crossing must not mistake a common word for an agreement.
            label = f"{name} — {by}" if by and by.casefold() != name.casefold() else name
            signals.append(Signal(
                source="apple_music", label=label, rank=rank, magnitude=None, magnitude_unit="rank",
                url=(row.get("url") or "").strip() or None, geo=geo,
                meta={"title": name, "by": by or None, "store": store},
            ))
            if rank >= TOP_N:
                break
        time.sleep(THROTTLE_S)
    if not signals and notes:
        raise SourceUnavailable("; ".join(notes)[:200])
    return SourceResult(interleave(signals), as_of=ctx.today.isoformat(), notes=notes)


SPEC = SourceSpec(
    id="apple_music", name="Apple Music — most-played songs, US, GB and DE (Apple Marketing Tools RSS)",
    url="https://rss.marketingtools.apple.com/",
    licence="Apple terms; names, ranks and links only",
    fetch=fetch_source, optional=True,
)
