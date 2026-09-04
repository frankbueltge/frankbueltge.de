"""Discovery — what the machine noticed and nobody put on the watchlist.

A corpus of the last thirty days is read from four platforms that publish their own archive
(Hacker News front page, dev.to's top articles, arXiv's four computer-science categories,
GitHub's new repositories by stars): titles only, plus a repository's short description.
Every document becomes its set of bigrams and trigrams (`textstats`), and each phrase is
counted in documents for the recent fourteen days and the prior sixteen, normalised per day.

What survives is ranked by how many platforms carry it, then by the ratio, then by the
recent count — a phrase two platforms say is not the same finding as a phrase one platform
repeats. Candidates are a proposal, never a promotion: a term joins the watchlist only when a
human writes it into `watchlist.json`, with the date and the reason in the file.

Coverage is honest and uneven: arXiv publishes hundreds of papers a day, so even three pages
reach only the newest part of the window. A phrase seen there alone therefore shows a high
ratio, which is why the ranking puts the number of platforms first and the ratio second, and
why the run log prints the oldest day each platform actually delivered.
"""
from __future__ import annotations

import argparse
import sys
import time
import xml.etree.ElementTree as ET
from collections.abc import Callable, Sequence
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote

from trending.archive import load_days
from trending.data import load_json
from trending.fetch import SourceUnavailable, fetch
from trending.normalize import tokens
from trending.sources import SOURCES, platform_of
from trending.textstats import Document, tally
from trending import watchlist as wl
from trending.tracker import ATOM, TermContext, make_context, open_client, parse_when

DAY_SOURCE_IDS: tuple[str, ...] = tuple(spec.id for spec in SOURCES)

# The corpus order is the order the record lists platforms in: the day ledger's own sources
# first (that is where the breadth is), then the four live archives read for depth. Counted by
# platform, not by source id: the ledger reads GitHub twice (new repositories, trending page)
# and a phrase on both lists is still carried by one platform.
LIVE_PLATFORMS: tuple[str, ...] = ("hackernews", "devto", "arxiv", "github")
CORPUS_PLATFORMS: tuple[str, ...] = tuple(dict.fromkeys(
    (*(platform_of(s) for s in DAY_SOURCE_IDS), *LIVE_PLATFORMS)))
# A day file lists what each platform put at the top that morning, so one label repeated
# across ten mornings is ten sightings — which is precisely the arc being looked for.
ARCHIVE_EXTRA_KEYS = ("description", "subtitle")

ARXIV_CATEGORIES = ("cs.AI", "cs.CL", "cs.LG", "cs.SE")
# arXiv is read in date slices of equal length, each capped at the same number of papers:
# one newest-first query would cover only the last few days of a month (thousands of
# papers a week) and leave the prior window empty, which made every arXiv phrase look
# like an explosion. Equal caps per slice keep the recent and prior windows comparable.
ARXIV_SLICE_DAYS = 4
ARXIV_PAGE = 400
ARXIV_THROTTLE_S = 3.0
# Hacker News: Algolia's `front_page` tag marks only the stories on the front page right
# now, so a month's corpus is "stories that reached at least this many points" instead.
HN_MIN_POINTS = 50
HN_SLICE_DAYS = 10
HN_PAGE = 1000
HN_PAGES = 3
GITHUB_PAGES = 3
GITHUB_PER_PAGE = 100
DESCRIPTION_CAP = 200


@dataclass
class Discovery:
    candidates: list[dict[str, Any]] = field(default_factory=list)
    notes: dict[str, list[str]] = field(default_factory=dict)
    documents: int = 0
    coverage: dict[str, str] = field(default_factory=dict)  # platform → oldest day delivered


def _note(notes: dict[str, list[str]], platform: str, text: str) -> None:
    notes.setdefault(platform, []).append(text[:160])


# ------------------------------------------------------------------------ the four fetchers

def _archive_docs(repo_root: str | Path, today: date, days: int,
                  notes: dict[str, list[str]]) -> list[Document]:
    """The house's own committed day files as a corpus. Every signal a day file lists is one
    sighting of its label on that platform on that date; the key carries the date so ten
    mornings count ten times."""
    out: list[Document] = []
    try:
        records = load_days(repo_root, today + timedelta(days=1), days)
    except Exception as exc:  # noqa: BLE001 — a corpus source is a note, never a crash
        _note(notes, "archive", f"discovery: {type(exc).__name__}: {exc}")
        return out
    for rec in records:
        day = str(rec.get("date") or "")
        for source_id, signals in (rec.get("signals") or {}).items():
            for sig in signals or []:
                label = " ".join(str(sig.get("label") or "").split())
                if not label:
                    continue
                url = str(sig.get("url") or "") or f"ledger://{day}/{source_id}/{sig.get('rank')}"
                meta = sig.get("meta") or {}
                extra = ""
                for k in ARCHIVE_EXTRA_KEYS:
                    if meta.get(k):
                        extra = str(meta[k])[:DESCRIPTION_CAP]
                        break
                out.append(Document(platform=platform_of(str(source_id)), title=label, url=url,
                                    date=day, extra=extra, key=f"{day}|{source_id}|{url}"))
    return out


