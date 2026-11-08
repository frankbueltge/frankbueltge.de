#!/usr/bin/env python3
"""Common Time: press one week of Common Ground into about two minutes of music.

docs/design/2026-11-08-common-time.md. Only Common Ground's committed day files sound
(src/data/trending/<day>.json), one section per day of an ISO week, Monday to Sunday:

  theme      the week's most persistent topic: its melody repeats once a bar on every day it was
             on the charts, and falls silent on a day it was not
  melody     each day's most converged other topic, at half speed, twice, in unison by the
             instrument of every platform family that carried it: the more agreement, the fuller
  ornaments  the day's other converging topics, one quiet note each
  crowd      every other signal on the sources, as a dark tick locked to the beat

A topic's melody is its name: the vowels of its label, as first recorded in the archive, on the
pentatonic F G A C D (u e i o a), Josquin's soggetto cavato without the fa, so that no two notes
in the piece are ever a semitone apart. Each platform family is one instrument. Tempo, chords,
bed, bass, beat, form and timbres are composed and the same every week. Every scale comes from
the archive up to the week's last day, and the levels are set on that archive's median day, so a
busy week is heard as one.

Writes public/common-time/<week>.m4a and src/data/common-time/<week>.json (the arrangement, with
the sha256 of every day file it read). Never rewrites a pressing that exists (the archive rule).
Nothing here calls a service; it is synthesis from numbers.

Setup, once:
  python3.12 -m venv .venv-common-time
  .venv-common-time/bin/pip install -r scripts/common-time/requirements.txt
  # ffmpeg for the AAC file (macOS: brew install ffmpeg; CI installs it with apt)

Run:
  python scripts/common-time/press.py               # every complete week that has no pressing yet
  python scripts/common-time/press.py 2026-W45      # this week, if it is complete and not pressed
  python scripts/common-time/press.py --hash 2026-W45   # render only, print the hashes, write nothing
"""
import argparse
import hashlib
import importlib.metadata
import io
import json
import platform
import re
import shutil
import subprocess
import sys
import tempfile
import unicodedata
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import pyloudnorm
import soundfile as sf
from scipy.ndimage import minimum_filter1d, uniform_filter1d
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

ROOT = Path(__file__).resolve().parent.parent.parent
LEDGER = ROOT / 'src/data/trending'
SCORES = ROOT / 'src/data/common-time'
AUDIO = ROOT / 'public/common-time'
CONTRACT = 'common-time/1'
RENDERER = '1'

SR = 48000
BPM = 120
BEAT = 60 / BPM
BAR = 4 * BEAT
EIGHTH = BEAT / 2
SIXTEENTH = BEAT / 4
INTRO_BARS = 2
DAY_BARS = 8
OUTRO_BARS = 2
TAIL_S = 3.0

# ---------------------------------------------------------------------------------------------
# The patch: composed, the same every week.
# ---------------------------------------------------------------------------------------------
F4 = 65
PENTATONIC = [0, 2, 4, 7, 9]                      # F G A C D
VOWEL = {'u': 0, 'e': 1, 'i': 2, 'o': 3, 'a': 4}  # ut re mi sol la; Josquin's a = fa is gone
MOTIF_MAX = 8
# Every chord uses only the pentatonic's notes: (name, [bass, bed...]) per bar.
PROGRESSION = [('F', [41, 57, 60, 65]), ('F', [41, 57, 60, 65]), ('Dm7', [38, 57, 60, 65]), ('Dm7', [38, 57, 60, 65]),
               ('Gsus4', [43, 55, 60, 62]), ('Gsus4', [43, 55, 60, 62]), ('Csus2', [36, 55, 60, 62]), ('Csus2', [36, 55, 60, 62])]

FAMILIES = ['reading', 'search', 'news', 'social', 'tech', 'markets']
INSTRUMENT = {'reading': 'vibraphone', 'search': 'electric piano', 'news': 'soft pad', 'social': 'marimba',
              'tech': 'bell', 'markets': 'pluck'}
