#!/usr/bin/env python3
"""the ill-tempered week: press a week's Contrapunctus from the ledger (method doc
docs/design/2026-11-08-common-time-method.md).

Each week is one album, Contrapunctus N (N = its ISO week). Overlooked grows night by night: edition k is pressed
from the week's first k days and replaces the edition before. When all seven days are in the ledger, Unison and Turn
are pressed too and the album is complete; a complete album is never pressed again (the archive rule).

  python scripts/ill-tempered-week/press.py                 # the newest week in the ledger and the week before it:
                                                            # each one's next edition, and the rest of an album once
                                                            # its week is complete (so a week whose last night failed
                                                            # still completes the morning after)
  python scripts/ill-tempered-week/press.py 2026-W45        # that week, as far as the ledger holds it
  python scripts/ill-tempered-week/press.py --plan [WEEK]   # print work=true or work=false for the workflow, why to stderr

Writes public/ill-tempered-week/<week>/{overlooked,unison,turn}.m4a and src/data/ill-tempered-week/<week>.json.
Needs the VSCO 2 CE library (VSCO_ROOT) and the Kokoro model files (KOKORO_MODEL, KOKORO_VOICES).
"""
import json
import sys
import tempfile
from datetime import date, timedelta
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

import soundfile as sf  # noqa: E402

from itw import base, ledger  # noqa: E402

PUBLIC = base.SITE / 'public' / 'ill-tempered-week'
DATA = base.SITE / 'src' / 'data' / 'ill-tempered-week'
PIECES = ('overlooked', 'unison', 'turn')
FIRST = '2026-W45'  # the week the work began; the weeks before it were never pressed as albums

# The week chooses its form (Frank's decision of 2026-11-16, wording private; see the method doc's section of that name).
# A form is pressed only once every piece can be rendered in it AND its score can draw it; until then a week whose
# verdict is not ready is pressed in the standing form, and the album says so. Editions 1 to 6 of Overlooked are
# always the standing form: the character is only known when the week is.
ALL_FORMS = {'standing', 'held', 'mosaic', 'break', 'handover'}
READY = {'overlooked': ALL_FORMS, 'unison': ALL_FORMS, 'turn': ALL_FORMS}


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


def todo(week: str) -> tuple[list[str], str]:
    """The days this week would be pressed from now (none if nothing is due) and why: the tests press() makes."""
    if week < FIRST:
        return [], 'before the first album'
    held = set(ledger_days())
    days = [d for d in ledger.days_of(week) if d in held]
    if not days:
        return [], 'no day in the ledger yet'
    path = DATA / f'{week}.json'
    album = json.loads(path.read_text()) if path.exists() else {}
    if album.get('complete'):
        return [], 'complete, never pressed again'
    k = len(days)
    if album.get('pieces', {}).get('overlooked', {}).get('edition') == k and k < 7:
        return [], f'edition {k} already pressed'
    return days, f'edition {k} of Overlooked' + (', then Unison and Turn' if k == 7 else '')


def press(week: str) -> None:
    days, why = todo(week)
    print(f'{week}: {why}')
    if not days:
        return
    path = DATA / f'{week}.json'
    album = json.loads(path.read_text()) if path.exists() else {}
    k = len(days)
    from itw import character, overlooked
    ch = character.measure(days)
    ready = k == 7 and all(ch['verdict'] in READY[p] for p in PIECES)
    form = ch['verdict'] if ready else 'standing'
    ch = {**ch, 'days_read': k, 'form': form,
          'why': ('the verdict' if ready else 'editions 1 to 6 are the standing form' if k < 7
                  else f"no score draws the {ch['verdict']} form yet")}
    print(f"{week}: character {ch['verdict']} (hold {ch['hold']}, changes {ch['changes']}, break {ch['break']}), "
          f"pressed {form}: {ch['why']}")
    base.RECEIPTS.clear()
    if form == 'standing':
        x, rec = overlooked.render(days, hindsight=True)
    else:
        from itw import forms_overlooked
        x, rec = forms_overlooked.render(form, ch, days)
    pieces = dict(album.get('pieces', {}))
    pieces['overlooked'] = {**write_piece(week, 'overlooked', x, rec), 'edition': k}
    print(f'{week}: Overlooked, edition {k}, {pieces["overlooked"]["seconds"]} s')
    if k == 7:
        from itw import forms_turn, forms_unison, turn, unison
        for name, mod, formed in (('unison', unison, forms_unison), ('turn', turn, forms_turn)):
            ledger.use_days(days)
            x, rec = mod.render() if form == 'standing' else formed.render(form, ch)
            pieces[name] = write_piece(week, name, x, rec)
            print(f'{week}: {name.capitalize()}, {pieces[name]["seconds"]} s')
    number = int(week.split('-W')[1])
    album = {'work': 'the ill-tempered week', 'title': f'Contrapunctus {number}', 'week': week, 'days': days,
             'complete': k == 7, 'pressed': date.today().isoformat(), 'character': ch, 'pieces': {p: pieces[p] for p in PIECES if p in pieces},
             'library': 'VSCO 2 Community Edition 1.1.0 (Versilian Studios, CC0)', 'voices': 'Kokoro-82M (Apache 2.0), local',
             'receipts': dict(sorted(base.RECEIPTS.items()))}
    DATA.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(album, indent=1, ensure_ascii=False) + '\n')


def weeks() -> list[str]:
    """The newest week in the ledger and the week before it."""
    newest = date.fromisoformat(ledger_days()[-1])
    return sorted({(newest - timedelta(days=7)).strftime('%G-W%V'), newest.strftime('%G-W%V')})


def main() -> None:
    plan = '--plan' in sys.argv
    targets = [a for a in sys.argv[1:] if a != '--plan'] or weeks()
    if plan:
        due = False
        for week in targets:
            days, why = todo(week)
            print(f'{week}: {why}', file=sys.stderr)
            due = due or bool(days)
        print(f"work={'true' if due else 'false'}")
        return
    for week in targets:
        press(week)


if __name__ == '__main__':
    main()
