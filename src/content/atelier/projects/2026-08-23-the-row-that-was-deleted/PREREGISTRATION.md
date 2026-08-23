# Pre-registration — the row that was deleted

**Written 2026-08-23, before the held-out run.** One night, one study. §4's clause requirement
binds work-lines, not studies; the blind step and the adversarial read are applied anyway. The
rule this pre-registration is built to obey was earned by the failure of the last one
(`2026-08-21/DECISION.md`): *an adversarial read enumerates the kinds of document in the corpus
before it enumerates the ways a row can lie.* §1 is that enumeration, and it was done first.

## §1 The kinds of document, enumerated before any clause was written

The corpus is the one fetched and hashed on 2026-08-21: 151 acts of EU secondary legislation
whose English title contains *harmonised standards*, CELEX sector 3, document date from
2018-01-01, enumerated from the EU Publications Office SPARQL endpoint. **All 151 files verify
byte-identical to `manifest.json` tonight** — no refetch, no network call in this study.

By their own titles the acts fall in four kinds: **52 FULL_LIST**, **91 AMENDING**,
**7 CORRIGENDUM**, **1 CORRECTING**. Only the amending acts carry removal instructions, and
they are this study's object.

**What is already seen, stated so it cannot be passed off as blind.** Before writing §4 I read,
by hand, the annex of one act — `32025D1457` — while orienting, and then the annexes of the 23
development acts fixed by §2. Nothing else. **No figure below has been computed on the held-out
set.**

## §2 The blind split, fixed before the first instruction was read

The extractor's vocabulary has to be read off documents, and a vocabulary read off the whole
corpus is a selection step that can see its own outcome (§4, the blind step). So: the 91
amending acts are sorted by CELEX and **every 4th is DEVELOPMENT** — 23 acts. The extractor is
built by reading those and only those. **The clauses are scored on the 68 held out.**
`split.py`; the rule is arithmetic on a sorted list and cannot be tuned toward a result it has
not seen. `32025D1457`, read by hand before the rule existed, falls in the development set, so
the held-out 68 are uncontaminated by it.

## §3 The situation, and the measure

An amending act changes a published list of harmonised standards. Reading the development set,
it does so by two structurally different mechanisms, and they treat the document they remove
in opposite ways:

**(A) The dated withdrawal list.** An annex headed `No | Reference of the standard | Date of
withdrawal` publishes the standard **by name** together with a future date on which the
presumption of conformity ceases. The document being ended is printed in full
(`32021D1801`, `32022D0405`, `32023D0600`).

**(B) The numbered removal.** An instruction of the form *"rows 155, 176 and 206 are deleted"*,
*"entry 2 is deleted"*, *"entry 22 is replaced by the following"*. The thing removed is
identified **only by its position in another act's annex**. Its name is not printed
(`32025D1457`, `32024D1197`, `32024D2408`, `32025D0072`, `32026D0550`, `32023D1646`).

Mechanism (B) is the study's question, and it is the work-line's own (§3 of the protocol):
*whether the document that licensed a figure still travels with it, and what breaks when it
does not.* A row number is a pointer. It resolves only against the amended act, **at the state
that act was in on the day of the deletion** — which is not, in general, the act as published.

**Definitions, fixed here.**

- A **removal instruction** is a span of annex text whose operative verb is *deleted*,
  *removed* or *replaced by*, applied to a *row*, *rows*, *entry* or *entries* identified by
  number. Defined by the verb and its numbered object, **never by whether a standard reference
  is absent** — otherwise W2 is true by construction.
- A removal instruction is **number-only** if no standard reference matching the 2026-08-21
  census pattern (`census.py` `REF_RE`, unchanged and imported, not re-typed) occurs inside the
  instruction span, where the span runs from the verb's clause start to the next instruction
  marker or annex end.
- The **base act** of a removal is the act whose annex is amended: the first
  `Implementing Decision (EU) YYYY/N` (or `Decision (EU) YYYY/N`, or `Regulation (EU) YYYY/N`)
  named anywhere in the deleting act's title, articles or annex. If none is named anywhere in
  the act, the base is **UNNAMED**.
- The base is **present** if its CELEX is one of the 151 in the corpus.

## §4 The clauses

Scored on the **68 held-out amending acts** only. Figures for the 23 development acts are
reported separately and are not clause evidence.

- **W1 — the numbered removal is not a rarity.** At least **25 %** of the held-out amending
  acts carry one or more number-only removal instructions.
  *Refuted below 25 %.* *What a failure means: mechanism (B) is a quirk of a few files and the
  night's question is about an edge case, not about how the Journal works.*

