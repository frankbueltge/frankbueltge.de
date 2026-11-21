# Codebook — reading 88, for the paper (session 286, 2026-11-21)

*Fixed before any repair commit was opened for this reading (see `PREDICTIONS88.md` for the five read before).
Decidable by script from Git alone; no reader codes anything.*

**Units.** The final deeds of check 87 (`commits87.json`), 88 in all. The reading's set is the deeds found *at its
commit* whose `repair` field names a commit: 77 by check 87's record. Every other deed is reported and left out of
P141 to P143.

**Where a commit is looked for.** In commit-only (treeless) clones of the seven repositories check 87 used:
frankbueltge.de, field-research, ulysses, studio, research-ecology, error-as-method, machine-attention, all branches
and tags as GitHub serves them on 2026-11-21. A deed's commit is looked for in the repository check 87 names for it; a
repair, which check 87 records by hash only, in all seven, and the first repository that holds it is its home. A
repair found in none is reported as *not found* and left out.

**Codes, per deed in the set.**

| code | rule |
|---|---|
| `names_deed` | the repair's full commit message (subject and body) contains a prefix of at least seven hexadecimal characters of any of the deed's commits, case-insensitive; or the subject of one of the deed's commits ends in a pull-request number `(#N)` and the repair's message contains `#N` as a whole token. Either counts; both are recorded apart |
| `repair_signer` | the repair's author line, coded as in check 87: *the architect's name* (Frank Bültge), *a practice's persona* (Meridian, Ulysses or Assay, Ensemble, any suffix), *a workflow or bot*, or *other* |
| `same_signer` | the repair's signer code equals the deed's first commit's signer code |
| `lag_days` | the repair's author time minus the earliest author time among the deed's commits, in days to one decimal; negative where the repair predates the deed (reported, kept in the median) |
| `says_machine` | the repair's message contains, as a whole word, *session*, *sessions*, *agent*, *model*, *machine*, *practice*, *routine*, *Meridian*, *Ulysses*, *Assay* or *Ensemble*: a word an outsider could read as naming a machine of the house. Descriptive, not a prediction |

**Reported.** Each prediction on the whole set and without the five deeds read before. Counts, not estimates: the 77
are the deeds the log holds, not a sample, so no interval is given.

**Addendum after the count (2026-11-21, written after the first run, before any figure was put on the page).** The
codebook did not foresee that check 87 records, for 7 of the 77 deeds, a repair that is itself one of the deed's own
commits: a commit that made and mended in one. For six of the seven `names_deed` is met trivially (the commit carries
its own pull-request number). The predictions are judged as written; the deeds whose repair is a separate commit (70) are
reported beside them, as `repair_apart` in `credit88.json`.
