"""TOP „Verluste" — dokumentiert Großereignisse mit Todesopfern der letzten Tage.

Reuse des Wikidata-Fetchers (ohne Pageviews/Zerfall): keine Wertung, keine Rangfolge,
keine „Aufrufe je Opfer" — nur das Verzeichnis (Datum, Ereignis, Todesopfer). Im Protokoll
wird dieser Punkt bezeugt, nicht vertagt. Deterministisch und fehler-isoliert.
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from protokoll.adapters.base import Context
from protokoll.halbwertszeit.wikidata import fetch_events
from protokoll.model import Entry, LossEvent, SourceMeta

WINDOW_DAYS = 7
MAX_EVENTS = 15
SOURCE = SourceMeta(
    name="Wikidata (P1120, Anzahl der Todesopfer)",
    url="https://www.wikidata.org/",
    license="CC0",
)


def _now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def build_verluste_entry(ctx: Context) -> Entry:
    common = dict(top_id="verluste", unit="Todesopfer", cadence="daily",
                  source=SOURCE, retrieved_at=_now_iso())
    try:
        raw = fetch_events(ctx.client)
        cutoff = (ctx.today - timedelta(days=WINDOW_DAYS)).isoformat()
        today = ctx.today.isoformat()
        recent = [e for e in raw.values() if cutoff <= e["date"] <= today]
        # newest first; (date, qid) makes the order fully deterministic
        recent.sort(key=lambda e: (e["date"], e["qid"]), reverse=True)
        events = tuple(
            LossEvent(date=e["date"], label_de=e["label_de"], label_en=e["label_en"],
                      deaths=int(e["deaths"]))
            for e in recent[:MAX_EVENTS]
        )
        return Entry(status="ok", events=events, as_of=today, **common)
    except Exception as exc:  # Isolation: ein Quellenausfall kippt nie den Lauf
        return Entry(status="unavailable", note=f"{type(exc).__name__}: {exc}"[:200], **common)
