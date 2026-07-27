"""Grenzprüfung des Katalogbaus: Auflösungsleiter, Feldhinweis, Zusammenführung."""
from __future__ import annotations

from atlas_scout.katalog import (
    Katalogeintrag,
    _doi_leiter,
    _felder_aus_begriffen,
    fuehre_zusammen,
)


def _eintrag(**abweichung) -> Katalogeintrag:
    grund = dict(
        id="x", titel="Ein Titel", urheber=("Ada Lovelace",), jahr=2024, ort="",
        kennung="10.1/a", url="https://example.invalid", frei_zugaenglich=False,
        felder=(), zusammenfassung="", relevanz="…", relevanz_herkunft="gebrauch",
        zitiert_von=("atelier",), zuletzt_gebraucht="2026-07-01", verify_status="toVerify",
    )
    return Katalogeintrag(**{**grund, **abweichung})


class TestDoiLeiter:
    def test_probiert_von_lang_nach_kurz(self):
        assert _doi_leiter("10.1215/2834703x-11700255/401267/rethinking") == [
            "10.1215/2834703x-11700255/401267/rethinking",
            "10.1215/2834703x-11700255/401267",
            "10.1215/2834703x-11700255",
        ]

    def test_laesst_echte_mehrteilige_dois_ganz(self):
        """`10.7551/mitpress/11810.001.0001` ist echt — die volle Fassung kommt zuerst."""
        assert _doi_leiter("10.7551/mitpress/11810.001.0001")[0] == (
            "10.7551/mitpress/11810.001.0001"
        )

    def test_kuerzt_nie_unter_praefix_plus_ein_segment(self):
        assert _doi_leiter("10.1038/abc") == ["10.1038/abc"]


class TestFeldhinweis:
    def test_trifft_an_wortgrenzen(self):
        assert 7 in _felder_aus_begriffen("On model collapse in generative systems")

    def test_trifft_nicht_in_wortteilen(self):
        """„care" darf nicht in „scarce" anschlagen — gemessen am 2026-07-27."""
        assert _felder_aus_begriffen("Water is scarce in escalating models") != ()
        assert 11 not in _felder_aus_begriffen("a scarce resource")

    def test_ohne_treffer_bleibt_leer(self):
        assert _felder_aus_begriffen("Zur Chemie der Zuckerrübe") == ()


class TestZusammenfuehrung:
    def test_gleiche_kennung_wird_eins(self):
        zusammen = fuehre_zusammen([_eintrag(), _eintrag(id="y")])
        assert len(zusammen) == 1

    def test_praxen_werden_vereinigt(self):
        """Ein Text, den mehrere Praxen brauchen, ist ein stärkerer Eintrag —
        die Zusammenführung darf das nicht verschlucken."""
        zusammen = fuehre_zusammen([
            _eintrag(zitiert_von=("atelier",)),
            _eintrag(zitiert_von=("field", "meridian")),
        ])
        assert zusammen[0].zitiert_von == ("atelier", "field", "meridian")

    def test_juengstes_datum_gewinnt(self):
        zusammen = fuehre_zusammen([
            _eintrag(zuletzt_gebraucht="2026-07-01"),
            _eintrag(zuletzt_gebraucht="2026-07-26"),
        ])
        assert zusammen[0].zuletzt_gebraucht == "2026-07-26"

    def test_preprint_und_veroeffentlichung_werden_eins(self):
        """arXiv:2406.07016 und 10.1126/sciadv.adt3813 sind ein Text (gemessen 27.07.)."""
        zusammen = fuehre_zusammen([
            _eintrag(kennung="arXiv:2406.07016", zitiert_von=("field",)),
            _eintrag(kennung="10.1126/sciadv.adt3813", zitiert_von=("atelier",)),
        ])
        assert len(zusammen) == 1
        # Bei gleichem Begründungsrang führt die DOI (zitierfähig, dauerhaft).
        assert zusammen[0].kennung == "10.1126/sciadv.adt3813"
        assert zusammen[0].weitere_kennungen == ("arXiv:2406.07016",)

    def test_geschriebene_begruendung_wiegt_schwerer_als_die_doi(self):
        """Gemessen am 27.07. an arXiv:1801.04486 / 10.3390/arts7020018: Steht der Satz
        am Preprint, führt der Preprint. Der Satz ist das Seltenere."""
        zusammen = fuehre_zusammen([
            _eintrag(kennung="arXiv:1801.04486", relevanz_herkunft="praxis"),
            _eintrag(kennung="10.3390/arts7020018", relevanz_herkunft="gebrauch"),
        ])
        assert zusammen[0].kennung == "arXiv:1801.04486"
        assert zusammen[0].weitere_kennungen == ("10.3390/arts7020018",)

    def test_geschriebene_begruendung_schlaegt_gebrauchsbeleg(self):
        zusammen = fuehre_zusammen([
            _eintrag(relevanz="Cited by …", relevanz_herkunft="gebrauch"),
            _eintrag(relevanz="Weil es die Methode benennt.", relevanz_herkunft="praxis",
                     verify_status="verified"),
        ])
        assert zusammen[0].relevanz_herkunft == "praxis"
        assert zusammen[0].verify_status == "verified"

    def test_verschiedene_texte_bleiben_getrennt(self):
        zusammen = fuehre_zusammen([
            _eintrag(kennung="10.1/a", titel="Erstes Werk"),
            _eintrag(kennung="10.1/b", titel="Zweites Werk"),
        ])
        assert len(zusammen) == 2

    def test_gleicher_titel_anderer_autor_bleibt_getrennt(self):
        """Titel allein ist zu grob — openalex.py dokumentiert den Fall
        „Experimental Systems", wo die Titelsuche ein fremdes Paper traf."""
        zusammen = fuehre_zusammen([
            _eintrag(kennung="10.1/a", titel="Experimental Systems",
                     urheber=("Hans-Jörg Rheinberger",)),
            _eintrag(kennung="10.1/b", titel="Experimental Systems",
                     urheber=("Jane Doe",)),
        ])
        assert len(zusammen) == 2
