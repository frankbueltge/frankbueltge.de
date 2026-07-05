"""CLI: python -m protokoll.parallaxe.run [--date] (--dry-run --repo-root | Commit).

Ein Thema pro Tag, deterministisch nach Datum rotierend: die Wikipedia-Kategorien liefern die
gerankte Themenliste, davon wird genau EINES gemessen (ein Gemini-Aufruf) und ins bestehende
register.json einsortiert (Upsert mit Mess-Datum). Die Auslassungs-Matrix baut sich so über die
Rotation auf und frischt sich selbst auf — statt jede Nacht alle Themen neu zu versuchen (was den
Gemini-Free-Tier sprengte). Ein an einem Tag nicht messbares Thema lässt das Register unverändert.
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import traceback
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
)
from protokoll.parallaxe import analyze, extract_llm, extracts, register

USER_AGENT = "frankbueltge.de werkgruppe parallaxe (hello@frankbueltge.de)"
OUT_PATH = "src/data/parallaxe/register.json"


def _process_topic(client: httpx.Client, topic: dict[str, Any]) -> dict[str, Any] | None:
    """Ein Thema vermessen — fault-isoliert. Rückgabe: Ergebnis oder None bei Ausfall."""
    try:
        intros, _ = extracts.fetch_intros(client, topic["titles"])
        if len(intros) < MIN_LANGS:
            print(f"Thema übersprungen ({topic.get('en_title')!r}): zu wenige Sprachen",
                  file=sys.stderr)
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


def pick_topic_for_date(ranked: list[dict[str, Any]], today: str) -> dict[str, Any]:
    """Deterministische Tages-Rotation: ordinal(Datum) mod Anzahl gerankter Themen."""
    ordinal = datetime.strptime(today, "%Y-%m-%d").date().toordinal()
    return ranked[ordinal % len(ranked)]


def load_register(path: Path) -> dict[str, Any] | None:
    """Bestehendes register.json laden (im Workflow ausgecheckt) — None, wenn keins/kaputt."""
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return None


def upsert(reg: dict[str, Any], measured: dict[str, Any], today: str,
           keep_titles: set[str]) -> dict[str, Any]:
    """Gemessenes Thema ins Register einsortieren (ersetzt gleichnamiges); nur Themen behalten,
    die noch im aktuellen Ranking stehen; Kennzahlen und Metadaten neu setzen."""
    measured = {**measured, "measured": today}
    kept = [t for t in reg.get("topics", [])
            if t["en_title"] in keep_titles and t["en_title"] != measured["en_title"]]
    kept.append(measured)
    kept.sort(key=lambda t: t["en_title"])  # stabile Reihenfolge → minimaler Diff
    means = [t["mean_omission"] for t in kept]
    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "rule": {"source": list(SOURCE_CATEGORIES), "min_langs": MIN_LANGS,
                 "cap": TOPIC_CAP, "model": MODEL, "cadence": "ein Thema pro Tag, rotierend"},
        "census": {"attempted": 1, "measured": 1, "failed": {}},
        "mean_omission_index": round(sum(means) / len(means), 4) if means else None,
        "topics": kept,
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

    root = Path(args.repo_root) if args.repo_root else Path(".")

    with httpx.Client(headers={"User-Agent": USER_AGENT}) as client:
        titles = register.controversial_titles(client)
        ranked = register.rank_topics(client, titles)
        if not ranked:
            print("Abbruch: keine Themen in der Quelle — Register wird nicht ersetzt.",
                  file=sys.stderr)
            return 1

        topic = pick_topic_for_date(ranked, today)
        keep_titles = {t["en_title"] for t in ranked}
        existing = load_register(root / OUT_PATH) or {"topics": []}

        measured = _process_topic(client, topic)
        if measured is None:
            # Weicher Ausfall: heutiges Thema nicht messbar → Register unverändert lassen.
            print(f"Thema {topic['en_title']!r} heute nicht messbar — Register unverändert "
                  "(kein Commit).", file=sys.stderr)
            # Nur echter Fehler, wenn wir überhaupt keine Daten haben.
            return 0 if existing.get("topics") else 1

        register_data = upsert(existing, measured, today, keep_titles)
        payload = json.dumps(register_data, ensure_ascii=False, indent=1, sort_keys=True,
                             allow_nan=False) + "\n"
        if args.dry_run:
            if not args.repo_root:
                p.error("--dry-run braucht --repo-root")
            target = root / OUT_PATH
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(payload, encoding="utf-8")
            print(f"geschrieben: {target}")
        else:
            sha = commit_file(
                repo=os.environ.get("GITHUB_REPO", "frankbueltge/frankbueltge.de"),
                path=OUT_PATH, content=payload,
                message=f"parallaxe: {topic['en_title']} vermessen ({today})",
                token=os.environ["GITHUB_TOKEN"], client=client,
            )
            print(f"committet: {OUT_PATH} @ {sha}")

    print(f"{topic['en_title']} vermessen — {len(register_data['topics'])} Themen im Register, "
          f"mittlerer Auslassungsindex {register_data['mean_omission_index']}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