REGISTER = {'reading': 12, 'search': 0, 'news': 0, 'social': 12, 'tech': 24, 'markets': -12}
FAMILY_LEVEL = {'reading': 1.0, 'search': 0.9, 'news': 0.55, 'social': 0.8, 'tech': 0.35, 'markets': 0.7}
PAN = {'reading': -0.25, 'search': 0.2, 'news': 0.0, 'social': 0.35, 'tech': -0.4, 'markets': 0.1}
PLATFORM_FAMILY = {
    'wikipedia': 'reading',
    'google_trends': 'search',
    'google_news': 'news',
    'bluesky': 'social', 'mastodon': 'social', 'reddit': 'social',
    'hackernews': 'tech', 'techmeme': 'tech', 'lobsters': 'tech', 'github': 'tech', 'github_trending': 'tech',
    'pypi': 'tech', 'huggingface': 'tech', 'devto': 'tech', 'arxiv': 'tech', 'producthunt': 'tech',
    'stackoverflow': 'tech',
    'polymarket': 'markets', 'appstore': 'markets', 'steam': 'markets', 'coingecko': 'markets',
}
FALLBACK_FAMILY = 'news'   # a publisher that is no platform is an outlet behind Google News

TARGET = {'theme': -22.0, 'melody': -20.0, 'ornaments': -30.0, 'crowd': -37.0, 'bass': -24.0, 'bed': -29.0,
          'kick': -24.0, 'hat': -35.0, 'reverb': -28.0, 'delay': -31.0}
SEND_REVERB = {'theme': 0.35, 'melody': 0.35, 'ornaments': 0.5, 'bed': 0.3, 'bass': 0.05, 'kick': 0.05}
SEND_DELAY = {'theme': 0.25, 'ornaments': 0.4}
DELAY_S = 0.75 * BEAT
DELAY_FEEDBACK = 0.35
RT60 = 2.4
SEED = 20261108
KICK_FROM_DAY, HAT_FROM_DAY = 1, 2      # zero-based: the beat enters on the second day, hats on the third
TARGET_LUFS = -14.0
CEILING_DBTP = -1.0
AAC_KBPS = 128


# ---------------------------------------------------------------------------------------------
# Weeks and the ledger
# ---------------------------------------------------------------------------------------------
def week_days(week: str) -> list[str]:
    m = re.fullmatch(r'(\d{4})-W(\d{2})', week)
    if not m:
        raise SystemExit(f'not an ISO week: {week} (expected e.g. 2026-W45)')
    return [date.fromisocalendar(int(m.group(1)), int(m.group(2)), d).isoformat() for d in range(1, 8)]


def ledger_days() -> list[str]:
    return sorted(p.stem for p in LEDGER.glob('*.json') if re.fullmatch(r'\d{4}-\d{2}-\d{2}', p.stem))


def complete_weeks() -> list[str]:
    """Every ISO week whose Monday and Sunday are both in the ledger."""
    days = set(ledger_days())
    if not days:
        return []
    first = date.fromisoformat(min(days))
    monday = first + timedelta(days=(7 - first.weekday()) % 7)
    out = []
    while (monday + timedelta(days=6)).isoformat() <= max(days):
        y, w, _ = monday.isocalendar()
        week = f'{y}-W{w:02d}'
        if monday.isoformat() in days and (monday + timedelta(days=6)).isoformat() in days:
            out.append(week)
        monday += timedelta(days=7)
    return out


def load_day(day: str) -> dict | None:
    p = LEDGER / f'{day}.json'
    return json.loads(p.read_text()) if p.exists() else None


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def family_of(publisher: str) -> str:
    return PLATFORM_FAMILY.get(publisher, FALLBACK_FAMILY)


def motif(label: str) -> list[list[float]]:
    """[scale step, length in eighths]: one note per vowel, a word's last vowel held twice as long."""
    text = unicodedata.normalize('NFKD', label).encode('ascii', 'ignore').decode().lower()
    notes = []
    for word in re.findall(r'[a-z]+', text):
        vs = [VOWEL[c] for c in word if c in VOWEL]
        for i, v in enumerate(vs):
            notes.append([v, 2.0 if i == len(vs) - 1 else 1.0])
    return (notes or [[0, 2.0]])[:MOTIF_MAX]


