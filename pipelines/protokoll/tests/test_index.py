from datetime import date

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.assemble import assemble, build_entry, compute_index
from protokoll.model import Entry, Measurement, SourceMeta

SRC = SourceMeta(name="n", url="u", license="l")


def _entry(top_id: str, trend):
    return Entry(top_id=top_id, status="ok", unit="x", cadence="daily", source=SRC,
                 retrieved_at="t", value=1.0, as_of="2026-01-01", trend=trend)


def test_compute_index_counts_only_eligible_with_trend():
    entries = (
        _entry("co2", "worsened"),
        _entry("seaice_north", "improved"),
        _entry("sst", None),        # indexfähig, aber Trend nicht etabliert
        _entry("oil", "worsened"),  # nicht indexfähig → ignoriert
        _entry("quakes", None),     # nicht indexfähig
    )
    idx = compute_index(entries)
    assert idx.eligible == 3
    assert idx.established == 2
    assert idx.worsened == 1
    assert idx.improved == 1
    assert idx.unchanged == 0


def test_build_entry_forwards_trend():
    spec = AdapterSpec(top_id="co2", unit="ppm", cadence="daily", corridor=(350, 500),
                       max_age_days=14, source=SRC,
                       measure=lambda ctx: Measurement(value=420.0, as_of="2026-01-01",
                                                       trend="worsened"))
    e = build_entry(spec, Context(client=None, today=date(2026, 1, 2), env={}))
    assert e.status == "ok"
    assert e.trend == "worsened"


def test_assemble_sets_index_and_schema_v3():
    spec = AdapterSpec(top_id="co2", unit="ppm", cadence="daily", corridor=(350, 500),
                       max_age_days=14, source=SRC,
                       measure=lambda ctx: Measurement(value=420.0, as_of="2026-01-02",
                                                       trend="worsened"))
    rec = assemble([spec], Context(client=None, today=date(2026, 1, 2), env={}), "2026-01-02")
    assert rec.schema_version == "3"
    assert rec.index.eligible == 1
    assert rec.index.worsened == 1
