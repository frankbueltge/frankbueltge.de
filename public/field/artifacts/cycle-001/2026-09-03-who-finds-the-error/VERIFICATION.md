# Verification — who finds the error

**Verifier pass, adversarial, run against `PREREGISTRATION.md`, `METHOD.md` and `data/*.csv` only.**
The rendered page and `SUMMARY.md` were not opened.

## Verdict

The pre-registration is honest and the 16 SHIPPED rows are, with two real exceptions, faithfully
quoted and defensibly coded — but the census is **not exhaustive as claimed**: a full sibling
directory of numbered errata files (`drafts/2026-08-11-the-arm-that-was-missing/`) was missed by
the population search entirely, which is a material failure of §3's "fixed, and exhaustive," even
though — because that directory never shipped — it does not touch the P1 headline. Within the
SHIPPED stratum, one row (`works/2026-07-01-calibration-gap`) is coded uniformly
`self-unprompted` from a sentence that does not cover the row's own §9, which names an
**external-machine-gate** catch in the row's own words — an inconsistency that, notably, cuts
*against* the self-flattering reading, not toward it. One sensitivity figure in `METHOD.md` is
arithmetically wrong. None of what follows flips P1: on every reading tried here, including the
worst case for the practice's self-image, self-found corrections outnumber externally-triggered
ones in the shipped stratum by a wide margin, which is the opposite of what P1 predicted and is
consistent with what the census itself reports.

---

## 1. Quote fidelity

Of the 16 SHIPPED rows' 32 quote fields (`finder_quote` + `consequence_quote`), 27 are clean,
verbatim matches to source, and one row's exact origin-date framing is independently corroborated.
Five fields have a problem, in descending severity:

**Blend of two non-adjacent passages** — `artifacts/cycle-001/2026-09-01-a-door-to-knock-on/CORRECTIONS.md`,
row "2026-09-03 (session 146), defect 2." `finder_quote` in `data/corrections.csv` reads:
> "Found by re-reading our own shipped file, not by the re-probe. The second defect — the column — was found here, unprompted, while preparing to answer the first."

The first sentence is the opening line of `### 2. The machine_blocked column is not derivable from the
data committed beside it`. The second sentence is the final sentence of the file, in a separate
"**How it was found:**" paragraph that comes after an intervening `### 3.` section and mostly
describes defect 1's finder. The two sentences are real and both say the same thing (self-found),
but presenting them as one continuous quotation misstates the file's structure. Fix: quote only the
closing sentence, or mark the join.

**Unmarked mid-sentence elisions** (source shortened without an ellipsis, at a point that drops
real content rather than a bracket):

- `works/2026-07-26-one-line-for-ten-thousand/CORRECTIONS.md` — the source reads "...an excerpt
  that showed only the tail of the log: three hints about inline scripts and two unused-variable
  warnings, all in site-owned files, **none of them one of the 17 errors**. This practice could
  not tell..."; `finder_quote` silently drops the colon-clause and jumps straight to "This practice
  could not tell."
- `works/2026-08-03-where-the-reader-declines/CORRECTIONS.md` — the source reads "...not each
  other's answers, **and nothing about what any answer would do to any published number**. The
  decision rule — **what they would be shown, what would count as agreement, and what each degree
  of disagreement would oblige** — was committed..."; `finder_quote` drops both bolded clauses.
- `deliveries/2026-07-31-enai/ERRATA.md` §2 — source: "The figure is not wrong; the citation is
  incomplete in a way that matters, **because choosing among three published computations without
  saying so lets a single number look more settled than the paper makes it.**"; `consequence_quote`
  stops after "matters."
- `deliveries/2026-07-31-enai/ERRATA.md` §3 — source: "...and so is the work's description of what
  they mean: **the paper defines its Over-Detection Rate as "The percentage of AI-assisted abstracts
  labeled as 100 % AI by the tool, incorrectly attributing the entire text to AI and disregarding
  human contribution."** Only the table number is wrong."; `consequence_quote` splices past the
  bolded sentence.

None of these five invents a sentence the source does not contain, and none reverses a finding's
direction — but none is a "minor elision (an ellipsis, a dropped bracket)" either; each silently
removes a clause of real content. **Count: 5 quote-fidelity problems.**

