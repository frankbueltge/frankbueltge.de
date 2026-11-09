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
PAN = {'violins': -0.45, 'violas': 0.15, 'cellos': 0.35, 'basses': 0.5, 'piano': -0.2, 'bells': 0.0}


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
def render(days_so_far: list[str] | None = None, hindsight: bool = False) -> tuple[np.ndarray, dict]:
    """The piece for the days so far (an edition) or the whole week. With hindsight, an earlier day's motif keeps
    sounding after its own day only if the newest day still names its field, and is missing from the tutti if not."""
    week = the_week(days_so_far)
    mel = [melody(d) for d in week]
    inst = {k: sampler.Instrument(v) for k, v in {
        'violins': 'ViolinEnsSpic', 'violas': 'ViolaEnsSpic', 'cellos': 'CelloEnsSusVib', 'basses': 'ContrabassSusVB',
        'piano': 'UprightPiano', 'bells': 'TubularBells', 'horn': 'FHornSus', 'trombone': 'TromboneSus',
        'violin_solo': 'SViolinVib'}.items()}
    solo = {i: sampler.Instrument(m['instrument']) for i, m in enumerate(mel)}
    day0 = lambda i: (INTRO_BARS + i * DAY_BARS) * BAR
    end_music = day0(len(week))
    coda_at = end_music + 2.4
    n = int((coda_at + 18.0) * SR)
    ens, voice, murmur, aged = np.zeros((2, n)), np.zeros((2, n)), np.zeros((2, n)), np.zeros((2, n))
    density = np.zeros(n)
    log, origins = [], []

    def put(buf, t, sig, gain=1.0):
        base.place(buf, int(round(t * SR)), sig * gain)

    def motif_loop(i: int, start: float, stop: float, which, vel: int, shift8: int = 0, transpose: float = 1.0,
                   p: float = 0.0, lo: float = 30.0, hi: float = 4000.0, key: str = '', origin: float | None = None,
                   buf=None, gain: float = 1.0):
        """The motif looped from `origin` (its first downbeat), sounding only between start and stop, so a loop
        split into segments keeps its phase."""
        m = mel[i]
        L = m['length'] * PULSE
        origin = start if origin is None else origin
        t = origin + max(0, math.floor((start - origin) / L) - 1) * L
        while t < stop - 0.05:
            for nt in m['motif']:
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
        motif_loop(i, mt + 4 * BAR, t_end, inst['violins'], 74, shift8=3, lo=300, hi=1400, p=PAN['violins'], key=f'v{i}')
        motif_loop(i, mt + 8 * BAR, t_end, inst['violas'], 70, shift8=5, transpose=0.5, lo=150, hi=700, p=PAN['violas'], key=f'a{i}')
        lows = sorted({nt['hz'] for nt in m['motif']})[:2]
        piano_from = mt + 12 * BAR
        t = piano_from
        k = 0
        while t < t_end - 0.05:                                  # the piano pulse
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
        t = mt + 14 * BAR
        while t < t_end - 0.05:                                  # cellos and basses: A and the motif's floor
            put(ens, t, pan(inst['cellos'].note(110.0, 2 * BAR * 0.98, 64, release=0.6), PAN['cellos']))
            put(ens, t, pan(inst['basses'].note(max(41.2, floor / 2 if floor > 82 else floor), 2 * BAR * 0.98, 60, release=0.6), PAN['basses']))
            t += 2 * BAR
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
                    'from_s': round(t0, 2), 'motif_from_s': round(mt, 2)})
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
                                 'tutti_from_s': round(tutti, 2), 'cut_s': round(end_music, 2),
                                 'days': log, 'library': 'VSCO 2 CE 1.1.0 (CC0)'}