def read_archive(to: str) -> dict:
    """Everything the scales need, from the ledger up to and including `to`."""
    first_label, signals, converging = {}, [], []
    digest = hashlib.sha256()
    for day in ledger_days():
        if day > to:
            break
        path = LEDGER / f'{day}.json'
        digest.update(day.encode())
        digest.update(bytes.fromhex(sha256(path)))
        t = json.loads(path.read_text())
        for tp in t.get('topics', []):
            first_label.setdefault(tp['id'], (day, tp['label']))
        signals.append(sum(len(v) for v in t.get('signals', {}).values() if isinstance(v, list)))
        if isinstance(t.get('summary', {}).get('converging'), int):
            converging.append((day, t['summary']['converging']))
    median = int(np.median([c for _, c in converging]))
    return {'to': to, 'days': len(signals), 'files_sha256': digest.hexdigest(), 'first_label': first_label,
            'signals_max': max(signals), 'converging_median': median,
            'reference_day': max(d for d, c in converging if c == median)}


def read_day(day: str, arc: dict) -> dict:
    t = load_day(day)
    if t is None:
        return {'day': day, 'missing': True, 'topics': [], 'signals': 0}
    topics = []
    for rank, tp in enumerate(t.get('topics', [])):
        publishers = sorted({l['publisher'] for l in tp.get('links', [])})
        families = sorted({family_of(p) for p in publishers}, key=FAMILIES.index)
        first_day, label = arc['first_label'].get(tp['id'], (day, tp['label']))
        topics.append({'id': tp['id'], 'label': label, 'label_from': first_day, 'rank': rank,
                       'publishers': publishers, 'families': families, 'motif': motif(label)})
    signals = sum(len(v) for v in t.get('signals', {}).values() if isinstance(v, list))
    return {'day': day, 'missing': False, 'topics': topics, 'signals': signals,
            'sha256': sha256(LEDGER / f'{day}.json')}


def arrange(days: list[dict]) -> dict:
    """The theme is the topic on the most days; each day's melody is its most converged other topic."""
    present: dict[str, dict] = {}
    for d in days:
        for tp in d['topics']:
            p = present.setdefault(tp['id'], {'days': 0, 'families': 0, 'first': d['day']})
            p['days'] += 1
            p['families'] += len(tp['families'])
    if not present:
        return {'theme': None, 'theme_days': 0, 'melody': {}}
    theme = sorted(present, key=lambda i: (-present[i]['days'], -present[i]['families'], present[i]['first'], i))[0]
    melody = {}
    for d in days:
        others = [tp for tp in d['topics'] if tp['id'] != theme]
        if others:
            melody[d['day']] = sorted(others, key=lambda tp: (-len(tp['families']), -present[tp['id']]['days'], tp['rank']))[0]['id']
    return {'theme': theme, 'theme_days': present[theme]['days'], 'melody': melody}


# ---------------------------------------------------------------------------------------------
# The score
# ---------------------------------------------------------------------------------------------
def layout(n_days: int) -> dict:
    total_bars = INTRO_BARS + DAY_BARS * n_days + OUTRO_BARS
    duration = total_bars * BAR + TAIL_S
    return {'total_bars': total_bars, 'duration': duration, 'samples': int(round(duration * SR))}


def day_start(i: int) -> float:
    return (INTRO_BARS + i * DAY_BARS) * BAR


def chord_at(bar: int) -> list[int]:
    return PROGRESSION[(bar - INTRO_BARS) % len(PROGRESSION)][1] if bar >= INTRO_BARS else PROGRESSION[0][1]


def pitch(step: int, family: str) -> int:
    return F4 + PENTATONIC[int(step)] + REGISTER[family]


