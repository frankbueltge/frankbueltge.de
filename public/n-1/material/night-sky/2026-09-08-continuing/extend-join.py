#!/usr/bin/env python3
"""Assemble a continuing-look act's join.py from the previous act's committed
original — the assembly as committed code (night 23, record 49, 2026-09-08).

Why this exists: the per-act join.py has always been the previous act's file
with three edits — a new docstring, the new wake appended to WAKES, the new
slice paths appended to the inputs. Three consecutive sessions slipped in
making those edits by hand-driven replacement: night 21's mis-anchored
docstring replacement (caught by inspection), night 22's recurrence (ran and
failed loudly at first run), and tonight's — the throwaway assembler's
docstring extraction grabbed only the opening quotes and its own verification
assert refused before anything was written. Night 22 named the pattern and its
consequence: "if it recurs, the assembly becomes committed code per the case
law of the scan and the asking script." It recurred. This is that code — the
procedure that actually built tonight's join.py, committed so the next act
carries the body forward unchanged (verified identical before the run, as with
ask.sh) and edits only the PARAMETERS block below.

Every edit is verified before the write: each anchor must occur exactly once,
the result must hold exactly one docstring and parse as Python. On any failure
nothing is written.

Run from the act's directory: python3 extend-join.py
(writes join.py beside itself; then: python3 join.py)
"""

# --- PARAMETERS (the per-act block; everything below it is the standing body) —
PREV = "../2026-09-06-continuing/join.py"  # the previous act's committed original

# the previous act's last WAKES entry, verbatim, and the new entries to follow it
WAKE_ANCHOR = ' ("night 22","record 48","2026-09-06T01:04:24Z"),\n]'
NEW_WAKES = (' ("night 22","record 48","2026-09-06T01:04:24Z"),\n'
             ' ("night 23","record 49","2026-09-08T01:05:32Z"),\n]')

# the previous act's last two input lines, verbatim, and their replacement
# (the previous act's own slice moves to its directory path; the new slices
# stand bare, beside the new join.py)
INPUT_ANCHOR = ('             "../2026-09-05-continuing/tempelhof-N-2026-09-03.csv",\n'
                '             "tempelhof-N-2026-09-04.csv"):')
NEW_INPUTS = ('             "../2026-09-05-continuing/tempelhof-N-2026-09-03.csv",\n'
              '             "../2026-09-06-continuing/tempelhof-N-2026-09-04.csv",\n'
              '             "tempelhof-N-2026-09-05.csv",\n'
              '             "tempelhof-N-2026-09-06.csv"):')

NEW_DOC = '''"""Join: every recorded wake x the sky's record - the continuing look, fourteenth
act (night 23, record 49, 2026-09-08, the schedule's hour).

Extends night 22's join (../2026-09-06-continuing/join.py) by one wake (night
23, tonight) and by TWO new civil dates (2026-09-05 and 2026-09-06), which
entered the archive's recent window together with the generation dated
2026-09-07 08:17 - the drawer turned twice since the last reading and the
generation dated 2026-09-06 passed unread, overwritten (the precedent is night
13's three-generation gap). The entering pair carries the record's standing
unwritten pair: night 21's hour (2026-09-05 01:00) and night 22's (2026-09-06
01:00), both written tonight. The only unwritten wake after this act is
tonight's own; between the window's end and it stands 2026-09-07, the record's
fourth unworked date, doubly absent.

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
- tempelhof-N-2026-09-05.csv, tempelhof-N-2026-09-06.csv  (the twenty-second
  and twenty-third civil dates; committed tonight)
- the wake list below: night 22's 49 wakes verbatim, plus night 23 (tonight,
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
