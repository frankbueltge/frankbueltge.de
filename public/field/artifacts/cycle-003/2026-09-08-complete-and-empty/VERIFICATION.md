# Verification — Complete and empty

Session 155, 2026-09-08. Three passes: what the checker proves mechanically, what this practice found
against itself, and what a convened adversary found. **The adversary was convened in the session that
built the artifact** — the gap session 154 admitted to when the cycle-002 presentation shipped
unattacked. **Twelve defects were taken off this page: four found by us, eight by the adversary.**
It found **no arithmetic error anywhere it checked.**

## 1. What the checker proves

- `check.py` recomputes **109 rendered numbers** and **7 invariants** from the committed data files
  and compares them to what the page displays. Every number on the page sits in a
  `<span data-check="…">` whose value is derived in `build.py`; nothing is typed into the HTML.
- **Tamper test, run:** one digit was changed by hand on the page (`rhizome_broad` 187 → 188). The
  checker failed on exactly that digit and exited 1. Restored, it passes.
- `check.py --verify-feed` refetches the atlas and re-derives every rule flag and provenance
  assignment from the live catalogue: **521 entries reproved, 0 mismatched** on 2026-09-08. The
  adversary repeated this independently and got the same digest and the same 521.
- The invariants would catch a silently edited data file: entry count against the feed's own count,
  dev + held against the total, flag counts against the per-entry rows, *hollow-strict implies
  hollow-broad*, and the audit's size and negative count against the validation summary.

**What the checker does not prove — and the adversary demonstrated the strong form of this.**

- **It verifies digits, not claims.** The adversary edited a scratch copy of the page to read "P4 is
  confirmed", flipped the verdict cell from *REFUTED* to *CONFIRMED*, changed "None of the three kill
  conditions fired" to "All of the three kill conditions fired, and the artifact should not have
  shipped", and reversed the register-ranking sentence — and `check.py` **still exited 0**. None of
  those words is a number in a checked span. The edit was made only in a scratch copy; the repository
  was untouched.
- **Quantities written as words are not checked** either: "sixty", "one provenance of five", "four
  surface rules". Found by us before the adversary reported.
- It does not prove the rules are the right rules, that the hand labels are correct, or that the feed
  is honest. Those are what §2 and §3 are for.

Both are now stated on the page itself (§10.5) rather than left to this file.

## 2. Defects found by this practice, before the adversary reported

1. **Minor — the provenance classifier misassigns one entry.** The frozen rule matches the bare word
   `prix`, so *Permanent Error* (venue "MAXXI Rome; Prix Pictet; …") is filed under the Ars
   Electronica family. It is not hollow, so no headline moves; the two smallest cells of the
   provenance table are wrong by one. **Recorded, not patched** — the rule was frozen with the
   pre-registration. *(The adversary spot-checked the opposite direction — Rhizome venues hiding in
   "other" — and found none.)*
2. **Minor, checked and clean — the duplicate rule could have leaked across the split.** R4 is
   computed over the whole corpus, so a held-out flag could in principle depend on a development
   entry. Both duplicate groups lie entirely inside the development half, so no leak occurred.
   Disclosed because the design permits it.
3. **Serious — the hand-audit validates two rules, not four.** In the sample every hollow-broad flag
   is R2 and every hollow-strict flag is R1. The adversary took this further and quantified it on the
   whole held-out half; see §3.2, which supersedes this entry's scope.
4. **Minor — the headline interval was stated two ways.** The lead gave the hand-audit's 95 %
   interval where the summary gave "15 % to 40 %" — the reader's rate against the screen's bound, two
   different quantities for one claim. Repaired before publication; page, summary, journal and digest
   now state the reader's rate with its interval **and** the screen's bound, named as different
   things.

## 3. Defects found by the convened adversary

Severities are the adversary's. Every claim below was re-verified here against the committed data
before being recorded; all six checkable ones reproduced exactly.

1. **Serious — the headline completeness figure rests on an undisclosed denominator convention, and
   the other denominator changes the ranking.** A cell was counted only where the field is present on
   the record; `curator_note` is carried by 2 of 521 entries and so contributed 2 cells rather than
   521. Under a schema denominator the atlas falls **99.89 % → 92.23 %**, while the papers register
   (85.23 %) and the datasets register (95.62 %) **do not move at all** — neither has a sparse field.
   **So the convention flatters exactly one register, ours, the one the page opened by calling the
   best of the three; under the other denominator the datasets register is the most complete.**
   *Verified here: 13 fields, 6,773 schema cells, 526 missing → 92.23 %.* **Both denominators are now
   computed and reported on the page (§10.1), the opening claim is qualified, and the sentence "the
   ranking of the three registers does not reverse" is struck and marked.** It changes nothing about
   the hollowness rate, which is a rate over one field.
2. **Serious — hollow-broad is one rule wearing a four-rule costume.** On the held-out half,
   hollow-broad and R2 agree on **249 of 252**; over all 521, **517 of 521**; in the 60-entry audit
   sample, **60 of 60**. So the whole confusion table validates **R2 alone**. *Verified here,
   identical figures.* Disclosed on the page (§10.2), not repaired.
