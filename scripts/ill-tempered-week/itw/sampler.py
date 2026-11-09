"""A small SFZ sampler for the VSCO 2 Community Edition (Versilian Studios, CC0, version 1.1.0, downloaded at
Frank's go of 2026-11-09 into ~/samples/VSCO-2-CE; archive sha256 4a4446628df0e1a12aaee58e9f65f8fa7cde51971e961abb1b43083a6d3a8ab7).

Instrument(name).note(hz, seconds, velocity) plays one recorded note at an exact frequency (any tuning, just
intonation included): the region nearest in pitch for the velocity is resampled by the exact ratio (polyphase,
ratio to 1/2000) from 44.1 to 48 kHz, cut after the note with a cosine release, and scaled by the region's volume
and the velocity. Round robins are chosen by a hash of the call, so renders stay deterministic.
"""
import hashlib
import math
import re
from fractions import Fraction
from functools import lru_cache
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = Path(__import__('os').environ.get('VSCO_ROOT', Path.home() / 'samples' / 'VSCO-2-CE' / 'VSCO-2-CE-1.1.0'))
SR = 48000
NOTE = {'c': 0, 'd': 2, 'e': 4, 'f': 5, 'g': 7, 'a': 9, 'b': 11}


def midi_of(v: str) -> int:
    v = v.strip().lower()
    if re.fullmatch(r'-?\d+', v):
        return int(v)
    m = re.fullmatch(r'([a-g])([#b]?)(-?\d)', v)
    if not m:
        raise ValueError(v)
    acc = {'#': 1, 'b': -1, '': 0}[m.group(2)]
    return 12 * (int(m.group(3)) + 1) + NOTE[m.group(1)] + acc


def parse(path: Path) -> list[dict]:
    text = path.read_text(errors='ignore')
    text = re.sub(r'//.*', '', text)
    tokens = re.findall(r'<(\w+)>|(\w+)=([^\s<]+(?:\s+(?![\w]+=|<)[^\s<]+)*)', text)
    scope = {'control': {}, 'global': {}, 'master': {}, 'group': {}}
    regions, current, header = [], None, None
    for head, key, val in tokens:
        if head:
            header = head
            if header == 'region':
                current = {}
                regions.append(current)
            elif header in scope:
                if header == 'group':
                    scope['group'] = {}
                current = None
            continue
        if header == 'region' and current is not None:
            current[key] = val
        elif header in scope:
            scope[header][key] = val
        if header == 'region' and current is not None and '_inherit' not in current:
            current['_inherit'] = {**scope['control'], **scope['global'], **scope['master'], **scope['group']}
    out = []
    for r in regions:
        o = {**r.pop('_inherit', {}), **r}
        base = o.get('default_path', '').replace('\\', '/')
        sample = (path.parent / base / o['sample'].replace('\\', '/')).resolve()
        center = midi_of(o.get('pitch_keycenter', o.get('key', '60')))
        out.append({'sample': sample, 'lokey': midi_of(o.get('lokey', o.get('key', '0'))),
                    'hikey': midi_of(o.get('hikey', o.get('key', '127'))), 'center': center,
                    'tune': float(o.get('tune', 0)) + 100 * float(o.get('transpose', 0)),
                    'lovel': int(o.get('lovel', 0)), 'hivel': int(o.get('hivel', 127)),
                    'volume': float(o.get('volume', 0)), 'release': float(o.get('ampeg_release', 0.3)),
                    'offset': int(o.get('offset', 0)), 'seq': int(o.get('seq_position', 1)),
                    'seq_len': int(o.get('seq_length', 1))})
    return out


@lru_cache(maxsize=512)
def load(path: Path) -> np.ndarray:
    x, sr = sf.read(path, dtype='float64', always_2d=True)
    return x.T


