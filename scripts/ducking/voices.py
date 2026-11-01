#!/usr/bin/env python3
"""Render the voices of a Ducking round (src/data/ducking/rounds/<round>.json).

Each channel is one voice reading its lines, sentence by sentence, so the page knows which sentence
is being spoken at any moment. Everything else is several voices at once, reading a random sample
of the labels on Common Ground's charts in the week the round ends. Nothing here calls a service
and nothing is paid for: the voices are Kokoro-82M (open weights, Apache 2.0), run locally.

Setup, once:
  uv venv .venv-voices --python 3.12
  uv pip install --python .venv-voices/bin/python kokoro-onnx soundfile numpy
  # kokoro-v1.0.onnx and voices-v1.0.bin from the kokoro-onnx model release, paths in
  # KOKORO_MODEL and KOKORO_VOICES

Run:
  python scripts/ducking/voices.py after-cycle-011 --labels    # print the sample and stop
  python scripts/ducking/voices.py after-cycle-011             # all channels
  python scripts/ducking/voices.py after-cycle-011 ebola rest  # only these

macOS only as it stands: it encodes with afconvert. Writes public/ducking/<round>/, and the page's
guard (src/lib/ducking/voices.test.ts) turns red if a line changes without a new render.
"""
import glob
import hashlib
import json
import os
import random
import re
import subprocess
import sys
import tempfile
import unicodedata
from datetime import date, timedelta
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parent.parent.parent
RATE = 24000
GAP = 0.55            # seconds between two sentences of a reading
TAIL = 1.3            # seconds of silence before a reading starts again; a hand may arrive right here
TAIL_STEP = 0.17      # each channel a little longer, so the loops never line up
TARGET_DB = -24.0     # every channel at the same speech power, low enough that none meets the peak limit
PEAK = 0.84
REST_PERIOD = 150.0   # seconds before everything else repeats
REST_MARGIN = 0.3     # audio kept on both sides of the loop, so encoder padding never falls inside it
REST_WEEK = 7
REST_MAX_CHARS = 64
REST_SPEEDS = (0.94, 1.06)

# Reads as a chart entry, not as anything a person should hear said about someone by a machine.
STOP = re.compile(
    r'porn|xxx|xhamster|xvideos|onlyfans|nude|naked|sex|titty|titties|boob|zoofil|bestial|incest|rape|'
    r'murder|kill|shoot|stabb|suicide|fuck|shit|'
    r'\bass\b|bitch|dies\b|dead\b|death|obituar|arrest|victim|abuse|violence|attack|bundy|nazi|hitler|'
    r'atentado|fusillade|attentat|accident|unfall|anschlag|affaire|massacre|tohopesate|crash|disaster|'
    r'messerangriff|assassinat|collision|collide|ramming|harass|bowels|hospital|'
    r'http|www\.|\.com|\$|\\\\|\{|\}|\^',
    re.I,
)


