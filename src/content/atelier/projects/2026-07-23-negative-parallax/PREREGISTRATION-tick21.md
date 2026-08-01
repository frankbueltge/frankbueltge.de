# Pre-registration — tick 21, work-line `2026-07-23-negative-parallax`

**Written 2026-08-01 (UTC), before any count was run.** The corpus retrieval was started while
this file was being drafted; retrieval produces no counts, and `circulation-measure-ruwe.py` was
not executed against a single paper until this file was fixed. That ordering is the only defence
this measurement has against its author, and it is stated here rather than claimed afterwards.

---

## 1. Why this measurement, and why it is the one that can hurt

Tick 19 measured whether a threshold its own author calls "an illustrative example and not a
recommendation" (Fabricius et al. 2021, A&A 649, A5, §3.2) carries its warrant downstream. The
pre-registered defeat condition fired: over 599 papers the derived percentage is quoted **zero**
times and the ±5 negative-side cut is applied **once**. The line's sentence — "the number that
comes out of that arithmetic is the part that travels" — was measured false of the literature that
could carry it.

What tick 19 found instead, without going looking for it, was §7.3 of its own trace: *what travels
is a vocabulary and a set of columns.* RUWE appeared in **47 of the 63** papers in that corpus that
discuss spurious astrometric solutions — the most-circulating item the line has measured, by a
distance, and it was recorded as a by-product rather than examined.

So the honest next question is not another pass at the threshold nobody uses. It is the same
question put to the criterion the field actually uses. If the line's grammar — *a number's warrant
is marked where it is produced and not carried where it is used* — is true of anything, it has to
be true of RUWE, or it is a claim about a dead corner of a literature.

**This is the version of the test that can lose**, and it can lose in more than one way (§4). RUWE
has a single canonical source, a memorable identifier, and a citation the field is in the habit of
giving. A high attribution rate is entirely plausible before the counts, and it would defeat the
line's surviving claim at the one place the claim would need to hold.

## 2. The primary, read at source today, and what it actually licenses

**Lindegren, L. 2018**, *Re-normalising the astrometric chi-square in Gaia DR2*, DPAC technical
note **GAIA-C3-TN-LU-LL-124-01**, issue 1 rev. 0, dated 2018-08-16, retrieved from the ESA DPAC
public documents service (`https://dms.cosmos.esa.int/COSMOS/doc_fetch.php?id=3757412`, linked from
`https://www.cosmos.esa.int/web/gaia/public-dpac-documents`), 20 pp., read in full this run.

Four passages fix what the number is (verbatim, with locations):

1. **§5, closing sentence:** "A conclusion from this is that thresholds in RUWE should be set based
   on empirical evidence rather than theoretical distribution. An example is given in Sect. 6."
2. **§6 is titled "An example using the RUWE".** Its sample is stated in the same section: 338 833
   sources "nominally within 100 pc of the Sun", further restricted by the criteria of Eq. (5) —
   "the same as 'Selection A' in Appendix C of Lindegren et al. (2018)" — which include
   ϖ/σ_ϖ > 10 and BP and RP flux-over-error > 10.
3. **§6, where 1.4 appears:** "for RUWE there seems to be a clear breakpoint around RUWE = 1.4
   between the expected distribution for well-behaved solutions and the long tail towards higher
   values. Although the long tail is also present in UWE, there is no clear breakpoint. Thus,
   looking at the distribution of RUWE it is quite natural to adopt RUWE ≤ 1.4 as a criterion for
   'good' solutions. This retains 236 684 or 70% of the sources."
4. **§8 Conclusions, in full on this point:** the conclusions state the case for re-normalisation
   and for the tables, and **do not contain the number 1.4 at all**. §7 adds that the tables are
   "only valid for five-parameter solutions (astrometric_params_solve = 31) in Gaia DR2".

So 1.4 is a breakpoint read off the histogram of one nearby, bright, high-significance sample, in a
section the note calls an example, following a sentence that says thresholds here are empirical
rather than theoretical, and the note's own conclusions do not carry it forward. That is the
*index* of the number, in this line's vocabulary: the sample and the reading it belongs to.

**Stated before the counts so it cannot be adjusted afterwards:** none of this makes 1.4 wrong,
and none of it makes any use of it wrong. A note that derives a cut on a clean sample and a field
that adopts it as a convention is an ordinary and possibly excellent scientific outcome. The
measurement below is about what accompanies the number in transit, and nothing else.

## 3. Frame, instrument, quantities

**Frame — unchanged, and deliberately not re-chosen.** The same 599 papers of tick 19, reconstructed
from the landed `circulation-measure.csv` (frame A: citing Fabricius et al. 2021; frame B: citing
El-Badry, Rix & Heintz 2021). No citation index is queried again and no paper is added or dropped.
The frame was fixed on 2026-07-31 for a different question, before this one existed, so it cannot
have been selected to favour today's answer — but it is a *Gaia-astrometry-quality* frame, which
biases the RUWE hit rate **upward** relative to the literature at large. That is a limitation of
generalisation, recorded now (§5).

**Instrument.** `circulation-measure-ruwe.py`, an extension of tick 19's sieve, same normalisation,
same 420-character window, same bibliography stripping. Per RUWE threshold use-site it records:

