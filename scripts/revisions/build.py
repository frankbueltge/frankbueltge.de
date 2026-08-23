#!/usr/bin/env python3
"""Revisions — a standing watch on records that rewrite their own past.

For each watched source it holds every released version at once and asks, per
consecutive pair, what happened to entries that were already there: which were
admitted to the past, which were removed from it, whose magnitude changed — and
whether the keeper published a reason.

The last column is the point. A keeper that documents *that* a year became a war
and never *why* is doing something a reader at the point of use cannot see, because
the number is republished without the revision.

Everything the instrument claims is derived here and committed: source archives by
SHA-256, coverage windows, the filing heading each change carries in the keeper's own
version history. Nothing is typed by hand. Stdlib only; no network at read time.

    python3 scripts/revisions/build.py            # use cache, fetch what is missing
    python3 scripts/revisions/build.py --refresh  # re-fetch every archive
"""

from __future__ import annotations

import csv
import hashlib
import io
import json
import os
import re
import sys
import urllib.request
import zipfile
import zlib
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONFIG = Path(__file__).resolve().parent / "sources.json"
CACHE = ROOT / ".cache" / "revisions"
OUT = ROOT / "src" / "data" / "revisions"
UA = "frankbueltge.de revisions watch (contact: f.bueltge@gmail.com)"

# The keeper's own filing headings. A change found under one of these is classified
# by the keeper; a change found under none is unexplained in its own record.
HEADINGS = [
    "Dyad-years added",
    "Dyads removed",
    "New dyads added",
    "Dyad-years removed",
    "Conflicts added",
    "Conflicts removed",
]


def log(msg: str) -> None:
    print(msg, file=sys.stderr)


