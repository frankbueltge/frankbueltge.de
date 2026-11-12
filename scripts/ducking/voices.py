#!/usr/bin/env python3
"""Render the voices of a Ducking round (src/data/ducking/rounds/<round>.json).

Each channel is one voice reading its lines, sentence by sentence, so the page knows which sentence
is being spoken at any moment. Everything else is several voices at once, reading a random sample
of the labels on Common Ground's charts in the week the round ends. The record is one recording of
the last weeks: headlines that named a field, read by that field's voice on about the day they were
counted, as many from each field as its share of those days gives it. Nothing here calls a service
and nothing is paid for: the voices are Kokoro-82M (open weights, Apache 2.0), run locally.

Setup, once:
  uv venv .venv-voices --python 3.12
  uv pip install --python .venv-voices/bin/python kokoro-onnx soundfile numpy
  # kokoro-v1.0.onnx and voices-v1.0.bin from the kokoro-onnx model release, paths in
  # KOKORO_MODEL and KOKORO_VOICES

Run:
  python scripts/ducking/voices.py after-cycle-011 --labels    # print the crowd's sample and stop
  python scripts/ducking/voices.py after-cycle-011 --record    # print the record's headlines and stop
  python scripts/ducking/voices.py after-cycle-011             # all channels
  python scripts/ducking/voices.py after-cycle-011 war rest    # only these

It encodes with afconvert on a Mac and with ffmpeg anywhere else. Writes public/ducking/<round>/, and
the page's guard (src/lib/ducking/voices.test.ts) turns red if a line changes without a new render.
A new briefing renders itself: .github/workflows/briefing-round.yml runs this with a round's id.
"""
import glob
import hashlib
import json
import os
import random
import re
import shutil
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
KNEE = 0.7            # a rare plosive above this is rounded off towards PEAK: at this level nobody hears it
REST_PERIOD = 150.0   # seconds before everything else repeats
REST_MARGIN = 0.3     # audio kept on both sides of the loop, so encoder padding never falls inside it
# AAC bitrates, in kbps. A voice is mono speech at 24 kHz; the crowd and the record carry more at once.
# Lowered on 2026-11-02 from 48 and 72, when the desk grew from eleven channels to thirteen and a round no
# longer fitted the six megabytes a phone is asked to load (src/lib/ducking/voices.test.ts).
VOICE_KBPS = 40
MIX_KBPS = 64
REST_WEEK = 7
REST_MAX_CHARS = 64
REST_SPEEDS = (0.94, 1.06)
RECORD_WEEKS = 8
DAY_SECONDS = 2.0     # how long a day of the record takes to play
RECORD_LABELS = 48    # headlines over the whole record: about as many as one voice can read in that time
RECORD_MAX_CHARS = 96
RECORD_MIN_WORDS = 3
RECORD_STEP = 0.15    # seconds between two headlines of one voice
# These charts name things. They hold nothing a voice could read as a sentence.
RECORD_SILENT = {'appstore', 'coingecko', 'github', 'github_trending', 'huggingface', 'pypi', 'steam'}

# What a voice cannot say: a web address, code or a formula, which it would spell out sign by sign. Nothing is
# left out for what it says. Until 2026-11-08 a stop list of words for sex, killing, death, crime and accidents,
# swear words, web addresses and the dollar sign kept headlines off the crowd and the record; since then they
# read the charts' words as they stand (docs/decision-log.md). A sum in dollars is read, and so is a cashtag; a
# formula is two dollar signs around something without a space ($k$, $O(1/N)$), unless the second one begins
# the next sum ($20-$60).
UNSAYABLE = re.compile(r'://|www\.|\\|[{}^]|\$[^$\s]+\$(?!\d)', re.I)


def unsayable_script(label):
    """A non-Latin script or an emoji, which the English voices cannot say."""
    return any((ord(c) > 0x24f and c.isalpha()) or unicodedata.category(c) == 'So' for c in label)


