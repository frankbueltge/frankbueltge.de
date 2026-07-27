"""Grenzprüfung der Urteilsroutine.

Ein Urteil ist der einzige Schritt der Kette, der nicht aus einer Quelle folgt — er
kommt von jemandem, der gelesen hat. Genau deshalb muss die Form streng sein: Ein
fehlerhaftes Urteil sieht im Katalog aus wie ein gutes.
"""
from __future__ import annotations

from atlas_scout.urteil import pruefe_urteile, wende_an


def _katalog(**abweichung) -> list[dict]:
    eintrag = {
        "id": "ein-text", "titel": "Ein Text", "relevanz": "Cited by the atelier.",
        "relevanz_herkunft": "gebrauch", "verify_status": "toVerify",
    }
    eintrag.update(abweichung)
    return [eintrag]


def _urteil(**abweichung) -> dict:
    u = {"id": "ein-text", "grundlage": "abstract",
         "relevanz": "Benennt die Fehlerform, die das Atelier jede Nacht protokolliert."}
    u.update(abweichung)
    return u


class TestPruefung:
    def test_gutes_urteil_geht_durch(self):
        assert pruefe_urteile([_urteil()], _katalog()) == []

    def test_unbekannte_id_wird_beanstandet(self):
        assert pruefe_urteile([_urteil(id="gibt-es-nicht")], _katalog())

    def test_doppeltes_urteil_wird_beanstandet(self):
        assert pruefe_urteile([_urteil(), _urteil()], _katalog())

    def test_zu_kurze_begruendung_wird_beanstandet(self):
        assert pruefe_urteile([_urteil(relevanz="Gut.")], _katalog())

    def test_satzfragment_wird_beanstandet(self):
        assert pruefe_urteile([_urteil(relevanz="ein Fragment ohne Punkt am Ende")], _katalog())

    def test_unbenannte_grundlage_wird_beanstandet(self):
        """Ein Urteil ohne benannte Grundlage ist eine Behauptung."""
        assert pruefe_urteile([_urteil(grundlage="bauchgefuehl")], _katalog())
        assert pruefe_urteile([_urteil(grundlage=None)], _katalog())

    def test_praxis_satz_darf_nicht_ueberschrieben_werden(self):
        """Der von der Praxis geschriebene Satz ist das Wertvollste im Katalog. Ein
        Modellurteil darf ihn nie verdrängen — das ist der teuerste denkbare Fehler."""
        beanstandet = pruefe_urteile([_urteil()], _katalog(relevanz_herkunft="praxis"))
        assert any("Praxis" in b for b in beanstandet)


class TestAnwendung:
    def test_traegt_satz_und_nachweis_ein(self):
        katalog, n = wende_an(
            _katalog(), [_urteil()],
            modell="claude-opus-5", am="2026-07-28", sitzung="nacht-01",
        )
        assert n == 1
        e = katalog[0]
        assert e["relevanz_herkunft"] == "urteil"
        assert e["urteil"] == {
            "modell": "claude-opus-5", "am": "2026-07-28",
            "grundlage": "abstract", "sitzung": "nacht-01",
        }

    def test_bleibt_toVerify(self):
        """Ein Modellurteil ist ein Vorschlag an die Praxis, kein Ersatz für ihr Lesen."""
        katalog, _ = wende_an(
            _katalog(), [_urteil()], modell="m", am="2026-07-28", sitzung="s",
        )
        assert katalog[0]["verify_status"] == "toVerify"

    def test_laesst_unbeurteilte_eintraege_unberuehrt(self):
        katalog = _katalog() + [{"id": "anderer", "relevanz": "X.",
                                 "relevanz_herkunft": "gebrauch", "verify_status": "toVerify"}]
        katalog, n = wende_an(katalog, [_urteil()], modell="m", am="2026-07-28", sitzung="s")
        assert n == 1
        assert katalog[1]["relevanz_herkunft"] == "gebrauch"
