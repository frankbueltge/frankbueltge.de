"""Die Suche nach außen — was die Praxen noch nicht kennen, aber brauchen könnten.

Frank, 2026-07-28: „es geht auch um datensätze oder papers, die potentiell relevant und
interessant sind für die forschung". Der Katalog aus `katalog.py` verzeichnet, was
tatsächlich gebraucht WURDE; dieses Modul sucht die Umgebung davon ab.

Der Weg ist die Zitationsnachbarschaft (OpenAlex, schlüsselfrei): Wer zitiert einen Text,
den eine Praxis benutzt, arbeitet mit hoher Wahrscheinlichkeit an derselben Frage weiter.
Das ist keine Themensuche — der Ausgangspunkt bleibt der belegte Gebrauch, und die
Verbindung zum Katalogeintrag wird am Vorschlag mitgeführt.

**Warum NICHT über Datensatz-Kataloge nach Thema.** Gemessen am 2026-07-28:

  Weg                                                        Ergebnis
  DataCite-Rückverweise (Typ Dataset) auf 20 Paper-DOIs      1
  OpenAlex: Datensätze, die diese Paper zitieren             0
  DataCite-Themensuche „glitch error aesthetics"             0
  DataCite-Themensuche „data physicalisation sonification"   0
  DataCite-Themensuche „algorithmic bias audit"              38, Spitzentreffer unpassend

Die Forschung dieser Ökologie liegt in Kunsttheorie, Medienwissenschaft und Critical AI —
Felder, die selten Datensätze mit DataCite-Verknüpfung hinterlegen. Eine reine
Themensuche in Datensatzkatalogen bringt entweder nichts oder dasselbe Rauschen wie das
zurückgebaute Register. Deshalb sucht dieses Modul zuerst Paper; der Weg zu Datensätzen
bleibt offen, bis er gemessen trägt.

**Ein Vorschlag ist kein Eintrag.** Was hier herauskommt, landet in `kandidaten/` und
wartet auf die Urteilsroutine. Der Scout findet und prüft den Identifier; ob etwas zählt
und warum, entscheidet er nicht.
"""
from __future__ import annotations

import json
from dataclasses import asdict, dataclass, field
from pathlib import Path

import httpx

from .atlas import normiere_doi, normiere_titel
from .sources import openalex
from .verify import KOPF, jetzt, pruefe

SCHEMA_VERSION = "1"

# Wie viele Katalogeinträge je Lauf abgesucht werden und wie viele Vorschläge je Eintrag
# höchstens mitkommen. Gedeckelt, damit ein Lauf überschaubar bleibt: Eine Probe von drei
# Einträgen brachte am 2026-07-28 bereits 42 neue Funde — ungedeckelt wären das bei 117
# Einträgen über tausend, und tausend unbeurteilte Vorschläge sind wieder ein Haufen.
SAATGUT_JE_LAUF = 12
VORSCHLAEGE_JE_SAAT = 8


@dataclass(frozen=True)
class Vorschlag:
    titel: str
    urheber: str
    jahr: int | None
    url: str
    doi: str | None
    zitationen: int
    frei_zugaenglich: bool
    # Die Kette, die den Vorschlag begründet: von welchem Katalogeintrag aus gefunden,
    # und über welche Nachbarschaft. Ohne sie ist er nicht vorlagefähig.
    ausgehend_von: str
    ausgehend_von_titel: str
    abfrage: str
    abgerufen_am: str
    # Befund der Identifier-Prüfung. Nicht aufgelöst ⇒ nicht vorlagefähig.
    aufgeloest: bool
    status: int | None
    vermerk: str | None


@dataclass(frozen=True)
class Ausfall:
    ausgehend_von: str
    vermerk: str


@dataclass(frozen=True)
class Lauf:
    schema_version: str
    gestartet_am: str
    beendet_am: str
    katalog_eintraege: int
    abgesucht: tuple[str, ...]
    vorschlaege: tuple[Vorschlag, ...]
    ausfaelle: tuple[Ausfall, ...] = field(default_factory=tuple)

    def als_json(self) -> str:
        return json.dumps(asdict(self), indent=2, ensure_ascii=False)


def _bekannt(katalog: list[dict]) -> tuple[set[str], set[str]]:
    """Was schon im Katalog steht — über Kennung UND Titel, damit die Preprint-Fassung
    eines bekannten Textes nicht als Neuheit durchgeht."""
    kennungen = {normiere_doi(e["kennung"]) for e in katalog}
    kennungen |= {normiere_doi(k) for e in katalog for k in e.get("weitere_kennungen", [])}
    titel = {normiere_titel(e["titel"]) for e in katalog}
    return {k for k in kennungen if k}, {t for t in titel if t}


