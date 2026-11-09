"""The week as the ledger holds it: which signals named a field on which day, with their attention, hour and
terms; the Ducking round of the days so far (an edition never reads a round from its future)."""
import collections
import json
import re
from datetime import date, datetime, timedelta

import numpy as np

from . import base
from .base import load, voices

DAYS: list[str] = []
ROUND = ''
WEEK = ''
OUTLET = re.compile(r'\s+[-–—|]\s+[^-–—|]{2,40}$')


def days_of(week: str) -> list[str]:
    y, w = week.split('-W')
    monday = date.fromisocalendar(int(y), int(w), 1)
    return [(monday + timedelta(days=i)).isoformat() for i in range(7)]


def round_for(day: str) -> str:
    """The newest Ducking round checked on or before the day: an edition never reads a round from its future."""
    best = None
    for p in sorted((base.SITE / 'src/data/ducking/rounds').glob('*.json')):
        r = json.loads(p.read_text())
        if r.get('checked', '9999-99-99') <= day and (best is None or r['checked'] >= best[0]):
            best = (r['checked'], r['id'])
    if best is None:
        raise ValueError(f'no Ducking round checked by {day}')
    return best[1]


def use_days(days: list[str]) -> None:
    """Point every reader at the days so far, the round of the newest of them and their ISO week."""
    global DAYS, ROUND, WEEK
    DAYS = list(days)
    ROUND = round_for(DAYS[-1])
    WEEK = date.fromisoformat(DAYS[0]).strftime('%G-W%V')


def channel(fid: str) -> dict:
    rnd = load(f'src/data/ducking/rounds/{ROUND}.json')
    return next(c for c in rnd['channels'] if c['id'] == fid)


def hour_of(signal: dict) -> float | None:
    """The hour of the day (UTC, 0-24) a signal was published or started, where the source says so."""
    from email.utils import parsedate_to_datetime
    meta = signal.get('meta') or {}
    stamp = meta.get('pub_date') or meta.get('started_at')
    if not stamp:
        return None
    try:
        t = parsedate_to_datetime(stamp) if ',' in stamp else datetime.fromisoformat(stamp.replace('Z', '+00:00'))
        t = t.astimezone(tz=None) if t.tzinfo is None else t
        from datetime import timezone
        t = t.astimezone(timezone.utc)
        return t.hour + t.minute / 60
    except (TypeError, ValueError):
        return None


def attention_keys(source: str, signals: list[dict]) -> list:
    """What counts as attention on a platform that day: its own number where it gives one (Hacker News points,
    Bluesky posts, Trends searches, Polymarket dollars, Wikipedia views); for Google News how many of its editions
    ran the same headline, then the rank; otherwise the rank alone."""
    if source == 'google_news':
        editions = collections.Counter(OUTLET.sub('', x['label']).strip() for x in signals)
        return [(editions[OUTLET.sub('', x['label']).strip()], -(x.get('rank') or 999)) for x in signals]
    if any(x.get('magnitude') is not None for x in signals):
        return [(x.get('magnitude') or 0, -(x.get('rank') or 999)) for x in signals]
    return [(-(x.get('rank') or 999),) for x in signals]


def percentiles(keys: list) -> list[float]:
    n = len(keys)
    if n < 2:
        return [0.5] * n
    order = sorted(keys)
    return [sum(1 for k in order if k < key) / (n - 1) for key in keys]


def field_week(fid: str) -> tuple[dict, list[dict]]:
    """Every signal that named the field on each day (the house count, scripts/ducking/voices.field_test),
    with its family, its text (a news headline without the outlet's name, else the platform's label) and
    whether Ducking's record would read it aloud (voices.readable)."""
    ch = channel(fid)
    test = voices.field_test(ch)
    namers = {t: voices.namer([t]) for t in ch['terms']}
    week = []
    for d in DAYS:
        t = load(f'src/data/trending/{d}.json')
        found = []
        for source, signals in t['signals'].items():
            pct = percentiles(attention_keys(source, signals))
            for s, att in zip(signals, pct):
                texts = [s['label']] + [l.get('title') or '' for l in (s.get('links') or [])]
                if any(test(x) for x in texts):
                    text = OUTLET.sub('', s['label']).strip() if source == 'google_news' else s['label'].strip()
                    found.append({'source': source, 'family': base.family_of(source), 'text': text,
                                  'readable': base.speakable(text), 'house_filter': bool(voices.readable(text)),
                                  'terms': sorted(t for t, nm in namers.items() if any(nm(x) for x in texts)),
                                  'attention': round(att, 4), 'magnitude': s.get('magnitude'), 'unit': s.get('magnitude_unit'),
                                  'rank': s.get('rank'), 'geo': s.get('geo'), 'hour': hour_of(s)})
        fams = collections.Counter(s['family'] for s in found)
        week.append({'day': d, 'signals': found, 'count': len(found), 'families': dict(fams)})
    return ch, week


