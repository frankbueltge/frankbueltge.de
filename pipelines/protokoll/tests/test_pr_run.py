import json

import protokoll.praemie.run as run_mod

VALID = {
    "generated_at": "2026-06-14T00:00:00Z",
    "schema_version": "1",
    "pipeline_version": "0.1.0",
    "premium": {"index": 279.086, "change_pct_since_base": 179.1},
    "disasters": {"total_events": 403},
    "claims": {"recent_count": 1000},
    "retreat": {"non_renewals": 2800000},
}

DEGENERATE = {**VALID, "premium": {"error": "boom"}}


def test_dry_run_writes_police(tmp_path, monkeypatch):
    monkeypatch.setattr(run_mod, "build_police", lambda client, today: VALID)
    code = run_mod.main(["--date", "2026-06-14", "--dry-run", "--repo-root", str(tmp_path)])
    assert code == 0
    out = tmp_path / "src/data/praemie/police.json"
    assert json.loads(out.read_text())["premium"]["index"] == 279.086


def test_degenerate_guard_aborts_when_premium_failed(tmp_path, monkeypatch):
    monkeypatch.setattr(run_mod, "build_police", lambda client, today: DEGENERATE)
    code = run_mod.main(["--date", "2026-06-14", "--dry-run", "--repo-root", str(tmp_path)])
    assert code == 1
    out = tmp_path / "src/data/praemie/police.json"
    assert not out.exists()
