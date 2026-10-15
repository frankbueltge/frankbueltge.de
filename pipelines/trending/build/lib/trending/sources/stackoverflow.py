"""Stack Overflow — the questions the site's own "hot" ranking puts on top.

Quota: the Stack Exchange API allows 300 requests per day per IP without a key. One
request per run day is spent here, so the nightly stays far inside it; anything that
would loop over pages needs a registered key first.

Question titles arrive HTML-escaped from the API and are unescaped once for the record."""
from __future__ import annotations

import html

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = ("https://api.stackexchange.com/2.3/questions"
       "?order=desc&sort=hot&site=stackoverflow&pagesize=30")


def fetch_source(ctx: Context) -> SourceResult:
    data = fetch(URL, client=ctx.client, expect="json")
    signals: list[Signal] = []
    for question in data.get("items", []):
        title = html.unescape(question.get("title") or "").strip()
        if not title:
            continue
        signals.append(Signal(
            source="stackoverflow", label=title, rank=len(signals) + 1,
            magnitude=int(question.get("score") or 0), magnitude_unit="score",
            url=(question.get("link") or "").strip() or None,
            meta={"tags": list(question.get("tags") or []),
                  "answer_count": int(question.get("answer_count") or 0)},
        ))
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="stackoverflow", name="Stack Overflow — hot questions (Stack Exchange API)",
    url="https://api.stackexchange.com/docs/questions",
    licence="Stack Exchange API terms; question titles CC BY-SA 4.0, links and counts only",
    fetch=fetch_source,
)
