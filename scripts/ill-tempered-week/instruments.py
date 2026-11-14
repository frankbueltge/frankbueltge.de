#!/usr/bin/env python3
"""the ill-tempered week: the instruments a browser needs to perform Overlooked from its score.

The page can perform Overlooked itself (src/components/ill-tempered-week/orchestra.ts): the same recorded notes of the
VSCO 2 Community Edition (Versilian Studios, CC0, 1.1.0) the press plays, tuned by the same rule (a recorded note
read at the exact ratio of the wanted pitch to its own). This script cuts out of the library what that performance
can ask for, and nothing else:

  which regions   for every instrument, the regions itw/sampler.py's own pick() can choose for the pitches and
                  velocities the piece uses (NEEDS below, read off itw/overlooked.py), so the browser's pick on this
                  subset equals the press's pick on the whole instrument
  how much        each region from its start, as long as the longest note that can use it (its release included),
                  mono (the mean of the two channels), at the library's 44.1 kHz
  one file each   an instrument is one AAC file: a click to find the start by, then its regions one after another
                  with silence between; public/ill-tempered-week/instruments/<Name>.m4a
  the index       public/ill-tempered-week/instruments/index.json: for each region where it lies in the file and
                  what the sampler knows of it (pitch, key and velocity range, volume, release, round robin), and for
                  each file its sha256

  python scripts/ill-tempered-week/instruments.py            # writes the files; needs VSCO_ROOT and ffmpeg
  python scripts/ill-tempered-week/instruments.py --check    # only says what it would keep

Run by hand when NEEDS changes (a new instrument, a longer note); the nightly press does not run it.
"""
import hashlib
import json
import math
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import numpy as np  # noqa: E402
import soundfile as sf  # noqa: E402

from itw import sampler  # noqa: E402
from itw.overlooked import SOLOIST  # noqa: E402

SITE = HERE.parents[1]
OUT = SITE / 'public' / 'ill-tempered-week' / 'instruments'
RATE = 44100
KBPS = 72
LEAD = 0.05          # silence before the click
CLICK = 0.001        # the click the browser finds the start by
AFTER = 0.25         # silence after the click
GAP = 0.12           # silence between regions


def midi(hz: float) -> float:
    return 69 + 12 * math.log2(hz / 440.0)


# What Overlooked can ask of each instrument: (velocities, lowest Hz, highest Hz, longest note with its release in s).
# Read off itw/overlooked.py; src/lib/ill-tempered-week/perform-overlooked.test.ts holds the two together.
SOLO_VELOCITIES = (100, 104, 92, 84, 76, 68, 60, 52, 46)   # the answer, the tutti, the motif by its age
SOLO_SECONDS = 4.0
NEEDS: dict[str, list[tuple[tuple[int, ...], float, float, float]]] = {}
for _field, (_name, _centre) in SOLOIST.items():
    NEEDS.setdefault(_name, []).append((SOLO_VELOCITIES, _centre / 2 ** 1.2, _centre * 2 ** 1.2, SOLO_SECONDS))
for _name, _need in (
    ('ViolinEnsSpic', ((74,), 300.0, 1400.0, 2.6)),          # the canon, three eighths behind
    ('ViolaEnsSpic', ((70,), 150.0, 700.0, 2.6)),            # the canon, five eighths behind, an octave down
    ('UprightPiano', (tuple(range(46, 77)), 130.0, 500.0, 0.6)),   # the pulse of the motif's two lowest notes
    ('CelloEnsSusVib', ((64,), 110.0, 110.0, 4.0)),          # the held A
    ('ContrabassSusVB', ((60,), 41.2, 82.0, 4.0)),           # the motif's floor
    ('TubularBells', ((70,), 440.0, 440.0, 6.0)),            # the bell that opens a day
    ('FHornSus', ((96,), 220.0, 275.0, 13.0)),               # the tutti's chord, harmonics 4 and 5
    ('TromboneSus', ((96,), 330.0, 385.0, 13.0)),            # harmonics 6 and 7
    ('SViolinVib', ((60,), 880.0, 880.0, 9.5)),              # the coda's one high note
):
    NEEDS.setdefault(_name, []).append(_need)