def fetch(url: str, dest: Path, refresh: bool) -> dict:
    """Download once, keep it, and record what was held. Failures are recorded, never bridged."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if refresh or not dest.exists():
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=90) as r:
                dest.write_bytes(r.read())
            retrieved = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        except Exception as exc:  # noqa: BLE001 — the note is the point
            return {"url": url, "available": False, "note": f"retrieval failed: {exc}"}
    else:
        retrieved = datetime.fromtimestamp(dest.stat().st_mtime, timezone.utc).strftime("%Y-%m-%d")
    data = dest.read_bytes()
    return {
        "url": url,
        "available": True,
        "file": dest.name,
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest(),
        "retrieved": retrieved,
    }


def read_rows(path: Path, key_fields: list[str], magnitude: str, label: list[str]) -> dict:
    """One released version, as a map from key to record."""
    with zipfile.ZipFile(path) as z:
        name = next(n for n in z.namelist() if n.lower().endswith(".csv"))
        text = z.read(name).decode("utf-8-sig", "replace")
    rows: dict[tuple, dict] = {}
    for r in csv.DictReader(io.StringIO(text)):
        try:
            key = tuple(int(float(r[f])) for f in key_fields)
        except (KeyError, ValueError, TypeError):
            continue
        try:
            mag = int(float(r[magnitude]))
        except (KeyError, ValueError, TypeError):
            mag = None
        rows[key] = {
            "magnitude": mag,
            "label": " vs ".join(str(r.get(f, "")).strip('"') for f in label[:2]),
            "where": str(r.get(label[2], "")).strip('"') if len(label) > 2 else "",
        }
    return rows


def pdf_text(path: Path) -> str:
    """Flate-decoded text operators out of a PDF. Crude by design: stdlib only, and it
    only has to find whether a change is listed and under which heading."""
    data = path.read_bytes()
    out: list[bytes] = []
    for m in re.finditer(rb"stream\r?\n", data):
        start = m.end()
        end = data.find(b"endstream", start)
        if end < 0:
            continue
        try:
            chunk = zlib.decompress(data[start:end])
        except zlib.error:
            continue
        parts = re.findall(rb"\((?:\\.|[^()\\])*\)", chunk)
        if parts:
            out.append(b"".join(p[1:-1] for p in parts))
    return re.sub(r"\s+", " ", b"\n".join(out).decode("latin-1", "replace"))


def classify(history: str, key: tuple, to_tag: str) -> dict:
    """Under which of the keeper's own headings does this change appear, and is any
    rationale attached? Searched inside the section for the release that made it."""
    if not history:
        return {"filed_as": None, "rationale": None, "note": "version history unavailable"}
    ident = str(key[0])
    sec = history
    m = re.search(rf"Changes from Version [\d.]+ to {re.escape(to_tag)}(.*?)(?=Changes from Version|$)", history, re.S)
    if m:
        sec = m.group(1)
    found = None
    for h in HEADINGS:
        hm = re.search(re.escape(h) + r"(.*?)(?=" + "|".join(re.escape(x) for x in HEADINGS) + r"|Misc\. Changes|$)", sec, re.S)
        if hm and re.search(rf"\b{ident}\b", hm.group(1)):
            found = h
            break
    # a rationale would be prose; the ledger is columns. Look for any sentence near the id.
    rationale = None
    idx = sec.find(ident)
    if idx >= 0:
        window = sec[max(0, idx - 200): idx + 200]
        if re.search(r"\b(because|due to|reason|reclassif|recod|following|after review)\b", window, re.I):
            rationale = window.strip()
    return {"filed_as": found, "rationale": rationale}


def build(source: dict, refresh: bool) -> dict:
    sid = source["id"]
    log(f"— {sid}")
    versions, loaded, histories = [], {}, {}
    for v in source["versions"]:
        tag = v["tag"]
        meta = fetch(v["data"], CACHE / sid / f"data-{tag}.zip", refresh)
        hist = fetch(v["history"], CACHE / sid / f"history-{tag}.pdf", refresh)
        rec = {"tag": tag, "data": meta, "history": {k: hist[k] for k in ("available", "sha256", "bytes", "retrieved") if k in hist}}
        if meta.get("available"):
            rows = read_rows(CACHE / sid / f"data-{tag}.zip", source["key"], source["magnitude"], source["label"])
            loaded[tag] = rows
            years = [k[1] for k in rows]
            mags = [r["magnitude"] for r in rows.values() if r["magnitude"] is not None]
            rec["entries"] = len(rows)
            rec["covers"] = [min(years), max(years)] if years else None
            rec["magnitude_floor"] = min(mags) if mags else None
        else:
            rec["note"] = meta.get("note")
        if hist.get("available"):
            histories[tag] = pdf_text(CACHE / sid / f"history-{tag}.pdf")
        versions.append(rec)

    tags = [v["tag"] for v in versions if v["tag"] in loaded]
    pairs = []
    for a, b in zip(tags, tags[1:]):
        prev, cur = loaded[a], loaded[b]
        # only years the earlier version could have carried: a later release adds new
        # years at the front edge, which is not a revision of the past.
        window = max(k[1] for k in prev)
        keys_prev = {k for k in prev if k[1] <= window}
        keys_cur = {k for k in cur if k[1] <= window}
        hist = histories.get(b, "")

        def entry(k: tuple, src: dict) -> dict:
            r = src[k]
            # The two edges of one problem, kept apart. A change in the last year the
            # earlier version covered is reporting lag at the FRONT edge — the object of
            # the delay literature. A change in any earlier year is a revision of the
            # past at the BACK edge, which is what this instrument watches.
            edge = "front" if k[1] == window else "back"
            return {
                "key": list(k), "magnitude": r["magnitude"],
                "label": r["label"], "where": r["where"],
                "edge": edge, "years_late": window - k[1],
                **classify(hist, k, b),
            }

        admitted = [entry(k, cur) for k in sorted(keys_cur - keys_prev)]
        removed = [entry(k, prev) for k in sorted(keys_prev - keys_cur)]
        changed = [
            {"key": list(k), "from": prev[k]["magnitude"], "to": cur[k]["magnitude"], "label": prev[k]["label"]}
            for k in sorted(keys_prev & keys_cur)
            if prev[k]["magnitude"] is not None and cur[k]["magnitude"] is not None
            and prev[k]["magnitude"] != cur[k]["magnitude"]
        ]
        pairs.append({
            "from": a, "to": b, "window_to": window,
            "admitted": admitted, "removed": removed,
            "magnitude_revised": len(changed),
            "magnitude_revised_examples": changed[:8],
            "history_read": bool(hist),
        })

    floors = [v.get("magnitude_floor") for v in versions if v.get("magnitude_floor") is not None]
    all_adm = [a for p in pairs for a in p["admitted"]]
    back = [a for a in all_adm if a["edge"] == "back"]
    unexplained = [a for a in back if not a.get("rationale")]
    return {
        "source": {k: source[k] for k in ("id", "name", "keeper", "threshold", "licence_notice")},
        "generated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "versions": versions,
        "pairs": pairs,
        "findings": {
            "magnitude_floor_across_versions": min(floors) if floors else None,
            "floor_note": (
                "No entry below the published threshold exists in any version: an entry that "
                "failed the line is not recorded as having failed, it is absent."
            ),
            "admitted_total": len(all_adm),
            "admitted_back_edge": len(back),
            "admitted_front_edge": len(all_adm) - len(back),
            "edge_note": (
                "Front edge is an entry admitted for the last year the earlier version covered — "
                "reporting lag, the object of the delay literature. Back edge is an entry admitted "
                "to an earlier year: the past being rewritten, which is what this instrument watches."
            ),
            "deepest_back_edge_years": max((a["years_late"] for a in back), default=None),
            "removed_total": sum(len(p["removed"]) for p in pairs),
            "magnitude_revised_total": sum(p["magnitude_revised"] for p in pairs),
            "back_edge_with_published_rationale": len(back) - len(unexplained),
            "rationale_note": (
                "Filed-as records the keeper's own heading for a change. Rationale records whether "
                "any prose reason accompanies it. A ledger that lists the change and not the reason "
                "is the finding, not an accusation: many keepers publish no changelog at all."
            ),
        },
    }


def main() -> int:
    refresh = "--refresh" in sys.argv
    cfg = json.loads(CONFIG.read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    index = []
    for source in cfg["sources"]:
        result = build(source, refresh)
        path = OUT / f"{source['id']}.json"
        path.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n")
        f = result["findings"]
        log(
            f"  {path.relative_to(ROOT)}: {len(result['versions'])} versions · "
            f"{f['admitted_total']} admitted · {f['removed_total']} removed · "
            f"{f['admitted_back_edge']} of them back-edge (deepest {f['deepest_back_edge_years']}y) · "
            f"{f['magnitude_revised_total']} magnitudes revised · "
            f"{f['back_edge_with_published_rationale']} of {f['admitted_back_edge']} back-edge with a published reason"
        )
        index.append({
            "id": source["id"], "name": source["name"], "keeper": source["keeper"],
            "versions": len(result["versions"]), **{k: f[k] for k in
                ("admitted_total", "admitted_back_edge", "removed_total",
                 "magnitude_revised_total", "back_edge_with_published_rationale",
                 "deepest_back_edge_years", "magnitude_floor_across_versions")},
        })
    (OUT / "index.json").write_text(
        json.dumps({"generated": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "sources": index}, indent=2) + "\n"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
