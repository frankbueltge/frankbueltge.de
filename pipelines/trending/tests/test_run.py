import json
from datetime import date

import httpx
import pytest

import trending.run as run_mod
from trending.model import Signal
from trending.sources.base import SourceResult, SourceSpec


def _fake_sources(fail_optional=False):
    def ok(ctx):
        return SourceResult([Signal(source="alpha", label="Storm warning", rank=1, magnitude_unit="rank", geo="US"),
                             Signal(source="alpha", label="Other", rank=2, magnitude_unit="rank", geo="US")],
                            as_of=ctx.today.isoformat())

    def beta(ctx):
        return SourceResult([Signal(source="beta", label="storm warning issued", rank=1, magnitude_unit="rank")])

    def broken(ctx):
        raise RuntimeError("boom")

    return (SourceSpec("alpha", "Alpha", "https://a", "lic", ok),
            SourceSpec("beta", "Beta", "https://b", "lic", beta),
            SourceSpec("gamma", "Gamma", "https://g", "lic", broken, optional=True))


@pytest.fixture
def patched(monkeypatch):
    monkeypatch.setattr(run_mod, "SOURCES", _fake_sources())
    monkeypatch.setattr(run_mod.time, "sleep", lambda s: None)  # the retry pause, skipped
    # run_mod.httpx is the httpx module itself, so the replacement must hold the real class
    # before the patch lands — otherwise the stand-in calls itself.
    real_client = httpx.Client
    monkeypatch.setattr(run_mod.httpx, "Client",
                        lambda **kw: real_client(transport=httpx.MockTransport(lambda req: httpx.Response(500))))


def test_dry_run_writes_day_latest_and_audience(tmp_path, patched, capsys):
    assert run_mod.main(["--repo-root", str(tmp_path), "--date", "2026-09-02"]) == 0
    out = tmp_path / "src" / "data" / "trending"
    day = json.loads((out / "2026-09-02.json").read_text())
    assert not (out / "latest.json").exists()  # the site serves latest.json from the newest day
    assert day["$contract"] == "trending-day/1" and day["date"] == "2026-09-02"
    # Only converging clusters are recorded as topics; the singleton "Other" stays a signal.
    assert [t["label"] for t in day["topics"]] == ["Storm warning"]
    assert [s["id"] for s in day["sources"]] == ["alpha", "beta", "gamma"]
    assert day["sources"][2]["status"] == "unavailable" and "RuntimeError" in day["sources"][2]["note"]
    assert day["summary"] == {"topics_total": 2, "converging": 1, "sources_ok": 2, "sources_total": 3,
                              "top_labels": ["Storm warning", "Other"]}
    assert day["topics"][0]["platforms"] == ["alpha", "beta"]
    aud = json.loads((out / "audience" / "2026-09-01.json").read_text())
    assert aud["$contract"] == "trending-audience/2" and aud["day"] == "2026-09-01"
    assert aud["edge"]["status"] == "unavailable" and "umami" not in aud
    text = (out / "2026-09-02.json").read_text()
    assert text.endswith("\n") and text == json.dumps(json.loads(text), ensure_ascii=False, indent=1, sort_keys=True) + "\n"
    assert "converging" in capsys.readouterr().out


def test_existing_day_file_is_never_rewritten(tmp_path, patched, capsys):
    out = tmp_path / "src" / "data" / "trending"
    out.mkdir(parents=True)
    (out / "2026-09-02.json").write_text('{"kept": true}\n')
    (out / "audience").mkdir()
    (out / "audience" / "2026-09-01.json").write_text('{"kept": true}\n')
    assert run_mod.main(["--repo-root", str(tmp_path), "--date", "2026-09-02"]) == 0
    assert (out / "2026-09-02.json").read_text() == '{"kept": true}\n'
    assert (out / "audience" / "2026-09-01.json").read_text() == '{"kept": true}\n'
    assert not (out / "latest.json").exists()
    assert "already committed, untouched" in capsys.readouterr().out


def test_skip_audience(tmp_path, patched):
    run_mod.main(["--repo-root", str(tmp_path), "--date", "2026-09-02", "--skip-audience"])
    assert not (tmp_path / "src" / "data" / "trending" / "audience").exists()


def test_bad_date_exits_2(tmp_path):
    with pytest.raises(SystemExit) as exc:
        run_mod.main(["--repo-root", str(tmp_path), "--date", "2026/09/02"])
    assert exc.value.code == 2


def test_non_finite_values_raise_instead_of_landing_in_the_archive():
    from trending.model import to_json
    with pytest.raises(ValueError):
        to_json({"x": float("nan")})


def test_a_source_that_fails_once_is_asked_again_and_the_day_carries_its_grade(tmp_path, patched, monkeypatch):
    calls = {"n": 0}

    def flaky(ctx):
        calls["n"] += 1
        if calls["n"] == 1:
            raise RuntimeError("first attempt fails")
        return SourceResult([Signal(source="delta", label="Recovered item", rank=1, magnitude_unit="rank")])

    slept = []
    monkeypatch.setattr(run_mod.time, "sleep", lambda s: slept.append(s))
    monkeypatch.setattr(run_mod, "SOURCES", (*_fake_sources(), SourceSpec("delta", "Delta", "https://d", "lic", flaky)))
    assert run_mod.main(["--repo-root", str(tmp_path), "--date", "2026-09-02", "--skip-terms", "--skip-audience"]) == 0
    day = json.loads((tmp_path / "src" / "data" / "trending" / "2026-09-02.json").read_text())
    delta = next(s for s in day["sources"] if s["id"] == "delta")
    assert delta["status"] == "ok" and "recovered on retry" in delta["note"] and calls["n"] == 2
    assert slept and slept[0] == 20  # the configured pause, once
    grade = day["quality"]
    assert grade["rubric_version"] == "1" and grade["total"] == 7
    assert {c["id"] for c in grade["checks"]} >= {"sources_answering", "no_giant_cluster", "size_within_bounds"}
    # a two-signal fixture cannot meet the signal floor — and the file says so instead of hiding it
    assert grade["ok"] is False
    assert any(c["id"] == "signals_present" and not c["ok"] for c in grade["checks"])
