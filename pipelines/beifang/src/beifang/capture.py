"""Playwright-Messung: eine URL, Pre-Consent (keinerlei Interaktion), volles Request-Protokoll.

Standard-Chromium-Profil wie ein realer Leser (Spec §4) — gemessen wird, was ein Leser
ausgeliefert bekommt. Blockade wird erkannt, nie umgangen (Spec §6).
"""
from __future__ import annotations

from dataclasses import dataclass
from urllib.parse import urlsplit

from beifang.model import Blocked

BLOCK_STATUSES = frozenset({401, 403, 429, 503})
CHALLENGE_MARKERS = ("just a moment", "attention required", "access denied",
                     "verify you are a human", "are you a robot", "captcha")


@dataclass(frozen=True)
class RawRequest:
    url: str
    host: str
    resource_type: str
    bytes: int | None


@dataclass(frozen=True)
class RawCookie:
    name: str
    domain: str


@dataclass(frozen=True)
class RawCapture:
    final_url: str
    http_status: int | None
    page_title: str
    requests: tuple[RawRequest, ...]
    cookies: tuple[RawCookie, ...]


def detect_blocked(http_status: int | None, page_title: str) -> Blocked | None:
    if http_status in BLOCK_STATUSES:
        return Blocked(type="http", marker=str(http_status))
    title = page_title.lower()
    for marker in CHALLENGE_MARKERS:
        if marker in title:
            return Blocked(type="challenge", marker=marker)
    return None


def capture_page(url: str, *, timeout_s: float = 60.0, settle_s: float = 8.0,
                 proxy: str | None = None) -> RawCapture:
    from playwright.sync_api import sync_playwright

    with sync_playwright() as pw:
        launch_kwargs = {"proxy": {"server": proxy}} if proxy else {}
        browser = pw.chromium.launch(**launch_kwargs)
        context = browser.new_context()
        page = context.new_page()
        responses: list = []
        # Lambda statt responses.append: Playwright kann Attribute nur auf normalen Python-
        # Funktionen zwischenspeichern, nicht auf builtin_function_or_method-Objekten.
        page.on("response", lambda resp: responses.append(resp))  # im Handler keine API-Aufrufe (sync-API-Regel)

        status: int | None = None
        try:
            main = page.goto(url, timeout=timeout_s * 1000, wait_until="load")
            status = main.status if main else None
        except Exception:
            pass  # Timeout/Abbruch: was bis hier lief, wird trotzdem protokolliert
        page.wait_for_timeout(settle_s * 1000)

        reqs: list[RawRequest] = []
        for resp in responses:
            try:
                size = len(resp.body())
            except Exception:
                size = None  # Redirects/abgebrochene Responses haben keinen Body
            req_url = resp.request.url
            reqs.append(RawRequest(url=req_url, host=urlsplit(req_url).hostname or "",
                                   resource_type=resp.request.resource_type, bytes=size))
        try:
            title = page.title()
        except Exception:
            title = ""
        final_url = page.url
        cookies = tuple(RawCookie(name=c["name"], domain=c["domain"].lstrip("."))
                        for c in context.cookies())
        browser.close()
    return RawCapture(final_url=final_url, http_status=status, page_title=title,
                      requests=tuple(reqs), cookies=cookies)
