"""The dates both catalogues carry since 2026-10-05 — stamped by the run, never backfilled.

The site's signal log files every row under a day its own record names. Until this day neither
the dataset register nor the paper catalogue named one, so neither could appear in it. Every
build now stamps what it can know about its own run, kept against the catalogue committed
before it. What these tests hold is the one rule both sides of the record share: a date is
either the day of a run that saw the thing happen, or carried from the record — never one the
run could not have seen, and never a guess for what came before the stamp.
"""
from __future__ import annotations

import json

from atlas_scout.holdings import reachability, stamp_register
from atlas_scout.katalog import Katalogeintrag, als_json, stamp_first_seen

TODAY = "2026-10-06"


# ── the dataset register ────────────────────────────────────────────────────────────────


def _source(id_: str, **state) -> dict:
    """An entry as baue_register writes it, with the four access fields that matter here."""
    entry = {"id": id_, "host": id_.replace("-", "."), "geprueft": True, "pruef_status": 200,
             "zugang_gesperrt": False, "nur_vorlage": False}
    entry.update(state)
    return entry


SILENT = dict(geprueft=False, pruef_status=None)
GATED = dict(geprueft=False, pruef_status=403, zugang_gesperrt=True)
TEMPLATE = dict(geprueft=False, pruef_status=None, nur_vorlage=True)


class TestReachability:
    def test_reads_the_four_states_in_the_sites_order(self):
        assert reachability(_source("a")) == "confirmed"
        assert reachability(_source("a", **GATED)) == "gated"
        assert reachability(_source("a", **TEMPLATE)) == "template"
        assert reachability(_source("a", **SILENT)) == "no answer"

    def test_a_new_status_code_inside_one_state_is_no_change(self):
        assert reachability(_source("a", geprueft=False, pruef_status=404)) == reachability(
            _source("a", geprueft=False, pruef_status=500)
        )


class TestStampRegister:
    def test_a_source_the_previous_register_did_not_hold_appears_today(self):
        [entry] = stamp_register([_source("new-host")], [_source("other")], TODAY)
        assert entry["first_seen_on"] == TODAY
        assert entry["probed_on"] == TODAY
        # it has appeared, not changed
        assert entry["reachability_changed_on"] is None

    def test_a_source_from_before_the_stamp_gets_null_and_keeps_it(self):
        before = [_source("old-host")]  # a register written before 2026-10-05: no dates at all
        [first] = stamp_register([_source("old-host")], before, TODAY)
        assert first["first_seen_on"] is None
        assert first["reachability_changed_on"] is None
        [second] = stamp_register([_source("old-host")], [first], "2026-10-07")
        assert second["first_seen_on"] is None, "null is carried, never filled in later"

    def test_carries_the_day_a_source_first_appeared(self):
        before = [{**_source("a"), "first_seen_on": "2026-10-06", "probed_on": "2026-10-06"}]
        [entry] = stamp_register([_source("a")], before, "2026-10-09")
        assert entry["first_seen_on"] == "2026-10-06"
        assert entry["probed_on"] == "2026-10-09"

    def test_stamps_a_change_of_reachability_on_the_run_that_saw_it(self):
        before = [{**_source("a"), "first_seen_on": None, "reachability_changed_on": None}]
        [entry] = stamp_register([_source("a", **SILENT)], before, TODAY)
        assert entry["reachability_changed_on"] == TODAY

    def test_carries_the_last_change_while_the_state_holds(self):
        before = [{**_source("a", **GATED), "reachability_changed_on": "2026-10-06"}]
        [entry] = stamp_register([_source("a", **{**GATED, "pruef_status": 401})], before, "2026-10-08")
        assert entry["reachability_changed_on"] == "2026-10-06"

    def test_never_probes_a_template(self):
        [entry] = stamp_register([_source("t", **TEMPLATE)], [], TODAY)
        assert entry["probed_on"] is None

    def test_reads_no_garbage_as_a_date(self):
        before = [{**_source("a"), "first_seen_on": "yesterday", "reachability_changed_on": 20261006}]
        [entry] = stamp_register([_source("a")], before, TODAY)
        assert entry["first_seen_on"] is None
        assert entry["reachability_changed_on"] is None

    def test_without_a_previous_register_everything_is_new(self):
        entries = stamp_register([_source("a"), _source("b", **SILENT)], None, TODAY)
        assert [e["first_seen_on"] for e in entries] == [TODAY, TODAY]

    def test_keeps_every_field_it_was_given(self):
        source = {**_source("a"), "relevanz": "kept", "benutzt_von": ["protokoll"]}
        [entry] = stamp_register([source], [], TODAY)
        assert {k: entry[k] for k in source} == source


