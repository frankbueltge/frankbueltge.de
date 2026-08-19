"""The catalogue builder does not write links the record has already refused.

The case behind every test here: on 2026-08-19 the nightly build put three links back into
`papers.json` hours after a sweep had removed them, and the site's own guard failed the
build — every deploy and every open pull request red, for a rule the builder could not see.
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

from atlas_scout.katalog import Katalogeintrag, als_json
from atlas_scout.source_links import read_guard, strip_refused_links

ROOT = Path(__file__).resolve().parents[3]

# The three addresses of 2026-08-19, verbatim.
YALE = "https://zoo.cs.yale.edu/classes/cs323/doc/Hamming.pdf"
DIRNAGL = "https://dirnagl.com/wp-content/uploads/2015/04/rheinberger_experimental_systems_engl.pdf"
MERSCH = (
    "https://transaestheticsfoundation.org/wp-content/uploads/2016/01/"
    "merschdieter-aesthetic_difference-on_the_wisdom_of_the_arts.pdf"
)
# Cleared by the same sweep: a university repository whose upload path is not a teaching one.
UFJF = (
    "https://www2.ufjf.br/mus/wp-content/uploads/sites/545/2020/12/"
    "Douglas-et-al-2009-The-Artistic-Turn-A-Manifesto.pdf"
)


def _entry(**overrides) -> Katalogeintrag:
    base = dict(
        id="x", titel="Ein Titel", urheber=("Ada Lovelace",), jahr=2024, ort="",
        kennung="10.1/a", url="https://doi.org/10.1/a", frei_zugaenglich=False,
        felder=(), zusammenfassung="", relevanz="…", relevanz_herkunft="gebrauch",
        weg="praxis", aufnahmegrund="zitiert", fundstellen=("ulysses/journal/x.md",),
        geprueft=True, pruef_status=200, pruef_vermerk=None,
        zitiert_von=("atelier",), zuletzt_gebraucht="2026-07-01", verify_status="toVerify",
    )
    return Katalogeintrag(**{**base, **overrides})


@pytest.fixture(scope="module")
def guard():
    return read_guard(ROOT)


class TestTheSharedList:
    def test_the_builder_reads_the_site_s_list(self, guard):
        """One list, two readers — the drift of 2026-08-19 was two lists, one reader."""
        assert "dirnagl.com" in guard.hosts
        assert guard.teaching_paths.search("/classes/")

    def test_a_missing_list_is_not_an_open_gate(self, tmp_path):
        with pytest.raises(FileNotFoundError):
            read_guard(tmp_path)


class TestWhatTheGuardRefuses:
    def test_refuses_the_three_addresses_of_2026_08_19(self, guard):
        assert guard.refuses(YALE)
        assert guard.refuses(DIRNAGL)
        assert guard.refuses(MERSCH)

    def test_leaves_what_the_sweep_left(self, guard):
        """The neighbour in the same field: an upload path that is not a teaching path."""
        assert not guard.refuses(UFJF)
        assert not guard.refuses("https://doi.org/10.1/a")
        assert not guard.refuses("")


class TestTheBuilderDoesNotWriteThemBack:
    def test_takes_the_address_out_of_the_further_identifiers(self, guard):
        entry = _entry(weitere_kennungen=(DIRNAGL, MERSCH, "arXiv:2406.07016"))
        result = strip_refused_links([entry], guard)
        assert result.entries[0].weitere_kennungen == ("arXiv:2406.07016",)
        assert set(result.removed_addresses) == {DIRNAGL, MERSCH}

    def test_the_entry_stays_because_the_citation_is_the_point(self, guard):
        """Dropping an address is not dropping a text — the citation is the point."""
        entry = _entry(url=YALE, weitere_kennungen=(YALE,))
        result = strip_refused_links([entry], guard)
        assert len(result.entries) == 1
        kept = result.entries[0]
        assert kept.titel == "Ein Titel" and kept.kennung == "10.1/a"
        assert kept.url == "" and kept.weitere_kennungen == ()

    def test_leaves_a_clean_entry_untouched(self, guard):
        entry = _entry(weitere_kennungen=(UFJF,))
        result = strip_refused_links([entry], guard)
        assert result.entries[0] is entry
        assert result.removed_addresses == ()

    def test_holds_back_rather_than_publishes_where_the_address_is_the_identity(self, guard):
        """No entry is one today; if one ever is, it is named, not quietly published."""
        entry = _entry(id="hamming", kennung=YALE, url=YALE)
        result = strip_refused_links([entry], guard)
        assert result.entries == []
        assert result.held_back == (("hamming", YALE),)

    def test_no_refused_address_reaches_the_written_file(self, guard):
        entries = [_entry(weitere_kennungen=(DIRNAGL, UFJF))]
        written = json.loads(als_json(strip_refused_links(entries, guard).entries))
        assert written[0]["weitere_kennungen"] == [UFJF]
        assert DIRNAGL not in json.dumps(written)


class TestTheShippedCatalogue:
    def test_papers_json_carries_no_refused_address(self, guard):
        """The file as it stands, read the way the guard reads it."""
        catalogue = json.loads(
            (ROOT / "src/data/register/papers.json").read_text(encoding="utf-8")
        )
        found = [
            address
            for entry in catalogue
            for address in [entry.get("url"), entry.get("kennung"),
                            *entry.get("weitere_kennungen", [])]
            if guard.refuses(address)
        ]
        assert found == []
