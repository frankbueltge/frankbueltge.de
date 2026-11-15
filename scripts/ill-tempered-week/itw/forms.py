"""What the week's forms share (method doc, "The week chooses its form"): the stories of a field's signals, the
day the lead passes, and the small tools every form uses. The forms themselves live beside the pieces they shape
(forms_unison.py, forms_turn.py, forms_overlooked.py); the standing renderers (unison.py, turn.py, overlooked.py)
are not touched, so albums pressed before keep the code they were pressed with.
"""
import collections
import math

import numpy as np
import pedalboard as pb
import pyloudnorm

from . import base, ledger
from .character import fold

SR = base.SR
F0 = 55.0


def story_of(term: str) -> str | None:
    """A story is a place or an actor, a capitalised term; a story's variants fold into one name; a generic word
    (shooting, ceasefire, climate) carries no story of its own."""
    if not term or not term[0].isupper():
        return None
    return fold(term)


def field_days(field: str) -> list[dict]:
    """The field's signals of each day read, each with its story and hour, and the day's leading story and agreement
    (the share of the day's signals that name it). A signal without an hour gets one from its place in the day."""
    _, wk = ledger.field_week(field)
    out = []
    for d in wk:
        named = [{story_of(t) for t in s['terms']} - {None} for s in d['signals']]
        count = collections.Counter(x for n in named for x in n)
        lead = min(count.items(), key=lambda kv: (-kv[1], kv[0]))[0] if count else None
        sigs = []
        for i, (s, n) in enumerate(zip(d['signals'], named)):
            story = min(n, key=lambda t: (-count[t], t)) if n else None
            hour = s['hour'] if s['hour'] is not None else (i + 0.5) * 24.0 / max(1, len(d['signals']))
            sigs.append({**s, 'story': story, 'hour': float(hour)})
        sigs.sort(key=lambda x: (x['hour'], x['text']))
        out.append({'day': d['day'], 'count': d['count'], 'families': d['families'], 'lead': lead,
                    'agreement': round(count[lead] / len(sigs), 3) if lead else 0.0, 'signals': sigs})
    return out


def handover_day(leads: list[str]) -> int | None:
    """The index of the day the lead passes and holds to the end (character.classify's handover), else None."""
    for i in range(2, len(leads) - 2):
        if leads[0] == leads[1] and leads[i] != leads[0] and all(x == leads[i] for x in leads[i:]):
            return i
    return None


def fade(x: np.ndarray, a_s: float, r_s: float) -> np.ndarray:
    x = x.copy()
    n = x.shape[-1]
    a, r = max(1, min(n, int(a_s * SR))), max(1, min(n, int(r_s * SR)))
    x[..., :a] *= np.linspace(0, 1, a)
    x[..., -r:] *= np.linspace(1, 0, r)
    return x


def put(buf: np.ndarray, t: float, sig: np.ndarray, gain: float = 1.0, pan: float = 0.0) -> None:
    a = (pan + 1) * math.pi / 4
    m = sig.mean(axis=0) if sig.ndim == 2 else sig
    base.place(buf, int(round(t * SR)), np.stack([m * math.cos(a), m * math.sin(a)]) * gain * 1.41)


def room(x: np.ndarray, size: float, wet: float, dry: float, hp: float = 30.0) -> np.ndarray:
    return pb.Pedalboard([pb.HighpassFilter(hp), pb.Reverb(room_size=size, damping=0.45, wet_level=wet, dry_level=dry, width=1.0)])(
        x.astype(np.float32), SR).astype(np.float64)


def lev(x: np.ndarray, lufs: float) -> np.ndarray:
    L = pyloudnorm.Meter(SR).integrated_loudness(x.T)
    return x * 10 ** ((lufs - L) / 20) if np.isfinite(L) else x


def mono_said(text: str, voice: str) -> np.ndarray:
    x = base.speak(text, voice)
    return np.stack([x, x])
