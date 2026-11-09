"""Probe 17: Turn. AI and its harms, week 45: a rhythmicon of the platform families (method doc, "Probe 17").

  the rhythmicon  each platform family pulses its own subdivision of the bar, as many beats as its harmonic number
                  (search 5, news 6, social 7, tech 9: Cowell's idea of rhythm and pitch from one overtone series),
                  singing its vowel on that harmonic of A (probe 05's vowels, which Frank liked); how many of its
                  beats sound that day is the family's count of AI signals (spread evenly, Toussaint's euclidean
                  rhythm), so the bar fills as attention does
  the time        ten bars a day; a bar lasts 2.4 s x the square root of (the mean daily count so far / the day's
                  count): a busy day runs faster, a quiet one slower, and the tempo glides from day to day
  the turn        the day the week turned (at least twice the mean of the days before) begins with one bar in which
                  every family sings all its beats, then a bar of silence in which its most attended AI headline is
                  said, plainly
  ground          a sub on A1 and a bell chord of the day's families on every downbeat, noise ticks on the finest
                  subdivision as dense as the day's count against the week's busiest day
  the end         Sunday stops on a downbeat; one low A, fading
  level           -14 LUFS, -1 dBTP

"""
import collections
import math

import numpy as np
import pedalboard as pb
import pyloudnorm
from scipy.signal import resample_poly

from . import base, ledger, vowels

SR = base.SR
BARS = 10
BASE_BAR = 2.4
HARM = {'search': 5, 'news': 6, 'social': 7, 'tech': 9, 'reading': 4, 'markets': 11}
PAN = {'search': 0.35, 'news': -0.35, 'social': 0.65, 'tech': -0.65, 'reading': 0.1, 'markets': -0.1}


def euclid(k: int, n: int) -> list[int]:
    return sorted({(i * n) // k for i in range(k)}) if k > 0 else []


def pan(x: np.ndarray, p: float) -> np.ndarray:
    a = (p + 1) * math.pi / 4
    return np.stack([x * math.cos(a), x * math.sin(a)])


def bell(hzs: list[float], seconds: float = 1.6) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    for hz in hzs:
        mod = np.sin(2 * np.pi * hz * 3.5 * t) * 2.2 * np.exp(-t / 0.25)
        out += np.sin(2 * np.pi * hz * t + mod) * np.exp(-t / 0.9)
    return out / max(1e-9, np.abs(out).max())


def sub(hz: float = 55.0, seconds: float = 0.5) -> np.ndarray:
    n = int(seconds * SR)
    t = np.arange(n) / SR
    f = hz + 2.0 * hz * np.exp(-t / 0.025)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.22)
    return np.tanh(1.8 * x)


def tick(rng: np.random.Generator) -> np.ndarray:
    n = int(0.03 * SR)
    t = np.arange(n) / SR
    x = rng.standard_normal(n) * np.exp(-t / 0.004)
    return np.diff(np.concatenate([[0.0], x]))


def render() -> tuple[np.ndarray, dict]:
    ledger.use_days(ledger.DAYS)
    ch, week = ledger.field_week('ai')
    counts = [d['count'] for d in week]
    peak = max(counts)
    bars = []                                                  # (start, length, day index, kind)
    t = 1.0
    log = []
    turned = False
    for i, d in enumerate(week):
        so_far = counts[:i] or [d['count']]
        mean = float(np.mean(so_far))
        length = BASE_BAR * math.sqrt(mean / max(1, d['count']))
        is_turn = (not turned) and i >= 2 and d['count'] >= 2 * float(np.mean(counts[:i]))
        prev_len = bars[-1][1] if bars else length
        day_start = t
        if is_turn:
            turned = True
            bars.append((t, length, i, 'all'))
            t += length
            bars.append((t, length * 2, i, 'said'))
            t += length * 2
        for b in range(BARS):
            u = b / max(1, BARS - 1)
            L = prev_len + (length - prev_len) * min(1.0, u * 2)   # the tempo glides into the day's
            bars.append((t, L, i, 'bar'))
            t += L
        readable = [s for s in d['signals'] if s['readable'] and len(s['text'].split()) >= 4]
        top = max(readable, key=lambda s: (s['attention'], s['text'])) if readable else None
        log.append({'day': d['day'], 'signals': d['count'], 'families': d['families'], 'bar_s': round(length, 3),
                    'turn': is_turn, 'said': top['text'] if (is_turn and top) else None, 'from_s': round(day_start, 2)})
    n = int((t + 8.0) * SR)
    voices, ground, ticks, voice = (np.zeros((2, n)) for _ in range(4))
    rng = np.random.default_rng(base.seed('turn', ledger.WEEK))
    for (start, L, i, kind) in bars:
        d = week[i]
        fams = [f for f in ('search', 'news', 'social', 'tech') if d['families'].get(f) or kind == 'all']
        if kind == 'said':
            if log[i]['said']:
                x = base.speak(log[i]['said'], ch['voice'])
                base.place(voice, int((start + 0.2) * SR), np.stack([x, x]) * 0.35)
            continue
        for f in fams:
            h = HARM[f]
            k = h if kind == 'all' else min(h, d['families'].get(f, 0))
            for step in euclid(k, h):
                at = start + step * L / h
                note = vowels.sung(f, base.hz_of(f, 0), min(0.4, 0.85 * L / h))
                base.place(voices, int(at * SR), pan(note, PAN[f]))
        base.place(ground, int(start * SR), pan(sub(), 0.0) * 0.9)
        if fams:
            hz = sorted(base.hz_of(f, 1) for f in fams)
            base.place(ground, int(start * SR), pan(bell(hz), 0.0) * 0.25)
        dens = d['count'] / peak
        for s in range(36):
            if rng.random() < 0.15 + 0.7 * dens:
                base.place(ticks, int((start + s * L / 36) * SR), pan(tick(rng), float(rng.uniform(-0.8, 0.8))) * 0.5)
    end = bars[-1][0] + bars[-1][1]
    tail = np.arange(int(6.0 * SR)) / SR
    a_low = np.sin(2 * np.pi * 55.0 * tail) * np.exp(-tail / 2.0) + 0.4 * np.sin(2 * np.pi * 110.0 * tail) * np.exp(-tail / 1.5)
    base.place(ground, int(end * SR), pan(a_low, 0.0) * 0.8)
    voices = pb.Pedalboard([pb.HighpassFilter(140), pb.Delay(delay_seconds=0.21, feedback=0.25, mix=0.18),
                            pb.Reverb(room_size=0.6, wet_level=0.2, dry_level=0.9, width=1.0)])(voices.astype(np.float32), SR).astype(np.float64)
    ground = pb.Pedalboard([pb.Reverb(room_size=0.5, wet_level=0.12, dry_level=0.95)])(ground.astype(np.float32), SR).astype(np.float64)
    ticks = pb.Pedalboard([pb.HighpassFilter(5000)])(ticks.astype(np.float32), SR).astype(np.float64)
    meter = pyloudnorm.Meter(SR)

    def lev(x, target):
        L = meter.integrated_loudness(x.T)
        return x * 10 ** ((target - L) / 20) if np.isfinite(L) else x

    mix = lev(voices, -16.0) + lev(ground, -17.0) + lev(ticks, -27.0) + lev(voice, -17.0)
    mix = mix[:, :int((end + 6.5) * SR)]
    return base.level(mix, -14.0), {'field': 'ai', 'week': ledger.WEEK, 'round': ledger.ROUND, 'bars_per_day': BARS,
                                 'harmonics': HARM, 'days': log}
