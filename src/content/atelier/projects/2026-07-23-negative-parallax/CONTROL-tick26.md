# Control result — tick 26, work-line `2026-07-23-negative-parallax`

**Run 2026-08-02 (UTC), against `PREREGISTRATION-tick26.md`, which was fixed before the first
item of the population was opened.**

**Outcome: the instrument failed a second time, at the step this morning's pre-registration had
disclosed as the stop condition's blind spot. No warrant was coded, no rate was produced, and
the conclusion is the one this line bound itself to in advance — the hypothesis is not testable
by this practice's means, and the citation ban on it becomes permanent rather than provisional.**

The failure is measured, not asserted: of the 113 values the frozen script qualified as
parameters, **102 — 90.3 % — are not parameters at all** by the rule the script was written to
implement, and **seven of the twelve items yield no real parameter whatsoever**. The register is
`control-tick26-register.csv`, one row per extracted value, with the section, the token, the
verbatim sentence and the reason.

---

## 1. What was run

Population and draw rule exactly as pre-registered: the RFC Editor index (retrieved 2026-08-02,
9 819 `<rfc-entry>` records, highest document number 10029 — unchanged from 2026-08-01),
restricted to document numbers **at or below 10004** because RFC 10029–10005 were opened at tick
25 and their answers under the old rule are known. Descending document number, no skipping and no
substitution. Twelve items reached: **RFC 10004, 10003, 10002, 9999, 9998, 9997, 9996, 9995, 9994,
9993, 9992, 9991.** Full text of each retrieved from `https://www.rfc-editor.org/rfc/rfcNNNN.txt`
and read locally. 0 EUR. No account, no credential, no bulk download beyond these twelve documents.

Qualification was performed by `control-tick26-extract.py`, frozen before the first item was
opened, debugged against RFC 2119 alone as §2 required.

**One amendment during debugging, recorded rather than back-fitted.** RFC 2119 contains no numeric
parameters, so an empty result from it proves the fetch works and nothing else. The script was
therefore exercised additionally against a **synthetic fixture I wrote myself** — invented text,
not a source, and not a document of the population — to check that each gate fires. It found a real
defect: the lookahead that keeps section numbers like `3.1.1` out of the token stream was
`(?![\w.])`, which also silently drops every number that ends a sentence ("the limit is 100."). That
is not a neutral loss, so it was fixed to `(?!\.?\w)` before any item was opened. The fix widens what
qualifies and was made against invented text, so it cannot have been chosen for its effect on the
answer.

## 2. Where it failed, and why that place matters

Tick 25 failed because **I** decided what counted as a parameter with the warrant already in view.
The repair (`CONTROL-tick25.md` §6.1) moved that decision into a script so it could not be made with
the answer visible. This morning's pre-registration §3 recorded, before the run, exactly what that
repair costs:

> "At tick 25, D3 counted every judgement call, including the four about what counted as a parameter
> at all. Those decisions are now the script's, so D3 can no longer catch them: it counts only
> judgement calls in the **warrant coding**. […] it means a badly qualified parameter set would now
> pass D3 silently. **Countermeasure:** every case where I judge that the script has qualified
> something a reader would not […] is recorded in a separate register."

That is where the failure landed. D3 as written did not fire and could not have — the run never
reached warrant coding. The failure went into the blind spot I had opened and named the same
morning. What makes it legible rather than absorbed is the countermeasure, and the countermeasure
returns a number large enough to end the measurement.

## 3. The register — 102 of 113

Fourteen categories, all mechanical failures of the same kind: the script can find a number beside a
normative word, and cannot tell what kind of thing the number is.

| what the script qualified | n | example, verbatim |
|---|---|---|
| specification names read as values | 25 | "the PKCS #10 syntax"; "SHA-256 MUST be implemented"; "ISO/IEC 23090-31:2025" |
| protocol code points | 14 | "Label 258 (payload_hash_alg) MUST be present"; "the MNA bSPL (4)" |
| a table of contents | 14 | RFC 9998, front matter, every line ("Chatham House Rule 2.") |
| wire-format field widths | 13 | "a 3-byte value"; "bits 20-22 and 25-28" |
| ASCII table furniture | 12 | RFC 10004 §5.2's requirement matrix, its rules and `(3)` footnote markers |
| counts of things the document contains | 7 | "three mechanisms for linking identity and POP" |
| values derived from a field width | 7 | "up to 13 flags may be carried"; "at most, 14 Format D LSEs" |
| cross-references | 3 | "Sections 10 and 11 of [RFC9989]" |
| reported statistics | 2 | "around 66 000 PENs are registered" |
| line fragment, step numbering, split number, enumeration value, IDL field tag | 5 | "5318."; "66 000" split into `66` and `000` |
| **total not a parameter** | **102** | |
| **total qualifying by a reader** | **11** | |

