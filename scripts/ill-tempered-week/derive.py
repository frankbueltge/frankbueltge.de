#!/usr/bin/env python3
"""the ill-tempered week: what a record does not hold, derived after the fact and kept beside it.

Since 2026-11-14 the press records what the page's scores and its own performance of Overlooked need: how long each
sentence is said, the answering notes, the ensemble's entries, the coda's start, the factors of the mix, and each
sentence as spoken. An album pressed before that lacks them, and a committed record is never rewritten. This script
runs the renderer again on the same days, compares the audio it gets with the record's own hash, and writes only the
values the record lacks into src/data/ill-tempered-week/derived/<week>.json, with the sentences into
public/ill-tempered-week/perform/<week>/. The site reads a derived file only where the record is silent
(src/lib/ill-tempered-week/albums.ts), and the next pressing of a running week removes it.

  python scripts/ill-tempered-week/derive.py 2026-W45

Needs what the press needs: VSCO_ROOT, the Kokoro model files, ffmpeg or afconvert.
"""
import json
import sys
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

from itw import base, overlooked  # noqa: E402
import press  # noqa: E402

DAY_KEYS = ('speech_s', 'echo', 'entries_s')
PIECE_KEYS = ('coda_s', 'mix')


def main() -> None:
    week = sys.argv[1]
    album = json.loads((press.DATA / f'{week}.json').read_text())
    committed = album['pieces']['overlooked']
    base.RECEIPTS.clear()
    x, rec = overlooked.render(album['days'], hindsight=True)
    same_audio = base.digest(x) == committed['float32_sha256']
    same_notes = [a['text'] == b['text'] and a['motif'] == b['motif'] and a['motif_from_s'] == b['motif_from_s']
                  for a, b in zip(rec['days'], committed['days'])]
    print(f'{week}: audio {"identical to" if same_audio else "DIFFERENT from"} the record; '
          f'{sum(same_notes)} of {len(same_notes)} days with the record\'s own motif')
    piece = {k: rec[k] for k in PIECE_KEYS if k not in committed}
    days = []
    for mine, theirs, same in zip(rec['days'], committed['days'], same_notes):
        # a day's values are derived only where this run found the record's own motif: otherwise they would describe
        # another reading of the sentence than the one that was pressed
        days.append({'day': theirs['day'], **({k: mine[k] for k in DAY_KEYS if k not in theirs} if same else {})})
    derived = {'week': week, 'derived': date.today().isoformat(), 'same_audio': same_audio,
               'by': 'scripts/ill-tempered-week/derive.py: the renderer run again on the days the record names',
               'overlooked': {**piece, 'days': days}}
    out = press.DATA / 'derived'
    out.mkdir(parents=True, exist_ok=True)
    (out / f'{week}.json').write_text(json.dumps(derived, indent=1, ensure_ascii=False) + '\n')
    press.write_said(week, overlooked.LAST_SPEECH)
    print(f'{week}: derived {sorted(piece)} and, per day, {[sorted(d.keys() - {"day"}) for d in days]}')


if __name__ == '__main__':
    main()
