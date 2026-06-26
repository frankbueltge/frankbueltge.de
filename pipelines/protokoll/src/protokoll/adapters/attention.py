"""TOP Aufmerksamkeit — meistgelesener Artikel der engl. Wikipedia (Proxy, s. Methodenblatt).

Wikimedias „Top"-Pageviews eines Tages liegen erst mit Verzug vor: nachts um 03:30 UTC ist
der Vortag noch nicht publiziert (→ HTTP 404). Darum den jüngsten VERFÜGBAREN Tag der letzten
vier nehmen (meist gestern-minus-eins), statt stur den Vortag — sonst bleibt die Kachel leer."""
from __future__ import annotations

from datetime import timedelta

from protokoll.adapters.base import AdapterSpec, Context
from protokoll.fetch import SourceUnavailable, fetch
from protokoll.model import Measurement, SourceMeta

BASE = "https://wikimedia.org/api/rest_v1/metrics/pageviews/top/en.wikipedia.org/all-access"
_SKIP_PREFIXES = ("Special:", "Wikipedia:", "Portal:", "File:", "Help:",
                  "Talk:", "User:", "Template:", "MediaWiki:")
LOOKBACK_DAYS = 4  # heute-1 … heute-4: fängt den Publikations-Verzug ab


def measure(ctx: Context) -> Measurement:
    last_err: Exception | None = None
    for back in range(1, LOOKBACK_DAYS + 1):
        day = ctx.today - timedelta(days=back)
        url = f"{BASE}/{day.year}/{day.month:02d}/{day.day:02d}"
        try:
            data = fetch(url, client=ctx.client, expect="json")
        except SourceUnavailable as exc:
            last_err = exc  # Tag noch nicht publiziert → nächst-älteren versuchen
            continue
        for art in data["items"][0]["articles"]:
            name = art["article"]
            if name in ("Main_Page", "-") or name.startswith(_SKIP_PREFIXES):
                continue
            return Measurement(value=float(art["views"]), as_of=day.isoformat(),
                               label=name.replace("_", " "))
        # Tag verfügbar, aber keine reguläre Seite — nächst-älteren versuchen
    raise SourceUnavailable(
        f"Wikimedia Top-Pageviews: kein verfügbarer Tag in den letzten {LOOKBACK_DAYS} "
        f"(zuletzt: {last_err})")


SPEC = AdapterSpec(
    top_id="attention", unit="Aufrufe", cadence="daily",
    corridor=(100_000, 100_000_000), max_age_days=LOOKBACK_DAYS,
    source=SourceMeta(name="Wikimedia Pageviews API (en.wikipedia.org)",
                      url="https://wikimedia.org/api/rest_v1/",
                      license="CC0 (Messdaten)"),
    measure=measure,
)
