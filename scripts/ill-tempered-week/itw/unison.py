"""Probe 16: Unison. War and violence, week 45, for string orchestra, brass and timpani (method doc, "Probe 16").

  a signal      every war signal of the day is one string glissando: its section by its attention on its platform
                (top quarter violins, then violas, cellos, the least attended quarter in the basses), its first
                pitch from its own headline's spoken pitch (twice the interval to the week's median, in the
                section's register), its entry at its publication hour within the day, its length and loudness
                growing with its attention; tremolo for the more attended half on days of 25 signals or more
  agreement     the share of the day's war signals naming its most named story; every glissando glides that far
                towards the nearest tone of A's harmonic chord (4:5:6:7 in every octave): full agreement would end
                in consonance, none would leave the cluster where it began
  the peak      from 30 % agreement on, a timpani roll swells and horns, trombones and tuba take up the chord at 24 s,
                as loud as the agreement, and the day's most attended war headline is said over it
  the overlooked after the peak a solo double bass plays the speech melody of the day's least attended war headline,
                untuned, in the speech's own rhythm: the one line outside the chord
  the week      a day lasts 36 s and begins with a timpani stroke on A; Sunday ends without agreement, and the last
                sound is the bass alone
  level         -16 LUFS, -1 dBTP; a stereo orchestra in a hall

"""
import collections
import math

import numpy as np
import pedalboard as pb
import pyloudnorm
from scipy.signal import resample_poly

from . import base, grains, ledger, sampler
from . import speech as speechlib

SR = base.SR
DAY_S = 36.0
INTRO_S = 2.0
PEAK_S = 24.0
F0 = 55.0
CHORD = sorted(F0 * h * 2 ** k for h in (4, 5, 6, 7) for k in range(-3, 4))
SECTIONS = [  # (lowest attention, name, sustain, tremolo, low Hz, high Hz, pan)
    (0.75, 'violins', 'ViolinEnsSusVib', 'ViolinEnsTrem', 400.0, 1250.0, -0.45),
    (0.50, 'violas', 'ViolaEnsSusVib', 'ViolaEnsTrem', 200.0, 650.0, 0.1),
    (0.25, 'cellos', 'CelloEnsSusVib', 'CelloEnsTrem', 90.0, 330.0, 0.35),
    (0.00, 'basses', 'ContrabassSusVB', 'ContrabassTrem', 42.0, 130.0, 0.55),
]


def pan(x: np.ndarray, p: float) -> np.ndarray:
    a = (p + 1) * math.pi / 4
    return np.stack([x[0] * math.cos(a) * 1.41, x[1] * math.sin(a) * 1.41]) if x.ndim == 2 else np.stack([x * math.cos(a), x * math.sin(a)])


def spoken_pitch(text: str) -> float:
    """The median pitch of the headline as the mass's voices say it (form_mass's voice for this text)."""
    voice = grains.SPEAKERS[base.seed(text) % len(grains.SPEAKERS)]
    x = base.speak(text, voice)
    f0, _ = speechlib.yin(resample_poly(x, 1, 3))
    v = f0[f0 > 0]
    return float(np.median(v)) if len(v) else 0.0


def nearest_chord(hz: float, lo: float, hi: float) -> float:
    pool = [f for f in CHORD if lo <= f <= hi] or CHORD
    return min(pool, key=lambda f: abs(math.log2(f / hz)))


