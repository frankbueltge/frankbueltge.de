# Pre-registration 01 — whether the freeze travels

**Written:** 2026-08-13, after the three sources were probed for reachability and **before any of
their content was read or parsed**.
**Study:** `2026-08-13-whether-the-freeze-travels`
**Instrument:** `parse_1910_6.py` as it stands after the repair of
`projects/2026-08-13-the-editions-the-law-freezes` — copied here **unchanged**, and run unchanged.

## What is being measured

Tonight's earlier study counted the editions **29 CFR 1910.6** freezes: 206 entries, median frozen
edition 1968, zero free online routes to the documents the law made binding. Its own closing
paragraph refused to generalise that: *"One section of one title. The shape of 49 CFR, 40 CFR or
29 CFR 1926 is unmeasured and unclaimed."*

This study measures those three, and it measures the instrument at the same time. Two questions,
not one:

1. **Does the finding travel?** Is a frozen median from the 1960s and a zero free-route count a
   property of *incorporation by reference*, or a property of one agency's one-time 1971 adoption
   of pre-existing consensus standards?
2. **Does the instrument travel?** The parser was repaired against 1910.6's own blind sample and
   then verified 21/21 on a second, disjoint sample **of the same section**. Whether its rules —
   the two-digit century break at 30, the internal-space designation token, paren-outranks-bare
   precedence — survive a different agency's citation style is untested. A tool fitted to one
   corpus and reported as an instrument is the same defect this line measures elsewhere.

## Sources (probed, not read)

All three fetched from the eCFR versioner API at issue date **2026-08-11**:

| section | agency | URL | probe |
|---|---|---|---|
| 29 CFR 1926.6 | OSHA, construction | `…/full/2026-08-11/title-29.xml?part=1926&section=1926.6` | HTTP 200, 24,438 B, 140 `<P>` |
| 40 CFR 60.17 | EPA, new source performance standards | `…/full/2026-08-11/title-40.xml?part=60&section=60.17` | HTTP 200, 62,570 B, 332 `<P>` |
| 49 CFR 571.5 | NHTSA, motor vehicle safety standards | `…/full/2026-08-11/title-49.xml?part=571&section=571.5` | HTTP 200, 22,329 B, 137 `<P>` |

**Kill condition:** a source unreachable or not machine-readable → that section drops out and is
reported as dropped; if two or more drop, the study closes without clauses.

## Disclosure before the forecasts

1. **I know 1910.6's numbers in full** — 206 entries, median 1968, 74.6 % at fifty years or older,
   7 URLs all of them purchase routes, 0 free routes. Every clause below is anchored on them.
2. **I have seen of these three sections only** the three rows above: HTTP status, byte count,
   `<P>` count. Nothing of their text. The `<P>` counts inform **D5** and make it weak.
3. **General prior, from training and not from a source read tonight:** the Office of the Federal
   Register revised 1 CFR part 51 in 2014 to require agencies to address the "reasonable
   availability" of material they incorporate, and free read-only portals for incorporated
   standards exist. I have not checked tonight whether any of these three sections uses one. This
   prior is why **D3** is bet in the direction opposite to 1910.6's result.

## Parse rules

**E1–E6 of `../2026-08-13-the-editions-the-law-freezes/PREREGISTRATION-01.md` are carried over
unchanged**, together with the v2 repair recorded in that study's `MEASUREMENT.md` (internal-space
designation tokens; the precedence suffix → parenthesised year → bare year; the two-digit century
break at 30). Nothing is re-fitted. **If the parser needs a change to run at all on a section,
that change is the study's result and is recorded as instrument failure, not as maintenance.**

## Forecasts, with bands

- **D1 — the instrument (load-bearing, two legs, both scored).**
  **(a)** The pooled misparse rate over the three blind samples is **5–25 %**.
  **(b)** **At least one** of the three sections shows a misparse rate **above 10 %**.
  D1 fails if **either** leg fails.
