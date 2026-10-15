"""Who read the ledger yesterday — counted, never identified.

Edge counts come from Cloudflare's GraphQL Analytics API for the zone (sampled, 24-hour
window, seven-day retention on the Free plan); human pageviews optionally from the
self-hosted Umami. Each half fails closed to `unavailable` with a note; a missing secret
is a declared standby, never a guessed number. No raw user-agent string is ever stored."""
from __future__ import annotations

import os
from datetime import date, datetime, timedelta, timezone
from typing import Any

import httpx

from trending.fetch import _redacted
from trending.model import CONTRACT_AUDIENCE
from trending.ua import CLASSES, classify, path_kind

GRAPHQL_URL = "https://api.cloudflare.com/client/v4/graphql"
QUERY = """query TrendingAudience($zone: string!, $start: Time!, $end: Time!) {
  viewer { zones(filter: { zoneTag: $zone }) {
    httpRequestsAdaptiveGroups(
      filter: { datetime_geq: $start, datetime_leq: $end, requestSource: "eyeball", clientRequestPath_like: "/trending%" }
      limit: 10000, orderBy: [count_DESC]
    ) { count avg { sampleInterval } dimensions { userAgent clientRequestPath edgeResponseStatus } }
  } }
}"""
EDGE_SOURCE = ("Cloudflare GraphQL Analytics API, httpRequestsAdaptiveGroups, zone scope, "
               "requestSource eyeball, clientRequestPath_like /trending%")
UMAMI_WEBSITE_ID = "cea1def9-863b-44e8-9f79-84837cf9cc42"
UMAMI_SOURCE = f"self-hosted Umami, website {UMAMI_WEBSITE_ID}, url prefix /trending"
PATH_KINDS = ("page", "archive", "json", "feed", "md", "other")
TIMEOUT = 60.0


def _window(day: date) -> tuple[str, str]:
    return f"{day.isoformat()}T00:00:00Z", f"{day.isoformat()}T23:59:59Z"


def _edge_unavailable(day: date, note: str) -> dict[str, Any]:
    start, end = _window(day)
    return {"status": "unavailable", "note": note[:200], "source": EDGE_SOURCE,
            "window": [start, end], "sample_interval_avg": None, "total": None,
            "paths": {}, "classes": {}, "bots": []}


def _umami_unavailable(note: str) -> dict[str, Any]:
    return {"status": "unavailable", "note": note[:200], "source": UMAMI_SOURCE,
            "pageviews": None, "visitors": None}


def _err(exc: Exception) -> str:
    return f"{type(exc).__name__}: {_redacted(str(exc))}"[:200]


def aggregate_edge(rows: list[dict[str, Any]], day: date) -> dict[str, Any]:
    """Rows → counts per path kind, per class, per bot. Raw user agents are consumed here
    and never leave this function."""
    paths = {k: 0 for k in PATH_KINDS}
    classes = {c: 0 for c in CLASSES}
    bots: dict[str, dict[str, Any]] = {}
    total = 0
    weighted = 0.0
    for row in rows:
        count = int(row.get("count") or 0)
        if count <= 0:
            continue
        dims = row.get("dimensions") or {}
        cls, name = classify(dims.get("userAgent"))
        status = int(dims.get("edgeResponseStatus") or 0)
        total += count
        weighted += count * float(((row.get("avg") or {}).get("sampleInterval")) or 1.0)
        paths[path_kind(dims.get("clientRequestPath"))] += count
        classes[cls] += count
        if name is not None:
            b = bots.setdefault(name, {"name": name, "class": cls, "requests": 0, "ok_2xx": 0,
                                      "other_status": 0})
            b["requests"] += count
            if 200 <= status < 300:
                b["ok_2xx"] += count
            else:
                b["other_status"] += count
    start, end = _window(day)
    return {"status": "ok", "note": "", "source": EDGE_SOURCE, "window": [start, end],
            "sample_interval_avg": (round(weighted / total, 3) if total else None),
            "total": total, "paths": paths, "classes": classes,
            "bots": sorted(bots.values(), key=lambda b: (-b["requests"], b["name"]))}


def edge_counts(client: httpx.Client, token: str | None, zone: str | None, day: date) -> dict[str, Any]:
    if not token or not zone:
        return _edge_unavailable(day, "no analytics token connected")
    start, end = _window(day)
    try:
        r = client.post(GRAPHQL_URL, json={"query": QUERY,
                                           "variables": {"zone": zone, "start": start, "end": end}},
                        headers={"Authorization": f"Bearer {token}"}, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
    except (httpx.HTTPError, ValueError) as exc:
        return _edge_unavailable(day, _err(exc))
    if data.get("errors"):
        msg = (data["errors"][0] or {}).get("message", "unknown error")
        return _edge_unavailable(day, f"GraphQL error: {msg}")
    zones = ((data.get("data") or {}).get("viewer") or {}).get("zones") or []
    if not zones:
        return _edge_unavailable(day, "zone not found for this token")
    rows = zones[0].get("httpRequestsAdaptiveGroups") or []
    return aggregate_edge(rows, day)


def _ms(dt: datetime) -> int:
    return int(dt.timestamp() * 1000)


def umami_counts(client: httpx.Client, base_url: str | None, username: str | None,
                 password: str | None, day: date) -> dict[str, Any]:
    if not base_url or not username or not password:
        return _umami_unavailable("no analytics account connected")
    base = base_url.rstrip("/")
    start = datetime(day.year, day.month, day.day, tzinfo=timezone.utc)
    end = start + timedelta(days=1) - timedelta(milliseconds=1)
    try:
        login = client.post(f"{base}/api/auth/login",
                            json={"username": username, "password": password}, timeout=TIMEOUT)
        login.raise_for_status()
        token = login.json().get("token")
        if not token:
            return _umami_unavailable("login returned no token")
        headers = {"Authorization": f"Bearer {token}"}
        params = {"startAt": _ms(start), "endAt": _ms(end)}
        metrics = client.get(f"{base}/api/websites/{UMAMI_WEBSITE_ID}/metrics",
                             params={**params, "type": "url"}, headers=headers, timeout=TIMEOUT)
        metrics.raise_for_status()
        pageviews = sum(int(row.get("y") or 0) for row in metrics.json()
                        if str(row.get("x", "")).startswith("/trending"))
        stats = client.get(f"{base}/api/websites/{UMAMI_WEBSITE_ID}/stats",
                           params={**params, "url": "/trending"}, headers=headers, timeout=TIMEOUT)
        stats.raise_for_status()
        raw = stats.json().get("visitors")
        visitors = int((raw.get("value") if isinstance(raw, dict) else raw) or 0)
    except (httpx.HTTPError, ValueError, AttributeError, TypeError) as exc:
        return _umami_unavailable(_err(exc))
    return {"status": "ok", "note": "", "source": UMAMI_SOURCE,
            "pageviews": pageviews, "visitors": visitors}


def build_audience(client: httpx.Client, day: date, env: dict[str, str] | None = None,
                   generated_at: str | None = None) -> dict[str, Any]:
    env = os.environ if env is None else env
    generated_at = generated_at or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return {
        "$contract": CONTRACT_AUDIENCE,
        "day": day.isoformat(),
        "generated_at": generated_at,
        "edge": edge_counts(client, env.get("CF_ANALYTICS_TOKEN"), env.get("CF_ZONE_ID"), day),
        "umami": umami_counts(client, env.get("UMAMI_API_URL"), env.get("UMAMI_USERNAME"),
                              env.get("UMAMI_PASSWORD"), day),
    }
