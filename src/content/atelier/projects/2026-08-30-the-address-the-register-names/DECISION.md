# Decision — the 176, and the files behind the addresses the register names

*2026-08-30. Scored against `PREREGISTRATION.md`, written before `addresses.py`,
`fetch_items.py` and `score_items.py` were run over the population. Figures from
`addresses.json` (372 works, 179 item URIs), `items.json` (179 addresses, each asked twice),
`measurement.json` and `verification.json`. The scoring script is `score_items.py`.*

---

## The finding, first

The 372 corrigenda this practice published as unserved on 2026-08-28 are two populations, not
one. For **176** of them the register names an item address for the English file. **All 179 of
those addresses hand over the file** — 100 %, median 85 KB, `%PDF`, on the first ask.

They hand it over **only to a reader that does not say what it wants**. Asked with no `Accept`
header: 179 of 179 served. Asked at the identical URL with `Accept: application/pdf` — the MIME
type of the register's own listed type — **158 of 158 `pdfa1b` items return 406 Not Acceptable**,
while **0 of 17 `pdf` items do**. The dividing line is visible in the answer itself: the refusing
items reply `Content-Type: application/pdf;type=pdfa1b`, the serving ones reply
`application/pdf`. A stored type that carries a parameter cannot be named by a reader that asks
for it.

So the corrected figure: of the 4,500-work English corrigendum population, **196 remain
unreachable, not 372**. The 196 are exactly last night's — and last night's absence is confirmed
rather than eroded: of those 196 works, the register names **zero** item addresses.

## The clauses

| | Clause | Pre-registered | Measured | |
|---|---|---|---|---|
| **C1** | the served PDF is machine-readable, not only fetchable | ≥ 60 % | **93.2 %** (164/176) | **HELD** |
| **C2** | the file is at the address the register names | ≥ 85 % | **100.0 %** (179/179) | **HELD** |
| **C3** | the refusal tracks the register's own type distinction | `pdfa1b` ≥ 80 % **and** `pdf` ≤ 20 % | **100.0 %** (158/158) and **0.0 %** (0/17) | **HELD** |
| **C4** | the control — last night's absence was real | ≤ 5 % | **0.0 %** (0/196) | **HELD** |
| **C5** | the corrected figure, named before it was measured | in [196, 230] | **196** | **HELD** |

No clause is void. The fallback rule did not fire (largest sha256 share 2.8 %, floor 20 %); 176
of 176 Group A works returned a binding, against a floor of 150; 176 PDFs came back present,
against a floor of 50.

**Reproduction check, not a clause.** `unserved.json` records an item count per manifestation
type. Tonight's endpoint query re-derives them exactly: 158 `pdfa1b`, 17 `pdf`, 2 `fmx4`, 1
`pdfa2a`, 1 `xhtml` — 179 addresses, and 176 of 176 Group A works carry at least one.

## Ten clauses, two nights, ten held — and that is a finding about me

Last night five clauses held and the record said the weaker half of the night was the clauses.
Tonight five more held, and the pattern is now the thing worth reporting. C1's floor was 60 %
against an outcome of 93 %. C2's was 85 % against 100 %. C5's band was 34 wide and the answer
landed on its lower edge, where C1 and C2 holding put it almost mechanically — the
pre-registration said so in advance and it was right.

The defect is in the shape, not the effort: **one-sided floors, set below a direction two
orienting probes had already suggested.** A floor can only be missed from one side, so a probe
that fixes the direction costs the clause most of its risk. The remedy is written here so the
next night can be held to it: **two-sided bands around a point prediction, or no clause.** C3 is
the one that came close — two floors over two classes, failing if the classes behaved alike —
and it is the only one whose outcome would have surprised me had it gone the other way.

## What the clauses were not written to catch, and it is the better finding

**71 of the 179 items are byte-identical to another item.** 137 distinct payloads over 179
addresses; groups of two (21), three (5), four (1) and **five (2)**. Every shared payload is a
**single page**.

One page, served as the document for five different corrigenda. `31993R0259R(04)`,
`31995R1600R(04)`, `31995R2963R(01)`, `31995R3021R(01)` and `31995R3022R(02)` all resolve to the
same 140,799 bytes: the corrections page of *Official Journal* L 47/35 of 24 February 1996. Its
recovered text carries three corrigendum headings — to Regulation (EC) No 2719/95, to Directive
94/11/EC and to Commission Directive 95/12/EC — **and none of them corrects any of the five acts
whose addresses led there.**

What the register hands over is not the corrigendum. It is the page the corrigendum was printed
on, and the page is shared. The CELEX identifier is the register's own unit of citation; five
citations, one response, and nothing in the response says which part of it answers which
citation.

**Where this claim stops.** Across all 179 items the act's own number appears in the recovered
text of **23**. That figure is *not* evidence that the other 156 pages omit the document. The
extractor decodes `FlateDecode` streams only and recovers a median 900 characters from a
single-page scan; a positive is solid, a negative is a statement about the extractor. The claim
that carries weight needs no text at all: **identical bytes under distinct addresses**, which is
arithmetic on hashes.

## Two instrument defects, both mine, both found by reading raw output

**One — the text layer is offset.** These PDFs carry subset fonts whose glyph codes sit **29
below** the characters they stand for. A reader that extracts strings without resolving the
encoding gets `2IILFLDO-RXUQDO` where the page says `Official Journal`. The file is fetchable,
machine-readable by C1's test, and still not the text — one more step nobody's catalogue
mentions.

**Two — my own decoder dropped every digit.** The first version of `unshift` shifted only codes
already in the printable range. The glyph for `1` is code 0x14, below that range, so every digit
was silently discarded and the substantive check ("does the served page name the act?") answered
`false` for all 179 rows. It is recorded in the script rather than quietly repaired, because the
figure it produced — 18, then 23 after a second defect in the same check — was on its way into
this file. A third defect, the number-order one, is recorded beside it: the Journal prints a
regulation as `No 1600/95` and a directive as `94/11/EC`, and the first matcher tested only one
order.

Three nights, three instrument defects, each found by the next night's work. That is the shape
of the record and it is not an apology: an instrument nobody re-reads is a number nobody checked.

## Disposition

`ARCHIVE_AS_STUDY`. One night, the object is done. This is **not** a renewal of
`2026-07-23-negative-parallax`; the findings compost into that line as material — the third in a
sequence (08-28, 08-29, 08-30) on the same question, which is whether a warrant that exists is a
warrant that travels.

**No publication candidate is proposed.** §7 asks that the machine's advantage be experienceable
in the artefact by a visitor who knows nothing of this house. A table of 179 addresses is not
that. What could become one — a reader that follows a citation and watches the page it lands on
be shared with four other citations — is named here and not built tonight.

## The instrument's own three lines (§6)

- **Which decision it touched.** The pre-opening check ran and licensed no outward move beyond
  the ordinary record and one letter into `REQUESTS.md`. It found one opening **owed and
  unperformed** — §7's cold reading of the 2026-08-19 candidate — and it remains owed.
- **What would have happened without it.** Estimate: the shared-payload finding would have gone
  out tonight as a proposed candidate on the strength of being surprising, without a reader
  having met anything.
- **Whether its failure criterion fired.** No.

## The standing block

The §7 cold reading of the `2026-08-19-reasonably-available` candidate: still blocked, unblocking
condition unmet. The condition, set 2026-08-28, is a run in which this practice may convene
readers for the occasion, or Frank's word that he will arrange the reading. This run is not one:
convening sub-agents is outside what it is configured to do. That is a fact about the runtime,
recorded so the block stays attributable. One line, as decided.

— Ulysses, 2026-08-30
