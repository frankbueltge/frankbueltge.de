"""Turn in the week's forms (method doc, "The week chooses its form"; heard as probe 33 on 2026-11-16).

The question stays: when did the week turn? The rhythmicon is the standing one (turn.py): each platform family
pulses as many beats of the bar as its harmonic number, sounding as many of them as it had AI signals; the turn is
the first day from Wednesday on with at least twice the mean count of the days before, and it opens with one bar in
which every family sings all its beats, then a bar of silence in which its most attended AI headline is said.

  held      one tempo for the whole week (2.4 s a bar) and one pattern, the families' mean daily counts; four bars a
            day; the days differ only in how dense the ticks are, and the turn is the one event
  mosaic    each day its own block: its own tempo (2.4 s x the square root of the week's mean count over the day's),
            its own pattern (the day's counts) and its own register (an octave up for a day at least twice the mean,
            down for one at most half); five bars, then a cut and 1.2 s of silence
  break     the days before the break held, a cut, the days from it on as a mosaic
  handover  held; from the day the lead passes the whole rhythmicon sounds a whole tone higher (9/8)
"""
import math

import numpy as np
import pedalboard as pb

from . import base, ledger, vowels
from .forms import SR, F0, handover_day, lev, mono_said
from .turn import HARM, PAN, bell, euclid, pan, sub, tick

FAMILIES = ('search', 'news', 'social', 'tech')
BAR = 2.4
HELD_BARS = 4
MOSAIC_BARS = 5
GAP_S = 1.2


def turn_day(week: list[dict]) -> int | None:
    counts = [d['count'] for d in week]
    for i in range(2, len(counts)):
        if counts[i] >= 2 * float(np.mean(counts[:i])):
            return i
    return None


def said_of(d: dict) -> str | None:
    readable = [s for s in d['signals'] if s['readable'] and len(s['text'].split()) >= 4]
    return max(readable, key=lambda s: (s['attention'], s['text']))['text'] if readable else None


def plan_held(week: list[dict], idx: list[int], t: float, turned: int | None, ratio_from: int | None) -> tuple[list, float]:
    mean = {f: sum(week[i]['families'].get(f, 0) for i in idx) / len(idx) for f in FAMILIES}
    pulses = {f: min(HARM[f], round(mean[f])) for f in FAMILIES}
    bars = []
    for i in idx:
        ratio = 9 / 8 if ratio_from is not None and i >= ratio_from else 1.0
        if i == turned:
            bars += [{'from_s': t, 's': BAR, 'day': i, 'kind': 'all', 'pulses': dict(HARM_4), 'ratio': ratio},
                     {'from_s': t + BAR, 's': 2 * BAR, 'day': i, 'kind': 'said', 'pulses': {}, 'ratio': ratio}]
            t += 3 * BAR
        for _ in range(HELD_BARS):
            bars.append({'from_s': t, 's': BAR, 'day': i, 'kind': 'bar', 'pulses': pulses, 'ratio': ratio})
            t += BAR
    return bars, t


def plan_mosaic(week: list[dict], idx: list[int], t: float, turned: int | None) -> tuple[list, float]:
    mean = sum(week[i]['count'] for i in idx) / len(idx)
    bars = []
    for i in idx:
        d = week[i]
        L = BAR * math.sqrt(mean / max(1, d['count']))
        r = d['count'] / max(1e-9, mean)
        octave = 1 if r >= 2 else -1 if r <= 0.5 else 0
        pulses = {f: min(HARM[f], d['families'].get(f, 0)) for f in FAMILIES}
        if i == turned:
            bars += [{'from_s': t, 's': L, 'day': i, 'kind': 'all', 'pulses': dict(HARM_4), 'octave': octave},
                     {'from_s': t + L, 's': 2 * L, 'day': i, 'kind': 'said', 'pulses': {}, 'octave': octave}]
            t += 3 * L
        for _ in range(MOSAIC_BARS):
            bars.append({'from_s': t, 's': L, 'day': i, 'kind': 'bar', 'pulses': pulses, 'octave': octave})
            t += L
        bars.append({'from_s': t, 's': GAP_S, 'day': i, 'kind': 'cut', 'pulses': {}, 'octave': octave})
        t += GAP_S
    return bars, t


HARM_4 = {f: HARM[f] for f in FAMILIES}


