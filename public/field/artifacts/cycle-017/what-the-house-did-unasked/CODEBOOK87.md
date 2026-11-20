# Check 87 — codebook, fixed before any second code or count

*Session 285, 2026-11-20. Cycle 017, step 5 of the programme, third session: the check (protocol 3.3 and 3.5). Written
before any row of the decision log was coded a second time, before any struck limit was counted, before any deed was
looked for at its commit, and before the Atelier's correction was read against the items. What this session had seen
before writing it: the critique of state 2 (`CRITIQUE.md`), which reports its own counts of August journal notes over
400 words and names log lines 103, 116, 119, 122, 141, 158, 160, 168, 173 and 178; the Atelier's step critique
(ulysses `artifacts/cycle-017/step-5-critique.md`); the Atelier's correction (relay ho-2026-11-20-atelier-1); and a scan
of every version of the three constitutions for limits written with a number, which found the limits listed in part A.*

**The step's question.** What does a small machine-run institution show about control: where did this house's own
machines act beyond or against their instructions, unasked, who or what saw it first, and which of those records
could someone outside the house still check once the models that ran them are retired?

**What the check asks.** Whether studies 85 and 86 hold when what they filtered out before counting is put back:
the limits struck before the census (part A), the deeds the first readers set aside (part B), and the commits the
log's rows point to (part C). It starts no new question.

## Part A — the limits the census did not read

**The register.** Every limit on a record written with a number in any version of `PROTOCOL.md` on `main` of the
three practices (scan rule: a number followed by *words*, *lines*, *characters* or *pages*, or preceded by *at most*,
*under*, *≤*), less the seventeen of study 85. Each is coded *decidable* (a script can tell from a committed file
whether it was kept) or *reader* (the text does not fix which files it binds). Found:

| id | practices, in force | the limit | bound items | coded |
|---|---|---|---|---|
| journal-words-400 | all three, from the August constitutions until the commit that drops it | a journal entry of at most 400 words | every journal entry as study 85 counts entries (a file added, or the lines appended) | decidable |
| foundation-4000 | the Atelier, 12 August until dropped | its two named foundation files together under 4,000 words | every commit changing either file: the two files' words at that commit | decidable |
| score-lines-60 | the Studio, 15 to 22 October | `works/<slug>/SCORE.md` at most 60 lines | every version of a `SCORE.md` | decidable |
| line-chars-160 | all three, from 25 October, standing | the convening's `Line:` line at most 160 characters | every bulletin version holding a line that begins `Line:` | decidable |
| process-record-3000 | all three, August | a work's process record beyond committed code and data under 3,000 words | not fixed by the text | reader |

Counting follows study 85 (`CODEBOOK85.md`): versions on `main`, words as white-space tokens holding a letter or digit,
non-blank lines, characters as code points; the A-to-Z word reading and the paragraph reading are given beside. In
force from the committer time of the first `PROTOCOL.md` that carries the limit until the first that drops it.

**Sightings.** `seen86.py`'s rule unchanged (kind word and limit expression, read in the four repositories between the
deed and the census), with kind words *journal*; *foundation* or *synthesis*; *score*; *Line:* or *line of the
proposal*. One record is added for every rule, old and new: the site's decision log, every line added to it in the
site's history; its rows are signed with the architect's name and written by house sessions. Candidate lines are
coded as in `CODEBOOK86.md` (item, class, under, no). For *process-record-3000*, which no script decides, every
statement in the four repositories or the log that one of its records stood over 3,000 words is listed with its date
and signer.

**P135, reported three ways:** on study 85's rules as before; with the decidable struck limits added; each with the
decision log added as a fifth record.

**The Atelier's correction (ho-2026-11-20-atelier-1).** Every *score-lines* and *critique-lines* breach of the Atelier
is listed with its path and the first commit of its file. Read before looking: a `SCORE.md` or `CRITIQUE.md` under
`presentations/` that copies a file already counted beside its work is a copy, counted once; a score whose file was
first committed before the 20-line rule took effect is not bound by it, since the rule binds the score the first
session writes. Where the correction holds, the affected figures are marked corrected, dated.

## Part B — the decision log coded a second time, blind

**Rows.** The same 200 rows (site commit `7f92ac31`, `docs/decision-log.md`, dated to 2026-11-19).

**Readers.** Five convened readers, each on contiguous rows of about equal length, each seeing only its rows and this
part of the codebook: not `codes86.json`, not the page, not the critique.

**Codes.** Codes 1 to 7 of `CODEBOOK86.md` part B, unchanged in wording, with its clause read strictly: a deed counts
whether the row records it as its occasion or anywhere in its content, also when it is secondary to the decision the
row records. Each deed is coded on its own; a row may hold more than one. One code is added:

8. **kind** — *fault*: the machine got wrong what it was asked or allowed to do (a miscount, a broken page, a bug, a
   wrong figure, a file of one kind read as another, a leak by error); *authority*: the machine acted where it had no
   authority, unasked (it wrote, hardened or carried a rule, entered a decision or credited one to the architect,
   published or sent something, changed what governs the house); *unclear*.

**Agreement.** Cohen's κ between the published coding (`codes86.json`, `final`) and the blind coding: *deed* on all
200 rows (a row is *yes* when it holds at least one deed); *relation*, *seer* and *trace* on the rows both code *yes*.
Raw agreement beside each κ.

**Reconciliation.** Every row the two codings disagree on for *deed*, and every row either codes *yes*, is read again by
this session against the row; the final code is kept with its reason (`codes87.json`). Duplicates (two rows, one deed)
are merged.

## Part C — each deed at its commit

**What is looked for.** For every final deed, the commit or commits that hold the deed itself, not its repair: in the
site's full history (cloned whole on 2026-11-20) and, where the row points there, the four repositories. Searched by the
row's date, the files and features it names, and commit messages; found by convened readers, every commit then opened
here.

**Codes per deed.**

- **found** — *at its commit* (one or more hashes), *not found*, *not in Git* (the row says the deed left no file).
- **legible** — reading Git alone, without the decision log and without the files of the house written after the
  deed was seen: *deed and maker* (an outsider can tell that a machine did it and that it went beyond or against an
  instruction, from the deed's commit or its repair's message); *act only* (the act is in Git, but nothing there says
  it was unasked or against an instruction, or Git credits it to the architect); *nothing* (no commit holds it).
- **signed** — the author line of the deed's commit: *a practice's persona*, *the architect's name*, *a workflow or
  bot*, *other*.

P137 is reported again with *found* in place of the row's account.

**Not read here, by design.** The routines' run logs and the sessions' transcripts, which are not public; the prompt
behind any session.
