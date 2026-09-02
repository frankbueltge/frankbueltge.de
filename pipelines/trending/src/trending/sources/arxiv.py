"""arXiv — the newest preprints in cs.AI, cs.CL, cs.LG and cs.SE.

One request per run day, sorted by submission date: what the research side of the web put
out last night, before any of it reaches a headline. Titles arrive line-wrapped from the
API and are normalised to one line. Abstracts are not read.

Optional: the API answers slowly under load and asks callers to keep three seconds between
requests — one request per day stays far inside that."""
from __future__ import annotations

import xml.etree.ElementTree as ET

from trending.fetch import fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec

URL = ("https://export.arxiv.org/api/query"
       "?search_query=cat:cs.AI+OR+cat:cs.CL+OR+cat:cs.LG+OR+cat:cs.SE"
       "&sortBy=submittedDate&sortOrder=descending&max_results=30")
NS = {"a": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}


def fetch_source(ctx: Context) -> SourceResult:
    root = ET.fromstring(fetch(URL, client=ctx.client))
    signals: list[Signal] = []
    for entry in root.findall("a:entry", NS):
        title = " ".join((entry.findtext("a:title", namespaces=NS) or "").split())
        if not title:
            continue
        primary = entry.find("arxiv:primary_category", NS)
        signals.append(Signal(
            source="arxiv", label=title, rank=len(signals) + 1, magnitude=None,
            magnitude_unit="rank",
            url=(entry.findtext("a:id", namespaces=NS) or "").strip() or None,
            meta={"primary_category": (primary.get("term") if primary is not None else None),
                  "published": (entry.findtext("a:published", namespaces=NS) or "").strip() or None},
        ))
    return SourceResult(signals, as_of=ctx.today.isoformat())


SPEC = SourceSpec(
    id="arxiv", name="arXiv — newest preprints in cs.AI, cs.CL, cs.LG and cs.SE (API)",
    url="https://info.arxiv.org/help/api/index.html",
    licence="arXiv API terms of use; titles, links and dates only",
    fetch=fetch_source, optional=True,
)
