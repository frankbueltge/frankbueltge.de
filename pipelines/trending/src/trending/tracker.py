"""The term tracker — the slow half of Common Ground.

Six platforms are asked the same question about every watched term: how many documents from
the last one, seven and thirty days mention this term (or one of its aliases)? Each platform
answers with its own search API, one quoted phrase per request; every count is a document
count deduped by url, every receipt is a title, a url and a date. No bodies are stored, no
model is involved, nothing is estimated.

Failure is a note, never a crash. A phrase that fails is counted as not searched; after three
consecutive failures a platform is dropped for the rest of the run (a source that is down
must not be hammered thirty times), and its report says so. When a platform is unavailable
its counts read zero for every term — the report beside them is the caveat, and the site
prints it.

`first_seen` is the earliest date of any matched document in this run, taken before the
receipt cap, joined with what the committed term files already knew. Using only the twelve
kept receipts would make loud terms look younger than quiet ones, which is the opposite of
the truth.
"""
from __future__ import annotations

import json
import os
import re
import time
import xml.etree.ElementTree as ET
from collections.abc import Callable, Iterable, Sequence
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, timezone
from email.utils import parsedate_to_datetime
from pathlib import Path
from typing import Any
from urllib.parse import quote, quote_plus

import httpx

from trending.archive import trending_dir
from trending.fetch import USER_AGENT, SourceUnavailable, fetch
from trending.normalize import tokens
from trending.sources.google_news import split_publisher

CONTRACT_TERMS = "trending-terms/1"

# The same header set run.py sends for the day sources.
ACCEPT = "application/json, application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8"

PLATFORMS: tuple[str, ...] = ("hackernews", "google_news", "github", "arxiv", "reddit",
                              "wikipedia_views")

# name and url as the record reports them, in the fixed order above
PLATFORM_META: dict[str, tuple[str, str]] = {
    "hackernews": ("Hacker News (Algolia search)", "https://hn.algolia.com/api/v1/search_by_date"),
    "google_news": ("Google News (search RSS)", "https://news.google.com/rss/search"),
    "github": ("GitHub (repository search)", "https://api.github.com/search/repositories"),
    "arxiv": ("arXiv (API query)", "https://export.arxiv.org/api/query"),
    "reddit": ("Reddit (search feed)", "https://www.reddit.com/search.rss"),
    "wikipedia_views": ("Wikipedia (Pageviews API, English)",
                        "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article"),
}

WINDOWS = {"d1": 1, "d7": 7, "d30": 30}
MAX_CONSECUTIVE_FAILURES = 3
RECEIPTS_CAP = 12
RECEIPTS_PER_PLATFORM = 6  # so one loud platform cannot fill the whole list
NOTE_CAP = 200

# One request per this many seconds and platform. GitHub's search API allows ten requests a
# minute unauthenticated and thirty with a token, which is the only reason a token matters
# here — the data is public either way.
THROTTLE_S: dict[str, float] = {
    "hackernews": 0.5, "google_news": 0.5, "github": 7.0, "arxiv": 3.0, "reddit": 0.5,
    "wikipedia_views": 0.5,
}
GITHUB_THROTTLE_AUTHENTICATED_S = 2.0

ATOM = {"a": "http://www.w3.org/2005/Atom"}
TERMS_FILE = re.compile(r"^\d{4}-\d{2}-\d{2}\.json$")


# ---------------------------------------------------------------- windows and small helpers

@dataclass(frozen=True)
class Match:
    """One document a platform returned for a phrase."""
    url: str
    title: str
    when: datetime


@dataclass
class Outcome:
    """What one platform has to say about one term."""
    counts: dict[str, Any] = field(default_factory=lambda: {"d1": 0, "d7": 0, "d30": 0,
                                                            "capped": False})
    receipts: list[dict[str, str]] = field(default_factory=list)
    earliest: str | None = None


