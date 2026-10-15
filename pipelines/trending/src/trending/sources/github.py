"""GitHub — repositories created in the last seven days, by stars (search API)."""
from __future__ import annotations

from datetime import timedelta

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

TOP_N = 10


def fetch_source(ctx: Context) -> SourceResult:
    since = (ctx.today - timedelta(days=7)).isoformat()
    url = (f"https://api.github.com/search/repositories?q=created:>{since}"
           f"&sort=stars&order=desc&per_page={TOP_N}")
    data = fetch(url, client=ctx.client, expect="json")
    signals: list[Signal] = []
    for rank, repo in enumerate(data.get("items", []), 1):
        signals.append(Signal(
            source="github", label=repo.get("full_name") or repo.get("name") or "", rank=rank,
            magnitude=int(repo.get("stargazers_count") or 0), magnitude_unit="stars",
            url=repo.get("html_url"),
            meta={"language": repo.get("language"),
                  "description": (repo.get("description") or "")[:200] or None},
        ))
    return SourceResult([s for s in signals if s.label], as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="github", name="GitHub — new repositories by stars (search API)",
    url="https://docs.github.com/en/rest/search/search",
    licence="GitHub API terms; repository names, links and counts only",
    fetch=fetch_source,
)
