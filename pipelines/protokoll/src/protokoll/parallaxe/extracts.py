"""Einleitungstexte je Sprachversion (REST-Summary). Einzelne Sprachausfälle sind tolerierbar —
Gemini ist multilingual, kein Embedding/keine Übersetzung nötig."""
from __future__ import annotations

import time
from urllib.parse import quote

import httpx

from protokoll.fetch import SourceUnavailable, fetch

THROTTLE_S = 0.05


def summary_url(lang: str, title: str) -> str:
    return (f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/"
            f"{quote(title, safe='')}")


def fetch_intros(client: httpx.Client,
                 titles: dict[str, str]) -> tuple[dict[str, str], list[str]]:
    """Liefert ({lang: extract} für nicht-leere Extrakte, Liste ausgefallener Sprachen)."""
    intros: dict[str, str] = {}
    failed: list[str] = []
    for lang, title in sorted(titles.items()):
        try:
            data = fetch(summary_url(lang, title), client=client, expect="json")
            extract = data.get("extract")
            if extract:
                intros[lang] = extract
            else:
                failed.append(lang)
        except SourceUnavailable:
            failed.append(lang)
        time.sleep(THROTTLE_S)
    return intros, failed