def fold(s):
    s = ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c)[0] != 'M').lower()
    s = re.sub(r'[\-‐-―_/]+', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def namer(terms):
    patterns = [re.compile(r'(?<![^\W_])' + re.escape(fold(t)) + r'(?![^\W_])') for t in terms]
    return lambda text: any(p.search(fold(text)) for p in patterns)


def field_test(c):
    """The site's rule (src/lib/reading/attention.ts, countTest): a term as a whole word, one of the channel's
    `requires` too where it has any, none of its exclusions, all in the same text."""
    inc, exc = namer(c['terms']), namer(c.get('exclude', []))
    req = namer(c['requires']) if c.get('requires') else None
    return lambda t: inc(t) and (req is None or req(t)) and not exc(t)


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
    over = np.abs(x) > KNEE
    x[over] = np.sign(x[over]) * (KNEE + (PEAK - KNEE) * np.tanh((np.abs(x[over]) - KNEE) / (PEAK - KNEE)))
    return x


def encode(pcm, out, kbps):
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / 'x.wav'
        sf.write(wav, pcm, RATE, subtype='PCM_24')
        if shutil.which('afconvert'):
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', str(kbps * 1000), '-q', '127', str(wav), str(out)], check=True)
        else:
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(wav), '-c:a', 'aac', '-b:a', f'{kbps}k', str(out)], check=True)


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
    encode(pcm, out / f"{ch['id']}.m4a", VOICE_KBPS)
    print(ch['id'], ch['voice'], f'{len(pcm) / RATE:.1f} s')
    return {'file': f"{ch['id']}.m4a", 'period': round(len(pcm) / RATE, 3), 'level': to_db(speech_rms(pcm)),
            'digest': digest(ch['lines']), 'cues': cues}


def sample_labels(rnd):
    """A seeded random sample of the week's signals that name no matter of the round."""
    end = date.fromisoformat(rnd['briefing']['written'])
    week = {(end - timedelta(days=i)).isoformat() for i in range(REST_WEEK)}
    tests = [field_test(c) for c in rnd['channels']]
    pool, seen, tally = [], set(), {'labels': 0, 'long': 0, 'stopped': 0, 'unreadable': 0}
    for path in sorted(glob.glob(str(ROOT / 'src/data/trending/20*.json'))):
        if Path(path).stem not in week:
            continue
        day = json.load(open(path))
        for source, signals in sorted(day['signals'].items()):
            for s in signals:
                # the label as it will be spoken counts too: cut of its bracket it may lose a false friend
                # ("… (film)") and name a field after all (src/lib/ducking/voices.test.ts holds the page to this)
                label = re.sub(r'\s*\([^)]*\)\s*$', '', s['label']).strip()
                texts = [s['label'], label] + [l['title'] for l in (s.get('links') or [])]
                if any(test(t) for test in tests for t in texts):
                    continue
                key = fold(label)
                if key in seen or len(label) < 3:
                    continue
                seen.add(key)
                tally['labels'] += 1
                if len(label) > REST_MAX_CHARS:
                    tally['long'] += 1
                elif unsayable_script(label):
                    tally['unreadable'] += 1
                elif UNSAYABLE.search(label):
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
    encode(pcm, out / 'rest.m4a', MIX_KBPS)
    cues.sort(key=lambda c: c['t'])
    print('rest', len(voices), 'voices', len(cues), 'labels', f'{REST_PERIOD:.0f} s')
    return {'file': 'rest.m4a', 'period': REST_PERIOD, 'margin': REST_MARGIN, 'level': level, 'from': week[0], 'to': week[-1],
            'voices': len(voices), 'sample': {**tally, 'spoken': used}, 'cues': cues}


def readable(label):
    """A headline the record can read: short enough, a sentence rather than a name, and nothing a voice cannot say.
    Not a judgement of what it says (since 2026-11-08)."""
    return (len(label) <= RECORD_MAX_CHARS and len(label.split()) >= RECORD_MIN_WORDS and not UNSAYABLE.search(label)
            and not unsayable_script(label))


def record_pools(rnd):
    """Per channel, in the order of the days: the headlines of the record's weeks that name its field themselves."""
    end = date.fromisoformat(rnd['briefing']['written'])
    days = [(end - timedelta(days=i)).isoformat() for i in range(RECORD_WEEKS * 7 - 1, -1, -1)]
    tests = [field_test(c) for c in rnd['channels']]
    counted, pools, seen = [0] * len(tests), [[] for _ in tests], set()
    for d, day in enumerate(days):
        path = ROOT / f'src/data/trending/{day}.json'
        if not path.exists():
            continue
        for source, signals in sorted(json.load(open(path))['signals'].items()):
            for s in signals:
                texts = [s['label']] + [l['title'] for l in (s.get('links') or [])]
                label = re.sub(r'\s*\([^)]*\)\s*$', '', s['label']).strip()
                for c, test in enumerate(tests):
                    if not any(test(t) for t in texts):
                        continue
                    counted[c] += 1
                    if source not in RECORD_SILENT and fold(label) not in seen and test(label) and readable(label):
                        seen.add(fold(label))
                        pools[c].append((d, label))
    return days, counted, pools


