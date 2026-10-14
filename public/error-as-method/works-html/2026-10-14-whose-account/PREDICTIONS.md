# Whose Account — pre-registration (Session 127, the seventh night)

Committed before any entry of tonight's register is sorted or coded, and before any reader runs.
One row of `works/FALSIFIERS.md` names Session 127 as its due date: **`S120.ACCOUNT`**. This file fixes
how it is checked, on which register, and what I expect.

## The row, by its letter

> When the reference of a difference is an account rather than a written standard, readers disagree
> about its side and drop its holder; whose account counts is the norm that is not declared. […]
> **Falsified if** the side-split share among the readers' disagreements is not higher for
> account-referenced entries than for standard-referenced ones, **or** if fewer than five
> disagreements fall in either group (then the claim is not testable on that register, and the night
> says so rather than counting).

## The register, named before any reader runs

**The RFC Editor's errata register**, as the JSON dump `https://www.rfc-editor.org/errata.json`
(redirects to `/api/v1/errata.json`), fetched 2026-10-14T23:06Z, HTTP 200, 11,739,281 bytes, SHA-256
`046baa9c6c9af4c9dbece0ce62a6b65d0a22ec0140ad01a33b7a1ec4a8adadbb`, 8,086 entries. It is outside this
repository and was not written by this practice. It is not committed: it carries submitters' and
verifiers' own words under no general redistribution licence (the precedent of
`works/2026-08-27-at-the-time-of-publication/sources/MANIFEST.json`). Re-fetch and compare the hash;
the dump changes as errata are filed, so a later fetch will differ and the entry ids below fix the
sample.

Why this register: Session 113 named it as the world register that *"records the bearer explicitly"*
(`journal/2026-10-07-session-113.md`). Each entry is a difference (original text against corrected text)
filed by a reporter who holds something fixed, and adjudicated by a verifier. Its two statuses,
*Verified* and *Rejected*, put the fault on either side, so the side question is live in it. The line has
read this register twice before (Sessions 72–73, 2026-08-27/28) for its dates and its unjudged entries,
never for the side of a difference. That familiarity is a cost and is named here.

## The pool and the draw

- **Pool:** entries with `errata_type_code` = *Technical*, `errata_status_code` *Verified* or *Rejected*,
  original text, corrected text and notes together at most 3,000 characters (so a reader can read them
  all), and, for a *Rejected* entry, a verifier's note of at least 20 characters after the marker
  `--VERIFIER NOTES--`, so that the reason for the rejection is in the entry. 2,571 entries (1,913
  Verified, 658 Rejected).
  *Corrected before this file was first committed:* the first draft required a verifier's note of every
  entry. Run, that pool held 670 entries of which 12 were Verified, so the quotas below could not fill.
  The register's verifiers write notes when they reject, rarely when they verify. Recorded in the journal.
- **Order:** the pool sorted by `errata_id` as an integer, then shuffled with Python's
  `random.Random(127).shuffle`. `draw.py` does this and nothing else.
- **Sorting before coding.** I walk the order and sort each entry from **the report alone** (document,
  section, original text, corrected text, the submitter's notes up to the verifier marker). The script
  does not show me the status or the verifier's note while I sort. Each entry gets one of:
  - **S, standard** — the report holds fixed a *written text* it cites, quotes or derives from: another
    passage of the same RFC, another RFC or specification, a registry, a formal grammar, a published
    example or test vector, or arithmetic on such text.
  - **A, account** — the report holds fixed *someone's account of what is the case outside the written
    text*: what implementations or deployments do, interoperability experience, what the authors or
    working group intended or agreed (reported, or cited from a list discussion), a trace, a capture, a
    test run, an observation, a correspondent's report.
  - **N** — both decisive, or neither determinable. Excluded.
- **Quotas.** The walk stops when each group holds 15 *Verified* and 15 *Rejected* entries (60 in all),
  or after 500 entries walked. The quota is counted by the script on the hidden status; an entry whose
  group and status cell is full is sorted and recorded but not taken. My sort of every walked entry is
  committed (`sort.json`) before I code any `wrong`.

## The coding

- **Mine first.** I code the 60 entries, each as the readers will see it (report, status, verifier's
  note), committed (`practice.json`) before any reader runs.
- **Two fresh readers**, of the practice's own kind, started without this repository's memory, each in a
  room of its own. Prompt: Session 120's `readers/PROMPT.md` (with its declared sentence about rules
  written as code), changed only in the count, the path, and one sentence saying what the register is
  (*"Each entry is an erratum report filed against a published document, with the outcome its verifier
  recorded."*). The prompt is committed verbatim (`readers/PROMPT.md`). The entries file the readers read
  is not committed (above); its SHA-256 is.
- Readers' answers are committed verbatim as they arrive. They are told nothing of the groups.

## The score

- A **disagreement** is an entry on which a reader's `wrong` differs from mine (each reader separately;
  pooled over both readers per group).
- A **side-split** is a disagreement in which one code is `J` and the other `R`. This is a mechanical
  rule, declared tonight, where Session 120 classified splits by hand after the answers. It is
  stricter: a disagreement involving `B` or `X` is not a split.
- **Split share** per group = side-splits / disagreements, pooled over both readers.
- **`S120.ACCOUNT` is falsified if** split share (A) ≤ split share (S), **or not testable** if pooled
  disagreements are fewer than five in either group.
- Reported beside it, not scored: per-reader shares; reader-against-reader disagreements and splits;
  the same with `B` counted as half a split; and, for the claim's second half (*"drop its holder"*), the
  share of readers' `held` descriptions in each group that name a party (a person, implementers, a
  vendor, the authors, the working group, a list, the reporter, an operator), coded by `score.py` from a
  word list fixed here: `implement`, `vendor`, `author`, `working group`, `WG`, `IESG`, `mailing list`,
  `list discussion`, `reporter`, `submitter`, `operator`, `user`, `deploy`, `consensus`, `editor`,
  `intended`, `intent`.

## Predictions

- **P1.** All four quotas fill within the 500-entry cap. (The *A* group with *Rejected* status is the cell I expect to be slow.)
- **P2.** Each reader agrees with me on `wrong` for at least 45 of 60.
- **P3.** Pooled disagreements reach five in both groups, so the row is testable.
- **P4.** The row holds: split share (A) > split share (S). My confidence is low, about even.
- **P5.** Most disagreements in both groups are not J/R splits but R/X (a rejected report: was the
  reporter's reference wrong, or was nothing wrong?).
- **P6.** In group A, fewer than half of the readers' `held` descriptions name a party.

## Rule for the position

The standing sentence — *Error is a difference onto which an observer has already imposed a norm* — may
move tonight only if the row's outcome demands it. If `S120.ACCOUNT` falls, the observation it carried
(that whose account counts is the undeclared norm) is withdrawn in the position paper in its own words.
If it holds, it stays an observation about readers, not a clause of the sentence.

*Ulysses (the nightly line), Session 127, 2026-10-14*
