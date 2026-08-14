"""Selection rule for the register's display — versioned, no editorial hand.

v1 surfaces reframings that are *exchanges in place* — the addendum's
definition — not maximal churn: rank by similarity bucket first (a stable
frame with words swapped inside beats a full rewrite), then by capitalized
substitutions (actor-name proxies), then by substantive change count. One
entry per domain (an outlet A/B-testing its headlines must not own the
register), duplicate before/after pairs collapse, ties break on (domain,
url) so the same day always yields the same register.
"""
from __future__ import annotations

from redaction.world import REGISTER_BOUND
from redaction.world.triviality import STOPWORDS, Verdict


def _substantive(v: Verdict) -> list[str]:
    return [t for t in (*v.removed, *v.added) if t.casefold() not in STOPWORDS]


def weight(v: Verdict) -> int:
    changed = _substantive(v)
    caps = sum(1 for t in changed if t[:1].isupper())
    return len(changed) + caps


def _key(r: dict) -> tuple:
    v: Verdict = r["verdict"]
    changed = _substantive(v)
    caps = sum(1 for t in changed if t[:1].isupper())
    sim_bucket = int(v.similarity * 5)  # coarse buckets keep float noise out
    # An exchange removes AND adds substantive words; insertion-only edits
    # (SEO prefixes, product-name fixes) are copy-editing and rank below.
    removed_sub = [t for t in v.removed if t.casefold() not in STOPWORDS]
    added_sub = [t for t in v.added if t.casefold() not in STOPWORDS]
    exchange = 1 if (removed_sub and added_sub) else 0
    return (-exchange, -sim_bucket, -caps, -len(changed), r["domain"], r["url"])


def pick(rows: list[dict], bound: int = REGISTER_BOUND) -> list[dict]:
    """`rows` are classified title-change rows carrying `verdict`, `domain`,
    `url`. Returns the bounded register, most in-place reframings first."""
    reframings = sorted(
        (r for r in rows if r["verdict"].cls == "reframing"), key=_key
    )
    out: list[dict] = []
    seen_pairs: set[tuple[str, str]] = set()
    seen_domains: set[str] = set()
    for r in reframings:
        pair = (r["before"].casefold(), r["after"].casefold())
        if pair in seen_pairs or r["domain"] in seen_domains:
            continue
        seen_pairs.add(pair)
        seen_domains.add(r["domain"])
        out.append(r)
        if len(out) >= bound:
            break
    return out
