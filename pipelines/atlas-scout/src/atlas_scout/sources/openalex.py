"""Theorie-Atlas: Zitationsnachbarschaft über OpenAlex.

OpenAlex ist schlüsselfrei. Für den „polite pool" (schnellere, stabilere Antworten) hängt
die API eine Kontaktadresse an — konfigurierbar über ATLAS_SCOUT_MAILTO.

Zwei Nachbarschaften pro Saatgut-Eintrag:
  - `cited_by`  — wer den Eintrag zitiert (die Fortsetzung der Debatte)
  - `related`   — was OpenAlex als konzeptnah führt (der Seitenblick)
Was der Eintrag selbst zitiert, holen wir bewusst nicht: das ist die Vergangenheit des
Textes und im Atlas erfahrungsgemäß schon abgedeckt.
"""
from __future__ import annotations

import os

import httpx

BASIS = "https://api.openalex.org/works"
MAILTO = os.environ.get("ATLAS_SCOUT_MAILTO", "f.bueltge@gmail.com")
ZEITLIMIT = httpx.Timeout(20.0, connect=10.0)


class QuellenAusfall(RuntimeError):
    """Die Quelle war nicht erreichbar oder antwortete unbrauchbar."""


def _hole(client: httpx.Client, url: str, params: dict) -> dict:
    params = {**params, "mailto": MAILTO}
    try:
        antwort = client.get(url, params=params, timeout=ZEITLIMIT)
    except httpx.HTTPError as fehler:
        # Keine URL in die Meldung: Vermerke landen im öffentlichen Archiv.
        raise QuellenAusfall(f"Netzfehler: {type(fehler).__name__}") from fehler
    if antwort.status_code != 200:
        raise QuellenAusfall(f"HTTP {antwort.status_code}")
    return antwort.json()


def _als_rohfund(werk: dict, abfrage: str) -> dict | None:
    titel = (werk.get("title") or "").strip()
    if not titel:
        return None

    doi = werk.get("doi")
    if doi:
        doi = doi.replace("https://doi.org/", "")

    # Bevorzugt eine frei zugängliche Fassung, sonst die DOI-Auflösung.
    ort = (werk.get("best_oa_location") or {}).get("landing_page_url")
    url = ort or (f"https://doi.org/{doi}" if doi else werk.get("id"))
    if not url:
        return None

    autoren = werk.get("authorships") or []
    urheber = ", ".join(
        (a.get("author") or {}).get("display_name", "") for a in autoren[:3]
    ).strip(", ")

    return {
        "titel": titel,
        "urheber": urheber or "unbekannt",
        "jahr": werk.get("publication_year"),
        "url": url,
        "doi": doi,
        "abfrage": abfrage,
        "signale": {
            "zitationen": werk.get("cited_by_count") or 0,
            "frei_zugaenglich": bool(ort),
            "typ": werk.get("type") or "",
            "begriffe": [
                (c.get("display_name") or "").lower()
                for c in (werk.get("concepts") or [])[:8]
            ],
        },
    }


def _namensteile(urheber: str) -> set[str]:
    """Nachnamen-Kandidaten aus dem Autorfeld — alles ab drei Buchstaben."""
    return {
        teil.lower()
        for teil in "".join(c if c.isalpha() or c.isspace() else " " for c in urheber).split()
        if len(teil) >= 3
    }


def _autor_passt(werk: dict, urheber: str) -> bool:
    """Prüft, ob der gefundene Treffer wirklich vom gesuchten Urheber stammt.

    Ohne diese Prüfung liefert die Titelsuche bei generischen Titeln („Experimental
    Systems") ein beliebiges fremdes Werk zurück — und dessen Zitationsnachbarschaft
    landet dann vollständig als Kandidaten im Atlas. Beobachtet am 2026-07-25:
    Schwabs „Experimental Systems" traf ein erdwissenschaftliches Paper, worauf der
    Lauf Meteorologie-Datensätze vorschlug.
    """
    gesucht = _namensteile(urheber)
    if not gesucht:
        return True  # kein Autorfeld im Atlas — nichts zu prüfen
    vorhanden = " ".join(
        (a.get("author") or {}).get("display_name", "") for a in (werk.get("authorships") or [])
    ).lower()
    return any(teil in vorhanden for teil in gesucht)


