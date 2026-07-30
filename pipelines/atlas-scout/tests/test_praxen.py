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


def test_provenienzmaterial_zaehlt_nicht_als_zitat(tmp_path: Path):
    """Ein Auflösungsprotokoll ist ein UNTERSUCHTES Objekt, keine Quelle.

    Gemessen am 2026-07-28: 200 der 332 Saatkörner kamen aus einer einzigen Datei —
    `works/…/provenance/register-records/aufloesungen.jsonl`, den GBIF-Downloads, die
    ein Werk am Dataset Register gemessen hat. Ungefiltert hätten sie den Katalog mit
    Biodiversitäts-Downloads geflutet: genau die Masse, für die das Register am Vortag
    zurückgebaut wurde.
    """
    _repo(tmp_path, "field-research", {
        "journal/2026-07-01.md": "Gelesen: https://doi.org/10.1215/2834703X-11700255",
        "works/w/provenance/register-records/aufloesungen.jsonl":
            '{"quell_id": "10.15468/dl.u9d3ap", "http_status": 403}',
        "memory/rohdaten/messung.json": '{"doi": "10.9999/gemessen-nicht-zitiert"}',
    })
    saat = sammle(tmp_path, {"field": "field-research"})
    kennungen = {k.kennung for k in saat.koerner}
    assert "10.1215/2834703x-11700255" in kennungen, "echtes Zitat bleibt"
    assert "10.15468/dl.u9d3ap" not in kennungen, "Provenienzprotokoll fällt weg"
    assert "10.9999/gemessen-nicht-zitiert" not in kennungen, "Rohdaten fallen weg"


def test_ein_abzug_des_eigenen_katalogs_zaehlt_nicht_als_zitat(tmp_path: Path):
    """Ein Spiegel bezeugt nicht, dass jemand gegriffen hat — nur, dass der Katalog reiste.

    Gemessen am 2026-07-30: Fields Provenienz-Audit hält den Paper-Katalog eingefroren,
    um dessen Provenienzansprüche gegen das eigene Repo zu prüfen. Der Lauf las den Abzug
    wie jede andere Datei — **79 Einträge trugen daraufhin das Etikett „von field
    zitiert", deren einziger field-Beleg dieser Spiegel war.** Als Zitat gewertet wächst
    die Zahl mit dem Katalog statt mit der Forschung.

    Erkannt an der Schema-Signatur, nicht am Dateinamen: `.frozen` ist Fields Konvention,
    die nächste Praxis spiegelt unter anderem Namen.
    """
    spiegel = json.dumps([{
        "id": "x", "kennung": "10.5555/nur-im-spiegel", "titel": "T",
        "aufnahmegrund": "zitiert", "relevanz_herkunft": "praxis",
        "zitiert_von": ["atelier"], "fundstellen": ["ulysses/journal/2026-07-01.md"],
    }])
    _repo(tmp_path, "field-research", {
        "journal/2026-07-01.md": "Gelesen: https://doi.org/10.1215/2834703X-11700255",
        # Anderer Name als Fields `.frozen.json` — der Filter darf daran nicht hängen.
        "drafts/audit/sources/katalog.pinned.json": spiegel,
        # Ein echtes Literaturverzeichnis trägt keinen `aufnahmegrund` und bleibt.
        "works/w/quellen.json": '[{"doi": "10.7551/mitpress/1234.001.0001", "note": "gelesen"}]',
    })
    saat = sammle(tmp_path, {"field": "field-research"})
    kennungen = {k.kennung for k in saat.koerner}
    assert "10.1215/2834703x-11700255" in kennungen, "echtes Zitat bleibt"
    assert "10.7551/mitpress/1234.001.0001" in kennungen, "echtes Verzeichnis bleibt"
    assert "10.5555/nur-im-spiegel" not in kennungen, "der Abzug des Katalogs fällt weg"


def test_das_wort_aufnahmegrund_in_prosa_ist_kein_spiegel(tmp_path: Path):
    """Geprüft wird der geparste Eintrag, nicht der Text.

    Eine Praxis, die ÜBER den Katalog schreibt, zitiert dabei oft echte Quellen. Ein
    Filter, der auf das blanke Wort anspringt, verschlänge genau die Notizen, in denen
    am dichtesten über die Kataloge nachgedacht wird.
    """
    _repo(tmp_path, "field-research", {
        "notes/katalog-kritik.md":
            "Der `aufnahmegrund` ist eine Regel, die `relevanz_herkunft` ein Urteil — "
            "vgl. https://doi.org/10.1215/2834703X-11700255",
    })
    saat = sammle(tmp_path, {"field": "field-research"})
    assert {k.kennung for k in saat.koerner} == {"10.1215/2834703x-11700255"}


def test_eine_pruefziel_liste_zaehlt_nicht_als_zitat(tmp_path: Path):
    """`…-probe` ist bei field Konvention für „eine Messung an Zielen".

    Gemessen am 2026-07-30: `notes/2026-07-16-half-life-archival-probe/urls.json` hält
    513 Prüfziele einer Archiv-Halbwertszeit-Messung. Zwei davon standen als „von field
    zitiert" im Katalog. Beide sind für Fields Gegenmessung inhaltlich einschlägig — und
    genau das macht den Fehler heikel: `aufnahmegrund: zitiert` wäre dort eine Unwahrheit
    über eine wahre Sache.
    """
    _repo(tmp_path, "field-research", {
        "journal/2026-07-01.md": "Gelesen: https://doi.org/10.1215/2834703X-11700255",
        "notes/2026-07-16-half-life-archival-probe/urls.json":
            '[{"url": "https://doi.org/10.1186/s13031-024-00580-x", "stratum": "fa-self"}]',
    })
    saat = sammle(tmp_path, {"field": "field-research"})
    kennungen = {k.kennung for k in saat.koerner}
    assert "10.1215/2834703x-11700255" in kennungen, "echtes Zitat bleibt"
    assert "10.1186/s13031-024-00580-x" not in kennungen, "das Prüfziel fällt weg"