@dataclass
class TermContext:
    """The run's clock and connection. `now` is the end of every window and is fixed for the
    whole run, so the three windows of all terms line up; `clock` stamps the reports."""
    client: httpx.Client
    now: datetime
    rules: dict[str, Any]
    github_authenticated: bool = False
    clock: Callable[[], datetime] = lambda: datetime.now(timezone.utc)
    throttles: dict[str, float] = field(default_factory=dict)

    def throttle_for(self, platform: str) -> float:
        if platform in self.throttles:
            return self.throttles[platform]
        if platform == "github" and self.github_authenticated:
            return GITHUB_THROTTLE_AUTHENTICATED_S
        return THROTTLE_S.get(platform, 0.5)


def iso_z(when: datetime) -> str:
    return when.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def install_github_auth(client: httpx.Client) -> bool:
    """Send `GITHUB_TOKEN`, when the environment has one, to api.github.com and nowhere else.

    The token buys rate limit, not data: the repository search is public either way. It is
    attached by a request hook rather than to the client's headers so that no other host in
    the run can ever see it.
    """
    token = (os.environ.get("GITHUB_TOKEN") or "").strip()
    if not token:
        return False

    def add_auth(request: httpx.Request) -> None:
        if request.url.host == "api.github.com" and "authorization" not in request.headers:
            request.headers["Authorization"] = f"Bearer {token}"

    hooks = list(client.event_hooks.get("request", []))
    if not any(getattr(h, "__name__", "") == "add_auth" for h in hooks):
        client.event_hooks["request"] = [*hooks, add_auth]
    return True


def open_client() -> httpx.Client:
    """A client with the same identification the day run sends (see run.py)."""
    return httpx.Client(headers={"User-Agent": USER_AGENT, "Accept": ACCEPT})


def make_context(client: httpx.Client, *, rules: dict[str, Any],
                 now: datetime | None = None) -> TermContext:
    authenticated = install_github_auth(client)
    return TermContext(client=client, now=now or datetime.now(timezone.utc), rules=rules,
                       github_authenticated=authenticated)


def parse_when(raw: str | None) -> datetime | None:
    """ISO-8601 (with or without a trailing Z) or RFC 822, as the six platforms mix them."""
    if not raw:
        return None
    text = raw.strip()
    try:
        when = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError:
        try:
            when = parsedate_to_datetime(text)
        except (TypeError, ValueError):
            return None
    if when is None:
        return None
    if when.tzinfo is None:
        when = when.replace(tzinfo=timezone.utc)
    return when.astimezone(timezone.utc)


def _age_days(when: datetime, now: datetime) -> float:
    return max(0.0, (now - when).total_seconds() / 86400.0)


def tally(matches: Iterable[Match], now: datetime, *, capped: bool = False) -> Outcome:
    """Count matches into the three cumulative windows, newest first, deduped by url.
    Anything older than the widest window is dropped: not every search API honours a date
    filter (Google News does not), and the record only claims thirty days."""
    ordered = sorted(matches, key=lambda m: (m.when, m.url), reverse=True)
    seen: set[str] = set()
    counts = {"d1": 0, "d7": 0, "d30": 0, "capped": bool(capped)}
    receipts: list[dict[str, str]] = []
    earliest: str | None = None
    for m in ordered:
        if not m.url or m.url in seen:
            continue
        seen.add(m.url)
        age = _age_days(m.when, now)
        if age > WINDOWS["d30"]:
            continue
        counts["d30"] += 1
        if age <= WINDOWS["d7"]:
            counts["d7"] += 1
        if age <= WINDOWS["d1"]:
            counts["d1"] += 1
        day = m.when.date().isoformat()
        if earliest is None or day < earliest:
            earliest = day
        if len(receipts) < RECEIPTS_CAP:
            receipts.append({"date": day, "title": m.title[:200], "url": m.url})
    return Outcome(counts=counts, receipts=receipts, earliest=earliest)


