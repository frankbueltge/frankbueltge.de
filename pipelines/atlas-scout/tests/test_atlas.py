"""Der Abgleich gegen den Bestand ist der Teil, der falsch-positive Vorschläge verhindert."""
from __future__ import annotations

from pathlib import Path

import pytest

from atlas_scout.atlas import (
    lade,
    normiere_doi,
    normiere_titel,
    normiere_url,
    slugifiziere,
)
from atlas_scout.model import ATLAS_THEORIE, ATLAS_WERKE

WURZEL = Path(__file__).resolve().parents[3]


def test_url_normalisierung_ignoriert_schema_www_und_schraegstrich():
    a = normiere_url("https://www.Example.org/Pfad/")
    assert a == normiere_url("http://example.org/Pfad")
    assert a == "example.org/Pfad".lower() or a == "example.org/pfad"


def test_doi_normalisierung_entfernt_aufloeser():
    assert normiere_doi("https://doi.org/10.1000/ABC") == "10.1000/abc"
    assert normiere_doi("https://dx.doi.org/10.1000/abc") == "10.1000/abc"
    assert normiere_doi(None) == ""


def test_titel_normalisierung_faengt_diakritika_und_satzzeichen():
    assert normiere_titel("Ästhetik, der Differenz!") == normiere_titel("Asthetik der Differenz")


def test_slug_ist_kebab_und_gekappt():
    slug = slugifiziere("Christopher Frayling", "Research in Art and Design")
    assert slug == "christopher-frayling-research-in-art-and-design"
    assert len(slugifiziere("x" * 200)) <= 80


def test_theorie_atlas_laedt_mit_hash_und_eintraegen():
    stand = lade(ATLAS_THEORIE, WURZEL)
    assert stand.eintraege, "Theorie-Atlas darf nicht leer sein"
    assert len(stand.sha256) == 64
    frayling = stand.finde("frayling-research-in-art-and-design")
    assert frayling is not None
    assert frayling.jahr == 1993
    assert "artistic-research" in frayling.schlagworte


def test_werke_atlas_leitet_stabile_ids_ab():
    stand = lade(ATLAS_WERKE, WURZEL)
    assert stand.eintraege
    ids = [e.id for e in stand.eintraege]
    assert all(ids), "jeder Werke-Eintrag braucht eine ableitbare ID"


def test_werke_jahr_wird_aus_string_gelesen():
    """Der Werke-Atlas führt `year` als String, der Theorie-Atlas als int."""
    stand = lade(ATLAS_WERKE, WURZEL)
    jahre = [e.jahr for e in stand.eintraege if e.jahr]
    assert jahre and all(isinstance(j, int) for j in jahre)


@pytest.mark.parametrize("atlas", [ATLAS_THEORIE, ATLAS_WERKE])
def test_bekannt_indizes_sind_nicht_leer(atlas):
    stand = lade(atlas, WURZEL)
    assert stand.bekannte_titel
    assert stand.bekannte_urls
