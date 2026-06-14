"""Themenquelle: Wikipedias eigene Kategorien umstrittener Orte (Souveränitäts-/Territorial-
streitigkeiten). Die Kategorisierung ist die Kuration — niemand wählt per Thema aus."""
from __future__ import annotations

import time
from urllib.parse import quote
from typing import Any

import httpx

from protokoll.fetch import fetch
from protokoll.parallaxe import LANGS, MIN_LANGS, SOURCE_CATEGORIES, TOPIC_CAP

API = "https://en.wikipedia.org/w/api.php"
THROTTLE_S = 0.25
CANDIDATE_POOL = 200


def category_members(client: httpx.Client, category: str) -> list[str]:
    """Artikel-Mitglieder (cmtype=page) einer Wikipedia-Kategorie."""
    url = (f"{API}?action=query&list=categorymembers&cmtitle=Category:{quote(category)}"
           f"&cmlimit=500&cmtype=page&format=json")
    data = fetch(url, client=client, expect="json")
    return [m["title"] for m in data.get("query", {}).get("categorymembers", [])]


def controversial_titles(client: httpx.Client) -> list[str]:
    """Vereinigung der Artikel aus allen Quell-Kategorien (dedupliziert, stabil sortiert)."""
    seen: dict[str, None] = {}
    for cat in SOURCE_CATEGORIES:
        for title in category_members(client, cat):
            seen.setdefault(title, None)
        time.sleep(THROTTLE_S)
    return sorted(seen)


def langlinks(client: httpx.Client, en_title: str) -> dict[str, str]:
    """Sprachversionen eines en-Artikels, gefiltert auf die Zielsprachen (en immer dabei)."""
    url = (f"{API}?action=query&prop=langlinks&titles={quote(en_title)}"
           f"&lllimit=500&format=json")
    data = fetch(url, client=client, expect="json")
    out: dict[str, str] = {"en": en_title}
    pages = data.get("query", {}).get("pages", {})
    for page in pages.values():
        for ll in page.get("langlinks", []):
            lang = ll.get("lang")
            if lang in LANGS:
                out[lang] = ll["*"]
    return out


def protection_status(client: httpx.Client, en_title: str) -> str:
    """Schutzstatus als Konfliktbeleg, z. B. 'edit:autoconfirmed'; '—' wenn ungeschützt."""
    url = (f"{API}?action=query&prop=info&inprop=protection"
           f"&titles={quote(en_title)}&format=json")
    try:
        data = fetch(url, client=client, expect="json")
        pages = data.get("query", {}).get("pages", {})
        for page in pages.values():
            for p in page.get("protection", []):
                ptype = p.get("type")
                level = p.get("level")
                if ptype and level:
                    return f"{ptype}:{level}"
    except Exception:
        return "—"
    return "—"


def rank_topics(client: httpx.Client, titles: list[str]) -> list[dict[str, Any]]:
    """Je en-Titel die Sprachversionen holen, auf >= MIN_LANGS filtern, nach Sprachzahl
    absteigend sortieren (Tie-Break: en_title aufsteigend), die ersten TOPIC_CAP nehmen."""
    # Stichprobe quer durch die (alphabetische) Liste statt der ersten N Einträge.
    step = max(1, len(titles) // CANDIDATE_POOL)
    candidates = titles[::step][:CANDIDATE_POOL]
    ranked: list[dict[str, Any]] = []
    for en_title in candidates:
        titles_map = langlinks(client, en_title)
        time.sleep(THROTTLE_S)
        if len(titles_map) < MIN_LANGS:
            continue
        ranked.append({
            "en_title": en_title,
            "titles": titles_map,
            "lang_count": len(titles_map),
        })
    ranked.sort(key=lambda t: (-t["lang_count"], t["en_title"]))
    return ranked[:TOPIC_CAP]