def events_of(days: list[dict], plan: dict, arc: dict) -> list[dict]:
    ev = []
    theme_tp = next((tp for d in days for tp in d['topics'] if tp['id'] == plan['theme']), None)
    for i, d in enumerate(days):
        start = day_start(i)
        topics = {tp['id']: tp for tp in d['topics']}
        if plan['theme'] in topics:
            tp = topics[plan['theme']]
            length = sum(l for _, l in tp['motif']) * EIGHTH
            period = BAR if length <= BAR else 2 * BAR
            for k in range(int(DAY_BARS * BAR / period)):
                t = start + k * period
                for step, l in tp['motif']:
                    for fam in tp['families']:
                        ev.append({'t': t, 'dur': l * EIGHTH, 'midi': pitch(step, fam), 'role': 'theme', 'family': fam, 'vel': 0.8})
                    t += l * EIGHTH
        if d['day'] in plan['melody']:
            tp = topics[plan['melody'][d['day']]]
            for half in (0, DAY_BARS // 2):
                t = start + half * BAR
                for step, l in tp['motif']:
                    for fam in tp['families']:
                        ev.append({'t': t, 'dur': 2 * l * EIGHTH, 'midi': pitch(step, fam), 'role': 'melody', 'family': fam, 'vel': 1.0})
                    t += 2 * l * EIGHTH
        for tp, slot in ornaments(d, plan):
            ev.append({'t': start + slot * SIXTEENTH, 'dur': EIGHTH, 'midi': pitch(tp['motif'][0][0], tp['families'][0]),
                       'role': 'ornament', 'family': tp['families'][0], 'vel': 0.5})
        for bar in range(DAY_BARS):
            for s in crowd_slots(d['signals'], arc['signals_max']):
                ev.append({'t': start + bar * BAR + s * SIXTEENTH, 'role': 'crowd'})
    if theme_tp:
        t = (INTRO_BARS + DAY_BARS * len(days)) * BAR
        for step, l in theme_tp['motif']:
            for fam in outro_families(days, plan):
                ev.append({'t': t, 'dur': 2 * l * EIGHTH, 'midi': pitch(step, fam), 'role': 'outro', 'family': fam, 'vel': 0.9})
            t += 2 * l * EIGHTH
    return ev


def ornaments(d: dict, plan: dict) -> list[tuple[dict, int]]:
    rest = [tp for tp in d['topics'] if tp['id'] not in (plan['theme'], plan['melody'].get(d['day']))]
    slots = DAY_BARS * 16
    return [(tp, round((k + 0.5) * slots / len(rest)) % slots) for k, tp in enumerate(rest)]


def crowd_slots(signals: int, signals_max: int) -> list[int]:
    if signals <= 0:
        return []
    per_bar = max(1, round(16 * signals / signals_max))
    return [round((j + 0.5) * 16 / per_bar) % 16 for j in range(per_bar)]


def outro_families(days: list[dict], plan: dict) -> list[str]:
    return sorted({f for d in days for tp in d['topics'] if tp['id'] == plan['theme'] for f in tp['families']}, key=FAMILIES.index)


def composed(n_days: int) -> list[dict]:
    """Bed, bass and beat: no data in them."""
    lay = layout(n_days)
    ev = []
    for bar in range(lay['total_bars']):
        chord = chord_at(bar)
        ev.append({'t': bar * BAR, 'dur': BAR, 'midi': chord[0], 'role': 'bass'})
        for m in chord[1:]:
            ev.append({'t': bar * BAR, 'dur': BAR, 'midi': m, 'role': 'bed'})
        day = (bar - INTRO_BARS) // DAY_BARS
        if INTRO_BARS <= bar < INTRO_BARS + DAY_BARS * n_days:
            if day >= KICK_FROM_DAY:
                for beat in (0, 2):
                    ev.append({'t': bar * BAR + beat * BEAT, 'role': 'kick'})
            if day >= HAT_FROM_DAY:
                for beat in range(4):
                    ev.append({'t': bar * BAR + beat * BEAT + EIGHTH, 'role': 'hat'})
    return ev


# ---------------------------------------------------------------------------------------------
# Instruments
# ---------------------------------------------------------------------------------------------
def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def release(t: np.ndarray, gate: float, tau: float) -> np.ndarray:
    return np.where(t < gate, 1.0, np.exp(-(t - gate) / tau))


def tone(family: str, f: float, gate: float) -> np.ndarray:
    if family == 'reading':        # vibraphone: bar partials 1, 4, 10 and the motor's tremolo
        t = np.arange(int((gate + 1.5) * SR)) / SR
        y = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in ((1, 1.0, 1.6), (4.0, 0.25, 0.5), (10.0, 0.06, 0.15)) if f * r < 0.45 * SR)
        return y * (1 - 0.22 * (1 - np.cos(2 * np.pi * 5.5 * t)) / 2) * (1 - np.exp(-t / 0.002)) * release(t, gate + 0.4, 0.3)
    if family == 'search':         # electric piano: FM 1:1 and a short tine at 14:1
        t = np.arange(int((gate + 1.4) * SR)) / SR
        y = np.sin(2 * np.pi * f * t + (1.6 * np.exp(-t / 0.3) + 0.3) * np.sin(2 * np.pi * f * t))
        if f * 14 < 0.45 * SR:
            y = y + 0.12 * np.sin(2 * np.pi * f * 14 * t) * np.exp(-t / 0.03)
        return y * (1 - np.exp(-t / 0.002)) * np.exp(-t / 1.2) * release(t, gate, 0.25)
    if family == 'news':           # soft pad: three slightly detuned sines and a quiet octave
        t = np.arange(int((gate + 0.9) * SR)) / SR
        y = sum(np.sin(2 * np.pi * f * 2 ** (c / 1200) * t) for c in (-4, 0, 4)) / 3 + 0.2 * np.sin(4 * np.pi * f * t)
        return y * np.minimum(1, t / 0.12) * release(t, gate, 0.35)
    if family == 'social':         # marimba: partials 1, 3.93, 9.2
        t = np.arange(int((gate + 0.8) * SR)) / SR
        y = sum(a * np.sin(2 * np.pi * f * r * t) * np.exp(-t / d) for r, a, d in ((1, 1.0, 0.5), (3.93, 0.4, 0.12), (9.2, 0.12, 0.04)) if f * r < 0.45 * SR)
        return y * (1 - np.exp(-t / 0.001))
    if family == 'tech':           # bell: FM at an inharmonic 3.5
        t = np.arange(int((gate + 2.0) * SR)) / SR
        return np.sin(2 * np.pi * f * t + 2.2 * np.exp(-t / 0.6) * np.sin(2 * np.pi * f * 3.5 * t)) * (1 - np.exp(-t / 0.001)) * np.exp(-t / 1.8)
    if family == 'markets':        # pluck: harmonics that die faster the higher they are
        t = np.arange(int((gate + 1.0) * SR)) / SR
        y = sum(np.sin(2 * np.pi * f * k * t) * np.exp(-t / (0.6 / k ** 0.7)) / k ** 1.2 for k in range(1, 9) if f * k < 0.45 * SR)
        return y * (1 - np.exp(-t / 0.001))
    raise ValueError(family)


