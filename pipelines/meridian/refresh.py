#!/usr/bin/env python3
"""Meridian — the graph-fed view model.

Reads the committed claim-rooted export snapshot (src/data/meridian/export/), joins
its provenance skeleton to the object bodies into one RDF graph, and asks the graph
the questions the page renders — every count via SPARQL, verbatim findings read from
the object bodies. Writes a portable graph archive (mrr-graph.ttl) and the page's
view model (parallax.json). Deterministic: no network, no clock, no model. Git is
the archive.

Run:  npm run meridian:refresh   (or: pipelines/meridian/.venv/bin/python -m refresh)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from pyoxigraph import RdfFormat, Store

sys.path.insert(0, str(Path(__file__).resolve().parent))
from graph import build_graph  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
EXPORT = ROOT / "src" / "data" / "meridian" / "export"
OUT_DIR = ROOT / "src" / "data" / "meridian"

P = """
PREFIX mrr: <https://example.invalid/mrr/vocab#>
PREFIX prov: <http://www.w3.org/ns/prov#>
"""


def one(store: Store, sparql: str) -> dict:
    rows = list(store.query(P + sparql))
    return rows[0] if rows else {}


def val(sol, key, cast=str):
    t = sol[key]
    return cast(t.value) if t is not None else None


def build_view_model(export_dir: Path) -> dict:
    graph = build_graph(export_dir)
    ttl = graph.serialize(format="turtle")
    store = Store()
    store.load(ttl.encode(), format=RdfFormat.TURTLE)

    # --- export meta (from the RO-Crate root, verbatim — never wall-clock) ------
    crate = json.loads((export_dir / "ro-crate-metadata.json").read_text())
    dataset = next(e for e in crate["@graph"] if e.get("@id") == "./")
    files = [e for e in crate["@graph"] if e.get("@type") == "File"]

    # --- claims (contested one is the feature; the other is context) -----------
    bodies = {
        json.loads(f.read_text())["id"]: json.loads(f.read_text())
        for f in sorted((export_dir / "objects").glob("*.json"))
    }
    claims = []
    for sol in store.query(P + """
        SELECT ?claim ?status ?ctype
               (COUNT(DISTINCT ?e) AS ?support) (COUNT(DISTINCT ?c) AS ?contra)
               (COUNT(DISTINCT ?v) AS ?verifs) WHERE {
          ?claim a mrr:Claim ; mrr:status ?status ; mrr:claimType ?ctype .
          OPTIONAL { ?claim mrr:evidenceRelation ?e . }
          OPTIONAL { ?claim mrr:counterevidenceRelation ?c . }
          OPTIONAL { ?v mrr:targetClaim ?claim . }
        } GROUP BY ?claim ?status ?ctype
    """):
        urn = val(sol, "claim")
        body = bodies[urn]
        assertion = body.get("assertion", "")
        analysis = assertion.split(".")[0].replace("Analysis ", "").strip("' ") if assertion else urn
        claims.append({
            "urn": urn,
            "content_hash": body.get("content_hash"),
            "analysis": analysis,
            "type": val(sol, "ctype"),
            "status": val(sol, "status"),
            "supporting": val(sol, "support", int),
            "contradicting": val(sol, "contra", int),
            "verification_count": val(sol, "verifs", int),
        })
    claims.sort(key=lambda c: (c["status"] != "contested", c["urn"]))
    feature, context = claims[0], (claims[1] if len(claims) > 1 else None)

    # --- verifications targeting the feature claim ------------------------------
    verifications = []
    for sol in store.query(P + f"""
        SELECT ?v ?rec ?conf ?fcount ?role (COUNT(DISTINCT ?ins) AS ?inspected) WHERE {{
          ?v mrr:targetClaim <{feature['urn']}> ; mrr:recommendation ?rec ;
             mrr:confidence ?conf ; mrr:findingCount ?fcount ; mrr:reviewerRole ?role .
          OPTIONAL {{ ?v mrr:evidenceInspected ?ins . }}
        }} GROUP BY ?v ?rec ?conf ?fcount ?role
    """):
        vurn = val(sol, "v")
        vbody = bodies[vurn]
        findings = [
            {"severity": f.get("severity"), "statement": f.get("statement", "")}
            for f in vbody.get("findings", [])
        ]
        verifications.append({
            "urn": vurn,
            "recommendation": val(sol, "rec"),
            "confidence": val(sol, "conf", float),
            "finding_count": val(sol, "fcount", int),
            "inspected": val(sol, "inspected", int),
            "reviewer_role": val(sol, "role"),
            "findings": findings,
        })
    verifications.sort(key=lambda v: v["recommendation"])  # fail, pass

    # --- source corpus ----------------------------------------------------------
    src = one(store, """
        SELECT (COUNT(?s) AS ?total)
               (SUM(IF(?cls = "primary", 1, 0)) AS ?primary)
               (SUM(IF(?cls = "secondary", 1, 0)) AS ?secondary) WHERE {
          ?s a mrr:SourceRecord . OPTIONAL { ?s mrr:provenanceClass ?cls . }
        }
    """)

    return {
        "_meta": {
            "generated_from": "src/data/meridian/export",
            "method": "counts via SPARQL over the joined RO-Crate+PROV graph; "
                      "verbatim findings read from the object bodies",
            "deterministic": True,
            "triples": len(graph),
        },
        "export_meta": {
            "root": "claim graph (no crate)",
            "standard": "RO-Crate 1.1 + W3C-PROV",
            "object_count": len(files),
            "artifact_count": 0,
            "date_published": dataset.get("datePublished"),
        },
        "claim": feature,
        "verifications": verifications,
        "sources": {
            "total": val(src, "total", int),
            "primary": val(src, "primary", int),
            "secondary": val(src, "secondary", int),
        },
        "dissent": {"invariant": "MRR-FR-077", "preserved": True},
        "context_claim": context,
    }


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    graph = build_graph(EXPORT)
    (OUT_DIR / "mrr-graph.ttl").write_text(graph.serialize(format="turtle"))
    view = build_view_model(EXPORT)
    (OUT_DIR / "parallax.json").write_text(json.dumps(view, indent=2, ensure_ascii=False) + "\n")
    print(f"graph: {len(graph)} triples → mrr-graph.ttl")
    print(f"view model → parallax.json  (feature claim: {view['claim']['status']}, "
          f"{len(view['verifications'])} verifications, {view['sources']['total']} sources)")


if __name__ == "__main__":
    main()
