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

from trending.fetch import USER_AGENT, _redacted
from trending.model import CONTRACT_AUDIENCE, to_json
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
# One dimension per query on purpose: a plan that refuses one of them should not cost the
# other, and a combined query would fail whole rather than in part.
DIMENSION_QUERY = """query TrendingDimension($zone: string!, $start: Time!, $end: Time!) {
  viewer { zones(filter: { zoneTag: $zone }) {
    httpRequestsAdaptiveGroups(
      filter: { datetime_geq: $start, datetime_leq: $end, requestSource: "eyeball", clientRequestPath_like: "/trending%" }
      limit: 200, orderBy: [count_DESC]
    ) { count dimensions { __DIM__ } }
  } }
}"""
EDGE_SOURCE = ("Cloudflare GraphQL Analytics API, httpRequestsAdaptiveGroups, zone scope, "
               "requestSource eyeball, clientRequestPath_like /trending%")
# The two dimensions the retired browser beacon would have contributed. Whether the Free plan
# serves them is not assumed: the run asks, and records a refusal in `extra_note`.
EXTRA_DIMENSIONS = (("countries", "clientCountryName"), ("referers", "clientRefererHost"))
EXTRA_TOP = 10
PATH_KINDS = ("page", "archive", "json", "feed", "md", "other")
TIMEOUT = 60.0


def _window(day: date) -> tuple[str, str]:
    return f"{day.isoformat()}T00:00:00Z", f"{day.isoformat()}T23:59:59Z"


def _edge_unavailable(day: date, note: str) -> dict[str, Any]:
    start, end = _window(day)
    return {"status": "unavailable", "note": note[:200], "source": EDGE_SOURCE,
            "window": [start, end], "sample_interval_avg": None, "total": None,
            "paths": {}, "classes": {}, "bots": [],
            "countries": None, "referers": None, "extra_note": ""}


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



def _dimension_counts(client: httpx.Client, token: str, zone: str, day: date,
                      dimension: str) -> tuple[dict[str, int] | None, str]:
    """The top values of one dimension, or None and the reason. Aggregate counts only: a
    country and a referring host are places, never people."""
    start, end = _window(day)
    query = DIMENSION_QUERY.replace("__DIM__", dimension)
    try:
        r = client.post(GRAPHQL_URL, json={"query": query,
                                           "variables": {"zone": zone, "start": start, "end": end}},
                        headers={"Authorization": f"Bearer {token}"}, timeout=TIMEOUT)
        r.raise_for_status()
        data = r.json()
    except (httpx.HTTPError, ValueError) as exc:
        return None, f"{dimension}: {_err(exc)}"
    if data.get("errors"):
        return None, f"{dimension}: {(data['errors'][0] or {}).get('message', 'unknown error')}"[:200]
    zones = ((data.get("data") or {}).get("viewer") or {}).get("zones") or []
    if not zones:
        return None, f"{dimension}: zone not found for this token"
    counts: dict[str, int] = {}
    for row in zones[0].get("httpRequestsAdaptiveGroups") or []:
        value = str((row.get("dimensions") or {}).get(dimension) or "").strip()
        if not value:
            continue
        counts[value] = counts.get(value, 0) + int(row.get("count") or 0)
    top = dict(sorted(counts.items(), key=lambda kv: (-kv[1], kv[0]))[:EXTRA_TOP])
    return top, ""


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
    edge = aggregate_edge(rows, day)
    notes: list[str] = []
    for key, dimension in EXTRA_DIMENSIONS:
        values, why = _dimension_counts(client, token, zone, day, dimension)
        edge[key] = values
        if why:
            notes.append(why)
    edge["extra_note"] = "; ".join(notes)[:200]
    return edge


def build_audience(client: httpx.Client, day: date, env: dict[str, str] | None = None,
                   generated_at: str | None = None) -> dict[str, Any]:
    env = os.environ if env is None else env
    generated_at = generated_at or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    return {
        "$contract": CONTRACT_AUDIENCE,
        "day": day.isoformat(),
        "generated_at": generated_at,
        "edge": edge_counts(client, env.get("CF_ANALYTICS_TOKEN"), env.get("CF_ZONE_ID"), day),
    }


# ------------------------------------------------------------------------------------- the probe

def main(argv: list[str] | None = None) -> int:
    """Read the edge audience of one past day and print it. Writes nothing.

    This exists because a question about the record should be answerable without occupying a
    slot in it: which dimensions the plan actually serves, whether the token still reaches the
    zone, what a day looked like. The nightly writes; the probe only looks.
    """
    import argparse
    import sys

    p = argparse.ArgumentParser(prog="trending.audience",
                                description="Print the edge audience of a past day; write nothing.")
    p.add_argument("--day", required=True, help="YYYY-MM-DD, a day that has ended")
    args = p.parse_args(argv)
    try:
        day = datetime.strptime(args.day, "%Y-%m-%d").date()
    except ValueError:
        p.error("--day must be YYYY-MM-DD")
    if day >= datetime.now(timezone.utc).date():
        print("audience probe: that day has not ended; the count would be partial", file=sys.stderr)
        return 2
    with httpx.Client(headers={"User-Agent": USER_AGENT}) as client:
        record = build_audience(client, day)
    print(to_json(record), end="")
    e = record["edge"]
    print(f"audience probe {day}: {e['status']} · total {e.get('total')} · "
          f"countries {'yes' if e.get('countries') else 'no'} · "
          f"referers {'yes' if e.get('referers') else 'no'}"
          + (f" · note: {e['extra_note']}" if e.get("extra_note") else ""), file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