def bed_tone(f: float, gate: float) -> np.ndarray:
    t = np.arange(int((gate + 1.2) * SR)) / SR
    return np.sin(2 * np.pi * f * t) * np.minimum(1, t / 0.8) * release(t, gate, 0.6)


def bass_tone(f: float, gate: float) -> np.ndarray:
    t = np.arange(int((gate + 0.3) * SR)) / SR
    return (np.sin(2 * np.pi * f * t) + 0.12 * np.sin(4 * np.pi * f * t)) * np.minimum(1, t / 0.02) * release(t, gate - 0.05, 0.12)


def kick_tone() -> np.ndarray:
    t = np.arange(int(0.35 * SR)) / SR
    return np.sin(2 * np.pi * np.cumsum(45 + 45 * np.exp(-t / 0.03)) / SR) * np.exp(-t / 0.18) * (1 - np.exp(-t / 0.001))


def noise_tick(rng: np.random.Generator, ms: float, band: tuple[float, float]) -> np.ndarray:
    n = int(ms / 1000 * SR)
    return sosfilt(butter(2, band, 'bandpass', fs=SR, output='sos'), rng.standard_normal(n)) * np.exp(-np.arange(n) / (n / 4))


def place(buf: np.ndarray, at: int, sig: np.ndarray) -> None:
    end = min(buf.shape[-1], at + sig.shape[-1])
    if end > at:
        buf[..., at:end] += sig[..., :end - at]


def panned(sig: np.ndarray, pan: float) -> np.ndarray:
    a = (pan + 1) * np.pi / 4
    return np.stack([sig * np.cos(a), sig * np.sin(a)])


