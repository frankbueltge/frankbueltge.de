"""TOP Konflikt — GDELT v2 Events (BigQuery Public Dataset), QuadClass 3+4
(verbaler/materieller Konflikt), Vortag. Partition-Filter ist Pflicht (Kosten)."""
from __future__ import annotations

from datetime import timedelta

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import SourceUnavailable
from protokoll.model import Measurement, SourceMeta

QUERY = """
SELECT COUNT(*) AS events
FROM `gdelt-bq.gdeltv2.events_partitioned`
WHERE _PARTITIONTIME >= TIMESTAMP(@day)
  AND _PARTITIONTIME < TIMESTAMP_ADD(TIMESTAMP(@day), INTERVAL 1 DAY)
  AND QuadClass IN (3, 4)
"""


def measure(ctx: Context) -> Measurement:
    if ctx.bq_client_factory is None:
        raise SourceUnavailable("BigQuery-Client nicht konfiguriert")
    from google.cloud import bigquery  # lazy: nur dieser Adapter braucht GCP

    client = ctx.bq_client_factory()
    day = (ctx.today - timedelta(days=1)).isoformat()
    job_config = bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("day", "DATE", day)],
        # Harte Kostenbremse: ~25x eines normalen Tages-Scans. Greift die Partition-
        # Beschneidung je nicht, bricht der Job ab, bevor etwas berechnet wird.
        maximum_bytes_billed=5 * 1024**3,
    )
    rows = list(client.query(QUERY, job_config=job_config).result())
    if not rows:
        raise SourceUnavailable("GDELT/BigQuery: leeres Ergebnis (COUNT(*) liefert sonst immer 1 Zeile)")
    return Measurement(value=float(rows[0]["events"]), as_of=day)


SPEC = AdapterSpec(
    top_id="conflict", unit="Ereignisse", cadence="daily",
    corridor=(0, 200_000), max_age_days=None,
    source=SourceMeta(name="GDELT v2 Events (BigQuery Public Dataset); erfasst Medienberichte",
                      url="https://www.gdeltproject.org/",
                      license="GDELT: frei nutzbar mit Quellenangabe"),
    measure=measure,
)