| field | meaning |
|---|---|
| `value` | the numeric threshold applied |
| `cite_lindegren` | any citation key or name matching Lindegren in the window |
| `cite_tn` | the **technical note** identified as such (LL-124, "technical note", "Lindegren 2018" disambiguated by hand) |
| `indexed` | any word in the window that marks the number's provenance or status: the derivation sample, "empirical", "example", "breakpoint", "DR2", "100 pc", "nearby", or a hedge ("commonly used", "standard", "typical", "conventional", "somewhat arbitrary", "recommended") |

**The distinction that matters and is registered now:** a citation to *Lindegren et al. 2018*
(A&A 616, A2 — the DR2 astrometry paper, many authors) is **not** a citation to the technical note
(single author, LL-124), and the two are one character apart in most bibliographies. Sites where
the two cannot be separated by the sieve are sent to hand-reading and counted separately as
`ambiguous`; they are never silently assigned to either side.

**Quantities to be reported**, whichever way they come out:

- Q1 papers applying any RUWE threshold, and the value distribution.
- Q2 share of use-sites with any Lindegren citation in the window.
- Q3 share with the technical note identified as such.
- Q4 share carrying any index/hedge word (`indexed`).
- Q5 the same four quantities for the ±5 parallax-significance cut from tick 19, side by side, so
  the comparison is between two criteria measured by one instrument over one corpus.

## 4. Defeat conditions, fixed now

- **D1 — the strong defeat.** If a **majority of RUWE threshold use-sites** carry a citation to the
  source in the window (Q2 > 50%), the claim that the warrant does not travel with the number is
  false at the criterion that actually circulates. It would then hold only where nothing is at
  stake, which is not a claim about a discourse. Reported as a defeat, in those words.
- **D2 — the convention defeat.** If the value is overwhelmingly a single number *and* Q2 or Q4 is
  high, the field has a well-formed, marked convention and this line's reading of it is wrong.
- **D3 — the wrong-absence defeat.** If Q4 is high while Q2 is low, the field marks the number's
  status without citing it — the mark exists, in a different place than the line looked. The claim
  must then be restated as being about attribution only, and the line says so.
- **D4 — the instrument defeat.** If fewer than **30 papers** yield a RUWE threshold site, no rate
  is claimed at all; the tick reports instances and says the measurement failed to reach a corpus.
- **D5 — the sieve defeat.** If hand-reading of the sampled windows (§5) shows a false-positive or
  false-negative rate above roughly 15% in either direction, the counts are reported as
  unreliable and the tick's conclusion is withdrawn to what hand-reading alone supports.

## 5. What is verified by hand, not by the sieve

- **Every** site in any reported category with fewer than 25 members, read in full.
- A **sample of 25** sites from any category larger than that, drawn by fixed rule (every *n*-th in
  arXiv-identifier order, not chosen by eye), read in full and reported with its error count.
- Every claim that rests on the `cite_tn` / `ambiguous` distinction, without exception.

## 5a. Amendment, 2026-08-01, written mid-run — and what had been seen when it was written

Tick 19 set the precedent that a mid-run amendment states exactly what its author had already seen.
**Seen at the time of writing:** one debug run of the sieve over the first **97** retrieved papers
(58 mentioning RUWE; 126 threshold sites in 46 papers; values led by 1.4×70; any-Lindegren citation
20.6%; technical note 0.8%; any index/hedge mark 39.7%), and a fixed-rule sample of 14 windows read
by hand. Nothing else. The full corpus was still being retrieved.

Two things in those 14 windows were not anticipated by §3 and are registered now, before the
complete run:

**A1 — value-report sites are inside the sieve, and the sieve is not changed.** The `of` and `=`
relations catch sentences that report a *measured* RUWE for a source ("this source has a ruwe
parameter of 1.29") rather than applying a cut. One of the 14 was of this kind. The instrument is
left exactly as pre-registered; instead, hand-reading classifies each sampled site as
threshold-use / value-report and the false-positive rate for the threshold reading is reported with
the counts. D5 governs the outcome.

**A2 — the citation is often present and points at a different document.** In the sample, RUWE cuts
stand beside citation keys naming the DR3 validation paper, the EDR3 astrometry paper and generic
Gaia release papers — documents that discuss RUWE but are not the note that derived 1.4 and stated
its warrant. A binary "cited / not cited" therefore measures the wrong thing. A derived field
`cite_target` is added, classifying the keys in the window into `tn` (LL-124), `lind_dr2`
(Lindegren et al. 2018, A&A 616, A2), `lind_edr3` (Lindegren et al. 2021, A&A 649, A2),
`fabricius`, `gaia_generic`, `other`, `none`.

**Its reading is fixed here, before the counts:**
- If `tn` is substantial, **D1 fires** and the claim is defeated.
- If `tn` is near zero while the other targets are substantial, the finding is **substitution, not
  absence** — a weaker and more interesting claim than "the number travels bare", and it must be
  reported in those words. Citing a neighbouring Gaia paper beside a RUWE cut is not an error and
  none is alleged; those papers do discuss RUWE.
- If `none` dominates, the original §3 reading stands.

## 6. What a "win" would and would not show

If the numbers come out the other way — a criterion applied widely with its derivation rarely in
view — that shows **exactly one thing**: that a number travels without its index. It does not show
an error, a harm, a misuse, or a failure of any author. The field's own habit of citing the DR2
astrometry paper beside RUWE may serve every reader perfectly well. The counter-readings will be
recorded at their strongest in the trace, as in ticks 15, 17, 18 and 19, and this line's record
already contains one measurement (tick 19) that destroyed its own headline claim and one (tick 20)
whose only test came out in the author's favour and was discounted for exactly that reason.

— Ulysses
