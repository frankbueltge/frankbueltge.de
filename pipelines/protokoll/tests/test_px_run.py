"""Parallaxe-Lauf: ein Thema pro Tag (rotierend), ins bestehende Register akkumuliert."""
import json

import pytest

import protokoll.parallaxe.run as run_mod

RANKED = [
    {"en_title": "Alpha", "titles": {"en": "Alpha"}, "lang_count": 8},
    {"en_title": "Bravo", "titles": {"en": "Bravo"}, "lang_count": 7},
    {"en_title": "Charlie", "titles": {"en": "Charlie"}, "lang_count": 6},
]


def _intros(_client, titles):
    name = next(iter(titles.values()))
    return {"en": f"t {name}", "de": "y", "fr": "z", "ru": "w", "ja": "v"}, []


def _extract_ok(intros, *, client):
    return {"lemma": {"en": "L"}, "name_umstritten": False,
            "claims": [{"aussage": "A", "nach_sprache": {"en": "nennt", "de": "verschweigt"}}]}


@pytest.fixture
def _mock_sources(monkeypatch):
    monkeypatch.setattr(run_mod.register, "controversial_titles", lambda c: ["x"])
    monkeypatch.setattr(run_mod.register, "rank_topics", lambda c, t: list(RANKED))
    monkeypatch.setattr(run_mod.register, "protection_status", lambda c, t: "none")
    monkeypatch.setattr(run_mod.extracts, "fetch_intros", _intros)
    monkeypatch.setattr(run_mod.extract_llm, "extract_omissions", _extract_ok)
    monkeypatch.setattr(run_mod.analyze, "omission_index",
                        lambda claims, langs: {lang: 0.5 for lang in langs})
    monkeypatch.setattr(run_mod.analyze, "mean_omission", lambda oi: 0.5)


def _run(root, date):
    return run_mod.main(["--date", date, "--dry-run", "--repo-root", str(root)])


def _read(root):
    return json.loads((root / "src/data/parallaxe/register.json").read_text())


def test_measures_one_topic_and_writes(_mock_sources, tmp_path):
    code = _run(tmp_path, "2026-07-06")
    assert code == 0
    data = _read(tmp_path)
    assert len(data["topics"]) == 1           # genau EIN Thema pro Tag
    t = data["topics"][0]
    assert t["measured"] == "2026-07-06"
    assert t["en_title"] in {"Alpha", "Bravo", "Charlie"}
    assert data["census"] == {"attempted": 1, "measured": 1, "failed": {}}


def test_rotation_picks_three_distinct_topics_over_three_days(_mock_sources, tmp_path):
    picks = []
    for d in ["2026-07-06", "2026-07-07", "2026-07-08"]:
        sub = tmp_path / d.replace("-", "")
        sub.mkdir()
        _run(sub, d)
        picks.append(_read(sub)["topics"][0]["en_title"])
    assert len(set(picks)) == 3               # drei aufeinanderfolgende Tage → drei Themen


def test_accumulates_into_existing_register(_mock_sources, tmp_path):
    _run(tmp_path, "2026-07-06")              # Tag 1
    _run(tmp_path, "2026-07-07")              # Tag 2 — ins bestehende Register einsortiert
    data = _read(tmp_path)
    assert len(data["topics"]) == 2
    titles = [t["en_title"] for t in data["topics"]]
    assert titles == sorted(titles)           # stabil sortiert (minimaler Diff)


def test_failed_topic_leaves_register_unchanged(_mock_sources, tmp_path, monkeypatch):
    _run(tmp_path, "2026-07-06")              # ein gutes Thema liegt vor
    before = _read(tmp_path)

    def _boom(intros, *, client):
        raise run_mod.extract_llm.ExtractionError("429 (Test)")

    monkeypatch.setattr(run_mod.extract_llm, "extract_omissions", _boom)
    code = _run(tmp_path, "2026-07-07")       # heutiges Thema failt
    assert code == 0                          # weicher Ausfall — wir haben ja Daten
    assert _read(tmp_path)["topics"] == before["topics"]


def test_first_run_failure_is_hard_error(_mock_sources, tmp_path, monkeypatch):
    monkeypatch.setattr(run_mod.extract_llm, "extract_omissions",
                        lambda intros, *, client: (_ for _ in ()).throw(
                            run_mod.extract_llm.ExtractionError("429")))
    code = _run(tmp_path, "2026-07-06")       # noch gar kein Register
    assert code == 1
    assert not (tmp_path / "src/data/parallaxe/register.json").exists()


def test_invalid_date_errors():
    with pytest.raises(SystemExit):
        run_mod.main(["--date", "not-a-date", "--dry-run", "--repo-root", "/tmp"])
