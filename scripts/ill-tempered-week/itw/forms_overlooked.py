"""Overlooked in the week's forms (method doc, "The week chooses its form"; heard as probe 33 on 2026-11-16).

The question stays: what drew the least attention? The material is the standing piece's (overlooked.the_week and
overlooked.melody): each day the least attended headline among all thirteen fields, from a field not heard yet that
week, said once in its field's voice, and its speech melody as a motif for its field's instrument. What the week
decides is how the time is built. Only the seventh pressing takes the form; editions 1 to 6 are the standing piece.

  held      a wall of strings on A's harmonic chord that never stops, as loud as the attention the week held; inside it
            each day's overlooked headline is said quietly and its motif played once by its instrument, under the wall.
            Nothing gathers: what was overlooked stays overlooked.
  mosaic    a block per day: the headline said alone, then its motif played by its instrument as many times as its
            field was named that day (at most four), then silence. Each day stands alone.
  break     the days before the break held, one timpani stroke and silence, the days from it on as a mosaic.
  handover  held; on the day the lead passes, the wall's chord moves up a whole tone (9/8) and stays.
"""
import numpy as np

from . import base, ledger, overlooked, sampler
from .forms import F0, SR, fade, handover_day, lev, put, room

PULSE = overlooked.PULSE
HELD_DAY_S = 13.0
SAID_AT_S = 1.0
WALL_NOTE_S = 6.0
WALL_RELEASE_S = 2.5
WALL_STEP_S = 4.0
GAP_S = 1.4
MAX_REPEATS = 4
CHORD = (2.0, 4 * 5 / 4, 8 * 3 / 2, 1.0, 4 * 7 / 4, 8.0)      # multiples of A1: A2, C#4, E5, A1, G4 (7/4), A5
_INST: dict[str, sampler.Instrument] = {}


def inst(name: str) -> sampler.Instrument:
    if name not in _INST:
        _INST[name] = sampler.Instrument(name)
    return _INST[name]


def motif(m: dict, t: float, buf: np.ndarray, repeats: int = 1, gain: float = 1.0) -> float:
    """The motif played `repeats` times from t, with four eighths' rest between; returns when it ends."""
    span = (m['length'] + 4) * PULSE
    for r in range(repeats):
        for k, nt in enumerate(m['motif']):
            x = inst(m['instrument']).note(nt['hz'], max(0.12, 0.95 * nt['eighths'] * PULSE), vel=84, release=0.5, key=f'{r}{k}{nt["hz"]:.2f}')
            put(buf, t + r * span + nt['step'] * PULSE, x, gain, 0.0)
    return t + repeats * span - 4 * PULSE


def day_record(d: dict, m: dict, said_at: float, motif_at: float, repeats: int) -> dict:
    return {'day': d['day'], 'field': d['field'], 'voice': d['voice'], 'text': d['text'], 'attention': d['attention'],
            'source': d['source'], 'instrument': m['instrument'], 'said_s': round(said_at, 2),
            'speech_s': round(m['speech_seconds'], 3), 'motif_from_s': round(motif_at, 2), 'repeats': repeats,
            'motif_eighths': m['length'],
            'motif': [{'step': nt['step'], 'hz': round(nt['hz'], 2), 'eighths': nt['eighths']} for nt in m['motif']]}


def held(week: list[dict], mel: list[dict], t0: float, step_at: int | None = None) -> tuple[dict, dict]:
    span = len(week) * HELD_DAY_S
    n = int((t0 + span + 12.0) * SR)
    wall, solo, voice = (np.zeros((2, n)) for _ in range(3))
    sections = [inst(s) for s in ('ContrabassSusVB', 'CelloEnsSusVib', 'ViolaEnsSusVib', 'ViolinEnsSusVib')]
    ground, t, j = [], 0.0, 0
    while t < span + 2.0:
        ratio = 9 / 8 if step_at is not None and t >= step_at * HELD_DAY_S else 1.0
        for ci, mult in enumerate(CHORD):
            hz = F0 * mult * ratio
            which = sections[0] if hz < 70 else sections[1] if hz < 200 else sections[2] if hz < 420 else sections[3]
            x = which.note(hz, WALL_NOTE_S, vel=95, release=WALL_RELEASE_S, key=f'w{j}{ci}')
            put(wall, t0 + t + 0.15 * ci, fade(x, 1.5, 2.5), 0.55, (ci % 3) / 1.5 - 0.66)
        ground.append({'from_s': round(t0 + t, 2), 'ratio': ratio})
        t += WALL_STEP_S
        j += 1
    days = []
    for i, (d, m) in enumerate(zip(week, mel)):
        said_at = t0 + i * HELD_DAY_S + SAID_AT_S
        put(voice, said_at, np.stack([m['speech'], m['speech']]), 0.5)
        motif_at = said_at + m['speech_seconds'] + 0.5
        motif(m, motif_at, solo)
        days.append({**day_record(d, m, said_at, motif_at, 1), 'from_s': round(t0 + i * HELD_DAY_S, 2)})
    stems = {'wall': room(wall, 0.9, 0.35, 0.7), 'solo': room(solo, 0.7, 0.2, 0.9), 'voice': room(voice, 0.3, 0.08, 1.0, 90.0)}
    return stems, {'form': 'held', 'from_s': t0, 'to_s': round(t0 + span, 2), 'day_s': HELD_DAY_S,
                   'chord': [round(F0 * c, 3) for c in CHORD], 'ground': ground, 'days': days}


