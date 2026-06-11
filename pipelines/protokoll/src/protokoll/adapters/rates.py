"""TOP Geldpreis — Euro Short-Term Rate (€STR), EZB-Datenportal (SDMX-CSV)."""
from __future__ import annotations

import csv
import io

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Comparison, Measurement, SourceMeta

URL = ("https://data-api.ecb.europa.eu/service/data/EST/B.EU000A2X2A25.WT"
       "?lastNObservations=2&format=csvdata")


def measure(ctx: Context) -> Measurement:
    text = fetch(URL, client=ctx.client)
    reader = csv.reader(io.StringIO(text))
    header = [h.strip() for h in next(reader)]
    i_time, i_val = header.index("TIME_PERIOD"), header.index("OBS_VALUE")
    rows = sorted((row[i_time].strip(), float(row[i_val].strip()))
                  for row in reader if row and row[i_val].strip())
    as_of, value = rows[-1]
    # "prev_observation_day": ECB veröffentlicht nur an Geschäftstagen — über ein
    # Wochenende wäre "Vortag" faktisch falsch.
    comparison = (Comparison(label="prev_observation_day", value=rows[-2][1])
                  if len(rows) > 1 else None)
    return Measurement(value=value, as_of=as_of, comparison=comparison)


SPEC = AdapterSpec(
    top_id="rates", unit="%", cadence="daily", corridor=(-1, 8), max_age_days=7,
    source=SourceMeta(name="Europäische Zentralbank, €STR", url="https://data.ecb.europa.eu/",
                      license="EZB: frei nutzbar mit Quellenangabe"),
    measure=measure,
)
