"""TOP Aufmerksamkeit — meistgelesener Artikel der engl. Wikipedia (Proxy, s. Methodenblatt)."""
from __future__ import annotations

from datetime import timedelta

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import fetch
from protokoll.model import Measurement, SourceMeta

BASE = "https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access"
_SKIP_PREFIXES = ("Special:", "Wikipedia:", "Portal:", "File:", "Help:")


def measure(ctx: Context) -> Measurement:
    day = ctx.today - timedelta(days=1)  # Pageviews liegen erst am Folgetag vor
    url = f"{BASE}/{day.year}/{day.month:02d}/{day.day:02d}"
    data = fetch(url, client=ctx.client, expect="json")
    for art in data["items"][0]["articles"]:
        name = art["article"]
        if name == "Main_Page" or name.startswith(_SKIP_PREFIXES):
            continue
        return Measurement(value=float(art["views"]), as_of=day.isoformat(),
                           label=name.replace("_", " "))
    raise ValueError("keine reguläre Seite in Top-Liste")


SPEC = AdapterSpec(
    top_id="attention", unit="Aufrufe", cadence="daily",
    corridor=(100_000, 100_000_000), max_age_days=3,
    source=SourceMeta(name="Wikimedia Pageviews API (en.wikipedia.org)",
                      url="https://wikimedia.org/api/rest_v1/",
                      license="CC0 (Messdaten)"),
    measure=measure,
)
