"""Die Urteilsroutine — den fehlenden Satz schreiben, ohne ihn zu erfinden.

Ein Katalogeintrag hat eine Begründung aus einer von drei Quellen:

  `praxis`    Eine Praxis hat sie selbst geschrieben. Wörtlich übernommen. Beste Sorte.
  `gebrauch`  Nur der Beleg: WER hat wann zitiert. Sagt DASS, nicht WARUM.
  `urteil`    Hier geschrieben — von einem benannten Modell, auf benannter Grundlage.

Diese Routine wandelt `gebrauch` in `urteil`. Sie läuft **nicht** in der Pipeline: Der
nächtliche Lauf ist deterministisch und ruft kein Modell (Bauregel des Startauftrags,
kein API-Guthaben). Ein Urteilsschritt ist eine **Claude-Code-Sitzung unter dem Abo**,
die diese Datei als Werkzeug benutzt.

**Warum ein Werkzeug und kein Direkteingriff in papers.json.** Ein Urteil ist der einzige
Schritt in dieser Kette, der nicht aus einer Quelle folgt — er kommt von jemandem, der
gelesen hat. Genau deshalb muss er am sichtbarsten belegt sein:

  - Urteile stehen zuerst als eigene Datei (`urteile/<datum>.json`) — sie sind lesbar,
    prüfbar und rücknehmbar, bevor sie den Katalog berühren.
  - Jedes angewandte Urteil trägt `urteil: {modell, am, grundlage, sitzung}` am Eintrag.
    Wer den Katalog liest, sieht, dass dieser Satz maschinell geschrieben wurde.
  - `verify_status` bleibt `toVerify`. Ein Modellurteil ist ein **Vorschlag an die
    Praxis**, kein Ersatz für ihr Lesen. Nur ein Mensch oder die Praxis selbst setzt
    `verified`.

**Was ein redliches Urteil ist.** Es sagt, was der Text für DIESE Forschung hergibt —
nicht, worum es im Text geht (das ist die Zusammenfassung). Es behauptet nichts über
Inhalte, die nicht in Titel, Abstract oder Fundstelle stehen. Wo die Grundlage zu dünn
ist, wird **nicht** geurteilt: `gebrauch` bleibt stehen, und das ist ein Ergebnis.

Eingabeform (Liste):
    [{"id": "…", "relevanz": "Ein Satz.", "grundlage": "abstract"}]

    python -m atlas_scout.urteil urteile/2026-07-28.json --wurzel .
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

# Was als Grundlage eines Urteils gelten darf. Ein Urteil ohne benannte Grundlage ist
# eine Behauptung — deshalb ist das Feld Pflicht und der Wert eingeschränkt.
GRUNDLAGEN = {
    "abstract",  # Titel + Abstract der Quelle gelesen
    "volltext",  # der Text selbst gelesen
    "fundstelle",  # die Stelle gelesen, an der die Praxis ihn benutzt
}


class Urteilsfehler(ValueError):
    """Ein Urteil, das die Form verletzt. Nichts wird angewandt."""


def pruefe_urteile(urteile: list[dict], katalog: list[dict]) -> list[str]:
    """Gibt die Beanstandungen zurück. Leere Liste = anwendbar.

    Streng, weil ein fehlerhaftes Urteil im Katalog aussieht wie ein gutes.
    """
    beanstandet: list[str] = []
    bekannt = {e["id"] for e in katalog}
    gesehen: set[str] = set()

    for i, u in enumerate(urteile):
        kennung = u.get("id", f"<ohne id, Position {i}>")
        if kennung not in bekannt:
            beanstandet.append(f"{kennung}: kein Eintrag mit dieser id")
        if kennung in gesehen:
            beanstandet.append(f"{kennung}: doppelt beurteilt")
        gesehen.add(kennung)

        satz = (u.get("relevanz") or "").strip()
        if len(satz) < 25:
            beanstandet.append(f"{kennung}: Begründung zu kurz ({len(satz)} Zeichen)")
        if not satz.endswith((".", "?", "!")):
            beanstandet.append(f"{kennung}: Begründung ist kein ganzer Satz")

        if u.get("grundlage") not in GRUNDLAGEN:
            beanstandet.append(
                f"{kennung}: Grundlage {u.get('grundlage')!r} — erlaubt: {sorted(GRUNDLAGEN)}"
            )

        # Der häufigste denkbare Fehler: den Praxis-Satz überschreiben. Er ist das
        # Wertvollste im Katalog und darf von einem Modellurteil nie verdrängt werden.
        eintrag = next((e for e in katalog if e["id"] == kennung), None)
        if eintrag and eintrag.get("relevanz_herkunft") == "praxis":
            beanstandet.append(
                f"{kennung}: trägt bereits eine von der Praxis geschriebene Begründung"
            )

    return beanstandet


def wende_an(
    katalog: list[dict], urteile: list[dict], *, modell: str, am: str, sitzung: str
) -> tuple[list[dict], int]:
    """Trägt geprüfte Urteile in den Katalog ein. Gibt (Katalog, Anzahl) zurück."""
    nach_id = {u["id"]: u for u in urteile}
    angewandt = 0
    for eintrag in katalog:
        u = nach_id.get(eintrag["id"])
        if not u:
            continue
        eintrag["relevanz"] = u["relevanz"].strip()
        eintrag["relevanz_herkunft"] = "urteil"
        eintrag["urteil"] = {
            "modell": modell,
            "am": am,
            "grundlage": u["grundlage"],
            "sitzung": sitzung,
        }
        # Bleibt toVerify: Ein Modellurteil ist ein Vorschlag an die Praxis, kein Ersatz
        # für ihr Lesen. Nur die Praxis oder ein Mensch setzt `verified`.
        eintrag["verify_status"] = "toVerify"
        angewandt += 1
    return katalog, angewandt


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Urteile auf den Paper-Katalog anwenden.")
    parser.add_argument("datei", type=Path, help="JSON-Liste mit Urteilen")
    parser.add_argument("--wurzel", type=Path, default=Path("."))
    parser.add_argument("--modell", required=True, help="Name des urteilenden Modells")
    parser.add_argument("--am", required=True, help="ISO-Datum des Urteilsschritts")
    parser.add_argument("--sitzung", required=True, help="Kennung/Notiz der Sitzung")
    parser.add_argument("--probe", action="store_true", help="nur prüfen, nichts schreiben")
    args = parser.parse_args(argv)

    ziel = args.wurzel / "src/data/register/papers.json"
    katalog = json.loads(ziel.read_text(encoding="utf-8"))
    urteile = json.loads(args.datei.read_text(encoding="utf-8"))

    beanstandet = pruefe_urteile(urteile, katalog)
    if beanstandet:
        print(f"ABBRUCH: {len(beanstandet)} Beanstandungen — nichts angewandt.")
        for b in beanstandet[:20]:
            print(f"   – {b}")
        return 1

    print(f"{len(urteile)} Urteile geprüft, keine Beanstandung.")
    if args.probe:
        print("Probe — nichts geschrieben.")
        return 0

    katalog, n = wende_an(
        katalog, urteile, modell=args.modell, am=args.am, sitzung=args.sitzung
    )
    ziel.write_text(
        json.dumps(katalog, indent=1, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    offen = sum(1 for e in katalog if e["relevanz_herkunft"] == "gebrauch")
    print(f"angewandt: {n} · noch ohne Begründung: {offen}")
    print(f"geschrieben: {ziel}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
