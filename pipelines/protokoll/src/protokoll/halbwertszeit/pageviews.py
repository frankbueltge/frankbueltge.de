"""Messgröße: tägliche Wikipedia-Aufrufe je Ereignis, summiert über Sprachversionen.
Wikimedia-REST-API, Agent 'user' (filtert Bots). Einzelne Sprachausfälle sind tolerierbar."""
from __future__ import annotations

import time
import urllib.parse

import httpx

from protokoll.fetch import SourceUnavailable, fetch

BASE = "https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article"
THROTTLE_S = 0.05


def article_url(lang: str, title: str, start: str, end: str) -> str:
    return (f"{BASE}/{lang}.wikipedia/all-access/user/"
            f"{urllib.parse.quote(title, safe='')}/daily/{start.replace('-', '')}/{end.replace('-', '')}")


def fetch_event_series(client: httpx.Client, titles: dict[str, str],
                       start: str, end: str) -> tuple[list[tuple[str, int]], list[str]]:
    """Summiert Tageswerte über alle Sprachen. Liefert (Serie, Liste ausgefallener Sprachen)."""
    daily: dict[str, int] = {}
    failed: list[str] = []
    for lang, title in sorted(titles.items()):
        try:
            data = fetch(article_url(lang, title, start, end), client=client, expect="json")
            for item in data.get("items", []):
                ts = item["timestamp"]
                day = f"{ts[:4]}-{ts[4:6]}-{ts[6:8]}"
                daily[day] = daily.get(day, 0) + int(item["views"])
        except SourceUnavailable:
            failed.append(lang)
        time.sleep(THROTTLE_S)
    return sorted(daily.items()), failed