def record_picks(counted, pools):
    """Every field gets its share of the headlines, at least one if it has any, spread as its signals are."""
    total = sum(counted) or 1
    picks = []
    for c, pool in enumerate(pools):
        quota = min(len(pool), max(1, round(RECORD_LABELS * counted[c] / total))) if pool else 0
        picks += [(*pool[int((i + 0.5) * len(pool) / quota)], c) for i in range(quota)]
    return picks


def record(k, rnd, out):
    days, counted, pools = record_pools(rnd)
    picks = record_picks(counted, pools)
    channels = rnd['channels']
    rng = random.Random(rnd['rest']['seed'] + 2)
    timed = sorted(((d + rng.random()) * DAY_SECONDS, c, label) for d, label, c in picks)
    length = int((len(days) * DAY_SECONDS + 8) * RATE)
    left, right = np.zeros(length, dtype=np.float64), np.zeros(length, dtype=np.float64)
    free, cues = [0.0] * len(channels), []
    for t, c, label in timed:
        voice = channels[c]['voice']
        samples, _ = k.create(label, voice=voice, speed=1.0, lang=lang_of(voice))
        x = trimmed(np.asarray(samples, dtype=np.float32))
        t = max(t, free[c])
        d = len(x) / RATE
        free[c] = t + d + RECORD_STEP
        at = int(t * RATE)
        if at + len(x) > length:
            continue  # the last days of a dense field would run past the end
        pan = -0.62 + 1.24 * c / max(1, len(channels) - 1)
        left[at:at + len(x)] += x * np.cos((pan + 1) * np.pi / 4)
        right[at:at + len(x)] += x * np.sin((pan + 1) * np.pi / 4)
        cues.append({'t': round(t, 2), 'd': round(d, 2), 'text': label, 'c': c})
    end = int((cues[-1]['t'] + cues[-1]['d'] + 1) * RATE)
    pcm = levelled(np.stack([left[:end], right[:end]], axis=1).astype(np.float32))
    encode(pcm, out / 'record.m4a', MIX_KBPS)
    print('record', len(cues), 'headlines', f'{len(pcm) / RATE:.0f} s', {channels[c]['id']: sum(1 for q in cues if q['c'] == c) for c in range(len(channels))})
    return {'file': 'record.m4a', 'from': days[0], 'to': days[-1], 'day': DAY_SECONDS, 'level': to_db(speech_rms(pcm)), 'cues': cues,
            'sample': {'signals': sum(counted), 'readable': sum(len(p) for p in pools), 'spoken': len(cues)}}


def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    round_id, only = args[0], set(args[1:])
    rnd = json.load(open(ROOT / f'src/data/ducking/rounds/{round_id}.json'))
    labels, week, tally = sample_labels(rnd)
    if '--labels' in sys.argv:
        print(len(labels), 'labels', week[0], week[-1], tally)
        print('\n'.join(labels))
        return
    if '--record' in sys.argv:
        days, counted, pools = record_pools(rnd)
        for d, label, c in sorted(record_picks(counted, pools)):
            print(days[d], rnd['channels'][c]['strip'], '|', label)
        return
    home = Path.home() / '.cache/hyperframes/tts'
    k = Kokoro(os.environ.get('KOKORO_MODEL', str(home / 'models/kokoro-v1.0.onnx')),
               os.environ.get('KOKORO_VOICES', str(home / 'voices/voices-v1.0.bin')))
    out = ROOT / f'public/ducking/{round_id}'
    if not only:
        shutil.rmtree(out, ignore_errors=True)  # a full render leaves no recording of a channel that is gone
    out.mkdir(parents=True, exist_ok=True)
    book = out / 'voices.json'
    state = json.load(open(book)) if book.exists() else {'round': round_id, 'model': 'Kokoro-82M v1.0', 'channels': {}}
    for i, ch in enumerate(rnd['channels']):
        if not only or ch['id'] in only:
            state['channels'][ch['id']] = channel(k, ch, i, out)
    if not only or 'rest' in only:
        state['rest'] = rest(k, rnd, out, labels, week, tally)
    if not only or 'record' in only:
        state['record'] = record(k, rnd, out)
    json.dump(state, open(book, 'w'), ensure_ascii=False, separators=(',', ':'))
    print('wrote', book.relative_to(ROOT), f'{book.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