def merge_receipts(per_platform: dict[str, list[dict[str, str]]], *, cap: int = RECEIPTS_CAP,
                   per_platform_cap: int = RECEIPTS_PER_PLATFORM) -> list[dict[str, str]]:
    """Newest first, deduped by url, at most `cap`. A soft quota decides *which* receipts are
    kept — one loud platform must not fill the whole list — and the kept ones are then put back
    into date order, because that is what the record promises."""
    flat = [{"platform": p, **r} for p, rs in per_platform.items() for r in rs]
    flat.sort(key=lambda r: (r["date"], r["platform"], r["url"]), reverse=True)
    out: list[dict[str, str]] = []
    seen: set[str] = set()
    for quota in (per_platform_cap, cap):
        used: dict[str, int] = {}
        for r in flat:
            if len(out) >= cap:
                break
            if r["url"] in seen or used.get(r["platform"], 0) >= quota:
                continue
            used[r["platform"]] = used.get(r["platform"], 0) + 1
            seen.add(r["url"])
            out.append(r)
        if len(out) >= cap:
            break
    out.sort(key=lambda r: (r["date"], r["platform"], r["url"]), reverse=True)
    return out


def phrases_for(term: dict[str, Any]) -> list[str]:
    """The quoted phrases one term is searched with: its own wording first, then its aliases,
    each only once."""
    out: list[str] = []
    for raw in [term.get("term", ""), *(term.get("aliases") or [])]:
        phrase = " ".join(str(raw).split())
        if phrase and phrase.casefold() not in {p.casefold() for p in out}:
            out.append(phrase)
    return out


def _shares_a_word(title: str, phrase: str) -> bool:
    """Weak sanity guard for the one platform whose query semantics are undocumented: a
    headline that carries no word of the phrase at all is not about it."""
    wanted = set(tokens(phrase))
    if not wanted:
        return True
    return bool(wanted & set(tokens(title)))


# -------------------------------------------------------------------------- the six searches


# Platforms whose query syntax understands OR: one request per term covers the term and its
# aliases. Hacker News (Algolia) has no OR, so it is asked once per phrase — cheaply.
OR_PLATFORMS = frozenset({"github", "arxiv", "google_news", "reddit"})


def _phrases(phrase: "str | Sequence[str]") -> list[str]:
    return [phrase] if isinstance(phrase, str) else [p for p in phrase if p]


def _search_hackernews(ctx: TermContext, phrase: str) -> tuple[list[Match], bool]:
    since = int((ctx.now - timedelta(days=WINDOWS["d30"])).timestamp())
    quoted = quote_plus(f'"{phrase}"')
    url = (f"https://hn.algolia.com/api/v1/search_by_date?query={quoted}"
           f"&tags=story&numericFilters=created_at_i%3E{since}&hitsPerPage=1000")
    data = fetch(url, client=ctx.client, expect="json")
    hits = data.get("hits") or []
    matches: list[Match] = []
    for hit in hits:
        title = (hit.get("title") or hit.get("story_title") or "").strip()
        when = (datetime.fromtimestamp(int(hit["created_at_i"]), timezone.utc)
                if hit.get("created_at_i") else parse_when(hit.get("created_at")))
        if not title or when is None:
            continue
        item_id = hit.get("objectID") or ""
        link = (hit.get("url") or "").strip() or f"https://news.ycombinator.com/item?id={item_id}"
        matches.append(Match(url=link, title=title, when=when))
    capped = len(hits) >= 1000 or int(data.get("nbPages") or 0) > 1
    return matches, capped


def _search_google_news(ctx: TermContext, phrase: "str | Sequence[str]") -> tuple[list[Match], bool]:
    phrases = _phrases(phrase)
    quoted = quote_plus(" OR ".join(f'"{p}"' for p in phrases))
    url = (f"https://news.google.com/rss/search?q={quoted}&hl=en-US&gl=US&ceid=US%3Aen")
    root = ET.fromstring(fetch(url, client=ctx.client))
    items = list(root.iter("item"))
    matches: list[Match] = []
    for item in items:
        raw = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").strip()
        when = parse_when(item.findtext("pubDate"))
        if not raw or not link or when is None:
            continue
        title, publisher = split_publisher(raw)
        source_el = item.find("source")
        if source_el is not None and (source_el.text or "").strip():
            publisher = source_el.text.strip()
        if not any(_shares_a_word(title, p) for p in phrases):
            continue
        matches.append(Match(url=link, title=f"{title} — {publisher}" if publisher else title,
                             when=when))
    # The feed hands out about a hundred items at most, so a wider window may undercount.
    return matches, len(items) >= 90