def fold(s):
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c)[0] != 'M').lower()
    s = re.sub(r'[\-‐-―_/]+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def namer(terms):
    patterns = [re.compile(r'(?<![^\W_])' + re.escape(fold(t)) + r'(?![^\W_])') for t in terms]
    return lambda text: any(p.search(fold(text)) for p in patterns)


def digest(lines):
    pairs = [[l['text'], l.get('say', l['text'])] for l in lines]
    return hashlib.sha256(json.dumps(pairs, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()[:16]


def trimmed(x):
    loud = np.flatnonzero(np.abs(x) > 0.004)
    return x[max(0, loud[0] - 240): loud[-1] + 480] if len(loud) else x


def speech_rms(x, frame=2400):
    """The power of the speech, all channels of it together, leaving out the pauses."""
    power = x ** 2 if x.ndim == 1 else (x ** 2).sum(axis=1)
    frames = power[: len(power) // frame * frame].reshape(-1, frame).mean(axis=1)
    return float(np.sqrt(frames[frames > frames.max() * 0.02].mean()))


def to_db(rms):
    return round(20 * float(np.log10(rms)), 2)


def levelled(x):
    x = x * 10 ** (TARGET_DB / 20) / speech_rms(x)
    if float(np.abs(x).max()) > PEAK:
        sys.exit(f'a recording reaches the peak limit at {TARGET_DB} dB, lower TARGET_DB')
    return x


def encode(pcm, out, kbps):
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / 'x.wav'
        sf.write(wav, pcm, RATE, subtype='PCM_24')
        subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', str(kbps * 1000), '-q', '127', str(wav), str(out)], check=True)


def lang_of(voice):
    return 'en-gb' if voice[0] == 'b' else 'en-us'


def channel(k, ch, index, out):
    parts, cues, t = [], [], 0.0
    gap = np.zeros(int(GAP * RATE), dtype=np.float32)
    for line in ch['lines']:
        samples, _ = k.create(line.get('say', line['text']), voice=ch['voice'], speed=1.0, lang=lang_of(ch['voice']))
        x = trimmed(np.asarray(samples, dtype=np.float32))
        cues.append({'t': round(t, 2), 'd': round(len(x) / RATE, 2), 'text': line['text']})
        parts += [x, gap]
        t += (len(x) + len(gap)) / RATE
    parts.append(np.zeros(int((TAIL + index * TAIL_STEP) * RATE), dtype=np.float32))
    pcm = levelled(np.concatenate(parts))
    encode(pcm, out / f"{ch['id']}.m4a", 48)
    print(ch['id'], ch['voice'], f'{len(pcm) / RATE:.1f} s')
    return {'file': f"{ch['id']}.m4a", 'period': round(len(pcm) / RATE, 3), 'level': to_db(speech_rms(pcm)),
            'digest': digest(ch['lines']), 'cues': cues}


def sample_labels(rnd):
    """A seeded random sample of the week's signals that name no matter of the round."""
    end = date.fromisoformat(rnd['briefing']['written'])
    week = {(end - timedelta(days=i)).isoformat() for i in range(REST_WEEK)}
    names = [namer(c['terms']) for c in rnd['channels']]
    pool, seen, tally = [], set(), {'labels': 0, 'long': 0, 'stopped': 0, 'unreadable': 0}
    for path in sorted(glob.glob(str(ROOT / 'src/data/trending/20*.json'))):
        if Path(path).stem not in week:
            continue
        day = json.load(open(path))
        for source, signals in sorted(day['signals'].items()):
            for s in signals:
                texts = [s['label']] + [l['title'] for l in (s.get('links') or [])]
                if any(n(t) for n in names for t in texts):
                    continue
                label = re.sub(r'\s*\([^)]*\)\s*$', '', s['label']).strip()
                key = fold(label)
                if key in seen or len(label) < 3:
                    continue
                seen.add(key)
                tally['labels'] += 1
                if len(label) > REST_MAX_CHARS:
                    tally['long'] += 1
                elif any((ord(c) > 0x24f and c.isalpha()) or unicodedata.category(c) == 'So' for c in label):
                    tally['unreadable'] += 1
                elif STOP.search(label):
                    tally['stopped'] += 1
                else:
                    pool.append(label)
    random.Random(rnd['rest']['seed']).shuffle(pool)
    return pool, sorted(week), tally


def rest(k, rnd, out, labels, week, tally):
    voices = rnd['rest']['voices']
    period = int(REST_PERIOD * RATE)
    left, right = np.zeros(period, dtype=np.float64), np.zeros(period, dtype=np.float64)
    rng = random.Random(rnd['rest']['seed'] + 1)
    cues, used = [], 0
    for track, voice in enumerate(voices):
        pan = -0.85 + 1.7 * track / (len(voices) - 1)
        gain = rng.uniform(0.62, 1.0)
        gl, gr = np.cos((pan + 1) * np.pi / 4) * gain, np.sin((pan + 1) * np.pi / 4) * gain
        t = int(rng.uniform(0, 2.5) * RATE)
        while t < period - RATE:
            label = labels[used % len(labels)]
            used += 1
            samples, _ = k.create(label, voice=voice, speed=rng.uniform(*REST_SPEEDS), lang=lang_of(voice))
            x = trimmed(np.asarray(samples, dtype=np.float32))
            # wrapped around the end of the period, so the loop has no seam
            where = (t + np.arange(len(x))) % period
            np.add.at(left, where, x * gl)
            np.add.at(right, where, x * gr)
            cues.append({'t': round(t / RATE, 2), 'd': round(len(x) / RATE, 2), 'text': label, 'v': track})
            t += len(x) + int(rng.uniform(0.25, 1.1) * RATE)
    pcm = levelled(np.stack([left, right], axis=1).astype(np.float32))
    level = to_db(speech_rms(pcm))
    margin = int(REST_MARGIN * RATE)
    pcm = np.concatenate([pcm[-margin:], pcm, pcm[:margin]])
    encode(pcm, out / 'rest.m4a', 72)
    cues.sort(key=lambda c: c['t'])
    print('rest', len(voices), 'voices', len(cues), 'labels', f'{REST_PERIOD:.0f} s')
    return {'file': 'rest.m4a', 'period': REST_PERIOD, 'margin': REST_MARGIN, 'level': level, 'from': week[0], 'to': week[-1],
            'voices': len(voices), 'sample': {**tally, 'spoken': used}, 'cues': cues}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    round_id, only = args[0], set(args[1:])
    rnd = json.load(open(ROOT / f'src/data/ducking/rounds/{round_id}.json'))
    labels, week, tally = sample_labels(rnd)
    if '--labels' in sys.argv:
        print(len(labels), 'labels', week[0], week[-1], tally)
        print('\n'.join(labels))
        return
    home = Path.home() / '.cache/hyperframes/tts'
    k = Kokoro(os.environ.get('KOKORO_MODEL', str(home / 'models/kokoro-v1.0.onnx')),
               os.environ.get('KOKORO_VOICES', str(home / 'voices/voices-v1.0.bin')))
    out = ROOT / f'public/ducking/{round_id}'
    out.mkdir(parents=True, exist_ok=True)
    book = out / 'voices.json'
    state = json.load(open(book)) if book.exists() else {'round': round_id, 'model': 'Kokoro-82M v1.0', 'channels': {}}
    for i, ch in enumerate(rnd['channels']):
        if not only or ch['id'] in only:
            state['channels'][ch['id']] = channel(k, ch, i, out)
    if not only or 'rest' in only:
        state['rest'] = rest(k, rnd, out, labels, week, tally)
    json.dump(state, open(book, 'w'), ensure_ascii=False, separators=(',', ':'))
    print('wrote', book.relative_to(ROOT), f'{book.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
