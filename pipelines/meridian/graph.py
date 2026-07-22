#!/usr/bin/env python3
"""Merge a Meridian claim-rooted RO-Crate/PROV export into one RDF graph.

The RO-Crate JSON-LD is a provenance *skeleton* (kinds, content hashes, prov:used).
The research *substance* — recommendation pass/fail, evidence-vs-counterevidence,
reviewer role, confidence — lives in the objects/*.json bodies. A queryable graph
needs BOTH layers joined; this builds that join as an rdflib Graph (serialisable to
a portable Turtle file, loadable by Oxigraph / rdflib / Jena / anything).

This is deterministic and reads only the committed export snapshot — no network,
no clock, no model. Git is the archive.
"""
from __future__ import annotations

import json
from pathlib import Path

from rdflib import Graph, Literal, Namespace, URIRef
from rdflib.namespace import RDF, XSD

MRR = Namespace("https://example.invalid/mrr/vocab#")
PROV = Namespace("http://www.w3.org/ns/prov#")

KIND_CLASS = {
    "Claim": MRR.Claim,
    "EvidenceAnchor": MRR.EvidenceAnchor,
    "SourceRecord": MRR.SourceRecord,
    "VerificationResult": MRR.VerificationResult,
    "MethodRuling": MRR.MethodRuling,
    "MethodProtocol": MRR.MethodProtocol,
}


def _iri(urn: str) -> URIRef:
    return URIRef(urn)


def _add_common(g: Graph, node: URIRef, body: dict) -> None:
    if body.get("kind"):
        g.add((node, MRR.kind, Literal(body["kind"])))
    if body.get("practice_id"):
        g.add((node, MRR.practiceId, _iri(body["practice_id"])))
    if body.get("content_hash"):
        g.add((node, MRR.contentHash, Literal(body["content_hash"])))
    if body.get("created_at"):
        g.add((node, MRR.createdAt, Literal(body["created_at"], datatype=XSD.dateTime)))
    if body.get("revision") is not None:
        g.add((node, MRR.revision, Literal(int(body["revision"]))))


def build_graph(export_dir: Path) -> Graph:
    """Return the joined RDF graph for one claim-rooted export directory."""
    g = Graph()
    g.bind("mrr", MRR)
    g.bind("prov", PROV)

    # --- Layer 1: object bodies (the research substance) -----------------------
    for f in sorted((export_dir / "objects").glob("*.json")):
        body = json.loads(f.read_text())
        node = _iri(body["id"])
        kind = body.get("kind")
        if kind in KIND_CLASS:
            g.add((node, RDF.type, KIND_CLASS[kind]))
        _add_common(g, node, body)

        if kind == "Claim":
            g.add((node, MRR.status, Literal(body["status"])))
            g.add((node, MRR.claimType, Literal(body["claim_type"])))
            g.add((node, MRR.assertionLength, Literal(len(body.get("assertion", "")))))
            for a in body.get("evidence_relations", []):
                g.add((node, MRR.evidenceRelation, _iri(a)))
            for a in body.get("counterevidence_relations", []):
                g.add((node, MRR.counterevidenceRelation, _iri(a)))
            for v in body.get("verification_ids", []):
                g.add((node, MRR.declaredVerification, _iri(v)))

        elif kind == "EvidenceAnchor":
            if body.get("relation"):
                g.add((node, MRR.relation, Literal(body["relation"])))
            if body.get("anchor_kind"):
                g.add((node, MRR.anchorKind, Literal(body["anchor_kind"])))
            if body.get("anchor_validation_status"):
                g.add((node, MRR.anchorValidationStatus, Literal(body["anchor_validation_status"])))
            if body.get("source_record_id"):
                g.add((node, MRR.sourceRecord, _iri(body["source_record_id"])))

        elif kind == "SourceRecord":
            if body.get("title"):
                g.add((node, MRR.title, Literal(body["title"])))
            if body.get("source_type"):
                g.add((node, MRR.sourceType, Literal(body["source_type"])))
            if body.get("primary_secondary_derived"):
                g.add((node, MRR.provenanceClass, Literal(body["primary_secondary_derived"])))
            if body.get("publication_date"):
                g.add((node, MRR.publicationDate, Literal(str(body["publication_date"]))))

        elif kind == "VerificationResult":
            g.add((node, MRR.recommendation, Literal(body["recommendation"])))
            g.add((node, MRR.targetClaim, _iri(body["target_id"])))
            if body.get("reviewer_role"):
                g.add((node, MRR.reviewerRole, Literal(body["reviewer_role"])))
            if body.get("confidence") is not None:
                g.add((node, MRR.confidence, Literal(float(body["confidence"]), datatype=XSD.decimal)))
            g.add((node, MRR.findingCount, Literal(len(body.get("findings", [])))))
            for a in body.get("evidence_inspected", []):
                g.add((node, MRR.evidenceInspected, _iri(a)))

    # --- Layer 2: RO-Crate/PROV skeleton (prov:used + prov: typing) ------------
    crate = json.loads((export_dir / "ro-crate-metadata.json").read_text())
    for e in crate["@graph"]:
        eid = e.get("@id", "")
        if not eid.startswith("urn:"):
            continue
        node = _iri(eid)
        types = e.get("@type")
        for t in types if isinstance(types, list) else [types]:
            if t == "prov:Activity":
                g.add((node, RDF.type, PROV.Activity))
            elif t == "prov:Entity":
                g.add((node, RDF.type, PROV.Entity))
            elif t == "prov:Agent":
                g.add((node, RDF.type, PROV.Agent))
        used = e.get("prov:used")
        if used:
            for u in used if isinstance(used, list) else [used]:
                uid = u.get("@id") if isinstance(u, dict) else u
                if uid and uid.startswith("urn:"):
                    g.add((node, PROV.used, _iri(uid)))

    return g