def sammle(
    katalog: list[dict],
    *,
    saatgut_je_lauf: int = SAATGUT_JE_LAUF,
    versatz: int = 0,
) -> Lauf:
    """Sucht die Nachbarschaft der jüngsten Katalogeinträge ab.

    `versatz` verschiebt das Fenster, damit über die Nächte der ganze Katalog umrundet
    wird — dieselbe deterministische Rotation, die der Atlas-Scout fährt (kein Zufall,
    damit ein Lauf reproduzierbar bleibt).
    """
    begonnen = jetzt()
    kennungen, titel = _bekannt(katalog)
    # Der Katalog ist bereits nach jüngstem Gebrauch sortiert; das Fenster wandert.
    fenster = [
        katalog[(versatz + i) % len(katalog)]
        for i in range(min(saatgut_je_lauf, len(katalog)))
    ] if katalog else []

    vorschlaege: list[Vorschlag] = []
    ausfaelle: list[Ausfall] = []
    abgesucht: list[str] = []
    # Innerhalb eines Laufs nicht zweimal denselben Fund vorschlagen.
    gesehen: set[str] = set()

    with httpx.Client(follow_redirects=True, headers=KOPF) as client:
        for eintrag in fenster:
            kennung = eintrag["kennung"]
            abgesucht.append(kennung)
            doi = None if kennung.lower().startswith("arxiv:") else kennung
            try:
                funde = openalex.ernte(
                    eintrag["titel"], doi, ", ".join(eintrag.get("urheber", [])[:2]),
                    grenze=25,
                )
            except openalex.QuellenAusfall as fehler:
                ausfaelle.append(Ausfall(kennung, str(fehler)))
                continue

            mitgenommen = 0
            for fund in funde:
                if mitgenommen >= VORSCHLAEGE_JE_SAAT:
                    break
                fund_doi = normiere_doi(fund.get("doi"))
                fund_titel = normiere_titel(fund.get("titel"))
                if fund_doi and fund_doi in kennungen:
                    continue
                if fund_titel in titel or fund_titel in gesehen:
                    continue
                gesehen.add(fund_titel)

                # Identifier prüfen, bevor der Vorschlag entsteht: Ein Fund, dessen
                # Adresse nicht auflöst, ist keiner (Aufnahmeregel der Atlanten).
                befund = pruefe(fund["url"], client)
                vorschlaege.append(Vorschlag(
                    titel=fund["titel"],
                    urheber=fund.get("urheber", "unbekannt"),
                    jahr=fund.get("jahr"),
                    url=fund["url"],
                    doi=fund.get("doi"),
                    zitationen=fund["signale"].get("zitationen", 0),
                    frei_zugaenglich=bool(fund["signale"].get("frei_zugaenglich")),
                    ausgehend_von=kennung,
                    ausgehend_von_titel=eintrag["titel"],
                    abfrage=fund.get("abfrage", ""),
                    abgerufen_am=jetzt(),
                    aufgeloest=befund.aufgeloest,
                    status=befund.status,
                    vermerk=befund.vermerk,
                ))
                mitgenommen += 1

    return Lauf(
        schema_version=SCHEMA_VERSION,
        gestartet_am=begonnen,
        beendet_am=jetzt(),
        katalog_eintraege=len(katalog),
        abgesucht=tuple(abgesucht),
        vorschlaege=tuple(vorschlaege),
        ausfaelle=tuple(ausfaelle),
    )


def main(argv: list[str] | None = None) -> int:
    import argparse
    from datetime import datetime, timezone

    parser = argparse.ArgumentParser(
        description="Nachbarschaft des Paper-Katalogs absuchen (Vorschläge, keine Aufnahme)."
    )
    parser.add_argument("--wurzel", type=Path, default=Path("."))
    parser.add_argument("--anzahl", type=int, default=SAATGUT_JE_LAUF)
    parser.add_argument("--versatz", type=int, default=0)
    args = parser.parse_args(argv)

    pfad = args.wurzel / "src/data/register/papers.json"
    katalog = json.loads(pfad.read_text(encoding="utf-8")) if pfad.is_file() else []
    if not katalog:
        print("Katalog leer — nichts abzusuchen.")
        return 0

    lauf = sammle(katalog, saatgut_je_lauf=args.anzahl, versatz=args.versatz)
    aufgeloest = [v for v in lauf.vorschlaege if v.aufgeloest]
    print(
        f"abgesucht: {len(lauf.abgesucht)} Einträge · Vorschläge: {len(lauf.vorschlaege)} "
        f"(davon aufgelöst: {len(aufgeloest)}) · Ausfälle: {len(lauf.ausfaelle)}"
    )
    for ausfall in lauf.ausfaelle:
        print(f"   AUSFALL {ausfall.ausgehend_von}: {ausfall.vermerk}")
    for v in aufgeloest[:12]:
        print(f"   + {v.jahr} {v.titel[:56]}  (Zit. {v.zitationen})")

    ziel = args.wurzel / "pipelines/atlas-scout/kandidaten/papers"
    ziel.mkdir(parents=True, exist_ok=True)
    datei = ziel / f"{datetime.now(timezone.utc):%Y-%m-%d}-nachbarschaft.json"
    datei.write_text(lauf.als_json(), encoding="utf-8")
    print(f"geschrieben: {datei}")
    return 0


if __name__ == "__main__":
    import sys

    sys.exit(main())