def mosaic(week: list[dict], mel: list[dict], counts: list[int], t0: float) -> tuple[dict, dict]:
    blocks, voice = [], []
    days, t = [], t0
    parts = []
    for i, (d, m) in enumerate(zip(week, mel)):
        reps = max(1, min(MAX_REPEATS, counts[i]))
        span = (m['length'] + 4) * PULSE * reps
        L = 0.2 + m['speech_seconds'] + 0.6 + span + 0.3
        block = np.zeros((2, int((L + 3.0) * SR)))
        said = np.zeros((2, block.shape[1]))
        put(said, 0.2, np.stack([m['speech'], m['speech']]), 0.7)
        motif_at = 0.2 + m['speech_seconds'] + 0.6
        motif(m, motif_at, block, reps)
        block = room(block, 0.5, 0.15, 0.95)[:, :int(L * SR)]
        said = room(said, 0.3, 0.06, 1.0, 90.0)[:, :int(L * SR)]
        parts.append((t, fade(block, 0.01, 0.05), fade(said, 0.01, 0.05)))
        days.append({**day_record(d, m, t + 0.2, t + motif_at, reps), 'from_s': round(t, 2), 'to_s': round(t + L, 2),
                     'named': counts[i]})
        t += L + GAP_S
    n = int((t + 6.0) * SR)
    b, v = np.zeros((2, n)), np.zeros((2, n))
    for at, blk, sd in parts:
        base.place(b, int(at * SR), blk)
        base.place(v, int(at * SR), sd)
    return {'blocks': b, 'voice': v}, {'form': 'mosaic', 'from_s': t0, 'to_s': round(t - GAP_S, 2), 'days': days}


def render(form: str, character: dict, days_so_far: list[str]) -> tuple[np.ndarray, dict]:
    week = overlooked.the_week(days_so_far)
    mel = [overlooked.melody(d) for d in week]
    ledger.use_days(days_so_far)
    counts = [ledger.field_week(d['field'])[1][i]['count'] for i, d in enumerate(week)]
    stems: dict[str, list] = {}
    parts = []

    def take(s: dict) -> None:
        for k, v in s.items():
            stems.setdefault(k, []).append(v)

    if form in ('held', 'handover'):
        s, rec = held(week, mel, 0.5, handover_day(character['leads']) if form == 'handover' else None)
        take(s)
        parts.append(rec)
    elif form == 'mosaic':
        s, rec = mosaic(week, mel, counts, 0.5)
        take(s)
        parts.append(rec)
    elif form == 'break':
        k = next(i for i, d in enumerate(week) if d['day'] == character['break_day'])
        s1, r1 = held(week[:k], mel[:k], 0.5)
        cut = r1['to_s'] + 1.0
        for key, v in s1.items():
            v = v[:, :int(cut * SR)].copy()
            v[:, -int(0.04 * SR):] *= np.linspace(1, 0, int(0.04 * SR))
            stems.setdefault(key, []).append(v)
        hit = np.zeros((2, int((cut + 5.0) * SR)))
        put(hit, cut, inst('Timpani').note(F0 * 2, 2.5, vel=120, release=1.5, key='break'), 2.2)
        stems.setdefault('stroke', []).append(room(hit, 0.85, 0.3, 0.8))
        s2, r2 = mosaic(week[k:], mel[k:], counts[k:], cut + 4.0)
        take(s2)
        parts += [r1, {'form': 'stroke', 'at_s': round(cut, 2), 'day': character['break_day']}, r2]
    else:
        raise ValueError(f'Overlooked has no {form} form here; the standing form is overlooked.render')
    n = max(v.shape[1] for vs in stems.values() for v in vs)
    target = {'wall': -15.0, 'solo': -23.0, 'voice': -21.0, 'blocks': -18.0, 'stroke': -18.0}
    mix = np.zeros((2, n))
    for key, vs in stems.items():
        m = np.zeros((2, n))
        for v in vs:
            m[:, :v.shape[1]] += v
        mix += lev(m, target[key])
    end = max(p.get('to_s', p.get('at_s', 0.0)) for p in parts) + 6.0
    mix = fade(mix[:, :int(end * SR)], 0.01, 2.0)
    return base.level(mix, -16.0), {'week': ledger.WEEK, 'form': form, 'tuning': 'just, harmonics 8-15 of A1 = 55 Hz',
                                   'pulse_s': PULSE, 'days_so_far': len(week), 'newest_day': week[-1]['day'],
                                   'round': ledger.ROUND, 'parts': parts, 'library': 'VSCO 2 CE 1.1.0 (CC0)'}
