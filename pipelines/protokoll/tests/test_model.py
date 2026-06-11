import json
from protokoll.model import (
    Comparison, DayRecord, Entry, Measurement, SourceMeta, day_record_to_json,
)

SRC = SourceMeta(name="NOAA GML", url="https://gml.noaa.gov", license="Public Domain (U.S. Government)")


def make_entry(**kw):
    base = dict(
        top_id="co2", status="ok", unit="ppm", cadence="daily", source=SRC,
        retrieved_at="2026-06-12T03:30:00Z", value=427.3, as_of="2026-06-10",
        comparison=Comparison(label="prev_year_day", value=424.5),
        label=None, record=True, note=None,
    )
    base.update(kw)
    return Entry(**base)


def test_day_record_serializes_to_stable_json():
    record = DayRecord(
        date="2026-06-12", generated_at="2026-06-12T03:30:00Z",
        schema_version="1", pipeline_version="0.1.0", entries=[make_entry()],
    )
    payload = day_record_to_json(record)
    data = json.loads(payload)
    assert data["date"] == "2026-06-12"
    assert data["entries"][0]["comparison"] == {"label": "prev_year_day", "value": 424.5}
    assert data["entries"][0]["record"] is True
    assert payload.endswith("\n")
    # deterministisch: sortierte Keys
    assert payload == day_record_to_json(record)


def test_entry_without_value_serializes_nulls():
    e = make_entry(status="unavailable", value=None, as_of=None, comparison=None,
                   record=False, note="HTTPError: 503")
    d = json.loads(day_record_to_json(DayRecord(
        date="2026-06-12", generated_at="x", schema_version="1",
        pipeline_version="0.1.0", entries=[e])))
    assert d["entries"][0]["value"] is None
    assert d["entries"][0]["comparison"] is None
    assert d["entries"][0]["note"] == "HTTPError: 503"


def test_measurement_defaults():
    m = Measurement(value=1.0, as_of="2026-06-11")
    assert m.comparison is None and m.label is None and m.record is False


def test_non_finite_values_refuse_to_serialize():
    import pytest

    e = make_entry(value=float("nan"), comparison=None)
    record = DayRecord(date="2026-06-12", generated_at="x", schema_version="1",
                       pipeline_version="0.1.0", entries=(e,))
    with pytest.raises(ValueError):
        day_record_to_json(record)


def test_non_ascii_round_trip():
    e = make_entry(note="Netzwerkfehler — Verbindung unterbrochen (üöä)",
                   label="Berliner Mauer")
    d = json.loads(day_record_to_json(DayRecord(
        date="2026-06-12", generated_at="x", schema_version="1",
        pipeline_version="0.1.0", entries=(e,))))
    assert d["entries"][0]["note"] == "Netzwerkfehler — Verbindung unterbrochen (üöä)"
    assert d["entries"][0]["label"] == "Berliner Mauer"
