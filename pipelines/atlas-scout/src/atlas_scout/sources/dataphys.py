"""Werke-Atlas: dataphys.org — Liste physischer Visualisierungen.

Eine kuratierte Sammlung von 431 Einträgen zu Datenphysikalisierung, gefunden über eine
Tavily-Suche (2026-07-26) — der Suchdienst lieferte keine brauchbaren Werkangaben, aber
diese Quelle. Sie deckt genau die Felder ab, für die ArtBase zu alt und e-flux zu
unsortiert ist: 13 (Material & Sinne) und 8 (Wahrnehmung & Maßstab), mit 343 Einträgen
ab 1980.

Was strukturiert dasteht, wird strukturiert gelesen: URL, Jahr und Titel (im Format
„2025 – Mississippi Braille Map"), Kategorie als CSS-Klasse, Volltext im Listenblick.

**Der Urheber steht nur in der Prosa** („Anne Lacambre is the atlas editor …"), nicht als
Feld. Ihn per Heuristik zu erraten hieße, Fehlzuschreibungen zu erzeugen — der teuerste
Fehler in einem Atlas, der „nichts erfunden" verspricht. Dieser Adapter lässt den Urheber
deshalb **leer**. Die Aufnahmeschranke weist solche Kandidaten ab (`kein Urheber`); sie
warten, bis jemand die Prosa liest und den Namen einträgt. Eine sichtbare Lücke ist
besser als ein plausibler falscher Name.
"""
from __future__ import annotations

import html
import re

import httpx

LISTE = "https://dataphys.org/list/"
KOPF = {"User-Agent": "atlas-scout/0.1 (https://frankbueltge.de; f.bueltge@gmail.com)"}
ZEITLIMIT = httpx.Timeout(60.0, connect=15.0)

ARTIKEL = re.compile(r'<article[^>]*class="([^"]*)"[^>]*>(.*?)</article>', re.S)
TITEL = re.compile(r'class="post-title">(.*?)</h1>', re.S)
URL = re.compile(r'href="(https://dataphys\.org/list/[^"]+)"')
VOLLTEXT = re.compile(r'class="hidden full-text">(.*?)</div>', re.S)
KATEGORIE = re.compile(r"category-([a-z\-]+)")
TAGS = re.compile(r"<[^>]+>")

# „2025 – Mississippi Braille Map" bzw. „2600 BC – Quipus"
JAHR_TITEL = re.compile(r"^\s*(-?\d{1,4})\s*(BC|BCE)?\s*[–—-]\s*(.+)$", re.I)

# Kategorien, in denen künstlerische Arbeiten liegen. Messinstrumente und
# Ermöglichungstechnik gehören nicht in einen Werkatlas.
KATEGORIEN_WERK = frozenset({
    "passive-physical-visualization",
    "active-physical-visualization",
    "interactive-installation",
})
JAHR_AB = 1980  # davor sind es historische Artefakte, keine Werke der Datenkunst


class QuellenAusfall(RuntimeError):
    """Die Quelle war nicht erreichbar oder antwortete unbrauchbar."""


def _text(roh: str) -> str:
    """Tags weg, Entities auflösen, Leerraum normieren.

    Ohne unescape stehen Titel wie „Durrell Bishop&#39;s Marble Answering Machine"
    im Atlas — beobachtet 2026-07-26.
    """
    return re.sub(r"\s+", " ", html.unescape(TAGS.sub(" ", roh))).strip()


def zerlege_titel(roh: str) -> tuple[int | None, str]:
    """„2025 – Mississippi Braille Map" → (2025, 'Mississippi Braille Map')."""
    treffer = JAHR_TITEL.match(_text(roh))
    if not treffer:
        return None, _text(roh)
    jahr, vorzeit, titel = treffer.groups()
    if vorzeit:  # v. Chr. — fällt ohnehin durch JAHR_AB
        return -int(jahr), titel.strip()
    return int(jahr), titel.strip()


def ernte(*, jahr_ab: int = JAHR_AB, grenze: int = 60) -> list[dict]:
    """Rohfunde aus der Liste. Ein Fund trägt keinen Urheber — siehe Modulkopf."""
    try:
        with httpx.Client(follow_redirects=True, headers=KOPF) as client:
            antwort = client.get(LISTE, timeout=ZEITLIMIT)
    except httpx.HTTPError as fehler:
        raise QuellenAusfall(f"Netzfehler: {type(fehler).__name__}") from fehler
    if antwort.status_code != 200:
        raise QuellenAusfall(f"HTTP {antwort.status_code}")

    funde: list[dict] = []
    for klassen, block in ARTIKEL.findall(antwort.text):
        kategorien = set(KATEGORIE.findall(klassen))
        if not kategorien & KATEGORIEN_WERK:
            continue

        titel_roh = TITEL.search(block)
        url_roh = URL.search(block)
        if not titel_roh or not url_roh:
            continue

        jahr, titel = zerlege_titel(titel_roh.group(1))
        if jahr is None or jahr < jahr_ab or not titel:
            continue

        volltext = VOLLTEXT.search(block)
        funde.append({
            "titel": titel,
            # Bewusst leer: der Name steht nur in der Prosa. Wer ihn einträgt,
            # liest sie — geraten wird nicht.
            "urheber": "",
            "jahr": jahr,
            "url": url_roh.group(1),
            "doi": None,
            "abfrage": f"dataphys:{sorted(kategorien & KATEGORIEN_WERK)[0]}",
            "signale": {
                "kuratiert": True,
                "eigene_webseite": False,
                "schnipsel": _text(volltext.group(1))[:600] if volltext else "",
                "begriffe": sorted(kategorien),
            },
        })
        if len(funde) >= grenze:
            break
    return funde
