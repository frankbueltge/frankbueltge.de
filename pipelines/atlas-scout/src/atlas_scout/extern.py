"""Einlass für Funde aus Quellen, die die Pipeline nicht selbst erreicht.

Tavily hängt am MCP-Anschluss und damit an einer laufenden Sitzung — der nächtliche
Actions-Lauf kann es nicht aufrufen. ArtBase deckt dafür nur bis etwa 2012 ab. Die
Gegenwart im Werke-Atlas füllt sich deshalb über diesen Weg: Wer suchen kann, schreibt
seine Funde in eine JSON-Datei, und hier durchlaufen sie unverändert Abgleich,
Identifier-Prüfung und Bewertung wie jeder andere Kandidat.

Eingabeform (Liste):
    [{"titel": "…", "urheber": "…", "jahr": 2025, "url": "https://…",
      "feld": 13, "notiz": "ein Satz aus der Quelle", "quelle": "tavily"}]

`jahr` darf null sein, dann fällt der Fund bei der Aufnahme durch — das ist gewollt.
`notiz` ist Quelltext, nie Umformulierung.

    python -m atlas_scout.extern funde.json
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx

from . import atlas as atlas_modul
from .model import ATLAS_WERKE, SCHEMA_VERSION, Herkunft, Kandidat, Lauf, Verworfen
from .run import AUSGABE, _thema_als_saat
from .score import SCHWELLE, gewichte, sammle_signale
from .themen import THEMEN
from .verify import KOPF, jetzt, pruefe


def laufe(funde: list[dict], wurzel: Path | None = None) -> Lauf:
    begonnen = jetzt()
    wurzel = wurzel or Path.cwd()
    stand = atlas_modul.lade(ATLAS_WERKE, wurzel)
    jahr_jetzt = datetime.now(timezone.utc).year

    kandidaten: list[Kandidat] = []
    verworfen: list[Verworfen] = []
    gesehen: set[str] = set()

    with httpx.Client(follow_redirects=True, headers=KOPF) as client:
        for fund in funde:
            feld = fund.get("feld")
            titel = (fund.get("titel") or "").strip()
            url = (fund.get("url") or "").strip()
            quelle = fund.get("quelle") or "extern"

            saat = _thema_als_saat(feld) if feld in THEMEN else _thema_als_saat(
                next(iter(THEMEN))
            )
            herkunft = Herkunft(
                quelle=quelle,
                abfrage=f"{quelle}:feld-{feld}",
                ausgehend_von=saat.id,
                abgerufen_am=jetzt(),
            )

            if not titel or not url:
                verworfen.append(Verworfen(titel=titel or "(ohne Titel)",
                                           grund="unvollstaendig",
                                           detail="Titel oder Identifier fehlt",
                                           herkunft=herkunft))
                continue
            if feld not in THEMEN:
                verworfen.append(Verworfen(titel=titel, grund="keine-feldzuordnung",
                                           detail=f"Feld {feld!r} gibt es nicht",
                                           herkunft=herkunft))
                continue

            schluessel = atlas_modul.normiere_url(url)
            if schluessel in gesehen:
                continue
            gesehen.add(schluessel)

            rohfund = {
                "titel": titel,
                "urheber": (fund.get("urheber") or "unbekannt").strip(),
                "jahr": fund.get("jahr"),
                "url": url,
                "doi": None,
                "abfrage": herkunft.abfrage,
                # Wie ArtBase eine kuratierte Quelle: die Auswahl hat schon jemand
                # getroffen, hier zählt nur die Vollständigkeit des Datensatzes.
                "signale": {
                    "kuratiert": True,
                    "eigene_webseite": True,
                    "schnipsel": (fund.get("notiz") or "").strip(),
                    "begriffe": list(THEMEN[feld].werk_marker),
                },
            }

            bekannt = None
            if atlas_modul.normiere_url(url) in stand.bekannte_urls:
                bekannt = "URL bereits im Atlas"
            elif atlas_modul.normiere_titel(titel) in stand.bekannte_titel:
                bekannt = "Titel bereits im Atlas"
            if bekannt:
                verworfen.append(Verworfen(titel=titel, grund="bereits-im-atlas",
                                           detail=bekannt, herkunft=herkunft))
                continue

            signale = sammle_signale(rohfund, saat, jahr_jetzt)
            punkte, begruendung = gewichte(signale)
            if punkte < SCHWELLE:
                verworfen.append(Verworfen(titel=titel, grund="unter-schwelle",
                                           detail=f"{punkte:.3f} < {SCHWELLE}",
                                           herkunft=herkunft))
                continue

            befund = pruefe(url, client)
            if not befund.aufgeloest:
                verworfen.append(Verworfen(titel=titel, grund="identifier-nicht-aufloesbar",
                                           detail=befund.vermerk, herkunft=herkunft))
                continue

            kandidaten.append(Kandidat(
                atlas=ATLAS_WERKE,
                vorschlags_id=atlas_modul.slugifiziere(rohfund["urheber"], titel),
                titel=titel,
                urheber=rohfund["urheber"],
                jahr=rohfund["jahr"],
                url=url,
                doi=None,
                herkunft=herkunft,
                pruefung=befund,
                punkte=punkte,
                punkte_begruendung=begruendung,
                notiz=rohfund["signale"]["schnipsel"] or None,
                zusatz={k: v for k, v in {
                    "venue_prize": (fund.get("ort") or "").strip(),
                    "medium_class": fund.get("medium_class"),
                    "form": fund.get("form"),
                }.items() if v},
            ))

    kandidaten.sort(key=lambda k: -k.punkte)
    return Lauf(
        schema_version=SCHEMA_VERSION,
        atlas=ATLAS_WERKE,
        gestartet_am=begonnen,
        beendet_am=jetzt(),
        atlas_sha256=stand.sha256,
        atlas_eintraege=len(stand.eintraege),
        saatgut=tuple(sorted({f"thema-{f.get('feld')}" for f in funde if f.get("feld")})),
        kandidaten=tuple(kandidaten),
        verworfen=tuple(verworfen),
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Externe Funde als Kandidaten einlesen.")
    parser.add_argument("datei", type=Path)
    parser.add_argument("--marke", default="extern", help="Namensteil der Kandidatendatei")
    args = parser.parse_args(argv)

    funde = json.loads(args.datei.read_text(encoding="utf-8"))
    lauf = laufe(funde)

    print(f"eingelesen: {len(funde)} · Kandidaten: {len(lauf.kandidaten)} · "
          f"verworfen: {len(lauf.verworfen)}")
    for v in lauf.verworfen:
        print(f"   – {v.grund}: {v.titel[:48]}")
    for k in lauf.kandidaten:
        print(f"   + [{k.herkunft.abfrage.split('-')[-1]:>2}] {k.jahr}  "
              f"{k.urheber[:22]:24} {k.titel[:40]}")

    ziel = AUSGABE / ATLAS_WERKE
    ziel.mkdir(parents=True, exist_ok=True)
    datei = ziel / f"{datetime.now(timezone.utc):%Y-%m-%d}-{args.marke}.json"
    datei.write_text(lauf.als_json(), encoding="utf-8")
    print(f"\ngeschrieben: {datei}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
