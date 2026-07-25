"""Werke-Atlas: Urheber-Nachbarschaft über Wikidata.

Kunstwerke zitieren einander nicht — die Zitationslogik des Theorie-Atlas trägt hier nicht.
Belastbar und schlüsselfrei ist stattdessen die Ausweitung über die Urheber: zu jeder
Künstlerin im Atlas die übrigen erfassten Arbeiten finden.

Abdeckungsgrenze, ehrlich benannt: Wikidata erfasst Medienkunst lückenhaft. Der Adapter
findet, was erfasst ist — die Abwesenheit eines Werks ist hier kein Befund.
"""
from __future__ import annotations

import httpx

API = "https://www.wikidata.org/w/api.php"
SPARQL = "https://query.wikidata.org/sparql"
# Wikimedia weist Anfragen ohne Kontaktangabe im User-Agent mit HTTP 403 ab —
# URL *und* Adresse müssen drinstehen, sonst antwortet der SPARQL-Endpunkt nicht.
KOPF = {"User-Agent": "atlas-scout/0.1 (https://frankbueltge.de; f.bueltge@gmail.com)"}
ZEITLIMIT = httpx.Timeout(30.0, connect=10.0)

# Beschreibungen, die eine Person als kunstnah ausweisen — grober, aber wirksamer Filter
# gegen Namensgleichheit (der häufigste Fehlgriff bei wbsearchentities).
KUNST_MARKER = (
    "artist", "designer", "architect", "filmmaker", "composer", "photographer",
    "curator", "researcher", "collective", "studio", "musician", "writer",
    "programmer", "developer", "künstler",
)

ABFRAGE = """
SELECT ?werk ?werkLabel ?entstehung ?webseite WHERE {
  ?werk wdt:P170 wd:%s .
  OPTIONAL { ?werk wdt:P571 ?entstehung . }
  OPTIONAL { ?werk wdt:P856 ?webseite . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,de". }
}
LIMIT %d
"""


class QuellenAusfall(RuntimeError):
    """Die Quelle war nicht erreichbar oder antwortete unbrauchbar."""


def _finde_urheber(client: httpx.Client, name: str) -> tuple[str, str] | None:
    """Sucht die QID einer Urheberin. Gibt (QID, Beschreibung) zurück oder None."""
    try:
        antwort = client.get(
            API,
            params={
                "action": "wbsearchentities", "search": name, "language": "en",
                "format": "json", "type": "item", "limit": 5,
            },
            timeout=ZEITLIMIT,
        )
    except httpx.HTTPError as fehler:
        raise QuellenAusfall(f"Netzfehler: {type(fehler).__name__}") from fehler
    if antwort.status_code != 200:
        raise QuellenAusfall(f"HTTP {antwort.status_code}")

    for treffer in antwort.json().get("search") or []:
        beschreibung = (treffer.get("description") or "").lower()
        if any(marker in beschreibung for marker in KUNST_MARKER):
            return treffer["id"], beschreibung
    return None


def _jahr_aus(entstehung: str | None) -> int | None:
    if not entstehung or len(entstehung) < 4:
        return None
    try:
        return int(entstehung[:4].lstrip("+"))
    except ValueError:
        return None


def ernte(urheber: str, *, grenze: int = 40) -> list[dict]:
    """Rohfunde: die übrigen in Wikidata erfassten Arbeiten einer Urheberin."""
    funde: list[dict] = []
    with httpx.Client(follow_redirects=True, headers=KOPF) as client:
        gefunden = _finde_urheber(client, urheber)
        if not gefunden:
            return []
        qid, beschreibung = gefunden

        try:
            antwort = client.get(
                SPARQL,
                params={"query": ABFRAGE % (qid, grenze), "format": "json"},
                timeout=ZEITLIMIT,
            )
        except httpx.HTTPError as fehler:
            raise QuellenAusfall(f"Netzfehler: {type(fehler).__name__}") from fehler
        if antwort.status_code != 200:
            raise QuellenAusfall(f"HTTP {antwort.status_code}")

        for zeile in antwort.json().get("results", {}).get("bindings", []):
            titel = (zeile.get("werkLabel", {}).get("value") or "").strip()
            entity = zeile.get("werk", {}).get("value") or ""
            if not titel or titel.startswith("Q"):  # unbeschriftete Entität
                continue

            webseite = (zeile.get("webseite", {}) or {}).get("value")
            funde.append({
                "titel": titel,
                "urheber": urheber,
                "jahr": _jahr_aus((zeile.get("entstehung", {}) or {}).get("value")),
                "url": webseite or entity,
                "doi": None,
                "abfrage": f"P170:{qid}",
                "signale": {
                    "eigene_webseite": bool(webseite),
                    "urheber_beschreibung": beschreibung,
                    "wikidata_entity": entity,
                },
            })
    return funde
