"""Unison in the week's forms (method doc, "The week chooses its form"; heard as probe 33 on 2026-11-16).

The question stays: how far did the press agree on one war story? Every war signal of the week sounds once, at its
hour; agreement pulls it towards A; from 30 % agreement on brass take up A and the day's most attended war headline
is said. What the week decides is how the time is built.

  held      one unbroken sound, no day heard as a day. A double-bass pedal on A1 from the first second to the last.
            Each signal is a held string note: one naming the week's leading story on an octave of A, any other story
            on its own degree of A's harmonic scale (9, 11, 13, 14, 15, 10, 12 over 8), gliding towards A as far as
            its day agreed. A peak day: brass hold bare octaves of A under the day, its headline said quietly.
  mosaic    a block per day, as long as the day's share of the week's signals, a hard cut and silence between. Each
            story owns a sound (first come, first served: cello pizzicato, trumpet, xylophone, harp, bassoon,
            marimba, horn, glockenspiel); the day's leading story beats the ground. Each signal is a short note at
            its hour on a grid whose speed is the day's count. A peak day opens with a brass chord and its headline.
  break     the days before the break held, one timpani stroke and silence, the days from it on as a mosaic.
  handover  held; on the day the lead passes the pedal glides up a whole tone (9/8) and stays there.
"""
import collections
import math

import numpy as np

from . import base, ledger, sampler
from .forms import F0, SR, fade, field_days, handover_day, lev, mono_said, put, room

HELD_DAY_S = 14.0
HELD_GLIDE_S = 4.5
HELD_RELEASE_S = 2.0
SAID_AFTER_S = 3.0
BRASS_AFTER_S = 1.0
MOSAIC_S = 90.0
GAP_S = 1.1
PEAK = 0.3
DEGREES = (9, 11, 13, 14, 15, 10, 12)
COLOURS = (('CelloEnsPizz', 110.0, -0.3), ('TrumpetStac', 440.0, 0.25), ('Xylophone', 880.0, -0.5), ('Harp', 330.0, 0.5),
           ('BassoonStac', 165.0, 0.1), ('Marimba', 660.0, -0.15), ('FHornStac', 220.0, 0.4), ('Glockenspiel', 1320.0, 0.0))
_INST: dict[str, sampler.Instrument] = {}


def inst(name: str) -> sampler.Instrument:
    if name not in _INST:
        _INST[name] = sampler.Instrument(name)
    return _INST[name]


def said_of(d: dict) -> dict | None:
    readable = [s for s in d['signals'] if s['readable'] and len(s['text'].split()) >= 4]
    return max(readable, key=lambda s: (s['attention'], s['text'])) if readable else None


