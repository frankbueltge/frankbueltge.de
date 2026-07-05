import json

import protokoll.parallaxe.run as run_mod


def _topic(title: str) -> dict:
    return {
        "en_title": title, "lang_count": 8, "protection": "edit:autoconfirmed",
        "langs": ["de", "en", "ja", "ru", "zh"],
        "lemma": {"en": title},
        "claims": [{"aussage": "Territorialstreit",
                    "by_lang": {"en": "verschweigt", "ru": "nennt"}}],
        "omission_by_lang": {"en": 1.0, "ru": 0.0},
        "mean_omission": 0.5,
    }


def _register(topics: list) -> dict:
    return {
        "generated_at": "2026-06-14T05:30:00Z",
        "rule": {"source": "Wikipedia:List_of_controversial_issues", "min_langs": 5,
                 "cap": 24, "model": "gemini-2.5-flash"},
        "census": {"attempted": 24, "measured": len(topics), "failed": {}},
        "mean_omission_index": 0.41 if topics else None,
        "topics": topics,
    }


def test_dry_run_writes_register(tmp_path, monkeypatch):
    # Ein gesundes Register (>= MIN_MEASURED_TO_PUBLISH Themen) wird geschrieben.
    topics = [_topic("Senkaku Islands")] + [_topic(f"Disputed {i}") for i in range(9)]
    monkeypatch.setattr(run_mod, "build_register", lambda client, today: _register(topics))
    code = run_mod.main(["--date", "2026-06-14", "--dry-run", "--repo-root", str(tmp_path)])
    assert code == 0
    out = tmp_path / "src/data/parallaxe/register.json"
    data = json.loads(out.read_text())
    assert data["mean_omission_index"] == 0.41
    assert data["topics"][0]["en_title"] == "Senkaku Islands"


def test_degenerate_guard_aborts_on_empty_topics(tmp_path, monkeypatch):
    monkeypatch.setattr(run_mod, "build_register", lambda client, today: _register([]))
    code = run_mod.main(["--date", "2026-06-14", "--dry-run", "--repo-root", str(tmp_path)])
    assert code == 1


def test_degenerate_guard_aborts_on_mostly_failed_run(tmp_path, monkeypatch):
    # 2026-07-05-Fall: nur 1 von 24 Themen kam durch (Gemini-Ratelimit) → nicht committen,
    # gestriges Register behalten statt einer Ein-Thema-Verzerrung.
    monkeypatch.setattr(run_mod, "build_register",
                        lambda client, today: _register([_topic("Kosovo")]))
    code = run_mod.main(["--date", "2026-07-05", "--dry-run", "--repo-root", str(tmp_path)])
    assert code == 1
    assert not (tmp_path / "src/data/parallaxe/register.json").exists()


def test_invalid_date_errors(monkeypatch):
    import pytest
    with pytest.raises(SystemExit):
        run_mod.main(["--date", "not-a-date", "--dry-run", "--repo-root", "/tmp"])