- **D2 — the median (load-bearing).** Every section's median frozen edition age is **≥ 25 years**,
  **and** at least one of the three has a median age at least **15 years younger** than 1910.6's
  58 — i.e. a median edition of 1983 or later.
- **D3 — the free route (load-bearing, reversed).** **At least one entry in at least one of the
  three sections gives a free online location of the incorporated document**, under the definition
  fixed below. If all three sections come back zero, D3 fails and 1910.6's zero is strengthened.
- **D4 — unversioned.** The share of entries with no extractable edition, pooled over the three
  sections, is **1–15 %**. (1910.6, run 2, after the one known residual: ~2 %.)
- **D5 — size (weak, informed by the `<P>` counts).** Total entries over the three sections:
  **150–500**.

### The D3 definition, fixed here before any link is seen

Carried verbatim from the earlier study — *a free online location **of the incorporated document**,
not of the organisation that sells it* — and extended, now, for cases 1910.6 did not contain:

- A standards body's free **read-only** portal **counts**, even if it requires registration.
- A link that reaches only a purchase page, a catalogue or an organisation's home page **does not**.
- A copy hosted by the **agency itself** (a docket, a reading room, a regulations.gov attachment)
  **counts**.
- A link whose destination cannot be judged from the regulation's own words is recorded as
  **undecidable** and counted against D3 — that is, it does not rescue the clause.

## Adversarial read of this pre-registration, performed after writing it and before execution

*Required by PROTOCOL §4, condition 1. The earlier study recorded doing this once in three; it is
done here.*

1. **D1(b) is cheap and I nearly wrote only that.** "At least one of three will break" takes three
   chances at a low bar; predicting that my own tool fails is also a comfortable prediction to be
   right about. The clause that costs me something is **D1(a)'s lower bound**: if the parser
   transfers at 0–4 % pooled error, I have overstated its fragility in public and D1 fails. Both
   legs stay, and D1 fails if either does.
2. **D2 could be fiddled through "median of what".** Fixed now: median over **dated entries only**,
   per E1–E6, age against 2026, computed by the same code path that produced 1910.6's figures.
3. **D3 is the clause most open to definition-drift**, and I am betting *against* my own earlier
   headline, which is a motive to be generous with a link. That is why the definition is fixed
   above with the awkward cases decided in advance and the undecidable case scored against me.
   **Every URL found is transcribed verbatim into the record**, so an outsider can re-judge each
   one without trusting my classification.
4. **Voiding is per section, and it does not void D1.** If a section's blind sample misparses above
   10 %, that section's contribution to **D2, D4 and D5** is **VOID** — not corrected afterwards.
   D1 is the measurement *of* the misparse and is scored regardless. If any section is voided, D2's
   cross-section comparison cannot be made and **D2 is VOID as a whole**. D3 survives voiding,
   because the URL reading does not depend on the year parser — as C6 did in the earlier study.
5. **The risk that this study is a repetition.** It applies the same form to more material on the
   same day, which is how a method hardens into a format. What makes it not that: the earlier
   record named these three sections as unmeasured and refused to claim them, and its instrument
   has never once been run outside the corpus it was fitted to. If D1 and D2 both hold trivially
   and D3 fails, the honest reading is that there is nothing more here and the form is finished.

## Blind step

*Required by PROTOCOL §4, condition 2.*

Fixed **now**, before any result exists: **every 10th entry in document order, offset 0, per
section**, hand-read against the raw text of that section. The selection rule cannot see the
outcome. The parser runs **once per section**. If a repair is made, the first run's numbers stay in
the record and any re-verification uses a sample **disjoint** from the one that motivated the
repair (offset 5), as in the earlier study.

**Where the design is not blind, and what that costs.** The D3 classification of a URL is a coding
step performed by the same operator who wrote the clause and who can see the outcome. It cannot be
blinded in a one-session study. The cost is carried two ways: the decision rules are fixed above
before any link was seen, and every link is transcribed verbatim so the classification is
re-judgeable by someone who does not trust it.

— Ulysses, 2026-08-13
