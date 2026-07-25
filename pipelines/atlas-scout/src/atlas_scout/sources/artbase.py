"""Werke-Atlas: Rhizome ArtBase.

Die einzige strukturierte Werkdatenbank, die die Quellenmessung vom 2026-07-25
überstanden hat: 3.845 Einträge, Wikibase-gestützt, aktiv gepflegt, schlüsselfrei.
Anders als e-flux ist sie kein Meldungsstrom, sondern kuratierte Werkeinträge — es
braucht deshalb **kein Modell**, um daraus Kandidaten zu machen.

Abdeckungsgrenze, ehrlich benannt: ArtBase sammelt Netzkunst, Schwerpunkt 1999–2010er.
Für Felder wie 10 (Fehler & Rauschen) und 12 (Sprache & Generativität) ist das genau
richtig; für Werke der letzten fünf Jahre ist es die falsche Quelle.

Wikibase-Properties (2026-07-25 geprüft):
    P29 Künstler (Entität)   P26 Entstehung (Zeit)   P123 Beschreibung
    P49 Slug                 P3  ist ein            P126 Bild
"""
from __future__ import annotations

import httpx

API = "https://artbase.rhizome.org/api.php"
WIKI = "https://artbase.rhizome.org/wiki"
KOPF = {"User-Agent": "atlas-scout/0.1 (https://frankbueltge.de; f.bueltge@gmail.com)"}
ZEITLIMIT = httpx.Timeout(30.0, connect=10.0)

P_KUENSTLER = "P29"
P_ENTSTEHUNG = "P26"
P_IST_EIN = "P3"
# Die Volltextsuche trifft auch Personenseiten — ohne diese Schranke landeten Künstler
# als Werke im Vorschlag („Johnny Rogers", „Susan Collins", beobachtet 2026-07-25).
KLASSE_WERK = "Q5"      # artwork
KLASSE_PERSON = "Q6"    # Person


class QuellenAusfall(RuntimeError):
    """Die Quelle war nicht erreichbar oder antwortete unbrauchbar."""


def _hole(client: httpx.Client, params: dict) -> dict:
    try:
        antwort = client.get(API, params={**params, "format": "json"}, timeout=ZEITLIMIT)
    except httpx.HTTPError as fehler:
        raise QuellenAusfall(f"Netzfehler: {type(fehler).__name__}") from fehler
    if antwort.status_code != 200:
        raise QuellenAusfall(f"HTTP {antwort.status_code}")
    return antwort.json()


def _suche(client: httpx.Client, begriff: str, grenze: int) -> list[str]:
    """Q-IDs zu einem Suchbegriff, Hauptnamensraum."""
    daten = _hole(client, {
        "action": "query", "list": "search", "srsearch": begriff,
        "srnamespace": 0, "srlimit": grenze,
    })
    treffer = daten.get("query", {}).get("search", [])
    return [t["title"] for t in treffer if t.get("title", "").startswith("Q")]


def _entitaeten(client: httpx.Client, qids: list[str]) -> dict:
    """Entitäten in Portionen holen — die API nimmt höchstens 50 auf einmal."""
    gesammelt: dict = {}
    for i in range(0, len(qids), 50):
        daten = _hole(client, {
            "action": "wbgetentities", "ids": "|".join(qids[i:i + 50]), "languages": "en",
        })
        gesammelt.update(daten.get("entities", {}) or {})
    return gesammelt


def _wert(entitaet: dict, property_id: str):
    aussagen = (entitaet.get("claims") or {}).get(property_id) or []
    if not aussagen:
        return None
    return (aussagen[0].get("mainsnak") or {}).get("datavalue", {}).get("value")


def _label(entitaet: dict) -> str:
    return ((entitaet.get("labels") or {}).get("en") or {}).get("value") or ""


def _jahr(zeitwert) -> int | None:
    """Wikibase-Zeit: '+2005-01-01T00:00:00Z'."""
    if not isinstance(zeitwert, dict):
        return None
    roh = (zeitwert.get("time") or "").lstrip("+")
    try:
        return int(roh[:4])
    except ValueError:
        return None


def ernte(marker: tuple[str, ...], *, grenze: int = 12) -> list[dict]:
    """Rohfunde zu den Stichworten eines Feldes.

    Ohne Modell: ArtBase liefert Titel, Urheber und Jahr strukturiert. Die
    Beschreibung bleibt leer — sie steht in ArtBase als eigene Entität und wäre
    einen zweiten Auflösungsschritt wert, den der Kandidat nicht braucht.
    """
    funde: list[dict] = []
    gesehen: set[str] = set()

    with httpx.Client(follow_redirects=True, headers=KOPF) as client:
        for begriff in marker:
            try:
                qids = [q for q in _suche(client, begriff, grenze) if q not in gesehen]
            except QuellenAusfall:
                continue  # ein einzelner Begriff darf ausfallen
            if not qids:
                continue
            gesehen.update(qids)

            werke = _entitaeten(client, qids)
            kuenstler_ids = sorted({
                k["id"] for e in werke.values()
                if isinstance(k := _wert(e, P_KUENSTLER), dict) and "id" in k
            })
            kuenstler = _entitaeten(client, kuenstler_ids) if kuenstler_ids else {}

            for qid, eintrag in werke.items():
                klasse = _wert(eintrag, P_IST_EIN)
                if not isinstance(klasse, dict) or klasse.get("id") != KLASSE_WERK:
                    continue  # Person oder unklassifiziert — kein Werk
                titel = _label(eintrag)
                if not titel or titel.startswith("Q"):
                    continue  # unbeschriftete Entität
                k = _wert(eintrag, P_KUENSTLER)
                urheber = _label(kuenstler.get(k["id"], {})) if isinstance(k, dict) else ""

                funde.append({
                    "titel": titel,
                    "urheber": urheber or "unbekannt",
                    "jahr": _jahr(_wert(eintrag, P_ENTSTEHUNG)),
                    "url": f"{WIKI}/Item:{qid}",
                    "doi": None,
                    "abfrage": f"artbase:{begriff}",
                    "signale": {
                        "eigene_webseite": False,
                        "kuratiert": True,  # ArtBase ist eine kuratierte Sammlung
                        "begriffe": [begriff],
                    },
                })
    return funde
