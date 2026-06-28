from datetime import date

import httpx

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.assemble import assemble
from protokoll.model import Measurement, SourceMeta

SRC = SourceMeta(name="Test", url="https://example.org", license="PD")


def ctx():
    return Context(client=httpx.Client(transport=httpx.MockTransport(
        lambda req: httpx.Response(500))), today=date(2026, 6, 12), env={})


def spec(top_id, measure, corridor=None, max_age_days=None):
    return AdapterSpec(top_id=top_id, unit="u", cadence="daily",
                       corridor=corridor, max_age_days=max_age_days,
                       source=SRC, measure=measure)


def test_assemble_ok_implausible_unavailable_and_stale():
    specs = [
        spec("a", lambda c: Measurement(value=5.0, as_of="2026-06-11"), corridor=(0, 10)),
        spec("b", lambda c: Measurement(value=99.0, as_of="2026-06-11"), corridor=(0, 10)),
        spec("c", lambda c: (_ for _ in ()).throw(RuntimeError("boom"))),
        spec("d", lambda c: Measurement(value=5.0, as_of="2026-01-01"),
             corridor=(0, 10), max_age_days=7),
    ]
    record = assemble(specs, ctx(), "2026-06-12")
    by_id = {e.top_id: e for e in record.entries}
    assert by_id["a"].status == "ok" and by_id["a"].value == 5.0
    assert by_id["b"].status == "implausible" and by_id["b"].value == 99.0
    assert by_id["c"].status == "unavailable" and "boom" in by_id["c"].note
    assert by_id["c"].value is None
    assert by_id["d"].status == "unavailable" and "stale" in by_id["d"].note
    assert record.date == "2026-06-12"
    assert record.schema_version == "3" and record.pipeline_version == "0.1.0"
    assert len(record.entries) == 4  # Reihenfolge = Spec-Reihenfolge
    assert isinstance(record.entries, tuple)  # Archiv ist unveränderlich


def test_assemble_keeps_measurement_extras():
    m = Measurement(value=1.0, as_of="2026-06-11", label="Titel", record=True)
    record = assemble([spec("a", lambda c: m)], ctx(), "2026-06-12")
    e = record.entries[0]
    assert e.label == "Titel" and e.record is True and e.as_of == "2026-06-11"


def test_assemble_non_finite_value_is_unavailable():
    record = assemble(
        [spec("nan", lambda c: Measurement(value=float("nan"), as_of="2026-06-11"))],
        ctx(), "2026-06-12")
    e = record.entries[0]
    assert e.status == "unavailable"
    assert "non-finite" in e.note
    assert e.value is None


def test_assemble_non_finite_comparison_is_unavailable():
    from protokoll.model import Comparison

    m = Measurement(value=5.0, as_of="2026-06-11",
                    comparison=Comparison(label="prev_day", value=float("nan")))
    record = assemble([spec("cmp", lambda c: m)], ctx(), "2026-06-12")
    e = record.entries[0]
    assert e.status == "unavailable"
    assert "non-finite comparison" in e.note
    assert e.value is None and e.comparison is None


def test_assemble_missing_as_of_is_unavailable():
    record = assemble([spec("noasof", lambda c: Measurement(value=5.0, as_of=None))],
                      ctx(), "2026-06-12")
    e = record.entries[0]
    assert e.status == "unavailable"
    assert "as_of" in e.note