def _search_github(ctx: TermContext, phrase: "str | Sequence[str]") -> tuple[list[Match], bool]:
    since = (ctx.now - timedelta(days=WINDOWS["d30"])).date().isoformat()
    words = " OR ".join(f'"{p}"' for p in _phrases(phrase))
    query = quote_plus(f'{words} created:>{since}')
    url = (f"https://api.github.com/search/repositories?q={query}"
           f"&sort=stars&order=desc&per_page=100")
    data = fetch(url, client=ctx.client, expect="json")
    matches: list[Match] = []
    for repo in data.get("items") or []:
        title = (repo.get("full_name") or repo.get("name") or "").strip()
        link = (repo.get("html_url") or "").strip()
        when = parse_when(repo.get("created_at"))
        if not title or not link or when is None:
            continue
        matches.append(Match(url=link, title=title, when=when))
    return matches, int(data.get("total_count") or 0) > 100


def _search_arxiv(ctx: TermContext, phrase: "str | Sequence[str]") -> tuple[list[Match], bool]:
    query = "+OR+".join(quote(f'all:"{p}"', safe=":") for p in _phrases(phrase))
    url = (f"https://export.arxiv.org/api/query?search_query={query}"
           f"&sortBy=submittedDate&sortOrder=descending&max_results=200")
    root = ET.fromstring(fetch(url, client=ctx.client))
    entries = root.findall("a:entry", ATOM)
    matches: list[Match] = []
    for entry in entries:
        title = " ".join((entry.findtext("a:title", namespaces=ATOM) or "").split())
        link = (entry.findtext("a:id", namespaces=ATOM) or "").strip()
        when = parse_when(entry.findtext("a:published", namespaces=ATOM))
        if not title or not link or when is None:
            continue
        matches.append(Match(url=link, title=title, when=when))
    return matches, len(entries) >= 200


def _search_reddit(ctx: TermContext, phrase: "str | Sequence[str]") -> tuple[list[Match], bool]:
    quoted = quote_plus(" OR ".join(f'"{p}"' for p in _phrases(phrase)))
    url = f"https://www.reddit.com/search.rss?q={quoted}&sort=new&t=month"
    root = ET.fromstring(fetch(url, client=ctx.client))
    entries = root.findall("a:entry", ATOM)
    matches: list[Match] = []
    for entry in entries:
        title = " ".join((entry.findtext("a:title", namespaces=ATOM) or "").split())
        link_el = entry.find("a:link", ATOM)
        link = (link_el.get("href") if link_el is not None else "") or ""
        when = (parse_when(entry.findtext("a:published", namespaces=ATOM))
                or parse_when(entry.findtext("a:updated", namespaces=ATOM)))
        if not title or not link or when is None:
            continue
        matches.append(Match(url=link, title=title, when=when))
    # The search feed stops at twenty-five entries.
    return matches, len(entries) >= 25


def _wikipedia_views(ctx: TermContext, article: str) -> dict[str, Any]:
    """Daily pageviews of one English article, summed into the three windows. The endpoint
    publishes a day with a lag, so the newest available day is the d1 value."""
    end = (ctx.now - timedelta(days=1)).strftime("%Y%m%d")
    start = (ctx.now - timedelta(days=WINDOWS["d30"] + 1)).strftime("%Y%m%d")
    url = ("https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/"
           f"all-access/user/{quote(article, safe='')}/daily/{start}/{end}")
    data = fetch(url, client=ctx.client, expect="json")
    items = sorted((data.get("items") or []), key=lambda it: str(it.get("timestamp") or ""))
    views = [int(it.get("views") or 0) for it in items]
    return {"d1": sum(views[-1:]), "d7": sum(views[-7:]), "d30": sum(views[-30:]),
            "capped": False}


SEARCHES: dict[str, Callable[[TermContext, str], tuple[list[Match], bool]]] = {
    "hackernews": _search_hackernews,
    "google_news": _search_google_news,
    "github": _search_github,
    "arxiv": _search_arxiv,
    "reddit": _search_reddit,
}


