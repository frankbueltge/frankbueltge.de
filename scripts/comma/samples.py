#!/usr/bin/env python3
"""The sounds of Comma (/comma, 2026-11-13): six organ tones and six tubular bells, rendered once and committed.

Source: VSCO 2 Community Edition (CC0), the same library the ill-tempered week plays, read with its sampler
(scripts/ill-tempered-week/itw/sampler.py; set VSCO_ROOT if the library is not in ~/samples). The six pitches are the
harmonics 4, 5, 6, 7, 9 and 11 of A at 55 Hz, one for each kind of page the work hears (src/lib/comma/groups.ts).

Organ (OrganQuiet): the steady middle of one recorded note, made into a loop of exactly 385 periods of 55 Hz (7.0 s),
so every one of the six pitches fits it a whole number of times; the loop's own end is cross-faded into its start, and
the file holds the loop twice, so any 7-second window of it loops without a seam, wherever a decoder's start padding
moves the samples. The page loops seconds 3.5 to 10.5 (LOOP in src/lib/comma/groups.ts). The comma tone is the same
file played at 80/81 of its speed.
Bells (TubularBells): one stroke each, rung out.
Usage: python scripts/comma/samples.py   (numpy, scipy and soundfile; ffmpeg with libmp3lame on PATH)
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'scripts' / 'ill-tempered-week'))
from itw import sampler  # noqa: E402

OUT = ROOT / 'public' / 'comma'
F0 = 55.0
HARMONICS = (4, 5, 6, 7, 9, 11)
LOOP_PERIODS = 385                     # 385 / 55 Hz = 7.0 s
SR = sampler.SR
FFMPEG = shutil.which('ffmpeg') or '/opt/homebrew/bin/ffmpeg'


def mono(x: np.ndarray) -> np.ndarray:
    return x.mean(axis=0) if x.ndim == 2 else x


def fundamental(x: np.ndarray, near: float) -> float:
    """The strongest frequency within 3 % of `near`, read from one long FFT with parabolic interpolation."""
    n = 1 << 21
    spec = np.abs(np.fft.rfft(x * np.hanning(len(x)), n))
    freqs = np.fft.rfftfreq(n, 1 / SR)
    band = (freqs > near * 0.97) & (freqs < near * 1.03)
    i = int(np.argmax(spec * band))
    a, b, c = (np.log(spec[j] + 1e-12) for j in (i - 1, i, i + 1))
    return (i + 0.5 * (a - c) / (a - 2 * b + c)) * SR / n


def organ_note(hz: float) -> np.ndarray:
    """The organ's samples are a few cents off their nominal pitch, so the note is measured and rendered again,
    corrected, until it sits within half a cent of the harmonic it stands for."""
    ask = hz
    for _ in range(4):
        note = mono(sampler.Instrument('OrganQuiet').note(ask, 11.0, vel=80, key=f'comma-{ask:.4f}'))
        got = fundamental(note[int(1.5 * SR):int(9.5 * SR)], hz)
        if abs(1200 * np.log2(got / hz)) < 0.5:
            return note
        ask *= hz / got
    raise SystemExit(f'could not tune {hz} Hz: still {got:.3f} Hz')


def organ_loop(hz: float) -> np.ndarray:
    note = organ_note(hz)
    n = int(round(LOOP_PERIODS / F0 * SR))
    x = int(round(1.0 * SR))
    seg = note[int(1.5 * SR):int(1.5 * SR) + n + x]
    assert len(seg) == n + x, 'the recording is too short for the loop'
    loop = seg[:n].copy()
    fade = np.linspace(0.0, 1.0, x)
    loop[:x] = seg[:x] * fade + seg[n:n + x] * (1 - fade)   # the loop's own continuation fades into its start
    out = np.concatenate([loop, loop])
    return out / (np.abs(out).max() + 1e-12) * 0.89


def bell(hz: float) -> np.ndarray:
    x = mono(sampler.Instrument('TubularBells').note(hz, 3.0, vel=96, release=3.0, key=f'comma-bell-{hz:.0f}'))
    return x / (np.abs(x).max() + 1e-12) * 0.89


def write_mp3(x: np.ndarray, path: Path, kbps: int) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / 'x.wav'
        sf.write(wav, x, SR, subtype='PCM_16')
        subprocess.run([FFMPEG, '-y', '-loglevel', 'error', '-i', str(wav), '-ac', '1', '-c:a', 'libmp3lame',
                        '-b:a', f'{kbps}k', str(path)], check=True)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for h in HARMONICS:
        write_mp3(organ_loop(F0 * h), OUT / f'organ-h{h}.mp3', 64)
        write_mp3(bell(F0 * h), OUT / f'bell-h{h}.mp3', 64)
    for f in sorted(OUT.glob('*.mp3')):
        print(f.name, f.stat().st_size)


if __name__ == '__main__':
    main()
