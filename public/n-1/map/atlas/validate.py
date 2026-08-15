#!/usr/bin/env python3
"""Atlas structure validator.

Checks form, never worth: id uniqueness, edge resolution, evidence presence,
estimate marking, manifest completeness. The five criteria of the foundation are
topoi for deliberation in the record — deliberately not implemented here.
"""
import json
import re
import sys
from pathlib import Path

LAYERS = Path(__file__).resolve().parent / "layers"
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}(-[a-z0-9]+)?$")

errors = []


def err(msg: str) -> None:
    errors.append(msg)


def main() -> int:
    manifest_path = LAYERS / "index.json"
    if not manifest_path.exists():
        print("FAIL: layers/index.json missing", file=sys.stderr)
        return 1
    manifest = json.loads(manifest_path.read_text())
    on_disk = sorted(p.name for p in LAYERS.glob("*.json") if p.name != "index.json")
    if sorted(manifest) != on_disk:
        err(f"manifest mismatch: index.json lists {manifest}, disk has {on_disk}")

    node_ids: dict[str, str] = {}  # id -> layer that declared it
    edge_count = 0

    for name in manifest:
        layer_path = LAYERS / name
        if not layer_path.exists():
            err(f"{name}: listed in manifest but missing on disk")
            continue
        layer = json.loads(layer_path.read_text())
        stem = name.removesuffix(".json")
        if not DATE_RE.match(stem):
            err(f"{name}: filename is not YYYY-MM-DD[-suffix].json")
        if layer.get("layer") != stem:
            err(f"{name}: 'layer' field {layer.get('layer')!r} != filename date {stem!r}")

        for node in layer.get("nodes", []):
            nid = node.get("id")
            if not nid or not isinstance(nid, str):
                err(f"{name}: node without string id: {node}")
                continue
            if nid in node_ids:
                err(f"{name}: node id {nid!r} already declared in {node_ids[nid]}")
            node_ids[nid] = name
            if not node.get("type"):
                err(f"{name}: node {nid!r} has no type")
            if not node.get("label"):
                err(f"{name}: node {nid!r} has no label")
            check_intensity(name, f"node {nid!r}", node)

        for edge in layer.get("edges", []):
            edge_count += 1
            frm, to = edge.get("from"), edge.get("to")
            rel = edge.get("relation")
            if not rel:
                err(f"{name}: edge {frm!r}->{to!r} has no relation")
            for end, label in ((frm, "from"), (to, "to")):
                if end not in node_ids:
                    err(f"{name}: edge {label}={end!r} does not resolve to a declared node")
            evidence = edge.get("evidence") or []
            if not evidence:
                err(f"{name}: edge {frm!r}-[{rel}]->{to!r} carries no evidence "
                    "(an edge without evidence is decoration and gets struck)")
            for ev in evidence:
                if not ev.get("kind") or not ev.get("ref"):
                    err(f"{name}: edge {frm!r}->{to!r}: evidence needs kind and ref: {ev}")
            check_intensity(name, f"edge {frm!r}->{to!r}", edge)

    if errors:
        print(f"FAIL: {len(errors)} problem(s)", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1
    print(f"OK: {len(manifest)} layer(s), {len(node_ids)} node(s), {edge_count} edge(s); "
          "every edge carries evidence, every intensity is a marked estimate.")
    return 0


def check_intensity(layer_name: str, what: str, obj: dict) -> None:
    intensity = obj.get("intensity")
    if intensity is not None and intensity.get("estimate") is not True:
        err(f"{layer_name}: {what}: intensity without 'estimate': true "
            "(there are no unmarked intensities)")


if __name__ == "__main__":
    sys.exit(main())
