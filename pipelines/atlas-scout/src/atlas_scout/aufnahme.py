"""Automatische Aufnahme geprüfter Kandidaten in den Werke-Atlas.

Dies ist das **einzige** Modul, das in `werke.json` schreiben darf. Alles andere legt
nur vor (`tests/test_grenze.py` erzwingt das über den Syntaxbaum).

Warum das vertretbar ist, obwohl der Atlas Aufnahme durch einen Menschen vorsieht:

  1. Der Werke-Atlas ist ein *lebendiges Verzeichnis*, kein abgenommenes Archiv wie die
     Tagesprotokolle. Er darf wachsen.
  2. Sein Schema kennt `verify_status: "toVerify"` und die Karte markiert solche
     Einträge sichtbar mit „?" — der Atlas hat also bereits eine Form für „drin, aber
     ungeprüft". Genau die nutzt dieses Modul; nichts wird als geprüft ausgegeben,
     was niemand geprüft hat.
  3. Die harte Aufnahmeregel — auflösbarer Identifier — ist nicht aufgeweicht, sondern
     vorgezogen: Was hier hereinkommt, wurde beim Scoutlauf tatsächlich aufgelöst.
  4. Git ist die Rücknahme. Jede Aufnahme ist ein Commit.

Was **nicht** automatisiert wird: erfinden. Fehlt Jahr, Urheber oder Feldzuordnung,
fällt der Kandidat durch. Die Prosa ist der unbearbeitete Quelltext, nie umformuliert.

    python -m atlas_scout.aufnahme --hoechstzahl 40
    python -m atlas_scout.aufnahme --trocken
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .atlas import PFAD_WERKE, normiere_titel, normiere_url
from .run import AUSGABE
from .themen import THEMEN

# Angaben, die aus der Quelle folgen und keine Setzung sind: ArtBase ist per Definition
# eine Netzkunst-Sammlung, ihre Einträge sind digitale, netzbasierte Arbeiten.
QUELLEN_VORGABEN = {
    "artbase": {
        "venue_prize": "Rhizome ArtBase",
        "medium_class": "digital",
        "form": "digital-web",
        # „mixed" ist der neutrale Wert der Achse, nicht geraten — im Atlas mit
        # 89 Einträgen der häufigste.
        "axis_pole": "mixed",
    },
}


def _feld_aus_saat(saat_id: str) -> int | None:
    """`thema-13-material-sinne` → 13."""
    teile = saat_id.split("-")
    if len(teile) >= 2 and teile[0] == "thema" and teile[1].isdigit():
        nummer = int(teile[1])
        return nummer if nummer in THEMEN else None
    return None


def pruefe_kandidat(kandidat: dict, bekannt_url: set[str], bekannt_titel: set[str]) -> str | None:
    """Gibt den Ablehnungsgrund zurück — oder None, wenn der Kandidat aufnehmbar ist."""
    if not (kandidat.get("pruefung") or {}).get("aufgeloest"):
        return "Identifier nicht aufgelöst"
    if not kandidat.get("jahr"):
        return "kein Jahr"
    if not kandidat.get("urheber") or kandidat["urheber"] == "unbekannt":
        return "kein Urheber"
    if _feld_aus_saat((kandidat.get("herkunft") or {}).get("ausgehend_von", "")) is None:
        return "keine Feldzuordnung"
    if (kandidat.get("herkunft") or {}).get("quelle") not in QUELLEN_VORGABEN:
        return "Quelle ohne Aufnahmeregel"
    if normiere_url(kandidat.get("url")) in bekannt_url:
        return "URL bereits im Atlas"
    if normiere_titel(kandidat.get("titel")) in bekannt_titel:
        return "Titel bereits im Atlas"
    return None


def als_eintrag(kandidat: dict) -> dict:
    """Baut den Atlas-Eintrag. Nichts wird ergänzt, was nicht in der Quelle steht."""
    quelle = kandidat["herkunft"]["quelle"]
    vorgaben = QUELLEN_VORGABEN[quelle]
    feld = _feld_aus_saat(kandidat["herkunft"]["ausgehend_von"])
    return {
        "title": kandidat["titel"],
        "artist": kandidat["urheber"],
        "year": str(kandidat["jahr"]),
        "venue_prize": vorgaben["venue_prize"],
        "clusters": [feld],
        "axis_pole": vorgaben["axis_pole"],
        "form": vorgaben["form"],
        "medium_class": vorgaben["medium_class"],
        "lab_renderable": False,
        "decisive_move": (kandidat.get("notiz") or "").strip(),
        "source_url": kandidat["url"],
        # Automatisch aufgenommen heißt: noch von niemandem geprüft. Die Karte
        # markiert das sichtbar.
        "verify_status": "toVerify",
    }


def laufe(hoechstzahl: int, wurzel: Path | None = None) -> tuple[list[dict], dict[str, int]]:
    wurzel = wurzel or Path.cwd()
    werke_pfad = wurzel / PFAD_WERKE
    werke = json.loads(werke_pfad.read_text(encoding="utf-8"))

    bekannt_url = {normiere_url(w.get("source_url")) for w in werke if w.get("source_url")}
    bekannt_titel = {normiere_titel(w.get("title")) for w in werke if w.get("title")}

    neu: list[dict] = []
    gruende: dict[str, int] = {}

    # Erst sammeln und nach Feld sortieren, dann reihum aufnehmen. Sonst verbraucht
    # das Kontingent das erste Feld in Dateireihenfolge und die übrigen bleiben leer
    # (beobachtet 2026-07-25: 40 Plätze gingen vollständig an die Felder 10 und 11).
    nach_feld: dict[int, list[dict]] = {}
    for datei in sorted((wurzel / AUSGABE / "werke").glob("*.json")):
        lauf = json.loads(datei.read_text(encoding="utf-8"))
        for kandidat in lauf.get("kandidaten", []):
            grund = pruefe_kandidat(kandidat, bekannt_url, bekannt_titel)
            if grund:
                gruende[grund] = gruende.get(grund, 0) + 1
                continue
            feld = _feld_aus_saat(kandidat["herkunft"]["ausgehend_von"])
            nach_feld.setdefault(feld, []).append(kandidat)

    runde = 0
    while len(neu) < hoechstzahl:
        genommen = False
        for feld in sorted(nach_feld):
            if runde >= len(nach_feld[feld]) or len(neu) >= hoechstzahl:
                continue
            kandidat = nach_feld[feld][runde]
            # Der Abgleich muss hier erneut greifen: Dubletten können sich über
            # mehrere Felder verteilen (ein Werk liegt in mehreren Feldern).
            if pruefe_kandidat(kandidat, bekannt_url, bekannt_titel):
                continue
            eintrag = als_eintrag(kandidat)
            neu.append(eintrag)
            bekannt_url.add(normiere_url(eintrag["source_url"]))
            bekannt_titel.add(normiere_titel(eintrag["title"]))
            genommen = True
        if not genommen:
            break
        runde += 1

    uebrig = sum(len(v) for v in nach_feld.values()) - len(neu)
    if uebrig > 0:
        gruende["Kontingent erschöpft"] = uebrig
    return neu, gruende


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Nimmt geprüfte Kandidaten in den Werke-Atlas auf.")
    parser.add_argument(
        "--hoechstzahl", type=int, default=40,
        help="Deckel je Lauf — damit ein Fehlgriff den Atlas nicht auf einmal flutet",
    )
    parser.add_argument("--trocken", action="store_true", help="nur zeigen, nichts schreiben")
    args = parser.parse_args(argv)

    neu, gruende = laufe(args.hoechstzahl)

    print(f"aufnehmbar: {len(neu)}")
    for grund, anzahl in sorted(gruende.items(), key=lambda x: -x[1]):
        print(f"   abgelehnt — {grund}: {anzahl}")
    for eintrag in neu[:12]:
        print(f"   + [{eintrag['clusters'][0]:>2}] {eintrag['year']}  "
              f"{eintrag['artist'][:24]:26} {eintrag['title'][:40]}")

    if args.trocken or not neu:
        return 0

    werke_pfad = Path.cwd() / PFAD_WERKE
    werke = json.loads(werke_pfad.read_text(encoding="utf-8"))
    werke.extend(neu)
    werke_pfad.write_text(
        json.dumps(werke, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"\naufgenommen: {len(neu)} → {werke_pfad} (jetzt {len(werke)} Werke)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
