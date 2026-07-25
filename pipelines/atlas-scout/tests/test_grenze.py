"""Grenzprüfung: der Scout darf in keinen der beiden Atlanten schreiben.

Das ist die eine Zusage, auf der alles andere ruht — Kandidaten sind Vorschläge, die
Aufnahme bleibt der bestehende Vorgang. Eine Zusage in der Dokumentation ist keine; hier
wird sie über den Syntaxbaum erzwungen, damit sie ein Versehen nicht aufweichen kann.
"""
from __future__ import annotations

import ast
from pathlib import Path

QUELLEN = Path(__file__).resolve().parents[1] / "src" / "atlas_scout"
SCHREIBEND = {"write_text", "write_bytes", "unlink", "rename", "replace", "mkdir", "rmdir"}
ATLAS_DATEIEN = ("atlas.json", "werke.json")


def _module():
    return sorted(QUELLEN.rglob("*.py"))


def test_kein_modul_nennt_einen_atlas_pfad_in_einem_schreibaufruf():
    for pfad in _module():
        baum = ast.parse(pfad.read_text(encoding="utf-8"))
        for knoten in ast.walk(baum):
            if not isinstance(knoten, ast.Call) or not isinstance(knoten.func, ast.Attribute):
                continue
            if knoten.func.attr not in SCHREIBEND:
                continue
            quelltext = ast.unparse(knoten)
            for datei in ATLAS_DATEIEN:
                assert datei not in quelltext, (
                    f"{pfad.name}: Schreibaufruf berührt {datei} — der Scout nimmt nicht auf"
                )


def test_atlas_modul_oeffnet_nur_lesend():
    """`atlas.py` ist das einzige Modul, das die Atlanten anfasst — und nur lesend."""
    baum = ast.parse((QUELLEN / "atlas.py").read_text(encoding="utf-8"))
    for knoten in ast.walk(baum):
        if isinstance(knoten, ast.Call) and isinstance(knoten.func, ast.Attribute):
            assert knoten.func.attr not in SCHREIBEND, (
                f"atlas.py ruft {knoten.func.attr} auf — das Modul liest ausschließlich"
            )


def test_ausgabe_liegt_ausserhalb_der_atlas_verzeichnisse():
    from atlas_scout.run import AUSGABE

    teile = AUSGABE.parts
    assert "kandidaten" in teile
    assert "data" not in teile, "Kandidaten gehören nicht in src/data — dort liegen die Atlanten"


def test_annotation_traegt_immer_modell_und_prompt_hash():
    """Ein Modellvorschlag ohne Herkunft wäre eine unbelegte Behauptung im Archiv."""
    from dataclasses import fields

    from atlas_scout.model import Annotation

    namen = {f.name for f in fields(Annotation)}
    assert {"modell", "prompt_sha256", "erzeugt_am"} <= namen
