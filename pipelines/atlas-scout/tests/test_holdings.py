"""Grenzprüfung des Holdings-Adapters: Was zählt als benutzte Datenquelle."""
from __future__ import annotations

from pathlib import Path

from atlas_scout.holdings import ist_vorlage, sammle


def test_vorlagen_sind_keine_adressen():
    """Beobachtet am 2026-07-28: `…/winners{jahr}` wurde bei `{jahr` abgeschnitten und
    geprüft — HTTP 404. Das ist ein Befund über den Ausschnitt, nicht über die Quelle."""
    assert ist_vorlage("https://x.invalid/winners{jahr")
    assert ist_vorlage("https://x.invalid/data/%s.json")
    assert ist_vorlage("https://x.invalid/${jahr}/d")
    assert not ist_vorlage("https://x.invalid/data/2026.json")


def _schreibe(wurzel: Path, pfad: str, inhalt: str) -> None:
    ziel = wurzel / pfad
    ziel.parent.mkdir(parents=True, exist_ok=True)
    ziel.write_text(inhalt, encoding="utf-8")


def test_findet_quellen_mit_werk_und_fundstelle(tmp_path: Path):
    _schreibe(tmp_path, "pipelines/protokoll/src/protokoll/fetch.py",
              'URL = "https://firms.modaps.eosdis.nasa.gov/api/area"')
    quellen, _ = sammle(tmp_path)
    q = next(x for x in quellen if "nasa.gov" in x.host)
    assert q.werke == ("protokoll",)
    assert q.bezuege[0].datei.endswith("fetch.py")


def test_werkzeug_zaehlt_nicht_als_datenquelle(tmp_path: Path):
    """Ein Paketverzeichnis wird abgerufen, ist aber Werkzeug, nicht Gegenstand."""
    _schreibe(tmp_path, "pipelines/x/src/x/a.py",
              'A = "https://pypi.org/simple"\nB = "https://data.giss.nasa.gov/gistemp/"')
    quellen, vermerke = sammle(tmp_path)
    hosts = {q.host for q in quellen}
    assert "data.giss.nasa.gov" in hosts
    assert "pypi.org" not in hosts
    assert any("pypi.org" in v for v in vermerke), "Ausschluss wird vermerkt, nicht verschwiegen"


def test_wissenschaftliche_nachweise_gehen_in_den_paper_katalog(tmp_path: Path):
    """Ohne diese Trennung stünde derselbe Gegenstand in beiden Beständen."""
    _schreibe(tmp_path, "pipelines/x/src/x/a.py", 'D = "https://doi.org/10.1234/x"')
    quellen, vermerke = sammle(tmp_path)
    assert not any("doi.org" in q.host for q in quellen)
    assert any("Paper-Katalog" in v for v in vermerke)