def regions_for(name: str) -> list[tuple[dict, float]]:
    """The regions the press's pick() can choose for this instrument's needs, each with the seconds to keep."""
    inst = sampler.Instrument(name)
    keep: dict[int, float] = {}
    for velocities, lo, hi, seconds in NEEDS[name]:
        m = midi(lo) - 0.5
        while m <= midi(hi) + 0.5:
            for vel in velocities:
                cands = [r for r in inst.regions if r['lovel'] <= vel <= r['hivel']] or inst.regions
                inside = [r for r in cands if r['lokey'] <= int(round(m)) <= r['hikey']]
                pool = inside or sorted(cands, key=lambda r: abs(r['center'] - m))[:4]
                nearest = min(abs(r['center'] - m) for r in pool)
                for r in pool:
                    if abs(r['center'] - m) == nearest:
                        i = inst.regions.index(r)
                        keep[i] = max(keep.get(i, 0.0), seconds)
            m += 0.25
    return [(inst.regions[i], keep[i]) for i in sorted(keep)]


def build(name: str, check: bool) -> dict:
    picked = regions_for(name)
    parts = [np.zeros(int(LEAD * RATE)), np.full(int(CLICK * RATE), 0.9), np.zeros(int(AFTER * RATE))]
    at = AFTER
    index = []
    for r, seconds in picked:
        x, rate = sf.read(str(r['sample']), dtype='float64', always_2d=True)
        if rate != RATE:
            raise ValueError(f'{r["sample"]}: {rate} Hz, expected {RATE}')
        mono = x[r['offset']:].mean(axis=1)[:int(seconds * RATE)]
        fade = min(len(mono), int(0.03 * RATE))
        mono[-fade:] *= np.linspace(1.0, 0.0, fade)
        centre_hz = 440.0 * 2 ** ((r['center'] - 69 + r['tune'] / 100) / 12)
        index.append({'at': round(at, 4), 'seconds': round(len(mono) / RATE, 4), 'hz': round(centre_hz, 4),
                      'center': r['center'], 'lokey': r['lokey'], 'hikey': r['hikey'], 'lovel': r['lovel'],
                      'hivel': r['hivel'], 'volume': r['volume'], 'release': r['release'], 'seq': r['seq'],
                      'sample': str(Path(r['sample']).relative_to(sampler.ROOT))})
        parts += [mono, np.zeros(int(GAP * RATE))]
        at += len(mono) / RATE + GAP
    total = sum(len(p) for p in parts) / RATE
    entry = {'file': f'{name}.m4a', 'seconds': round(total, 3), 'regions': index}
    if check:
        return entry
    OUT.mkdir(parents=True, exist_ok=True)
    out = OUT / f'{name}.m4a'
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / f'{name}.wav'
        sf.write(wav, np.concatenate(parts), RATE, subtype='PCM_24')
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', str(wav), '-c:a', 'aac', '-b:a', f'{KBPS}k', '-ac', '1',
                        '-ar', str(RATE), '-movflags', '+faststart', str(out)], check=True)
    data = out.read_bytes()
    return {**entry, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()}


def main() -> None:
    check = '--check' in sys.argv
    instruments = {}
    for name in sorted(NEEDS):
        entry = build(name, check)
        instruments[name] = entry
        size = f'{entry["bytes"] / 1e6:.2f} MB' if 'bytes' in entry else 'not written'
        print(f'{name:16s} {len(entry["regions"]):3d} regions, {entry["seconds"]:7.1f} s, {size}')
    if check:
        print(f'{sum(e["seconds"] for e in instruments.values()):.0f} s in all')
        return
    index = {'library': 'VSCO 2 Community Edition 1.1.0 (Versilian Studios, CC0)', 'rate': RATE, 'lead': LEAD, 'click': CLICK,
             'encoding': f'AAC, {KBPS} kbit/s, mono', 'instruments': instruments}
    (OUT / 'index.json').write_text(json.dumps(index, indent=1) + '\n')
    print(f'{sum(e["bytes"] for e in instruments.values()) / 1e6:.1f} MB in {len(instruments)} files')


if __name__ == '__main__':
    main()
