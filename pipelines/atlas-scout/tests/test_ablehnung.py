"""Grenzprüfung des Ablehnungsverzeichnisses: Was darf zurückgenommen werden — und was nie."""
from __future__ import annotations

import json
from pathlib import Path

from atlas_scout.ablehnung import (
    ist_abgelehnt,
    lies_register,
    pruefe_ablehnungen,
    schreibe_register,
    wende_an,
)

BELEG = (
    "field-research/works/2026-07-25-no-signal-to-extend/scripts/filter_corpus_api.py:94 "
    "— die Kennung steht dort als Beispiel in einem Docstring, nicht als Quelle."
)


def _katalog() -> list[dict]:
    return [
        {
            "id": "docstring-beispiel",
            "kennung": "arXiv:2501.01234",
            "titel": "Impact of QCD sum rules coupling constants on neutron stars",
            "relevanz": "Von field zitiert.",
            "relevanz_herkunft": "gebrauch",
        },
        {
            "id": "von-der-praxis-begruendet",
            "kennung": "10.1215/2834703x-11700255",
            "titel": "Ein Text, den eine Praxis gelesen hat",
            "relevanz": "Diesen Satz hat eine Praxis geschrieben.",
            "relevanz_herkunft": "praxis",
        },
        {
            "id": "maschinell-beurteilt",
            "kennung": "10.1000/urteil",
            "titel": "Ein Text mit Modellurteil",
            "relevanz": "Diesen Satz hat ein Modell geschrieben.",
            "relevanz_herkunft": "urteil",
        },
    ]


def test_ein_praxis_satz_kann_nicht_abgelehnt_werden():
    """Die Schranke, die nie fällt.

    Hat eine Praxis geschrieben, warum ein Eintrag zählt, dann hat jemand den Text
    gelesen — das Einzige in diesem Katalog, was sich nicht herstellen lässt. Eine
    Ablehnung würde ihn samt Eintrag tilgen, nicht nur überschreiben. Deshalb ist die
    Regel hier schärfer als in urteil.py.
    """
    beanstandet = pruefe_ablehnungen(
        [{"id": "von-der-praxis-begruendet", "grund": "kein-zitat", "beleg": BELEG}],
        _katalog(),
    )
    assert beanstandet, "eine Praxis-Begründung darf nie weggenommen werden"
    assert "Praxis" in beanstandet[0]


def test_ein_modellurteil_ist_nicht_geschuetzt():
    """Ein Maschinensatz ist ersetzbar — sonst wäre der Katalog gegen sich selbst blind."""
    assert pruefe_ablehnungen(
        [{"id": "maschinell-beurteilt", "grund": "kein-zitat", "beleg": BELEG}],
        _katalog(),
    ) == []


def test_ein_grund_ausserhalb_der_liste_wird_abgewiesen():
    """Geschlossene Liste: Ein freier Grund macht das Verzeichnis zur Erlaubnis,
    alles zu entfernen, wofür sich eine Formulierung findet."""
    beanstandet = pruefe_ablehnungen(
        [{"id": "docstring-beispiel", "grund": "passt-nicht", "beleg": BELEG}],
        _katalog(),
    )
    assert any("erlaubt" in b for b in beanstandet)


def test_ein_duenner_beleg_wird_abgewiesen():
    """Ohne Beleg ist eine Ablehnung eine Behauptung."""
    beanstandet = pruefe_ablehnungen(
        [{"id": "docstring-beispiel", "grund": "kein-zitat", "beleg": "passt nicht"}],
        _katalog(),
    )
    assert any("Beleg zu dünn" in b for b in beanstandet)


def test_eine_unbekannte_id_wird_abgewiesen():
    beanstandet = pruefe_ablehnungen(
        [{"id": "gibt-es-nicht", "grund": "kein-zitat", "beleg": BELEG}], _katalog()
    )
    assert any("kein Eintrag" in b for b in beanstandet)


def test_das_verzeichnis_haelt_den_ganzen_eintrag_fest():
    """Umkehrbar: Man muss sehen können, WAS entfernt wurde, nicht nur DASS."""
    verbleibend, verzeichnis = wende_an(
        _katalog(),
        [{"id": "docstring-beispiel", "grund": "kein-zitat", "beleg": BELEG}],
        wer="claude-opus-5",
        am="2026-07-30",
        sitzung="probe",
    )
    assert len(verbleibend) == 2
    assert len(verzeichnis) == 1
    v = verzeichnis[0]
    assert v["grund"] == "kein-zitat"
    assert v["wer"] == "claude-opus-5"
    assert v["eintrag"]["titel"].startswith("Impact of QCD")
    assert v["eintrag"]["kennung"] == "arXiv:2501.01234"


def test_gesperrt_wird_ueber_die_kennung_nicht_die_id(tmp_path: Path):
    """Die id wird aus Autor und Titel abgeleitet und ändert sich, wenn die Quelle ihre
    Angaben korrigiert — dann käme der abgelehnte Eintrag unter neuer id zurück."""
    _, verzeichnis = wende_an(
        _katalog(),
        [{"id": "docstring-beispiel", "grund": "kein-zitat", "beleg": BELEG}],
        wer="claude-opus-5",
        am="2026-07-30",
        sitzung="probe",
    )
    gesperrt = ist_abgelehnt(verzeichnis)
    assert gesperrt == {"arxiv:2501.01234"}, "kleingeschrieben, damit der Vergleich trägt"


def test_verzeichnis_ueberlebt_die_runde_durch_die_datei(tmp_path: Path):
    _, verzeichnis = wende_an(
        _katalog(),
        [{"id": "docstring-beispiel", "grund": "kein-zitat", "beleg": BELEG}],
        wer="claude-opus-5",
        am="2026-07-30",
        sitzung="probe",
    )
    schreibe_register(tmp_path, verzeichnis)
    wieder = lies_register(tmp_path)
    assert wieder == verzeichnis
    assert ist_abgelehnt(wieder) == {"arxiv:2501.01234"}


def test_fehlendes_verzeichnis_ist_leer_kein_fehler(tmp_path: Path):
    assert lies_register(tmp_path) == []
    assert ist_abgelehnt([]) == set()
