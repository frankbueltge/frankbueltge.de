"""The families' vowels (Wikipedia ah, Google Trends ee, news oh, social oo, tech eh, markets ay): Kokoro says
each once; a note is that vowel vocoded onto a saw stack at the exact pitch (probe 05's sound)."""
import hashlib

import numpy as np
import pedalboard as pb
import soundfile as sf
from scipy.signal import resample_poly

from . import base
from .base import SR

VOWEL = {'reading': 'Ah.', 'search': 'Ee.', 'news': 'Oh.', 'social': 'Ooh.', 'tech': 'Eh.', 'markets': 'Ay.'}
VOICE, LANG = 'af_nicole', 'en-us'
_vowels: dict[str, np.ndarray] = {}
_notes: dict[tuple, np.ndarray] = {}


def vowel(family: str) -> np.ndarray:
    if family not in _vowels:
        base.CACHE.mkdir(parents=True, exist_ok=True)
        path = base.CACHE / f'vowel-{VOICE}-{family}.wav'
        if not path.exists():
            samples, rate = base.kokoro().create(VOWEL[family], voice=VOICE, speed=0.8, lang=LANG)
            sf.write(path, samples, rate, subtype='FLOAT')
        x, rate = sf.read(path, dtype='float64')
        g = np.gcd(SR, rate)
        x = resample_poly(x, SR // g, rate // g)
        a = np.abs(x)
        on = np.where(a > 0.02 * a.max())[0]
        x = x[on[0]:on[-1]]
        _vowels[family] = x / np.abs(x).max()
    return _vowels[family]


def sung(family: str, hz: float, length: float) -> np.ndarray:
    """One wordless note: the family's vowel, stretched to the note, vocoded onto a saw stack at hz."""
    key = (family, round(hz, 3), round(length, 4))
    if key not in _notes:
        n = int(length * SR)
        mod = vowel(family)
        if len(mod) < n:
            mod = pb.time_stretch(mod.astype(np.float32)[None, :], SR, stretch_factor=len(mod) / n)[0].astype(np.float64)
        mod = np.pad(mod, (0, max(0, n - len(mod))))[:n]
        seed = int(hashlib.sha1(repr(key).encode()).hexdigest()[:8], 16)
        car = base.carrier([hz, 2 * hz], n, np.random.default_rng(seed))
        _notes[key] = base.fade(base.vocode(mod, car), 0.006, min(0.06, length / 3))
    return _notes[key]

