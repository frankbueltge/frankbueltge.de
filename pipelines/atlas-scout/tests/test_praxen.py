"""Grenzprüfung des Saatguts: Was zählt als Zitat einer Praxis — und was nicht."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import pytest

from atlas_scout.praxen import sammle


def _repo(wurzel: Path, name: str, dateien: dict[str, str]) -> Path:
    """Legt ein Mini-Repo mit einem Commit an — `sammle` fragt git nach dem Datum."""
    pfad = wurzel / name
    for rel, inhalt in dateien.items():
        ziel = pfad / rel
        ziel.parent.mkdir(parents=True, exist_ok=True)
        ziel.write_text(inhalt, encoding="utf-8")
    subprocess.run(["git", "init", "-q", str(pfad)], check=True)
    subprocess.run(["git", "-C", str(pfad), "add", "-A"], check=True)
    subprocess.run(
        ["git", "-C", str(pfad), "-c", "user.name=t", "-c", "user.email=t@t.invalid",
         "commit", "-qm", "saat"],
        check=True,
    )
    return pfad


@pytest.fixture
def wurzel(tmp_path: Path) -> Path:
    _repo(tmp_path, "ulysses", {
        "journal/2026-07-01.md": "Gelesen: https://doi.org/10.1215/2834703X-11700255 — und "
                                 "https://arxiv.org/abs/2305.17493v3 dazu.",
        "tests/test_zitate.py": "DOI = '10.1038/never-reached'",
    })
    _repo(tmp_path, "field-research", {
        # Dieselbe arXiv-Kennung wie oben, andere Praxis → EIN Korn, zwei Praxen.
        "memory/claims.md": "vgl. arxiv.org/abs/2305.17493",
    })
    return tmp_path


def test_zitate_werden_zu_saatkoernern(wurzel: Path):
    saat = sammle(wurzel, {"atelier": "ulysses", "field": "field-research"})
    kennungen = {k.kennung for k in saat.koerner}
    assert "10.1215/2834703x-11700255" in kennungen, "DOI wird kleingeschrieben normalisiert"
    assert "2305.17493" in kennungen, "arXiv-Version (v3) gehört nicht in die Kennung"


def test_testdateien_zaehlen_nicht_als_zitat(wurzel: Path):
    """Erfundene Kennungen aus Zitationstests sind Attrappen, keine Gebrauchsbelege.

    Ohne diesen Filter kamen am 27.07. 18 von 152 Saatkörnern aus Testvorrichtungen —
    der Scout würde von Attrappen aus suchen.
    """
    saat = sammle(wurzel, {"atelier": "ulysses"})
    assert all("never-reached" not in k.kennung for k in saat.koerner)


def test_dasselbe_zitat_aus_zwei_praxen_ist_ein_korn(wurzel: Path):
    saat = sammle(wurzel, {"atelier": "ulysses", "field": "field-research"})
    korn = next(k for k in saat.koerner if k.kennung == "2305.17493")
    assert korn.praxen == ("atelier", "field")
    assert len(korn.fundstellen) == 2, "beide Fundstellen bleiben nachweisbar"


def test_fehlendes_repo_wird_vermerkt_nicht_ueberbrueckt(wurzel: Path):
    """Ein fehlendes Repo darf nie wie „diese Praxis zitiert nichts" aussehen."""
    saat = sammle(wurzel, {"atelier": "ulysses", "studio": "gibt-es-nicht"})
    assert [a.praxis for a in saat.ausfaelle] == ["studio"]
    assert "ulysses" in saat.gelesene_repos and "gibt-es-nicht" not in saat.gelesene_repos


def test_json_ist_vollstaendig_und_lesbar(wurzel: Path):
    saat = sammle(wurzel, {"atelier": "ulysses", "field": "field-research"})
    daten = json.loads(saat.als_json())
    assert daten["schema_version"] == "1"
    korn = next(k for k in daten["koerner"] if k["kennung"] == "2305.17493")
    # Herkunft muss am Korn hängen: WER hat wann zitiert.
    assert korn["praxen"] == ["atelier", "field"]
    assert korn["juengste_nennung"] and korn["fundstellen"][0]["datei"]