# --------------------------------------------------------------------------------- the driver

def _report(platform: str, *, attempted: int, failures: Sequence[str], retrieved_at: str,
            extra_notes: Sequence[str] = ()) -> dict[str, str]:
    # The circuit-breaker note comes first: the note is capped, and "the platform was dropped"
    # matters more to a reader than the fourth stack of the same error.
    notes = [*extra_notes, *failures]
    if attempted == 0:
        status = "unavailable"
        notes = notes or ["nothing to search"]
    elif len(failures) >= attempted:
        status = "unavailable"
    elif failures:
        status = "partial"
    else:
        status = "ok"
    if status == "ok" and extra_notes:
        status = "partial"
    name, url = PLATFORM_META[platform]
    return {"id": platform, "name": name, "url": url, "status": status,
            "note": "; ".join(notes)[:NOTE_CAP], "retrieved_at": retrieved_at}


def unavailable_report(platform: str, note: str, retrieved_at: str) -> dict[str, str]:
    """A report for a platform that was never reached — the shape the record needs when the
    whole step fails."""
    return _report(platform, attempted=1, failures=[note], retrieved_at=retrieved_at)


def track_platform(ctx: TermContext, platform: str, terms: Sequence[dict[str, Any]], *,
                   log: Callable[[str], None] = print,
                   ) -> tuple[dict[str, Outcome], dict[str, str]]:
    """One platform, every term. The throttle sits between requests, the circuit breaker
    after three consecutive failures."""
    retrieved_at = iso_z(ctx.clock())
    throttle = ctx.throttle_for(platform)
    outcomes: dict[str, Outcome] = {}
    failures: list[str] = []
    extra: list[str] = []
    attempted = 0
    requests = 0
    consecutive = 0
    stopped = False
    for term in terms:
        slug = term["slug"]
        if stopped:
            continue
        if platform == "wikipedia_views":
            article = term.get("wikipedia_article")
            if not article:
                continue
            jobs: list[str] = [article]
        elif platform in OR_PLATFORMS:
            jobs = [phrases_for(term)]  # one request: the term and its aliases, OR-joined
        else:
            jobs = phrases_for(term)
        matches: list[Match] = []
        capped = False
        counts: dict[str, Any] | None = None
        for job in jobs:
            if requests:
                time.sleep(throttle)
            requests += 1
            attempted += 1
            try:
                if platform == "wikipedia_views":
                    counts = _wikipedia_views(ctx, job)
                else:
                    got, was_capped = SEARCHES[platform](ctx, job)
                    matches.extend(got)
                    capped = capped or was_capped
                consecutive = 0
            except (SourceUnavailable, ET.ParseError, ValueError, KeyError, TypeError) as exc:
                failures.append(f"{slug}: {type(exc).__name__}: {exc}"[:120])
                consecutive += 1
                if consecutive >= MAX_CONSECUTIVE_FAILURES:
                    stopped = True
                    extra.append(f"stopped after {consecutive} consecutive failures")
                    break
        if platform == "wikipedia_views":
            if counts is not None:
                outcomes[slug] = Outcome(counts=counts)
        else:
            seen: set[str] = set()
            unique = [m for m in matches if not (m.url in seen or seen.add(m.url))]
            outcomes[slug] = tally(unique, ctx.now, capped=capped)
    report = _report(platform, attempted=attempted, failures=failures[:6],
                     retrieved_at=retrieved_at, extra_notes=extra)
    log(f"  {platform:<16} {report['status']:<12} {requests:>3} requests  {report['note']}")
    return outcomes, report


def track(ctx: TermContext, terms: Sequence[dict[str, Any]], *,
          log: Callable[[str], None] = print,
          ) -> tuple[dict[str, dict[str, Outcome]], list[dict[str, str]]]:
    """Every platform, in the order the record lists them."""
    by_platform: dict[str, dict[str, Outcome]] = {}
    reports: list[dict[str, str]] = []
    for platform in PLATFORMS:
        try:
            outcomes, report = track_platform(ctx, platform, terms, log=log)
        except Exception as exc:  # noqa: BLE001 — one platform never takes the record down
            outcomes, report = {}, _report(platform, attempted=1,
                                           failures=[f"{type(exc).__name__}: {exc}"[:160]],
                                           retrieved_at=iso_z(ctx.clock()))
            log(f"  {platform:<16} {report['status']:<12}    {report['note']}")
        by_platform[platform] = outcomes
        reports.append(report)
    return by_platform, reports


