"""Ereignisregister-Quelle: Wikidata-SPARQL. Die veröffentlichte Regel ist die Kuration:
aufgenommen wird jedes Ereignis mit Opferzahl (P1120) >= DEATHS_MIN seit REGISTER_START."""
from __future__ import annotations

import urllib.parse
from typing import Any

import httpx

from protokoll.fetch import fetch
from protokoll.halbwertszeit import DEATHS_MIN, LANGS, REGISTER_START

ENDPOINT = "https://query.wikidata.org/sparql"

QUERY_TEMPLATE = """
SELECT ?event ?labelDe ?labelEn ?date ?deaths ?article ?site WHERE {{
  ?event wdt:P1120 ?deaths .
  ?event wdt:P585 ?date .
  FILTER(?deaths >= {deaths_min})
  FILTER(?date >= "{since}T00:00:00Z"^^xsd:dateTime)
  FILTER(?date < NOW())
  ?article schema:about ?event ; schema:isPartOf ?site .
  OPTIONAL {{ ?event rdfs:label ?labelDe . FILTER(LANG(?labelDe) = "de") }}
  OPTIONAL {{ ?event rdfs:label ?labelEn . FILTER(LANG(?labelEn) = "en") }}
}}
"""


def sparql_url() -> str:
    q = QUERY_TEMPLATE.format(deaths_min=DEATHS_MIN, since=REGISTER_START)
    return ENDPOINT + "?" + urllib.parse.urlencode({"query": q, "format": "json"})


def parse_events(data: dict[str, Any]) -> dict[str, dict[str, Any]]:
    """Bindings -> Ereignisse: Dedup per QID (Opferzahl: Maximum), Titel je Sprache,
    Labels de/en (Fallback aufeinander). Nur Ereignisse mit en-Wikipedia-Artikel."""
    events: dict[str, dict[str, Any]] = {}
    for b in data["results"]["bindings"]:
        site = b["site"]["value"]
        if not site.endswith("wikipedia.org/"):
            continue
        lang = site.split("//")[1].split(".")[0]
        if lang not in LANGS:
            continue
        qid = b["event"]["value"].rsplit("/", 1)[-1]
        e = events.setdefault(qid, {
            "qid": qid, "label_de": None, "label_en": None,
            "date": b["date"]["value"][:10], "deaths": 0, "titles": {},
        })
        e["deaths"] = max(e["deaths"], int(float(b["deaths"]["value"])))
        e["date"] = min(e["date"], b["date"]["value"][:10])
        if b.get("labelDe"):
            e["label_de"] = b["labelDe"]["value"]
        if b.get("labelEn"):
            e["label_en"] = b["labelEn"]["value"]
        e["titles"][lang] = urllib.parse.unquote(b["article"]["value"].split("/wiki/")[-1])
    out = {}
    for qid, e in events.items():
        if "en" not in e["titles"]:
            continue
        e["label_en"] = e["label_en"] or e["titles"]["en"].replace("_", " ")
        e["label_de"] = e["label_de"] or e["label_en"]
        out[qid] = e
    return out


def fetch_events(client: httpx.Client) -> dict[str, dict[str, Any]]:
    return parse_events(fetch(sparql_url(), client=client, expect="json"))
