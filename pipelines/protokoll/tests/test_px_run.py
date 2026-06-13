import json

import protokoll.parallaxe.run as run_mod


def test_dry_run_writes_register(tmp_path, monkeypatch):
    fake = {
        "generated_at": "2026-06-14T05:30:00Z",
        "rule": {"source": "Wikipedia:List_of_controversial_issues", "min_langs": 5,
                 "cap": 24, "model": "gemini-2.5-flash"},
        "mean_omission_index": 0.41,
        "topics": [{
            "en_title": "Senkaku Islands", "lang_count": 8, "protection": "edit:autoconfirmed",
            "langs": ["de", "en", "ja", "ru", "zh"],
            "lemma": {"en": "Senkaku Islands", "zh": "Diaoyu Islands"},
            "lemma_divergent": True,
            "claims": [{"aussage": "Territorialstreit",
                        "by_lang": {"en": "verschweigt", "ru": "nennt"}}],
            "omission_by_lang": {"en": 1.0, "ru": 0.0},
            "mean_omission": 0.5,
        }],
    }
    monkeypatch.setattr(run_mod, "build_register", lambda client, today: fake)
    code = run_mod.main(["--date", "2026-06-14", "--dry-run", "--repo-root", str(tmp_path)])
    assert code == 0
    out = tmp_path / "src/data/parallaxe/register.json"
    data = json.loads(out.read_text())
    assert data["mean_omission_index"] == 0.41
    assert data["topics"][0]["en_title"] == "Senkaku Islands"


def test_degenerate_guard_aborts_on_empty_topics(tmp_path, monkeypatch):
    fake = {
        "generated_at": "x",
        "rule": {"source": "Wikipedia:List_of_controversial_issues", "min_langs": 5,
                 "cap": 24, "model": "gemini-2.5-flash"},
        "mean_omission_index": None,
        "topics": [],
    }
    monkeypatch.setattr(run_mod, "build_register", lambda client, today: fake)
    code = run_mod.main(["--date", "2026-06-14", "--dry-run", "--repo-root", str(tmp_path)])
    assert code == 1


def test_invalid_date_errors(monkeypatch):
    import pytest
    with pytest.raises(SystemExit):
        run_mod.main(["--date", "not-a-date", "--dry-run", "--repo-root", "/tmp"])
