"""Werke-Atlas: S+T+ARTS Prize (Ars Electronica) — die Gegenwartslücke.

ArtBase endet um 2012, dataphys ist historisch geprägt. Die Häuser mit den aktuellen
Arbeiten sind genau die JS-gerenderten, an denen ein einfacher HTTP-Abruf scheitert
(gemessen 2026-07-25: `httpx` sieht auf starts-prize.aec.at null Werklinks).

Tavilys Extract-Endpunkt rendert und liefert Markdown. Die Gewinnerseiten haben danach
eine feste Form, die sich **ohne Modell** lesen lässt:

    * ## [Titel](werkspezifische-URL)
      ## Urheber (LAND)
      Beschreibung

Das Jahr steht im Seitenpfad (`winners2025` → 2025), nicht im Eintrag — beim S+T+ARTS
Prize ist es das Auszeichnungsjahr, nicht zwingend das Entstehungsjahr. Das steht so im
`venue_prize`-Feld, damit die Angabe nicht mehr behauptet als sie trägt.

Braucht `TAVILY_API_KEY`. Ohne Schlüssel wirft der Adapter QuellenAusfall — der Lauf
vermerkt das und macht weiter, statt still nichts zu finden.
"""
from __future__ import annotations

import os
import re

import httpx

EXTRACT = "https://api.tavily.com/extract"
JAHRGANG = "https://ars.electronica.art/starts-prize/en/winners/winners{jahr}/"
ZEITLIMIT = httpx.Timeout(120.0, connect=20.0)

# * ## [Titel](URL)  /  ## Urheber (LAND)  /  Beschreibung
EINTRAG = re.compile(
    r"\*\s*##\s*\[(?P<titel>[^\]]+)\]\((?P<url>https?://[^)]+)\)\s*"
    r"##\s*(?P<urheber>[^\n]+?)\s*"
    r"\n\s*\n\s*(?P<beschreibung>[^\n]+)",
    re.S,
)
# Ländercodes stehen auch mitten im Namen, wenn mehrere Urheber genannt sind
# („Marina Otero Verzier (ES), Manuel …"), und nicht immer zweibuchstabig („(INT)").
LAND = re.compile(r"\s*\((?:[A-Z]{2,3}(?:/[A-Z]{2,3})*)\)")
# Tavily liefert Markdown — Unterstriche und Klammern sind escaped.
ESCAPE = re.compile(r"\\([_*\[\]()])")


class QuellenAusfall(RuntimeError):
    """Die Quelle war nicht erreichbar oder antwortete unbrauchbar."""


def _schluessel() -> str:
    key = os.environ.get("TAVILY_API_KEY", "").strip()
    if not key:
        # Kein Schlüssel im Klartext in der Meldung — Vermerke landen im Archiv.
        raise QuellenAusfall("TAVILY_API_KEY nicht gesetzt")
    return key


def _rendere(urls: list[str]) -> dict[str, str]:
    """Seiten über Tavily rendern lassen. Gibt {url: markdown} zurück."""
    try:
        antwort = httpx.post(
            EXTRACT,
            headers={"Authorization": f"Bearer {_schluessel()}"},
            json={"urls": urls, "extract_depth": "advanced"},
            timeout=ZEITLIMIT,
        )
    except httpx.HTTPError as fehler:
        raise QuellenAusfall(f"Netzfehler: {type(fehler).__name__}") from fehler
    if antwort.status_code != 200:
        raise QuellenAusfall(f"HTTP {antwort.status_code}")
    return {
        e.get("url", ""): e.get("raw_content") or ""
        for e in antwort.json().get("results") or []
    }


def entkleide(roh: str) -> str:
    """Markdown-Escapes auflösen: „00\\_To Create" → „00_To Create"."""
    return ESCAPE.sub(r"\1", roh).strip()


def zerlege_urheber(roh: str) -> str:
    """„Sarah Ciston (US)" → „Sarah Ciston". Das Land ist keine Namensangabe."""
    return LAND.sub("", entkleide(roh)).replace(" ,", ",").strip(" –—-:,")


def lies_jahrgang(markdown: str, jahr: int) -> list[dict]:
    """Werkeinträge einer Gewinnerseite. Deterministisch, kein Modell."""
    funde: list[dict] = []
    for treffer in EINTRAG.finditer(markdown):
        titel = entkleide(treffer.group("titel"))
        urheber = zerlege_urheber(treffer.group("urheber"))
        url = treffer.group("url").strip()
        if not titel or not urheber or "/winners/" in url:
            continue  # Navigationslink, kein Werk
        funde.append({
            "titel": titel,
            "urheber": urheber,
            # Das Jahr ist das Auszeichnungsjahr — so steht es auch im venue_prize.
            "jahr": jahr,
            "url": url,
            "doi": None,
            "abfrage": f"starts:{jahr}",
            "signale": {
                "kuratiert": True,      # Preisjury der Europäischen Kommission
                "eigene_webseite": True,
                "schnipsel": entkleide(treffer.group("beschreibung"))[:600],
                "begriffe": [],
                "auszeichnungsjahr": jahr,
            },
        })
    return funde


def ernte(*, jahre: tuple[int, ...] = (2026, 2025, 2024), grenze: int = 60) -> list[dict]:
    """Rohfunde aus den Gewinnerjahrgängen des S+T+ARTS Prize."""
    seiten = _rendere([JAHRGANG.format(jahr=j) for j in jahre])
    funde: list[dict] = []
    for url, markdown in seiten.items():
        treffer = re.search(r"winners(\d{4})", url)
        if not treffer or not markdown:
            continue
        funde.extend(lies_jahrgang(markdown, int(treffer.group(1))))
        if len(funde) >= grenze:
            break
    return funde[:grenze]
