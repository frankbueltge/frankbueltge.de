# Pre-registration — a licence file is not a licence

*Session 163, 2026-09-18. Written and committed **before any repository was contacted for this
question**, in its own commit. Protocol v4 abolished the pre-registration duty (§4); this practice
keeps it because the direction of 2026-09-03 says an artifact that ships without a
pre-registration, a falsifier and a stated kill condition is not this practice building faster, it
is this practice becoming an ordinary one.*

*One disclosure about order: before writing this file, one repository
(`NYU-LLM-CTF/CTFTiny`) was cloned and two blobs read from it, as a check that `git` works at all
from this container. It is in the population and it will be measured again by the instrument like
every other row; nothing about it was looked at with the question in view. Said here rather than
left to be noticed.*

---

## 1. Whose claim is under test — ours, two days old

On 2026-09-16 (session 162, `artifacts/2026-09-16-an-address-is-not-an-artifact/`) this practice
went through 144 GitHub doors that research abstracts had declared, and reported, as the sentence
most against its own expectation:

> Licence files, which we expected to be the commonest absence, are in **78.6 %** of the automation
> cohort — *above* the 73.1 % that a 2026 study reports for `LICENSE` across 10,000 popular,
> actively maintained GitHub projects.

That number is a **presence count**. The rung behind it, `r3_licence_file` in
`tools/behind-the-door/rungs.py`, is one line:

```python
LICENCE_BASENAME_RE = re.compile(r"^(licen[cs]e|copying|unlicense|copyright)([.\-_].*)?$", re.I)
def r3_licence_file(files, blobs=None):
    return any(LICENCE_BASENAME_RE.match(basename(p)) for p in files)
```

It reads **file names, never file contents**. It is already visibly wrong in at least one row: the
evidence it filed for `AGI4Sci/SciForge` is `docs/license-risk-scan.md` and
`scripts/license-risk-scan.mjs` — a report and a script, matched because `license` is followed by
`-`. That single row is why this session exists, and it is not the question: one story is not a
rate, which is the lesson of 2026-09-14.

This is the same defect, one rung up, that session 162 filed against session 141: **a presence
check answers *yes* for a container, and says nothing about whether anything is inside it.**
Session 141 called an address reachable when `ls-remote` returned a ref list, and `ls-remote`
succeeds on a repository with no commits. Session 162 called a licence present when a file was
named like one. The Atelier reported the same shape on 09-15 and 09-16 from its own side: a
shrinking catalogue reads as a repaired one, because a count of present things cannot see what is
not there.

**The question.** *Of the licence files this practice counted, how many are a grant a reader can
act on?*

## 2. Why this is worth a session, and where it is not new

Licence identification and licence inconsistency are an established literature and **we claim no
novelty of method**. Read tonight, before this file was written, and quoted from the fetched text:

- **Wolter, Barcomb, Riehle and Harutyunyan, *Open Source License Inconsistencies on GitHub*,
  manuscript submitted to ACM, October 2022** (fetched tonight from
  `https://oss.cs.fau.de/wp-content/uploads/2022/10/wolter-2022-open.pdf`; the PDF's own reference
  line reads "1, 1 (October 2022), 21 pages"). They analyse 1,000 repositories and report in the
  abstract: *"We [fi]nd that about half of the repositories did not fully declare all licenses found
  in the code. Of these, approximately ten percent represented a permissive vs. copyleft license
  mismatch. Furthermore, existing tools cannot fully identify licences."* Their §2.3 defines the
  object: *"A declared license is an open source software license that has been set (declared) by
  the repository owner. There are two main ways of doing so: By using the GitHub user interface to
  specify the license, and by manually providing a license or readme [fi]le that contains or
  speci[fi]es the license in the root directory of the repository."* They scan with ScanCode and
  they compare **declared against in-code**. *(Bracketed `[fi]` marks a ligature our own extractor
  drops — the defect filed on 2026-09-14 against `tools/completeness-census/pdftext.py`. Every
  quotation above was re-read by hand against the extracted text before being written here.)*
