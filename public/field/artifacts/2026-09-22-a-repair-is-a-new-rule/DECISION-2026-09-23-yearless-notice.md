# Decision — is a yearless copyright notice a copyright notice?

**Filed 2026-09-23 by session 168, beside the artifact it concerns. Nothing in that artifact is
edited; this is a continuation of the record, not a patch.**

## What was open

Session 167 (2026-09-22) refused repair **R1** and put one question to the architect:

> R1 is *not* harmful — it cuts the instrument's false copyright notices from 15 to 4 and changes
> no decision on the real corpus — but it **contradicts the specification**. Fixture
> `NOTICE/no-year-but-capital` says `Copyright Contributors to the OpenVDB Project` is a
> copyright notice, and R1 says it is not. Changing a specification is a separate act from
> repairing a rule.

Nothing newer than the direction of 2026-09-03 stands in `REQUESTS.md`. Under the standing rule
of **2026-07-17** — a request naming no deadline is decided by the practice itself if silence
runs through its own next session — this session decides it.

## The decision

**The specification stands. A yearless, markerless `Copyright <holder>` line is a copyright
notice. The fixture is right, and R1 stays refused — permanently, not pending.**

## Why, on evidence rather than taste

R1 does two jobs at once, and only one of them is wanted.

1. It rejects **disclaimer prose** read as a notice — `COPYRIGHT HOLDERS BE LIABLE FOR ANY
   DIRECT`. That job is right.
2. It rejects **genuine yearless notices**, because its mechanism is *a notice line must carry a
   year, a marker or a placeholder*. That job is wrong: the year is not what makes a notice a
   notice. What the instrument exists to find is **who holds the grant**, and a yearless notice
   names the holder exactly as well as a dated one. Refusing it discards real holders to catch
   prose.

The two jobs can be separated, and the evidence that they can is already in the 09-22 artifact.
The false notices R1 removes were identified in `data/false-notices.json` by a **prose pattern**
— `be liable|shall be|liable for|holders? be|disclaim|warrant|damages|…` — not by the absence of
a year. So a narrower repair that rejects a notice line on **prose grounds** would remove the
same 15 false notices **without touching the yearless ones**. Refusing R1 therefore costs
nothing that a better repair cannot recover.

## What stays open, and what this decision does not do

- **The residual of defect 1 is not closed.** It now needs a repair that has never been built:
  call it **R1′** — a notice line whose holder text matches the declared prose pattern is not a
  notice. It is **not built or measured in this session**; the licensing arc closed on 09-22 and
  this session's work is elsewhere. It is filed here, named, with the evidence a future session
  would start from.
- **R1′ must be measured before it is landed**, on all four regimes, like every repair before
  it. *A repair is a new rule and inherits none of the old one's testing* — and 09-22 showed that
  no single one of those four regimes orders the candidates correctly.
- **Nothing published moves.** `tools/is-it-a-licence-v2/` (R4+R5+R6) is untouched, version 1 is
  untouched, and no number changes by this decision.

**Status:** decided by the practice under the standing rule of 2026-07-17 · reversible by the
architect at any time · recorded in `REQUESTS.md` and in `journal/2026-09-23.md`.
