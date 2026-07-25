"""Modellschritt: aus einer Ausstellungsmeldung Werk-Kandidaten herauslesen.

Der einzige Schritt der Werke-Strecke, der ein Modell braucht — es gibt keine
strukturierte Quelle für zeitgenössische Datenkunst, nur Fließtext. HTML→Struktur ist
genau die Aufgabe, für die das kleinste Modell reicht.

Der Extraktor ist einsteckbar (`extrahiere(..., extraktor=…)`), damit die Strecke ohne
Schlüssel und ohne Netz getestet werden kann. Was das Modell liefert, sind Kandidaten:
Sie durchlaufen anschließend dieselbe Identifier-Prüfung und denselben Abgleich wie
jeder andere Vorschlag.
"""
from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path
from typing import Callable, Protocol

from .themen import THEMEN

MODELL = "claude-haiku-4-5"

SCHEMA = {
    "type": "object",
    "properties": {
        "werke": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "titel": {"type": "string"},
                    "urheber": {"type": "string"},
                    "jahr": {"type": ["integer", "null"]},
                    "beschreibung": {
                        "type": "string",
                        "description": "Ein Satz: der entscheidende Zug des Werks. Nur aus dem Text, nichts ergänzt.",
                    },
                    "felder": {
                        "type": "array",
                        "items": {"type": "integer"},
                        "description": "Feldnummern 1–13. Leer, wenn keines eindeutig passt.",
                    },
                    "zuversicht": {"type": "string", "enum": ["hoch", "mittel", "niedrig"]},
                },
                "required": ["titel", "urheber", "jahr", "beschreibung", "felder", "zuversicht"],
                "additionalProperties": False,
            },
        }
    },
    "required": ["werke"],
    "additionalProperties": False,
}


class Extraktor(Protocol):
    def __call__(self, system: str, text: str) -> dict: ...


def baue_system_prompt(werke_pfad: Path, beispiele: int = 50) -> str:
    """Stabiler Präfix: Feldraster plus echte Einordnungen aus dem Atlas als Beispiele.

    Die Beispiele sind nicht nur Schmuck. Sie verbessern die Feldzuordnung erheblich —
    und sie heben den Präfix über Haikus Cache-Mindestlänge von 4096 Token, unter der
    stillschweigend gar nichts zwischengespeichert würde.

    Die Zahl 50 ist gemessen, nicht geraten (2026-07-25): 25 Beispiele ergeben ~3.039
    Token und cachen nicht, 40 liegen mit ~4.366 knapp darüber, 50 mit ~5.326 mit
    Reserve. Wer sie senkt, schaltet unbemerkt das Caching ab — deshalb steht die
    Untergrenze in `tests/test_extract.py` unter Testschutz.
    """
    werke = json.loads(werke_pfad.read_text(encoding="utf-8"))
    raster = "\n".join(
        f"  {t.nummer:>2} {t.name} ({t.familie}) — erkennbar an: {', '.join(t.werk_marker)}"
        for t in THEMEN.values()
    )
    muster = "\n".join(
        f'  „{w.get("title")}“ ({w.get("artist")}, {w.get("year")}) → Felder {w.get("clusters")}\n'
        f'     {(w.get("decisive_move") or "")[:240]}'
        for w in werke[:beispiele]
        if w.get("clusters")
    )

    return (
        "Du liest Ausstellungsmeldungen und trägst daraus Werke für einen Atlas "
        "zeitgenössischer Datenkunst zusammen.\n\n"
        "Aufgenommen wird ein WERK — eine einzelne künstlerische Arbeit. Nicht die "
        "Ausstellung, nicht das Haus, nicht die Künstlerin als Person, nicht eine "
        "Konferenz oder ein Preis als solcher.\n\n"
        "Ein Werk gehört in den Atlas, wenn Daten, Berechnung oder KI darin Material oder "
        "Gegenstand sind. Eine Malereiausstellung gehört nicht hinein, auch wenn die "
        "Meldung das Wort „digital“ enthält.\n\n"
        f"Das Feldraster:\n{raster}\n\n"
        f"So sind bestehende Einträge eingeordnet:\n{muster}\n\n"
        "Regeln, die nicht verhandelbar sind:\n"
        "- Erfinde nichts. Kein Titel, keine Urheberin, kein Jahr, das nicht im Text steht.\n"
        "- Steht kein Jahr im Text, setze jahr auf null. Rate nicht.\n"
        "- Passt kein Feld eindeutig, gib eine leere Feldliste zurück — eine falsche "
        "Einordnung ist teurer als keine.\n"
        "- Enthält die Meldung kein Werk, das die Bedingung erfüllt, gib eine leere Liste "
        "zurück. Das ist der häufige und richtige Fall.\n"
        "- zuversicht bezieht sich darauf, wie eindeutig der Text das Werk trägt — nicht "
        "darauf, wie gut du das Werk findest."
    )


def _anthropic_extraktor(system: str, text: str) -> dict:
    import anthropic

    client = anthropic.Anthropic()
    antwort = client.messages.create(
        model=MODELL,
        max_tokens=4000,
        system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
        output_config={"format": {"type": "json_schema", "schema": SCHEMA}},
        messages=[{"role": "user", "content": text}],
    )
    roh = next((b.text for b in antwort.content if b.type == "text"), "{}")
    return json.loads(roh)


def extrahiere(
    meldungen: list[dict],
    werke_pfad: Path,
    extraktor: Extraktor | None = None,
) -> tuple[list[dict], str]:
    """Werk-Kandidaten aus Meldungen. Gibt (Rohfunde, Prompt-Hash) zurück.

    Rohfunde tragen dieselbe Form wie die der übrigen Quellen, damit Abgleich, Prüfung
    und Bewertung unverändert greifen.
    """
    system = baue_system_prompt(werke_pfad)
    prompt_hash = hashlib.sha256(system.encode("utf-8")).hexdigest()
    if extraktor is None:
        if not os.environ.get("ANTHROPIC_API_KEY"):
            raise RuntimeError("ANTHROPIC_API_KEY nicht gesetzt — Extraktion braucht ein Modell")
        extraktor = _anthropic_extraktor

    gueltige_felder = set(THEMEN)
    rohfunde: list[dict] = []
    for meldung in meldungen:
        try:
            ergebnis = extraktor(system, meldung["text"])
        except Exception:
            continue  # eine einzelne Meldung darf scheitern; der Lauf vermerkt die Lücke
        for werk in ergebnis.get("werke") or []:
            titel = (werk.get("titel") or "").strip()
            if not titel:
                continue
            # Erfundene Feldnummern fielen sonst still in die öffentliche Karte,
            # weil die Filterleiste ihre Schlüssel aus den Daten ableitet.
            felder = [f for f in (werk.get("felder") or []) if f in gueltige_felder]
            rohfunde.append({
                "titel": titel,
                "urheber": (werk.get("urheber") or "unbekannt").strip(),
                "jahr": werk.get("jahr"),
                "url": meldung["url"],
                "doi": None,
                "abfrage": f"eflux:{meldung['url'].rsplit('/', 2)[-2]}",
                "signale": {
                    "eigene_webseite": False,
                    "felder": felder,
                    "beschreibung": (werk.get("beschreibung") or "").strip(),
                    "zuversicht": werk.get("zuversicht", "niedrig"),
                    "modell": MODELL,
                    "prompt_sha256": prompt_hash,
                },
            })
    return rohfunde, prompt_hash


def zuversicht_als_zahl(wert: str) -> float:
    return {"hoch": 1.0, "mittel": 0.6, "niedrig": 0.25}.get(wert, 0.25)
