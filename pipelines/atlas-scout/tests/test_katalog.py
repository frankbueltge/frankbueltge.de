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
        weg="praxis", aufnahmegrund="zitiert", fundstellen=("ulysses/journal/x.md",),
        geprueft=True, pruef_status=200, pruef_vermerk=None,
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


class TestBelegpflicht:
    """Franks Vorgabe, 2026-07-28 (Wortlaut privat): alles muss geprüft und annotiert sein —
    woher es kommt und warum es in Kataloge und Register aufgenommen wurde.

    Diese Prüfungen halten die Pflicht fest. Ein Eintrag ohne Weg, ohne Aufnahmegrund
    oder ohne Fundstelle ist kein Katalogeintrag, sondern eine Behauptung.
    """

    def test_jeder_eintrag_traegt_weg_grund_und_fundstelle(self):
        e = _eintrag()
        assert e.weg in {"praxis", "scout"}
        assert e.aufnahmegrund in {"zitiert", "kuratiert", "nachbarschaft"}
        assert e.fundstellen, "ohne Fundstelle ist der Eintrag nicht belegt"

    def test_zusammenfuehrung_sammelt_fundstellen_statt_sie_zu_verlieren(self):
        """Der Beleg wächst beim Zusammenführen, er schrumpft nicht."""
        zusammen = fuehre_zusammen([
            _eintrag(fundstellen=("ulysses/journal/a.md",)),
            _eintrag(fundstellen=("field-research/memory/claims.md",)),
        ])
        assert set(zusammen[0].fundstellen) == {
            "ulysses/journal/a.md", "field-research/memory/claims.md"
        }

    def test_eine_bestaetigte_pruefung_setzt_sich_durch(self):
        """Wurde EINE der zusammengeführten Adressen bestätigt, gilt der Text als
        erreichbar — die anderen Fassungen ändern daran nichts."""
        zusammen = fuehre_zusammen([
            _eintrag(geprueft=False, pruef_status=None, pruef_vermerk="noch nicht angefragt"),
            _eintrag(geprueft=True, pruef_status=200, pruef_vermerk=None),
        ])
        assert zusammen[0].geprueft is True
        assert zusammen[0].pruef_status == 200
        assert zusammen[0].pruef_vermerk is None


def test_nur_echte_iso_daten_kommen_ins_datumsfeld():
    """Gemessen am 2026-07-28: Ulysses' session_read führt einmal `tick 2026-07-22`.
    Wörtlich übernommen sortierte dieser Wert über den 27.07. — „t" kommt hinter jeder
    Ziffer. Wörtlichkeit gilt für Prosa; ein Sortierfeld muss auch die Form haben."""
    from atlas_scout.sammlungen import _lesedatum

    assert _lesedatum("2026-07-22") == "2026-07-22"
    assert _lesedatum("tick 2026-07-22") == "2026-07-22"
    assert _lesedatum("irgendwann") is None
    assert _lesedatum(None) is None


def test_abstract_wird_aus_dem_invertierten_index_zurueckgebaut():
    """OpenAlex speichert Abstracts invertiert. Zurückgebaut, nicht umformuliert."""
    from atlas_scout.katalog import _abstract

    werk = {"abstract_inverted_index": {"Model": [0], "collapse": [1], "is": [2], "real": [3]}}
    assert _abstract(werk) == "Model collapse is real"
    assert _abstract({}) == ""
    assert _abstract({"abstract_inverted_index": None}) == ""


def test_titel_auszeichnung_verhindert_keine_zusammenfuehrung():
    """OpenAlex liefert Titel teils mit HTML. Unbereinigt hielt die Normalisierung
    „i gaia i edr3" gegen „gaia edr3" — dieselbe Arbeit stand zweimal im Katalog."""
    from atlas_scout.katalog import _aus_openalex

    werk = {"title": "A classifier for spurious solutions in <i>Gaia</i> eDR3",
            "authorships": [], "concepts": []}
    assert _aus_openalex(werk)["titel"] == "A classifier for spurious solutions in Gaia eDR3"


