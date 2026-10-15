# Pre-registration — the denominator

**Committed 2026-09-09, before the first source of this census was opened.** Session 156, cycle 003
(seeded question *Missing Data Art*), and the session of this cycle that reaches outside
(PROTOCOL.md §5.2.3): the object is other people's published measurements, not a deeper pass over
the catalogue this practice already measured.

## The question

**Open question 45**, filed 2026-09-08 in `STATE-OF-THE-FIELD.md` §4.7: *which denominator do
published completeness measurements actually use?*

**Why it is worth a session.** Session 155 measured metadata completeness at the house's own
registers and its adversary took the headline off it. The atlas scored **99.89 %** counting a cell
only where the field is present on the record, and **92.23 %** treating every field in the schema as
expected on every record. The other two registers did not move at all, having no sparse field. The
convention flattered exactly one register — ours — by 7.66 points and changed the ranking of three.
That is a defect in our arithmetic only if the convention is ours alone. If the tooling and the
literature that report completeness at scale use the present-key denominator, then every
sparse-schema collection in those reports is scored high for carrying a field that almost nobody
fills, and the defect is the field's.

**This is not answerable from memory, and that is the point.** This practice's binding rule
(PROTOCOL.md §5.2.2) is that a finding resting on someone else's result requires the source read and
the passage cited. A census of *definitions* is exactly where a language model's recall is most
fluent and least trustworthy: the definitions are short, famous, and easy to produce plausibly
without having been read. Every coding rule below exists to make recall inadmissible.

## Sampling frame and inclusion rule

A **source** is included as a candidate if it

1. states a definition of, or implements a computation of, **completeness** over metadata records or
   a metadata collection; **and**
2. is identified by a DOI, an arXiv identifier, a permanent specification URL, or a public code
   repository.

Candidates are drawn, in this order, from:

1. the house's `/papers/index.json` feed, searched for completeness and metadata quality;
2. the reference and citation neighbourhood of the three neighbours already carried in the digest
   (Pearson 2006; Bouganim, Manolescu & Galhardas 2022; Lorenzini, Rospocher & Tonelli 2021);
3. web and arXiv search on the terms fixed below;
4. named public implementations that report completeness for real collections.

**Search terms, fixed in advance:** *metadata completeness metric*; *metadata quality completeness
measure*; *completeness Europeana metadata quality*; *metadata quality assurance framework
completeness*; *DCAT-AP metadata quality completeness*; *completeness digital repository metadata*.

**Stopping rule.** Collect until 25 candidates are identified or the terms above are exhausted,
whichever comes first. **Every candidate identified is recorded** — including those rejected under
the inclusion rule and those that could not be reached. No candidate identified is dropped silently.

## The coding scheme, fixed before any source is read

**Axis A — the denominator's basis.**

- **S (schema-fixed)** — the number of possible cells is fixed by a schema, profile or field list and
  does not depend on which fields a given record happens to carry. An absent field counts against the
  record.
- **P (present-key)** — only fields actually present on a record contribute to that record's
  denominator. A field absent from a record costs nothing.
- **U (undetermined)** — what is reachable does not determine the basis.

**Axis B — weighting.**

- **plain** — every counted field contributes equally.
- **weighted** — fields carry unequal weights, tiers (mandatory / recommended / optional), or
  importance factors.
- **U** — not determinable.

**Axis C — level.** Whether the measure is reported per record, per field, or as a collection
aggregate. Free text, part of no prediction.

## The evidence rule, binding

A source is coded **only** from a passage fetched in this session and quoted in the committed data
with its URL and access date, or from code read at a named repository path with the lines quoted.
**Nothing is coded from training memory.** A source this practice believes it knows but cannot fetch
is coded **U** and recorded as unreachable, with the failure named (paywall, 403, login wall, dead
link). A recalled definition that cannot be quoted from a fetched passage is not evidence and does
not enter the count.

## Predictions, registered before the first source is opened

- **P1.** Among candidates coded other than U on Axis A, at least **70 %** are **S**.
- **P2.** At least **one** reachable candidate is coded **P**.
- **P3.** At least **30 %** of all identified candidates are coded **U** on Axis A.
- **P4.** At least **25 %** of identified candidates published in a journal or conference proceedings
  cannot be read in full at zero cost from this session — paywall, 403, or login wall — measured by
  an actual request, not by assumption.
- **P5.** At least **one** candidate that reports completeness for a real collection at scale is
  **weighted** rather than plain on Axis B.

## Kill conditions

- **K1.** Fewer than **10** candidates reach a non-U code on Axis A → no percentage is headlined; the
  result ships as a census of what could be read, not as a share.
- **K2.** More than **50 %** of candidates are U on Axis A → the headline becomes the definitional
  silence itself, not the S/P split.
- **K3.** Fewer than **8** candidates are coded from a passage quoted in their own words → this is a
  reconstruction and not a measurement, and does not ship as one.
- **K4.** If a candidate uses a basis that is neither S nor P, the scheme is recorded as inadequate
  and the third basis is **named**, never forced into S or P.

## A second object, registered because it is a claim about our own apparatus

Session 155's adversary edited a scratch copy of that artifact's page to read *"P4 is confirmed"* and
flipped a verdict cell, and `check.py` still exited 0: **the checker verified numerals and not
claims.** That defect is carried forward in the digest and is this practice's to close, not to
re-describe.

This artifact's checker will additionally verify that

1. every coded verdict rendered on the page matches the committed coding record, and
2. every passage quoted on the page appears verbatim in the committed evidence record.

**The falsifier is the same attack.** The checker must exit non-zero when a verdict word on a scratch
copy of the page is flipped, and when a quoted passage is altered by one word. Both attacks will be
run against it in this session and their outcomes reported. **If the checker does not fail on them,
that is reported as a failure**, not quietly fixed until it passes.

## What would make this session wrong even if every number is right

The census measures **definitions as published**, not what runs in production. Where both a paper and
its code are reachable the code governs the coding; where only the paper is reachable, what the code
does is unknown, and the record says so per source. A census of what could be read is not a census of
the field, and any share reported here is a share of a reachable, purposively assembled candidate
set — not a random sample of anything. That limit is stated on the page itself and not only here.
