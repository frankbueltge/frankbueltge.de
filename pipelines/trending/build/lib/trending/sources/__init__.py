"""The twenty sources, in the order the ledger lists them (the order is part of the record).

The first eight are the day's broad publics — search, encyclopaedia, social, news, code.
The twelve that follow widen the reading into the places where a term surfaces before it
reaches a headline: model hubs and package indexes, developer forums and preprints, app,
game, coin and prediction-market charts. Every one of them is keyless and reports only
titles, links and its own counts."""
from __future__ import annotations

from trending.sources import (appstore, arxiv, bluesky, coingecko, devto, github, google_news,
                              google_trends, hackernews, huggingface, lobsters, mastodon,
                              polymarket, producthunt, pypi, reddit, stackoverflow, steam,
                              techmeme, wikipedia)
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
    huggingface.SPEC,
    lobsters.SPEC,
    devto.SPEC,
    stackoverflow.SPEC,
    pypi.SPEC,
    producthunt.SPEC,
    techmeme.SPEC,
    arxiv.SPEC,
    appstore.SPEC,
    steam.SPEC,
    coingecko.SPEC,
    polymarket.SPEC,
)

__all__ = ["SOURCES", "Context", "SourceResult", "SourceSpec"]