def _finde_werk(
    client: httpx.Client, titel: str, doi: str | None, urheber: str
) -> dict | None:
    """Löst einen Atlas-Eintrag auf ein OpenAlex-Werk auf — erst über DOI, dann über den Titel.

    Der DOI-Treffer gilt als sicher. Der Titeltreffer muss zusätzlich im Autor passen,
    sonst wird er verworfen: ein falsch aufgelöstes Saatgut ist schlimmer als keines.
    """
    if doi:
        daten = _hole(client, BASIS, {"filter": f"doi:{doi}", "per-page": 1})
        treffer = daten.get("results") or []
        if treffer:
            return treffer[0]

    daten = _hole(client, BASIS, {"search": titel, "per-page": 5})
    for kandidat in daten.get("results") or []:
        if _autor_passt(kandidat, urheber):
            return kandidat
    return None


# Ohne Domänenschranke ist der thematische Sweep unbrauchbar: OpenAlex' Volltextsuche
# trifft bei „error" Genom-Assemblies und RMSE-Metriken (beobachtet 2026-07-25). Die
# Suche läuft deshalb nur in Arts & Humanities (12) und Social Sciences (33) und nur
# über Titel und Abstract, nicht über den Volltext.
FELDER_GEISTESWISSENSCHAFT = "fields/12|fields/33"
WERKTYPEN = "article|book|book-chapter|review"


def ernte_thema(
    abfragen: tuple[str, ...], *, jahr_ab: int = 2015, grenze: int = 20
) -> list[dict]:
    """Rohfunde zu einem thematischen Feld — ohne Saatgut-Eintrag.

    Die Nachbarschaftssuche wächst nur aus dem, was schon im Atlas steht, und kann darum
    per Konstruktion kein neues Feld eröffnen. Für die Felder 8–13 gibt es noch keine
    Einträge, von denen aus zu gehen wäre — hier wird direkt gesucht.

    `jahr_ab` schneidet die Vergangenheit ab: Ein neues Feld soll den laufenden Stand
    aufnehmen, nicht dessen gesamte Vorgeschichte auf einmal.
    """
    funde: list[dict] = []
    with httpx.Client(follow_redirects=True, headers={"User-Agent": "atlas-scout/0.1"}) as client:
        for abfrage in abfragen:
            try:
                daten = _hole(client, BASIS, {
                    "filter": ",".join((
                        f"title_and_abstract.search:{abfrage}",
                        f"primary_topic.field.id:{FELDER_GEISTESWISSENSCHAFT}",
                        f"type:{WERKTYPEN}",
                        f"from_publication_date:{jahr_ab}-01-01",
                    )),
                    "per-page": grenze,
                    "sort": "relevance_score:desc",
                })
            except QuellenAusfall:
                continue  # eine einzelne Abfrage darf ausfallen, das Feld bleibt bestellt
            for eintrag in daten.get("results") or []:
                fund = _als_rohfund(eintrag, f"thema:{abfrage}")
                if fund:
                    funde.append(fund)
    return funde


def ernte(titel: str, doi: str | None, urheber: str = "", *, grenze: int = 25) -> list[dict]:
    """Rohfunde aus der Zitationsnachbarschaft eines Atlas-Eintrags.

    Wirft QuellenAusfall, wenn die Quelle nicht erreichbar war. Findet OpenAlex den
    Ausgangstext nicht — oder nur unter fremdem Autor —, ist das kein Ausfall, sondern
    ein leeres Ergebnis.
    """
    funde: list[dict] = []
    with httpx.Client(follow_redirects=True, headers={"User-Agent": "atlas-scout/0.1"}) as client:
        werk = _finde_werk(client, titel, doi, urheber)
        if not werk:
            return []

        werk_id = (werk.get("id") or "").rsplit("/", 1)[-1]
        if not werk_id:
            return []

        zitierend = _hole(
            client,
            BASIS,
            {"filter": f"cites:{werk_id}", "per-page": grenze, "sort": "cited_by_count:desc"},
        )
        for eintrag in zitierend.get("results") or []:
            fund = _als_rohfund(eintrag, f"cites:{werk_id}")
            if fund:
                funde.append(fund)

        for verwandt_id in (werk.get("related_works") or [])[:10]:
            kurz = verwandt_id.rsplit("/", 1)[-1]
            try:
                eintrag = _hole(client, f"{BASIS}/{kurz}", {})
            except QuellenAusfall:
                continue  # ein einzelnes verwandtes Werk darf fehlen
            fund = _als_rohfund(eintrag, f"related:{werk_id}")
            if fund:
                funde.append(fund)

    return funde
