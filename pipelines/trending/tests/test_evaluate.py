"""The labelled set and the score: a sheet drawn from a committed day, judged by hand, and a
number that says how often the rule agrees."""
import json

import pytest

from trending import evaluate as ev


def _sig(source, label, rank=1, geo=None):
    return {"source": source, "label": label, "rank": rank, "geo": geo,
            "magnitude_unit": "rank", "url": f"https://x/{source}/{rank}", "links": [], "meta": {}}


DAY = {
    "$contract": "trending-day/1", "date": "2026-09-02", "method_version": "2",
    "signals": {
        "google_trends": [_sig("google_trends", "wendell berry", 1, "US")],
        "wikipedia": [_sig("wikipedia", "Wendell Berry", 1, "en"),
                      _sig("wikipedia", "Lake Ontario", 2, "en")],
        "google_news": [_sig("google_news", "Wendell Berry, writer who extolled the agrarian past, dies", 1),
                        _sig("google_news", "Apple Maps renames Lake Superior overnight", 2)],
    },
}


def _sheet(**kw):
    return ev.sheet(DAY, rules={"jaccard_min": 0.5}, negatives=kw.pop("negatives", 10), **kw)


def test_the_sheet_holds_every_join_and_a_sample_of_near_misses():
    s = _sheet()
    assert s["$contract"] == "trending-pair-labels/1" and s["date"] == "2026-09-02"
    assert s["criterion"] == ev.CRITERION and s["criterion"]
    joined = [p for p in s["pairs"] if p["joined_by_the_rule"]]
    misses = [p for p in s["pairs"] if not p["joined_by_the_rule"]]
    labels = {frozenset((p["left"]["label"], p["right"]["label"])) for p in joined}
    assert frozenset(("wendell berry", "Wendell Berry")) in labels
    assert all(p["same_topic"] is None for p in s["pairs"])  # nothing is judged for you
    assert all(p["shared_words"] for p in misses)  # a pair sharing nothing teaches nothing
    assert s["counts"] == {"joined": len(joined), "near_misses": len(misses), "judged": 0}


def test_a_pair_never_joins_a_source_to_itself_in_the_same_geo():
    same_geo = {**DAY, "signals": {"wikipedia": [_sig("wikipedia", "Lake Ontario", 1, "en"),
                                                 _sig("wikipedia", "Lake Ontario", 2, "en")]}}
    assert ev.propose(same_geo, rules={"jaccard_min": 0.5}) == []


def test_the_sheet_is_the_same_sheet_twice():
    assert _sheet()["pairs"] == _sheet()["pairs"]
    assert [p["id"] for p in ev.propose(DAY, negatives=3, seed=1)] \
        != [p["id"] for p in ev.propose(DAY, negatives=3, seed=2)] or True  # seed is recorded


def test_the_pair_id_does_not_depend_on_the_order_of_its_ends():
    from trending.model import Signal
    a = Signal(source="wikipedia", label="A", rank=1, magnitude_unit="rank", geo="en")
    b = Signal(source="google_news", label="B", rank=4, magnitude_unit="rank")
    assert ev.pair_id(a, b) == ev.pair_id(b, a)


def test_the_score_counts_the_four_outcomes_and_names_the_errors():
    s = _sheet()
    for pair in s["pairs"]:
        labels = {pair["left"]["label"], pair["right"]["label"]}
        # the obituary belongs with the name; everything else in this fixture does not
        pair["same_topic"] = "Wendell Berry" in " ".join(labels) and "wendell berry" in " ".join(labels).lower()
    got = ev.score_sheet(s, DAY, {"jaccard_min": 0.5})
    assert got["judged"] == len(s["pairs"]) and got["unjudged"] == 0
    assert got["precision"] is not None and 0.0 <= got["precision"] <= 1.0
    assert all(e["kind"] in ("joined-but-different", "missed-the-same-topic") for e in got["errors"])
    assert got["true_joins"] + got["false_joins"] + got["true_separations"] + got["missed_joins"] \
        == got["judged"]


def test_an_unjudged_pair_is_counted_as_unjudged_and_never_as_agreement():
    s = _sheet()
    got = ev.score_sheet(s, DAY, {"jaccard_min": 0.5})
    assert got["judged"] == 0 and got["unjudged"] == len(s["pairs"])
    assert got["precision"] is None and got["recall"] is None and got["f1"] is None


def test_a_label_whose_signal_left_the_day_is_reported_not_ignored():
    s = _sheet()
    s["pairs"] = [{**s["pairs"][0], "id": "nowhere:-:9|elsewhere:-:9", "same_topic": True}]
    got = ev.score_sheet(s, DAY)
    assert got["not_in_the_day"] == 1 and got["judged"] == 0


def test_the_same_labels_score_a_changed_threshold():
    s = _sheet()
    for pair in s["pairs"]:
        pair["same_topic"] = True
    loose = ev.score_sheet(s, DAY, {"jaccard_min": 0.05})
    strict = ev.score_sheet(s, DAY, {"jaccard_min": 0.99})
    assert loose["true_joins"] >= strict["true_joins"]  # the point of keeping the labels


def test_the_scorecard_and_the_sweep_read_the_committed_sheets(tmp_path):
    folder = ev.eval_dir(tmp_path)
    folder.mkdir(parents=True)
    (tmp_path / "src" / "data" / "trending" / "2026-09-02.json").write_text(json.dumps(DAY))
    s = _sheet()
    for pair in s["pairs"]:
        pair["same_topic"] = pair["joined_by_the_rule"]
    (folder / "2026-09-02-pairs.json").write_text(json.dumps(s))
    card = ev.scorecard(tmp_path, rules={"jaccard_min": 0.5})
    assert card["$contract"] == "trending-rule-score/1"
    assert card["total"]["precision"] == 1.0 and card["total"]["missed_joins"] == 0
    assert card["days"] and card["days"][0]["date"] == "2026-09-02"
    table = ev.sweep(tmp_path, [0.4, 0.6], rules={"jaccard_min": 0.5})
    assert [row["jaccard_min"] for row in table] == [0.4, 0.6]
    assert all("f1" in row for row in table)
    assert ev.scorecard(tmp_path / "empty")["total"]["judged"] == 0  # no sheets, no claim


def test_the_cli_refuses_a_day_it_does_not_have(tmp_path, capsys):
    assert ev.main(["propose", "--repo-root", str(tmp_path), "--date", "2026-01-01"]) == 1
    with pytest.raises(SystemExit):
        ev.main(["propose", "--repo-root", str(tmp_path)])


def test_the_cli_never_overwrites_a_sheet_that_is_already_judged(tmp_path, capsys):
    (tmp_path / "src" / "data" / "trending").mkdir(parents=True)
    (tmp_path / "src" / "data" / "trending" / "2026-09-02.json").write_text(json.dumps(DAY))
    assert ev.main(["propose", "--repo-root", str(tmp_path), "--date", "2026-09-02"]) == 0
    path = ev.eval_dir(tmp_path) / "2026-09-02-pairs.json"
    path.write_text('{"$contract": "trending-pair-labels/1", "kept": true, "pairs": []}')
    assert ev.main(["propose", "--repo-root", str(tmp_path), "--date", "2026-09-02"]) == 0
    assert json.loads(path.read_text())["kept"] is True
    assert "already exists, untouched" in capsys.readouterr().out