def _hackernews_docs(ctx: TermContext, since: datetime,
                     notes: dict[str, list[str]]) -> list[Document]:
    out: list[Document] = []
    # Algolia answers at most a thousand hits per query, which on a busy month covers only
    # the last two weeks — so the month is asked for in slices of equal length, the same
    # way arXiv is, and each slice gets the same cap.
    slice_s = HN_SLICE_DAYS * 86400
    lo = int(since.timestamp())
    end = int(ctx.now.timestamp())
    first = True
    while lo < end:
        hi = min(lo + slice_s, end)
        for page in range(HN_PAGES):
            url = ("https://hn.algolia.com/api/v1/search_by_date?tags=story"
                   f"&numericFilters=created_at_i%3E{lo}%2Ccreated_at_i%3C%3D{hi}"
                   f"%2Cpoints%3E%3D{HN_MIN_POINTS}&hitsPerPage={HN_PAGE}&page={page}")
            if not first:
                time.sleep(ctx.throttle_for("hackernews"))
            first = False
            try:
                data = fetch(url, client=ctx.client, expect="json")
            except SourceUnavailable as exc:
                _note(notes, "hackernews", f"discovery slice page {page}: {exc}")
                break
            hits = data.get("hits") or []
            for hit in hits:
                title = (hit.get("title") or hit.get("story_title") or "").strip()
                when = (datetime.fromtimestamp(int(hit["created_at_i"]), timezone.utc)
                        if hit.get("created_at_i") else parse_when(hit.get("created_at")))
                if not title or when is None:
                    continue
                item = hit.get("objectID") or ""
                link = (hit.get("url") or "").strip() or f"https://news.ycombinator.com/item?id={item}"
                out.append(Document(platform="hackernews", title=title, url=link,
                                    date=when.date().isoformat()))
            if page + 1 >= int(data.get("nbPages") or 1) or not hits:
                break
        lo = hi
    return out


def _devto_docs(ctx: TermContext, notes: dict[str, list[str]]) -> list[Document]:
    url = "https://dev.to/api/articles?top=30&per_page=1000"
    try:
        data = fetch(url, client=ctx.client, expect="json")
    except SourceUnavailable as exc:
        _note(notes, "devto", f"discovery: {exc}")
        return []
    out: list[Document] = []
    for art in data if isinstance(data, list) else []:
        title = (art.get("title") or "").strip()
        link = (art.get("url") or "").strip()
        when = parse_when(art.get("published_at"))
        if not title or not link or when is None:
            continue
        out.append(Document(platform="devto", title=title, url=link,
                            date=when.date().isoformat()))
    return out


def _arxiv_docs(ctx: TermContext, since: datetime, days: int,
                notes: dict[str, list[str]]) -> list[Document]:
    cats = "+OR+".join(f"cat:{cat}" for cat in ARXIV_CATEGORIES)
    out: list[Document] = []
    slice_start = since.date()
    end_date = ctx.now.date()
    first = True
    while slice_start <= end_date:
        slice_end = min(slice_start + timedelta(days=ARXIV_SLICE_DAYS - 1), end_date)
        window = (f"submittedDate:[{slice_start.strftime('%Y%m%d')}0000+TO+"
                  f"{slice_end.strftime('%Y%m%d')}2359]")
        url = (f"https://export.arxiv.org/api/query?search_query=%28{cats}%29+AND+{window}"
               f"&sortBy=submittedDate&sortOrder=descending&max_results={ARXIV_PAGE}")
        if not first:
            time.sleep(ARXIV_THROTTLE_S)
        first = False
        try:
            root = ET.fromstring(fetch(url, client=ctx.client))
        except (SourceUnavailable, ET.ParseError) as exc:
            _note(notes, "arxiv", f"discovery slice from {slice_start}: {type(exc).__name__}: {exc}")
            slice_start = slice_end + timedelta(days=1)
            continue
        for entry in root.findall("a:entry", ATOM):
            title = " ".join((entry.findtext("a:title", namespaces=ATOM) or "").split())
            link = (entry.findtext("a:id", namespaces=ATOM) or "").strip()
            when = parse_when(entry.findtext("a:published", namespaces=ATOM))
            if not title or not link or when is None:
                continue
            out.append(Document(platform="arxiv", title=title, url=link,
                                date=when.date().isoformat()))
        slice_start = slice_end + timedelta(days=1)
    return out