def render_buses(events: list[dict], n: int) -> dict:
    rng = np.random.default_rng(SEED)
    hats = np.random.default_rng(SEED + 1)
    buses = {k: np.zeros((2, n)) for k in ('theme', 'melody', 'ornaments', 'crowd', 'bass', 'bed', 'kick', 'hat')}
    cache: dict = {}
    kick = kick_tone()
    for e in sorted(events, key=lambda e: (e['t'], e['role'], e.get('family', ''), e.get('midi', 0))):
        at = int(round(e['t'] * SR))
        role = e['role']
        if role in ('theme', 'melody', 'ornament', 'outro'):
            key = (e['family'], e['midi'], round(e['dur'], 6))
            if key not in cache:
                cache[key] = tone(e['family'], hz(e['midi']), e['dur'])
            bus = {'theme': 'theme', 'melody': 'melody', 'ornament': 'ornaments', 'outro': 'melody'}[role]
            place(buses[bus], at, panned(FAMILY_LEVEL[e['family']] * e['vel'] * cache[key], PAN[e['family']]))
        elif role == 'bed':
            place(buses['bed'], at, panned(bed_tone(hz(e['midi']), e['dur']), 0.0))
        elif role == 'bass':
            place(buses['bass'], at, panned(bass_tone(hz(e['midi']), e['dur']), 0.0))
        elif role == 'kick':
            place(buses['kick'], at, panned(kick, 0.0))
        elif role == 'hat':
            place(buses['hat'], at, panned(noise_tick(hats, 30, (5000, 9000)), 0.15))
        elif role == 'crowd':
            place(buses['crowd'], at, panned(noise_tick(rng, 14, (300, 1800)), float(rng.uniform(-0.6, 0.6))))
    return buses


def reverb_ir() -> np.ndarray:
    rng = np.random.default_rng(SEED + 2)
    n = int(RT60 * SR)
    t = np.arange(n) / SR
    noise = rng.standard_normal((2, n))
    dark = sosfilt(butter(2, 3500, fs=SR, output='sos'), noise, axis=1)
    ir = 0.35 * noise * np.exp(-t / 0.08) + dark * np.exp(-t / (RT60 / 6.91))
    ir[:, :int(0.025 * SR)] = 0.0
    return ir / np.sqrt(np.sum(ir ** 2) / 2)


def pingpong(x: np.ndarray) -> np.ndarray:
    n = len(x)
    d = int(round(DELAY_S * SR))
    nb = int(np.ceil(n / d)) + 1
    xb = np.zeros(nb * d)
    xb[:n] = x
    xb = xb.reshape(nb, d)
    damp = butter(1, 3500.0, fs=SR, output='sos')
    zl, zr = np.zeros((1, 2)), np.zeros((1, 2))
    el, er = np.zeros_like(xb), np.zeros_like(xb)
    for k in range(1, nb):
        dl, zr = sosfilt(damp, er[k - 1], zi=zr)
        dr, zl = sosfilt(damp, el[k - 1], zi=zl)
        el[k] = xb[k - 1] + DELAY_FEEDBACK * dl
        er[k] = DELAY_FEEDBACK * dr
    return np.stack([el.reshape(-1)[:n], er.reshape(-1)[:n]])


def mixdown(buses: dict, gains: dict, ir: np.ndarray) -> dict:
    n = next(iter(buses.values())).shape[1]
    stems = {k: gains[k] * v for k, v in buses.items()}
    send = sum(SEND_REVERB[k] * stems[k].mean(axis=0) for k in SEND_REVERB)
    stems['reverb'] = gains['reverb'] * np.stack([fftconvolve(send, ir[c])[:n] for c in range(2)])
    stems['delay'] = gains['delay'] * pingpong(sum(SEND_DELAY[k] * stems[k].mean(axis=0) for k in SEND_DELAY))
    total = sum(stems.values())
    fade = int(TAIL_S * SR)
    total[:, -fade:] *= 0.5 * (1 + np.cos(np.linspace(0, np.pi, fade)))
    return {'total': total, 'stems': stems}


