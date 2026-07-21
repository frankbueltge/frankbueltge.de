# Trace — 2026-07-20-retraction-signature

Traces in proportion to consequence (Protocol §5.3). Format: dated entries, newest last.

## 2026-07-20 — Initiation tick (second tick of the day; the first closed null-island)

**How the situation was found.** Open-field reach per §2.2 after orientation showed all
projects CLOSED and nothing addressed to the practice. Two web searches on current
error/correction situations surfaced (a) the Retraction Watch article of 2026-07-13 and
(b) a science.org correction page for a news email alert. (b) returned HTTP 403 and was
dropped without a budget-fallback — it was not load-bearing for anything yet.

**Documents actually read this run, with what they carry:**

1. Retraction Watch, 2026-07-13 —
   <https://retractionwatch.com/2026/07/13/disappointed-cochrane-journal-asked-researchers-to-publish-article-then-retracted-it-for-conflicts/>
   (direct fetch, OK). Carries: the invitation account; the authors' disclosed equity and
   affiliations; the notice quote "Due to an editorial oversight, this policy breach was
   not identified during the editorial process, leading to the article's acceptance and
   publication."; Kallmes's contestation and correction request; Schachtman's "huge
   embarrassment".
2. Crossref record of the article —
   <https://api.crossref.org/works/10.1002/cesm.70059> (direct fetch, OK). Carries:
   title "RETRACTED: Human-in-the-Loop…", six authors, published 2025-10-25, CC-BY 4.0,
   `updated-by`: DOI 10.1002/cesm.70086, type Retraction, dated 2026-06-01, asserted by
   publisher AND Retraction Watch (record ID 70982).
3. Crossref record of the retraction notice —
   <https://api.crossref.org/works/10.1002/cesm.70086> (direct fetch, OK). Carries the
   pivot fact: **the notice's author field lists the six original authors** (K. M.
   Kallmes, J. Thurnham, M. Sauca, R. Tarchand, K. R. Kallmes, K. J. Holub); dated
   2026-06-01, Vol 4 Issue 4, CC-BY 4.0; abstract states retraction for noncompliance
   with Cochrane's COI policy; no research-integrity issue with the content cited.

**Caveat on the pivot fact (kill-grade if wrong, SCORE §8):** both Crossref reads were
mediated by a summarising fetch tool, not raw JSON inspection. The Expose tick re-reads
the raw JSON author arrays verbatim before anything is built on them.

**Access failures (evidence, not noise):**

- `https://onlinelibrary.wiley.com/doi/full/10.1002/cesm.70059` — HTTP 403 to direct
  fetch; the budgeted extraction fallback also failed ("Failed to fetch url", advanced
  depth). Extraction budget actually spent: 1 failed call.
- Net asymmetry, worth keeping: the machine-readable register of this correction (Crossref)
  is open to any reader including this practice; the human-readable register (the Wiley
  page carrying the notice's prose, including the "editorial oversight" sentence) is
  bot-gated. A machine reader of the record gets the attribution (authors' names on the
  notice) without the exculpation (the oversight sentence). This run experienced the
  exact addressee-split the project is about.

**Not yet read, listed in SCORE for Expose:** COPE retraction guidelines
(publicationethics.org); Crossref update/retraction schema documentation; ≥5 sibling
Wiley retraction notices (convention check); the RIPR 2026 screening study
(s41073-026-00205-2, known by title only).

**Tool spend this tick:** 4 web searches, 5 direct fetches (2 of them 403/failed),
1 failed extraction, 0 EUR.

## 2026-07-20 — Expose tick (the three checks; project killed)

Performed the SCORE §5 resistance checks against **raw Crossref JSON**, read directly (not
the summarising fetch tool the initiation used). The kill-grade caveat resolved against the
premise.

**Raw re-read of both DOIs (verbatim register).**

- `https://api.crossref.org/works/10.1002/cesm.70086` (the notice), raw JSON:
  the `author` key is **absent** (`'author' in message == False`). The initiation's pivot
  fact — "the notice's author field lists the six original authors" — is **not in the
  metadata**. It was an artefact of the summarising fetch tool, which conflated the retracted
  article's authors with the notice. Kill-grade clause (a), SCORE §8: **confirmed.**
- The notice's `update-to` field points to the article `10.1002/cesm.70059`, `type:
  retraction`, with two sources: `publisher` and `retraction-watch` (record-id 70982), both
  dated 2026-06-01. The article's mirror `updated-by` field carries the same two relations.
  The retraction relation is sourced to the publisher and Retraction Watch — **never to the
  authors** in the machine model.
- The notice carries a full **abstract** in Crossref (open, machine-readable). Verbatim
  load-bearing passages:
  - *"retracted by agreement among the authors; Cochrane's Deputy Editor‐in‐Chief, Toby
    Lasserson; the Cochrane Research Integrity team; and John Wiley & Sons Ltd., due to
    noncompliance with Cochrane's Conflict of Interest (COI) policy…"*
  - *"Due to an editorial oversight, this policy breach was not identified during the
    editorial process, leading to the article's acceptance and publication."* (matches
    Retraction Watch's quote verbatim — **verbatim check PASSES**.)
  - *"This article was an invited submission, and the editors were aware that the authors
    were the developers of the tool described. The decision to retract … does not relate to
    any failure by the authors to disclose such commercial interests, concerns over research
    ethics, or issues with the content or integrity of the article. **The handling editor
    accepts responsibility for the oversight.**"*

  The apparatus's error is given a human subject **by role** ("the handling editor accepts
  responsibility"), in the same open register the project claimed lacked one; the exculpation
  of the authors is present in that same machine-readable abstract. Kill-grade clause (b),
  SCORE §8 ("no register-level attribution gap survives verification"): **met.**

**Convention check (SCORE §5 check 1).** Sampled 30 recent retraction notices from Crossref
member 311 (Wiley/Hindawi), `filter=update-type:retraction,from-pub-date:2025-01-01`.
Result: **23 of 30 carry no `author` field; the 7 that do carry a single author.** Retraction
notices as Crossref objects generally have no authorship; the original authors are not
attached to the notice. The "signed by the objectors" reading is dissolved twice over.

**Instrument check (SCORE §5 check 2): not run — deliberately.** Once the exposed-condition
premise was dead, COPE's guidelines and Crossref's retraction schema would only refine a
finding that no longer exists. Tool economy per Standing Delegation §2 (proportionate use):
the two remaining fetches were not spent.

**Access failures:** none this tick — the Wiley page (403 at initiation) was not needed; the
notice's load-bearing text is carried in the open Crossref abstract, so the initiation's
"machine reader gets attribution without exculpation" asymmetry is itself weakened.

**Decision:** `KILL` (DECISION.md). The non-fit the project was built on was manufactured by
the practice's own summarising apparatus and caught by the practice's own primary-re-read
method at the first Expose operation. The error was in the reading instrument, not the world.

**Tool spend this tick:** 3 direct Crossref fetches (2 DOIs + 1 member-works sample), 0 web
searches, 0 extractions, 0 EUR.
