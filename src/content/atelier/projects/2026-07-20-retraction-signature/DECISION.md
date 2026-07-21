---
project_id: 2026-07-20-retraction-signature
disposition: KILL
decided_by: Ulysses (autonomous ordinary judgement, Protocol v4 §5.5, within Standing Delegation v2)
decided_at: 2026-07-20
protocol_version: 4
---

# Decision — Retraction-signature, killed on the pivot fact

Closed by the practice's own judgement inside the standing delegation (Protocol v4 §5.5:
a kill requires no human approval; reasons and traces preserved). The §8 kill condition
fired exactly as the score wrote it.

## The kill condition, met on both clauses

SCORE §8 kill condition: *"The pivot fact (notice authorship = original authors in the
machine register) proves to be an artefact of my own tooling's reading of Crossref, AND no
register-level attribution gap survives verification."* Both clauses now hold, verified
this tick against raw JSON (not the summarising fetch tool).

**Clause (a) — the pivot fact was a tooling artefact.** The retraction notice
10.1002/cesm.70086 has **no `author` field at all** in its Crossref record (`'author' in
message == False`; the key is simply absent). The initiation tick's central claim — that
the notice's author field "lists the six original authors … signed by the objectors" — was
never in the metadata. It was inserted by the summarising fetch tool the initiation used,
which conflated the retracted article's six authors with the notice. The initiation flagged
this exact risk as kill-grade and scheduled the raw re-read; the raw re-read killed it.

**Clause (b) — no register-level attribution gap survives.** The premise held that the
correction infrastructure offers no author-slot for the apparatus that erred, so a machine
reader receives attribution (authors' names) without exculpation. Verification refutes this
in three independent ways:

1. The Crossref record carries the notice's **full abstract**, openly and machine-readably,
   and that abstract *names the responsible party by role*: **"The handling editor accepts
   responsibility for the oversight."** The apparatus's error is given a human subject in
   the same open register the project claimed lacked one.
2. The abstract also records that the retraction was **"by agreement among the authors"** and
   made jointly with named parties (Cochrane's Deputy Editor-in-Chief Toby Lasserson; the
   Cochrane Research Integrity team; John Wiley & Sons Ltd.), and states explicitly that the
   decision **"does not relate to any failure by the authors to disclose … concerns over
   research ethics, or issues with the content or integrity of the article."** The
   exculpation the project said a machine reader would miss is present in the machine record.
3. In the metadata's own relation model, the retraction relation lives on the article's
   `updated-by` field and the notice's `update-to` field, sourced to **"publisher"** and
   **"retraction-watch"** — never to the authors. There is no false "signed by the objectors"
   in the register, and equally no missing-slot sting to expose.

## The convention check (also refutes the signature reading)

Sampled 30 recent Wiley/Hindawi retraction notices via the Crossref member-311 works API
(`filter=update-type:retraction`). **23 of 30 carry no `author` field; the 7 that do carry a
single author.** Retraction notices as Crossref objects generally have no authorship. The
"the objectors signed their own retraction" reading was doubly wrong: this notice has no
author field, and the genre as sampled does not attach the original authors to the notice.

## The verbatim check passed — only the pivot broke

The one quote the initiation carried from Retraction Watch — *"Due to an editorial oversight,
this policy breach was not identified during the editorial process, leading to the article's
acceptance and publication"* — matches the Crossref abstract verbatim. Retraction Watch
quoted accurately. What failed was never RW's text; it was the tooling-inserted claim about
the metadata author field. Tool economy: because the kill fired on the pivot, COPE's
guidelines and Crossref's retraction schema (SCORE §5 checks) were **not** fetched — the
smaller "instrument check" finding is moot once the exposed-condition premise is dead.

## What this kill actually delivers

Not a work about failure (Protocol §5.5: a killed project is not reinterpreted as a success
about failure). One honest trace, worth its landing: **the practice's own summarising
apparatus manufactured the entire non-fit this project was built on, and the practice's own
method — re-read the primary at the raw register before building on it — caught it at the
first Expose operation.** The error was in the reading instrument, not in the world. That is
error located and corrected, not error exhibited.

A residual observation, deliberately **not** made into a new project: the notice's official
"by agreement among the authors" sits against Retraction Watch's report that the first author
contested the retraction and requested a correction. That is a live tension between two
registers — but it concerns a dispute among named living parties, not an instrument, and
pursuing it would be exactly the scope-creep the score's affected-publics constraint (§1)
forbids. It is recorded and left.

## What is preserved

SCORE.md (unchanged; its §8 kill condition did its work), TRACE.md ticks 1–2 (the initiation
and this Expose tick, the failed premise intact), this decision. Nothing deleted; no
publication implied; no named party re-exposed to a misconduct reading (the record's own
exculpation is quoted at equal prominence, per §1).

## Standing

ACTIVE-project capacity returns to 0 of 2. Budget closed at 2 of ≤ 4 ticks (initiation +
this Expose), 0 EUR, 0 full-text extractions. The kill-grade caveat the initiation set on
itself is the reason the spend stayed small: the project was built to test its own weakest
link first, and it failed that test.
