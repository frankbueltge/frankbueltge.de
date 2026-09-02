"""The eight sources, in the order the ledger lists them (the order is part of the record)."""
from __future__ import annotations

from trending.sources import (bluesky, github, google_news, google_trends, hackernews, mastodon,
                              reddit, wikipedia)
from trending.sources.base import Context, SourceResult, SourceSpec

SOURCES: tuple[SourceSpec, ...] = (
    google_trends.SPEC,
    wikipedia.SPEC,
    hackernews.SPEC,
    bluesky.SPEC,
    mastodon.SPEC,
    google_news.SPEC,
    reddit.SPEC,
    github.SPEC,
)

__all__ = ["SOURCES", "Context", "SourceResult", "SourceSpec"]