class TestUrteileUeberleben:
    """Ein Katalog, der seine Beurteilung nächtlich vergisst, kann nur sammeln.

    Bis 2026-07-28 schrieb der nächtliche Bau papers.json ungelesen über — der Lauf um
    05:30 UTC hätte alle 27 Urteile gelöscht. Urteile folgen aus keiner Quelle und kommen
    durch keinen Abruf zurück.
    """

    def test_urteil_ueberlebt_den_neubau(self):
        from atlas_scout.katalog import bewahre_urteile

        alt = [{"id": "x", "kennung": "10.1/a", "relevanz_herkunft": "urteil",
                "relevanz": "Ein geschriebenes Urteil.",
                "urteil": {"modell": "m", "am": "2026-07-28",
                           "grundlage": "abstract", "sitzung": "s"},
                "verify_status": "toVerify"}]
        neu = bewahre_urteile([_eintrag(id="x", relevanz_herkunft="gebrauch",
                                        relevanz="Cited by …")], alt)
        assert neu[0].relevanz == "Ein geschriebenes Urteil."
        assert neu[0].relevanz_herkunft == "urteil"
        assert neu[0].urteil["modell"] == "m"

    def test_praxis_satz_schlaegt_das_alte_urteil(self):
        """Hat eine Praxis seit dem letzten Lauf selbst geschrieben, gewinnt sie."""
        from atlas_scout.katalog import bewahre_urteile

        alt = [{"id": "x", "kennung": "10.1/a", "relevanz_herkunft": "urteil",
                "relevanz": "Maschinenurteil.", "urteil": {}, "verify_status": "toVerify"}]
        neu = bewahre_urteile([_eintrag(id="x", relevanz_herkunft="praxis",
                                        relevanz="Von der Praxis geschrieben.")], alt)
        assert neu[0].relevanz_herkunft == "praxis"
        assert neu[0].relevanz == "Von der Praxis geschrieben."

    def test_abnahme_wird_immer_bewahrt(self):
        """`verified` setzt nur ein Mensch oder eine Praxis — ein Neubau kann es nicht."""
        from atlas_scout.katalog import bewahre_urteile

        alt = [{"id": "x", "kennung": "10.1/a", "relevanz_herkunft": "praxis",
                "verify_status": "verified"}]
        neu = bewahre_urteile([_eintrag(id="x", verify_status="toVerify")], alt)
        assert neu[0].verify_status == "verified"

    def test_findet_den_eintrag_auch_wenn_die_id_sich_aendert(self):
        """Die id wird aus Autor und Titel abgeleitet und wandert, wenn die Quelle ihre
        Angaben korrigiert. Die Kennung ist der stabilere Schlüssel."""
        from atlas_scout.katalog import bewahre_urteile

        alt = [{"id": "alter-slug", "kennung": "10.1/a", "relevanz_herkunft": "urteil",
                "relevanz": "Bleibt erhalten.", "urteil": {}, "verify_status": "toVerify"}]
        neu = bewahre_urteile([_eintrag(id="neuer-slug", kennung="10.1/a",
                                        relevanz_herkunft="gebrauch")], alt)
        assert neu[0].relevanz == "Bleibt erhalten."

    def test_neue_eintraege_bleiben_unberuehrt(self):
        from atlas_scout.katalog import bewahre_urteile

        neu = bewahre_urteile([_eintrag(id="ganz-neu")], [])
        assert neu[0].relevanz_herkunft == "gebrauch"


def test_als_json_schreibt_jedes_feld_des_datenmodells():
    """Wächter gegen die Lücke vom 2026-07-28: `urteil` war dem Datenmodell hinzugefügt,
    aber nie der JSON-Ausgabe — jeder Schreibvorgang ließ den Nachweis fallen. Ein
    maschinell geschriebener Satz stand danach unattribuiert zwischen den Praxis-Sätzen.

    Statt einzelne Felder zu prüfen, wird das Modell selbst gegen die Ausgabe gehalten:
    Was künftig hinzukommt, muss hier erscheinen oder der Test schlägt an."""
    import json as _json

    from atlas_scout.katalog import Katalogeintrag, als_json

    geschrieben = set(_json.loads(als_json([_eintrag()]))[0])
    im_modell = set(Katalogeintrag.__dataclass_fields__)
    fehlt = im_modell - geschrieben
    assert not fehlt, f"Felder im Modell, aber nicht in der Ausgabe: {sorted(fehlt)}"
