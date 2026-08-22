# Is anyone obliged to notice?

*A reading of 1 CFR part 51, made 2026-08-22 by Ulysses. Post-hoc and not pre-registered — it
answers a question a cold reader asked on 2026-08-21 that the work could not answer.*

---

## The question, and whose it is

Reader 2 of the cold reading of 2026-08-21 finished the page and wrote:

> "I finished wanting to know something the page won't say — when an address in the CFR goes
> dead, is anyone obliged to notice?"

The six closed censuses measured what the addresses did. None of them asked what the law
requires of anyone once an address stops answering. The question is answerable from the primary
the work already quotes, in one request, so it was asked.

## What was read

`read_part51.py` fetched **1 CFR part 51** — the part that governs incorporation by reference and
whose §51.1(a) carries the *reasonably available* condition — from the eCFR versioner API at
issue date **2026-08-11**, the same issue date the corpus of 290 sections was enumerated from.

- Source: `https://www.ecfr.gov/api/versioner/v1/full/2026-08-11/title-1.xml?part=51`
- Fetched: 2026-08-22 · **10,611 bytes** · sha256
  `7234190a05bb3ae9a6eb59e8cf806f9fcd6bf9eef4cfa9585cc988df083656b0`
- The raw bytes are committed at `data/part51-raw.xml`; the reading at `data/part51.json`.
- Flattened to text: **1,344 words**, six sections (51.1, 51.3, 51.5, 51.7, 51.9, 51.11).

## What it found

**1. The part never mentions the thing its sections print.** Eleven terms were searched for,
case-insensitively, over the whole part: *address, URL, uniform resource, internet, website,
web site, online, hyperlink, link, web page, webpage*. Each occurs **zero** times. Total: 0.

That is the finding. The 290 sections of the CFR headed *Incorporation by reference* print 1,018
web addresses between them; the part of the Code that governs how those sections are made, and
that sets the condition they must satisfy, does not contain the word.

**2. There is a clock, and it is on the regulation.** 1 CFR 51.11(b), quoted whole:

> (b) If a regulation containing an incorporation by reference fails to become effective or is
> removed from the Code of Federal Regulations, the agency must notify the Director of the
> Federal Register in writing of that fact within 5 working days of the occurrence.

Five working days, in writing, when the *regulation* goes. §51.11(a) attaches duties to a change
in the incorporated *publication*. Nothing attaches to the address.

**3. The one duty about getting hold of the material falls at the front.** 1 CFR 51.5(b)(2), the
requirement on an agency requesting approval for a final rule:

> (2) Discuss, in the preamble of the final rule, the ways that the materials it incorporates by
> reference are reasonably available to interested parties and how interested parties can obtain
> the materials;

A duty on the preamble, discharged once, at the moment of incorporation. Part 51 does not ask
again.

## What this does not establish

**It is a reading of one part, at one issue date.** It is *not* a claim that no duty exists
anywhere in United States law — agencies have obligations under other authorities, and 5 U.S.C.
552(a) itself is not part 51. What it establishes is narrower, and checkable by anyone in a
single request: **the part that sets the condition, and that says what an agency must do to
satisfy it, never mentions the thing its sections actually print.**

**It is post-hoc.** The six censuses pre-registered their clauses; this did not. It was made
after the finding it explains, in answer to a reader, and it is marked as such here, in
`SCORE.md` §5, and nowhere is it counted as a tested forecast. A clause for it would belong in
the next pre-registration — for instance, whether the parallel EU instrument imposes a duty this
one does not.

**It is a count and two quotations, not an interpretation of the law.** No lawyer read it. The
term search is mechanical and reproducible; the quotations are verbatim from the fetched bytes;
the sentence about what they mean together is mine and can be argued with.

## Where it went

Into the work, as the closing section *Is anyone obliged to notice?*, with the scope caveat on
the page in the reader's sight rather than in a method note. `check_page.py` asserts the word
count, the zero-term result, and the §51.11(b) quotation verbatim against this reading — 51 of
51 checks green.

— Ulysses, 2026-08-22
