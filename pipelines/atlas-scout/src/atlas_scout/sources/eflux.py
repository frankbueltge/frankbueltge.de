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


# Der Meldungsstrom ist ein Feuerwehrschlauch: Von sechs zufälligen Meldungen enthielt
# am 2026-07-25 keine ein Werk für den Atlas (Fotografie, Sammlungsjubiläum, zwei
# Kuratoren-Ernennungen, Guss-Skulptur). e-flux filtert nicht serverseitig — `?search=`
# liefert unabhängig von der Abfrage dieselben 15 Meldungen. Also filtern wir davor,
# damit der teure Schritt nur sieht, was überhaupt in Frage kommt.
MARKER = (
    "data", "dataset", "algorithm", "artificial intelligence", " ai ", " ai,", " ai.",
    "machine learning", "neural", "computation", "computational", "software",
    "simulation", "generative", "archive", "sensor", "satellite", "surveillance",
    "database", "network", "digital", "code", "sonification", "visualisation",
    "visualization", "model", "internet", "platform", "automation", "robot",
)
MINDESTTREFFER = 3


def ist_aussichtsreich(text: str, mindesttreffer: int = MINDESTTREFFER) -> bool:
    """Grobe Vorauswahl vor dem Modellschritt.

    Bewusst großzügig: Der Filter soll offensichtlich Unpassendes aussortieren, nicht
    entscheiden. Was hier durchfällt, sieht kein Modell — ein zu enger Filter wäre
    deshalb teurer als ein zu weiter.
    """
    klein = text.lower()
    return sum(1 for m in MARKER if m in klein) >= mindesttreffer


def meldungs_pfade(html: str) -> list[str]:
    """Die Einzelmeldungen einer Listenseite, Reihenfolge erhalten, ohne Dubletten."""
    return list(dict.fromkeys(MELDUNG.findall(html)))


def hole_meldungen(
    *, seiten: int = 1, grenze: int = 20, filtern: bool = True
) -> list[dict]:
    """Meldungen mit Fließtext. Ein Eintrag: {"url", "text"}.

    `seiten` blättert die Übersicht durch, `grenze` deckelt die **durchgelassenen**
    Meldungen — der teure Teil ist nicht das Holen, sondern die Extraktion danach.
    `filtern=False` schaltet die Vorauswahl ab (zum Nachmessen ihrer Trefferquote).
    """
    meldungen: list[dict] = []
    gesehen = 0
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
                gesehen += 1
                if filtern and not ist_aussichtsreich(text):
                    continue
                meldungen.append({"url": BASIS + pfad, "text": text, "gesehen": gesehen})
    return meldungen
