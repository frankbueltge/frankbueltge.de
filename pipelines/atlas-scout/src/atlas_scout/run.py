"""Lauf des Atlas-Scouts. Ernten → abgleichen → prüfen → bewerten → vorlegen.

Der Scout schreibt ausschließlich nach `kandidaten/`. In `atlas.json` und `werke.json`
schreibt er nicht — die Aufnahme bleibt der bestehende Vorgang.

    python -m atlas_scout.run --atlas theorie --anzahl 10
    python -m atlas_scout.run --atlas werke  --anzahl 10 --versatz 20
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx

from . import atlas as atlas_modul
from . import themen
from .model import (
    ATLAS_THEORIE,
    ATLAS_WERKE,
    SCHEMA_VERSION,
    Ausfall,
    Herkunft,
    Kandidat,
    Lauf,
    Verworfen,
)
from .score import SCHWELLE, gewichte, sammle_signale
from .sources import artbase, dataphys, openalex
from .verify import KOPF, jetzt, pruefe

AUSGABE = Path("pipelines/atlas-scout/kandidaten")


def _saatgut(stand: atlas_modul.AtlasStand, anzahl: int, versatz: int) -> list[atlas_modul.Eintrag]:
    """Deterministische Rotation durch den Atlas — über die Nächte wird er einmal umrundet."""
    gesamt = len(stand.eintraege)
    if gesamt == 0:
        return []
    return [stand.eintraege[(versatz + i) % gesamt] for i in range(min(anzahl, gesamt))]


def _ist_bekannt(rohfund: dict, stand: atlas_modul.AtlasStand) -> str | None:
    """Gibt den Grund zurück, wenn der Fund schon im Atlas steht — sonst None."""
    if rohfund.get("doi") and atlas_modul.normiere_doi(rohfund["doi"]) in stand.bekannte_dois:
        return "DOI bereits im Atlas"
    if atlas_modul.normiere_url(rohfund.get("url")) in stand.bekannte_urls:
        return "URL bereits im Atlas"
    if atlas_modul.normiere_titel(rohfund.get("titel")) in stand.bekannte_titel:
        return "Titel bereits im Atlas"
    return None


def _thema_als_saat(nummer: int) -> atlas_modul.Eintrag:
    """Ein thematisches Feld als Pseudo-Saatgut, damit die Bewertung unverändert greift."""
    thema = themen.hole(nummer)
    return atlas_modul.Eintrag(
        id=f"thema-{thema.nummer}-{atlas_modul.slugifiziere(thema.name)}",
        titel=thema.name,
        urheber="",
        jahr=None,
        url=None,
        doi=None,
        schlagworte=thema.schlagworte,
    )


SAAT_LISTE = atlas_modul.Eintrag(
    id="dataphys-liste", titel="", urheber="", jahr=None, url=None, doi=None, schlagworte=(),
)


def laufe(
    atlas_name: str,
    anzahl: int,
    versatz: int,
    wurzel: Path | None = None,
    thema: int | None = None,
    quelle_name: str = "auto",
) -> Lauf:
    begonnen = jetzt()
    wurzel = wurzel or Path.cwd()
    stand = atlas_modul.lade(atlas_name, wurzel)
    dataphys_modus = atlas_name == ATLAS_WERKE and quelle_name == "dataphys"

    if thema is not None:
        # Thematischer Sweep: für ein neues Feld gibt es noch keine Einträge,
        # von denen aus zu gehen wäre.
        saatgut = [_thema_als_saat(thema)]
    elif dataphys_modus:
        saatgut = [SAAT_LISTE]
    else:
        saatgut = _saatgut(stand, anzahl, versatz)
    jahr_jetzt = datetime.now(timezone.utc).year

    kandidaten: list[Kandidat] = []
    verworfen: list[Verworfen] = []
    ausfaelle: list[Ausfall] = []
    gesehen: set[str] = set()

    with httpx.Client(follow_redirects=True, headers=KOPF) as client:
        for saat in saatgut:
            try:
                if dataphys_modus:
                    # Datenphysikalisierung: Feld 13. Ohne Urheber — der steht nur in
                    # der Prosa, und Raten wäre Fehlzuschreibung (siehe dataphys.py).
                    rohfunde = dataphys.ernte(grenze=anzahl)
                    quelle = "dataphys"
                elif thema is not None and atlas_name == ATLAS_WERKE:
                    # Werke zu einem Feld: ArtBase ist kuratiert und strukturiert —
                    # Titel, Urheber und Jahr kommen fertig, kein Modell nötig.
                    rohfunde = artbase.ernte(themen.hole(thema).werk_marker)
                    quelle = "artbase"
                elif thema is not None:
                    rohfunde = openalex.ernte_thema(themen.hole(thema).literatur)
                    quelle = "openalex"
                elif atlas_name == ATLAS_THEORIE:
                    rohfunde = openalex.ernte(saat.titel, saat.doi, saat.urheber)
                    quelle = "openalex"
            except (openalex.QuellenAusfall, artbase.QuellenAusfall,
                    dataphys.QuellenAusfall) as fehler:
                ausfaelle.append(Ausfall(quelle=atlas_name, ausgehend_von=saat.id, vermerk=str(fehler)))
                continue

            for rohfund in rohfunde:
                herkunft = Herkunft(
                    quelle=quelle,
                    abfrage=rohfund.get("abfrage", ""),
                    ausgehend_von=saat.id,
                    abgerufen_am=jetzt(),
                )

                schluessel = atlas_modul.normiere_url(rohfund.get("url"))
                if schluessel in gesehen:
                    continue
                gesehen.add(schluessel)

                bekannt = _ist_bekannt(rohfund, stand)
                if bekannt:
                    verworfen.append(Verworfen(
                        titel=rohfund.get("titel", ""), grund="bereits-im-atlas",
                        detail=bekannt, herkunft=herkunft,
                    ))
                    continue

                signale = sammle_signale(rohfund, saat, jahr_jetzt)
                punkte, begruendung = gewichte(signale)
                if punkte < SCHWELLE:
                    verworfen.append(Verworfen(
                        titel=rohfund.get("titel", ""), grund="unter-schwelle",
                        detail=f"{punkte:.3f} < {SCHWELLE}", herkunft=herkunft,
                    ))
                    continue

                # Erst jetzt prüfen: die Netzprüfung ist der teure Schritt.
                befund = pruefe(rohfund["url"], client)
                if not befund.aufgeloest:
                    verworfen.append(Verworfen(
                        titel=rohfund.get("titel", ""), grund="identifier-nicht-aufloesbar",
                        detail=befund.vermerk, herkunft=herkunft,
                    ))
                    continue

                kandidaten.append(Kandidat(
                    atlas=atlas_name,
                    vorschlags_id=atlas_modul.slugifiziere(
                        rohfund.get("urheber", "").split(",")[0], rohfund.get("titel", "")
                    ),
                    titel=rohfund.get("titel", ""),
                    urheber=rohfund.get("urheber", ""),
                    jahr=rohfund.get("jahr"),
                    url=rohfund["url"],
                    doi=rohfund.get("doi"),
                    herkunft=herkunft,
                    pruefung=befund,
                    punkte=punkte,
                    punkte_begruendung=begruendung,
                    notiz=(rohfund.get("signale", {}).get("schnipsel")
                           or rohfund.get("signale", {}).get("beschreibung") or None),
                ))

    kandidaten.sort(key=lambda k: -k.punkte)
    return Lauf(
        schema_version=SCHEMA_VERSION,
        atlas=atlas_name,
        gestartet_am=begonnen,
        beendet_am=jetzt(),
        atlas_sha256=stand.sha256,
        atlas_eintraege=len(stand.eintraege),
        saatgut=tuple(s.id for s in saatgut),
        kandidaten=tuple(kandidaten),
        verworfen=tuple(verworfen),
        ausfaelle=tuple(ausfaelle),
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Atlas-Scout — legt Kandidaten vor, nimmt nicht auf.")
    parser.add_argument("--atlas", choices=[ATLAS_THEORIE, ATLAS_WERKE], required=True)
    parser.add_argument("--anzahl", type=int, default=10, help="Saatgut-Einträge pro Lauf")
    parser.add_argument("--versatz", type=int, default=0, help="Startversatz für die Rotation")
    parser.add_argument(
        "--thema", type=int, default=None,
        help=f"thematischer Sweep statt Nachbarschaft; neue Felder: {list(themen.NEUE_FELDER)}",
    )
    parser.add_argument(
        "--quelle", choices=["auto", "artbase", "dataphys"], default="auto",
        help="Quelle für den Werke-Atlas (Vorgabe: artbase über --thema)",
    )
    parser.add_argument("--trocken", action="store_true", help="nur ausgeben, nichts schreiben")
    args = parser.parse_args(argv)

    if args.thema is not None:
        thema = themen.hole(args.thema)  # wirft früh, wenn es das Feld nicht gibt
        print(f"Thematischer Sweep: Feld {thema.nummer} — {thema.name} ({thema.familie})")

    lauf = laufe(
        args.atlas, args.anzahl, args.versatz, thema=args.thema, quelle_name=args.quelle
    )

    print(f"Atlas {lauf.atlas}: {lauf.atlas_eintraege} Einträge, Saatgut {len(lauf.saatgut)}")
    print(f"  Kandidaten: {len(lauf.kandidaten)}")
    print(f"  verworfen:  {len(lauf.verworfen)}")
    print(f"  Ausfälle:   {len(lauf.ausfaelle)}")
    for k in lauf.kandidaten[:10]:
        jahr = k.jahr or "o. J."
        print(f"    {k.punkte:.3f}  {k.urheber[:28]:28}  {k.titel[:56]}  ({jahr})")

    if args.trocken:
        return 0

    ziel = AUSGABE / lauf.atlas
    ziel.mkdir(parents=True, exist_ok=True)
    # Thematische Sweeps bekommen einen eigenen Dateinamen, damit sie den
    # Nachbarschaftslauf desselben Tages nicht überschreiben.
    marke = f"-feld-{args.thema}" if args.thema is not None else ""
    datei = ziel / f"{datetime.now(timezone.utc):%Y-%m-%d}{marke}.json"
    datei.write_text(lauf.als_json(), encoding="utf-8")
    print(f"\ngeschrieben: {datei}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