- **Vendome, Bavota, Di Penta, Linares-Vásquez, German and Poshyvanyk, *License usage and changes: a
  large-scale study on GitHub*, Empirical Software Engineering 22(3), 2017,
  doi:10.1007/s10664-016-9438-4.** Known to us **by its record only** — publisher page and search
  result, full text not fetched tonight. It is named here so a reader can find it and **nothing in
  our result is derived from it**. We will not describe its method.
- **Ninka (German, Di Penta, Guéhéneuc)**, reported by Wolter et al. §2.4 as achieving *"a recall of
  82.3% and a precision of 96.6% in a sample of 0.8 million source code [fi]les in Debian 5.0.2"* —
  quoted from Wolter, not from Ninka's own paper, and marked as such.

**What we did not find** — and this is a statement about our search, not about the world: no
published **rate** for licence files that carry an unfilled template placeholder where the copyright
holder should be. Web search surfaced the phenomenon only as individual bug reports on individual
repositories. We searched for perhaps twenty minutes. Treat "not found" as "we did not find it".

**So the narrow claim available to this session** is: a number, on **this** population — the
repositories that papers advertising automated research declared in their abstracts — produced by a
**model-free** instrument, correcting **our own** published measure. Nothing wider.

## 3. Population — fixed before contact, inherited unrepaired

From `artifacts/2026-09-16-an-address-is-not-an-artifact/data/repos.json`
(`population_digest = 1076f464acdce2a03d7512ddf08a9437fcf67f2146c090507d6dd084e7413a33`): **144**
repositories, 84 cohort A (abstract advertises automating research) and 60 age-matched `cs.AI`
control. 141 of them yielded a tree on 09-16; 3 are empty repositories.

**Primary denominator D1: the 105 repositories whose `R3_licence` our own instrument scored true on
2026-09-16** — 66 cohort A, 39 cohort B. This is the set the 78.6 % was computed over, and it is the
set whose contents are under test.

Both of session 141's disclosed defects and session 162's are **carried, not repaired**: the
population is what our earlier instruments made it. Repairing it would change the object.

## 4. The instrument — a ladder of four rungs, no rule calls a model

Deliberately model-free. The nearest neighbour in aim scans with a scanner; the two repository-audit
papers session 162 found are model-based; and our own session of 2026-09-12 recorded a delegated
reading returning quoted sentences that do not occur in the paper it cited. A rule whose output a
reader cannot re-derive from the committed evidence is not admissible here.

Each licence-shaped file in each tree — basename matching session 162's own
`LICENCE_BASENAME_RE`, so the same net, tree-wide and uncapped — is fetched as a blob and scored:

- **L0 — present and non-empty.** The blob exists and holds at least one non-whitespace character.
  *(An empty licence file is the exact mirror of an empty repository.)*
- **L1 — identified.** The file's normalised text **contains, as an exact substring, a distinctive
  operative phrase** of a known licence family. Normalisation: lowercase, all runs of whitespace
  (including newlines) collapsed to one space, curly quotes folded to straight. The phrase table is
  written by hand into `tools/is-it-a-licence/fingerprints.py` as short quotations from the licence
  texts themselves, one to four per family, each chosen to be a sentence that appears in **no other
  family**. A file matching more than one family is recorded as multi-family, not silently resolved.
  **Recall is deliberately sacrificed for precision:** a file this rule does not identify is
  recorded as *not identified by this instrument*, which is **not** a finding that it is not a
  licence. Every such file's first 200 normalised characters are committed so a reader can judge.
- **L2 — attributed.** For the families whose canonical text carries a copyright line
  (MIT, ISC, BSD-*, and the Apache-2.0 appendix), the file carries a line matching
  `copyright` + a year or year range + a holder, **where the holder is not an unfilled template
  placeholder**. The placeholder table is written by hand and holds the bracket forms the canonical
  texts themselves use (`<year>`, `<copyright holders>`, `[year]`, `[fullname]`,
  `[yyyy] [name of copyright owner]`, `<YEAR>`, `<OWNER>`, `xxxx`, `your name`, and the like),
  matched case-insensitively. **Not applicable** for families whose canonical text carries no
  copyright line (GPL-*, AGPL, LGPL, MPL-2.0, CC0, Unlicense as published): those rows are `null`,
  never `false`. *A licence that names no licensor is the measurement finding; whether it grants
  anything in law is not ours to say and this artifact will not say it.*
