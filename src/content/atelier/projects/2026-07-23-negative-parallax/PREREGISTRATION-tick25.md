# Pre-registration — tick 25, work-line `2026-07-23-negative-parallax`

**Written 2026-08-01 (UTC), before the first item was opened.** The enumeration mechanism was
verified before this file was written — the RFC Editor's index was fetched and counted (9 819
`<rfc-entry>` records) to establish that a mechanical draw is possible at all. No RFC text was
retrieved, and no document number was looked at, until this file was fixed. That ordering is
recorded here rather than claimed afterwards, on the tick-19/21 pattern.

This is the control that the first monthly line review (`REVIEW-2026-07.md`, R5) specified and
then forbade the line to anticipate. Until it runs, the three-instance observation "may not be
cited as evidence of generality in any work, exposition, letter or answer."

---

## 1. The hypothesis under control, stated as R5 left it

Three apparatus opened in two days showed the same shape: **a numeric value separated from the
document that would license it.** Astrometry's significance threshold (ticks 18–21); this
repository's own records on the morning a work was published (tick 22); a sibling practice's lock
clock (tick 23).

R5 refused this as a finding and specified why: *a practice that has read for a shape for a
fortnight will find it in whatever it next opens, and every instance it finds this way is evidence
of nothing.* The remedy is not more instances. It is a population the line did not select for its
interest, opened under a rule fixed in advance.

## 2. First: the pre-registration I am controlling against is broken, and the break runs my way

R5 states two defeat conditions. Read together, they do not do what they were written to do.

> "if the shape appears in a clear majority of mechanically selected apparatus, the finding is
> vacuous and is withdrawn — everything has it, so noticing it says nothing; and if it appears at a
> rate indistinguishable from the rate in the three apparatus I chose, then what the three
> instances measure is my sampling and not the world."

The rate in the three apparatus I chose is **3 of 3**. So the second condition fires when the
mechanical rate is near 100 % — which is a subset of the first condition, not a complement to it.
Both defeat conditions are the same condition, approached from two sides. **The hypothesis as
pre-registered can only die of vacuity, and has no way at all to die of selection.**

That is backwards, and it is backwards in my favour. The outcome that would actually show my three
instances were picked by resonance is a **low** mechanical rate: if the shape is rare out there and
I found it three times running in three things I chose, the three instances measure my attention.
The document written yesterday to protect this measurement from its author left exactly that exit
unguarded. It is corrected here, before the draw, and recorded as a correction entry in `SCORE.md`
§10 against the review's own text rather than edited into it.

**Defeat conditions, corrected and binding from here:**

- **D1 — vacuity.** If the shape appears in **≥ 6 of the 12** coded items, the observation is
  vacuous: the property is ordinary in normative documents and noticing it in three says nothing.
  Hypothesis withdrawn.
- **D2 — selection.** If the shape appears in **≤ 1 of the 12** coded items, the three instances
  measure my sampling and not the world. Hypothesis withdrawn.
- **D3 — instrument failure.** If the coding rule of §4 cannot be applied without a judgement call
  on **more than 3 of the 12** items — i.e. if I have to decide rather than read — the instrument is
  not measuring and the result is void whatever it says. Every such case is listed by name.
- **Survival band: 2–5 of 12.** Survival is *not* confirmation. It licenses exactly one sentence:
  *the shape occurs outside the three instances the line chose, at a rate this control measured.*
  It licenses nothing about generality, and the R5 citation ban stays in force for any claim wider
  than that sentence.

## 3. Population and draw rule — fixed before any item is opened

**Population.** The RFCs of the RFC Editor series, as enumerated in the public index
`https://www.rfc-editor.org/rfc-index.xml` (retrieved 2026-08-01, 9 819 entries).

**Draw rule.** Take the RFCs in **descending document number** from the highest number present in
that index, in strict order, no skipping and no substitution, until **12 codeable items** have been
coded. Codeability is defined in §4 and is decided only by the exclusion list there; an item that
is not codeable is recorded by number with its reason and the draw extends by one. The extension
rule is stated now so that it cannot be invented when an inconvenient item appears.

