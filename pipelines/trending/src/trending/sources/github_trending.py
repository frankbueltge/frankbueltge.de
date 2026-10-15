"""GitHub — the trending page, daily window, all languages (HTML; no API exists for it).

`github` reads the most-starred repositories CREATED in the last seven days through the search
API; this source reads what GitHub itself puts on https://github.com/trending this morning —
a ranking the platform computes by an undisclosed rule out of stars, forks, views and commits,
weighted by recency, and recomputes several times a day. The two lists overlap and differ, and
both are the platform's own statement, which is why both are kept. They are ONE platform for the
convergence rule (`platform="github"` below): a repository on both lists is one public looking
at it, not two.

The page is read once, with the pipeline's own user agent; GitHub's robots.txt allows
`/trending` for every agent. The per-repository `/stargazers` and `/forks` pages it disallows
are never fetched — the totals are read from the trending page, where GitHub prints them
beside every row. Repository names, descriptions, languages and the page's own counts only.
No API exists for this page, so the parser is anchored on the page's own attributes
(`itemprop="programmingLanguage"`, the `/stargazers` link, the words "stars today") and the
source is optional: a changed page shape becomes an `unavailable` line in the ledger, never a
guessed list."""
from __future__ import annotations

import html
import re

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://github.com/trending"
TOP_N = 25  # the page lists at most twenty-five

_ARTICLE = re.compile(r'<article[^>]*class="[^"]*\bBox-row\b[^"]*"[^>]*>(.*?)</article>', re.S)
_REPO = re.compile(r'<h2[^>]*>\s*<a[^>]*href="/([^/"\s]+/[^/"\s]+)"', re.S)
_DESC = re.compile(r'<p[^>]*class="[^"]*\bcol-9\b[^"]*"[^>]*>(.*?)</p>', re.S)
_LANG = re.compile(r'itemprop="programmingLanguage"[^>]*>(.*?)<', re.S)
_STARS = re.compile(r'href="/[^"]+/stargazers"[^>]*>(.*?)</a>', re.S)
_FORKS = re.compile(r'href="/[^"]+/forks"[^>]*>(.*?)</a>', re.S)
_TODAY = re.compile(r'([\d][\d,.   ]*)\s*stars?\s+today', re.S)
_TAG = re.compile(r"<[^>]+>", re.S)


def _text(fragment: str | None) -> str | None:
    if fragment is None:
        return None
    out = " ".join(html.unescape(_TAG.sub(" ", fragment)).split())
    return out or None


def _count(fragment: str | None) -> int | None:
    digits = re.sub(r"\D", "", fragment or "")
    return int(digits) if digits else None


def _first(pattern: re.Pattern[str], block: str) -> str | None:
    m = pattern.search(block)
    return m.group(1) if m else None


def parse(page: str) -> list[dict]:
    """Rows of the trending page, top first: full_name, description, language, stars,
    forks, stars_today. Exposed for the tests; `fetch_source` turns the rows into signals."""
    rows: list[dict] = []
    for block in _ARTICLE.findall(page):
        full_name = _first(_REPO, block)
        if not full_name:
            continue
        rows.append({
            "full_name": full_name,
            "description": _text(_first(_DESC, block)),
            "language": _text(_first(_LANG, block)),
            "stars": _count(_text(_first(_STARS, block))),
            "forks": _count(_text(_first(_FORKS, block))),
            "stars_today": _count(_first(_TODAY, block)),
        })
        if len(rows) >= TOP_N:
            break
    return rows


def fetch_source(ctx: Context) -> SourceResult:
    page = fetch(URL, client=ctx.client)
    rows = parse(page)
    if not rows:
        # Anchored on the page's own markup; an empty parse of a 200 page means the shape
        # moved, and the record must say so rather than carry an empty "ok".
        raise SourceUnavailable("github.com/trending: no repository rows found — page shape changed?")
    signals: list[Signal] = []
    for rank, row in enumerate(rows, 1):
        signals.append(Signal(
            source="github_trending", label=row["full_name"], rank=rank,
            magnitude=row["stars_today"], magnitude_unit="stars_today",
            url=f"https://github.com/{row['full_name']}",
            meta={"language": row["language"],
                  "description": (row["description"] or "")[:200] or None,
                  "stars": row["stars"], "forks": row["forks"]},
        ))
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="github_trending", name="GitHub — trending repositories today (the trending page)",
    url="https://github.com/trending",
    licence=("GitHub terms; repository names, descriptions, languages, links and the page's own "
             "counts only — robots.txt allows /trending, the per-repository pages it disallows "
             "are never read"),
    fetch=fetch_source, optional=True, platform="github",
)