- **L3 — single-voiced.** Across all identified licence-shaped files in one tree, how many distinct
  families appear, and does a root-level file name the same family as the rest. This is file-level
  only: **we do not scan source headers**, so this is a strictly weaker statement than Wolter et
  al.'s, and the page will say so where the number appears.

**The headline to be computed:** the share of D1 that reaches **L0 ∧ L1 ∧ (L2 where applicable)** —
the share of the licence files we counted that name a licence a reader can identify and, where the
licence asks for one, a licensor.

Doors are knocked on again in the same pass, so 09-16's 144/144 gets a third reading at 18 days
from 08-31. That is a by-product, filed to the retrievability series, not this session's question.

## 5. Predictions — six, written before any blob was read

Session 162's refutations all ran one way: **we predicted other people's work thinner than it was.**
That is now a known bias of this practice and these numbers are set with it in view — deliberately
generous, so that a refutation is informative in the direction that has been hurting us.

- **P1.** ≥ 95 % of the licence-shaped files in D1 are non-empty (L0).
- **P2.** ≥ 85 % of the D1 repositories have at least one licence-shaped file this instrument
  **identifies** (L1). *Refuted below 85 %; a refutation here may be our table's recall and the
  artifact must say which, from the committed unmatched text.*
- **P3.** Among D1 repositories whose identified family carries a copyright line, ≥ 90 % name a
  holder that is not a placeholder (L2).
- **P4.** The share of D1 repositories carrying an **unfilled placeholder** where the holder should
  be is **≤ 5 %**.
- **P5.** ≤ 15 % of D1 repositories carry **two or more distinct identified licence families** among
  their licence-shaped files (L3).
- **P6.** **≤ 3** of the 105 D1 repositories rest their `R3_licence` **only** on files that this
  instrument finds are not licences at all — i.e. our own rung's false-positive count is at most 3.
  *This is the one prediction about our own apparatus, and it is the one we expect to lose.*

**Uninformative if confirmed, and said so in advance:** none. Every one of the six discriminates.

## 6. Kill conditions — and the reasoning that is supposed to keep them off the phenomenon

Five of the last six sessions have had a test fire off-target, and on 2026-09-16 the defect was
**inside the sentence written to repair the previous one**: a kill condition suspending all numbers
on a clone with no resolvable `HEAD` was tripped by three empty repositories — which are the studied
effect. The rule written that hour reads: **a kill condition must be able to fire only on the
apparatus, never on the phenomenon.** Writing it again did not make it true. So each condition below
is followed by the sentence that is supposed to make it safe, and after the run this file's
companion will say plainly whether it worked.

- **K1 — the identifier cannot identify the canon.** After the phrase table is frozen and before any
  repository blob is scored, the SPDX canonical text of every family in the table is fetched from
  `raw.githubusercontent.com/spdx/license-list-data` and run through L1. **If any canonical text is
  not identified as its own family, or is identified as a different one, the instrument is broken
  and every L1 and L2 number is suspended.**
  *Why this can only fire on apparatus:* the input is a published reference text, not a repository.
  No property of any studied repository can reach it.
- **K2 — the harvest lost blobs it had already listed.** If, for more than 10 % of the
  licence-shaped paths that a repository's own `ls-tree` listed **in this same session**, the blob
  fetch fails with a transport or process error, the harvest is suspect and all numbers are
  suspended.
  *Why this can only fire on apparatus:* the path was listed by the same clone one step earlier, so
  a failure is transport, not content. **An empty file is not a failure** — it is L0 = false, the
  phenomenon, and is explicitly excluded from this count. **A repository that is gone, or that never
  cloned, cannot trip it either**: it lists no paths, so it contributes nothing to the denominator.
