"""Live recheck of a deletion candidate — "gone" is a checked statement.

A 4xx on the newest capture says something about the crawler's night, not about
the page. The 2026-08-14 memory-hole audit reproduced it: BaFin's newest capture
20260812142910 carries status 403, the replay is 146 bytes of nginx 403 — and
the live site answers 200. The origin published that as kind=deletion.

So every candidate is rechecked live before the word "deletion" may appear:

  live 404/410              → deletion confirmed
  live 2xx                  → archive_error: the archive's 4xx contradicts the
                              live page — not a deletion, not a finding
  live 2xx + challenge page → botwall (a WAF answering 200 is not a page)
  live 401/403/429          → botwall
  live 451                  → legal_451, reported apart, never folded in
  5xx / network failure     → server_error / unreachable

The classes and the discipline are chamber 2's (world/recheck.py): everything
that is not decided is excluded from the finding and disclosed as a count.
"""
from __future__ import annotations

import time
from dataclasses import dataclass

import httpx

from redaction.cdx import RETRY_DELAYS
from redaction.validity import challenge_marker
from redaction.world.recheck import (
    BOTWALL,
    GONE_404,
    GONE_410,
    LEGAL_451,
    OK,
    SERVER_ERROR,
    UNREACHABLE,
    classify_code,
)

TIMEOUT = 15.0
PAUSE = 0.6  # one live request per candidate, gentle like the Wayback calls
MAX_SNIFF_BYTES = 200_000  # enough for a challenge page, never a crawl

# Verdicts of this module.
DELETION_CONFIRMED = "deletion_confirmed"
ARCHIVE_ERROR = "archive_error"
INDETERMINATE = "indeterminate"


@dataclass(frozen=True)
class LiveVerdict:
    cls: str
    http_code: int | None = None
    detail: str = ""


def verdict(code: int | None, body: str = "") -> LiveVerdict:
    """Map a live answer onto this module's verdicts. Pure, no IO."""
    if code is None:
        return LiveVerdict(UNREACHABLE, None, "network failure")
    cls = classify_code(code)
    if cls in (GONE_404, GONE_410):
        return LiveVerdict(DELETION_CONFIRMED, code, cls)
    if cls == OK:
        marker = challenge_marker(body)
        if marker:
            return LiveVerdict(BOTWALL, code, f"live challenge: {marker}")
        return LiveVerdict(ARCHIVE_ERROR, code, "live page answers 200")
    if cls in (BOTWALL, LEGAL_451, SERVER_ERROR):
        return LiveVerdict(cls, code, cls)
    return LiveVerdict(INDETERMINATE, code, cls)


def recheck(
    url: str,
    *,
    client: httpx.Client,
    pause: float = PAUSE,
    retry_delays: tuple[float, ...] = RETRY_DELAYS,
) -> LiveVerdict:
    """One live GET. The body is read only on 2xx (to sniff a challenge page)
    and only up to MAX_SNIFF_BYTES — we are checking, not crawling."""
    if pause:
        time.sleep(pause)
    for delay in (0.0, *retry_delays):
        if delay:
            time.sleep(delay)
        try:
            r = client.get(url, timeout=TIMEOUT, follow_redirects=True)
            body = r.text[:MAX_SNIFF_BYTES] if 200 <= r.status_code < 300 else ""
            return verdict(r.status_code, body)
        except httpx.HTTPError:
            continue
    return verdict(None)
