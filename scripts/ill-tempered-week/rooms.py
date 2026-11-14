#!/usr/bin/env python3
"""the ill-tempered week: the press's hall and room, for the page's own performance of Overlooked.

itw/overlooked.py sends the ensemble and the voice each through a highpass and a reverb before it levels them. The
reverb (pedalboard's, which is JUCE's, which is Freeverb) is a fixed network of delays, so a browser can have the very
same one: src/lib/ill-tempered-week/reverb.ts builds it again and hands its answer to an impulse to the browser's
convolver. This script writes what that code is held to: the answer of the press's own two reverbs to one unit in both
channels, at the press's rate, as a sample of values and the answer's energy.

  python scripts/ill-tempered-week/rooms.py     # writes src/lib/ill-tempered-week/fixtures/reverb.json

Run by hand when the renderer's reverbs change; src/lib/ill-tempered-week/perform-overlooked.test.ts holds the
settings below to the renderer's own lines, and reverb.test.ts holds the browser's reverb to this file.
"""
import json
from pathlib import Path

import numpy as np
import pedalboard as pb

SR = 48000
SECONDS = 3
EVERY = 97          # every 97th value of the answer is kept
OUT = Path(__file__).resolve().parents[2] / 'src' / 'lib' / 'ill-tempered-week' / 'fixtures' / 'reverb.json'
ROOMS = {
    'hall': {'room': 0.82, 'damping': 0.45, 'wet': 0.26, 'dry': 0.85, 'width': 1.0},
    'room': {'room': 0.3, 'damping': 0.5, 'wet': 0.08, 'dry': 1.0, 'width': 1.0},
}


def measure(s: dict) -> dict:
    reverb = pb.Reverb(room_size=s['room'], damping=s['damping'], wet_level=s['wet'], dry_level=s['dry'], width=s['width'])
    x = np.zeros((2, SECONDS * SR), dtype=np.float32)
    x[:, 0] = 1.0
    y = pb.Pedalboard([reverb])(x, SR, reset=True).astype(np.float64)
    dry = float(y[:, 0].mean())
    y[:, 0] = 0.0
    return {'settings': s, 'dry': round(dry, 6), 'energy': [round(float(e), 6) for e in (y ** 2).sum(axis=1)],
            'first': int(np.argmax(np.abs(y).max(axis=0) > 1e-9)),
            'left': [round(float(v), 7) for v in y[0, ::EVERY]], 'right': [round(float(v), 7) for v in y[1, ::EVERY]]}


if __name__ == '__main__':
    out = {'by': 'scripts/ill-tempered-week/rooms.py: one unit in both channels through the press\'s reverbs',
           'rate': SR, 'seconds': SECONDS, 'every': EVERY, **{name: measure(s) for name, s in ROOMS.items()}}
    OUT.write_text(json.dumps(out) + '\n')
    for name in ROOMS:
        print(name, 'dry', out[name]['dry'], 'energy', out[name]['energy'], 'first', out[name]['first'])
    print(f'{OUT.stat().st_size / 1e3:.0f} kB')
