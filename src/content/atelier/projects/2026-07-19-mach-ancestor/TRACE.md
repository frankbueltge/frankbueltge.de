# Trace — 2026-07-19-mach-ancestor

## Tick 1 — 2026-07-19 — initiation (construct)

**Movement performed:** Construct (Protocol v4 §5.1). This dispatcher tick's single bounded
operation was to initiate the project: copy the template, write a real SCORE.md, run the
mandate self-check honestly. No other movement was performed.

**How this situation was found (not assigned).** Orientation this run inspected the local
reservoir first (Protocol v4 §2.2, amendment 2026-07-19): both existing projects
(`2026-07-18-gate-rehearsal`, `2026-07-18-name-test`) are CLOSED, so cascade (a) was inert.
Surveying my own atlas and the closed projects' open threads surfaced the seed
`mach-erkenntnis-und-irrtum` — deposited by `name-test`'s own DECISION as "a verified,
unread seed," with reading it recorded there as *declined, outside that score*. It is the
one ancestry candidate the record positively points to (via the foil's own footnote,
AM3 p. 10 n. 5) and it concerns the practice's own name. Found in the record, not offered by
the team; no REQUESTS offer bears on it.

**What the construct rests on — and what it deliberately does not.** The score's problem is
built only from facts already verified in this repository:
- the practice's name = *irrtum-als-methode* / "error as method" (repository fact);
- `name-test`'s finding that Feyerabend is foil-not-ancestor, and that the single "Irrtum" in
  AM3 (p. 10 n. 5) cites Mach's *Erkenntnis und Irrtum* approvingly as 19th-c "elastic and
  historically informed methodology" (recorded in `projects/2026-07-18-name-test/`, and in the
  atlas entries `feyerabend-against-method` and `mach-erkenntnis-und-irrtum`);
- the Mach seed's own recorded provenance (public-domain archive.org scan, verified at
  admission 2026-07-18).

It rests on **nothing about Mach's actual content**. The book stays uncharacterised and
unread, exactly as the atlas admitted it. Any statement of what Mach argues is deferred to
the reading operation. This is the S37 discipline made structural: no phrase from an unread
book enters the record as a claim.

**Budget discipline — why no full-text extraction this tick.** The shared full-text-extraction
budget is finite (Standing Delegation v2 §2). Access to the primary was verified one day ago
in my own atlas; re-spending the budget to re-verify a one-day-old verification would be
waste, and spending it to *read* before the score has named which passages are load-bearing
would violate the §6 discipline ("load-bearing primary only"). So the reading — the Expose
movement (§5.2), where the primary is given the chance to defeat the "ancestor" premise — is
declared as this ACTIVE project's **next budgeted operation** (a later tick, cascade a), and
0 EUR / 0 extraction was spent here.

**Declined this tick:** the primary reading (deferred as above, not skipped); a make (nothing
to compose from a construct); any characterisation of Mach's argument (unread).

**Budget consumed:** 1 of ≤ 6 ticks; 0 of ≤ 21 days; 0 EUR; 0 full-text extractions.

**Next operation (declared):** read Mach's *Erkenntnis und Irrtum* at the primary — targeted
at whether *Irrtum* is coupled to *Forschung* as a **deliberate method** or as a
**descriptive psychological stage** — plus a bounded provenance check on whether "Irrtum als
Methode" has an attested modern origin independent of Mach. Then form the one typed claim and
set disposition.

## Correction — 2026-07-19 — structural status fix (by a later dispatcher tick)

**Correcting actor:** Ulysses, dispatcher tick 2026-07-19 (the `2026-07-19-null-island`
initiation tick), not the tick that closed this project.

**What was wrong.** The closing amendment (PR #8, "situations face the world", commit
`199807a`) set this project's frontmatter to `status: ARCHIVE_AS_STUDY`. `ARCHIVE_AS_STUDY`
is a valid **disposition**, not a valid **status**: the v4 validator's `ALLOWED_STATUS` is
`{PROPOSED, ACTIVE, PUBLICATION_CANDIDATE, QUARANTINED, CLOSED}`. The canonical closed form —
used by `2026-07-18-name-test` and `2026-07-18-gate-rehearsal` — is `status: CLOSED` with the
outcome carried by `disposition`.

**Evidence it was load-bearing, not cosmetic.** `tools/validate_v4_projects.py` failed on this
record (`invalid status 'ARCHIVE_AS_STUDY'`), so the auto-land gate (rule 5: main's validator
must pass against the branch tree) **refused every `ulysses/*` branch** — recorded in
`atelier-feedback/2026-07-19-autoland-refusals.md` (`ulysses/research-2026-07-19 —
refused_validation`). The bug blocked all ordinary research from landing.

**Revised value:** `status: CLOSED`. **Unchanged:** `disposition: ARCHIVE_AS_STUDY`,
`DECISION.md`, and the project's meaning and outcome. The original value is preserved in git
history (`199807a`). Resulting status of the record: **CLOSED / ARCHIVE_AS_STUDY**, exactly as
Frank's team-direction closure intended — now expressed in a form the validator accepts.

**Scope note.** This is a structural repair in an auto-land-eligible path (`projects/**`),
within the Standing Delegation's "revise ordinary projects" authority; it does not touch the
DECISION, the disposition, protected paths, or the protocol. Surfaced to Frank via the
`null-island` journal note.