def calibrate(arc: dict, n_days: int, ir: np.ndarray) -> dict:
    """Levels set once per week on the archive's median day played n times, never on the week itself."""
    meter = pyloudnorm.Meter(SR)
    ref = read_day(arc['reference_day'], arc)
    days = [{**ref, 'day': f'ref-{i}'} for i in range(n_days)]
    events = events_of(days, arrange(days), arc) + composed(n_days)
    buses = render_buses(events, layout(n_days)['samples'])
    gains = {k: 1.0 for k in TARGET}
    for _ in range(2):   # sends feed reverb and delay, so settle twice
        for k, x in mixdown(buses, gains, ir)['stems'].items():
            gains[k] *= 10 ** ((TARGET[k] - meter.integrated_loudness(x.T)) / 20)
    return gains


def true_peak(x: np.ndarray) -> float:
    return float(np.abs(resample_poly(x, 4, 1, axis=1)).max())


def limiter(x: np.ndarray, ceiling: float) -> np.ndarray:
    over = np.abs(resample_poly(x, 4, 1, axis=1)).max(axis=0)
    over = over[:4 * x.shape[1]].reshape(-1, 4).max(axis=1)
    need = np.minimum(1.0, ceiling / np.maximum(over, 1e-12))
    look = int(0.004 * SR)
    return x * uniform_filter1d(minimum_filter1d(need, size=2 * look + 1), size=look + 1)


def master(total: np.ndarray) -> np.ndarray:
    meter = pyloudnorm.Meter(SR)
    ceiling = 10 ** ((CEILING_DBTP - 0.1) / 20)
    out = limiter(total * 10 ** ((TARGET_LUFS - meter.integrated_loudness(total.T)) / 20), ceiling)
    tp = true_peak(out)
    return out * (ceiling / tp) if tp > ceiling else out


def wav_bytes(x: np.ndarray) -> bytes:
    buf = io.BytesIO()
    sf.write(buf, x.T, SR, format='WAV', subtype='PCM_24')
    return buf.getvalue()


# ---------------------------------------------------------------------------------------------
# A week
# ---------------------------------------------------------------------------------------------
def render_week(week: str) -> tuple[np.ndarray, dict]:
    dates = week_days(week)
    arc = read_archive(dates[-1])
    days = [read_day(d, arc) for d in dates]
    plan = arrange(days)
    ir = reverb_ir()
    gains = calibrate(arc, len(days), ir)
    lay = layout(len(days))
    events = events_of(days, plan, arc) + composed(len(days))
    out = master(mixdown(render_buses(events, lay['samples']), gains, ir)['total'])
    return out, {'dates': dates, 'arc': arc, 'days': days, 'plan': plan, 'gains': gains, 'layout': lay}


def topic_record(tp: dict) -> dict:
    return {'id': tp['id'], 'label': tp['label'], 'label_from': tp['label_from'], 'families': tp['families'],
            'publishers': tp['publishers'], 'motif': tp['motif']}


