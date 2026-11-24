"""Probe 15: Overlooked. Week 45 for a chamber ensemble in just intonation (method doc, "Music first").

  the material  each day, the most overlooked headline of all thirteen fields: the speakable one (four words or
                more) with the lowest attention on its own platform that day (common11.attention_keys), on a tie
                the one from the field the day named least, and only from a field not heard yet this week, so the
                ensemble grows by one instrument a day; and the day's four most attended headlines, for the murmur
  tuning        just intonation on A: the harmonic scale 8 to 15 of A1 = 55 Hz in every octave; every recorded
                note (VSCO 2 CE, sampler.py) tuned exactly
  pulse         eighths of 0.2 s, bars of eight; a day lasts 28 bars
  a day         a tubular bell; the headline said once in its field's Ducking voice; the field's instrument answers
                with the speech melody in the speech's own rhythm (each syllable's spoken pitch, its interval to the
                line's median widened by half, on the nearest note of the scale); then the melody becomes a motif on
                the pulse (the headline's opening, at most sixteen syllables and three bars, onsets to the nearest eighth) and the ensemble takes it up:
                the violins in canon three eighths later (4 bars on), the violas five eighths later an octave down
                (8 bars on), the piano pulsing its two lowest notes (12 bars on), cellos and basses holding A and the
                motif's floor (14 bars on)
  the week      earlier days' motifs keep sounding in their instruments, 4 dB softer for each day of age and
                stepping back while a new day's sentence is said and answered, their loops of
                different lengths drifting against each other; under everything the day's most attended headlines
                murmur, granulated, low-passed and far, and give way as the overlooked gather
  the end       on Sunday, from bar 20, all seven motifs together and the brass on A's harmonic chord; a cut;
                silence; Monday's headline once more, alone, and one high violin note
  level         -16 LUFS, -1 dBTP; a stereo ensemble in a hall

  the devices   (from 2026-11-23, itw/progression.py: each album keeps the devices of the album before and adds one;
                with none the piece is exactly the standing form above)
    inversion       the violas play the motif upside down, mirrored about its first note on the scale
    diminution      the piano plays the motif at twice the speed instead of pulsing its two lowest notes
    augmentation    cellos and basses play the motif at half the speed instead of holding A and its floor
    second subject  the horns play the motif the album before ended on, from the violins' entry to the day's end
    stretto         the ensemble takes the motif up twice as soon (2, 4, 6 and 7 bars on), the canon one and two
                    eighths behind instead of three and five
    retrograde      the violins play the motif backwards

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
PULSE = 0.2
BAR = 8 * PULSE
DAY_BARS = 28
INTRO_BARS = 2
F0 = 55.0
SCALE = sorted(F0 * h * 2 ** k for h in range(8, 16) for k in range(-4, 3))
WIDEN = 1.5
SOLOIST = {'nature': ('FluteSusVib', 700), 'economy': ('BassoonSus', 160), 'climate': ('OboeSusVib', 560),
           'war': ('FHornSus', 260), 'power': ('TromboneSus', 200), 'hunger': ('SViolinVib', 620),
           'ai': ('ClarinetSus', 400), 'health': ('CelloEnsSusVib', 220), 'democracy': ('TrumpetSus', 500),
           'displacement': ('ViolaEnsSusVib', 330), 'information': ('PiccoloSus', 1300), 'inequality': ('TubaSus', 90),
           'poverty': ('ContrabassSusVB', 80)}
PAN = {'violins': -0.45, 'violas': 0.15, 'cellos': 0.35, 'basses': 0.5, 'piano': -0.2, 'bells': 0.0, 'horns': 0.3}
# when each part of the ensemble takes a day's motif up (bars after the motif begins) and how far the canon trails
# (eighths): the standing form, and the stretto
ENTRIES = {'violins': 4, 'violas': 8, 'piano': 12, 'low': 14}
ENTRIES_STRETTO = {'violins': 2, 'violas': 4, 'piano': 6, 'low': 7}
CANON = {'violins': 3, 'violas': 5}
CANON_STRETTO = {'violins': 1, 'violas': 2}


def pan(x: np.ndarray, p: float) -> np.ndarray:
    m = x.mean(axis=0) if x.ndim == 2 else x
    a = (p + 1) * math.pi / 4
    if x.ndim == 2:                                             # keep the recording's own stereo, leaned to one side
        return np.stack([x[0] * math.cos(a) * 1.41, x[1] * math.sin(a) * 1.41])
    return np.stack([m * math.cos(a), m * math.sin(a)])


def nearest(hz: float, lo: float, hi: float) -> float:
    pool = [f for f in SCALE if lo <= f <= hi]
    return min(pool, key=lambda f: abs(math.log2(f / hz)))


# ---------------------------------------------------------------------------------------------
# The material
# ---------------------------------------------------------------------------------------------
def the_week(days_so_far: list[str] | None = None) -> list[dict]:
    ledger.use_days(days_so_far)
    rnd = base.load(f'src/data/ducking/rounds/{ledger.ROUND}.json')
    fields = {ch['id']: ledger.field_week(ch['id']) for ch in rnd['channels']}
    named_newest = {fid: wk[-1]['count'] > 0 for fid, (ch, wk) in fields.items()}
    days = []
    for i, day in enumerate(ledger.DAYS):
        pool = []
        for fid, (ch, wk) in fields.items():
            for s in wk[i]['signals']:
                if s['readable'] and len(s['text'].split()) >= 4:
                    pool.append((s['attention'], wk[i]['count'], fid, ch['voice'], s))
        # the least attended headline of a field not heard yet this week (the ensemble grows by one instrument a
        # day); on a tie, the one from the field the day named least
        pool.sort(key=lambda x: (x[0], x[1], x[2], x[4]['text']))
        used = {d['field'] for d in days}
        low = next((x for x in pool if x[2] not in used), pool[0])
        top = sorted(pool, key=lambda x: (-x[0], -x[1], x[2], x[4]['text']))
        attended, seen = [], set()
        for x in top:
            if x[4]['text'] not in seen and x[4]['text'] != low[4]['text']:
                seen.add(x[4]['text'])
                attended.append(x)
            if len(attended) == 4:
                break
        days.append({'day': day, 'field': low[2], 'voice': low[3], 'text': low[4]['text'], 'attention': low[0],
                     'named_on_newest_day': named_newest[low[2]],
                     'source': low[4]['source'], 'attended': [{'field': a[2], 'text': a[4]['text'], 'attention': a[0]} for a in attended]})
    return days


def syllable_pitches(raw: np.ndarray, count: int) -> list[dict]:
    syl = speechlib.syllables(raw, count)
    if len(syl) >= 0.6 * count:
        return [{'t': s['a'] / SR, 'hz': s['hz']} for s in syl]
    f0, times = speechlib.yin(resample_poly(raw, 1, 3))
    voiced = np.where(f0 > 0)[0]
    if len(voiced) < count:
        return [{'t': s['a'] / SR, 'hz': s['hz']} for s in syl]
    edges = np.linspace(voiced[0], voiced[-1] + 1, count + 1).astype(int)
    out = []
    for a, b in zip(edges, edges[1:]):
        hz = f0[a:b][f0[a:b] > 0]
        out.append({'t': float(times[a]), 'hz': float(np.median(hz)) if len(hz) else 0.0})
    return out


def melody(d: dict) -> dict:
    speech = base.speak(d['text'], d['voice'])
    syl = syllable_pitches(speech, speechlib.syllable_count(base.fold(d['text']), 'en-us'))
    hz = [s['hz'] for s in syl if s['hz'] > 0]
    med = float(np.median(hz)) if hz else 150.0
    inst, centre = SOLOIST[d['field']]
    lo, hi = centre / 2 ** 1.2, centre * 2 ** 1.2
    notes = []
    for k, s in enumerate(syl):
        semis = 12 * math.log2(s['hz'] / med) if s['hz'] > 0 else 0.0
        notes.append({'t': s['t'], 'hz': nearest(centre * 2 ** (WIDEN * semis / 12), lo, hi)})
    steps, last = [], -1
    head = [n for n in notes if n['t'] - notes[0]['t'] < 3 * BAR - PULSE][:16]
    for n in head:
        st = max(last + 1, int(round(n['t'] / PULSE)))
        steps.append(st)
        last = st
    length = 8 * math.ceil((steps[-1] + 2) / 8)
    motif = [{'step': st, 'hz': n['hz'], 'eighths': (steps[k + 1] if k + 1 < len(steps) else length) - st}
             for k, (st, n) in enumerate(zip(steps, head))]
    return {'speech': speech, 'echo': notes, 'motif': motif, 'length': length, 'instrument': inst,
            'speech_seconds': len(speech) / SR}


# ---------------------------------------------------------------------------------------------
# The piece
# ---------------------------------------------------------------------------------------------
def inverted(motif: list[dict]) -> list[dict]:
    """The motif upside down: every note mirrored about the first (its interval to the first turned round), on the
    nearest tone of the scale, its rhythm kept."""
    first = motif[0]['hz']
    return [{**nt, 'hz': nearest(first * first / nt['hz'], 20.0, 5000.0)} for nt in motif]


def backwards(motif: list[dict], length: int) -> list[dict]:
    """The motif from its last note to its first, each note as long as before, in a loop of the same length."""
    out = [{**nt, 'step': length - nt['step'] - nt['eighths']} for nt in motif]
    return sorted(out, key=lambda nt: nt['step'])


def scaled(motif: list[dict], factor: float) -> list[dict]:
    """The motif at another speed: factor 2 twice as slow (augmentation), 0.5 twice as fast (diminution)."""
    return [{**nt, 'step': nt['step'] * factor, 'eighths': nt['eighths'] * factor} for nt in motif]


def render(days_so_far: list[str] | None = None, hindsight: bool = False, devices: tuple[str, ...] | list[str] = (),
           second: dict | None = None) -> tuple[np.ndarray, dict]:
    """The piece for the days so far (an edition) or the whole week. With hindsight, an earlier day's motif keeps
    sounding after its own day only if the newest day still names its field, and is missing from the tutti if not.
    `devices` are the album's (itw/progression.py, the module docstring above); `second` is the second subject, the
    motif the album before ended on, when that device is in force."""
    dev = set(devices)
    if 'second subject' in dev and not second:
        raise ValueError('the second subject needs the motif the album before ended on')
    entry_bars = ENTRIES_STRETTO if 'stretto' in dev else ENTRIES
    canon = CANON_STRETTO if 'stretto' in dev else CANON
    week = the_week(days_so_far)
    mel = [melody(d) for d in week]
    inst = {k: sampler.Instrument(v) for k, v in {
        'violins': 'ViolinEnsSpic', 'violas': 'ViolaEnsSpic', 'cellos': 'CelloEnsSusVib', 'basses': 'ContrabassSusVB',
        'piano': 'UprightPiano', 'bells': 'TubularBells', 'horn': 'FHornSus', 'trombone': 'TromboneSus',
        'violin_solo': 'SViolinVib'}.items()}
    solo = {i: sampler.Instrument(m['instrument']) for i, m in enumerate(mel)}
    day0 = lambda i: (INTRO_BARS + i * DAY_BARS) * BAR
    end_music = day0(len(week))
    tutti_at = day0(len(week) - 1) + 20 * BAR                # where the second subject gives way to the tutti
    coda_at = end_music + 2.4
    n = int((coda_at + 18.0) * SR)
    ens, voice, murmur, aged = np.zeros((2, n)), np.zeros((2, n)), np.zeros((2, n)), np.zeros((2, n))
    density = np.zeros(n)
    log, origins = [], []

    def put(buf, t, sig, gain=1.0):
        base.place(buf, int(round(t * SR)), sig * gain)

    def motif_loop(i: int, start: float, stop: float, which, vel: int, shift8: int = 0, transpose: float = 1.0,
                   p: float = 0.0, lo: float = 30.0, hi: float = 4000.0, key: str = '', origin: float | None = None,
                   buf=None, gain: float = 1.0, notes: list[dict] | None = None, length: float | None = None):
        """The motif looped from `origin` (its first downbeat), sounding only between start and stop, so a loop
        split into segments keeps its phase. `notes` and `length` (eighths) play another form of it: inverted,
        backwards, slower or faster, or the second subject."""
        m = mel[i]
        L = (m['length'] if length is None else length) * PULSE
        origin = start if origin is None else origin
        t = origin + max(0, math.floor((start - origin) / L) - 1) * L
        while t < stop - 0.05:
            for nt in (m['motif'] if notes is None else notes):
                at = t + (nt['step'] + shift8) * PULSE
                if at < start or at >= stop:
                    continue
                hz = nt['hz'] * transpose
                while hz < lo:
                    hz *= 2
                while hz > hi:
                    hz /= 2
                dur = max(0.12, 0.9 * nt['eighths'] * PULSE)
                put(ens if buf is None else buf, at, pan(which.note(hz, dur, vel, key=f'{key}{nt["step"]}'), p), gain)
                a = int(at * SR)
                density[a:a + int(dur * SR)] += vel / 127
            t += L

    # the days
    for i, (d, m) in enumerate(zip(week, mel)):
        t0 = day0(i)
        t_end = end_music if i == len(week) - 1 else day0(i + 1)
        put(ens, t0, pan(inst['bells'].note(440.0, 3.0, 70, release=2.5), PAN['bells']))
        put(voice, t0 + 0.4, np.stack([m['speech'], m['speech']]) * 0.32)
        echo_at = t0 + 0.4 + m['speech_seconds'] + 0.4
        for k, nt in enumerate(m['echo']):                      # the instrument answers in the speech's rhythm
            nxt = m['echo'][k + 1]['t'] if k + 1 < len(m['echo']) else nt['t'] + 0.6
            put(ens, echo_at + nt['t'], pan(solo[i].note(nt['hz'], max(0.15, nxt - nt['t']), 100, key=f'echo{k}'), 0.08 * (-1) ** i))
        motif_bar = math.ceil((echo_at + m['speech_seconds'] + 0.4 - t0) / BAR)
        mt = t0 + motif_bar * BAR
        stop = end_music
        last = i == len(week) - 1
        origins.append(mt)
        # when each part of the ensemble takes the motif up (named, and recorded below, for the page's score)
        entries = {part: mt + bars * BAR for part, bars in entry_bars.items()}
        motif_loop(i, entries['violins'], t_end, inst['violins'], 74, shift8=canon['violins'], lo=300, hi=1400, p=PAN['violins'], key=f'v{i}',
                   notes=backwards(m['motif'], m['length']) if 'retrograde' in dev else None)
        motif_loop(i, entries['violas'], t_end, inst['violas'], 70, shift8=canon['violas'], transpose=0.5, lo=150, hi=700, p=PAN['violas'], key=f'a{i}',
                   notes=inverted(m['motif']) if 'inversion' in dev else None)
        lows = sorted({nt['hz'] for nt in m['motif']})[:2]
        piano_from = entries['piano']
        if 'diminution' in dev:                                  # the piano: the motif at twice the speed
            motif_loop(i, piano_from, t_end, inst['piano'], 64, p=PAN['piano'], lo=130, hi=1000, key=f'p{i}d',
                       notes=scaled(m['motif'], 0.5), length=m['length'] / 2)
        t = piano_from
        k = 0
        while t < t_end - 0.05 and 'diminution' not in dev:      # the piano pulse
            hz = lows[k % len(lows)]
            while hz > 500:
                hz /= 2
            while hz < 130:
                hz *= 2
            vel = int(46 + 30 * min(1.0, (t - piano_from) / max(1e-9, t_end - piano_from)))
            put(ens, t, pan(inst['piano'].note(hz, 0.18, vel, release=0.25, key=f'p{k % 4}'), PAN['piano']))
            t += PULSE
            k += 1
        floor = min(nt['hz'] for nt in m['motif'])
        while floor > 130:
            floor /= 2
        if 'augmentation' in dev:                                # cellos and basses: the motif at half the speed
            slow = scaled(m['motif'], 2.0)
            motif_loop(i, entries['low'], t_end, inst['cellos'], 66, p=PAN['cellos'], lo=90, hi=260, key=f'c{i}', notes=slow, length=m['length'] * 2)
            motif_loop(i, entries['low'], t_end, inst['basses'], 62, p=PAN['basses'], lo=41, hi=130, key=f'b{i}', notes=slow, length=m['length'] * 2)
        t = entries['low']
        while t < t_end - 0.05 and 'augmentation' not in dev:   # cellos and basses: A and the motif's floor
            put(ens, t, pan(inst['cellos'].note(110.0, 2 * BAR * 0.98, 64, release=0.6), PAN['cellos']))
            put(ens, t, pan(inst['basses'].note(max(41.2, floor / 2 if floor > 82 else floor), 2 * BAR * 0.98, 60, release=0.6), PAN['basses']))
            t += 2 * BAR
        if 'second subject' in dev:                              # the horns: the motif the album before ended on
            motif_loop(i, entries['violins'], min(t_end, tutti_at) if last else t_end, inst['horn'], 60, p=PAN['horns'],
                       lo=110, hi=440, key=f'h{i}', notes=second['motif'], length=second['eighths'])
        # the murmur of the most attended, granulated and far
        span = t_end - t0
        for k, a in enumerate(d['attended']):
            sp = base.speak(a['text'], base.voice_for(a['text']))
            dur = span / len(d['attended'])
            mm = int(dur * SR)
            semis = grains.glide_curve(mm, -5.0, -0.4)
            g = grains.granulate(sp, mm, semis, np.random.default_rng(base.seed('murmur', d['day'], str(k))))
            env = np.minimum(1, np.arange(mm) / (1.0 * SR)) * np.minimum(1, (mm - np.arange(mm)) / (1.0 * SR))
            put(murmur, t0 + k * dur, np.stack([g * env, 0.9 * g * env]) * 0.25)
        log.append({**{k: v for k, v in d.items()}, 'instrument': m['instrument'], 'motif_eighths': m['length'],
                    'motif': [{'step': nt['step'], 'hz': round(nt['hz'], 2)} for nt in m['motif']],
                    'from_s': round(t0, 2), 'motif_from_s': round(mt, 2),
                    # for the score on the page (src/lib/ill-tempered-week/score-overlooked.ts), recorded since
                    # 2026-11-14: how long the sentence is said, the answer's notes (seconds into the sentence, Hz)
                    # and when each part of the ensemble takes the motif up
                    'speech_s': round(m['speech_seconds'], 3),
                    'echo': [{'t': round(nt['t'], 3), 'hz': round(nt['hz'], 2)} for nt in m['echo']],
                    'entries_s': {part: round(at, 2) for part, at in entries.items()}})
    # every day's motif keeps sounding in its instrument to the end, softer by each day of age (12 velocity steps,
    # down to 40), and all of them at full strength in Sunday's tutti from bar 20
    tutti = day0(len(week) - 1) + 20 * BAR
    silenced = []
    for i in range(len(week)):
        keeps = not hindsight or i == len(week) - 1 or week[i]['named_on_newest_day']
        if not keeps:
            silenced.append(week[i]['field'])
        for j in range(i, len(week)):
            if j > i and not keeps:
                break
            a = origins[i] if j == i else day0(j)
            b = end_music if j == len(week) - 1 else day0(j + 1)
            if j == len(week) - 1:
                b = min(b, tutti)
            motif_loop(i, a, b, solo[i], max(46, 92 - 8 * (j - i)), p=0.08 * (-1) ** i, key=f's{i}', origin=origins[i],
                       buf=ens if j == i else aged, gain=10 ** (-4.0 * (j - i) / 20))
        if keeps:
            motif_loop(i, tutti, end_music, solo[i], 104, p=0.08 * (-1) ** i, key=f't{i}', origin=origins[i])

    # Sunday: the brass on A's harmonic chord under the tutti, then the cut
    for h, which in ((4, 'horn'), (5, 'horn'), (6, 'trombone'), (7, 'trombone')):
        hz = F0 * h
        while hz > 400:
            hz /= 2
        put(ens, tutti, pan(inst[which].note(hz, end_music - tutti, 96, release=0.08), 0.25 if which == 'horn' else -0.25))
    cut = int(end_music * SR)
    ens[:, cut:] *= 0.0
    murmur[:, cut:] *= 0.0
    # the coda: Monday's sentence once more, alone, and one high violin note
    put(voice, coda_at, np.stack([mel[0]['speech'], mel[0]['speech']]) * 0.28)
    put(ens, coda_at + mel[0]['speech_seconds'] + 0.8, pan(inst['violin_solo'].note(880.0, 6.0, 60, release=3.0), 0.0))

    # each new day the older motifs step back while the new sentence is said and answered, and return over three bars
    duck = np.ones(n)
    for i in range(1, len(week)):
        a, b = int((day0(i) - 0.3) * SR), int(origins[i] * SR)
        duck[a:b] = 0.22
        r = int(3 * BAR * SR)
        duck[b:b + r] = np.minimum(duck[b:b + r], np.linspace(0.22, 1.0, r)[:len(duck[b:b + r])])
    duck = np.convolve(duck, np.ones(int(0.2 * SR)) / int(0.2 * SR), mode='same')
    aged *= duck
    ens += aged

    # the murmur gives way as the overlooked gather
    dens = np.convolve(density, np.ones(int(0.5 * SR)) / int(0.5 * SR), mode='same')
    murmur *= 1.0 / (1.0 + 0.6 * dens / max(1e-9, np.percentile(dens[dens > 0], 90) if (dens > 0).any() else 1.0))
    murmur = pb.Pedalboard([pb.LowpassFilter(900), pb.Reverb(room_size=0.95, damping=0.5, wet_level=0.7, dry_level=0.2, width=1.0)])(
        murmur.astype(np.float32), SR).astype(np.float64)
    ens = pb.Pedalboard([pb.HighpassFilter(35), pb.Reverb(room_size=0.82, damping=0.45, wet_level=0.26, dry_level=0.85, width=1.0)])(
        ens.astype(np.float32), SR).astype(np.float64)
    voice = pb.Pedalboard([pb.HighpassFilter(90), pb.Reverb(room_size=0.3, wet_level=0.08, dry_level=1.0)])(
        voice.astype(np.float32), SR).astype(np.float64)
    meter = pyloudnorm.Meter(SR)
    def lev(x, target):
        L = meter.integrated_loudness(x.T)
        return x * 10 ** ((target - L) / 20) if np.isfinite(L) else x
    mix = lev(ens, -17.0) + lev(voice, -19.0) + lev(murmur, -31.0)
    return base.level(mix, -16.0), {'week': ledger.WEEK, 'tuning': 'just, harmonics 8-15 of A1 = 55 Hz', 'pulse_s': PULSE,
                                 'day_bars': DAY_BARS, 'days_so_far': len(week), 'newest_day': week[-1]['day'],
                                 'round': ledger.ROUND, 'hindsight': hindsight, 'silenced_after_their_day': silenced,
                                 'tutti_from_s': round(tutti, 2), 'cut_s': round(end_music, 2), 'coda_s': round(coda_at, 2),
                                 'days': log, 'library': 'VSCO 2 CE 1.1.0 (CC0)',
                                 # from 2026-11-23 (itw/progression.py): the album's devices, where the ensemble enters
                                 # and how far the canon trails, and the second subject when it is in force
                                 'devices': list(devices), 'entry_bars': dict(entry_bars), 'canon_eighths': dict(canon),
                                 **({'second': second} if 'second subject' in dev else {})}
