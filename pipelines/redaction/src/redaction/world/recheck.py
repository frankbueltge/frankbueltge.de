"""Recheck the committed sample — the in-house deletion measurement.

Classes, and what they honestly are:

  ok          — the URL still answers 2xx
  gone_404 /
  gone_410    — the page is gone; with the committed manifest, a receipt
  legal_451   — "Unavailable For Legal Reasons"; reported as its own number,
                NEVER folded into the gone rate: from a German vantage point
                451 can mean EU geo-blocking rather than takedown
  botwall     — 403/429: the site refuses machines; unverifiable, excluded
                from the denominator, disclosed as a count
  server_error— 5xx: indeterminate, excluded like botwall
  unreachable — network failure/timeout: excluded like botwall

The gone rate is gone/(decided) with a Wilson 95 % interval, where decided
= ok + gone + legal_451. A 200 that meanwhile shows a different page (soft
deletion) counts as ok — the rate is a floor, and the method sheet says so.
"""
from __future__ import annotations

import hashlib
import math
import time
from datetime import datetime, timezone

import httpx

USER_AGENT = "frankbueltge.de redaction-world (hello@frankbueltge.de)"
TIMEOUT = 15.0
PAUSE = 0.15

OK = "ok"
GONE_404 = "gone_404"
GONE_410 = "gone_410"
LEGAL_451 = "legal_451"
BOTWALL = "botwall"
SERVER_ERROR = "server_error"
UNREACHABLE = "unreachable"
OTHER = "other"

CLASSES = (OK, GONE_404, GONE_410, LEGAL_451, BOTWALL, SERVER_ERROR, UNREACHABLE, OTHER)


def classify_code(code: int) -> str:
    if 200 <= code < 300:
        return OK
    if code == 404:
        return GONE_404
    if code == 410:
        return GONE_410
    if code == 451:
        return LEGAL_451
    if code in (401, 403, 429):
        return BOTWALL
    if 500 <= code < 600:
        return SERVER_ERROR
    return OTHER


def check_url(client: httpx.Client, url: str) -> tuple[str, int | None]:
    """Status only — the body is never read (we are counting, not crawling)."""
    try:
        with client.stream("GET", url, timeout=TIMEOUT, follow_redirects=True) as r:
            return classify_code(r.status_code), r.status_code
    except httpx.HTTPError:
        return UNREACHABLE, None


def wilson(k: int, n: int, z: float = 1.96) -> tuple[float, float]:
    """Wilson score interval for a binomial proportion."""
    if n == 0:
        return (0.0, 0.0)
    p = k / n
    denom = 1 + z * z / n
    center = (p + z * z / (2 * n)) / denom
    half = (z / denom) * math.sqrt(p * (1 - p) / n + z * z / (4 * n * n))
    return (max(0.0, center - half), min(1.0, center + half))


def _receipt(r: dict) -> dict:
    """One receipt row for the day record. 451 means a legal block — the day
    record must not re-publish what the law removed, so it carries the title
    only as a hash (the committed sample manifest, written before the block
    existed, stays the untouched receipt; case-by-case erasure on a justified
    request is the archive's answer, the count never changes)."""
    base = {k: r[k] for k in ("url", "domain", "first_seen", "class", "http_code")}
    if r["class"] == LEGAL_451:
        digest = hashlib.sha256(r["title"].encode("utf-8")).hexdigest()
        return {**base, "title_sha256": digest}
    return {**base, "title": r["title"]}


def recheck(items: list[dict], *, client: httpx.Client, pause: float = PAUSE) -> list[dict]:
    out = []
    for item in items:
        cls, code = check_url(client, item["url"])
        out.append({**item, "class": cls, "http_code": code})
        if pause:
            time.sleep(pause)
    return out


def summarize(results: list[dict], *, sample_manifest: dict) -> dict:
    counts = {c: 0 for c in CLASSES}
    for r in results:
        counts[r["class"]] += 1

    gone = counts[GONE_404] + counts[GONE_410]
    decided = counts[OK] + gone + counts[LEGAL_451] + counts[OTHER]
    excluded = counts[BOTWALL] + counts[SERVER_ERROR] + counts[UNREACHABLE]
    gone_lo, gone_hi = wilson(gone, decided)
    legal_lo, legal_hi = wilson(counts[LEGAL_451], decided)

    receipts = sorted(
        (_receipt(r) for r in results if r["class"] in (GONE_404, GONE_410, LEGAL_451)),
        key=lambda r: (r["class"], r["url"]),
    )
    return {
        "available": True,
        "pool_day": sample_manifest["pool_day"],
        "sample_drawn_at": sample_manifest["drawn_at"],
        "checked_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "sample_size": len(results),
        "counts": counts,
        "decided": decided,
        "excluded_unverifiable": excluded,
        "gone": gone,
        "gone_rate": round(gone / decided, 4) if decided else None,
        "gone_ci95": [round(gone_lo, 4), round(gone_hi, 4)] if decided else None,
        "legal_451": counts[LEGAL_451],
        "legal_451_rate": round(counts[LEGAL_451] / decided, 4) if decided else None,
        "legal_451_ci95": [round(legal_lo, 4), round(legal_hi, 4)] if decided else None,
        "receipts": receipts,
        "notes": [
            "451 from a German vantage point may mean EU geo-blocking rather than "
            "takedown; it is reported apart and never folded into the gone rate.",
            "451 receipts carry the title only as a SHA-256 — the day record does "
            "not re-publish what the law removed; the pre-committed sample manifest "
            "remains the receipt.",
            "403/429 bot-walls and network failures are unverifiable and excluded "
            "from the denominator, disclosed as counts.",
            "A 200 that shows different content (soft deletion) counts as ok — "
            "the gone rate is a floor.",
        ],
    }