The remaining 27 quote fields, including all 5 `ERRATA.md` `finder_quote` repetitions of the
sheet's shared "Who found these" paragraph and all 8 quotes checked against
`works/2026-07-26-unable-to-ring-its-own-bell/CORRECTIONS.md`, are verbatim.

## 2. Code fidelity

**One row I would recode or split:** `works/2026-07-01-calibration-gap/CORRECTIONS.md`,
"## 2026-08-01 (session 77) — the repair: one act, seven parts," coded `self-unprompted` on the
strength of the entry's opening sentence, quoted in full as `finder_quote`: "All seven were found
here, by us, before anything was sent — not by the receiver, and not by a reader." That sentence
is true of §1, §2, §4–7 but the same entry's own later subsections name two different mechanisms:

- `### 3.` "This was found by a hostile reader convened at session 76" — the
  `self-convened-adversary` class the census itself created (D3), not `self-unprompted`.
- `### 9. One edit made after the verdict, named rather than hidden`: **"The receiving site's
  build gate rejected the repaired file: `index.astro:208:81 — error ts(2345): ...`"** — this is,
  in the pre-registration's own words, "an automated gate outside this practice: the site build,"
  i.e. `external-machine-gate` — the same code correctly used for
  `works/2026-07-26-one-line-for-ten-thousand` elsewhere in this same `corrections.csv`.

The census applied exactly this "different finders named at numbered sub-headings" reasoning to
split `artifacts/.../a-door-to-knock-on` into two rows (deviation D2, `METHOD.md`: "attributes them
to different finders in one closing sentence… Coding it as one entry would have forced a single
finder onto two clearly separated attributions"). The calibration-gap entry has the same structure
— `### 1.`–`### 9.` sub-headings, at least three distinct named finding mechanisms — and was not
split, nor was the mismatch flagged in an `ambiguity` or `overlap_note` field the way the
re-coded `where-the-reader-declines` row was. **Worth stating plainly: fixing this does not help
P1's refutation — it would add at least one more `external-machine-gate` row (self 12, external 4,
in the base count), which moves the ratio *toward* P1, not away from it.** This is evidence the
census under-, not over-, counts external catches — the opposite of the failure mode this
verification was asked to hunt for, but still a real coding gap.

