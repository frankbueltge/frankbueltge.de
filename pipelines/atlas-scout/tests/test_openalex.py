"""Auflösung des Saatguts auf ein OpenAlex-Werk.

Regression 2026-07-25: Die Titelsuche löste Schwabs „Experimental Systems" auf ein
erdwissenschaftliches Paper auf; der Lauf schlug daraufhin Meteorologie-Datensätze für
einen Atlas künstlerischer Forschung vor. Ein falsch aufgelöstes Saatgut vergiftet die
gesamte Nachbarschaft — deshalb muss der Autor stimmen.
"""
from __future__ import annotations

from atlas_scout.sources.openalex import _autor_passt, _als_rohfund


def werk(*namen: str) -> dict:
    return {"authorships": [{"author": {"display_name": n}} for n in namen]}


def test_treffer_mit_passendem_nachnamen_wird_angenommen():
    assert _autor_passt(werk("Michael Schwab", "Henk Borgdorff"), "Michael Schwab")


def test_treffer_mit_fremdem_autor_wird_abgelehnt():
    fremd = werk("Jie He", "Kun Yang", "Wenjun Tang")
    assert not _autor_passt(fremd, "Michael Schwab")


def test_vorname_allein_genuegt_nicht_zum_ausschluss():
    """Mehrere Autoren, einer passt — das reicht."""
    assert _autor_passt(werk("Someone Else", "Christopher Frayling"), "Christopher Frayling")


def test_leeres_autorfeld_laesst_den_treffer_durch():
    """Der Atlas führt vereinzelt Werke ohne Autor — dann gibt es nichts zu prüfen."""
    assert _autor_passt(werk("Irgendwer"), "")


def test_kurze_partikel_fuehren_nicht_zu_scheintreffern():
    """„van", „de", „of" dürfen keinen Treffer begründen — daher erst ab drei Buchstaben."""
    assert not _autor_passt(werk("Ada de Vries"), "Jan de Bont")


def test_rohfund_bevorzugt_frei_zugaengliche_fassung():
    fund = _als_rohfund({
        "title": "Ein Text",
        "doi": "https://doi.org/10.1/x",
        "best_oa_location": {"landing_page_url": "https://repo.example/volltext"},
        "authorships": [{"author": {"display_name": "A. Autorin"}}],
        "publication_year": 2020,
        "cited_by_count": 7,
    }, "cites:W1")
    assert fund["url"] == "https://repo.example/volltext"
    assert fund["doi"] == "10.1/x"
    assert fund["signale"]["frei_zugaenglich"] is True


def test_rohfund_ohne_titel_wird_verworfen():
    assert _als_rohfund({"title": "", "id": "https://openalex.org/W1"}, "cites:W1") is None