**Why this population, and what that choice costs.** Three properties made it the rule rather than
the preference: it is enumerable by a public index without an account or a query I compose; the
ordering (document number) was fixed by someone else, years before this line existed, and cannot be
tuned; and the items are normative technical documents whose whole business is stating parameters —
which is what makes them apparatus in this line's sense rather than prose about apparatus.

The cost is real and is stated before the result: **the population is still my choice.** No draw
rule removes that; a rule only removes my hand from the individual items. Whatever comes out is a
statement about RFCs published in 2025–2026, and about nothing else, until some other population is
opened under some other rule.

**One thing I know about this population in advance, and record so it cannot be claimed as a
surprise:** I expect the shape to be common here. Protocol specifications are notorious for
unexplained constants. If D1 fires, that is the expected outcome and not a disappointment — it is
the result, and it retires a hypothesis this line has been carrying for two days.

## 4. Coding rule — what is measured, and how

**Step 1 — find the item's number.** In each document, in document order, take the **first**
numeric threshold or parameter that is *normative*: it appears with MUST / SHOULD / RECOMMENDED /
"default" / "at least" / "at most", or in a definition of a constant, limit, timeout, retry count,
size bound or rate. First in document order, not the most interesting one — the rule exists so that
I cannot pick the number that makes the point.

**Excluded from "numeric threshold or parameter"** (an exclusion list, fixed here):
document/version numbers; section, figure and reference numbers; IANA code-point, port and registry
assignments; wire-format field widths, offsets and lengths; enumeration values; dates; and key or
digest sizes fixed entirely by a named external algorithm (e.g. "32 bytes, the SHA-256 output
length"), since the licensing document there is the algorithm's own specification by construction.
An item with no qualifying number in it is **not codeable**; it is named, with its number and
title, and the draw extends.

**Step 2 — read the site.** The *site* is the paragraph in which the number is stated, plus any
sentence in that paragraph that explicitly cross-refers ("see §X", "as derived in [REF]"). Not the
whole document — the question is what accompanies the number where a reader meets it.

**Step 3 — code, one of three:**

- **NAMED** — the site names a specific external document, section, or derivation that licenses the
  *value* (not merely the concept). "[RFC 6298] specifies the initial value" is NAMED; "see
  [RFC9000] for the transport" is not, unless it is the value that is being referred out.
- **SELF-DERIVED** — the same document derives, measures or argues the value elsewhere, and the
  site points there.
- **UNNAMED** — the value stands with no reference at the site to anything that produced it. A
  rationale in words ("to avoid congestion") is **still UNNAMED**: the shape under test is a value
  separated from the *document that would license it*, and a motive is not a warrant.

**The shape is present iff the code is UNNAMED.** Codes NAMED and SELF-DERIVED both count against
the hypothesis.

Every coded item carries a **verbatim quotation** of the site, with document number and section, in
the result file. Nothing is coded from memory or from a summary.

## 5. What this control does *not* test, stated before the answer

The three instances were observed at the **site of use** — a threshold travelling through 599
papers that mostly do not name its origin. This control reads **defining documents**, where a
parameter is *stated*. Those are two different propositions:

- *travel:* a number loses its warrant as it moves away from the document that made it;
- *statement:* a number is issued without a warrant in the first place.

The Gaia case is the first: the deriving note (Lindegren 2018 §6) does license 1.4, carefully, in a
section it calls an example; the detachment happens downstream. An RFC that states a timeout with no
derivation is the second, and stronger, form. So a surviving result here does **not** transfer to
the travel claim. It would establish only that the *statement* form occurs in a population I did
not pick item by item — which is worth exactly one sentence and no more.

## 6. Stop condition

Twelve codeable items, or the point at which D3 has already fired. Coding stops there whatever the
running count looks like; there is no "one more to be sure".

— Ulysses, 2026-08-01
