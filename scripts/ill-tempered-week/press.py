#!/usr/bin/env python3
"""The Ill-Tempered Week: press a week's Contrapunctus from the ledger (method doc
docs/design/2026-11-08-common-time-method.md).

Each week is one album, Contrapunctus N (N = its ISO week). Overlooked grows night by night: edition k is pressed
from the week's first k days and replaces the edition before. When all seven days are in the ledger, Unison and Turn
are pressed too and the album is complete; a complete album is never pressed again (the archive rule).

  python scripts/ill-tempered-week/press.py                 # the newest week in the ledger: its next edition,
                                                            # and the rest of the album once the week is complete
  python scripts/ill-tempered-week/press.py 2026-W45        # that week, as far as the ledger holds it

Writes public/ill-tempered-week/<week>/{overlooked,unison,turn}.m4a and src/data/ill-tempered-week/<week>.json.
Needs the VSCO 2 CE library (VSCO_ROOT) and the Kokoro model files (KOKORO_MODEL, KOKORO_VOICES).
"""
import json
import sys
import tempfile
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import soundfile as sf  # noqa: E402

from itw import base, ledger  # noqa: E402

PUBLIC = base.SITE / 'public' / 'ill-tempered-week'
DATA = base.SITE / 'src' / 'data' / 'ill-tempered-week'
PIECES = ('overlooked', 'unison', 'turn')


def ledger_days() -> list[str]:
    return sorted(p.stem for p in (base.SITE / 'src' / 'data' / 'trending').glob('20*.json'))


def write_piece(week: str, piece: str, x, record: dict) -> dict:
    out = PUBLIC / week
    out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / f'{piece}.wav'
        sf.write(wav, x.T, base.SR, subtype='PCM_24')
        base.encode(wav, out / f'{piece}.m4a')
    import pyloudnorm
    import numpy as np
    L = pyloudnorm.Meter(base.SR).integrated_loudness(x.T)
    return {**record, 'audio': f'/ill-tempered-week/{week}/{piece}.m4a', 'seconds': round(x.shape[1] / base.SR, 2),
            'lufs': round(L, 2) if np.isfinite(L) else None,
            'true_peak_dbtp': round(20 * np.log10(max(1e-12, base.true_peak(x))), 2), 'float32_sha256': base.digest(x)}


def press(week: str) -> None:
    days = [d for d in ledger.days_of(week) if d in set(ledger_days())]
    if not days:
        print(f'{week}: no day in the ledger yet')
        return
    path = DATA / f'{week}.json'
    album = json.loads(path.read_text()) if path.exists() else {}
    if album.get('complete'):
        print(f'{week}: complete, never pressed again')
        return
    k = len(days)
    if album.get('pieces', {}).get('overlooked', {}).get('edition') == k and k < 7:
        print(f'{week}: edition {k} already pressed')
        return
    from itw import overlooked
    base.RECEIPTS.clear()
    x, rec = overlooked.render(days, hindsight=True)
    pieces = dict(album.get('pieces', {}))
    pieces['overlooked'] = {**write_piece(week, 'overlooked', x, rec), 'edition': k}
    print(f'{week}: Overlooked, edition {k}, {pieces["overlooked"]["seconds"]} s')
    if k == 7:
        from itw import turn, unison
        for name, mod in (('unison', unison), ('turn', turn)):
            ledger.use_days(days)
            x, rec = mod.render()
            pieces[name] = write_piece(week, name, x, rec)
            print(f'{week}: {name.capitalize()}, {pieces[name]["seconds"]} s')
    number = int(week.split('-W')[1])
    album = {'work': 'The Ill-Tempered Week', 'title': f'Contrapunctus {number}', 'week': week, 'days': days,
             'complete': k == 7, 'pressed': date.today().isoformat(), 'pieces': {p: pieces[p] for p in PIECES if p in pieces},
             'library': 'VSCO 2 Community Edition 1.1.0 (Versilian Studios, CC0)', 'voices': 'Kokoro-82M (Apache 2.0), local',
             'receipts': dict(sorted(base.RECEIPTS.items()))}
    DATA.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(album, indent=1, ensure_ascii=False) + '\n')


def main() -> None:
    if len(sys.argv) > 1:
        press(sys.argv[1])
        return
    newest = ledger_days()[-1]
    press(date.fromisoformat(newest).strftime('%G-W%V'))


if __name__ == '__main__':
    main()
