import json

import httpx

import protokoll.spielraum.run as run_mod
from protokoll.spielraum.sources import WATCHLIST

BASE_HTML = '<html><body><a href="/2025-report.pdf">2025 Report</a></body></html>'
CHANGED_HTML = (
    '<html><body><a href="/2025-report.pdf">2025 Report</a>'
    '<a href="/2026-environmental-report.pdf">2026 Report</a></body></html>'
)


def _handler(html_by_url: dict[str, str] | None = None, fail_urls: set[str] | None = None):
    html_by_url = html_by_url or {}
    fail_urls = fail_urls or set()

    def handler(request: httpx.Request) -> httpx.Response:
        url = str(request.url)
        if url in fail_urls:
            return httpx.Response(404)
        return httpx.Response(200, text=html_by_url.get(url, BASE_HTML))

    return handler


_REAL_CLIENT_CLS = httpx.Client  # EINMAL beim Import einfangen — s. u.


def _patch_client(monkeypatch, handler) -> None:
    # main() baut sich seinen httpx.Client selbst — hier den echten Transport durch
    # MockTransport ersetzen, kwargs (z. B. headers=...) werden ignoriert. Die echte
    # Client-Klasse aus _REAL_CLIENT_CLS nehmen (nicht httpx.Client neu einfangen!) —
    # sonst zeigt sie beim zweiten _patch_client()-Aufruf im selben Test (gleiches
    # Modulobjekt, bereits gepatcht) auf den vorigen Mock statt den echten Client.
    monkeypatch.setattr(run_mod.httpx, "Client",
                         lambda **kwargs: _REAL_CLIENT_CLS(transport=httpx.MockTransport(handler)))


def _watch_path(tmp_path):
    return tmp_path / "src/data/spielraum/watch.json"


def test_first_run_sets_baseline_without_issue(tmp_path, monkeypatch):
    _patch_client(monkeypatch, _handler())
    summary_path = tmp_path / "summary.json"

    code = run_mod.main([
        "--date", "2026-08-01", "--repo-root", str(tmp_path),
        "--summary-out", str(summary_path),
    ])
    assert code == 0

    state = json.loads(_watch_path(tmp_path).read_text())
    assert state["schema_version"] == "1"
    assert set(state["sources"]) == {s.kind for s in WATCHLIST}
    for entry in state["sources"].values():
        assert entry["status"] == "ok"
        assert entry["consecutive_unreachable"] == 0
        assert entry["fingerprint"]
        assert entry["matches"]
        assert entry["last_checked"] == "2026-08-01"

    summary = json.loads(summary_path.read_text())
    assert summary["issue_needed"] is False
    assert summary["changed"] == []
    assert summary["unreachable"] == []


def test_changed_source_triggers_issue_with_company_and_url(tmp_path, monkeypatch):
    _patch_client(monkeypatch, _handler())
    assert run_mod.main(["--date", "2026-08-01", "--repo-root", str(tmp_path)]) == 0

    changed = WATCHLIST[0]
    _patch_client(monkeypatch, _handler(html_by_url={changed.url: CHANGED_HTML}))
    summary_path = tmp_path / "summary2.json"

    code = run_mod.main([
        "--date", "2026-09-01", "--repo-root", str(tmp_path),
        "--summary-out", str(summary_path),
    ])
    assert code == 0

    summary = json.loads(summary_path.read_text())
    assert summary["issue_needed"] is True
    assert summary["changed"] == [changed.kind]
    assert changed.company in summary["body"]
    assert changed.url in summary["body"]
    assert "Report-Seite" in summary["title"]


def test_source_unreachable_once_no_issue_yet(tmp_path, monkeypatch):
    _patch_client(monkeypatch, _handler())
    assert run_mod.main(["--date", "2026-08-01", "--repo-root", str(tmp_path)]) == 0

    dead = WATCHLIST[1]
    _patch_client(monkeypatch, _handler(fail_urls={dead.url}))
    summary_path = tmp_path / "summary3.json"

    code = run_mod.main([
        "--date", "2026-09-01", "--repo-root", str(tmp_path),
        "--summary-out", str(summary_path),
    ])
    assert code == 0

    state = json.loads(_watch_path(tmp_path).read_text())
    assert state["sources"][dead.kind]["status"] == "unreachable"
    assert state["sources"][dead.kind]["consecutive_unreachable"] == 1

    summary = json.loads(summary_path.read_text())
    assert summary["issue_needed"] is False
    assert summary["unreachable"] == []


def test_source_unreachable_twice_in_a_row_triggers_issue(tmp_path, monkeypatch):
    _patch_client(monkeypatch, _handler())
    assert run_mod.main(["--date", "2026-08-01", "--repo-root", str(tmp_path)]) == 0

    dead = WATCHLIST[1]
    _patch_client(monkeypatch, _handler(fail_urls={dead.url}))
    assert run_mod.main(["--date", "2026-09-01", "--repo-root", str(tmp_path)]) == 0

    summary_path = tmp_path / "summary4.json"
    code = run_mod.main([
        "--date", "2026-10-01", "--repo-root", str(tmp_path),
        "--summary-out", str(summary_path),
    ])
    assert code == 0

    state = json.loads(_watch_path(tmp_path).read_text())
    assert state["sources"][dead.kind]["consecutive_unreachable"] == 2

    summary = json.loads(summary_path.read_text())
    assert summary["issue_needed"] is True
    assert dead.kind in summary["unreachable"]
    assert "nicht erreichbar" in summary["body"]


def test_summary_out_written_with_expected_shape(tmp_path, monkeypatch):
    _patch_client(monkeypatch, _handler())
    summary_path = tmp_path / "nested" / "dir" / "summary.json"

    code = run_mod.main([
        "--date", "2026-08-01", "--repo-root", str(tmp_path),
        "--summary-out", str(summary_path),
    ])
    assert code == 0
    assert summary_path.exists()
    summary = json.loads(summary_path.read_text())
    assert set(summary) == {"issue_needed", "title", "body", "changed", "unreachable"}


def test_run_without_summary_out_still_exits_zero(tmp_path, monkeypatch):
    _patch_client(monkeypatch, _handler())
    code = run_mod.main(["--date", "2026-08-01", "--repo-root", str(tmp_path)])
    assert code == 0
    assert _watch_path(tmp_path).exists()
