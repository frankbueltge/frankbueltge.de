"""TOP Vertreibung — UNHCR Global Trends, manuell nachgeführte Datendatei (Kadenz-ehrlich)."""
from __future__ import annotations

import json
from importlib.resources import files

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.model import Measurement, SourceMeta


def measure(ctx: Context) -> Measurement:
    data = json.loads(files("protokoll.data").joinpath("refugees.json").read_text())
    return Measurement(value=float(data["value"]), as_of=data["as_of"])


SPEC = AdapterSpec(
    top_id="refugees", unit="Menschen", cadence="periodic",
    corridor=(5e7, 2e8), max_age_days=None,
    source=SourceMeta(name="UNHCR Global Trends",
                      url="https://www.unhcr.org/global-trends",
                      license="UNHCR: frei nutzbar mit Quellenangabe"),
    measure=measure,
)