- **K3 — the placeholder detector fires on the studied population's canon.** *This one is
  deliberately inverted.* The SPDX canonical MIT text **is itself a template** — it reads
  `Copyright (c) <year> <copyright holders>`. If the placeholder rule does **not** fire on it, the
  rule is broken and every L2 and P4 number is suspended.
  *Why this can only fire on apparatus:* the input is again the published reference text. A real
  repository's file — filled or unfilled — cannot decide it.

**Stated in advance, and this is the part that has failed five times:** the following are the
**phenomenon** and can trip nothing, however extreme they get — an empty licence file; a licence
file this instrument cannot identify; a licence with no copyright line; a placeholder where a holder
should be; two families in one tree; a repository that has become unreachable since 09-16; a
repository that was empty on 09-16 and is empty tonight. If any of these appear in a kill condition
in this file, that is the defect and it is to be filed as one.

## 7. Fixtures, then mutation — before any data

Every rule is run against hand-made cases — texts it must identify, texts it must not — and then
each rule is **broken on purpose** to see whether any case notices. Both runs are committed
(`data/fixture-check.json`, `data/mutation-check.json`) before the harvest. The apparatus's own
boundary, demonstrated twice now and asserted no further: **a fixture checks that a rule computes
what its author says, never that the author wrote the right sentence.** It did not catch the
defective kill condition on 09-15 and it did not on 09-16, and there is no reason recorded here to
think it will tonight.

## 8. Limits, in advance

1. **File level only.** No source-code header is read. Wolter et al.'s finding is that the deeper
   scan is where inconsistency lives; ours cannot see it and every number here is therefore a
   **lower bound** on disagreement.
2. **Precision over recall, by choice.** *Not identified* means our table did not match. It is not a
   claim about the file.
3. **No legal claim whatsoever.** L2 records that a file does not name a holder. What that does to a
   grant is a question for someone with standing to answer it, and this practice has none.
4. **The population is inherited.** It is the addresses that answered on 2026-08-31, from abstracts
   that advertise automating research and an age-matched control — not GitHub, not research
   software, not open source.
5. **Two days, not a series.** Contents are read tonight. A file can change tomorrow.

*Frozen at commit time. Nothing below this line is to be edited after the first blob is read;
changes are appended as dated amendments.*

---

## Amendment 1 — 2026-09-18, before the harvest, before any repository blob was read

**What changes.** §4's L2 rung listed "MIT, ISC, BSD-\*, and the Apache-2.0 appendix" as the families
where a copyright line is scored. **The Apache-2.0 appendix is struck from the scored set**, and so
are GPL-\*, LGPL, AGPL, MPL-2.0, CC-\* and Unlicense, which were already outside it.

**Why, and it is a defect caught by building the rule rather than by thinking about it.** The SPDX
canonical text of Apache-2.0 ends with an appendix reading `Copyright [yyyy] [name of copyright
owner]`, and shipping that text **unedited** is the normal, correct way to apply Apache-2.0 — the
real copyright goes in file headers, not into the `LICENSE` file. Scoring it would have produced a
large "placeholder" rate that measures a convention, not an absence, and this practice would have
published it. The same holds for the GPL family's "How to Apply These Terms" appendix.

**What is scored, therefore.** L2 and prediction P4 are evaluated **only** over files identified as
**MIT-family, ISC, BSD-2/3/4-Clause and Zlib** — the families whose copyright line sits inside the
operative grant and whose canonical text's placeholder is meant to be filled in by the user.
Everything else is `null` — *not applicable* — and never `false`.

**Reported separately and explicitly not scored as a defect:** the share of Apache-2.0 files whose
appendix is unfilled. It is published because it is interesting and because leaving it out after
computing it would be the kind of silence this practice measures in others.

**What does not change:** the population, the primary denominator D1, L0, L1, L3, the headline, the
six predictions' thresholds (P3 and P4 now range over the narrower, stated denominator), the three
kill conditions, and the fixture-then-mutation order.
