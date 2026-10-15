"""The convergence rule: which items on which platforms are the same topic today.

Deterministic token matching, disclosed on the method sheet. Union-find over pairwise
matches, a label chosen by source priority, a score that counts platforms first and
list position second, and a memory over the archive for first_seen / days_hot."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from typing import Any

from trending.model import Link, Signal, Topic, TopicSignal
from trending.normalize import jaccard, slug, tokens

# Sources whose labels are sentences (headlines, questions, paper titles) rather than names;
# they attach to a short label by containment and match each other by token overlap.
HEADLINE_SOURCES = frozenset({"google_news", "hackernews", "reddit", "lobsters", "devto",
                              "stackoverflow", "techmeme", "arxiv", "polymarket"})
# Which member names a cluster: the broadest general-audience surface first, then the named
# things (apps, games, models, products, coins, packages), then the sentence sources last.
LABEL_PRIORITY = {"google_trends": 0, "bluesky": 1, "wikipedia": 2, "mastodon": 3,
                  "hackernews": 4, "google_news": 5, "reddit": 6, "github": 7,
                  "appstore": 8, "steam": 9, "huggingface": 10, "producthunt": 11,
                  "coingecko": 12, "pypi": 13, "lobsters": 14, "devto": 15, "techmeme": 16,
                  "stackoverflow": 17, "arxiv": 18, "polymarket": 19}
SHORT_MAX_TOKENS = 4


def is_headline(sig: Signal) -> bool:
    if sig.source in HEADLINE_SOURCES:
        return True
    return sig.source == "mastodon" and sig.meta.get("kind") == "link"


@dataclass
class _Prepared:
    sig: Signal
    tok: set[str]
    short: bool


def _prepare(signals: list[Signal]) -> list[_Prepared]:
    out: list[_Prepared] = []
    for sig in signals:
        tok = set(tokens(sig.label))
        if not tok:
            continue
        out.append(_Prepared(sig, tok, len(tok) <= SHORT_MAX_TOKENS and not is_headline(sig)))
    return out


def match(a: _Prepared, b: _Prepared, jaccard_min: float) -> bool:
    if a.sig.source == b.sig.source and a.sig.geo == b.sig.geo:
        return False
    A, B = a.tok, b.tok
    if a.short and b.short:
        if len(A) == 1 or len(B) == 1:
            return A == B
        return jaccard(A, B) >= jaccard_min or A <= B or B <= A
    if a.short != b.short:
        label, head = (A, B) if a.short else (B, A)
        return len(label) >= 2 and label <= head
    return jaccard(A, B) >= jaccard_min


def _find(parent: list[int], i: int) -> int:
    while parent[i] != i:
        parent[i] = parent[parent[i]]
        i = parent[i]
    return i


def _union(parent: list[int], i: int, j: int) -> None:
    ri, rj = _find(parent, i), _find(parent, j)
    if ri != rj:
        parent[max(ri, rj)] = min(ri, rj)


def _memory(label: str, topic_id: str, archive: list[dict[str, Any]], today: date,
            jaccard_min: float) -> tuple[str, int]:
    """first_seen and days_hot from the archived topics (oldest first)."""
    tok = set(tokens(label))
    hits: set[str] = set()
    for day in archive:
        for t in day.get("topics", []):
            if t.get("id") == topic_id or jaccard(tok, set(tokens(t.get("label", "")))) >= jaccard_min:
                hits.add(day["date"])
                break
    first_seen = min(hits | {today.isoformat()})
    days_hot = 1
    cursor = today - timedelta(days=1)
    while cursor.isoformat() in hits:
        days_hot += 1
        cursor -= timedelta(days=1)
    return first_seen, days_hot


def cluster(signals: list[Signal], archive: list[dict[str, Any]], rules: dict[str, Any],
            today: date) -> list[Topic]:
    jaccard_min = float(rules.get("jaccard_min", 0.5))
    links_cap = int(rules.get("links_cap", 6))
    prepared = _prepare(signals)
    n = len(prepared)
    parent = list(range(n))
    for i in range(n):
        for j in range(i + 1, n):
            if match(prepared[i], prepared[j], jaccard_min):
                _union(parent, i, j)

    groups: dict[int, list[_Prepared]] = {}
    for i, p in enumerate(prepared):
        groups.setdefault(_find(parent, i), []).append(p)

    # list length per (source, geo) → position-based heat
    sizes: dict[tuple[str, str | None], int] = {}
    for p in prepared:
        key = (p.sig.source, p.sig.geo)
        sizes[key] = sizes.get(key, 0) + 1

    topics: list[Topic] = []
    seen_ids: set[str] = set()
    for members in groups.values():
        members.sort(key=lambda p: (LABEL_PRIORITY.get(p.sig.source, 99), p.sig.rank, p.sig.label))
        lead = members[0].sig
        platforms = tuple(sorted({p.sig.source for p in members}))
        heat = sum(1 - (p.sig.rank - 1) / max(sizes[(p.sig.source, p.sig.geo)], 1)
                   for p in members) / len(members)
        score = round(len(platforms) + round(heat, 3), 3)
        category = next((p.sig.meta.get("category") for p in members
                         if p.sig.source == "bluesky" and p.sig.meta.get("category")), None)
        links: list[Link] = []
        urls: set[str] = set()
        for p in members:
            for link in p.sig.links:
                if link.url not in urls:
                    urls.add(link.url)
                    links.append(link)
        for p in members:
            if p.sig.url and p.sig.url not in urls:
                urls.add(p.sig.url)
                links.append(Link(title=p.sig.label, url=p.sig.url, publisher=p.sig.source))
        wiki = max((p.sig for p in members if p.sig.source == "wikipedia"),
                   key=lambda s: s.magnitude or 0, default=None)
        topic_id = slug(lead.label)
        base, k = topic_id, 2
        while topic_id in seen_ids:
            topic_id = f"{base}-{k}"
            k += 1
        seen_ids.add(topic_id)
        first_seen, days_hot = _memory(lead.label, topic_id, archive, today, jaccard_min)
        topics.append(Topic(
            id=topic_id, label=lead.label, platforms=platforms, platform_count=len(platforms),
            score=score, category=category, first_seen=first_seen, days_hot=days_hot,
            signals=tuple(TopicSignal(source=p.sig.source, geo=p.sig.geo, label=p.sig.label,
                                      url=p.sig.url, rank=p.sig.rank, magnitude=p.sig.magnitude,
                                      magnitude_unit=p.sig.magnitude_unit) for p in members),
            links=tuple(links[:links_cap]),
            wikipedia=({"lang": wiki.geo, "article": wiki.meta.get("article"),
                        "views": wiki.magnitude} if wiki else None),
        ))
    topics.sort(key=lambda t: (-t.score, t.label.casefold(), t.id))
    return topics
