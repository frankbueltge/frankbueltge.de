"""TOP Konflikt — GDELT 2.0 Events aus den öffentlichen Rohdateien (HTTP, ohne GCP),
QuadClass 3+4 (verbaler/materieller Konflikt), Vortag.

GDELT veröffentlicht alle 15 Minuten eine Exportdatei (96/Tag) unter data.gdeltproject.org.
Wir zählen über den ganzen Vortag die Zeilen mit QuadClass 3 oder 4 — dasselbe Maß wie
zuvor die BigQuery-Abfrage, nur ohne GCP. Fehlende Slots (404) sind bei GDELT selten, aber
legitim (dann hat GDELT diesen Slot nicht veröffentlicht — wie im Datensatz selbst). Echte
Download-Ausfälle werden bis zu einer kleinen Schwelle toleriert; darüber lieber „entfällt"
als eine stille Unterzählung."""
from __future__ import annotations

import io
import zipfile
from datetime import timedelta

import httpx

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import SourceUnavailable
from protokoll.model import Measurement, SourceMeta

GDELT_BASE = "http://data.gdeltproject.org/gdeltv2"
QUADCLASS_FIELD = 29  # 0-basiert: Spalte 30 der GDELT-2.0-Events-Tabelle
CONFLICT_QUADCLASSES = {"3", "4"}  # verbaler & materieller Konflikt
# Die 96 Viertelstunden-Slots eines Tages als HHMMSS (Sekunde stets 00).
SLOTS = tuple(f"{h:02d}{m:02d}00" for h in range(24) for m in (0, 15, 30, 45))
MAX_DOWNLOAD_FAILURES = 4  # transiente Netzausfälle tolerieren; darüber: „entfällt"
TIMEOUT = 30.0


def count_quadclass(csv_bytes: bytes) -> int:
    """Zählt in einer GDELT-Events-CSV (Tab-getrennt) die Zeilen mit QuadClass in {3,4}."""
    n = 0
    for line in csv_bytes.decode("utf-8", "replace").splitlines():
        if not line:
            continue
        fields = line.split("\t")
        if len(fields) > QUADCLASS_FIELD and fields[QUADCLASS_FIELD] in CONFLICT_QUADCLASSES:
            n += 1
    return n


def _csv_from_zip(raw: bytes) -> bytes:
    """Die einzelne CSV aus einem GDELT-.export.CSV.zip."""
    with zipfile.ZipFile(io.BytesIO(raw)) as zf:
        return zf.read(zf.namelist()[0])


def measure(ctx: Context) -> Measurement:
    day = ctx.today - timedelta(days=1)
    day_compact = day.strftime("%Y%m%d")
    total = 0
    fetched = 0
    failures = 0
    for slot in SLOTS:
        url = f"{GDELT_BASE}/{day_compact}{slot}.export.CSV.zip"
        try:
            r = ctx.client.get(url, timeout=TIMEOUT, follow_redirects=True)
        except httpx.HTTPError:
            failures += 1
            if failures > MAX_DOWNLOAD_FAILURES:
                raise SourceUnavailable(
                    f"GDELT: zu viele Download-Ausfälle (>{MAX_DOWNLOAD_FAILURES})")
            continue
        if r.status_code == 404:
            continue  # Slot von GDELT nicht veröffentlicht — kein Fehler
        if r.status_code != 200:
            failures += 1
            if failures > MAX_DOWNLOAD_FAILURES:
                raise SourceUnavailable(
                    f"GDELT: zu viele Download-Ausfälle (>{MAX_DOWNLOAD_FAILURES})")
            continue
        try:
            total += count_quadclass(_csv_from_zip(r.content))
            fetched += 1
        except (zipfile.BadZipFile, OSError) as exc:
            failures += 1
            if failures > MAX_DOWNLOAD_FAILURES:
                raise SourceUnavailable(f"GDELT: unlesbare Dateien — {exc}") from exc

    if fetched == 0:
        raise SourceUnavailable("GDELT: keine Exportdateien des Vortags lesbar")
    return Measurement(value=float(total), as_of=day.isoformat())


SPEC = AdapterSpec(
    top_id="conflict", unit="Ereignisse", cadence="daily",
    corridor=(0, 200_000), max_age_days=None,
    source=SourceMeta(name="GDELT v2 Events (öffentliche Rohdateien); erfasst Medienberichte",
                      url="https://www.gdeltproject.org/",
                      license="GDELT: frei nutzbar mit Quellenangabe"),
    measure=measure,
)
