"""PyPI — the most-downloaded packages of the last thirty days.

PyPI itself publishes no ranking. `pypistats.org/api/packages/__all__/recent` returns one
aggregate number for the whole index, which ranks nothing, so the published top list
derived from the official BigQuery download statistics is read instead: a monthly file
(CC BY 4.0) whose own `last_update` timestamp becomes this source's `as_of`. That makes
the source the slowest in the ledger — it moves once a month, not once a day — and
optional: a stale or missing file must never hold the day up."""
from __future__ import annotations

from urllib.parse import quote

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://hugovk.github.io/top-pypi-packages/top-pypi-packages.min.json"
TOP_N = 20


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    last_update = (data.get("last_update") or "").strip()
    as_of = last_update.split(" ", 1)[0] or None
    source_month = as_of[:7] if as_of else None
    rows = [r for r in data.get("rows", []) if (r.get("project") or "").strip()]
    rows.sort(key=lambda r: int(r.get("download_count") or 0), reverse=True)
    signals: list[Signal] = []
    for row in rows[:TOP_N]:
        name = row["project"].strip()
        signals.append(Signal(
            source="pypi", label=name, rank=len(signals) + 1,
            magnitude=int(row.get("download_count") or 0), magnitude_unit="downloads",
            url=f"https://pypi.org/project/{quote(name)}/",
            meta={"source_month": source_month},
        ))
    return SourceResult(signals, as_of=as_of)


SPEC = SourceSpec(
    id="pypi", name="PyPI — most-downloaded packages of the last month (top-pypi-packages)",
    url="https://hugovk.github.io/top-pypi-packages/",
    licence="CC BY 4.0 (top-pypi-packages, from the official PyPI download statistics); "
            "package names, links and counts only",
    fetch=fetch_source, optional=True,
)