# ── the paper catalogue ─────────────────────────────────────────────────────────────────


def _paper(**over) -> Katalogeintrag:
    base = dict(
        id="lovelace-a-title", titel="A Title", urheber=("Ada Lovelace",), jahr=2024, ort="",
        kennung="10.1/a", url="https://example.invalid", frei_zugaenglich=False, felder=(),
        zusammenfassung="", relevanz="…", relevanz_herkunft="gebrauch", weg="praxis",
        aufnahmegrund="zitiert", fundstellen=("ulysses/journal/x.md",), geprueft=True,
        pruef_status=200, pruef_vermerk=None, zitiert_von=("atelier",),
        zuletzt_gebraucht="2026-10-01", verify_status="toVerify",
    )
    return Katalogeintrag(**{**base, **over})


def _committed(paper: Katalogeintrag, **over) -> dict:
    """How the catalogue committed before the run holds a paper."""
    entry = json.loads(als_json([paper]))[0]
    entry.update(over)
    return entry


class TestStampFirstSeen:
    def test_writes_the_field(self):
        assert json.loads(als_json([_paper(first_seen_on=TODAY)]))[0]["first_seen_on"] == TODAY

    def test_a_paper_the_previous_catalogue_did_not_hold_entered_today(self):
        [paper] = stamp_first_seen([_paper()], [], TODAY)
        assert paper.first_seen_on == TODAY

    def test_a_paper_from_before_the_stamp_gets_null(self):
        previous = [_committed(_paper())]
        del previous[0]["first_seen_on"]  # a catalogue written before 2026-10-05
        [paper] = stamp_first_seen([_paper()], previous, TODAY)
        assert paper.first_seen_on is None

    def test_carries_the_day_a_paper_entered(self):
        previous = [_committed(_paper(), first_seen_on="2026-10-06")]
        [paper] = stamp_first_seen([_paper()], previous, "2026-10-09")
        assert paper.first_seen_on == "2026-10-06"

    def test_knows_a_paper_whose_id_changed_by_its_identifier(self):
        """The id is derived from author and title; a source correcting either renames it."""
        previous = [_committed(_paper(), first_seen_on="2026-10-06")]
        [paper] = stamp_first_seen([_paper(id="lovelace-a-corrected-title")], previous, TODAY)
        assert paper.first_seen_on == "2026-10-06"

    def test_knows_a_preprint_merged_into_its_publication(self):
        previous = [_committed(_paper(id="p", kennung="arXiv:2406.07016", titel="Other"), first_seen_on="2026-10-07")]
        merged = _paper(kennung="10.1126/sciadv.adt3813", weitere_kennungen=("arXiv:2406.07016",))
        [paper] = stamp_first_seen([merged], previous, TODAY)
        assert paper.first_seen_on == "2026-10-07"

    def test_knows_a_paper_by_title_and_first_author_as_the_merge_does(self):
        previous = [_committed(_paper(id="x", kennung="10.9/x"), first_seen_on="2026-10-06")]
        [paper] = stamp_first_seen([_paper(id="y", kennung="10.9/y")], previous, TODAY)
        assert paper.first_seen_on == "2026-10-06"

    def test_the_earliest_known_appearance_wins_and_before_the_stamp_is_earliest(self):
        merged = _paper(kennung="10.1/a", weitere_kennungen=("10.1/b",))
        dated = [
            _committed(_paper(id="a", kennung="10.1/a", titel="One"), first_seen_on="2026-10-08"),
            _committed(_paper(id="b", kennung="10.1/b", titel="Two"), first_seen_on="2026-10-06"),
        ]
        assert stamp_first_seen([merged], dated, TODAY)[0].first_seen_on == "2026-10-06"
        undated = [*dated, _committed(_paper(id="c", kennung="10.1/b", titel="Three"), first_seen_on=None)]
        assert stamp_first_seen([merged], undated, TODAY)[0].first_seen_on is None

    def test_an_empty_title_matches_nothing(self):
        previous = [_committed(_paper(id="x", kennung="10.9/x", titel=""), first_seen_on="2026-10-06")]
        [paper] = stamp_first_seen([_paper(id="y", kennung="10.9/y", titel="")], previous, TODAY)
        assert paper.first_seen_on == TODAY
