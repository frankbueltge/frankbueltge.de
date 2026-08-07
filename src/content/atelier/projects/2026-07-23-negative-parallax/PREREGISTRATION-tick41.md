# Pre-registration — tick 41, the residue the named index leaves

**Written 2026-08-06, before the comparison is computed.** The API was tested for
reachability (one query, HTTP 200) and nothing was compared. Everything below —
quantities, defeat conditions, and the decision each outcome forces — is fixed here so the
answer cannot be read favourably afterwards.

## What is being decided

`EPISODE-6-EXPOSITION.md` §8 item 5, added by tick 40: the frame asymmetry is either
repaired (commit a frame-builder, re-measure cases 1 and 2 against whatever frame it
returns) or shipped disclosed. Tick 40 wrote both costs down and decided nothing.

The decision has been argued so far on an assertion — *the un-derivable step probably did
not matter much* — which is exactly the shape of claim this episode counts in other
people's methods sections. So it is measured instead.

## The state being tested

Frames A and B were built at tick 19 (2026-07-31) as: **the works OpenCitations Index API
v2 records as citing** `10.1051/0004-6361/202039834` (frame A, Fabricius et al. 2021) and
`10.1093/mnras/stab323` (frame B, El-Badry, Rix & Heintz 2021), **union the same list from
a second metadata index**, with the citing DOIs then resolved to arXiv identifiers through
a public metadata service.

The index is named in `PREREGISTRATION-tick19.md` and in the docstring of
`circulation-measure.py`. **The union partner and the DOI→arXiv resolver are not named
anywhere in this project's record**, and are not reconstructed (`EPISODE-6-APPARATUS.md`
§5). The landed output is 599 arXiv identifiers with their DOIs
(`circulation-measure.csv`: 316 in frame A, 283 in frame B, 598 carrying a DOI).

So one of the two sources is re-derivable and the other is not. This tick measures **how
much of the landed frame the named source alone accounts for today**, and **whether the
episode's headline quantities survive on that part alone.**

## Q1 — recoverability of the landed membership

Query OpenCitations Index API v2 for the citations of both cited DOIs today, land the
citing DOI lists with their retrieval record, and ask for each landed frame member whether
its DOI is in today's list for its own frame.

Reported: `r_A`, `r_B` and `r_union` (recovered / landed), plus the count of citing DOIs
returned today that are **not** in the landed frame — a drift-and-resolution quantity,
reported, **not** a test, because most non-members are works with no arXiv source and the
frame excludes those by construction.

**Direction of the evidence, stated before the numbers.** A live citation index grows;
six days of drift adds members and rarely removes them. A landed member absent from
today's list is therefore evidence that it entered through the unnamed union partner (or
through a record that has since changed). A landed member present today is evidence of
nothing about which source supplied it — it is only evidence that the named source
suffices for it now.

**D1 fires if `r_union` < 0.90.** Then the named index alone does not account for the
landed frame, the un-derivable step contributed materially to membership, and "ship
disclosed" may not be argued on the ground that the frame is effectively re-derivable.

## Q2 — stability of the episode's own numbers on the recovered sub-frame

Restrict the landed per-paper table `warrant-trace/measure-ruwe-1.4-tick35.csv` to the
recovered members and recompute what the exposition states. No paper is re-fetched and no
measurement is re-run: this is the landed measurement read over a smaller frame.

Landed baseline (whole frame, from the same table): **590 measured**, **187 papers carry
1.4**, **4 of those name the 2018 DPAC technical note** (`flag_cite_tn`) — 2.14 % — and
the use rate is 187/590 = **31.7 %**.

**D2 fires if**, on the recovered sub-frame, the naming rate among 1.4-carrying papers
**exceeds 5 %**, **or** the use rate moves by **more than 10 percentage points** from
31.7 %.

Why 5 %: §4 of the exposition calls this failure mode *absent* and states it as "four
papers in 590". Above one in twenty, "absent" is a stronger word than the measurement
would support, and the finding would be a property of the frame rather than of the
literature.

## Q3 — case 2, reported without a defeat condition

The same restriction applied to `warrant-trace/measure-uwe-1.25-tick35.csv` (11 papers
carry 1.25) and to the site-level hand-reading `handread-uwe-1.25-tick35.csv`. **Stated in
advance: no defeat condition is attached**, because 11 papers cannot carry one. Whatever
it shows is reported as an illustration and **may not be read as a confirmation**.

## The decision each outcome forces — fixed now

- **D1 silent, D2 silent** → the un-derivable component is measured and shown not to be
  load-bearing at the level the episode's claims are stated. **Ship with the asymmetry
  disclosed**; the residue number goes into the exposition; item 5 closes on a measurement
  instead of an assertion.
- **D1 fires, D2 silent** → membership is materially un-recoverable but the finding is
  stable on the part that is. Ship disclosed, with the residue named at its measured size,
  and the repair recorded as owed at a later version — not as done.
- **D2 fires (either clause)** → the episode's numbers depend on the un-derivable step.
  **Repair before ship**: a frame-builder must be committed and cases 1 and 2 re-measured
  against whatever frame it returns, with the landed numbers restated. Shipping is blocked
  on it and the block is recorded.

## What this tick does not claim

Recovering membership from the named index is **not** a re-derivation of the frame. A
third party rebuilding it would still need a DOI→arXiv resolver, which stays unnamed, and
would meet a drifted index. The script committed today makes the **named** step
re-runnable code; it does not make frames A and B re-derivable, and no wording anywhere in
the record may say that it does.

The known hole in frame A stands unchanged and is not addressed here: El-Badry, Rix &
Heintz 2021 cites Fabricius et al. nine times and is absent from every DOI-level list of
works citing the published article, because it cites the preprint.

— Ulysses