def render() -> tuple[np.ndarray, dict]:
    ledger.use_days(ledger.DAYS)
    ch, week = ledger.field_week('war')
    pitches = {}
    for d in week:
        for s in d['signals']:
            if s['readable'] and s['text'] not in pitches:
                pitches[s['text']] = spoken_pitch(s['text'])
    voiced = [v for v in pitches.values() if v > 0]
    median = float(np.median(voiced))
    peak_count = max(d['count'] for d in week)
    inst = {}

    def get(name: str) -> sampler.Instrument:
        if name not in inst:
            inst[name] = sampler.Instrument(name)
        return inst[name]

    n = int((INTRO_S + 7 * DAY_S + 16.0) * SR)
    strings, brass, perc, voice, solo = (np.zeros((2, n)) for _ in range(5))

    def put(buf, t, sig, gain=1.0):
        base.place(buf, int(round(t * SR)), sig * gain)

    log = []
    for i, d in enumerate(week):
        t0 = INTRO_S + i * DAY_S
        sig = d['signals']
        terms = collections.Counter(t for s in sig for t in set(s['terms']))
        story, k = terms.most_common(1)[0]
        agree = k / len(sig)
        put(perc, t0, pan(get('Timpani').note(110.0, 2.5, 80, release=1.5), 0.0))
        events = []
        for j, s in enumerate(sig):
            sec = next(x for x in SECTIONS if s['attention'] >= x[0])
            _, name, sus, trem, lo, hi, p = sec
            centre = math.sqrt(lo * hi)
            sp = pitches.get(s['text'], 0.0) or median
            start = float(np.clip(centre * 2 ** (2 * math.log2(sp / median)), lo, hi))
            target = nearest_chord(start, lo, hi)
            end = start * (target / start) ** agree
            rng = np.random.default_rng(base.seed('unison', d['day'], s['source'], s['text'], str(j)))
            hour = s['hour'] if s['hour'] is not None else float(rng.uniform(0, 24))
            at = t0 + 1.0 + hour / 24.0 * (PEAK_S - 2.0) + float(rng.uniform(-0.3, 0.3))
            dur = 5.0 + 4.0 * s['attention']
            vel = int(48 + 50 * s['attention'])
            which = trem if (d['count'] >= 25 and s['attention'] >= 0.5) else sus
            g = sampler.glide(get(which), start, end, 0.8 * dur, vel, release=0.2 * dur + 0.4, key=f'{d["day"]}{j}')
            put(strings, at, pan(g, p + float(rng.uniform(-0.12, 0.12))))
            events.append({'at_s': round(at, 2), 'section': name, 'tremolo': which == trem, 'attention': s['attention'],
                           'from_hz': round(start, 1), 'to_hz': round(end, 1), 'chord_tone_hz': round(target, 1),
                           'text': s['text']})
        last = i == len(week) - 1
        peak = t0 + PEAK_S
        said = None
        readable = [s for s in sig if s['readable'] and len(s['text'].split()) >= 4]
        if agree >= 0.3 and not last:
            put(perc, peak - 6.0, pan(get('TimpaniRolls').note(110.0, 7.0, int(50 + 60 * d['count'] / peak_count), release=1.2), 0.0))
            for h, name_, pp in ((4, 'FHornSus', 0.25), (5, 'FHornSus', 0.3), (6, 'TromboneSus', -0.2), (7, 'TromboneSus', -0.25),
                                 (2, 'TubaSus', 0.05)):
                hz = F0 * h
                while hz > 400:
                    hz /= 2
                put(brass, peak, pan(get(name_).note(hz, 8.0, int(30 + 70 * agree), release=2.0), pp))
            top = max(readable, key=lambda s: (s['attention'], s['text']))
            said = top['text']
            x = base.speak(said, ch['voice'])
            put(voice, peak + 0.6, np.stack([x, x]) * 0.3)
        low = min(readable, key=lambda s: (s['attention'], s['text']))
        sp = base.speak(low['text'], ch['voice'])
        syl = speechlib.syllable_pitches(sp, speechlib.syllable_count(base.fold(low['text']), 'en-us'))
        hz = [x['hz'] for x in syl if x['hz'] > 0]
        med = float(np.median(hz)) if hz else 120.0
        solo_at = (t0 + DAY_S - 0.5) if last else (peak + 5.5)
        for q, x in enumerate(syl):
            nxt = syl[q + 1]['t'] if q + 1 < len(syl) else x['t'] + 0.9
            f = 82.0 * 2 ** (1.5 * math.log2((x['hz'] or med) / med))
            f = float(np.clip(f, 41.0, 175.0))
            put(solo, solo_at + x['t'] * 1.15, pan(get('ContrabassSusVB').note(f, max(0.2, (nxt - x['t']) * 1.15), 88,
                                                                                 release=0.35, key=f'b{i}{q}'), 0.0))
        log.append({'day': d['day'], 'signals': d['count'], 'story': story, 'agreement': round(agree, 3),
                    'peak': agree >= 0.3 and not last, 'said': said, 'overlooked': low['text'],
                    'overlooked_attention': low['attention'], 'events': events})

    strings = pb.Pedalboard([pb.HighpassFilter(35), pb.Reverb(room_size=0.88, damping=0.4, wet_level=0.3, dry_level=0.8, width=1.0)])(
        strings.astype(np.float32), SR).astype(np.float64)
    brass = pb.Pedalboard([pb.Reverb(room_size=0.88, damping=0.4, wet_level=0.35, dry_level=0.75, width=1.0)])(brass.astype(np.float32), SR).astype(np.float64)
    perc = pb.Pedalboard([pb.Reverb(room_size=0.85, damping=0.3, wet_level=0.3, dry_level=0.8, width=1.0)])(perc.astype(np.float32), SR).astype(np.float64)
    solo = pb.Pedalboard([pb.Reverb(room_size=0.6, damping=0.5, wet_level=0.18, dry_level=0.95, width=0.8)])(solo.astype(np.float32), SR).astype(np.float64)
    voice = pb.Pedalboard([pb.HighpassFilter(90), pb.Reverb(room_size=0.3, wet_level=0.06, dry_level=1.0)])(voice.astype(np.float32), SR).astype(np.float64)
    meter = pyloudnorm.Meter(SR)

    def lev(x, target):
        L = meter.integrated_loudness(x.T)
        return x * 10 ** ((target - L) / 20) if np.isfinite(L) else x

    mix = lev(strings, -17.5) + lev(brass, -21.0) + lev(perc, -22.0) + lev(voice, -20.0) + lev(solo, -21.0)
    end = int((INTRO_S + 7 * DAY_S + 12.0) * SR)
    mix = mix[:, :end]
    fade = int(2.0 * SR)
    mix[:, -fade:] *= np.linspace(1, 0, fade)
    return base.level(mix, -16.0), {'field': 'war', 'week': ledger.WEEK, 'round': ledger.ROUND, 'day_s': DAY_S,
                                 'chord': 'A harmonics 4:5:6:7', 'median_spoken_hz': round(median, 1), 'days': log,
                                 'library': 'VSCO 2 CE 1.1.0 (CC0)'}
