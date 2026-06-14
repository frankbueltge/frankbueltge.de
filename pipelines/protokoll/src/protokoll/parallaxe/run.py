"""CLI: python -m protokoll.parallaxe.run [--date] (--dry-run --repo-root | Commit).
Nächtlich: Register aus Wikipedias Liste umstrittener Themen → je Thema Extrakte +
ein Gemini-Aufruf → eine kanonische Auslassungs-Matrix-Datei."""
from __future__ import annotations

import argparse
import json
import os
import sys
import traceback
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import httpx

from protokoll.github_commit import commit_file
from protokoll.parallaxe import (
    MIN_LANGS,
    MODEL,
    SOURCE_CATEGORIES,
    TOPIC_CAP,
    WORKERS,
)
from protokoll.parallaxe import analyze, extract_llm, extracts, register

USER_AGENT = "frankbueltge.de werkgruppe parallaxe (hello@frankbueltge.de)"
OUT_PATH = "src/data/parallaxe/register.json"


def _process_topic(client: httpx.Client, topic: dict[str, Any]) -> dict[str, Any] | None:
    """Ein Thema vermessen — fault-isoliert (Fehler -> None, kippt nicht die Nacht)."""
    try:
        intros, failed = extracts.fetch_intros(client, topic["titles"])
        if len(intros) < MIN_LANGS:
            return None
        data = extract_llm.extract_omissions(intros, client=client)
        oi = analyze.omission_index(data["claims"], list(intros))
        protection = register.protection_status(client, topic["en_title"])
        return {
            "en_title": topic["en_title"],
            "lang_count": topic["lang_count"],
            "protection": protection,
            "langs": sorted(intros),
            "lemma": data["lemma"],
            "name_umstritten": bool(data.get("name_umstritten", False)),
            "claims": [{"aussage": c["aussage"], "by_lang": c["nach_sprache"]}
                       for c in data["claims"]],
            "omission_by_lang": oi,
            "mean_omission": analyze.mean_omission(oi),
        }
    except Exception:
        print(f"Thema übersprungen ({topic.get('en_title')!r}):", file=sys.stderr)
        traceback.print_exc()
        return None


def build_register(client: httpx.Client, today: str) -> dict[str, Any]:
    titles = register.controversial_titles(client)
    topics = register.rank_topics(client, titles)
    # Themen parallel verarbeiten (I/O-gebunden; httpx.Client ist thread-sicher) — bändigt die
    # Wandzeit trotz langsamer LLM-Aufrufe. Reihenfolge wird danach wiederhergestellt.
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        results = list(pool.map(lambda t: _process_topic(client, t), topics))
    topics_out = [r for r in results if r is not None]
    means = [t["mean_omission"] for t in topics_out]
    mean_index = round(sum(means) / len(means), 4) if means else None
    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "rule": {"source": list(SOURCE_CATEGORIES), "min_langs": MIN_LANGS,
                 "cap": TOPIC_CAP, "model": MODEL},
        "mean_omission_index": mean_index,
        "topics": topics_out,
    }


def main(argv: list[str] | None = None) -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--date", default=None, help="YYYY-MM-DD (default: heute UTC)")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--repo-root", default=None)
    args = p.parse_args(argv)
    today = args.date or datetime.now(timezone.utc).date().isoformat()
    try:
        datetime.strptime(today, "%Y-%m-%d")
    except ValueError:
        p.error(f"ungültiges Datum: {today!r} (erwartet YYYY-MM-DD)")

    with httpx.Client(headers={"User-Agent": USER_AGENT}) as client:
        register_data = build_register(client, today)
        # Degenerat-Guard: lieber das gestrige Register behalten als ein leeres committen.
        if not register_data["topics"]:
            print("Abbruch: keine Themen vermessen — Quelle gestört, Register wird nicht ersetzt.",
                  file=sys.stderr)
            return 1
        payload = json.dumps(register_data, ensure_ascii=False, indent=1, sort_keys=True,
                             allow_nan=False) + "\n"
        if args.dry_run:
            if not args.repo_root:
                p.error("--dry-run braucht --repo-root")
            target = Path(args.repo_root) / OUT_PATH
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(payload, encoding="utf-8")
            print(f"geschrieben: {target}")
        else:
            sha = commit_file(
                repo=os.environ.get("GITHUB_REPO", "frankbueltge/frankbueltge.de"),
                path=OUT_PATH, content=payload,
                message=f"parallaxe: Messung vom {today}",
                token=os.environ["GITHUB_TOKEN"], client=client,
            )
            print(f"committet: {OUT_PATH} @ {sha}")

    n = len(register_data["topics"])
    print(f"{n} Themen — mittlerer Auslassungsindex {register_data['mean_omission_index']}",
          file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
