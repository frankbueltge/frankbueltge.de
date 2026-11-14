"""Alert desk — what the world's warning systems are flagging, from three official feeds.

Added 2026-11-14. Every other source reads attention; this one reads the event itself, so the
ledger can show a disaster standing beside the silence about it:

  · GDACS (UN and European Commission) — disasters at alert level Orange or Red only; the
    Green ones are the planet's daily background and would bury the rest;
  · USGS — the earthquakes of the last seven days it classes as significant;
  · WHO — the newest Disease Outbreak News.

One platform, three feeds. A feed with nothing to report is not a failure: a quiet week is a
finding. A feed that does not answer is a note, the others still count."""
from __future__ import annotations

import xml.etree.ElementTree as ET

from trending.fetch import SourceUnavailable, fetch
from trending.model import Signal
from trending.sources.base import Context, SourceResult, SourceSpec, interleave

GDACS_URL = "https://www.gdacs.org/xml/rss.xml"
GDACS_NS = "{http://www.gdacs.org}"
USGS_URL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson"
WHO_URL = ("https://www.who.int/api/news/diseaseoutbreaknews"
           "?$select=Title,PublicationDate,ItemDefaultUrl&$orderby=PublicationDate%20desc&$top=10")
WHO_ITEM = "https://www.who.int/emergencies/disease-outbreak-news/item"
GDACS_LEVELS = ("Red", "Orange")
TOP_N = 15  # per feed
LABEL_MAX = 160  # a GDACS drought title lists every country it touches; the list stays in meta


def _capped(title: str) -> str:
    if len(title) <= LABEL_MAX:
        return title
    cut = title.rfind(",", 0, LABEL_MAX)
    return title[: cut if cut > 40 else LABEL_MAX].rstrip(" ,") + " …"


def _gdacs(ctx: Context) -> list[tuple[str, str | None, dict]]:
    root = ET.fromstring(fetch(GDACS_URL, client=ctx.client))
    out: list[tuple[str, str | None, dict]] = []
    for item in root.iter("item"):
        level = (item.findtext(f"{GDACS_NS}alertlevel") or "").strip()
        title = " ".join((item.findtext("title") or "").split())
        if level not in GDACS_LEVELS or not title:
            continue
        link = (item.findtext("link") or "").strip().replace("http://www.gdacs.org", "https://www.gdacs.org")
        out.append((_capped(title), link or None,
                    {"level": level,
                     "event_type": (item.findtext(f"{GDACS_NS}eventtype") or "").strip() or None,
                     "country": (item.findtext(f"{GDACS_NS}country") or "").strip() or None}))
    out.sort(key=lambda row: GDACS_LEVELS.index(row[2]["level"]))  # stable: Red first
    return out


def _usgs(ctx: Context) -> list[tuple[str, str | None, dict]]:
    data = fetch(USGS_URL, client=ctx.client, expect="json")
    out: list[tuple[str, str | None, dict]] = []
    for feature in data.get("features") or []:
        props = feature.get("properties") or {}
        title = " ".join((props.get("title") or "").split())
        if title:
            out.append((f"Earthquake: {title}", (props.get("url") or "").strip() or None,
                        {"magnitude": props.get("mag"), "pager": props.get("alert")}))
    return out


def _who(ctx: Context) -> list[tuple[str, str | None, dict]]:
    data = fetch(WHO_URL, client=ctx.client, expect="json")
    out: list[tuple[str, str | None, dict]] = []
    for row in data.get("value") or []:
        title = " ".join((row.get("Title") or "").split())
        path = (row.get("ItemDefaultUrl") or "").strip()
        if title:
            out.append((title, f"{WHO_ITEM}{path}" if path.startswith("/") else None,
                        {"published": (row.get("PublicationDate") or "")[:10] or None}))
    return out


FEEDS = (("gdacs", _gdacs), ("usgs", _usgs), ("who", _who))


def fetch_source(ctx: Context) -> SourceResult:
    signals: list[Signal] = []
    notes: list[str] = []
    for feed, read in FEEDS:
        try:
            rows = read(ctx)
        except (SourceUnavailable, ET.ParseError) as exc:
            notes.append(f"{feed}: {exc}"[:160])
            continue
        for rank, (title, url, meta) in enumerate(rows[:TOP_N], start=1):
            signals.append(Signal(
                source="alerts", label=title, rank=rank, magnitude=None, magnitude_unit="rank",
                url=url, meta={"feed": feed, **meta},
            ))
    if len(notes) == len(FEEDS):
        raise SourceUnavailable("; ".join(notes)[:200])
    return SourceResult(interleave(signals), as_of=ctx.today.isoformat(), notes=notes)


SPEC = SourceSpec(
    id="alerts", name="Alert desk — GDACS disasters, USGS significant earthquakes, WHO outbreak news",
    url="https://www.gdacs.org/",
    licence="GDACS, USGS (public domain) and WHO terms; titles and links only",
    fetch=fetch_source, optional=True,
)
