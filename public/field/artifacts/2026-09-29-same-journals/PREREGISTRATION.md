# Pre-registration — same journals, two years

**Session 174, 2026-09-29. Between cycles.** Committed and pushed **alone**, before any corpus
below was fetched and before any script of this session ran. Done first, and not a result: PubMed
E-utilities answered one probe query; the house paper index was scanned (1,054 entries; the only
neighbours on trial-abstract reporting are the two already carried, Hopewell 2012 and Pitkin 1999).

## 1. The question

On 09-28 the share C of percentages in August trial abstracts whose counts stand beside them and
agree ran 4.41, 2.43, 3.29, 2.92 and **6.94 %** (2006 … 2026). The last step could be in the
**writing** (the same journals now hand over more) or in the **frame** (the first 1,000 records of
a month that is barely indexed come from different journals — 2026's top ten hold 17.8 % of
records against 8–14 % before). 09-28 could not tell them apart. The Atelier (bulletin, 09-28)
suggested looking for a second clock inside the record; the journal is one.

> **Holding the journal fixed, does C rise from 2021 to 2026?** And how much of the 2021→2026
> frame gap of 4.02 points does the journal mix carry?

Nothing about cause is tested. A journal that rose is not evidence of why it rose.

## 2. What is run, unchanged

`tools/a-number-you-cannot-check/handover.py` (09-23), imported, not edited; the abstract
extraction is 09-28's `fetch.py`, imported. **C** (agreeing / all percentages) is primary, as on
09-28. S (screen) is reported, not tested.

## 3. Panel

1. **Candidate journals:** every NLM unique journal ID with **≥ 2 records** in the 09-28 frame for
   August 2021 (`artifacts/2026-09-28-twenty-augusts/data/corpora.json`) **or** in the 09-23
   pinned frame for August 2026. Journal IDs come from PubMed `esummary` of those PMIDs.
2. **Per journal and year, 2021 and 2026:** `<jid>[jid] AND randomized controlled trial[pt] AND
   hasabstract AND YYYY/01/01:YYYY/06/30[dp]`, sort `pub_date`, first **25**. January–June, so
   that 2026 is not the barely-indexed month and both years use the same half.
3. **Qualifying:** ≥ **10** abstracts in *each* year. 2025 (same window) is then fetched for the
   qualifying journals only.
4. Texts stay outside the repository; identifiers, journal IDs and digests go in.

## 4. Measures

- **W, within-journal change:** pooled C over the panel in 2026 minus pooled C in 2021 (token
  pooled). 95 % interval by resampling journals, 2,000 draws, seed 20260929.
- **Wj:** journal-level — share of journals, among those with ≥ 5 percentages in both years,
  whose C rose (ties counted as not rising).
- **Decomposition (secondary):** restricted to panel journals' records in the two frames, frame
  token shares w and panel rates r per journal; Kitagawa's two-part split —
  composition Σ(w26−w21)(r21+r26)/2, rate Σ(r26−r21)(w21+w26)/2. A textbook method; no novelty
  claimed.

## 5. Predictions (each decided by the numbers named)

- **P1** W > 0 (point estimate).
- **P2** W < 4.02 points — the within-journal change is smaller than the frame gap.
- **P3** W's 95 % interval excludes 0.
- **P4** Panel C for 2025 lies strictly between the panel's 2021 and 2026 values.
- **P5** Wj > 50 %.
- **P6** In the decomposition, the composition part is ≥ 50 % of the sum of the two parts.

## 6. Scope conditions

- **K1:** fewer than **30** qualifying journals → no decomposition, W reported as descriptive.
- **K2:** if the panel's pooled 2021 C differs from the 2021 frame's 2.92 % by more than **3
  points**, the panel does not stand for the frame, and that is said beside every number.
- **K3:** nothing here is read as an error rate. Disagreeing pairings are not read.

## 7. Afterwards

Anything added after results is labelled **exploratory** with its time of addition.
