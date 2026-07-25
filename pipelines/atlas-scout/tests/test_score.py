"""Die Bewertung entscheidet, was ein Mensch zu sehen bekommt — sie steht unter Testschutz.

Geprüft wird die mechanische Messung (`sammle_signale`), nicht die Setzung (`gewichte`):
Die Gewichtung darf sich ändern, die Messung nicht stillschweigend.
"""
from __future__ import annotations

from atlas_scout.atlas import Eintrag
from atlas_scout.score import SCHWELLE, gewichte, sammle_signale

SAAT = Eintrag(
    id="frayling-research-in-art-and-design",
    titel="Research in Art and Design",
    urheber="Christopher Frayling",
    jahr=1993,
    url="https://researchonline.rca.ac.uk/384/",
    doi=None,
    schlagworte=("artistic-research", "practice-as-research", "epistemologie"),
)


def rohfund(**felder):
    basis = {
        "titel": "Ein anderer Text", "urheber": "Jemand", "jahr": 2020,
        "url": "https://example.org/x", "doi": None, "abfrage": "cites:W1",
        "signale": {"zitationen": 0, "frei_zugaenglich": False, "begriffe": []},
    }
    basis.update(felder)
    return basis


def test_signale_liegen_im_einheitsintervall():
    s = sammle_signale(rohfund(signale={"zitationen": 99999, "frei_zugaenglich": True,
                                        "begriffe": ["artistic research"]}), SAAT, 2026)
    assert all(0.0 <= wert <= 1.0 for wert in s.values()), s


def test_rezeption_ist_log_gestaucht_nicht_linear():
    wenig = sammle_signale(rohfund(signale={"zitationen": 100}), SAAT, 2026)["rezeption"]
    viel = sammle_signale(rohfund(signale={"zitationen": 10000}), SAAT, 2026)["rezeption"]
    assert viel > wenig
    assert viel < wenig * 10, "ein Klassiker darf nicht alles andere erschlagen"


def test_nach_saatgut_erkennt_fortsetzung_der_debatte():
    assert sammle_signale(rohfund(jahr=2020), SAAT, 2026)["nach_saatgut"] == 1.0
    assert sammle_signale(rohfund(jahr=1980), SAAT, 2026)["nach_saatgut"] == 0.0


def test_fehlendes_jahr_kippt_nicht_um():
    s = sammle_signale(rohfund(jahr=None), SAAT, 2026)
    assert s["aktualitaet"] == 0.0 and s["nach_saatgut"] == 0.0


def test_begriffsnaehe_greift_bei_teilweiser_ueberschneidung():
    s = sammle_signale(
        rohfund(signale={"zitationen": 0, "begriffe": ["artistic research", "pedagogy"]}),
        SAAT, 2026,
    )
    assert s["begriffsnaehe"] > 0.0


def test_titel_echo_wird_hart_verworfen():
    s = sammle_signale(rohfund(titel="Research in Art and Design"), SAAT, 2026)
    punkte, begruendung = gewichte(s)
    assert punkte == 0.0
    assert "Titel identisch" in begruendung[0]


def test_gewichtung_liefert_begruendung_zu_jeder_punktzahl():
    s = sammle_signale(rohfund(signale={"zitationen": 500, "frei_zugaenglich": True,
                                        "begriffe": ["artistic research"]}), SAAT, 2026)
    punkte, begruendung = gewichte(s)
    assert punkte > SCHWELLE
    assert begruendung and all(isinstance(g, str) for g in begruendung)


def test_leerer_fund_bleibt_unter_der_schwelle():
    punkte, _ = gewichte(sammle_signale(rohfund(jahr=None), SAAT, 2026))
    assert punkte < SCHWELLE
