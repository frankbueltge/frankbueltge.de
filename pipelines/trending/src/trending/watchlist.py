"""The watchlist: which terms the tracker follows, who put them there, and the rule by which
the machine adds one by itself.

Until 2026-09-02 the list lived inside the installed package and only a person could extend
it, which made the surface a fixed list being watched rather than a search for arcs. Since
then the list lives in the repository beside the records it governs
(`src/data/trending/watchlist.json`), the nightly run appends to it, and a person prunes.
A term a person strikes keeps its place in the file as a tombstone, so the machine can never
promote it again.

The rule, all of it thresholded in `rules.json`: a proposal is taken onto the list when it
appeared among the candidates on `promote_days` consecutive runs including today, carried at
least `promote_min_platforms` platforms each of those times, was never struck, and the list
has room (`promote_max_terms`); at most `promote_max_per_run` terms enter in one night. A
promoted term is tracked from the next run, not retroactively: nothing is ever backfilled.
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from typing import Any, Sequence

from trending.data import load_json
from trending.model import to_json
from trending.normalize import slug as slugify

FILE_NAME = "watchlist.json"


def path(repo_root: str | Path) -> Path:
    return Path(repo_root) / "src" / "data" / "trending" / FILE_NAME


def normalise(raw_entries: Sequence[dict[str, Any]]) -> list[dict[str, Any]]:
    """One entry per slug, aliases as a list, origin closed to two values, tombstones kept."""
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for raw in raw_entries or []:
        term = " ".join(str(raw.get("term") or "").split())
        if not term:
            continue
        slug = str(raw.get("slug") or "").strip() or slugify(term)
        if slug in seen:
            continue
        seen.add(slug)
        aliases = [" ".join(str(a).split()) for a in (raw.get("aliases") or [])]
        entry: dict[str, Any] = {
            "term": term,
            "slug": slug,
            "aliases": [a for a in aliases if a],
            "added": str(raw.get("added") or ""),
            "origin": "discovered" if raw.get("origin") == "discovered" else "editorial",
            "note": str(raw.get("note") or "")[:160],
            "wikipedia_article": (str(raw["wikipedia_article"])
                                  if raw.get("wikipedia_article") else None),
        }
        if raw.get("retired"):
            entry["retired"] = str(raw["retired"])
            if raw.get("retired_note"):
                entry["retired_note"] = str(raw["retired_note"])[:160]
        out.append(entry)
    return out


def tracked(entries: Sequence[dict[str, Any]]) -> list[dict[str, Any]]:
    """The entries the tracker follows tonight: everything that has not been struck."""
    return [e for e in entries if not e.get("retired")]


def load(repo_root: str | Path) -> tuple[list[dict[str, Any]], bool]:
    """The live list, and whether it came from the repository. A repository without one is
    seeded from the copy shipped in the package — that seeding is the only moment the
    package's list is read."""
    file = path(repo_root)
    if file.is_file():
        try:
            return normalise(json.loads(file.read_text(encoding="utf-8"))), True
        except (OSError, ValueError):
            pass  # a corrupt list is a seeding case, never a crash: the run must still write
    return normalise(load_json(FILE_NAME)), False


def save(repo_root: str | Path, entries: Sequence[dict[str, Any]]) -> Path:
    file = path(repo_root)
    file.parent.mkdir(parents=True, exist_ok=True)
    file.write_text(to_json(list(entries)), encoding="utf-8")
    return file


def _known_phrases(entries: Sequence[dict[str, Any]]) -> set[str]:
    """Every wording the list already holds, struck ones included."""
    out: set[str] = set()
    for e in entries:
        for phrase in (e.get("term", ""), *(e.get("aliases") or [])):
            if phrase:
                out.add(" ".join(str(phrase).casefold().split()))
    return out


def _candidate_days(prior_records: Sequence[dict[str, Any]], *, min_platforms: int,
                    ) -> list[set[str]]:
    """Per prior record, newest first, the n-grams it proposed with enough platforms."""
    days: list[set[str]] = []
    for rec in prior_records:
        days.append({str(c.get("ngram") or "")
                     for c in (rec.get("candidates") or [])
                     if len(c.get("platforms") or []) >= min_platforms})
    return days


