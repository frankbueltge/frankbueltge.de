"""The thirty-four sources, in the order the ledger lists them (the order is part of the record).

The first nine are the day's broad publics — search, encyclopaedia, social, news, code (GitHub
twice: its most-starred new repositories and its trending page, one platform for the crossing).
The twelve that follow widen the reading into the places where a term surfaces before it
reaches a headline: model hubs and package indexes, developer forums and preprints, app,
game, coin and prediction-market charts. The last two (2026-11-08) read the research press and
the humanitarian desk, so that the fields of the world's state the ecology's map counts here are
read where they are reported, not only when a general headline carries them. The eleven after
those (2026-11-14) open the ledger to publics it had not read at all: the newsrooms themselves
beside the aggregator, Wikipedia's editors, the threadiverse, the papers practitioners upvote, a
second prediction market, investors, listeners, readers, the official warning systems and the
largest search engine of the Chinese internet. Every one of them is keyless, reports only
titles, links and its own counts, and reads a path its host's robots.txt does not close."""
from __future__ import annotations

from trending.sources import (alerts, apple_music, apple_podcasts, appstore, arxiv, baidu, bluesky,
                              coingecko, devto, github, github_trending, google_news,
                              google_trends, hackernews, hf_papers, huggingface, humanitarian,
                              lemmy, lobsters, manifold, mastodon, openlibrary, polymarket,
                              producthunt, pypi, reddit, science_press, stackoverflow, steam,
                              stocktwits, techmeme, wikipedia, wikipedia_news, world_press)
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
    science_press.SPEC,
    humanitarian.SPEC,
    world_press.SPEC,
    wikipedia_news.SPEC,
    lemmy.SPEC,
    hf_papers.SPEC,
    manifold.SPEC,
    stocktwits.SPEC,
    apple_music.SPEC,
    apple_podcasts.SPEC,
    openlibrary.SPEC,
    alerts.SPEC,
    baidu.SPEC,
)

# Source id → platform. Two lists of one platform are one platform: a repository on GitHub's
# new-repositories list AND its trending page is one public looking at it, not two, so the
# convergence rule and the discovery corpus count by this and never by the source id.
PLATFORM_OF: dict[str, str] = {spec.id: spec.platform or spec.id for spec in SOURCES}


def platform_of(source: str) -> str:
    return PLATFORM_OF.get(source, source)


__all__ = ["PLATFORM_OF", "SOURCES", "Context", "SourceResult", "SourceSpec", "platform_of"]