Every other SHIPPED row's code is well supported by its own `finder_quote`:
`works/2026-07-01-fairness-trap` (`self-machine-check`, an audit tool's sieve),
`works/2026-07-26-one-line-for-ten-thousand` (`external-machine-gate`, the site build),
both `works/2026-07-26-unable-to-ring-its-own-bell` rows (`self-unprompted` for a deliberate
self-measurement, `self-machine-check` for "the work's own suite: 94 tests… 1 fails"),
`works/2026-08-03-where-the-reader-declines` (`self-convened-adversary`, correctly re-coded by the
conductor from an initial `self-unprompted`, on a quote about two blind readers convened before
the input file existed), all three `a-door-to-knock-on` rows, both
`how-long-a-warning-stands` rows (`external-sibling` for the Studio's bulletin;
`self-after-external-prompt` — a genuine, disclosed judgment call, but its own quote — "Not
reported by anyone; it surfaced because their questions sent us back to the joins" — supports the
code as defined), and all five `ERRATA.md` rows (`self-unprompted`, on the sheet's own "checking
its own piece before sending it").

## 3. Completeness of the population

The literal search is faithfully executed: re-running a case-insensitive, `.git`-excluded search
for files named exactly `CORRECTIONS.md`, `ERRATA.md`, `CORRECTION.md` or `ERRATUM.md` returns the
same **13 files** listed in `data/population.txt`, and every per-file entry count in
`data/corrections.csv` (plus `data/excluded.csv`) reconciles exactly against a manual `## `-heading
count of each of the 13 files, including the declared exceptions: `drafts/2026-08-10-the-receiver-comes-first/CORRECTIONS.md`
has zero `## ` headings (confirmed) and its 9 bold-marked entries are exactly the 9 rows coded for
it (D1); `deliveries/2026-07-31-enai/ERRATA.md` has 6 headings, 1 excluded
(`data/excluded.csv`: "6. What was checked and holds… corrects nothing"), 5 coded — matches. The
inventory's claimed **46** total `## ` headings across the 13 files is exactly reproduced by manual
count (4+8+5+0+11+2+2+6+3+1+1+2+1 = 46), and 46 − 4 excluded + 9 (D1) + 1 (D2 split) = **52**,
matching the coded total. **Within the declared population, the coding is complete and correct.**

**The population itself is not exhaustive, and the pre-registration's own §3 title — "fixed, and
exhaustive" — is not true of the result.** A repo-wide search for any filename containing
`correct` or `errat` (not just the four exact names) turns up
`drafts/2026-08-11-the-arm-that-was-missing/ERRATA-121.md` through `ERRATA-139.md` — fifteen files
using a per-session numbered convention (`ERRATA-121.md`, `ERRATA-122.md`, …), none of which
matches the string "ERRATA.md" exactly and none of which is in `data/population.txt`. These are not
a different genre of document: `ERRATA-121.md` opens "# Errata of session 121 — every false
statement, with the value that is true" and its entries follow the identical form used everywhere
else in this census — "**Who found it.** This session found it at 20:47Z while the reviewers were
still running" is E1's finder sentence, structurally identical to what is coded elsewhere. A count
of `## E` / `### E` items across the 15 non-empty files in that directory (`ERRATA-121.md` through
`ERRATA-139.md`) gives roughly 60–70+ dated, codable entries (`ERRATA-121.md`: 8, `ERRATA-122.md`:
10 at `### E` level, `ERRATA-129.md`: 9, and so on) — more than the entire 36-row DRAFT stratum
currently published, missed in full.

This gap does **not** touch the SHIPPED-stratum P1 result: no `works/`, `artifacts/`, `deliveries/`
or `presentations/` directory named "the-arm-that-was-missing" exists (checked directly), so the
corrected object stayed in `drafts/` throughout and the entries belong to the DRAFT stratum. But it
is a serious, disclosed-nowhere gap in what the page can honestly call a census, and it means the
DRAFT-stratum count is not a census of drafts either — it is a census of five draft directories out
of what is now at least six, one of which alone likely holds more entries than all the others
combined.

## 4. The denominator

`data/shipped_units.csv`'s 31 rows are verified against the filesystem and against the
pre-registration commit `d619fde`. At that commit: `git ls-tree d619fde:works` lists exactly 22
directories, matching all 22 rows of kind `work`; `git ls-tree d619fde:artifacts/cycle-001` lists
exactly 7 directories (this census's own directory,
`2026-09-03-who-finds-the-error`, does not yet exist at that commit — confirmed absent — matching
`METHOD.md`'s stated exclusion: "This session's own artifact directory is excluded; it did not
exist when the population was fixed"); `deliveries/` has exactly 1 directory
(`2026-07-31-enai`); `presentations/` has exactly 1 cycle directory. 22+7+1+1 = **31**, matching.
No `artifacts/cycle-002` or other `presentations/` cycle exists to have been wrongly omitted. **The
denominator is correct and correctly sourced.**

## 5. Dates

Spot-checked every SHIPPED row's `correction_date`, `origin_date` and `origin_date_note` against
source; all pass, including the five flagged rows. `deliveries/2026-07-31-enai/ERRATA.md`'s five
rows carry `origin_date` 2026-07-01 rather than the delivery directory's own 2026-07-31, each with
`origin_date_note` "Entry states the defects had been standing on a published page since
2026-07-01; the corrected object is the work instrument 001
(works/2026-07-01-calibration-gap), not the delivery packet the sheet travels in" — and the source
supports this directly: `ERRATA.md`'s own header states "**Who found these.** … Four of the six had
been standing on a published page since 2026-07-01," and every one of its five items concerns
`works/2026-07-01-calibration-gap` by name or by its `data.json`. This is a correct application of
A2's rule (origin is the *corrected object's* directory date, and the corrected object here is
demonstrably instrument 001, not the delivery packet) rather than a rule-bend. Item 5's
`origin_date` of `unstated` is also correct: unlike items 1–4, §5 of `ERRATA.md` never places its
defect on the 2026-07-01 page, and `data/corrections.csv`'s note says so explicitly and accurately.
`works/2026-07-26-unable-to-ring-its-own-bell`'s second row correctly overrides the directory date
(2026-07-26) with 2026-07-28, quoting the source's own "the conflict has been live since
2026-07-28 — six days" verbatim in `origin_date_note`.

## 6. The deviations

**D1 (unit widened for markup).** Verified: `drafts/2026-08-10-the-receiver-comes-first/CORRECTIONS.md`
has zero `## ` headings and 9 bold `**C1 —**`-style entries, all captured. **Affects DRAFT only, as
claimed** — every SHIPPED file does use `## `. No effect on P1 in either direction.

**D2 (splitting the a-door-to-knock-on entry).** Legitimate: the source names two different finders
in adjacent numbered sub-headings with a closing sentence assigning each to a different mechanism.
Splitting adds one row to each side of the tally (1 self-unprompted + 1 external-sibling) rather
than forcing a single code onto two facts — it does not tilt the self/external *ratio*, only the
total *N*. Neutral on direction. (See §2 above: the census did **not** apply this same reasoning
to a structurally identical case, `works/2026-07-01-calibration-gap`, where doing so would push the
tally *toward* P1.)

**D3 (two new self-side codes).** Both are explicitly kept on the self side of P1, and this is
tested: the census's own text states the sensitivity if `self-convened-adversary` is read as
external instead ("the shipped bucket as 12–3 rather than 13–3") and if `self-after-external-prompt`
is read as external ("counted as external (12–4)"). **The second sensitivity's arithmetic is
correct** (moving 1 row from self to external: 13→12 self, 3→4 external = 12–4). **The first is
wrong**: moving `self-convened-adversary`'s one shipped row (`works/2026-08-03-where-the-reader-declines`)
from self to external must also increment external, giving **12–4**, not the stated **12–3**. As
stated, `METHOD.md` understates the external count by one in that sensitivity, which — marginally —
makes self-dominance look slightly stronger than it is (4:1 stated vs. the true 3:1). It does not
change the reported conclusion ("the verdict does not move," which is true at 12–4 too), and I found
no reason to think it is anything but an arithmetic slip, but it should be corrected before the page
ships a number built on it. Applying **both** reclassifications at once (a stricter reading than
either sensitivity offered) gives self 11, external 5 — P1 (external > self) is still refuted under
the most adversarial plausible reading of the ambiguous codes.

**Conductor re-code** (`works/2026-08-03-where-the-reader-declines`, self-unprompted →
self-convened-adversary). Self-to-self; verified against the row's own quote about two blind
readers convened before the input file existed; correctly reported as moving no bucket.

**Net effect of all deviations and the re-code on P1: none of them flip it, and none of them was
needed to refute it** — even the coding gap I found in §2, if corrected, would push the result
*toward* confirming P1 (more external, not less), which argues against, not for, a story of the
census tilting the scale to protect the practice's self-image.

## 7. Cherry-picking and loopholes

The pre-registration was written and committed (`d619fde`) before any correction entry was read,
and the falsifier for P1 is stated up front and is the one the actual data produce, so the design
is not rigged toward a predetermined answer in the obvious sense. Three weaker points:

1. **K3, as scoped, cannot catch the gap this verification found.** The completeness pass (§7 of
   `PREREGISTRATION.md`) searches "the journal (`journal/*.md`), `BULLETIN.md` and
   `STATE-OF-THE-FIELD.md`" for corrections to **shipped** work that were never filed in a
   `CORRECTIONS.md`/`ERRATA.md` — and it did real work at that: `data/completeness.csv`'s two
   entries are both verified against source (`journal/2026-07-03.md` lines 66-70 contain, verbatim,
   "shipped Instrument 001 corrected (Originality row rebuilt on the real RAID figures; displayed
   correction note added)," and `presentations/cycle-001/index.html` lines 75-83 contain the
   "Correction, 2026-09-03 (added, nothing removed)" note cross-filed against
   `artifacts/cycle-001/2026-09-01-a-door-to-knock-on/CORRECTIONS.md`). So K3 is not decoration
   for what it checks. But it never asks whether the *population itself* — the file-name search —
   is complete, and it does not cover the DRAFT stratum at all. A convention-drift case exactly
   like the one in §3 above (a whole arc filing its errata under a different name) is invisible to
   K3 by construction. The page should not claim K3 as a general completeness guarantee.
2. **K1 (< 10 shipped entries) and K2 (> 1/3 unstated) were real constraints, not decoration** — the
   actual counts (16 shipped, 0/16 unstated) are comfortably clear of both, but nothing about the
   pre-registration guaranteed that in advance; the population was fixed and the strata's sizes were
   not known until coding.
3. **Representativeness within the shipped stratum.** 6 of the 16 SHIPPED rows (the calibration-gap
   `CORRECTIONS.md` row plus all 5 `ERRATA.md` rows) concern the **same** underlying work,
   `works/2026-07-01-calibration-gap`, and all 6 are `self-unprompted` — that is 6 of the 8 total
   `self-unprompted` rows, 75 % of that bucket, from one work's unusually thorough pre-delivery
   review. This is not miscounted (§1–§2 above confirm each row is a real, distinct dated entry),
   but a reader should be told that the self-dominant result is not spread evenly across the 16
   works it is drawn from — it rests heavily on one work's review practice being repeated in two
   documents (`CORRECTIONS.md` and `ERRATA.md`) that the census's own `overlap_note` field already
   flags as substantially overlapping.

None of these three loosen a kill condition that could not fire, or narrow the population to a
favorable subset after the fact — the two real problems found here (the missed `drafts/2026-08-11-…`
directory, and the calibration-gap coding gap) both cut, if anything, against making the practice
look better, not for it.

---

## RECOMMENDATIONS

1. Re-run the population search for any filename containing `correct` or `errat` (not only the four
   exact names `CORRECTIONS.md`/`ERRATA.md`/`CORRECTION.md`/`ERRATUM.md`), starting from
   `drafts/2026-08-11-the-arm-that-was-missing/ERRATA-121.md` through `ERRATA-139.md` (15 files, an
   estimated 60–70+ dated entries), and either fold the DRAFT stratum's true population in or
   explicitly relabel the current 36-row DRAFT count as a partial sample, not a census.
2. Retitle or caveat §3 of `PREREGISTRATION.md` and the equivalent framing in `METHOD.md` — "fixed,
   and exhaustive" is not true of the population as executed; state instead that it is exhaustive
   for the four literal filenames searched.
3. Correct the arithmetic in `METHOD.md`'s D3 sensitivity sentence: "the shipped bucket as 12–3
   rather than 13–3" should read **12–4** (moving one row from self to external must add one to
   external, not leave it at 3).
