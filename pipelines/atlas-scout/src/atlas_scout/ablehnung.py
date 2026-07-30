"""Das Ablehnungsverzeichnis des Katalogs — einen Eintrag benannt zurücknehmen.

**Die Lücke, die das schließt.** Der Scout hat ein Ablehnungswesen (`model.Verworfen`,
Monatsbericht in `berichte/`), aber es greift **vor** der Aufnahme: Was der Scout gar
nicht erst aufnimmt, steht dort. Ist ein Eintrag einmal im Katalog, gab es bis
2026-07-30 kein Mittel gegen ihn außer einer Ortsregel im Saatgut — und die trägt nicht
immer.

Der Fall, an dem das auffiel: `arXiv:2501.01234` steht als **Beispiel in einem Docstring**
(`'http://arxiv.org/abs/2501.01234v2' -> '2501.01234'`, in
`field-research/works/2026-07-25-no-signal-to-extend/scripts/filter_corpus_api.py`). Die
erfundene Kennung löst bei arXiv zufällig ein echtes Paper auf — „Impact of QCD sum rules
coupling constants on neutron stars structure" — und stand seither als „von field
zitiert" im Katalog. Gegen so etwas hilft kein Ordnername: Die Datei ist ein produktives
Skript, kein Prüfstück, und die Kennung sieht aus wie jede andere.

**Warum ein Verzeichnis und kein Löschen.** Der Katalog wird jede Nacht aus den Quellen
neu gebaut. Ein von Hand gelöschter Eintrag wäre am nächsten Morgen zurück. Die Ablehnung
muss also dauerhaft sein — und weil sie dauerhaft ist, muss sie **belegt** sein, sonst
wird sie ein stiller Weg, Unliebsames verschwinden zu lassen. Deshalb:

  - Jede Ablehnung nennt einen **Grund aus geschlossener Liste** (`GRUENDE`) und einen
    **Beleg** — wo steht die Kennung, und was steht dort wirklich.
  - Das Verzeichnis hält den **vollständigen Eintrag** fest, wie er zuletzt aussah. Eine
    Ablehnung ist damit umkehrbar: Man kann sehen, was entfernt wurde, nicht nur dass.
  - `src/data/register/abgelehnt.json` liegt **im Repo, öffentlich**, wie der Katalog
    selbst. Ein Ablehnungsverzeichnis, das niemand sieht, ist kein Verzeichnis.

**Die Schranke, die nie fällt: Ein Praxis-Satz kann nicht abgelehnt werden.** Hat eine
Praxis geschrieben, warum ein Eintrag zählt, dann hat ein Mensch oder eine Praxis ihn
gelesen — und dieser Satz ist das Einzige in diesem Katalog, was sich nicht herstellen
lässt. `pruefe_ablehnungen()` bricht ab, statt ihn zu entfernen. Dieselbe Regel wie in
`urteil.py`, nur schärfer: Dort würde ein Modellurteil einen Praxis-Satz überschreiben,
hier würde eine Ablehnung ihn samt Eintrag tilgen.

Eingabeform:
    {"wer": "claude-opus-5", "sitzung": "…",
     "ablehnungen": [{"id": "…", "grund": "kein-zitat", "beleg": "…"}]}

    python -m atlas_scout.ablehnung ablehnungen/2026-07-30.json --wurzel . \\
        --wer claude-opus-5 --am 2026-07-30 --sitzung … --probe
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

# Was als Grund gelten darf. Geschlossen, weil ein freier Grund das Verzeichnis in eine
# Erlaubnis verwandelt, alles zu entfernen, wofür sich eine Formulierung findet.
GRUENDE = {
    # Die Kennung steht dort, aber ihr Vorkommen ist kein Zitat: Beispiel in einem
    # Docstring, Attrappe in einer Testvorrichtung, Prüfziel einer Messung, Spiegel.
    "kein-zitat",
    # Die Kennung löst auf ein anderes Werk auf, als die zitierende Stelle nennt.
    "falsch-aufgeloest",
    # Dasselbe Werk steht bereits unter einer anderen Kennung im Katalog.
    "dublette",
}

REGISTER = "src/data/register/abgelehnt.json"


class Ablehnungsfehler(ValueError):
    """Eine Ablehnung, die die Form verletzt. Nichts wird angewandt."""


def pruefe_ablehnungen(ablehnungen: list[dict], katalog: list[dict]) -> list[str]:
    """Gibt die Beanstandungen zurück. Leere Liste = anwendbar.

    Strenger als die Urteilsprüfung, weil eine Ablehnung mehr wegnimmt als ein Urteil
    hinzufügt: Ein schlechtes Urteil steht sichtbar da und lässt sich ersetzen, ein
    falsch abgelehnter Eintrag ist von der Fläche verschwunden.
    """
    beanstandet: list[str] = []
    nach_id = {e["id"]: e for e in katalog if e.get("id")}
    gesehen: set[str] = set()

    for i, a in enumerate(ablehnungen):
        kennung = a.get("id", f"<ohne id, Position {i}>")
        if kennung not in nach_id:
            beanstandet.append(f"{kennung}: kein Eintrag mit dieser id")
        if kennung in gesehen:
            beanstandet.append(f"{kennung}: doppelt abgelehnt")
        gesehen.add(kennung)

        if a.get("grund") not in GRUENDE:
            beanstandet.append(
                f"{kennung}: Grund {a.get('grund')!r} — erlaubt: {sorted(GRUENDE)}"
            )

        beleg = (a.get("beleg") or "").strip()
        if len(beleg) < 30:
            beanstandet.append(
                f"{kennung}: Beleg zu dünn ({len(beleg)} Zeichen). Er muss sagen, WO die "
                f"Kennung steht und WAS dort wirklich steht."
            )

        # Die Schranke, die nie fällt.
        eintrag = nach_id.get(kennung)
        if eintrag and eintrag.get("relevanz_herkunft") == "praxis":
            beanstandet.append(
                f"{kennung}: trägt eine von der Praxis geschriebene Begründung — "
                f"eine Praxis hat den Text gelesen. Das kann keine Ablehnung aufheben."
            )

    return beanstandet


def wende_an(
    katalog: list[dict],
    ablehnungen: list[dict],
    *,
    wer: str,
    am: str,
    sitzung: str,
) -> tuple[list[dict], list[dict]]:
    """Entfernt die abgelehnten Einträge. Rückgabe: (verbleibender Katalog, Verzeichnis).

    Das Verzeichnis hält den vollständigen Eintrag fest — die Ablehnung bleibt dadurch
    nachvollziehbar und umkehrbar.
    """
    abgelehnt = {a["id"]: a for a in ablehnungen}
    verbleibend: list[dict] = []
    verzeichnis: list[dict] = []

    for eintrag in katalog:
        a = abgelehnt.get(eintrag.get("id"))
        if not a:
            verbleibend.append(eintrag)
            continue
        verzeichnis.append(
            {
                "id": eintrag["id"],
                "kennung": eintrag.get("kennung", ""),
                "titel": eintrag.get("titel", ""),
                "grund": a["grund"],
                "beleg": a["beleg"].strip(),
                "wer": wer,
                "am": am,
                "sitzung": sitzung,
                # Vollständige Kopie: Was entfernt wurde, nicht nur dass.
                "eintrag": eintrag,
            }
        )

    return verbleibend, verzeichnis


def lies_register(wurzel: Path) -> list[dict]:
    """Das bestehende Verzeichnis. Fehlt es, ist es leer — kein Fehler."""
    pfad = wurzel / REGISTER
    if not pfad.is_file():
        return []
    return json.loads(pfad.read_text(encoding="utf-8"))


def schreibe_register(wurzel: Path, verzeichnis: list[dict]) -> Path:
    pfad = wurzel / REGISTER
    pfad.parent.mkdir(parents=True, exist_ok=True)
    pfad.write_text(
        json.dumps(verzeichnis, indent=1, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    return pfad


def ist_abgelehnt(verzeichnis: list[dict]) -> set[str]:
    """Die Kennungen, die nicht mehr aufgenommen werden dürfen.

    **Über die Kennung, nicht über die id.** Die id wird aus Autor und Titel abgeleitet
    und ändert sich, sobald die Quelle ihre Angaben korrigiert — dann käme der abgelehnte
    Eintrag unter neuer id zurück. Die Kennung ist das, was ihn identifiziert.
    """
    return {
        (e.get("kennung") or "").lower()
        for e in verzeichnis
        if e.get("kennung")
    }


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="atlas_scout.ablehnung",
        description="Einen Katalogeintrag benannt und belegt zurücknehmen.",
    )
    parser.add_argument("datei", type=Path, help="Ablehnungsdatei (JSON)")
    parser.add_argument("--wurzel", type=Path, default=Path("."), help="Wurzel der Site")
    parser.add_argument("--wer", required=True, help="wer ablehnt (Modell oder Person)")
    parser.add_argument("--am", required=True, help="Datum der Ablehnung (ISO)")
    parser.add_argument("--sitzung", required=True, help="Sitzungskennung")
    parser.add_argument("--probe", action="store_true", help="nur prüfen, nichts schreiben")
    args = parser.parse_args(argv)

    ziel = args.wurzel / "src/data/register/papers.json"
    katalog = json.loads(ziel.read_text(encoding="utf-8"))
    roh = json.loads(args.datei.read_text(encoding="utf-8"))
    # Die Datei trägt ihre Herkunft selbst; sie schlägt die CLI-Argumente, damit ein
    # späterer Anwender sie nicht überschreiben kann. Gleiche Form wie bei den Urteilen.
    if isinstance(roh, dict):
        ablehnungen = roh.get("ablehnungen") or []
        wer = roh.get("wer") or args.wer
        sitzung = roh.get("sitzung") or args.sitzung
    else:
        ablehnungen = roh
        wer, sitzung = args.wer, args.sitzung

    beanstandet = pruefe_ablehnungen(ablehnungen, katalog)
    if beanstandet:
        print(f"ABBRUCH: {len(beanstandet)} Beanstandungen — nichts angewandt.")
        for b in beanstandet[:20]:
            print(f"   – {b}")
        return 1

    print(f"{len(ablehnungen)} Ablehnungen geprüft, keine Beanstandung.")
    if args.probe:
        for a in ablehnungen:
            eintrag = next((e for e in katalog if e["id"] == a["id"]), None)
            print(f"   würde entfallen: [{a['grund']}] {(eintrag or {}).get('titel', '')[:60]}")
        print("Probe — nichts geschrieben.")
        return 0

    verbleibend, neu = wende_an(
        katalog, ablehnungen, wer=wer, am=args.am, sitzung=sitzung
    )
    verzeichnis = lies_register(args.wurzel) + neu
    pfad = schreibe_register(args.wurzel, verzeichnis)
    ziel.write_text(
        json.dumps(verbleibend, indent=1, ensure_ascii=False) + "\n", encoding="utf-8"
    )
    print(f"entfernt: {len(neu)} · Katalog jetzt: {len(verbleibend)}")
    print(f"geschrieben: {ziel}")
    print(f"Verzeichnis: {pfad} ({len(verzeichnis)} Einträge)")
    return 0


if __name__ == "__main__":
    import sys

    sys.exit(main())
