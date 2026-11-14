"""Lemmy — the links the threadiverse upvoted most in the last day, as lemmy.world federates them.

Added 2026-11-14. Lemmy is the federated link aggregator that grew when Reddit closed its
API: the same shape of public, on servers nobody owns. Two requests to the largest instance's
public API ("top of the day" over everything it federates, two pages of fifty); the number
kept is the post's own score.

LINK POSTS ONLY. Most of the top of a day there is image posts — the memes — whose titles
("Pop", "So far...") say nothing without the picture. A post is kept when it carries a link
that is not an image or a video; that is the half of the platform that says what it is
reading. Posts marked not safe for work are left out as well."""
from __future__ import annotations

import re

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://lemmy.world/api/v3/post/list?sort=TopDay&type_=All&limit=50&page={page}"
PAGES = (1, 2)
TOP_N = 20
_MEDIA_EXT = re.compile(r"\.(png|jpe?g|gif|webp|avif|mp4|webm|mov)(\?|$)", re.I)


def is_link_post(post: dict) -> bool:
    url = (post.get("url") or "").strip()
    if not url:
        return False
    kind = (post.get("url_content_type") or "").lower()
    if kind.startswith(("image/", "video/")):
        return False
    return not (_MEDIA_EXT.search(url) or "/pictrs/" in url)


def fetch_source(ctx: Context) -> SourceResult:
    signals: list[Signal] = []
    notes: list[str] = []
    seen: set[str] = set()
    for page in PAGES:
        try:
            data = fetch(URL.format(page=page), client=ctx.client, expect="json")
        except SourceUnavailable as exc:
            if page == PAGES[0]:
                raise
            notes.append(f"page {page}: {exc}"[:160])
            break
        for row in data.get("posts") or []:
            post = row.get("post") or {}
            name = " ".join((post.get("name") or "").split())
            link = (post.get("url") or "").strip()
            if (not name or post.get("nsfw") or (row.get("community") or {}).get("nsfw")
                    or not is_link_post(post) or link in seen):
                continue
            seen.add(link)  # one article is often posted to several communities; the first counts
            score = (row.get("counts") or {}).get("score")
            signals.append(Signal(
                source="lemmy", label=name, rank=len(signals) + 1,
                magnitude=score if isinstance(score, int) else None, magnitude_unit="points",
                url=(post.get("ap_id") or "").strip() or None,
                meta={"community": ((row.get("community") or {}).get("name") or "").strip() or None,
                      "comments": (row.get("counts") or {}).get("comments"), "link": link},
            ))
            if len(signals) >= TOP_N:
                break
        if len(signals) >= TOP_N:
            break
    return SourceResult(signals, as_of=ctx.today.isoformat(), notes=notes)


SPEC = SourceSpec(
    id="lemmy", name="Lemmy — top link posts of the day (lemmy.world public API)",
    url="https://lemmy.world/", licence="Lemmy instance terms; titles, links and scores only",
    fetch=fetch_source, optional=True,
)
