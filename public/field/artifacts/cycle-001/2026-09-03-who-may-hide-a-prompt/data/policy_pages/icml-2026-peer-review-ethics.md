# ICML 2026 — Peer Review Ethics

- **URL:** https://icml.cc/Conferences/2026/PeerReviewEthics
- **Fetched at source:** 2026-09-03 (second pass, direct sentence queries)
- **Version note visible on page:** "(Update 2/14/2026)" precedes the
  detection-prompt exception clause below.

## Verbatim passages, at source

> Any attempts at prompt injection are forbidden. Prompt injection
> refers to insertion of specially crafted text into the paper, with
> the intention to manipulate LLMs, for instance, to obtain a
> favorable review.

> (Update 2/14/2026): While prompt injection by authors is
> disallowed, we will not penalize papers with prompts that merely
> seek to detect the use of LLMs by reviewers.

> Prompt injection (regardless whether all authors knew about it).

The last line appears as a **bulleted list item under a
desk-rejection heading**: grounds on which all submissions by the
same author are desk-rejected. The following bulleted list item on
the page is "Violation of the concurrent submission policy, that is,
not citing and appropriately discussing concurrent ICML submissions
on a related topic with an overlapping set of authors."

> Reviewers must follow the Policy for LLM use in reviewing.

## Passages by axis

- **A1:** author-side prompt injection "forbidden"; consequence is
  desk-rejection of **all submissions by the same author** —
  "regardless whether all authors knew about it."
  **`explicit-forbidden-with-consequence`**.
- **A2:** delegated to `Policy for LLM use in reviewing` (separate
  file, `icml-2026-llm-policy.md`); coded there.
- **A3:** the 2/14/2026 update explicitly permits by name papers
  carrying a prompt "that merely seek to detect the use of LLMs by
  reviewers." **`permitted-not-deployed` at this URL**. Deployed at
  the Peer Review FAQ URL (separate file, `icml-2026-peer-review-faq.md`).
- **A4:** consequence is on the author group (all of the same author's
  submissions); reviewer-side accountability on the LLM Policy page.

## Provenance note

Passages transcribed from the second-pass WebFetch of the source URL
on 2026-09-03 with sentence-level queries; the un-bracketed core of
each statement is now verbatim. The bracketed reconstructions in the
first-pass draft of this file are superseded.

## Correction, dated

The first-pass draft of this file marked two continuations as
"[bracketed continuation reconstructed] — will re-verify at source."
The second-pass fetch on 2026-09-03 returns the full un-bracketed
text and this file now carries it. The reconstructions are removed
from the record above; the fact that they existed in the first pass
is filed here.
