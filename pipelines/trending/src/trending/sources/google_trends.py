"""Google Trends — the daily search-trends RSS per country. Ten items per geo, each with an
approximate search count and up to three news items Google attaches."""
from __future__ import annotations

import re
import time
import xml.etree.ElementTree as ET
from urllib.parse import quote_plus

from trending.fetch import SourceUnavailable, fetch
from trending.model import Link, Signal
from trending.sources.base import Context, SourceResult, SourceSpec

GEOS = ("US", "GB", "CA", "AU", "IN", "DE")
NS = {"ht": "https://trends.google.com/trending/rss"}
THROTTLE_S = 0.25


def _traffic(raw: str | None) -> int | None:
    if not raw:
        return None
    digits = re.sub(r"[^0-9]", "", raw)
    return int(digits) if digits else None


def fetch_source(ctx: Context) -> SourceResult:
    signals: list[Signal] = []
    notes: list[str] = []
    for geo in GEOS:
        url = f"https://trends.google.com/trending/rss?geo={geo}"
        try:
            text = fetch(url, client=ctx.client)
            root = ET.fromstring(text)
        except SourceUnavailable as exc:
            notes.append(f"{geo}: {exc}"[:120])
            continue
        except ET.ParseError:
            notes.append(f"{geo}: XML parse error")
            continue
        for rank, item in enumerate(root.iter("item"), 1):
            title = (item.findtext("title") or "").strip()
            if not title:
                continue
            links: list[Link] = []
            for news in item.findall("ht:news_item", NS)[:3]:
                t = (news.findtext("ht:news_item_title", namespaces=NS) or "").strip()
                u = (news.findtext("ht:news_item_url", namespaces=NS) or "").strip()
                p = (news.findtext("ht:news_item_source", namespaces=NS) or "").strip()
                if t and u:
                    links.append(Link(title=t, url=u, publisher=p or None))
            signals.append(Signal(
                source="google_trends", label=title, rank=rank,
                magnitude=_traffic(item.findtext("ht:approx_traffic", namespaces=NS)),
                magnitude_unit="approx_searches",
                url=f"https://trends.google.com/trends/explore?q={quote_plus(title)}&geo={geo}",
                geo=geo, links=tuple(links),
                meta={"geo": geo, "pub_date": (item.findtext("pubDate") or "").strip() or None},
            ))
        time.sleep(THROTTLE_S)
    return SourceResult(signals, as_of=ctx.today.isoformat(), notes=notes)


SPEC = SourceSpec(
    id="google_trends", name="Google Trends — Daily Search Trends (RSS)",
    url="https://trends.google.com/trending/rss",
    licence="Google Terms of Service; titles, approximate counts and news links only",
    fetch=fetch_source,
)
