import json
from pathlib import Path

import protokoll.run as run_mod
from protokoll.adapters import ALL_SPECS
from protokoll.model import DayRecord, Entry, SourceMeta


def test_registry_has_13_entries_in_agenda_order():
    ids = [s.top_id for s in ALL_SPECS]
    assert ids == ["co2", "seaice_north", "seaice_south", "sst", "fires", "quakes",
                   "population", "refugees", "food", "rates", "oil", "conflict",
                   "attention"]


def test_registry_ids_are_unique():
    ids = [s.top_id for s in ALL_SPECS]
    assert len(ids) == len(set(ids))


def test_dry_run_writes_day_json(tmp_path, monkeypatch):
    fake = DayRecord(date="2026-06-12", generated_at="x", schema_version="1",
                     pipeline_version="0.1.0", entries=(Entry(
                         top_id="co2", status="ok", unit="ppm", cadence="daily",
                         source=SourceMeta(name="n", url="u", license="l"),
                         retrieved_at="t", value=427.3, as_of="2026-06-10"),))
    monkeypatch.setattr(run_mod, "assemble", lambda specs, ctx, d: fake)
    code = run_mod.main(["--date", "2026-06-12", "--dry-run",
                         "--repo-root", str(tmp_path)])
    assert code == 0
    out = tmp_path / "src/content/protokoll/2026/2026-06-12.json"
    assert out.exists()
    assert json.loads(out.read_text())["date"] == "2026-06-12"


def test_invalid_date_exits_with_argparse_error(tmp_path):
    import pytest

    with pytest.raises(SystemExit) as exc_info:
        run_mod.main(["--date", "12.06.2026", "--dry-run", "--repo-root", str(tmp_path)])
    assert exc_info.value.code == 2