class Instrument:
    def __init__(self, sfz: str):
        self.name = sfz
        self.regions = parse(ROOT / f'{sfz}.sfz')
        self._cache: dict[tuple, np.ndarray] = {}

    def pick(self, midi: float, vel: int, key: str) -> dict:
        m = int(round(midi))
        cands = [r for r in self.regions if r['lovel'] <= vel <= r['hivel']] or self.regions
        inside = [r for r in cands if r['lokey'] <= m <= r['hikey']]
        pool = inside or sorted(cands, key=lambda r: abs(r['center'] - midi))[:4]
        pool = sorted(pool, key=lambda r: (abs(r['center'] - midi), r['seq'], str(r['sample'])))
        best = [r for r in pool if abs(r['center'] - midi) == abs(pool[0]['center'] - midi)]
        return best[int(hashlib.sha1(key.encode()).hexdigest()[:6], 16) % len(best)]

    def note(self, hz: float, seconds: float, vel: int = 90, release: float | None = None, key: str = '') -> np.ndarray:
        midi = 69 + 12 * math.log2(hz / 440.0)
        r = self.pick(midi, vel, key or f'{hz:.4f}-{seconds:.4f}')
        rel = r['release'] if release is None else release
        ck = (str(r['sample']), round(hz, 4), round(seconds, 4), vel, round(rel, 3))
        if ck in self._cache:
            return self._cache[ck]
        x = load(r['sample'])[:, r['offset']:]
        center_hz = 440.0 * 2 ** ((r['center'] - 69 + r['tune'] / 100) / 12)
        factor = (SR / 44100.0) * (center_hz / hz)               # output samples per input sample
        need = int((seconds + rel) * SR / factor) + 64
        frac = Fraction(factor).limit_denominator(2000)
        y = resample_poly(x[:, :need], frac.numerator, frac.denominator, axis=1)
        n_note, n_rel = int(seconds * SR), int(rel * SR)
        y = y[:, :n_note + n_rel]
        if y.shape[1] < n_note + n_rel:                          # a note longer than its recording ends early
            n_rel = max(1, min(n_rel, y.shape[1] - n_note)) if y.shape[1] > n_note else int(0.05 * SR)
        env = np.ones(y.shape[1])
        a = min(len(env), int(0.003 * SR))
        env[:a] = np.linspace(0, 1, a)
        start = min(n_note, y.shape[1])
        tail = y.shape[1] - start
        if tail > 0:
            env[start:] = 0.5 * (1 + np.cos(np.linspace(0, np.pi, tail)))
        gain = 10 ** (r['volume'] / 20) * (vel / 127.0) ** 2
        out = y * env * gain
        self._cache[ck] = out
        return out


def glide(inst: Instrument, hz0: float, hz1: float, seconds: float, vel: int = 90, release: float | None = None,
          key: str = '') -> np.ndarray:
    """One recorded note gliding from hz0 to hz1 over `seconds` (smoothstep in log frequency), by reading the
    region nearest the middle pitch at a time-varying rate; the pitch holds at hz1 through the release. The timbre
    shifts with the pitch, as a bow slide on tape would; keep glides within about an octave."""
    mid = math.sqrt(hz0 * hz1)
    r = inst.pick(69 + 12 * math.log2(mid / 440.0), vel, key or f'g{hz0:.3f}-{hz1:.3f}-{seconds:.3f}')
    rel = r['release'] if release is None else release
    x = load(r['sample'])[:, r['offset']:]
    center_hz = 440.0 * 2 ** ((r['center'] - 69 + r['tune'] / 100) / 12)
    n = int((seconds + rel) * SR)
    t = np.arange(n) / SR
    u = np.clip(t / max(1e-6, seconds), 0.0, 1.0)
    u = u * u * (3 - 2 * u)
    f = hz0 * (hz1 / hz0) ** u
    rate = (f / center_hz) * (44100.0 / SR)
    pos = np.cumsum(rate) - rate[0]
    valid = pos < x.shape[1] - 2
    grid = np.arange(x.shape[1])
    y = np.stack([np.interp(pos, grid, ch) for ch in x])
    y[:, ~valid] = 0.0
    env = np.ones(n)
    a = min(n, int(0.004 * SR))
    env[:a] = np.linspace(0, 1, a)
    s0 = min(n, int(seconds * SR))
    if n > s0:
        env[s0:] = 0.5 * (1 + np.cos(np.linspace(0, np.pi, n - s0)))
    return y * env * 10 ** (r['volume'] / 20) * (vel / 127.0) ** 2
