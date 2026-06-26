"""GFW Events API client (AIS gap events). Bearer token; the token never leaks
into an error string."""
from __future__ import annotations

import time

import httpx

EVENTS = "https://gateway.api.globalfishingwatch.org/v3/events"
DATASET = "public-global-gaps-events:latest"
RETRY_DELAYS = (1.0, 2.0, 4.0)
TIMEOUT = 60.0


class SourceUnavailable(Exception):
    pass


def _page(token: str, *, client: httpx.Client, start: str, end: str,
          limit: int, offset: int) -> dict:
    params = {
        "datasets[0]": DATASET,
        "start-date": start,
        "end-date": end,
        "limit": str(limit),
        "offset": str(offset),
    }
    r = client.get(EVENTS, params=params,
                   headers={"Authorization": f"Bearer {token}"},
                   timeout=TIMEOUT, follow_redirects=True)
    r.raise_for_status()
    return r.json()


def fetch_gaps(token: str, *, client: httpx.Client, start: str, end: str,
               cap: int = 1500, page: int = 100) -> tuple[list[dict], int]:
    """Page /v3/events for gap events; return (events[:cap], total). Raises
    SourceUnavailable on HTTP failure (without exposing the token)."""
    events: list[dict] = []
    total = 0
    offset = 0
    while len(events) < cap:
        want = min(page, cap - len(events))
        data: dict | None = None
        last: Exception | None = None
        for delay in (0.0, *RETRY_DELAYS):
            if delay:
                time.sleep(delay)
            try:
                data = _page(token, client=client, start=start, end=end,
                             limit=want, offset=offset)
                break
            except httpx.HTTPError as exc:
                last = exc
        if data is None:
            raise SourceUnavailable(f"GFW events unavailable: {type(last).__name__}")
        total = int(data.get("total", total) or 0)
        entries = data.get("entries") or []
        if not entries:
            break
        events.extend(entries)
        offset += len(entries)
        if len(entries) < want:
            break
    return events[:cap], total
