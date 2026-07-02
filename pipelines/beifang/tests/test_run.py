import json

import beifang.run as run_mod
from beifang.capture import RawCapture


def fake_capture(url, **kwargs):
    if "kontrolle-blockiert" in url:
        return RawCapture(final_url=url, http_status=403, page_title="Access Denied",
                          requests=(), cookies=())
    return RawCapture(final_url="https://www.sciencedirect.com/x", http_status=200,
                      page_title="Artikel", requests=(), cookies=())


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
    results = data["vantages"]["us"]["results"]
    assert len(results) == 2
    blocked = next(r for r in results if r["panel_id"] == "sage-01")
    assert blocked["blocked"]["type"] == "http" and blocked["tracker_hosts"] is None
    assert data["befund"]["kind"] == "baseline"


def test_limit_caps_entries(tmp_path, monkeypatch):
    monkeypatch.setattr(run_mod, "capture_page", fake_capture)
    monkeypatch.setattr(run_mod, "load_panel", lambda: {"version": "v", "entries": [
        {"id": f"elsevier-{i:02d}", "group": "verlag", "publisher": "elsevier",
         "url": "https://doi.org/10.x", "expected_domain": "sciencedirect.com"}
        for i in range(1, 6)]})
    run_mod.main(["--date", "2026-07-06", "--repo-root", str(tmp_path), "--limit", "2"])
    data = json.loads((tmp_path / "src/content/beifang/2026/2026-07-06.json").read_text())
    assert len(data["vantages"]["us"]["results"]) == 2
