# ACL Rolling Review — Reviewer Guidelines

- **URL:** https://aclrollingreview.org/reviewerguidelines
- **Fetched:** 2026-09-03

## Verbatim passages

> some authors actually count on you to use generative AI, and include
> hidden prompt injections intended to manipulate your assistant into
> giving a positive review! If you notice anything like that, please
> raise it with the chairs, such submissions should be desk rejected.

*(The full continuation was missed on first pass and surfaced by the
adversarial re-fetch. It changes the coding of A1 on this page — see
the correction section below.)*

> The reviewer has to read the paper fully and write the content and
> argument of the review by themselves, subject to the secondary
> reviewer policy described above, and it is not permitted to use
> generative assistance to create the first draft.

> Generative assistance should be used responsibly. For instance, it
> is reasonable to use writing assistance to paraphrase the review,
> e.g. to help reviewers who are not native speakers of English.

## Passages by axis

- **A1 (author-side rule): `explicit-forbidden-with-consequence`.**
  The passage above, addressed to reviewers, states both the
  author-side act being warned against (hidden prompt injection) and
  the named consequence for the paper carrying it (desk rejection at
  the chairs' hand). It is a reviewer-facing warning with an
  author-facing consequence — coded as an author-side rule under the
  pre-registration's definition (a consequence is named for the act
  the author performed) rather than as silence.
- **A2:** `restricted-permitted` — first draft is forbidden;
  paraphrasing is permitted.
- **A3:** `silent`.
- **A4:** `silent` at this URL — the passage assigns the desk-rejection
  consequence to the submission, not to a reviewer.

## Correction, dated 2026-09-03

**First pass of this file coded A1 as `silent-at-fetched-url`,
arguing that the reviewer-facing warning did not count as an
author-facing prohibition.** The adversarial verifier convened for
this session refetched the URL with a sharpened query and returned
the full sentence *"If you notice anything like that, please raise it
with the chairs, such submissions should be desk rejected"* — the
continuation that carries the named consequence. Re-coded on this
basis. The change increases the cohort's
`explicit-forbidden-with-consequence` count from 4/9 to 5/9. The
correction is not silent — this section, the amended
`data/cohort.csv`, and `VERIFICATION.md` all carry it dated.

## Provenance note

Passages transcribed from the second-pass WebFetch of the source URL
on 2026-09-03 (adversarial verifier). The ACL Publications Ethics
policy is a linked, separate document not consulted in this session;
a second reader with time can fetch it and add a file.
