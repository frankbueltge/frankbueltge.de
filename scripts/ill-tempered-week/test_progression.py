"""The weeks build on each other: the rule that chooses each album's devices (itw/progression.py), held to its order,
its cycle and the albums on file.

  python -m unittest scripts/ill-tempered-week/test_progression.py    (stdlib only; the workflow runs it first)
"""
import sys
import unittest
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from itw.progression import DEVICES, OF_VERDICT, adds, last_motif, plan, previous, read_albums, taken_over  # noqa: E402

ON_FILE = read_albums(HERE.parents[1] / 'src' / 'data' / 'ill-tempered-week')
MOTIF = {'day': '2026-11-15', 'field': 'f', 'text': 't', 'instrument': 'FluteSusVib', 'motif_eighths': 8,
         'motif': [{'step': 0, 'hz': 440.0}, {'step': 3, 'hz': 495.0}]}


def album(week: str, devices: list[str] | None, cycle: int = 1, complete: bool = True) -> dict:
    a = {'week': week, 'complete': complete, 'pieces': {'overlooked': {'days': [MOTIF]}}}
    if devices is not None:
        a['progression'] = {'cycle': cycle, 'devices': devices}
    return a


class TheOrder(unittest.TestCase):
    def test_six_devices_each_verdict_its_own(self):
        self.assertEqual(len(set(DEVICES)), 6)
        self.assertEqual(set(OF_VERDICT.values()) <= set(DEVICES), True)
        self.assertEqual(adds('break', []), ('inversion', 'inversion'))
        self.assertEqual(adds('held', []), ('augmentation', 'augmentation'))
        self.assertEqual(adds('handover', []), ('second subject', 'second subject'))
        self.assertEqual(adds('mosaic', []), ('stretto', 'stretto'))

    def test_standing_takes_the_next_in_the_order(self):
        self.assertEqual(adds('standing', []), ('inversion', ''))
        self.assertEqual(adds('standing', ['inversion', 'stretto']), ('diminution', ''))

    def test_a_device_in_force_passes_to_the_next_in_the_order(self):
        self.assertEqual(adds('held', ['augmentation']), ('inversion', 'augmentation'))
        self.assertEqual(adds('mosaic', ['stretto', 'inversion', 'diminution']), ('augmentation', 'stretto'))

    def test_a_second_subject_needs_an_album_before(self):
        self.assertEqual(adds('handover', [], second_possible=False), ('inversion', 'second subject'))
        self.assertEqual(adds('standing', ['inversion', 'diminution', 'augmentation'], second_possible=False), ('stretto', ''))

    def test_nothing_left_to_add(self):
        self.assertEqual(adds('held', list(DEVICES)), (None, 'augmentation'))


class TheCycle(unittest.TestCase):
    def test_an_album_before_the_rule_begins_cycle_one(self):
        self.assertEqual(taken_over(None), (1, []))
        self.assertEqual(taken_over({'complete': True}), (1, []))

    def test_an_album_keeps_the_devices_before_it(self):
        self.assertEqual(taken_over(album('w', ['stretto', 'augmentation'], 2)), (2, ['stretto', 'augmentation']))

    def test_a_complete_cycle_begins_the_next(self):
        self.assertEqual(taken_over(album('w', list(DEVICES), 1)), (2, []))

    def test_editions_one_to_six_play_what_was_taken_over(self):
        albums = {'2026-W50': album('2026-W50', ['stretto']), '2026-W51': album('2026-W51', None, complete=False)}
        p = plan('2026-W51', None, albums)
        self.assertEqual((p['cycle'], p['step'], p['from'], p['devices'], p['added']), (1, 1, '2026-W50', ['stretto'], None))

    def test_the_seventh_pressing_adds_its_device_after_the_others(self):
        albums = {'2026-W50': album('2026-W50', ['stretto'])}
        p = plan('2026-W51', 'held', albums)
        self.assertEqual((p['devices'], p['added'], p['asked'], p['step']), (['stretto', 'augmentation'], 'augmentation', 'augmentation', 2))

    def test_six_weeks_fill_a_cycle_and_the_seventh_begins_again(self):
        albums: dict[str, dict] = {'2026-W49': album('2026-W49', None)}
        for n, verdict in zip(range(50, 57), ('held', 'held', 'mosaic', 'break', 'standing', 'held', 'mosaic')):
            week = f'2026-W{n}'
            p = plan(week, verdict, albums)
            albums[week] = {**album(week, None), 'progression': p}
        cycles = [albums[f'2026-W{n}']['progression'] for n in range(50, 57)]
        self.assertEqual([c['added'] for c in cycles],
                         ['augmentation', 'inversion', 'stretto', 'diminution', 'second subject', 'retrograde', 'stretto'])
        self.assertEqual([c['cycle'] for c in cycles], [1, 1, 1, 1, 1, 1, 2])
        self.assertEqual([c['step'] for c in cycles], [1, 2, 3, 4, 5, 6, 1])
        self.assertEqual(cycles[4]['second']['week'], '2026-W53')

    def test_the_album_before_is_the_newest_complete_one(self):
        albums = {'2026-W50': album('2026-W50', ['inversion']), '2026-W52': album('2026-W52', None, complete=False)}
        self.assertEqual(previous(albums, '2026-W53')[0], '2026-W50')
        self.assertIsNone(previous(albums, '2026-W50'))


class TheAlbumsOnFile(unittest.TestCase):
    def test_the_motif_an_album_ended_on(self):
        w46 = last_motif(ON_FILE['2026-W46'])                     # pressed standing: its days
        self.assertEqual((w46['day'], w46['field']), ('2026-11-15', ON_FILE['2026-W46']['pieces']['overlooked']['days'][-1]['field']))
        w47 = last_motif(ON_FILE['2026-W47'])                     # pressed as a mosaic: its parts
        self.assertEqual(w47['day'], '2026-11-22')
        for m in (w46, w47):
            self.assertEqual(sum(n['eighths'] for n in m['motif']) + m['motif'][0]['step'], m['eighths'])

    def test_the_first_album_under_the_rule_builds_on_contrapunctus_47(self):
        if '2026-W48' in ON_FILE and ON_FILE['2026-W48'].get('progression', {}).get('from') not in (None, '2026-W47'):
            self.skipTest('a later album is on file')
        p = plan('2026-W48', None, {w: a for w, a in ON_FILE.items() if w < '2026-W48'})
        self.assertEqual((p['cycle'], p['from'], p['devices']), (1, '2026-W47', []))


if __name__ == '__main__':
    unittest.main()
