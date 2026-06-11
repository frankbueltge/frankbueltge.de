"""HTTP-Zugriff: 3x Retry mit Backoff. Danach SourceUnavailable → 'Feststellung entfällt'."""
from __future__ import annotations

import time
from typing import Any, Literal

import httpx

RETRY_DELAYS = (1.0, 2.0, 4.0)
TIMEOUT = 30.0


class SourceUnavailable(Exception):
    pass


def fetch(url: str, *, client: httpx.Client,
          expect: Literal["text", "json"] = "text") -> Any:
    last: Exception | None = None
    for delay in (0.0, *RETRY_DELAYS):
        if delay:
            time.sleep(delay)
        try:
            r = client.get(url, timeout=TIMEOUT, follow_redirects=True)
            r.raise_for_status()
            return r.json() if expect == "json" else r.text
        except httpx.HTTPError as exc:
            last = exc
    raise SourceUnavailable(f"{url}: {type(last).__name__}: {last}")
