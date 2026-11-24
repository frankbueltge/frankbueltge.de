"""The weeks build on each other (method doc, "The weeks build on each other"; Frank's request of 2026-11-23, wording
private: a variation that builds up from week to week rather than one that changes at random).

Every album is pressed in the standing form, the form Contrapunctus 45 and 46 were pressed in, and keeps every device
of the album before it. When its week is complete it adds one more. The devices are the ones the Art of Fugue works
through, one contrapunctus after the next, and the title already names that cycle: each is a way of treating the same
material, and each piece of the album plays it in its own idiom (overlooked.py, unison.py, turn.py).

  inversion       the material turned upside down
  diminution      the material twice as fast
  augmentation    the material twice as slow
  second subject  a second subject joins the first: the motif the album before ended on
  stretto         the entries crowd, each before the one before has finished
  retrograde      the material backwards

Which device a week adds, its character decides (character.py), so the order comes from the web's attention:

  break     -> inversion       attention turned over in one night
  held      -> augmentation    one story held the week
  handover  -> second subject  the lead passed to another story and stayed there
  mosaic    -> stretto         the lead kept changing
  standing  -> the next device in the order above

If the week's device is already in force, the week adds the next one in that order. Six albums complete a cycle; the
album after a complete cycle begins the next one with its week's device alone. Editions 1 to 6 of Overlooked play the
devices the album took over; the seventh pressing, once the week is known, adds its own.

An album pressed before this rule (Contrapunctus 47 and earlier) records no progression: the album after it begins
cycle 1. Pure functions and the standard library only, so the rule and its tests need nothing else.
"""
import json
from pathlib import Path

DEVICES = ('inversion', 'diminution', 'augmentation', 'second subject', 'stretto', 'retrograde')
OF_VERDICT = {'break': 'inversion', 'held': 'augmentation', 'handover': 'second subject', 'mosaic': 'stretto'}


def previous(albums: dict[str, dict], week: str) -> tuple[str, dict] | None:
    """The newest complete album before the week, with its week: the album this one builds on."""
    before = sorted(w for w, a in albums.items() if w < week and a.get('complete'))
    return (before[-1], albums[before[-1]]) if before else None


def taken_over(prev: dict | None) -> tuple[int, list[str]]:
    """The cycle an album is in and the devices it takes over from the album before: none when that album was
    pressed before this rule, or when it completed its cycle (the next cycle begins)."""
    p = (prev or {}).get('progression')
    if not p:
        return 1, []
    devices = list(p['devices'])
    if len(devices) >= len(DEVICES):
        return p['cycle'] + 1, []
    return p['cycle'], devices


def adds(verdict: str, have: list[str], second_possible: bool = True) -> tuple[str | None, str]:
    """The device a complete week adds, and the one its verdict asked for. The verdict's own device when it is not
    yet in force; else the first in DEVICES that is not. A second subject needs an album before to take it from."""
    preferred = OF_VERDICT.get(verdict)
    can = [d for d in DEVICES if d not in have and (second_possible or d != 'second subject')]
    if preferred in can:
        return preferred, preferred or ''
    return (can[0] if can else None), preferred or ''


def last_motif(album: dict) -> dict | None:
    """The motif an album's Overlooked ended on (its newest day's, the last heard before the cut): the second subject
    of the album after it. Read from the standing record (days) or from a record pressed in a form (parts)."""
    o = (album.get('pieces') or {}).get('overlooked') or {}
    days = o.get('days')
    if not days:
        parts = [p for p in o.get('parts', []) if p.get('days')]
        days = parts[-1]['days'] if parts else []
    if not days:
        return None
    d = days[-1]
    eighths = d['motif_eighths']
    notes = d['motif']
    return {'day': d['day'], 'field': d['field'], 'text': d['text'], 'instrument': d['instrument'],
            'eighths': eighths,
            'motif': [{'step': n['step'], 'hz': n['hz'],
                       'eighths': n.get('eighths', (notes[k + 1]['step'] if k + 1 < len(notes) else eighths) - n['step'])}
                      for k, n in enumerate(notes)]}


def plan(week: str, verdict: str | None, albums: dict[str, dict]) -> dict:
    """The progression of a pressing of the week: with the week's verdict once it is complete (the seventh pressing),
    with None for editions 1 to 6. `albums` are the records on file, by week."""
    prev = previous(albums, week)
    cycle, have = taken_over(prev[1] if prev else None)
    added, preferred = (None, '')
    if verdict is not None:
        added, preferred = adds(verdict, have, second_possible=prev is not None and last_motif(prev[1]) is not None)
    devices = have + ([added] if added else [])   # in the order they came in
    second = None
    if 'second subject' in devices and prev is not None:
        m = last_motif(prev[1])
        second = {'week': prev[0], **m} if m else None
    return {'cycle': cycle, 'step': len(devices), 'from': prev[0] if prev else None, 'taken_over': have,
            'verdict': verdict, 'asked': preferred or None, 'added': added, 'devices': devices, 'second': second}


def read_albums(folder: Path) -> dict[str, dict]:
    return {p.stem: json.loads(p.read_text()) for p in sorted(folder.glob('20*-W*.json'))}