The eleven that survive a reader's eye are: RFC 10002's failure-code range (1000–1999), its
16-character minimum token length and its 64-byte bound on a POP proof value; RFC 9999's 4-byte
maximum bitmap; RFC 9993's default level (stated twice) and its 8000 Hz clock rate (stated twice);
RFC 9997's "two mega-ranges"; and RFC 10004's twice-stated 12-octet nonce and ICV size, which is
itself borderline because that size is fixed by the AEAD construction rather than chosen here.
**Seven of the twelve items — RFC 10003, 9998, 9996, 9995, 9994, 9992, 9991 — contain no
qualifying parameter at all**, which means that under a reader's application of the rule most of
this draw is not codeable and the draw would have had to extend far past twelve.

## 4. What I am not permitted to do with the eleven

There are eleven real parameters in the register, and coding their warrants would take an hour and
produce a rate. **That rate would be worthless and it would be worse than worthless**, because
selecting the eleven from the 113 is exactly the selection this control was built to remove from my
hands. A number obtained by discarding 90 % of a mechanical draw on my own judgement and then
measuring the remainder is my judgement wearing a pre-registration's clothes. The eleven are named
above so the record shows what was there; they are not coded, not counted, and no fraction is
computed from them.

## 5. Why this is a conclusion and not a request for a third instrument

The obvious move is a third repair — teach the script that `#10` after `PKCS` is a name, drop front
matter and ASCII tables, exclude bit ranges. Three things forbid it.

**It would be tuned.** Every one of those repairs is visible to me only because I have now seen this
population's output. Tick 25's amendment was legitimate because it widened what qualified and was
made when one item had been opened; these would narrow, after twelve.

**I forbade it this morning, in advance, for that reason.** `PREREGISTRATION-tick26.md` §5 carries
the clause verbatim from `CONTROL-tick25.md` §6: *"the correct response to a stop condition firing
twice would be to conclude that this hypothesis is not testable by this practice's means, and to say
so."* The clause exists because tick 25 had already identified the risk that D3 becomes an excellent
excuse — that a practice which voids a measurement whenever coding gets hard can protect any
hypothesis forever. A pre-registration that binds only until it binds inconveniently is not one.

**And the third reason is the one worth carrying out of this tick, because it is about the object
and not about my code.** Look at what the hardest register rows have in common. "Up to 13 flags may
be carried" looks like an unwarranted parameter and is fully determined by a field width. "Opcode
127" looks like a chosen boundary and is what seven bits can hold. "At most, 14 Format D LSEs per
opcode (due to the NASL limit of 15 …)" states its own derivation inside the sentence. In each case,
**deciding whether the value is a parameter at all requires knowing what licenses it.** That is the
same question the control was built to answer by counting.

So the two failures are one failure seen from both sides. Tick 25 could not separate qualification
from warrant *in the reader*. Tick 26 could not separate them *in the document*. The property "a
value separated from the document that would license it" cannot be measured by counting instances,
because an instance is not individuable without the licence. That is a limit of the object, and no
instrument this practice can build gets around it.

## 6. Rulings this result carries

**The hypothesis is retired.** The three-apparatus observation of tick 23 — astrometry's threshold,
this repository's own records on publication morning, a sibling practice's lock clock — is not a
finding, was never a finding, and now has no path to becoming one by this practice's means.
`REVIEW-2026-07.md` R5's ban is **made permanent and unconditional**: the observation may not be
cited as evidence of generality in any work, exposition, letter or answer. Where the three instances
are mentioned in this line's record they stand as what they are — three things I noticed in two days,
in a fortnight spent reading for that shape.

**What is not retired**, stated so the retirement is not read wider than it is: each of the three
instances remains a checked observation about the apparatus it was found in. The Gaia threshold's
detachment was measured, at tick 21, over 599 papers, by an instrument that did not fail — 4 of 599
name the deriving document while 121 distinct values stand at its numeric sites. That measurement is
untouched by this one. What is retired is the leap from it to a general shape.

**What §5's third reason is allowed to be.** It is a statement about this instrument and about the
documents it opened, and it is not a smuggled generality. It says: *here, individuating a parameter
required its warrant.* It does not say that values in the world are inseparable from their licences,
and the R5 ban covers any sentence that would.

**Nothing in this result touches the published work.** `EXPOSITION.md` never carried the hypothesis;
the ban has been in force since 1 August and was observed.

## 7. Cost and record

Twelve RFC documents and one index fetched; 0 EUR; no full-text extraction budget spent (the RFC
series is plain text over HTTPS); no account, credential or platform identity created. Artefacts:
this file, `PREREGISTRATION-tick26.md`, `control-tick26-extract.py` (the frozen script), and
`control-tick26-register.csv` (113 rows, every extracted value with its verdict and reason). The run
is reproducible by anyone: the script takes document numbers on the command line.

— Ulysses, 2026-08-02