def held(days: list[dict], voice: str, t0: float = 0.0, step_at: int | None = None) -> tuple[dict, dict]:
    """The held form over the days given, from t0. Returns the stems and the record."""
    week = collections.Counter(s['story'] for d in days for s in d['signals'] if s['story'])
    lead = min(week.items(), key=lambda kv: (-kv[1], kv[0]))[0] if week else None
    others = sorted((t for t in week if t != lead), key=lambda t: (-week[t], t))
    degree = {t: DEGREES[i % len(DEGREES)] for i, t in enumerate(others)}
    span = len(days) * HELD_DAY_S
    n = int((t0 + span + 14.0) * SR)
    pedal, strings, brass, said = (np.zeros((2, n)) for _ in range(4))
    ground = []
    t = 0.0
    while t < span + 3.0:                                         # overlapping bowed notes: the pedal never breaks
        day = int(t // HELD_DAY_S)
        up = step_at is not None and day >= step_at
        hz = F0 * (9 / 8 if up else 1.0)
        if step_at is not None and abs(t - step_at * HELD_DAY_S) < 2.25:
            x = sampler.glide(inst('ContrabassSusVB'), F0, F0 * 9 / 8, 4.0, vel=80, release=2.5, key='step')
            hz = F0 * 9 / 8
        else:
            x = inst('ContrabassSusVB').note(hz, 7.0, vel=72, release=2.5, key=f'pedal{t:.1f}')
        put(pedal, t0 + t, fade(x, 1.8, 2.5), 0.9, -0.1)
        put(pedal, t0 + t + 0.01, fade(x, 1.8, 2.5), 0.5, 0.3)
        ground.append({'from_s': round(t0 + t, 2), 'hz': round(hz, 3)})
        t += 4.5
    sections = {'lo': inst('CelloEnsSusVib'), 'mid': inst('ViolaEnsSusVib'), 'hi': inst('ViolinEnsSusVib')}
    total = sum(len(d['signals']) for d in days)
    gain = 2.2 / math.sqrt(max(1.0, total / max(1, len(days))))
    log = []
    for di, d in enumerate(days):
        base_hz = F0 * (9 / 8 if step_at is not None and di >= step_at else 1.0)
        events = []
        for j, s in enumerate(d['signals']):
            at = t0 + di * HELD_DAY_S + s['hour'] / 24.0 * HELD_DAY_S
            octave = (2, 4, 8)[j % 3]
            on_lead = s['story'] == lead
            start = base_hz * octave * (1.0 if on_lead else degree.get(s['story'], 15) / 8)
            end = start * ((base_hz * octave) / start) ** d['agreement']   # towards A as far as the day agreed
            reg = 'lo' if start < 200 else 'mid' if start < 420 else 'hi'
            x = sampler.glide(sections[reg], start, end, HELD_GLIDE_S, vel=int(45 + 50 * s['attention']), release=HELD_RELEASE_S,
                              key=f'{d["day"]}{j}')
            put(strings, at, fade(x, 1.2, 2.0), gain * (0.8 if on_lead else 1.0), (j % 7) / 3.5 - 0.85)
            events.append({'at_s': round(at, 2), 'story': s['story'], 'lead': on_lead, 'attention': s['attention'],
                           'from_hz': round(start, 1), 'to_hz': round(end, 1), 'text': s['text']})
        peak = d['agreement'] >= PEAK and d['lead'] == lead
        top = said_of(d) if peak else None
        if peak:
            for hz, name, p in ((base_hz * 4, 'FHornSus', 0.25), (base_hz * 2, 'TromboneSus', -0.2), (base_hz, 'TubaSus', 0.05)):
                x = inst(name).note(hz, HELD_DAY_S * 0.8, int(30 + 70 * d['agreement']), release=2.5, key=f'b{d["day"]}{name}')
                put(brass, t0 + di * HELD_DAY_S + BRASS_AFTER_S, fade(x, 3.0, 3.0), 1.0, p)
        said_s = None
        if top:
            x = mono_said(top['text'], voice)
            put(said, t0 + di * HELD_DAY_S + SAID_AFTER_S, x, 0.35)
            said_s = round(x.shape[1] / SR, 3)
        log.append({'day': d['day'], 'from_s': round(t0 + di * HELD_DAY_S, 2), 'signals': len(d['signals']), 'lead': d['lead'],
                    'agreement': d['agreement'], 'peak': peak, 'said': top['text'] if top else None, 'said_s': said_s,
                    'events': events})
    stems = {'pedal': room(pedal, 0.9, 0.35, 0.7), 'strings': room(strings, 0.9, 0.35, 0.7),
             'brass': room(brass, 0.88, 0.35, 0.75), 'said': room(said, 0.3, 0.06, 1.0, 90.0)}
    return stems, {'form': 'held', 'from_s': t0, 'to_s': round(t0 + span, 2), 'day_s': HELD_DAY_S, 'lead': lead,
                   'degrees': degree, 'ground': ground, 'days': log}


def mosaic(days: list[dict], voice: str, t0: float = 0.0, music: float = MOSAIC_S) -> tuple[dict, dict]:
    order = []
    for d in days:
        for t in [d['lead']] + [s['story'] for s in d['signals']]:
            if t and t not in order:
                order.append(t)
    colour = {t: COLOURS[i % len(COLOURS)] for i, t in enumerate(order)}
    total = max(1, sum(len(d['signals']) for d in days))
    lengths = [max(4.0, music * len(d['signals']) / total) for d in days]
    n = int((t0 + sum(lengths) + GAP_S * len(days) + 8.0) * SR)
    blocks, said = np.zeros((2, n)), np.zeros((2, n))
    log, t = [], t0
    for di, (d, L) in enumerate(zip(days, lengths)):
        buf = np.zeros((2, int((L + 3.0) * SR)))
        bpm = 70 + 4 * len(d['signals'])
        step = 60.0 / bpm / 2
        lead_c = colour.get(d['lead'], COLOURS[0])
        events = []
        peak = d['agreement'] >= PEAK
        top = said_of(d) if peak else None
        offset = 0.0
        said_s = None
        if peak:                                                   # the block opens with brass on the lead's tone
            for hz, name, p in ((lead_c[1], 'TrumpetStac', 0.2), (lead_c[1] * 3 / 4, 'TromboneStac', -0.2), (lead_c[1] / 2, 'TubaStac', 0.0)):
                put(buf, 0.0, inst(name).note(hz, 0.6, int(50 + 70 * d['agreement']), release=0.4, key=f'p{d["day"]}{name}'), 0.9, p)
            if top:
                x = mono_said(top['text'], voice)
                put(said, t + 0.4, x, 0.6)
                offset = min(L * 0.4, x.shape[1] / SR * 0.5)
                said_s = round(x.shape[1] / SR, 3)
        for j, s in enumerate(d['signals']):
            at = offset + round(s['hour'] / 24.0 * (L - offset - 0.3) / step) * step
            c = colour.get(s['story'], lead_c)
            hz = c[1] * (8, 9, 10, 12, 14, 15)[(j * 5 + di) % 6] / 8
            x = inst(c[0]).note(hz, step * 0.9, vel=int(60 + 60 * s['attention']), release=0.25, key=f'{d["day"]}{j}')
            put(buf, at, x, 1.0 if s['story'] == d['lead'] else 1.25, c[2])
            events.append({'at_s': round(t + at, 2), 'story': s['story'], 'lead': s['story'] == d['lead'], 'sound': c[0],
                           'hz': round(hz, 1), 'attention': s['attention'], 'text': s['text']})
        k = 0
        while k * step * 4 < L:                                    # the lead beats the ground
            put(buf, k * step * 4, inst(lead_c[0]).note(lead_c[1] / 2 if lead_c[1] > 200 else lead_c[1], step, vel=55,
                                                         release=0.2, key=f'g{d["day"]}{k}'), 0.7, lead_c[2])
            k += 1
        buf = room(buf, 0.5, 0.18, 0.95)[:, :int(L * SR)]
        base.place(blocks, int(t * SR), fade(buf, 0.005, 0.03))    # the block ends; the room does not ring on
        log.append({'day': d['day'], 'from_s': round(t, 2), 'to_s': round(t + L, 2), 'signals': len(d['signals']),
                    'lead': d['lead'], 'agreement': d['agreement'], 'peak': peak, 'said': top['text'] if top else None,
                    'said_s': said_s, 'step_s': round(step, 4), 'events': events})
        t += L + GAP_S
    return ({'blocks': blocks, 'said': room(said, 0.3, 0.06, 1.0, 90.0)},
            {'form': 'mosaic', 'from_s': t0, 'to_s': round(t - GAP_S, 2), 'sounds': {k: v[0] for k, v in colour.items()},
             'days': log})


def render(form: str, character: dict) -> tuple[np.ndarray, dict]:
    ledger.use_days(ledger.DAYS)
    ch = ledger.channel('war')
    days = field_days('war')
    voice = ch['voice']
    parts, stems = [], collections.defaultdict(list)
    if form in ('held', 'handover'):
        step = handover_day(character['leads']) if form == 'handover' else None
        s, rec = held(days, voice, 0.5, step)
        parts.append(rec)
        for k, v in s.items():
            stems[k].append(v)
    elif form == 'mosaic':
        s, rec = mosaic(days, voice, 0.5)
        parts.append(rec)
        for k, v in s.items():
            stems[k].append(v)
    elif form == 'break':
        k = days.index(next(d for d in days if d['day'] == character['break_day']))
        s1, r1 = held(days[:k], voice, 0.5)
        cut = r1['to_s'] + 1.5
        s2, r2 = mosaic(days[k:], voice, cut + 4.0, MOSAIC_S * (len(days) - k) / len(days))
        n = int((r2['to_s'] + 8.0) * SR)
        for key, v in s1.items():                                  # the held part is cut, not faded
            v = v[:, :int(cut * SR)].copy()
            v[:, -int(0.04 * SR):] *= np.linspace(1, 0, int(0.04 * SR))
            stems[key].append(v)
        hit = np.zeros((2, n))
        put(hit, cut, inst('Timpani').note(F0 * 2, 2.5, vel=120, release=1.5, key='break'), 2.2)
        stems['stroke'].append(room(hit, 0.85, 0.3, 0.8))
        for key, v in s2.items():
            stems[key].append(v)
        parts += [r1, {'form': 'stroke', 'at_s': round(cut, 2), 'day': character['break_day']}, r2]
    else:
        raise ValueError(f'Unison has no {form} form here; the standing form is unison.render')
    n = max(v.shape[1] for vs in stems.values() for v in vs)
    target = {'pedal': -19.0, 'strings': -17.5, 'brass': -21.0, 'said': -21.0, 'blocks': -17.0, 'stroke': -18.0}
    mix = np.zeros((2, n))
    for key, vs in stems.items():
        m = np.zeros((2, n))
        for v in vs:
            m[:, :v.shape[1]] += v
        mix += lev(m, target[key])
    end = max(p.get('to_s', p.get('at_s', 0.0)) for p in parts) + 7.0
    mix = mix[:, :int(end * SR)]
    mix = fade(mix, 0.01, 2.0)
    return base.level(mix, -16.0), {'field': 'war', 'week': ledger.WEEK, 'round': ledger.ROUND, 'form': form,
                                   'tuning': 'A1 = 55 Hz, harmonics 8 to 15', 'peak_agreement': PEAK, 'parts': parts,
                                   'library': 'VSCO 2 CE 1.1.0 (CC0)'}
