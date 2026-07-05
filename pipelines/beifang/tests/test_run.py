import json

import beifang.run as run_mod
from beifang.capture import RawCapture
from beifang.run import content_path


def test_content_path_automat_unchanged():
    assert content_path("2026-07-06") == "src/content/beifang/2026/2026-07-06.json"


def test_content_path_leser_has_suffix():
    assert content_path("2026-07-06", kind="leser") == "src/content/beifang/2026/2026-07-06-leser.json"


def fake_capture(url, **kwargs):
    if "kontrolle-blockiert" in url:
        return RawCapture(final_url=url, http_status=403, page_title="Access Denied",
                          requests=(), cookies=(), goto_error=None)
    return RawCapture(final_url="https://www.sciencedirect.com/x", http_status=200,
                      page_title="Artikel", requests=(), cookies=(), goto_error=None)


def test_run_writes_snapshot(tmp_path, monkeypatch):
    monkeypatch.setattr(run_mod, "capture_page", fake_capture)
    monkeypatch.setattr(run_mod, "load_panel", lambda: {
        "version": "2026-07-02",
        "entries": [
            {"id": "elsevier-01", "group": "verlag", "publisher": "elsevier",
             "url": "https://doi.org/10.x", "expected_domain": "sciencedirect.com"},
            {"id": "sage-01", "group": "verlag", "publisher": "sage",
             "url": "https://doi.org/10.y/kontrolle-blockiert", "expected_domain": "sagepub.com"},
        ]})
    code = run_mod.main(["--date", "2026-07-06", "--repo-root", str(tmp_path)])
    assert code == 0
    out = tmp_path / "src/content/beifang/2026/2026-07-06.json"
    data = json.loads(out.read_text())
    results = data["vantages"]["automat"]["results"]
    assert len(results) == 2
    blocked = next(r for r in results if r["panel_id"] == "sage-01")
    assert blocked["blocked"]["type"] == "http" and blocked["tracker_hosts"] is None
    assert data["befund"]["kind"] == "baseline"


def test_navigation_to_blank_is_failed_measurement(tmp_path, monkeypatch):
    def fake_capture_blank(url, **kwargs):
        return RawCapture(final_url="about:blank", http_status=None, page_title="",
                          requests=(), cookies=(), goto_error="TimeoutError: x")

    monkeypatch.setattr(run_mod, "capture_page", fake_capture_blank)
    monkeypatch.setattr(run_mod, "load_panel", lambda: {
        "version": "v",
        "entries": [
            {"id": "elsevier-01", "group": "verlag", "publisher": "elsevier",
             "url": "https://doi.org/10.x", "expected_domain": "sciencedirect.com"},
        ]})
    code = run_mod.main(["--date", "2026-07-06", "--repo-root", str(tmp_path)])
    assert code == 0
    out = tmp_path / "src/content/beifang/2026/2026-07-06.json"
    data = json.loads(out.read_text())
    r = data["vantages"]["automat"]["results"][0]
    # about:blank hat keinen Hostnamen -> gescheiterte Navigation, kein fabriziertes Ergebnis
    assert r["final_url"] is None and r["final_domain"] is None
    assert r["tracker_hosts"] is None and r["requests_total"] is None
    assert "TimeoutError" in r["note"]


def test_existing_snapshot_is_never_overwritten(tmp_path, monkeypatch):
    monkeypatch.setattr(run_mod, "capture_page", fake_capture)
    monkeypatch.setattr(run_mod, "load_panel", lambda: {"version": "v", "entries": [
        {"id": "elsevier-01", "group": "verlag", "publisher": "elsevier",
         "url": "https://doi.org/10.x", "expected_domain": "sciencedirect.com"},
    ]})
    target = tmp_path / "src/content/beifang/2026/2026-07-06.json"
    target.parent.mkdir(parents=True)
    target.write_text("SENTINEL", encoding="utf-8")
    code = run_mod.main(["--date", "2026-07-06", "--repo-root", str(tmp_path)])
    assert code == 0
    assert target.read_text(encoding="utf-8") == "SENTINEL"


def test_limit_caps_entries(tmp_path, monkeypatch):
    monkeypatch.setattr(run_mod, "capture_page", fake_capture)
    monkeypatch.setattr(run_mod, "load_panel", lambda: {"version": "v", "entries": [
        {"id": f"elsevier-{i:02d}", "group": "verlag", "publisher": "elsevier",
         "url": "https://doi.org/10.x", "expected_domain": "sciencedirect.com"}
        for i in range(1, 6)]})
    run_mod.main(["--date", "2026-07-06", "--repo-root", str(tmp_path), "--limit", "2"])
    data = json.loads((tmp_path / "src/content/beifang/2026/2026-07-06.json").read_text())
    assert len(data["vantages"]["automat"]["results"]) == 2


def test_run_threads_identity_and_vantage(tmp_path, monkeypatch):
    monkeypatch.setattr(run_mod, "capture_page", fake_capture)
    monkeypatch.setattr(run_mod, "load_panel", lambda: {"version": "v", "entries": [
        {"id": "springer-nature-01", "group": "verlag", "publisher": "springer-nature",
         "url": "https://doi.org/10.1/x", "expected_domain": "nature.com",
         "identity": {"doi": "10.1/x", "titel": None, "keywords": []}}]})
    code = run_mod.main(["--date", "2026-07-13", "--repo-root", str(tmp_path), "--vantage", "vps"])
    assert code == 0
    import json as _j
    data = _j.loads((tmp_path / "src/content/beifang/2026/2026-07-13.json").read_text())
    assert data["vantage"] == "vps"
