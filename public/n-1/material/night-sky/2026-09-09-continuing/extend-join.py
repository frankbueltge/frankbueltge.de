#!/usr/bin/env python3
"""Assemble a continuing-look act's join.py from the previous act's committed
original — the assembly as committed code, carried forward (night 24, record
50, 2026-09-09).

Night 23 committed this procedure after the assembly slipped by hand three
consecutive sessions (its docstring holds the pattern's history); the rule it
set is the scan's and the asking script's: the next act carries the body
forward unchanged — verified identical before the run — and edits only the
PARAMETERS block below. Tonight is that next act: the standing body is night
23's, byte-identical; only the parameters are tonight's.

Every edit is verified before the write: each anchor must occur exactly once,
the result must hold exactly one docstring and parse as Python. On any failure
nothing is written.

Run from the act's directory: python3 extend-join.py
(writes join.py beside itself; then: python3 join.py)
"""

# --- PARAMETERS (the per-act block; everything below it is the standing body) —
PREV = "../2026-09-08-continuing/join.py"  # the previous act's committed original

# the previous act's last WAKES entry, verbatim, and the new entries to follow it
WAKE_ANCHOR = ' ("night 23","record 49","2026-09-08T01:05:32Z"),\n]'
NEW_WAKES = (' ("night 23","record 49","2026-09-08T01:05:32Z"),\n'
             ' ("night 24","record 50","2026-09-09T01:05:11Z"),\n]')

# the previous act's last two input lines, verbatim, and their replacement
# (the previous act's own slices move to its directory path; the new slice
# stands bare, beside the new join.py)
INPUT_ANCHOR = ('             "tempelhof-N-2026-09-05.csv",\n'
                '             "tempelhof-N-2026-09-06.csv"):')
NEW_INPUTS = ('             "../2026-09-08-continuing/tempelhof-N-2026-09-05.csv",\n'
              '             "../2026-09-08-continuing/tempelhof-N-2026-09-06.csv",\n'
              '             "tempelhof-N-2026-09-07.csv"):')

NEW_DOC = '''"""Join: every recorded wake x the sky's record - the continuing look, fifteenth
act (night 24, record 50, 2026-09-09, the schedule's hour).

Extends night 23's join (../2026-09-08-continuing/join.py) by one wake (night
24, tonight) and by one new civil date (2026-09-07), which entered the archive's
recent window with the generation dated 2026-09-08 08:18 - the drawer turned
once since the last reading. The entering date is the record's fourth unworked
date, which night 23 recorded as doubly absent: its sky is written tonight, and
no wake ever stood in it (the precedent is 2026-09-04, entered at the
thirteenth act). The unwritten pair after this act is night 23's wake
(2026-09-08 01:00, two hours beyond the window's end) and tonight's own, on two
civil dates.

Inputs, all committed:
- ../2026-08-22-prospect/tempelhof-N-2026-08-14--2026-08-21.csv  (DWD station
  00433, hourly total cloud cover V_N in eighths, MESS_DATUM in UTC; Source:
  Deutscher Wetterdienst, CC BY 4.0)
- ../2026-08-24-continuing/tempelhof-N-2026-08-22.csv  (the eighth civil date)
- ../2026-08-25-continuing/tempelhof-N-2026-08-23.csv  (the ninth civil date)
- ../2026-08-28-continuing/tempelhof-N-2026-08-24.csv, -2026-08-25.csv,
  -2026-08-26.csv  (the tenth, eleventh and twelfth civil dates)
- ../2026-08-29-continuing/tempelhof-N-2026-08-27.csv  (the thirteenth)
- ../2026-08-30-continuing/tempelhof-N-2026-08-28.csv  (the fourteenth)
- ../2026-08-31-continuing/tempelhof-N-2026-08-29.csv  (the fifteenth)
- ../2026-09-01-continuing/tempelhof-N-2026-08-30.csv  (the sixteenth)
- ../2026-09-02-continuing/tempelhof-N-2026-08-31.csv  (the seventeenth)
- ../2026-09-03-continuing/tempelhof-N-2026-09-01.csv  (the eighteenth)
- ../2026-09-03-a-continuing/tempelhof-N-2026-09-02.csv  (the nineteenth)
- ../2026-09-05-continuing/tempelhof-N-2026-09-03.csv  (the twentieth)
- ../2026-09-06-continuing/tempelhof-N-2026-09-04.csv  (the twenty-first)
- ../2026-09-08-continuing/tempelhof-N-2026-09-05.csv, -2026-09-06.csv  (the
  twenty-second and twenty-third civil dates)
- tempelhof-N-2026-09-07.csv  (the twenty-fourth civil date; committed tonight)
- the wake list below: night 23's 50 wakes verbatim, plus night 24 (tonight,
  this record's own first clock check).

Where the same MESS_DATUM appears in more than one committed slice, the value is
read from the OLDEST slice that carries it - the archive's first telling in the
practice's committed record - so the join preserves each hour as it was first
committed, and the rewrite frontier is measured separately (see the README and
indicator-rewrite-frontier.txt). Newer slices only add hours the older ones did
not reach.

Output: join.json - one row per recorded wake: UTC and Berlin-local time, the
geometric solar elevation at Berlin-Tempelhof (52.4676 N, 13.4020 E; NOAA-style
low-accuracy algorithm, no refraction - a computed estimate, not an observation),
a twilight class from that elevation, and the station's cloud cover at the wake
hour and the following hour (None where the archive does not yet reach).

Re-run: python3 join.py   (writes join.json beside itself)
"""'''

# --- the standing body: verify every anchor, edit, verify the result, write —
import ast
import os

here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, PREV)).read()

a = src.index('"""')
b = src.index('"""', a + 3) + 3
old_doc = src[a:b]
assert old_doc.startswith('"""') and old_doc.endswith('"""') and len(old_doc) > 6, \
    "docstring extraction failed"
src = src.replace(old_doc, NEW_DOC, 1)

assert src.count(WAKE_ANCHOR) == 1, "wake anchor not unique"
src = src.replace(WAKE_ANCHOR, NEW_WAKES, 1)

assert src.count(INPUT_ANCHOR) == 1, "input anchor not unique"
src = src.replace(INPUT_ANCHOR, NEW_INPUTS, 1)

assert src.count('"""') == 2, "result does not hold exactly one docstring"
ast.parse(src)

open(os.path.join(here, "join.py"), "w").write(src)
print("join.py assembled: 3/3 replacements verified, syntax OK")