def _github_docs(ctx: TermContext, since: datetime,
                 notes: dict[str, list[str]]) -> list[Document]:
    day = since.date().isoformat()
    out: list[Document] = []
    for page in range(1, GITHUB_PAGES + 1):
        url = (f"https://api.github.com/search/repositories?q={quote(f'created:>{day}')}"
               f"&sort=stars&order=desc&per_page={GITHUB_PER_PAGE}&page={page}")
        if page > 1:
            time.sleep(ctx.throttle_for("github"))
        try:
            data = fetch(url, client=ctx.client, expect="json")
        except SourceUnavailable as exc:
            _note(notes, "github", f"discovery page {page}: {exc}")
            break
        items = data.get("items") or []
        for repo in items:
            title = (repo.get("full_name") or repo.get("name") or "").strip()
            link = (repo.get("html_url") or "").strip()
            when = parse_when(repo.get("created_at"))
            if not title or not link or when is None:
                continue
            out.append(Document(platform="github", title=title, url=link,
                                date=when.date().isoformat(),
                                extra=(repo.get("description") or "")[:DESCRIPTION_CAP]))
        if len(items) < GITHUB_PER_PAGE:
            break
    return out


def corpus(ctx: TermContext, *, days: int = 30, repo_root: str | Path | None = None,
           log: Callable[[str], None] = print,
           ) -> tuple[list[Document], dict[str, list[str]], dict[str, str]]:
    """The last `days` of titles from the four archives. Documents outside the window are
    dropped, so every platform contributes to the same window even when its own filter is
    coarser."""
    since = ctx.now - timedelta(days=days)
    floor = (ctx.now.date() - timedelta(days=days - 1)).isoformat()
    notes: dict[str, list[str]] = {}
    docs: list[Document] = []
    if repo_root is not None:
        archived = [d for d in _archive_docs(repo_root, ctx.now.date(), days, notes)
                    if d.date >= floor]
        docs.extend(archived)
        platforms = len({d.platform for d in archived})
        oldest = min((d.date for d in archived), default="—")
        log(f"  corpus {'ledger':<11} {len(archived):>5} sightings  {platforms} platforms  "
            f"oldest {oldest}")
    for platform, got in (("hackernews", lambda: _hackernews_docs(ctx, since, notes)),
                          ("devto", lambda: _devto_docs(ctx, notes)),
                          ("arxiv", lambda: _arxiv_docs(ctx, since, days, notes)),
                          ("github", lambda: _github_docs(ctx, since, notes))):
        try:
            fetched = [d for d in got() if d.date >= floor]
        except Exception as exc:  # noqa: BLE001 — a corpus source is a note, never a crash
            _note(notes, platform, f"discovery: {type(exc).__name__}: {exc}")
            fetched = []
        # Slices can overlap at their edges and a feed can repeat an item; a document is
        # one URL, counted once.
        seen: set[str] = set()
        fetched = [d for d in fetched if not (d.url in seen or seen.add(d.url))]
        docs.extend(fetched)
        oldest = min((d.date for d in fetched), default="—")
        log(f"  corpus {platform:<11} {len(fetched):>5} documents  oldest {oldest}")
    coverage = {p: min((d.date for d in docs if d.platform == p), default="—")
                for p in CORPUS_PLATFORMS}
    return docs, notes, coverage


# ------------------------------------------------------------------- the rule and the ranking

def _blocklist() -> tuple[frozenset[str], frozenset[str]]:
    raw = load_json("ngram_blocklist.json")
    if isinstance(raw, list):
        raw = {"phrases": raw, "tokens": []}
    phrases = frozenset(" ".join(tokens(p)) for p in raw.get("phrases", []))
    words = frozenset(t.casefold() for t in raw.get("tokens", []))
    return phrases, words


def watchlist_phrases(watchlist: Sequence[dict[str, Any]]) -> frozenset[str]:
    """Every watched term and alias in the tokenised form a candidate is compared against."""
    out: set[str] = set()
    for term in watchlist:
        for raw in [term.get("term", ""), *(term.get("aliases") or [])]:
            normalised = " ".join(tokens(str(raw)))
            if normalised:
                out.add(normalised)
    return frozenset(out)


def _is_watched(ngram: str, watched: frozenset[str]) -> bool:
    """True when the phrase is part of something already tracked: "language model" is not a
    finding while "small language model" is on the watchlist."""
    padded = f" {ngram} "
    return any(padded in f" {phrase} " for phrase in watched)