def score(week: str, out: np.ndarray, ctx: dict, audio: Path) -> dict:
    meter = pyloudnorm.Meter(SR)
    plan, days, arc = ctx['plan'], ctx['days'], ctx['arc']
    theme = next((tp for d in days for tp in d['topics'] if tp['id'] == plan['theme']), None)
    sections = []
    for i, d in enumerate(days):
        start = day_start(i)
        a, b = int(start * SR), int((start + DAY_BARS * BAR) * SR)
        topics = {tp['id']: tp for tp in d['topics']}
        sections.append({
            'day': d['day'],
            'from_s': start,
            'to_s': start + DAY_BARS * BAR,
            'missing': d['missing'],
            'receipt': None if d['missing'] else {'file': f'src/data/trending/{d["day"]}.json', 'sha256': d['sha256']},
            'converging': len(d['topics']),
            'signals': d['signals'],
            'crowd_per_bar': len(crowd_slots(d['signals'], arc['signals_max'])),
            'theme': {'present': plan['theme'] in topics, 'families': topics[plan['theme']]['families'] if plan['theme'] in topics else []},
            'melody': topic_record(topics[plan['melody'][d['day']]]) if d['day'] in plan['melody'] else None,
            'ornaments': [{'id': tp['id'], 'label': tp['label'], 'family': tp['families'][0], 'step': tp['motif'][0][0], 'slot': slot}
                          for tp, slot in ornaments(d, plan)],
            'lufs': round(meter.integrated_loudness(out[:, a:b].T), 2),
        })
    return {
        '$contract': CONTRACT,
        'week': week,
        'days': ctx['dates'],
        'archive': {k: v for k, v in arc.items() if k != 'first_label'},
        'patch': {'bpm': BPM, 'scale': 'F G A C D', 'vowels': 'u e i o a', 'progression': [p[0] for p in PROGRESSION],
                  'intro_bars': INTRO_BARS, 'day_bars': DAY_BARS, 'outro_bars': OUTRO_BARS,
                  'instruments': INSTRUMENT, 'platforms': {f: sorted(p for p, g in PLATFORM_FAMILY.items() if g == f) for f in FAMILIES},
                  'fallback_family': FALLBACK_FAMILY, 'levels_set_on': arc['reference_day'],
                  'gains': {k: round(v, 6) for k, v in ctx['gains'].items()}},
        'theme': ({**topic_record(theme), 'days': plan['theme_days'], 'outro_families': outro_families(days, plan)} if theme else None),
        'sections': sections,
        'audio': {'file': f'public/common-time/{audio.name}', 'sha256': sha256(audio), 'seconds': ctx['layout']['duration'],
                  'lufs': round(meter.integrated_loudness(out.T), 2), 'true_peak_dbtp': round(20 * np.log10(true_peak(out)), 2),
                  'encoder': f'AAC {AAC_KBPS} kbps'},
        'render': {'renderer': RENDERER, 'float32_sha256': hashlib.sha256(np.ascontiguousarray(out, dtype=np.float32).tobytes()).hexdigest(),
                   'wav_pcm24_sha256': hashlib.sha256(wav_bytes(out)).hexdigest(), 'python': platform.python_version(),
                   'numpy': np.__version__, 'scipy': importlib.metadata.version('scipy'),
                   'pyloudnorm': importlib.metadata.version('pyloudnorm'), 'platform': platform.machine() + ' ' + platform.system()},
    }


def encode(out: np.ndarray, target: Path) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / 'press.wav'
        sf.write(wav, out.T, SR, subtype='PCM_24')
        if shutil.which('ffmpeg'):
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-c:a', 'aac', '-b:a', f'{AAC_KBPS}k',
                            '-map_metadata', '-1', '-fflags', '+bitexact', '-flags:a', '+bitexact',
                            '-movflags', '+faststart', str(target)], check=True)
        elif shutil.which('afconvert'):
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', str(AAC_KBPS * 1000), str(wav), str(target)], check=True)
        else:
            raise SystemExit('neither ffmpeg nor afconvert is installed')


def press(week: str) -> None:
    target_json = SCORES / f'{week}.json'
    target_audio = AUDIO / f'{week}.m4a'
    if target_json.exists() or target_audio.exists():
        print(f'{week}: pressed already, left as it is')
        return
    if week not in complete_weeks():
        print(f'{week}: not complete in the ledger yet, skipped')
        return
    out, ctx = render_week(week)
    AUDIO.mkdir(parents=True, exist_ok=True)
    SCORES.mkdir(parents=True, exist_ok=True)
    encode(out, target_audio)
    record = score(week, out, ctx, target_audio)
    target_json.write_text(json.dumps(record, indent=1, ensure_ascii=False) + '\n')
    theme = record['theme']['label'] if record['theme'] else 'no theme'
    print(f'{week}: pressed, {record["audio"]["seconds"]:.0f} s, theme {theme}, {record["audio"]["lufs"]} LUFS')


def main() -> None:
    ap = argparse.ArgumentParser(description='Press weeks of Common Ground into Common Time.')
    ap.add_argument('weeks', nargs='*', help='ISO weeks such as 2026-W45; none = every complete week not yet pressed')
    ap.add_argument('--hash', action='store_true', help='render the given weeks only and print their hashes')
    args = ap.parse_args()
    if args.hash:
        for week in args.weeks:
            out, _ = render_week(week)
            print(json.dumps({'week': week, 'float32_sha256': hashlib.sha256(np.ascontiguousarray(out, dtype=np.float32).tobytes()).hexdigest(),
                              'wav_pcm24_sha256': hashlib.sha256(wav_bytes(out)).hexdigest()}))
        return
    for week in args.weeks or complete_weeks():
        press(week)


if __name__ == '__main__':
    main()
