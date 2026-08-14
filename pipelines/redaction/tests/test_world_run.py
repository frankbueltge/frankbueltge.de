import json
from datetime import datetime, timezone

from redaction.world import recheck as recheck_mod
from redaction.world.run_world import run

RUN_DAY = datetime(2026, 8, 14, 5, 40, tzinfo=timezone.utc)


def _run(root, **kw):
    defaults = dict(run_day=RUN_DAY, skip_gdg=True, skip_sample=True, skip_recheck=True)
    defaults.update(kw)
    return run(str(root), **defaults)


def test_day_is_always_written_shape(tmp_path):
    rec = _run(tmp_path)
    assert rec["date"] == "2026-08-14"
    assert rec["gdg"]["available"] is False
    assert rec["deletion"]["available"] is False


def test_bootstrap_recheck_is_honest(tmp_path):
    rec = _run(tmp_path, skip_recheck=False)
    assert rec["deletion"]["available"] is False
    assert "2026-08-12" in rec["deletion"]["note"]


def test_recheck_uses_committed_manifest(tmp_path, monkeypatch):
    samples = tmp_path / "src" / "data" / "redaction" / "world" / "samples"
    samples.mkdir(parents=True)
    manifest = {
        "pool_day": "2026-08-12",
        "drawn_at": "2026-08-13T05:40:00Z",
        "items": [
            {"url": "https://x.test/ok", "domain": "x.test", "title": "Stays",
             "first_seen": "20260812060000"},
            {"url": "https://x.test/gone", "domain": "x.test", "title": "Vanishes",
             "first_seen": "20260812070000"},
        ],
    }
    (samples / "2026-08-12.json").write_text(json.dumps(manifest), encoding="utf-8")

    def fake_check(client, url):
        return ("gone_404", 404) if url.endswith("gone") else ("ok", 200)

    monkeypatch.setattr(recheck_mod, "check_url", fake_check)
    monkeypatch.setattr(recheck_mod, "PAUSE", 0)

    rec = _run(tmp_path, skip_recheck=False)
    d = rec["deletion"]
    assert d["available"] and d["gone"] == 1 and d["decided"] == 2
    (receipt,) = d["receipts"]
    assert receipt["title"] == "Vanishes"  # the committed title IS the receipt


def test_existing_sample_is_never_redrawn(tmp_path):
    samples = tmp_path / "src" / "data" / "redaction" / "world" / "samples"
    samples.mkdir(parents=True)
    committed = {"pool_day": "2026-08-13", "drawn_at": "x", "items": []}
    path = samples / "2026-08-13.json"
    path.write_text(json.dumps(committed), encoding="utf-8")

    rec = _run(tmp_path, skip_sample=False)  # would need network if it redrew
    assert rec["sample_committed"].endswith("samples/2026-08-13.json")
    assert json.loads(path.read_text(encoding="utf-8")) == committed
