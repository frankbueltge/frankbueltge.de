"""The week's character, and the form each piece takes from it (method doc, "The week chooses its form").

Read once per album from every field of the round the edition reads (the attention of the whole week, not of one
piece's field), and recorded in the album. Four numbers:

  leads    the leading term of each day: the term named by the most signals of that day across all fields, after
           folding a story's variants into one name (STORY, below)
  hold     the longest run of days with the same lead (1 to 7)
  changes  how often the lead changed from one day to the next (0 to 6)
  break    the sharpest overnight change in what the web attended to: the largest Jensen-Shannon distance (base 2,
           0 same, 1 disjoint) between the field shares of two consecutive days, and the day it reached

One verdict, in a fixed order, so every week gets exactly one (classify, below):

  handover  the first lead held at least two days, then another lead holds from some day to the end, at least
            three days
  break     break >= 0.30
  held      hold >= 5
  mosaic    changes >= 4
  standing  everything else: the form the pieces had before the week chose (the first template of 9 November)
"""
import collections
import math

BREAK = 0.30
HELD = 5
MOSAIC = 4
FORMS = ('handover', 'break', 'held', 'mosaic', 'standing')

# a story's variants, folded into one name before the leads are counted
STORY = {'Ukrainian': 'Ukraine', 'Ukrainians': 'Ukraine', 'Kyiv': 'Ukraine', 'Iranian': 'Iran', 'Tehran': 'Iran',
         'Hormuz': 'Iran', 'Houthi': 'Houthis', 'Israeli': 'Israel', 'Russian': 'Russia', 'Moscow': 'Russia'}


def fold(term: str) -> str:
    return STORY.get(term, term)


def classify(leads: list[str], brk: float) -> str:
    """The verdict from the leads of the days and the break, in the order of the module docstring."""
    n = len(leads)
    if n >= 5 and leads[0] == leads[1]:
        for i in range(2, n - 2):
            if leads[i] != leads[0] and all(x == leads[i] for x in leads[i:]):
                return 'handover'
    if brk >= BREAK:
        return 'break'
    if hold_of(leads) >= HELD:
        return 'held'
    if changes_of(leads) >= MOSAIC:
        return 'mosaic'
    return 'standing'


def hold_of(leads: list[str]) -> int:
    best = run = 1 if leads else 0
    for a, b in zip(leads, leads[1:]):
        run = run + 1 if a == b else 1
        best = max(best, run)
    return best


def changes_of(leads: list[str]) -> int:
    return sum(1 for a, b in zip(leads, leads[1:]) if a != b)


def js(p: list[float], q: list[float]) -> float:
    m = [(x + y) / 2 for x, y in zip(p, q)]

    def kl(a, b):
        return sum(x * math.log2(x / y) for x, y in zip(a, b) if x > 0)
    return kl(p, m) / 2 + kl(q, m) / 2


def measure(days: list[str]) -> dict:
    """The character of the days (the ledger's days so far), with the round they were read through."""
    from . import ledger  # here, so the verdict and its tests need nothing outside the standard library
    ledger.use_days(days)
    rnd = ledger.load(f'src/data/ducking/rounds/{ledger.ROUND}.json')
    fields = [c['id'] for c in rnd['channels']]
    counts = {d: [0] * len(fields) for d in days}
    terms = {d: collections.Counter() for d in days}
    for i, f in enumerate(fields):
        _, wk = ledger.field_week(f)
        for d in wk:
            counts[d['day']][i] = d['count']
            for s in d['signals']:
                terms[d['day']].update({fold(t) for t in s['terms']})
    # a tie goes to the term first in alphabetical order, so a lead never depends on the order signals arrive in
    leads = [min(terms[d].items(), key=lambda kv: (-kv[1], kv[0]))[0] if terms[d] else '' for d in days]

    def shares(v):
        s = sum(v) or 1
        return [x / s for x in v]
    jumps = [(round(js(shares(counts[a]), shares(counts[b])), 3), b) for a, b in zip(days, days[1:])]
    brk, brk_day = max(jumps) if jumps else (0.0, None)
    return {'round': ledger.ROUND, 'leads': leads, 'hold': hold_of(leads), 'changes': changes_of(leads),
            'break': brk, 'break_day': brk_day, 'verdict': classify(leads, brk),
            'thresholds': {'break': BREAK, 'held': HELD, 'mosaic': MOSAIC}}