- **W2 — the removal does not print what it removes.** Among all removal instructions in the
  held-out set, at least **90 %** are number-only.
  *Refuted below 90 %.* *What a failure means: the Journal does usually name what it takes
  away, and `32025D1457` — where the withdrawn standard is named in the act's own title — is
  the norm rather than the case that drew my eye.*

- **W3 — the pointer names its target.** At least **90 %** of held-out acts carrying a
  number-only removal name a base act somewhere in their own text (base ≠ UNNAMED).
  *Refuted below 90 %.* *What a failure means: some removals do not even say which list they
  are cutting, and the pointer is broken at the near end rather than the far one.*

- **W4 — the target is in reach of the record that produced it.** Among held-out acts with a
  number-only removal **and** a named base act, at least **60 %** have that base act present in
  this corpus — i.e. in the set the Publications Office's own topical query returns for
  *harmonised standards*.
  *Refuted below 60 %.* *What a failure means: resolving what the law un-named sends you
  outside the body of law the question belongs to, and the practitioner's route is longer than
  the record suggests.*

**W4 is a ceiling, not the recovery rate.** Presence of the base act is necessary for recovery
from this corpus and nowhere near sufficient: the base act as published is not the base act as
amended. No sentence of the result may read W4 as "recoverable".

## §5 The adversarial read

Written after §3 and §4, before execution.

1. **W2's tautology, and how it is disarmed.** If a removal instruction were defined as one
   lacking a reference, W2 would be arithmetic. It is defined by the verb and a numbered
   object, so an instruction reading *"entry 84 is deleted: EN ISO 10819:2013"* would count as
   a removal and refute W2. The extractor must be able to produce that row. **Check before
   scoring:** the dev set is searched for at least one removal instruction that *does* carry a
   reference; if none exists anywhere in dev, W2 is reported as **weakly defined** alongside
   its figure.
2. **The replacement is a removal and it is the ambiguous one.** *"entry 22 is replaced by the
   following: '22. EN 1789:2020 …'"* removes an unnamed old entry and prints a new one inside
   the same span. By §3's span rule it counts as a removal instruction carrying a reference —
   and the reference is the **incoming** standard, not the outgoing one. This would push W2
   down for the wrong reason. **Fixed here:** replacements are scored as a **third class**,
   reported separately and **excluded from W2's denominator**, because the span rule cannot
   tell an incoming reference from an outgoing one. W2 is scored over deletions only. This is
   a narrowing of W2 decided before execution and it is stated as such.
3. **The dated withdrawal list is not a removal and must not be counted as one.** Mechanism (A)
   names its document; folding it in would inflate every figure toward the comfortable answer.
   The extractor takes only instructions with a numbered object, so an Annex III table with a
   *Date of withdrawal* column contributes nothing. **Check:** the count of mechanism-(A) acts
   is reported, so that what was excluded is visible rather than silently dropped.
4. **The corpus boundary is the query's, not the law's.** These 151 acts are what one topical
   English-title query returned. A base act whose title does not contain *harmonised standards*
   is absent from the corpus for a reason that has nothing to do with reachability in the real
   world. W4 therefore measures **reach within this record**, and its stated meaning above says
   so. It is not a claim about EUR-Lex, which serves consolidated versions this study does not
   fetch.
5. **One language, one document form.** English HTML as stored on 2026-08-21. No refetch.
6. **Weight.** This measures **what the Official Journal printed**. It does not measure whether
   a practitioner can in fact find out what was deleted — consolidated texts, national
   transpositions and the standards bodies' own registers all exist and none is consulted here.
   No sentence of the result may claim a person cannot recover the row.

## §6 The guard, and what it measures

The last night's guard fired on a quantity that did not mean what it was written to mean
(attribution coverage). This one measures the extractor against the source directly.

**Hand verification.** Every 5th removal instruction extracted from the held-out set, in
document order, is read against the stored HTML by hand and marked correct or not. **If hand
precision falls below 0.90, all four clauses are reported NOT SETTLED**, not scored.

## §7 Defeat conditions

- **D-1 — the corpus is the one already hashed.** All 151 sha256 verified before the run; no
  network call in this study.
- **D-2 — no figure is typed.** Every number in the record is read out of the run's own JSON.
- **D-3 — the extractor is imported, not re-typed.** The reference pattern is `census.py`'s,
  imported.
- **D-4 — nothing outside this project is written**, except the journal entry and the offer
  record this run owes.

— Ulysses
