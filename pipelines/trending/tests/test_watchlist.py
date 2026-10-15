"""The live watchlist and the promotion rule: the machine adds, a person prunes, and a
struck term never comes back."""
import json
from datetime import date

from trending import watchlist as wl

TODAY = date(2026, 9, 5)


def _cand(ngram, platforms=("hackernews", "github"), ratio=4.0):
    return {"ngram": ngram, "platforms": list(platforms), "ratio": ratio,
            "docs_recent": 9, "docs_prior": 1,
            "sample": {"date": "2026-09-04", "title": "t", "url": "https://x"}}


def _record(*ngrams, platforms=("hackernews", "github")):
    return {"$contract": "trending-terms/1",
            "candidates": [_cand(n, platforms) for n in ngrams]}


def _entries(*terms):
    return wl.normalise([{"term": t, "added": "2026-09-01", "origin": "editorial"} for t in terms])


def test_normalise_keeps_one_entry_per_slug_and_preserves_tombstones():
    got = wl.normalise([
        {"term": " loop  engineering ", "aliases": ["loop-engineering", ""], "origin": "discovered"},
        {"term": "loop engineering"},  # same slug, dropped
        {"term": "agent skills", "retired": "2026-09-04", "retired_note": "too generic"},
        {"term": ""},
    ])
    assert [e["slug"] for e in got] == ["loop-engineering", "agent-skills"]
    assert got[0]["aliases"] == ["loop-engineering"] and got[0]["origin"] == "discovered"
    assert got[1]["retired"] == "2026-09-04" and got[1]["retired_note"] == "too generic"
    assert [e["slug"] for e in wl.tracked(got)] == ["loop-engineering"]


def test_the_repository_list_wins_and_a_missing_one_is_seeded_from_the_package(tmp_path):
    seeded, from_repo = wl.load(tmp_path)
    assert from_repo is False and len(seeded) >= 12  # the shipped seed
    wl.save(tmp_path, _entries("only this"))
    live, from_repo = wl.load(tmp_path)
    assert from_repo is True and [e["term"] for e in live] == ["only this"]
    text = wl.path(tmp_path).read_text()
    assert text.endswith("\n") and json.loads(text)[0]["slug"] == "only-this"


def test_a_corrupt_list_falls_back_to_the_seed_instead_of_crashing(tmp_path):
    wl.path(tmp_path).parent.mkdir(parents=True)
    wl.path(tmp_path).write_text("{not json")
    entries, from_repo = wl.load(tmp_path)
    assert from_repo is False and entries


def test_three_consecutive_proposals_earn_a_place():
    got = wl.promote(candidates=[_cand("agent skills")],
                     prior_records=[_record("agent skills"), _record("agent skills")],
                     entries=_entries("loop engineering"), today=TODAY)
    assert [p["term"] for p in got] == ["agent skills"]
    assert got[0]["slug"] == "agent-skills" and got[0]["days_seen"] == 3
    assert "proposed on 3 consecutive runs" in got[0]["note"]
    applied = wl.apply(_entries("loop engineering"), got, TODAY)
    assert [e["slug"] for e in applied] == ["loop-engineering", "agent-skills"]
    fresh = applied[-1]
    assert fresh["origin"] == "discovered" and fresh["added"] == "2026-09-05"
    assert fresh["aliases"] == ["agent-skills"] and fresh["wikipedia_article"] is None


def test_a_gap_in_the_run_of_days_does_not_earn_a_place():
    assert wl.promote(candidates=[_cand("agent skills")],
                      prior_records=[_record("agent skills"), _record("something else")],
                      entries=_entries(), today=TODAY) == []


def test_one_platform_never_earns_a_place_however_often_it_returns():
    one = ("hackernews",)
    assert wl.promote(candidates=[_cand("agent skills", one)],
                      prior_records=[_record("agent skills", platforms=one)] * 2,
                      entries=_entries(), today=TODAY) == []


