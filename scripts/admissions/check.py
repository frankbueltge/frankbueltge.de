#!/usr/bin/env python3
"""Revisions — the watch itself.

`build.py` compares the versions it is told about. This asks the prior question: has a
keeper published a version nobody told us about yet? Without it the instrument is a
finding with a date on it; with it, it notices when a record next rewrites its past.

Discovery is per source, because keepers publish differently:

  url_pattern  the archive URL carries the version, so the next tags can be probed
               (UCDP: …-dyadic-251-csv.zip → try 261, 271). A 404 means not yet.
  dataverse    the repository keeps the versions and will list them.

A newly published version is a fact about the world, not a change of method: appending
it to `sources.json` and rebuilding leaves the comparison rule untouched and the new
finding visible in the diff. Method changes stay manual.

    python3 scripts/admissions/check.py          # report only
    python3 scripts/admissions/check.py --apply  # append what was found, then rebuild

Exit 0 when nothing new, 10 when a new release was found. Network failures are reported
and exit 1 — an unreachable keeper is not the same as a keeper that published nothing.
"""

from __future__ import annotations

import json
import re
import subprocess
import sys
import urllib.request
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
CONFIG = HERE / "sources.json"
UA = "frankbueltge.de admissions watch (contact: f.bueltge@gmail.com)"


def log(msg: str) -> None:
    print(msg, file=sys.stderr)


def head_ok(url: str) -> bool | None:
    """True if the URL serves something, False if it does not, None if we could not tell."""
    req = urllib.request.Request(url, headers={"User-Agent": UA}, method="GET")
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            # Some keepers answer 200 with an error page; a real archive is not tiny.
            return r.status == 200 and len(r.read(4096)) >= 1024
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return False
        log(f"    ! {exc.code} on {url}")
        return None
    except Exception as exc:  # noqa: BLE001
        log(f"    ! unreachable: {exc}")
        return None


def discover_url_pattern(source: dict) -> list[dict]:
    """UCDP-style: the tag is in the URL and the year increments. Probe the next two."""
    known = {v["tag"] for v in source["versions"]}
    newest = source["versions"][-1]
    m = re.match(r"(\d+)\.(\d+)$", newest["tag"])
    if not m:
        log(f"    ! cannot read a year out of tag {newest['tag']}")
        return []
    year, minor = int(m.group(1)), int(m.group(2))
    found = []
    for step in (1, 2):
        tag = f"{year + step}.{minor}"
        if tag in known:
            continue
        slug = tag.replace(".", "")
        data = re.sub(r"\d{3}(?=-csv\.zip$)", slug, newest["data"])
        hist = re.sub(r"\d{3}(?=\.pdf$)", slug, newest["history"] or "")
        ok = head_ok(data)
        if ok is None:
            return []
        if ok:
            log(f"    + {tag} is published")
            found.append({"tag": tag, "data": data, "suffix": "zip", "history": hist or None})
    return found


def discover_dataverse(source: dict) -> list[dict]:
    """Dataverse keeps the versions; ask it, and match by release date."""
    doi = source["discover"]["doi"]
    url = f"https://dataverse.uclouvain.be/api/datasets/:persistentId/versions?persistentId={doi}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=45) as r:
            payload = json.load(r)
    except Exception as exc:  # noqa: BLE001
        log(f"    ! unreachable: {exc}")
        return []
    if payload.get("status") != "OK":
        log(f"    ! repository answered {payload.get('status')}")
        return []
    known_files = {re.search(r"/(\d+)(?:\?|$)", v["data"]).group(1) for v in source["versions"] if re.search(r"/(\d+)(?:\?|$)", v["data"])}
    marker = source["discover"].get("file_contains", "archive")
    found = []
    for v in payload["data"]:
        released = (v.get("releaseTime") or "")[:7]
        for f in v.get("files", []):
            df = f["dataFile"]
            if marker not in df["filename"].lower():
                continue
            fid = str(df["id"])
            if fid in known_files:
                continue
            known_files.add(fid)
            tabular = bool(df.get("tabularData"))
            suffix = "tab" if tabular else Path(df["filename"]).suffix.lstrip(".") or "bin"
            data = f"https://dataverse.uclouvain.be/api/access/datafile/{fid}"
            if tabular:
                data += "?format=tab"
            log(f"    + {released} carries a data file we do not hold ({df['filename']})")
            found.append({"tag": released, "data": data, "suffix": suffix, "history": None})
    return found


DISCOVERERS = {"url_pattern": discover_url_pattern, "dataverse": discover_dataverse}


def main() -> int:
    apply = "--apply" in sys.argv
    cfg = json.loads(CONFIG.read_text())
    additions: dict[str, list[dict]] = {}
    for source in cfg["sources"]:
        kind = (source.get("discover") or {}).get("kind")
        log(f"— {source['id']} ({kind or 'no discovery configured'})")
        if not kind:
            continue
        fn = DISCOVERERS.get(kind)
        if not fn:
            log(f"    ! unknown discovery kind {kind}")
            continue
        new = fn(source)
        if new:
            additions[source["id"]] = new
        else:
            log("    nothing published beyond what we hold")

    if not additions:
        log("\nNo keeper has published a version we do not hold.")
        return 0

    total = sum(len(v) for v in additions.values())
    log(f"\n{total} new released version(s) found:")
    for sid, versions in additions.items():
        for v in versions:
            log(f"  {sid}: {v['tag']}")

    if not apply:
        log("\nReport only. Re-run with --apply to append these and rebuild.")
        return 10

    for source in cfg["sources"]:
        for v in additions.get(source["id"], []):
            source["versions"].append(v)
            source["versions"].sort(key=lambda x: x["tag"])
    CONFIG.write_text(json.dumps(cfg, indent=2, ensure_ascii=False) + "\n")
    log("\nAppended to sources.json; rebuilding.")
    return 10 if subprocess.run([sys.executable, str(HERE / "build.py")], cwd=ROOT).returncode == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
