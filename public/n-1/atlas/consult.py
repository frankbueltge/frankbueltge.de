#!/usr/bin/env python3
"""Consult the atlas as a graph — the T1 discipline, made re-derivable.

The protocol's first instrument (`reading/00-protocol.md`) requires that before a
session's main working decision the atlas is consulted as a graph ("what connects
to X?") and the consultation recorded in that night's record. Until this script,
every consultation was a session's own testimony: a reader could check the layers
by hand but could not re-run what the session actually asked. This script is the
consultation itself, so that the query and its answer are evidence rather than
report. It reads only the committed layers; it decides nothing.

Usage:
    python3 atlas/consult.py inventory
    python3 atlas/consult.py connects <node-id> [<node-id> ...]
    python3 atlas/consult.py untouched [--since LAYER]
    python3 atlas/consult.py types

  inventory   node and edge totals, and counts per node type
  connects    every edge touching each named node, oldest layer first
  untouched   nodes whose last edge was laid no later than their declaring layer,
              i.e. nodes nothing has connected since they were declared; with
              --since, only those declared before that layer stem
  types       node ids grouped by type, with degree and last-touched layer

Written 2026-08-21 (night 08, record 25), the session whose main decision came
out of a query of this kind. Adding it changes no schema and no rule: the atlas's
form, the evidence principle and the T1 failure criterion are untouched.
"""
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

ATLAS = Path(__file__).resolve().parent
LAYERS = ATLAS / "layers"


def load():
    index = json.loads((LAYERS / "index.json").read_text())
    nodes = {}
    edges = []
    for stem in index:
        data = json.loads((LAYERS / stem).read_text())
        layer = data.get("layer", stem[:-5])
        for node in data.get("nodes", []):
            nodes[node["id"]] = {
                "declared": layer,
                "type": node.get("type", ""),
                "label": node.get("label", ""),
            }
        for edge in data.get("edges", []):
            edges.append({
                "layer": layer,
                "from": edge["from"],
                "relation": edge["relation"],
                "to": edge["to"],
                "evidence": edge.get("evidence", []),
            })
    return index, nodes, edges


def degrees(edges):
    deg = Counter()
    last = defaultdict(str)
    for e in edges:
        for end in (e["from"], e["to"]):
            deg[end] += 1
            last[end] = max(last[end], e["layer"])
    return deg, last


def cmd_inventory(index, nodes, edges):
    print(f"layers {len(index)}  nodes {len(nodes)}  edges {len(edges)}")
    for kind, count in sorted(Counter(n["type"] for n in nodes.values()).items()):
        print(f"  {kind:12s} {count}")


def cmd_connects(nodes, edges, ids):
    for nid in ids:
        meta = nodes.get(nid)
        if meta is None:
            print(f"{nid}: not declared on any layer")
            continue
        touching = [e for e in edges if nid in (e["from"], e["to"])]
        print(f"\n{nid}  [{meta['type']}, declared {meta['declared']}, {len(touching)} edges]")
        print(f"  {meta['label']}")
        for e in sorted(touching, key=lambda e: e["layer"]):
            arrow = "->" if e["from"] == nid else "<-"
            other = e["to"] if e["from"] == nid else e["from"]
            ev = "; ".join(f"{v.get('kind')}:{v.get('ref')}" for v in e["evidence"]) or "NONE"
            print(f"  {e['layer']:16s} {arrow} {e['relation']:22s} {other}")
            print(f"  {'':16s}    evidence {ev}")


def cmd_untouched(nodes, edges, since=None):
    deg, last = degrees(edges)
    rows = []
    for nid, meta in nodes.items():
        if last[nid] <= meta["declared"] and (since is None or meta["declared"] < since):
            rows.append((meta["declared"], nid, meta["type"], deg[nid]))
    for declared, nid, kind, d in sorted(rows):
        print(f"  {declared:16s} {nid:52s} {kind:11s} degree {d}")
    print(f"{len(rows)} nodes with no edge laid after their declaring layer")


def cmd_types(nodes, edges):
    deg, last = degrees(edges)
    for kind in sorted({n["type"] for n in nodes.values()}):
        print(f"\n[{kind}]")
        for nid, meta in nodes.items():
            if meta["type"] == kind:
                print(f"  {nid:52s} declared {meta['declared']:16s} last {last[nid] or '-':16s} degree {deg[nid]}")


def main(argv):
    index, nodes, edges = load()
    cmd = argv[1] if len(argv) > 1 else "inventory"
    if cmd == "inventory":
        cmd_inventory(index, nodes, edges)
    elif cmd == "connects":
        if len(argv) < 3:
            print("connects needs at least one node id", file=sys.stderr)
            return 2
        cmd_connects(nodes, edges, argv[2:])
    elif cmd == "untouched":
        since = None
        if "--since" in argv:
            since = argv[argv.index("--since") + 1]
        cmd_untouched(nodes, edges, since)
    elif cmd == "types":
        cmd_types(nodes, edges)
    else:
        print(__doc__)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
