# ATP re-verification — 2026-08-18

*Evidence of the re-verification the apparatus limitation always promised
(`reading/00-protocol.md`: "If the practice ever gains direct access to the edition,
citations are re-verified and the re-verification dated"). Executed by the session of
record 22 (`nights/22-seventeenth-bell.md`) — the first session whose credential
reaches the granted edition. Findings read at
`reading/15-verification-the-copy-chain.md`.*

## Source and reach

- **The edition:** Deleuze/Guattari, *A Thousand Plateaus*, trans. Massumi,
  University of Minnesota Press 1987 — the founder's own copy, granted 2026-08-17
  (`REQUESTS.md`, commit 97542bc) in the private repository `frankbueltge/material`
  as a PDF and a page-tagged extraction (`atp.pages.txt`, printed page numbers read
  from the pages themselves; 439 of 630 pages confirmed, the rest tagged by PDF
  index; its README documents method and caveats).
- **The reach, verified this session:** `git ls-remote` against
  `https://github.com/frankbueltge/material` returns HEAD (489de9d) where the
  session of night 05 recorded `Authentication failed`; the `n-1` control still
  answers. The edition also stands cloned beside the session's working directory.
  Both observations dated in the night record and the register.
- **Rights:** the material repository is private and the book in copyright. Floor
  rule 2 (as amended 2026-08-16): what leaves it is citation, never text. This
  directory contains **no text of the edition** — the script emits verdicts, page
  numbers and fragment lengths only; the short quotations below are ordinary
  scholarly citation, each with its page, and each already published in this
  repository's reading or foundation.

## What was verified

Every quotation in `reading/*.md` carrying an ATP page citation — 59 instances after
excluding one extraction artifact (a regex over-capture in entry 09 containing
backticks, not a quotation) — plus a per-page examination of every cited page not
covered by a verified quotation. Method in `verify.py` (re-runnable by any reader
with access to the material repository); full verdicts in `results.json`.

**Mechanical tally (59 quotation instances):**

| verdict | count | meaning |
|---|---|---|
| verified, confirmed marker | 20 | fragment(s) letter-for-letter on the cited page, printed number confirmed |
| verified, inferred marker | 30 | as above, printed number inferred from confirmed neighbours (consistent bracketing) |
| verified, fuzzy | 2 | on the cited page within 1 substitution — see finding 3 |
| KsK wording | 4 | the quoted sentence is the foundation's own prose carrying the citation, not Massumi's text — see finding 2 |
| elsewhere | 3 | the literal string stands on another page — see finding 1 |

**Coverage of cited pages:** the reading cites 38 distinct ATP pages across 77
citation instances. 30 pages carry at least one letter-for-letter verified
quotation. The remaining eight (80, 82, 143, 160, 262, 294, 312, 409) were examined
directly this session; **every one carries the cited passage** — verbatim at 80
("the judge's sentence that transforms the accused into a convict"), 143
("axiomatics blocks all lines"), 262 ("You are longitude and latitude, a set of
speeds and slownesses between unformed particles, a set of nonsubjectified
affects"), 294 ("Becoming is an antimemory"), 312 ("These are not three successive
moments in an evolution. They are three aspects of a single thing"), 160 (the inner
quotation "for it to reform each dawn"), and with the deviations recorded below at
82 and 409.

## Findings

1. **ATP 82 — one adaptation in the citation chain.** The page reads: *"'I swear' is
   not the same when said in the family, at school, in a love affair, in a secret
   society, or in court: it is not the same thing, and neither is it the same
   statement"* (ATP 82). The foundation quotes the phrase as *"not the same
   statement"* (KsK §4.2), and the reading inherited it three times (entries 02, 03,
   12). The substance is exact; the quoted string is a grammatical adaptation — the
   contiguous words "not the same statement" stand on p. 147 (the "I love you"
   analysis), not on p. 82. Offered as a collation datum to the foundation's own
   editorial reservation ("a final collation against the print edition precedes any
   print publication").
2. **Four quotations quote the foundation, not the edition.** The reading quoted,
   with quotation marks and an ATP citation attached, sentences that are KsK's own
   prose: the Postulate 4 summary ("to win a fragile hold in chaos…", ATP 311), "The
   map belongs to performance; the tracing invokes an alleged competence" (ATP
   12–13), "attained at the highest point of depersonalisation" (ATP 36–37), and one
   composite in entry 06 (ATP 160). Each stands verbatim in `foundation/` — the
   reading's discipline held — and each paraphrases faithfully: the edition has "The
   map has to do with performance, whereas the tracing always involves an alleged
   'competence'" (ATP 12–13), "at the outcome of the most severe operation of
   depersonalization" (ATP 37), and the three refrain aspects the summary compresses
   (ATP 311). No substance shifts; the quotation marks in the reading enclose the
   copy, not the source.
3. **ATP 409 — the extraction deviates, the quotation stands.** The edition reads
   *"this matter-flow can only be followed"* exactly as cited; the extraction's OCR
   renders "be" as "he", so exact search misses a quotation that is verbatim on its
   page. The material README's caveat class (extraction artifacts defeat plain
   search) gains a documented member; the fuzzy pass exists for this.
4. **The marker inference.** 30 of the 52 verified instances land on pages whose
   printed number the tagging could not confirm and this method infers from
   confirmed neighbours. The inference is structural (positions must bracket
   consistently), not an offset guess; it is disclosed per instance in
   `results.json`.

## The claim's exact size

Verified: that every ATP quotation in the reading stands on its cited page in the
granted extraction of the edition (letter-for-letter in 50 instances, within one OCR
substitution in 2), or is classified above; and that every cited page carries its
cited passage. Not claimed: anything about the foundation's several hundred further
ATP citations (not this discharge's object); anything about the print edition beyond
what the extraction carries (the extraction's own fidelity is the founder's
documented method, trusted here and named as a link in the chain — see the reading
entry). Re-running requires access to the private material; the verdicts, not the
access, are the public record.