def promote(*, candidates: Sequence[dict[str, Any]], prior_records: Sequence[dict[str, Any]],
            entries: Sequence[dict[str, Any]], today: date,
            rules: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    """Which proposals have earned a place tonight. Pure: decides, writes nothing."""
    rules = rules or {}
    need_days = max(1, int(rules.get("promote_days", 3)))
    min_platforms = int(rules.get("promote_min_platforms", 2))
    max_per_run = int(rules.get("promote_max_per_run", 3))
    max_terms = int(rules.get("promote_max_terms", 35))

    room = max_terms - len(tracked(entries))
    if room <= 0:
        return []
    known_slugs = {e["slug"] for e in entries}
    known_phrases = _known_phrases(entries)
    prior_days = _candidate_days(prior_records[: need_days - 1], min_platforms=min_platforms)
    if len(prior_days) < need_days - 1:
        return []  # the archive is younger than the rule: nothing has stood long enough yet

    ready: list[dict[str, Any]] = []
    for cand in candidates:
        ngram = str(cand.get("ngram") or "").strip()
        platforms = list(cand.get("platforms") or [])
        if not ngram or len(platforms) < min_platforms:
            continue
        if not all(ngram in day for day in prior_days):
            continue
        slug = slugify(ngram)
        if slug in known_slugs or ngram.casefold() in known_phrases:
            continue
        ready.append({
            "slug": slug,
            "term": ngram,
            "days_seen": need_days,
            "platforms": platforms,
            "ratio": cand.get("ratio"),
            "note": (f"promoted {today.isoformat()}: proposed on {need_days} consecutive runs, "
                     f"{len(platforms)} platforms")[:160],
        })
    ready.sort(key=lambda p: (-len(p["platforms"]), -(p["ratio"] or 0), p["term"]))
    return ready[: max(0, min(max_per_run, room))]


QUIET_STATUSES = frozenset({"quiet", "fading"})


def age(entries: Sequence[dict[str, Any]], record_terms: Sequence[dict[str, Any]], today: date,
        rules: dict[str, Any] | None = None) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """Let go of what the machine took on and the world dropped again.

    A term the machine promoted carries `quiet_since` from the first run that found it quiet
    or fading; the field is cleared the moment it speaks up again. When the silence has stood
    for `retire_quiet_days` the entry is struck automatically, with the reason in the file.
    A term a person put on the list is never struck this way: that choice is theirs to undo.
    """
    rules = rules or {}
    span = int(rules.get("retire_quiet_days", 21))
    status = {str(t.get("slug") or ""): str(t.get("status") or "") for t in record_terms}
    out: list[dict[str, Any]] = []
    let_go: list[dict[str, Any]] = []
    for entry in entries:
        e = dict(entry)
        if e.get("retired") or e.get("origin") != "discovered" or e["slug"] not in status:
            out.append(e)
            continue
        if status[e["slug"]] in QUIET_STATUSES:
            e.setdefault("quiet_since", today.isoformat())
            days = (today - date.fromisoformat(e["quiet_since"])).days + 1
            if days >= span:
                e.pop("quiet_since", None)
                e["retired"] = today.isoformat()
                e["retired_note"] = (f"let go {today.isoformat()}: {status[e['slug']]} for "
                                     f"{days} days running")[:160]
                let_go.append({"slug": e["slug"], "term": e["term"], "days_quiet": days,
                               "note": e["retired_note"]})
        else:
            e.pop("quiet_since", None)
        out.append(e)
    return out, let_go


def apply(entries: Sequence[dict[str, Any]], promotions: Sequence[dict[str, Any]], today: date,
          ) -> list[dict[str, Any]]:
    """The list with tonight's promotions appended, in the order they were decided."""
    out = list(entries)
    for p in promotions:
        hyphenated = p["term"].replace(" ", "-")
        aliases = [hyphenated] if hyphenated != p["term"] else []
        out.append({
            "term": p["term"],
            "slug": p["slug"],
            "aliases": aliases,
            "added": today.isoformat(),
            "origin": "discovered",
            "note": p["note"],
            "wikipedia_article": None,
        })
    return out
