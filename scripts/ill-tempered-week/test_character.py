"""The week's verdict, held to the ten weeks measured on 2026-11-16 (all read through round after-cycle-013's fields,
so weeks before the first round compare), and to the edges of each rule.

  python -m unittest scripts/ill-tempered-week/test_character.py      (stdlib only; the workflow runs it first)
"""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from itw.character import changes_of, classify, fold, hold_of  # noqa: E402

WEEKS = {  # week: (leads, break, verdict)
    '2026-W37': ('Iran Ukraine Iran Iran Iran Houthis Ukraine', 0.240, 'mosaic'),
    '2026-W38': ('Iran Iran Iran Iran Iran Iran Gaza', 0.136, 'held'),
    '2026-W39': ('Iran Iran Iran Iran Iran Iran Iran', 0.213, 'held'),
    '2026-W40': ('Iran Iran data_centers climate Iran Iran Ukraine', 0.214, 'mosaic'),
    '2026-W41': ('billionaires Iran Iran Iran Iran Iran Ukraine', 0.330, 'break'),
    '2026-W42': ('Iran Ukraine Ukraine Ukraine Ukraine Ukraine Ukraine', 0.130, 'held'),
    '2026-W43': ('Ukraine Houthis Ukraine Iran Ukraine Iran Ukraine', 0.187, 'mosaic'),
    '2026-W44': ('Iran Ukraine Iran inflation Iran climate Gaza', 0.346, 'break'),
    '2026-W45': ('Iran Iran Iran Iran Iran Iran Iran', 0.192, 'held'),
    '2026-W46': ('Iran Iran Iran Iran climate Ukraine COP31', 0.071, 'standing'),
}


class Verdicts(unittest.TestCase):
    def test_the_ten_measured_weeks(self):
        for week, (leads, brk, verdict) in WEEKS.items():
            with self.subTest(week=week):
                self.assertEqual(classify(leads.split(), brk), verdict)

    def test_handover_needs_two_days_before_and_three_after(self):
        self.assertEqual(classify('A A B B B B B'.split(), 0.1), 'handover')
        self.assertEqual(classify('A A A A B B B'.split(), 0.1), 'handover')
        self.assertEqual(classify('A A A A A B B'.split(), 0.1), 'held')      # only two days after
        self.assertEqual(classify('A C B B B B B'.split(), 0.1), 'held')      # the first lead did not hold

    def test_handover_comes_before_break(self):
        self.assertEqual(classify('A A B B B B B'.split(), 0.5), 'handover')

    def test_thresholds_are_inclusive(self):
        self.assertEqual(classify('A B A B A A C'.split(), 0.30), 'break')
        self.assertEqual(classify('A B A B A A C'.split(), 0.299), 'mosaic')
        self.assertEqual(classify('A A A A A B A'.split(), 0.0), 'held')
        self.assertEqual(classify('A A A A B A A'.split(), 0.0), 'standing')  # hold 4, two changes

    def test_counts(self):
        self.assertEqual(hold_of('A A B B B A'.split()), 3)
        self.assertEqual(changes_of('A A B B B A'.split()), 2)
        self.assertEqual(hold_of([]), 0)

    def test_variants_fold(self):
        self.assertEqual({fold(t) for t in ('Iran', 'Iranian', 'Hormuz', 'Tehran')}, {'Iran'})
        self.assertEqual(fold('climate'), 'climate')


if __name__ == '__main__':
    unittest.main()
