"""TOP Konflikt — GDELT 2.0 Events aus den Rohdateien (HTTP, ohne GCP)."""
import io
import zipfile
from datetime import date

import httpx
import pytest

from protokoll.adapters import conflict
from protokoll.adapters.base import Context
from protokoll.fetch import SourceUnavailable


def gdelt_row(quadclass: int) -> str:
    """Eine GDELT-2.0-Events-Zeile (61 Tab-Felder); QuadClass steht an Index 29."""
    fields = [""] * 61
    fields[conflict.QUADCLASS_FIELD] = str(quadclass)
    return "\t".join(fields)


# Zwei Konflikt-Zeilen (QuadClass 3 & 4) + eine Nicht-Konflikt-Zeile (1) → zählt 2.
SAMPLE_CSV = "\n".join([gdelt_row(3), gdelt_row(1), gdelt_row(4)]) + "\n"


def make_zip(csv_text: str) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w") as zf:
        zf.writestr("slice.export.CSV", csv_text)
    return buf.getvalue()


def ctx(handler) -> Context:
    return Context(
        client=httpx.Client(transport=httpx.MockTransport(handler)),
        today=date(2026, 6, 12),
        env={},
    )


def test_count_quadclass_counts_only_conflict_rows():
    csv = "\n".join([gdelt_row(1), gdelt_row(2), gdelt_row(3), gdelt_row(4), gdelt_row(4)])
    assert conflict.count_quadclass(csv.encode("utf-8")) == 3  # 3, 4, 4


def test_conflict_sums_yesterdays_slots_over_http():
    seen = []

    def handler(req):
        url = str(req.url)
        seen.append(url)
        # Zwei der 96 Slots liefern Daten, der Rest fehlt (404).
        if url.endswith("000000.export.CSV.zip") or url.endswith("001500.export.CSV.zip"):
            return httpx.Response(200, content=make_zip(SAMPLE_CSV))
        return httpx.Response(404)

    m = conflict.measure(ctx(handler))
    assert m.value == 4.0           # 2 Slots × 2 Konfliktzeilen
    assert m.as_of == "2026-06-11"  # Vortag = vollständiger Tag
    assert any("20260611000000.export.CSV.zip" in u for u in seen)  # holt den Vortag
    assert len(seen) == 96          # alle 96 15-Minuten-Slots


def test_conflict_all_slots_missing_raises():
    with pytest.raises(SourceUnavailable):
        conflict.measure(ctx(lambda req: httpx.Response(404)))


def test_conflict_too_many_download_failures_raises():
    with pytest.raises(SourceUnavailable):
        conflict.measure(ctx(lambda req: httpx.Response(503)))
