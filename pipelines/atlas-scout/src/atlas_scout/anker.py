"""Ankerwerke für die neuen Felder 8–13 — Bootstrap gegen den Kaltstart.

Das Problem: Die Extraktion lernt die Feldzuordnung aus Beispielen des Bestands. Der
Bestand kennt aber nur die Macht-Felder 1–7 (gemessen 2026-07-25: von 214 Werken passen
4 in die neuen Felder, die Felder 11–13 haben null). Ein Modell, das fünfzig Beispiele
für Macht sieht und keines für Wahrnehmung, wird die neuen Felder unterbelegen — die
Erweiterung bliebe Dekoration im Frontend.

Der Ausweg ist der übliche bei jeder neuen Kategorie: Ein Mensch setzt den Anker. Zwei
je Feld reichen, danach trägt sich die Klassifikation selbst.

Diese Liste ist **von Hand vorgeschlagen**, nicht maschinell gefunden — deshalb steht
`quelle: "hand"` in der Herkunft. Wie jeder andere Vorschlag durchläuft sie die
Identifier-Prüfung und wird nicht aufgenommen, sondern vorgelegt. Jahresangaben fehlen
absichtlich: Was nicht geprüft ist, wird nicht behauptet — die Aufnahme trägt sie nach.

    python -m atlas_scout.anker
"""
from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

import httpx

from .atlas import lade, normiere_titel, normiere_url, slugifiziere
from .model import ATLAS_WERKE, SCHEMA_VERSION, Herkunft, Kandidat, Lauf, Verworfen
from .run import AUSGABE
from .themen import hole
from .verify import KOPF, jetzt, pruefe

# (Feld, Urheber, Titel, Identifier)
ANKER: tuple[tuple[int, str, str, str], ...] = (
    (8, "Ryoji Ikeda", "data.tron", "https://www.ryojiikeda.com/project/datamatics/"),
    (8, "Semiconductor", "HALO", "https://semiconductorfilms.com/art/halo/"),
    (9, "Refik Anadol", "Archive Dreaming", "https://refikanadol.com/works/archive-dreaming/"),
    (9, "Rafael Lozano-Hemmer", "Level of Confidence",
     "https://www.lozano-hemmer.com/level_of_confidence.php"),
    (10, "Rosa Menkman", "Beyond Resolution", "https://beyondresolution.info/"),
    (10, "Phillip Stearns", "Glitch Textiles", "https://glitchtextiles.com/"),
    (11, "Giorgia Lupi", "Bruises: The Data We Don't See",
     "https://giorgialupi.com/bruises-the-data-we-dont-see"),
    (11, "Laurie Frick", "Self-tracking works", "https://www.lauriefrick.com/"),
    (12, "Allison Parrish", "Articulations", "https://www.decontextualize.com/"),
    (12, "Ross Goodwin", "1 the Road", "https://rossgoodwin.com/"),
    (13, "Nathalie Miebach", "Weather scores", "https://nathaliemiebach.com/"),
    (13, "Giorgia Lupi & Stefanie Posavec", "Dear Data", "http://www.dear-data.com/theproject"),
)


def laufe(wurzel: Path | None = None) -> Lauf:
    begonnen = jetzt()
    wurzel = wurzel or Path.cwd()
    stand = lade(ATLAS_WERKE, wurzel)

    kandidaten: list[Kandidat] = []
    verworfen: list[Verworfen] = []

    with httpx.Client(follow_redirects=True, headers=KOPF) as client:
        for feld, urheber, titel, url in ANKER:
            thema = hole(feld)  # wirft, wenn die Feldnummer nicht existiert
            herkunft = Herkunft(
                quelle="hand",
                abfrage=f"anker:feld-{feld}",
                ausgehend_von=f"thema-{feld}-{slugifiziere(thema.name)}",
                abgerufen_am=jetzt(),
            )

            if (normiere_url(url) in stand.bekannte_urls
                    or normiere_titel(titel) in stand.bekannte_titel):
                verworfen.append(Verworfen(titel=titel, grund="bereits-im-atlas",
                                           detail=None, herkunft=herkunft))
                continue

            befund = pruefe(url, client)
            if not befund.aufgeloest:
                verworfen.append(Verworfen(titel=titel, grund="identifier-nicht-aufloesbar",
                                           detail=befund.vermerk, herkunft=herkunft))
                continue

            kandidaten.append(Kandidat(
                atlas=ATLAS_WERKE,
                vorschlags_id=slugifiziere(urheber.split("&")[0], titel),
                titel=titel,
                urheber=urheber,
                jahr=None,  # trägt die Aufnahme nach — nicht geraten
                url=url,
                doi=None,
                herkunft=herkunft,
                pruefung=befund,
                punkte=1.0,  # von Hand vorgeschlagen: die Bewertung entfällt
                punkte_begruendung=(f"Ankerwerk für Feld {feld} — {thema.name}",),
            ))

    return Lauf(
        schema_version=SCHEMA_VERSION,
        atlas=ATLAS_WERKE,
        gestartet_am=begonnen,
        beendet_am=jetzt(),
        atlas_sha256=stand.sha256,
        atlas_eintraege=len(stand.eintraege),
        saatgut=tuple(sorted({f"thema-{f}" for f, *_ in ANKER})),
        kandidaten=tuple(kandidaten),
        verworfen=tuple(verworfen),
    )


def main() -> int:
    lauf = laufe()
    ziel = AUSGABE / ATLAS_WERKE
    ziel.mkdir(parents=True, exist_ok=True)
    datei = ziel / f"{datetime.now(timezone.utc):%Y-%m-%d}-anker.json"
    datei.write_text(lauf.als_json(), encoding="utf-8")

    print(f"Anker: {len(lauf.kandidaten)} vorgelegt, {len(lauf.verworfen)} verworfen")
    for k in lauf.kandidaten:
        print(f"   {k.punkte_begruendung[0][:34]:36} {k.urheber[:26]:28} {k.titel[:34]}")
    print(f"\ngeschrieben: {datei}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
