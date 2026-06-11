"""TOP Ernährung — FAO-Nahrungsmittelpreisindex, manuell nachgeführte Datendatei."""
from __future__ import annotations

import json
from importlib.resources import files

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.model import Measurement, SourceMeta


def measure(ctx: Context) -> Measurement:
    data = json.loads(files("protokoll.data").joinpath("food.json").read_text())
    return Measurement(value=float(data["value"]), as_of=data["as_of"])


SPEC = AdapterSpec(
    top_id="food", unit="Punkte", cadence="monthly",
    corridor=(80, 250), max_age_days=None,
    source=SourceMeta(name="FAO Food Price Index (2014–2016 = 100)",
                      url="https://www.fao.org/worldfoodsituation/foodpricesindex/en/",
                      license="FAO: frei nutzbar mit Quellenangabe (CC BY-NC-SA 3.0 IGO)"),
    measure=measure,
)
