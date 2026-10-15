"""Hugging Face — the models the Hub itself ranks as trending right now.

One request to the public Hub API. The Hub's own `trendingScore` decides the order; the
count recorded beside each model is its download total, which is the Hub's own number."""
from __future__ import annotations

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=20"


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    signals: list[Signal] = []
    for model in data:
        model_id = (model.get("id") or "").strip()
        if not model_id:
            continue
        signals.append(Signal(
            source="huggingface", label=model_id, rank=len(signals) + 1,
            magnitude=int(model.get("downloads") or 0), magnitude_unit="downloads",
            url=f"https://huggingface.co/{model_id}",
            meta={"likes": int(model.get("likes") or 0),
                  "pipeline_tag": model.get("pipeline_tag") or None},
        ))
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="huggingface", name="Hugging Face — trending models (Hub API)",
    url="https://huggingface.co/docs/hub/api",
    licence="Hugging Face Hub API terms; model ids, links and counts only",
    fetch=fetch_source,
)