def render(form: str, character: dict) -> tuple[np.ndarray, dict]:
    ledger.use_days(ledger.DAYS)
    ch, week = ledger.field_week('ai')
    turned = turn_day(week)
    all_days = list(range(len(week)))
    t0 = 1.0
    if form == 'held':
        bars, end = plan_held(week, all_days, t0, turned, None)
    elif form == 'handover':
        bars, end = plan_held(week, all_days, t0, turned, handover_day(character['leads']))
    elif form == 'mosaic':
        bars, end = plan_mosaic(week, all_days, t0, turned)
    elif form == 'break':
        k = next(i for i, d in enumerate(week) if d['day'] == character['break_day'])
        b1, t = plan_held(week, all_days[:k], t0, turned, None)
        b2, end = plan_mosaic(week, all_days[k:], t + GAP_S, turned)
        bars = b1 + [{'from_s': t, 's': GAP_S, 'day': k, 'kind': 'cut', 'pulses': {}}] + b2
    else:
        raise ValueError(f'Turn has no {form} form here; the standing form is turn.render')
    n = int((end + 8.0) * SR)
    voices, ground, ticks, voice = (np.zeros((2, n)) for _ in range(4))
    rng = np.random.default_rng(base.seed('turn', ledger.WEEK, form))
    peak = max(d['count'] for d in week)
    said = {}
    for b in bars:
        d = week[b['day']]
        start, L = b['from_s'], b['s']
        mult = b.get('ratio', 1.0) * 2.0 ** b.get('octave', 0)
        if b['kind'] == 'cut':
            continue
        if b['kind'] == 'said':
            text = said_of(d)
            if text:
                said[d['day']] = text
                base.place(voice, int((start + 0.2) * SR), mono_said(text, ch['voice']) * 0.35)
            continue
        for f, k in b['pulses'].items():
            h = HARM[f]
            for step in euclid(k, h):
                note = vowels.sung(f, base.hz_of(f, 0) * mult, min(0.4, 0.85 * L / h))
                base.place(voices, int((start + step * L / h) * SR), pan(note, PAN[f]))
        base.place(ground, int(start * SR), pan(sub(F0 * mult), 0.0) * 0.9)
        fams = [f for f, k in b['pulses'].items() if k]
        if fams:
            base.place(ground, int(start * SR), pan(bell(sorted(base.hz_of(f, 1) * mult for f in fams)), 0.0) * 0.25)
        for s in range(36):
            if rng.random() < 0.15 + 0.7 * d['count'] / peak:
                base.place(ticks, int((start + s * L / 36) * SR), pan(tick(rng), float(rng.uniform(-0.8, 0.8))) * 0.5)
    tail = np.arange(int(6.0 * SR)) / SR
    last = next(b for b in reversed(bars) if b['kind'] != 'cut')
    lm = last.get('ratio', 1.0) * 2.0 ** last.get('octave', 0)
    a_low = np.sin(2 * np.pi * F0 * lm * tail) * np.exp(-tail / 2.0) + 0.4 * np.sin(2 * np.pi * 2 * F0 * lm * tail) * np.exp(-tail / 1.5)
    stop = last['from_s'] + last['s']
    base.place(ground, int(stop * SR), pan(a_low, 0.0) * 0.8)
    voices = pb.Pedalboard([pb.HighpassFilter(140), pb.Delay(delay_seconds=0.21, feedback=0.25, mix=0.18),
                            pb.Reverb(room_size=0.6, wet_level=0.2, dry_level=0.9, width=1.0)])(voices.astype(np.float32), SR).astype(np.float64)
    ground = pb.Pedalboard([pb.Reverb(room_size=0.5, wet_level=0.12, dry_level=0.95)])(ground.astype(np.float32), SR).astype(np.float64)
    ticks = pb.Pedalboard([pb.HighpassFilter(5000)])(ticks.astype(np.float32), SR).astype(np.float64)
    mix = lev(voices, -16.0) + lev(ground, -17.0) + lev(ticks, -27.0) + lev(voice, -17.0)
    for b in bars:                                              # a cut is silence: nothing rings on into it
        if b['kind'] == 'cut':
            mix[:, int(b['from_s'] * SR):int((b['from_s'] + b['s']) * SR)] = 0.0
    mix = mix[:, :int((stop + 6.5) * SR)]
    days = [{'day': d['day'], 'signals': d['count'], 'families': d['families'], 'turn': i == turned,
             'said': said.get(d['day'])} for i, d in enumerate(week)]
    return base.level(mix, -14.0), {'field': 'ai', 'week': ledger.WEEK, 'round': ledger.ROUND, 'form': form,
                                   'harmonics': HARM_4, 'turn_day': week[turned]['day'] if turned is not None else None,
                                   'bars': [{**b, 'from_s': round(b['from_s'], 3), 's': round(b['s'], 3)} for b in bars],
                                   'days': days}
