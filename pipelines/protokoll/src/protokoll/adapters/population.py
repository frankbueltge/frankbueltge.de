"""TOP Anwesenheit — Weltbevölkerung, lineare Extrapolation UN WPP 2024.
Referenz: UN DESA, World Population Prospects 2024 (Mitte 2025: 8,231 Mrd.;
Nettowachstum ~70 Mio./Jahr ≈ 191.000/Tag). Als Schätzung ausgewiesen."""
from __future__ import annotations

from datetime import date

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.model import Measurement, SourceMeta

REF_DATE = date(2025, 7, 1)
REF_POP = 8_231_000_000.0
NET_PER_DAY = 191_000.0


def measure(ctx: Context) -> Measurement:
    days = (ctx.today - REF_DATE).days
    return Measurement(value=REF_POP + days * NET_PER_DAY, as_of=ctx.today.isoformat())


SPEC = AdapterSpec(
    top_id="population", unit="Menschen", cadence="computed",
    corridor=(7.5e9, 9.5e9), max_age_days=None,
    source=SourceMeta(name="UN DESA, World Population Prospects 2024 (Extrapolation)",
                      url="https://population.un.org/wpp/",
                      license="CC BY 3.0 IGO"),
    measure=measure,
)
