"""Struktur-Wächter: Nichts, was `main()` braucht, darf hinter dem __main__-Block stehen.

**Der Fall (2026-07-28 bis 07-30).** `bewahre_urteile()` wurde ans Dateiende angehängt —
hinter `if __name__ == "__main__": sys.exit(main())`. Beim Modulaufruf läuft die Datei von
oben nach unten: main() startet, bevor die Funktion existiert, und stürzt mit NameError ab.

Der nächtliche Lauf tat das zwei Tage lang und meldete trotzdem ERFOLG, weil die Ausgabe
durch `tee` lief und `tee` gelang. Niemand wurde rot. Dass die 27 Urteile überlebten, lag
nicht daran, dass die Bewahrung griff — die Datei wurde schlicht nie geschrieben.

Ein Unit-Test der Funktion selbst hätte das nie gefunden: Unter pytest wird das Modul
importiert, nicht ausgeführt, und dann sind alle Definitionen da. Deshalb prüft dieser Test
die REIHENFOLGE im Quelltext, nicht das Verhalten.
"""
from __future__ import annotations

import ast
from pathlib import Path

import pytest

MODULE = sorted((Path(__file__).resolve().parents[1] / "src" / "atlas_scout").glob("*.py"))


@pytest.mark.parametrize("pfad", MODULE, ids=lambda p: p.name)
def test_keine_definition_hinter_dem_main_block(pfad: Path):
    baum = ast.parse(pfad.read_text(encoding="utf-8"))

    wächter = [
        k for k in baum.body
        if isinstance(k, ast.If)
        and any(
            isinstance(v, ast.Compare)
            and isinstance(v.left, ast.Name)
            and v.left.id == "__name__"
            for v in ast.walk(k.test)
        )
    ]
    if not wächter:
        pytest.skip("kein __main__-Block")

    grenze = wächter[0].lineno
    danach = [
        k.name
        for k in baum.body
        if isinstance(k, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef))
        and k.lineno > grenze
    ]
    assert not danach, (
        f"{pfad.name}: {danach} stehen hinter dem __main__-Block. Beim Modulaufruf "
        f"(python -m …) läuft main(), bevor sie definiert sind → NameError."
    )