def test_a_struck_term_is_never_promoted_again():
    entries = wl.normalise([{"term": "agent skills", "retired": "2026-09-04"}])
    assert wl.promote(candidates=[_cand("agent skills")],
                      prior_records=[_record("agent skills")] * 2,
                      entries=entries, today=TODAY) == []


def test_a_term_already_tracked_under_an_alias_is_not_promoted_twice():
    entries = wl.normalise([{"term": "coding agents", "aliases": ["agent skills"]}])
    assert wl.promote(candidates=[_cand("agent skills")],
                      prior_records=[_record("agent skills")] * 2,
                      entries=entries, today=TODAY) == []


def test_the_caps_hold_per_run_and_over_the_whole_list():
    names = ["one thing", "two thing", "three thing", "four thing"]
    cands = [_cand(n, ("hackernews", "github", "reddit"), ratio=9 - i) for i, n in enumerate(names)]
    prior = [{"candidates": [_cand(n, ("hackernews", "github", "reddit")) for n in names]}] * 2
    got = wl.promote(candidates=cands, prior_records=prior, entries=_entries(), today=TODAY,
                     rules={"promote_max_per_run": 2})
    assert [p["term"] for p in got] == ["one thing", "two thing"]  # ranked by platforms, ratio
    full = _entries(*[f"term {i}" for i in range(35)])
    assert wl.promote(candidates=cands, prior_records=prior, entries=full, today=TODAY) == []
    nearly = _entries(*[f"term {i}" for i in range(34)])
    assert len(wl.promote(candidates=cands, prior_records=prior, entries=nearly, today=TODAY)) == 1


def test_a_young_archive_promotes_nothing():
    assert wl.promote(candidates=[_cand("agent skills")], prior_records=[],
                      entries=_entries(), today=TODAY) == []
    # …and with the rule set to one day, today alone is enough
    got = wl.promote(candidates=[_cand("agent skills")], prior_records=[],
                     entries=_entries(), today=TODAY, rules={"promote_days": 1})
    assert [p["term"] for p in got] == ["agent skills"]


def _terms(*pairs):
    return [{"slug": slug, "status": status} for slug, status in pairs]


def test_a_promoted_term_is_let_go_after_a_run_of_quiet_days():
    entries = wl.normalise([{"term": "mac studio", "origin": "discovered", "added": "2026-08-01"}])
    day1, let_go = wl.age(entries, _terms(("mac-studio", "quiet")), date(2026, 9, 1), {"retire_quiet_days": 3})
    assert let_go == [] and day1[0]["quiet_since"] == "2026-09-01"
    day2, let_go = wl.age(day1, _terms(("mac-studio", "fading")), date(2026, 9, 2), {"retire_quiet_days": 3})
    assert let_go == [] and day2[0]["quiet_since"] == "2026-09-01"
    day3, let_go = wl.age(day2, _terms(("mac-studio", "quiet")), date(2026, 9, 3), {"retire_quiet_days": 3})
    assert [g["term"] for g in let_go] == ["mac studio"] and let_go[0]["days_quiet"] == 3
    assert day3[0]["retired"] == "2026-09-03" and "quiet for 3 days running" in day3[0]["retired_note"]
    assert "quiet_since" not in day3[0] and wl.tracked(day3) == []


def test_speaking_up_again_clears_the_silence():
    entries = wl.normalise([{"term": "mac studio", "origin": "discovered"}])
    once, _ = wl.age(entries, _terms(("mac-studio", "quiet")), date(2026, 9, 1), {"retire_quiet_days": 3})
    back, let_go = wl.age(once, _terms(("mac-studio", "rising")), date(2026, 9, 2), {"retire_quiet_days": 3})
    assert let_go == [] and "quiet_since" not in back[0] and not back[0].get("retired")


def test_an_editorial_term_is_never_let_go_by_the_machine():
    entries = _entries("knowledge graph")
    for day in (1, 2, 3, 4):
        entries, let_go = wl.age(entries, _terms(("knowledge-graph", "quiet")),
                                 date(2026, 9, day), {"retire_quiet_days": 2})
        assert let_go == []
    assert not entries[0].get("retired") and "quiet_since" not in entries[0]