# ------------------------------------------------------------------ status, ratio, first seen

def prior7(total: dict[str, int]) -> float:
    """The seven-day pace of the twenty-three days before the last seven."""
    return max(0.0, (total["d30"] - total["d7"]) / 23.0 * 7.0)


def ratio(total: dict[str, int]) -> float | None:
    prior = prior7(total)
    if prior <= 0:
        return None
    return round(total["d7"] / prior, 2)


def status(total: dict[str, int], first_seen: str | None, today: date,
           rules: dict[str, Any]) -> str:
    """quiet (too few) → emerging → rising → fading → established → quiet, exactly in that
    order; the thresholds are committed in rules.json."""
    min_d7 = int(rules.get("min_mentions_d7", 3))
    rising_at = float(rules.get("rising_ratio", 1.5))
    fading_at = float(rules.get("fading_ratio", 0.5))
    emerging_days = int(rules.get("emerging_days", 30))
    established_at = int(rules.get("established_d30", 12))
    if total["d7"] < min_d7:
        return "quiet"
    prior = prior7(total)
    rising = total["d7"] >= rising_at * prior
    if rising:
        age = None
        if first_seen:
            try:
                age = (today - date.fromisoformat(first_seen)).days
            except ValueError:
                age = None
        if age is not None and age < emerging_days:
            return "emerging"
        return "rising"
    if prior >= min_d7 and total["d7"] <= fading_at * prior:
        return "fading"
    if total["d30"] >= established_at:
        return "established"
    return "quiet"


# -------------------------------------------------------------- the committed term files

def terms_dir(repo_root: str | Path) -> Path:
    return trending_dir(repo_root) / "terms"


def load_terms_files(repo_root: str | Path, *, before: date | None = None,
                     limit: int = 3) -> list[dict[str, Any]]:
    """The newest committed term records, newest first. Reading a handful is enough: every
    record carries the `first_seen` it inherited, so the newest file already holds the whole
    chain — the limit is only there to survive one corrupt file."""
    folder = terms_dir(repo_root)
    if not folder.is_dir():
        return []
    names = sorted((p for p in folder.iterdir() if TERMS_FILE.match(p.name)), reverse=True)
    out: list[dict[str, Any]] = []
    for path in names:
        if before is not None and path.stem >= before.isoformat():
            continue
        try:
            rec = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            continue
        if isinstance(rec, dict) and rec.get("$contract") == CONTRACT_TERMS:
            out.append(rec)
        if len(out) >= limit:
            break
    return out


def history_first_seen(records: Iterable[dict[str, Any]]) -> dict[str, str]:
    """Per slug, the earliest date the archive knows: its own `first_seen` and the dates of
    the receipts it kept."""
    earliest: dict[str, str] = {}
    for rec in records:
        for term in rec.get("terms") or []:
            slug = term.get("slug")
            if not slug:
                continue
            dates = [d for d in [term.get("first_seen")] if isinstance(d, str) and d]
            dates += [r.get("date") for r in (term.get("receipts") or [])
                      if isinstance(r.get("date"), str) and r.get("date")]
            if not dates:
                continue
            low = min(dates)
            if slug not in earliest or low < earliest[slug]:
                earliest[slug] = low
    return earliest


def first_seen_for(slug: str, *, added: str, run_earliest: str | None,
                   history: dict[str, str]) -> str:
    """The earliest of: any document matched in this run, what the archive knew, and the day
    the term was put on the watchlist. A term nobody ever mentioned is first seen the day the
    watching began — an honest floor, and one that does not drift between runs."""
    dates = [d for d in (run_earliest, history.get(slug), added) if d]
    return min(dates) if dates else added
