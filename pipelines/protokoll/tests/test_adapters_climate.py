from datetime import date
from pathlib import Path

import httpx

from protokoll.adapters import co2, seaice, sst
from protokoll.adapters.base import Context

FIX = Path(__file__).parent / "fixtures"


def ctx_for(body: str, *, json_body: bool = False, today=date(2026, 6, 12)):
    def handler(req):
        if json_body:
            return httpx.Response(200, text=body, headers={"content-type": "application/json"})
        return httpx.Response(200, text=body)
    return Context(client=httpx.Client(transport=httpx.MockTransport(handler)),
                   today=today, env={})


def test_co2_latest_trend_with_prev_year_and_record():
    m = co2.measure(ctx_for((FIX / "co2_trend_gl.csv").read_text()))
    assert m.value == 427.30
    assert m.as_of == "2026-06-10"
    assert m.comparison.label == "prev_year_day" and m.comparison.value == 424.52
    assert m.record is True  # 427.30 > alle früheren Trendwerte


def test_sst_latest_non_null_with_prev_year_and_record():
    m = sst.measure(ctx_for((FIX / "sst_world.json").read_text(), json_body=True))
    assert m.value == 21.1          # Index 1 = letzter Nicht-null-Wert 2026
    assert m.as_of == "2026-01-02"  # Tag-des-Jahres 2
    assert m.comparison.label == "prev_year_day" and m.comparison.value == 20.9
    assert m.record is True         # 21.1 > 21.0 (Alltime-Max aller anderen Jahre; "mean"-Serie zählt nicht)


def test_seaice_north_and_south():
    mn = seaice.measure_north(ctx_for((FIX / "n_seaice.csv").read_text()))
    assert mn.value == 10.689 and mn.as_of == "2026-06-10"
    assert mn.comparison.label == "prev_year_day" and mn.comparison.value == 11.013
    ms = seaice.measure_south(ctx_for((FIX / "s_seaice.csv").read_text()))
    assert ms.value == 13.118 and ms.comparison.value == 13.502


def test_specs_metadata():
    assert co2.SPEC.top_id == "co2" and co2.SPEC.corridor == (350, 500)
    assert sst.SPEC.unit == "°C"
    assert seaice.SPEC_NORTH.top_id == "seaice_north"
    assert seaice.SPEC_SOUTH.top_id == "seaice_south"


def test_seaice_skips_unit_line_and_sentinel_rows():
    # Fixture enthält Unit-Header (YYYY, MM, ...) und eine -9999-Sentinel-Zeile —
    # beide dürfen nicht als Messwerte landen.
    m = seaice.measure_north(ctx_for((FIX / "n_seaice.csv").read_text()))
    assert m.value == 10.689  # Sentinel-Zeile vom 08.06. ist übersprungen
    assert m.as_of == "2026-06-10"


def test_seaice_without_prev_year_has_no_comparison():
    csv = (
        "Year, Month, Day,     Extent,    Missing, Source Data\n"
        "2026,    06,  09,     10.711,      0.000, NSIDC\n"
        "2026,    06,  10,     10.689,      0.000, NSIDC\n"
    )
    m = seaice.measure_north(ctx_for(csv))
    assert m.value == 10.689
    assert m.comparison is None