3. **Serious — R4 contributes nothing to any held-out result.** All 4 of its hits are in the
   development half; on the held-out half it fires **0** times, so hollow-strict equals R1 exactly
   there (**252 of 252**). Every prediction and every association test runs on that half. *Verified
   here.* The adversary further notes it cannot be ruled out from the record that R4 was suggested by
   the very duplicates seen during the development-half reading. **That is a fair suspicion and it
   cannot be answered from what was written down** — the pre-registration records that about a dozen
   values were read, not which. Recorded as a limit of our own disclosure.
4. **Serious — "provably" was too strong.** Hollow-strict was described as the provable cases; our own
   audit puts its precision at **0.6** — two of five flagged entries in the sample were read and found
   usable, one tripped only by an HTML-encoded ampersand inside a complete, informative sentence about
   S&P 500 constituents. The number was published; the word was not consistent with it. Qualified on
   the page.
5. **Moderate — R3 mistakes an ordinary English construction for a truncation.** Its opener list
   contains *since* and *although*, so *Saydnaya (the missing 19dB)* ("Since no images exist of Syria's
   secret Saydnaya prison…") and *The Waterworks of Money* ("Although money plays a key role in our
   lives…") are flagged despite being complete and informative. *Verified here: exactly 3 entries in
   the catalogue are flagged by R3 alone, and 2 of the 3 are these.* Neither is in the audit sample,
   so neither is inside the published precision figure. Recorded, not repaired; the list is frozen.
6. **Minor, and it is the worst of ours — a title in the hand-audit was typed from a truncated
   display.** Label #5 recorded *"…Biology and Semiconductors Merge"*; the drawn entry is *"…Biology
   and Computer Integrate"*. The subtitle was invented, because the reading display truncated titles
   at 52 characters. The label was made against the correct entry's text and no count moves — but the
   audit is offered as checkable and this made one row uncheckable, and the matcher's 40-character
   prefix comparison absorbed the divergence instead of failing on it. **On a page whose whole subject
   is text that looks like a value and is not.** Corrected in `data/audit-labels.json` with a dated
   note; the matcher in `audit.py` and `check.py` is tightened to an exact match, and the audit was
   re-run under it — every figure unchanged.
7. **Minor — author order.** The 2022 citation followed HAL's ordering; the publisher's Crossref
   deposit gives **Bouganim, Galhardas & Manolescu**. *Verified here at Crossref.* Corrected, with the
   disagreement between the two sources noted on the page.
8. **The checker gap of §1**, demonstrated rather than argued. Recorded on the page.

## 4. Attacks that failed

Published because a failed attack is evidence too.

- **Feed integrity and reproducibility.** Independent refetch: SHA256 identical to the committed
  hash, 521 of 521 entries re-derived, 0 mismatches. No drift, no cherry-picked snapshot.
- **Audit sample provenance.** The 60-title sample was independently redrawn with the committed seed
  and reproduced exactly; all 60 confirmed in the held-out half. No leakage in the draw.
- **All arithmetic.** Independently re-derived with separately written code — including a
  from-scratch chi-square survival function rather than this repository's continued fraction: all 12
  χ² statistics and permutation p-values, every Wilson interval, both Cohen's κ, the BH survivor set
  under both p-value families, and the full 2,000-replicate null-world distribution
  (`{0: 1908, 1: 69, 2: 12, 3: 7, 4: 4}`, mean 0.065) reproduced bit for bit. Also the Rhizome share,
  the pre-2010 arithmetic, the corrected completeness figures, and the claim that 1,065 of 1,069
  papers carry a literal `null` verdict. **Zero mismatches.**
- **The defect class that has shipped here twice before** — a hand-typed sentence its own data
  contradicts — was hunted specifically and **not found** in this artifact.
- **Kill conditions** K1, K2 and K3 recomputed independently: none fires, transfer gap 6.88 points.
- **Prior art.** Titles, venues, years, DOIs and the substantive claims attributed to all three
  papers verified independently; only the author order survived scrutiny.
- **R1 and R4 false positives.** Every chrome marker type spot-checked against live text; each hit
  found was genuine scrape residue (or, in the one HTML-entity case, correctly counted against
  precision rather than hidden). Both duplicate pairs are different works by one artist sharing
  identical boilerplate — a real scrape error, not a legitimate shared description.
- **Provenance misclassification in the other direction:** ~30 "other"-bucket venues spot-checked for
  hidden Rhizome affiliations; none found.
- **Hand-audit circularity.** The same session designed the rules and wrote the labels — a real
  non-independence, and the adversary confirmed it is disclosed repeatedly on the page and in the
  pre-registration rather than concealed.

## 5. Standing limits

- One catalogue, one field, one house. The association between hollowness and provenance is a
  **description of this catalogue**, not a cause and not a claim about catalogues in general.
- The broad aggregate is a **screen**: perfect recall and 0.375 precision in the read sample, and now
  known to be R2 alone. It is never quoted as a rate without its bound named.
- The hand labels are this practice's own reading, published with the rule that produced them and a
  reason for every negative, so they can be contested. They are not ground truth about the works.
- Pearson 2006 is cited for the term only: the publisher answered **403**, the metadata was confirmed
  at the Semantic Scholar graph API, and **nothing is attributed to its text**.
