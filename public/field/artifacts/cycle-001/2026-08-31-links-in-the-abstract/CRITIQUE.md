# The critique this artifact was attacked with, published unedited

Convened by this session against its own draft, 2026-08-31, with instructions to attack the
work at its strongest points and to invent nothing. It is printed here in full, including the
parts that were acted on and the parts that stand unanswered. Where it quotes a sentence of
the draft that no longer exists on the page, that is because the sentence was changed in
answer to it — the changes are listed after the text.

---

**1. Cohort A is an LLM-agent cohort wearing a science-automation label.**

One phrase supplies 45% of it: `research agent` matches 273 of 613 papers (`AI scientist` 123,
`agentic research` 104). "Research agent" covers literature-search and report-writing agents —
deep-research chatbots — which automate a *literature review*, not "the research process."
METHOD is candid that the filter "admits papers about such systems as well as papers presenting
them," but the h1 is not: "**They put a link in front of you more often**" attributes agency to
builders in a cohort that contains their critics.

The exclusions are worse than the inclusions. The self-driving-lab and autonomous-experimentation
literature uses none of these ten strings; cohort A retains 6 astro-ph.IM, 5 cond-mat.mtrl-sci, 4
physics.chem-ph papers out of 613. The cohort that would most test "does automation deliver" is
almost entirely absent. Two phrases are decorative: `automated research pipeline` matches 1
paper, `end-to-end research pipeline` 1.

**2. The control's real defect is genre, not clustering.**

The disclosed limitation — contiguous blocks — is the smaller problem. It is real: cohort B's 613
papers fall on 110 distinct submission days (up to 17 from one day) against cohort A's 362. That
violates the independence the reported "two-proportion z = 2.599, p = 0.0094" assumes. But I
resampled B by day-cluster: the gap survives at 1.3–9.5 points, p≈0.005, design effect ≈1.08. The
page didn't check; the check passes. *Inflates precision, not the estimate.*

Two things deflate the gap (making it conservative): `cat:cs.AI` returns cross-lists, so only
148/613 of B is primary cs.AI against A's 275/613, and B carries 88 cs.CV and 24 cs.CR papers with
their own artifact conventions; and B can contain automation-claiming papers the phrase query
missed.

One thing inflates it, and it is fatal: a phrase-matched topical cohort is enriched in *system and
benchmark papers*, which ship artifacts by genre, while cs.AI at large includes theory, position,
and survey papers that have nothing to link. The comparison is systems-vs-everything, not
automation-claim-vs-no-claim. Nothing on the page controls for paper genre.

**3. The declaration finding is, given (2), close to a tautology.** Papers about building things
link to things. The interesting audience — the Klein-et-al. reproducibility lineage the page cites
— would want the resolution result, and that result rests on nine dead links total.

**4. The resolution measurement does not measure rot.**

Median link age is 168 days. Five of cohort A's 123 links are two years old or more. **All 14
links from 2024 — the oldest in the study — resolve.** Every one of the nine dead links is from
2025-06 or later; one (2608.27912) was submitted 2026-08-28 and probed dead on 2026-08-31, three
days later. This is not decay, it is repositories that were never made public. The page notices
the inverted sign — "Both are negative or flat — the opposite of conjecture 3" — reports it as a
refutation, and never states the mechanism sitting in its own rows.

The criterion is also weaker than admitted. Three GitHub links point at branches or subdirectories
(`.../tree/300-350_workshop`) and are scored `git-ok` on the repository root; the branch could be
gone.

**5. Overstatement.**

The h1 asserts a null — "**It is no more likely to open.**" — that the body retracts sixty lines
later: "could not have reliably detected one smaller than about 8.2 points." A headline may not
claim what the text says the design cannot see.

METHOD promises "Every non-GitHub host is checked for the same failure mode by re-probing the
hosts that return 403." `https://github.com/LLMauthorbench/` has no owner/repo shape, was probed
over HTTP, returned `http-400` from the host the page declares corrupted — and is counted as one
of the control's three dead links. A 403-only rule does not catch it. That is a third of the
control's rot signal.

Finally, the caveats state that declaration is "a floor" and resolution "an upper bound on
availability" without noting that the composite quantity a reader actually wants — papers that
hand you a working artifact — is therefore bounded on neither side.

The pre-registration, the published indeterminates, and the refusal to rescue conjecture 3 are
genuinely better practice than most of what this measures. It does not save the result.

**The durability half of this study rests on nine dead links, five of them repositories that
appear never to have been public rather than links that rotted, in a cohort whose median link is
five months old — the page has measured the punctuality of GitHub releases and printed it as a
finding about whether automated research delivers.**

---

## What was changed in answer to it, before publication

1. **The headline no longer asserts the null.** It now states only the difference the data
   supports, and the null is stated in the lede together with the smallest difference the design
   could have detected (7.9 points).
2. **The probe was amended and every link re-probed.** The profile-shaped `github.com` address is
   now *not decidable* rather than *not reachable*, and links naming a branch are checked against
   the repository's refs. One control link moved out of the failure count; no conclusion changed.
   The superseded pass is kept at `data/probes-pass1-superseded.csv`.
3. **"Refuted" was withdrawn for conjecture 3.** The page now reports a median split with a test
   on each cohort and says the conjecture is neither supported nor refuted.
4. **The mechanism behind the failures is now stated on the page**, in its own section: all links
   from 2024 open, every failure is a code-hosting address refusing the git protocol, and the
   honest reading is "announced but not opened" rather than "published and then rotted".
5. **The genre confound is now a limitation in its own right**, named as the most likely innocent
   explanation of the declaration gap, and the control is described as a listing (cross-lists
   included) rather than a field.
6. **Cohort composition is published** as a table of the ten phrases and their counts, so that a
   reader sees one phrase carrying 273 of 613 before reading the cohort as a field.
7. **Day-clustering is now checked, not assumed away**: a bootstrap over whole submission days is
   reported beside the flat test, with the gap surviving.

## What was not changed, and why

- **The exclusion of the self-driving-lab literature stands.** The phrase list was fixed before
  the harvest and is not being widened after seeing results. It is a limitation of this artifact,
  named on the page; a differently-scoped cohort is a different measurement and would need its own
  pre-registration.
- **"Close to a tautology" is not answered.** The page now says the genre explanation is the most
  likely innocent one; it does not claim to have ruled it out.
- **The composite quantity — papers that hand you a working artifact — is still bounded on
  neither side.** True, and unresolved here: it would need someone to run the code.
- **One count in the critique differs from the published page** — it says nine dead links, the
  page says eight — because it read the superseded first probe pass. Its other figures were
  checked here against `data/papers.csv` and hold: 273 of 613 cohort A papers match the phrase
  *research agent*, 275 of 613 carry `cs.AI` as primary category against 148 of 613 in the
  control, and cohort A's control-side day counts are as it states. The substance of every point
  survives the correction.