def rank(docs: Sequence[Document], watchlist: Sequence[dict[str, Any]], *, today: date,
         rules: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    rules = rules or {}
    days = int(rules.get("discover_days", 30))
    recent_days = int(rules.get("discover_recent_days", 14))
    prior_days = max(1, days - recent_days)
    min_recent = int(rules.get("discover_min_docs_recent", 4))
    min_solo = int(rules.get("discover_min_docs_recent_solo", 8))
    min_platforms = int(rules.get("discover_min_platforms", 2))
    # A phrase carried by a single platform is admitted only when it is both frequent and
    # clearly accelerating; without the second condition the corpus's largest platform
    # (arXiv) fills the list with its own everyday vocabulary.
    solo_min_ratio = float(rules.get("discover_solo_min_ratio", 3.0))
    top = int(rules.get("discover_top", 30))
    recent_from = (today - timedelta(days=recent_days - 1)).isoformat()
    blocked_phrases, blocked_tokens = _blocklist()
    watched = watchlist_phrases(watchlist)
    order = {p: i for i, p in enumerate(CORPUS_PLATFORMS)}

    out: list[dict[str, Any]] = []
    for ngram, item in tally(docs, recent_from=recent_from).items():
        if item.docs_recent < min_recent or item.sample is None:
            continue
        per_recent = item.docs_recent / recent_days
        per_prior = item.docs_prior / prior_days
        value = round(per_recent / max(per_prior, 0.5 / prior_days), 2)
        if len(item.platforms) < min_platforms and (item.docs_recent < min_solo
                                                    or value < solo_min_ratio):
            continue
        if ngram in blocked_phrases or any(t in blocked_tokens for t in ngram.split()):
            continue
        if _is_watched(ngram, watched):
            continue
        out.append({
            "ngram": ngram,
            "docs_recent": item.docs_recent,
            "docs_prior": item.docs_prior,
            "ratio": value,
            "platforms": sorted(item.platforms, key=lambda p: order.get(p, 99)),
            "sample": {"date": item.sample.date, "title": item.sample.title[:200],
                       "url": item.sample.url},
        })
    out.sort(key=lambda c: (-len(c["platforms"]), -c["ratio"], -c["docs_recent"], c["ngram"]))
    return out[:top]


def discover(ctx: TermContext, watchlist: Sequence[dict[str, Any]], *,
             rules: dict[str, Any] | None = None, repo_root: str | Path | None = None,
             log: Callable[[str], None] = print) -> Discovery:
    rules = rules if rules is not None else ctx.rules
    days = int(rules.get("discover_days", 30))
    docs, notes, coverage = corpus(ctx, days=days, repo_root=repo_root, log=log)
    candidates = rank(docs, watchlist, today=ctx.now.date(), rules=rules)
    return Discovery(candidates=candidates, notes=notes, documents=len(docs),
                     coverage=coverage)


# ------------------------------------------------------------------------------------- the CLI

def _table(candidates: Sequence[dict[str, Any]]) -> str:
    head = (f"{'n-gram':<34}{'recent':>7}{'prior':>7}{'ratio':>8}  {'platforms':<28}sample")
    lines = [head, "-" * len(head)]
    for c in candidates:
        lines.append(f"{c['ngram']:<34}{c['docs_recent']:>7}{c['docs_prior']:>7}"
                     f"{c['ratio']:>8.2f}  {', '.join(c['platforms']):<28}"
                     f"{c['sample']['title'][:60]}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser(prog="trending.discover",
                                description="Propose n-grams the watchlist does not track yet.")
    p.add_argument("--repo-root", default=".",
                   help="the repository whose committed day files are the primary corpus")
    p.add_argument("--days", type=int, default=None, help="corpus window in days (default 30)")
    args = p.parse_args(argv)

    rules = load_json("rules.json")
    if args.days:
        rules = {**rules, "discover_days": args.days}
    entries, from_repo = wl.load(args.repo_root)
    watchlist = wl.tracked(entries)
    with open_client() as client:
        ctx = make_context(client, rules=rules, now=datetime.now(timezone.utc))
        print(f"discovery: corpus of {int(rules.get('discover_days', 30))} days, "
              f"{len(watchlist)} watched terms excluded"
              + ("" if from_repo else " (list from the package seed)"))
        result = discover(ctx, watchlist, rules=rules, repo_root=args.repo_root)
    print(f"discovery: {result.documents} documents, {len(result.candidates)} candidates")
    for platform, notes in sorted(result.notes.items()):
        for note in notes:
            print(f"  note {platform}: {note}")
    print(_table(result.candidates))
    return 0


if __name__ == "__main__":
    sys.exit(main())