4. Recode or split `works/2026-07-01-calibration-gap/CORRECTIONS.md`'s 2026-08-01 row: its own §9
   names an `external-machine-gate` catch (the receiving site's build gate) and its own §3 names a
   `self-convened-adversary` catch (a convened hostile reader), neither covered by the row's current
   `self-unprompted` code or its `finder_quote`. Apply the same "different finders at numbered
   sub-headings" rule used for deviation D2 to this entry, or at minimum add an `ambiguity` /
   `overlap_note` disclosing the mismatch as was done for the `where-the-reader-declines` re-code.
5. Fix the `finder_quote` for `artifacts/.../a-door-to-knock-on`'s "defect 2" row: it currently
   splices the opening line of `### 2.` to the closing line of the file's final "How it was found"
   paragraph as if they were one continuous sentence. Quote only the closing sentence, or mark the
   join.
6. Restore or ellipsis-mark the four other elided quote fields identified in §1
   (`works/2026-07-26-one-line-for-ten-thousand` `finder_quote`;
   `works/2026-08-03-where-the-reader-declines` `finder_quote`; `deliveries/2026-07-31-enai/ERRATA.md`
   §2 and §3 `consequence_quote`) so each is a genuinely contiguous excerpt.
7. Add a line to the page or `METHOD.md` noting that 6 of 16 SHIPPED rows (75 % of the
   `self-unprompted` bucket) come from a single work's overlapping pre-delivery review, so a reader
   does not read the self/external split as evenly sampled across the 16 works it is drawn from.
8. Extend the completeness pass (K3) in a future cycle to explicitly test the population's own
   file-name search — e.g. a content-shaped search ("How it was found" / "What was wrong" sections)
   independent of filename — rather than only searching the narrative record for unfiled shipped
   corrections; the current K3 cannot detect a convention-name drift like the one found in §3.
9. Keep, and repeat prominently on the page, the disclosure already in `METHOD.md` that 10 of 16
   shipped rows were coded by the same hand that wrote the prediction under test and that there was
   no blind second coder — this verification found the coding basically sound, but the margin under
   the most adversarial plausible reading (11–5) is close enough that independent re-coding of the
   shipped stratum would be worth doing before this finding is cited elsewhere.
