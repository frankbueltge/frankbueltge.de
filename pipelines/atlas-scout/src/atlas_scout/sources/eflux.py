"""Werke-Atlas: Ausstellungsmeldungen von e-flux.

Für zeitgenössische Datenkunst gibt es keine strukturierte Werkdatenbank (gemessen
2026-07-25: Wikidata 1 von 25, Rhizome nur Netzkunst der 1999er–2010er, Ars Electronica
und STARTS JS-gerendert). Was es gibt, sind Ausstellungsmeldungen — e-flux liefert sie
server-gerendert und paginiert, mit rund 3.700 Zeichen Fließtext je Meldung.

Dieses Modul holt nur. Es entscheidet nicht, ob eine Meldung Datenkunst betrifft, und es
liest keine Werke heraus — das tut `extract.py` mit einem Modell. Die Trennung ist
Absicht: Was ohne Modell geht, geht ohne Modell.
"""
from __future__ import annotations

import re

import httpx

BASIS = "https://www.e-flux.com"
LISTE = f"{BASIS}/announcements/"
KOPF = {"User-Agent": "atlas-scout/0.1 (https://frankbueltge.de; f.bueltge@gmail.com)"}
ZEITLIMIT = httpx.Timeout(30.0, connect=10.0)

# Meldungs-URLs haben die Form /announcements/<id>/<slug>
MELDUNG = re.compile(r'href="(/announcements/\d+/[^"#?]+)"')
ARTIKEL = re.compile(r"<article.*?</article>", re.S)
TAGS = re.compile(r"<[^>]+>")
LEERRAUM = re.compile(r"\s+")


class QuellenAusfall(RuntimeError):
    """Die Quelle war nicht erreichbar oder antwortete unbrauchbar."""


def _hole(client: httpx.Client, url: str) -> str:
    try:
        antwort = client.get(url, timeout=ZEITLIMIT)
    except httpx.HTTPError as fehler:
        raise QuellenAusfall(f"Netzfehler: {type(fehler).__name__}") from fehler
    if antwort.status_code != 200:
        raise QuellenAusfall(f"HTTP {antwort.status_code}")
    return antwort.text


def artikeltext(html: str) -> str:
    """Fließtext aus einer Meldungsseite. Ohne <article> bleibt das Ergebnis leer."""
    treffer = ARTIKEL.search(html)
    if not treffer:
        return ""
    return LEERRAUM.sub(" ", TAGS.sub(" ", treffer.group())).strip()


def meldungs_pfade(html: str) -> list[str]:
    """Die Einzelmeldungen einer Listenseite, Reihenfolge erhalten, ohne Dubletten."""
    return list(dict.fromkeys(MELDUNG.findall(html)))


def hole_meldungen(*, seiten: int = 1, grenze: int = 20) -> list[dict]:
    """Meldungen mit Fließtext. Ein Eintrag: {"url", "text"}.

    `seiten` blättert die Übersicht durch, `grenze` deckelt die Gesamtzahl — der teure
    Teil ist nicht das Holen, sondern die Modell-Extraktion danach.
    """
    meldungen: list[dict] = []
    with httpx.Client(follow_redirects=True, headers=KOPF) as client:
        for seite in range(1, seiten + 1):
            url = LISTE if seite == 1 else f"{LISTE}page/{seite}/"
            try:
                uebersicht = _hole(client, url)
            except QuellenAusfall:
                break  # Ende der Paginierung oder Ausfall — was da ist, wird verarbeitet

            for pfad in meldungs_pfade(uebersicht):
                if len(meldungen) >= grenze:
                    return meldungen
                try:
                    seiten_html = _hole(client, BASIS + pfad)
                except QuellenAusfall:
                    continue  # eine einzelne Meldung darf fehlen
                text = artikeltext(seiten_html)
                if len(text) < 200:
                    continue  # zu dünn, um etwas herauszulesen
                meldungen.append({"url": BASIS + pfad, "text": text})
    return meldungen
