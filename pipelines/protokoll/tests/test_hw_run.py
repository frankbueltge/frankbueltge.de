import json

import protokoll.halbwertszeit.run as run_mod


def test_dry_run_writes_register(tmp_path, monkeypatch):
    fake = {"generated_at": "x", "rule": {"deaths_min": 25}, "median_halflife_days": 16.3,
            "events": []}
    monkeypatch.setattr(run_mod, "build_register", lambda client, today: fake)
    code = run_mod.main(["--date", "2026-06-13", "--dry-run", "--repo-root", str(tmp_path)])
    assert code == 0
    out = tmp_path / "src/data/halbwertszeit/register.json"
    assert json.loads(out.read_text())["median_halflife_days"] == 16.3
