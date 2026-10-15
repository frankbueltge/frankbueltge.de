"""HTTP access: one attempt plus three retries with backoff, then SourceUnavailable.

Copied from the Protokoll pipeline so every nightly in the house fails the same way:
4xx fails fast (except 429), 5xx retries, and no error message ever carries a query
string — notes land in the public archive."""
from __future__ import annotations

import json
import time
from typing import Any, Literal

import httpx

RETRY_DELAYS = (1.0, 2.0, 4.0)
TIMEOUT = 30.0  # per attempt; worst case per URL: 4 attempts × 30 s + 7 s backoff
USER_AGENT = "frankbueltge.de trending-pipeline (hello@frankbueltge.de)"


def _redacted(url: str) -> str:
    """Error messages become notes in the public archive — query strings (api keys and the
    like) must never appear there."""
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
            # 4xx is not transient — report at once instead of burning retries.
            # Exception: 429 (Too Many Requests) means "later" → retry with backoff.
            if (isinstance(exc, httpx.HTTPStatusError)
                    and exc.response.status_code < 500
                    and exc.response.status_code != 429):
                raise SourceUnavailable(f"{_redacted(url)}: HTTP {exc.response.status_code}") from exc
            last = exc
    # The exception message itself may carry the full URL (query included) — redact there too.
    raise SourceUnavailable(f"{_redacted(url)}: {type(last).__name__}: {_redacted(str(last))}")
