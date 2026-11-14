"""Hugging Face, Daily Papers — the preprints the machine-learning community upvotes.

Added 2026-11-14. arXiv lists what was submitted; this list says which of those papers
practitioners stopped for. Read from the Hub's public API, ordered here by upvotes (ties by
title, so the order is stable). One platform with `huggingface`."""
from __future__ import annotations

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = "https://huggingface.co/api/daily_papers?limit=50"
TOP_N = 25


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    rows: list[tuple[int, str, str, str | None]] = []
    for entry in data if isinstance(data, list) else []:
        paper = entry.get("paper") or {}
        title = " ".join((paper.get("title") or entry.get("title") or "").split())
        pid = (paper.get("id") or "").strip()
        if not title or not pid:
            continue
        upvotes = paper.get("upvotes")
        rows.append((upvotes if isinstance(upvotes, int) else 0, title, pid,
                     (paper.get("publishedAt") or "")[:10] or None))
    rows.sort(key=lambda r: (-r[0], r[1]))
    signals = [Signal(
        source="hf_papers", label=title, rank=i + 1, magnitude=upvotes, magnitude_unit="upvotes",
        url=f"https://huggingface.co/papers/{pid}", meta={"arxiv_id": pid, "published": published},
    ) for i, (upvotes, title, pid, published) in enumerate(rows[:TOP_N])]
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="hf_papers", name="Hugging Face — Daily Papers, by upvotes (Hub API)",
    url="https://huggingface.co/papers",
    licence="Hugging Face terms; titles, links and upvote counts only",
    fetch=fetch_source, optional=True, platform="huggingface",
)
