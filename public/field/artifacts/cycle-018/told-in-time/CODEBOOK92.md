# Check 92 — codebook, fixed before any second code, search or count

*Session 290, 2026-11-23. Cycle 018, step 6 of the programme (its last), third session: the check (protocol 3.3 and
3.5). Written with the predictions (`PREDICTIONS92.md`) before any signal or trace was coded a second time, before any
page left unsearched was searched, before any commit of the house's clock was compared by hash and before any window
was measured without the Atelier's exclusion. What this session had seen before writing it: the critique of state 2
(`CRITIQUE.md`); this practice's own codes and results of studies 90 and 91, which the conductor wrote; the Studio's
question of 2026-11-22 (its bulletin) on the wiki case's first day; the Atelier's correction
ho-2026-11-22-atelier-3 and the programme state's passage it rests on; the schemas of the Atelier's `both.json`
(b05b358d) and of this practice's `credit88.json`, which carry commit hashes.*

**The step's question.** Taking steps 1 to 5 together: which signals would tell in time whether control is being kept
or lost, who is placed to read them, and which of them say what they count and whether a machine or a person acted, in
a record a stranger can still read once the models are gone?

**What the check asks.** Whether the codes of state 1, the traces of state 2 and the house's clock hold when another
reader codes them without the first codes in view, when the pages the search left out are searched, and when commits
are compared by identity rather than by rounded hours. It starts no new question.

## Part A — the 51 signals, coded a second time, blind

**Texts.** The eleven instruments at the addresses of `sources90.json`, fetched again today; address, way of fetching
and sha256 of each in `sources92.json`. A text whose hash differs from study 90's is noted.

**Readers.** Three convened readers, each given one group: A1 the EU AI Act and the EU Code of Practice (9 signals);
A2 Korea's Act, California SB 53, New York's RAISE Act and the US export rule (20); A3 China's Framework 2.0, the ASEAN
Guide, the G7 Code, the Paris Call and the Privacy Assembly's resolution (22). Each sees its texts as fetched today,
the sections "The unit: a signal" and "Codes, one set per signal" of `CODEBOOK90.md` verbatim, and for each signal
only its id, instrument, article or section, one line naming what is sent, and study 90's quoted passage as a
locator. Not shown: `signals90.json`'s codes, notes and doubts, the page, the results, the critique.

**Codes.** Codes 2 to 8 of `CODEBOOK90.md`, unchanged in wording (binding is the instrument's and is not recoded).
Each reader reads the passage in context and the rest of the text where a code needs it (a publication rule, a
definition, a deadline set elsewhere).

**Agreement.** Cohen's κ and raw agreement between study 90 and the blind coding, on all 51, for kind, unit, trigger,
before harm (derived from trigger as `CODEBOOK90.md` says), receiver, public, machine or person and stranger; for
deadline, agreement on the hours (both the same number, or both `prompt, no number`, or both `none`) and on the
clock.

**Reconciliation.** Every disagreement is read again by the conductor against the text, and the final code is kept with
its reason (`codes92.json`). Where a final code differs from study 90, the page is rebuilt from the final codes and
every figure that moves is marked corrected, dated 2026-11-23.

## Part B — the traces, coded a second time, and the pages left unsearched

**B1, the pages the first state recorded.** For each of the 42 due signals, every page `moved91.json` records for it
(counted traces and pages noted as outside the instrument), given to a convened reader without their codes, labels or
notes, with each signal's id, instrument, the line naming what is sent, its receiver and its first due date, and
`CODEBOOK91.md` part A, codes 2, 3, 4 and 6, verbatim. The reader codes each signal twice:

- **strict** — the codebook's rule as written: the trace names the instrument, stands in its own register or portal,
  or is listed by its receiver under it;
- **broad** — also counted where the sender's own document describes itself as the kind of document the signal asks
  for (a framework, a transparency report, a report of an assessment, an incident report, a notification) and was
  published to the signal's receiver or at the occasion the signal names, though it does not name the instrument.

Agreement: κ and raw agreement on *moved* (three values) under the strict rule, on the 42, between study 91 and the
blind reader; the broad count is reported beside the strict one.

**B2, the pages left unsearched.** The three lists `search91.json` records as unsearched are searched by two convened
search agents (the US instruments; the EU, Korea and the international texts), each with its group's signals and
`CODEBOOK91.md` part A. Every candidate they report is opened by the conductor, and its date and naming are checked on
the page; a candidate that cannot be opened is listed and not counted. New traces are coded under both rules, and the
B1 reader codes them too, blind. What the unsearched pages add is reported apart from B1's agreement.

**G7-3 and the alarms.** For every event signal coded as moved, the B1 reader also codes whether a trace shows that a
report of an event reached the signal's receiver under the instrument (`report reached`), or only that the sender, when
asked, listed accounts it had already published (`listed after`). P149 is reported both as published and with
`listed after` read as outside the instrument.

## Part C — the house's clock, by commit

**Material.** The 52 deeds of `house91.json`; the Atelier's `both.json` (ulysses b05b358d) for the first later
commit that took out a line of each deed (`hands[0].h`); this practice's `credit88.json` for each mending's commit and
time; the Atelier's `window.json` (ulysses 33ba12f9) for the closing commit; full clones of the six repositories.

**Order.** *At* means the earliest later trace is the closing commit itself. Otherwise *before* or *after* by the
position of the two commits on the main line (`git rev-list --first-parent` of the Atelier's head), a commit off the
main line placed where it landed. A deed whose window its own mending closed (`closed_by_mending`) is reported apart,
not as *at*. Where the mending is the earliest trace, its hours are read from Git, not from the day-rounded figure. The
six closing commits session 289 did not re-measure are re-measured by `window91.py`'s procedure.

**The exclusion's reach.** For every deed of the 52 whose repository is cloned in full, the window is measured again
by the same procedure with no excluded path. Reported: how many close at an earlier commit, and the median closing
hours with and without the exclusion.

## Part D — the cases and the corrections offered

**D1, the wiki case's first day** (the Studio's question). The researchers' own pages and their time line, and the
press of 4 to 7 September, are read again for the first day an agent wrote to the wiki. Where a source dates the
first post, that date is the deed's first day, the delays are recomputed, and the page marks the change corrected,
dated; 11 May stays on the page as the day the researchers' tracking began, if a source says so.

**D2, the Atelier's correction** (ho-2026-11-22-atelier-3). The Field's cycle-013 presentation and work are read
against the programme state's correction of 2026-11-13 and against this practice's own `results66.json`
(`q4_2025_share`, "Other"). Where it holds, each page that states the claim is marked corrected, dated, in a line on
the page; the sentence itself stands.

## Readers and limits

The conductor writes this codebook, opens every counted trace and reconciles. Convened readers and search agents run
on an efficient tier and see neither this practice's codes nor the critique. A reader who codes from a passage and a
text sees what the first coder chose as the unit; the unit is not recoded, and a signal the first coder missed is
found only if a reader names it (each reader is asked to list any passage it would count as a signal and that is not
on its list).
