"""Optionaler Modellschritt: ein Relevanz-*Vorschlag* je Kandidat.

Getrennt vom Lauf, aus zwei Gründen. Erstens kostet er Geld und braucht einen Schlüssel —
der Scout muss ohne ihn vollständig laufen. Zweitens ist er der einzige Schritt, dessen
Ausgabe nicht nachgerechnet werden kann: Er wird deshalb als Vorschlag markiert und trägt
Modell und Prompt-Hash mit, damit im Nachhinein prüfbar bleibt, woraus er entstanden ist.

    export ANTHROPIC_API_KEY=…
    python -m atlas_scout.annotate pipelines/atlas-scout/kandidaten/theorie/2026-07-25.json

Der Atlas-Wortschatz wandert als stabiler Präfix in den System-Prompt: identisch über alle
Kandidaten eines Laufs, damit das Prompt-Caching greift (Sonnet 5 cached ab 1024 Token).
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

MODELL = "claude-sonnet-5"
HOECHSTZAHL = 15  # nur die bestbewerteten Kandidaten annotieren

SCHEMA = {
    "type": "object",
    "properties": {
        "relevanz": {
            "type": "string",
            "description": "Ein Satz: warum dieser Fund für den Atlas zählt, mit Bezug auf den Saatgut-Eintrag.",
        },
        "einwand": {
            "type": "string",
            "description": "Ein Satz: der stärkste Grund, ihn NICHT aufzunehmen. Leer, wenn keiner ersichtlich.",
        },
    },
    "required": ["relevanz", "einwand"],
    "additionalProperties": False,
}


def baue_system_prompt(atlas_pfad: Path) -> str:
    """Stabiler Präfix: was der Atlas ist, wie er schreibt, was er schon hat."""
    eintraege = json.loads(atlas_pfad.read_text(encoding="utf-8"))
    schlagworte = sorted({t for e in eintraege for t in e.get("tags", [])})
    beispiele = "\n".join(
        f'- {e.get("author")}, „{e.get("work")}“ ({e.get("year")}): {e.get("relevance", "")}'
        for e in eintraege[:12]
    )
    bestand = "; ".join(f'{e.get("author")} – {e.get("work")}' for e in eintraege)

    return (
        "Du beurteilst Kandidaten für einen kuratierten Atlas künstlerischer Forschung.\n\n"
        "Der Atlas existiert, weil eine geschlossene Selbsttrainings-Schleife kollabiert: Er ist "
        "die andere Verteilung, absichtlich extern gehalten. Er ist kein Kanon und keine "
        "Vollständigkeitssammlung.\n\n"
        f"Schlagwort-Wortschatz:\n{', '.join(schlagworte)}\n\n"
        f"So klingt ein Relevanz-Satz im Atlas:\n{beispiele}\n\n"
        f"Bereits im Bestand (nicht erneut vorschlagen):\n{bestand}\n\n"
        "Antworte in derselben Knappheit: ein Satz Relevanz, ein Satz Einwand. Keine Einleitung, "
        "keine Höflichkeit. Wenn der Fund nur thematisch benachbart ist, ohne für die Frage nach "
        "Irrtum, Methode und maschineller Praxis etwas beizutragen, sage das im Einwand deutlich."
    )


def annotiere(kandidaten_datei: Path, atlas_pfad: Path, hoechstzahl: int = HOECHSTZAHL) -> int:
    try:
        import anthropic
    except ImportError:
        print("anthropic fehlt — pip install -e '.[annotate]'", file=sys.stderr)
        return 1
    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ANTHROPIC_API_KEY nicht gesetzt", file=sys.stderr)
        return 1

    lauf = json.loads(kandidaten_datei.read_text(encoding="utf-8"))
    system = baue_system_prompt(atlas_pfad)
    prompt_hash = hashlib.sha256(system.encode("utf-8")).hexdigest()
    client = anthropic.Anthropic()

    ziel = lauf["kandidaten"][:hoechstzahl]
    print(f"annotiere {len(ziel)} von {len(lauf['kandidaten'])} Kandidaten mit {MODELL}")

    eingang = ausgang = cache_gelesen = 0
    for kandidat in ziel:
        frage = (
            f"Saatgut-Eintrag: {kandidat['herkunft']['ausgehend_von']}\n"
            f"Fund: {kandidat['urheber']}, „{kandidat['titel']}“ "
            f"({kandidat.get('jahr') or 'o. J.'})\n"
            f"Identifier: {kandidat['url']}\n"
            f"Fundweg: {kandidat['herkunft']['abfrage']}"
        )
        antwort = client.messages.create(
            model=MODELL,
            max_tokens=1000,
            system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
            output_config={"effort": "low", "format": {"type": "json_schema", "schema": SCHEMA}},
            messages=[{"role": "user", "content": frage}],
        )
        eingang += antwort.usage.input_tokens
        ausgang += antwort.usage.output_tokens
        cache_gelesen += getattr(antwort.usage, "cache_read_input_tokens", 0) or 0

        text = next((b.text for b in antwort.content if b.type == "text"), "{}")
        ergebnis = json.loads(text)
        kandidat["annotation"] = {
            "relevanz_vorschlag": ergebnis.get("relevanz", ""),
            "einwand": ergebnis.get("einwand", ""),
            "modell": MODELL,
            "prompt_sha256": prompt_hash,
            "erzeugt_am": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        }

    kandidaten_datei.write_text(
        json.dumps(lauf, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    kosten = eingang / 1e6 * 3.0 + ausgang / 1e6 * 15.0
    print(f"Token: {eingang} ein / {ausgang} aus / {cache_gelesen} aus Cache")
    print(f"Listenpreis dieses Laufs: ${kosten:.4f} (Cache-Treffer bereits abgezogen)")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Relevanz-Vorschläge zu einer Kandidatendatei.")
    parser.add_argument("datei", type=Path)
    parser.add_argument("--atlas", type=Path, default=Path("src/data/atelier/atlas.json"))
    parser.add_argument("--hoechstzahl", type=int, default=HOECHSTZAHL)
    args = parser.parse_args(argv)
    return annotiere(args.datei, args.atlas, args.hoechstzahl)


if __name__ == "__main__":
    sys.exit(main())
