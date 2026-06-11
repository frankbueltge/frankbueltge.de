"""HTTP-Zugriff: 3x Retry mit Backoff. Danach SourceUnavailable → 'Feststellung entfällt'."""
from __future__ import annotations

import json
import time
from typing import Any, Literal

import httpx

RETRY_DELAYS = (1.0, 2.0, 4.0)
TIMEOUT = 30.0  # pro Versuch; Worst Case je URL: 4 Versuche × 30 s + 7 s Backoff


def _redacted(url: str) -> str:
    """Fehlermeldungen landen als Vermerk im öffentlichen Archiv — Query-Strings
    (api_key & Co.) dürfen dort nie auftauchen."""
    return url.split("?", 1)[0]


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
            if expect == "json":
                try:
                    return r.json()
                except json.JSONDecodeError as exc:
                    raise SourceUnavailable(f"{_redacted(url)}: JSON parse error: {exc}") from exc
            return r.text
        except httpx.HTTPError as exc:
            # 4xx ist kein transienter Fehler — sofort melden statt Retries verbrennen.
            if isinstance(exc, httpx.HTTPStatusError) and exc.response.status_code < 500:
                raise SourceUnavailable(f"{_redacted(url)}: HTTP {exc.response.status_code}") from exc
            last = exc
    raise SourceUnavailable(f"{_redacted(url)}: {type(last).__name__}: {last}")
