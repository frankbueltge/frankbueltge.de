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


def classify(caps: list[Capture]) -> tuple[str, Capture | None, Capture | None]:
    """('deletion', last_ok, dead) | ('removal', prev_ok, last_ok) | ('none', None, None)."""
    if len(caps) < 2:
        return ("none", None, None)
    newest = caps[-1]
    if not _is_ok(newest.status):
        last_ok = next((c for c in reversed(caps[:-1]) if _is_ok(c.status)), None)
        if last_ok is not None:
            return ("deletion", last_ok, newest)
        return ("none", None, None)
    ok = [c for c in caps if _is_ok(c.status)]
    if len(ok) >= 2 and ok[-1].digest != ok[-2].digest:
        return ("removal", ok[-2], ok[-1])
    return ("none", None, None)
