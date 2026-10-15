"""The twenty-one sources, in the order the ledger lists them (the order is part of the record).

The first nine are the day's broad publics — search, encyclopaedia, social, news, code (GitHub
twice: its most-starred new repositories and its trending page, one platform for the crossing).
The twelve that follow widen the reading into the places where a term surfaces before it
reaches a headline: model hubs and package indexes, developer forums and preprints, app,
game, coin and prediction-market charts. Every one of them is keyless and reports only
titles, links and its own counts."""
from __future__ import annotations

from trending.sources import (appstore, arxiv, bluesky, coingecko, devto, github, github_trending,
                              google_news, google_trends, hackernews, huggingface, lobsters,
                              mastodon, polymarket, producthunt, pypi, reddit, stackoverflow,
                              steam, techmeme, wikipedia)
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
    github_trending.SPEC,
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

# Source id → platform. Two lists of one platform are one platform: a repository on GitHub's
# new-repositories list AND its trending page is one public looking at it, not two, so the
# convergence rule and the discovery corpus count by this and never by the source id.
PLATFORM_OF: dict[str, str] = {spec.id: spec.platform or spec.id for spec in SOURCES}


def platform_of(source: str) -> str:
    return PLATFORM_OF.get(source, source)


__all__ = ["PLATFORM_OF", "SOURCES", "Context", "SourceResult", "SourceSpec", "platform_of"]
