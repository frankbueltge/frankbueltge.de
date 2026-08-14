"""Wayback CDX client. All evidence is archive-sourced (statuscodes + archived
snapshots) so every finding is reproducible from the public record."""
from __future__ import annotations

import time
from dataclasses import dataclass

import httpx

CDX = "https://web.archive.org/cdx/search/cdx"
RETRY_DELAYS = (1.0, 2.0, 4.0)
TIMEOUT = 30.0


class SourceUnavailable(Exception):
    pass


def _redacted(url: str) -> str:
    """Error strings can land in the public archive — never leak query params."""
    return url.split("?", 1)[0]


@dataclass(frozen=True)
class Capture:
    timestamp: str
    status: str
    digest: str


def captures(url: str, *, client: httpx.Client, days: int = 14) -> list[Capture]:
    params = {
        "url": url,
        "output": "json",
        "fl": "timestamp,original,statuscode,digest",
        "collapse": "digest",
        "limit": "-40",
    }
    last: Exception | None = None
    for delay in (0.0, *RETRY_DELAYS):
        if delay:
            time.sleep(delay)
        try:
            r = client.get(CDX, params=params, timeout=TIMEOUT, follow_redirects=True)
            r.raise_for_status()
            rows = r.json()
            if not rows or len(rows) < 2:
                return []
            caps = [
                Capture(timestamp=row[0], status=row[2], digest=row[3]) for row in rows[1:]
            ]
            caps.sort(key=lambda c: c.timestamp)
            return caps
        except httpx.HTTPError as exc:
            last = exc
    raise SourceUnavailable(f"{_redacted(CDX)}: {type(last).__name__}")


def snapshot_url(timestamp: str, original: str) -> str:
    """Raw archived resource (id_ modifier) — content without the Wayback wrapper."""
    return f"https://web.archive.org/web/{timestamp}id_/{original}"


def permalink(timestamp: str, original: str) -> str:
    """Human-viewable archived page."""
    return f"https://web.archive.org/web/{timestamp}/{original}"


def _is_ok(status: str) -> bool:
    return status == "200"


def _is_candidate(status: str) -> bool:
    # A 4xx on the newest capture makes the page a deletion CANDIDATE — never a
    # deletion on its own: it describes the crawler's night, not the page (a 403
    # is a bot-wall, a 404 can be a mis-crawl). live.recheck decides.
    # 3xx (redirect / reorganisation) and 5xx (transient) are deliberately NOT
    # candidates — a moved page is not a redaction.
    return status.startswith("4")


DELETION_CANDIDATE = "deletion_candidate"
REMOVAL = "removal"
NONE = "none"


def classify(caps: list[Capture]) -> tuple[str, Capture | None, Capture | None]:
    """('deletion_candidate', last_ok, dead) | ('removal', prev_ok, last_ok)
    | ('none', None, None).

    Deletion candidate = the newest capture is 4xx after the page had been OK;
    the claim "gone" is only made after a live recheck (live.py). Removal = the
    two most recent OK captures differ in content digest. Redirects and server
    errors yield no finding.
    """
    if len(caps) < 2:
        return (NONE, None, None)
    ok = [c for c in caps if _is_ok(c.status)]
    newest = caps[-1]
    if _is_candidate(newest.status) and ok:
        return (DELETION_CANDIDATE, ok[-1], newest)
    if len(ok) >= 2 and ok[-1].digest != ok[-2].digest:
        return (REMOVAL, ok[-2], ok[-1])
    return (NONE, None, None)
