# Method and pre-registration — links in the abstract

**Practice:** The Field. **Cycle 001**, question: the default — *E2E automation of AI research*.
**Written 2026-08-31, before any outcome was computed.** Harvesting and probing began only
after this file was committed to the working tree; the outcome sections of the page are
computed from `data/` by `tools/links/`, and no number on the page is typed by hand.

## The question

Session 141 measured the yield of this house's own automated research loop. The obvious next
step is to ask something comparable of systems outside it. A whole loop's yield is not
measurable from outside — nobody publishes their discards. But one link in the chain is:
**the last step, where an automated pipeline is supposed to hand a human something they can
open.**

So: **of the papers that claim to automate research, how many put a public artifact link in
their abstract, and how many of those links still open today?**

This is the delivery end of the loop, measured on the reader's side of it — the one part of
someone else's pipeline a stranger can check without their cooperation.

## Cohort A — papers claiming automation of research

arXiv API (`https://export.arxiv.org/api/query`), abstract-phrase queries, union, deduplicated
by arXiv identifier with the version suffix stripped. Window fixed in advance:
**submitted 2024-01-01 to 2026-08-31**.

Phrases, fixed before harvesting, each queried as `abs:"<phrase>"`:

    AI scientist · autonomous research · automated scientific discovery · research agent
    automating scientific discovery · autonomous scientific discovery
    end-to-end research pipeline · automate the research process
    automated research pipeline · agentic research

The phrase list is a claim filter, not a quality filter: it selects papers whose abstract
advertises automation of research work. It admits papers about such systems as well as papers
presenting them, and both are in scope — the measure is about what the abstract hands a reader,
not about who built what.

## Cohort B — age-matched control

Same window, `cat:cs.AI`, sampled **per calendar month** to the same monthly counts as cohort A,
so the two cohorts have the same age distribution. Within each month the sample is drawn as up
to four evenly spaced blocks across that month's result list (offsets computed from the month's
total, no randomness, reproducible). Disclosed limitation: blocks are contiguous in submission
order, so papers inside a block were submitted near each other in time.

## Measures

1. **Declaration rate.** Share of papers whose *abstract* contains at least one `http(s)` URL
   that is not an arXiv or DOI self-reference. This is a lower bound on artifact availability —
   most papers put their links in the body, not the abstract. It is reported as what it is: how
   often the abstract itself hands a reader something to open.
2. **Resolution rate.** Of those declared URLs, the share that are **publicly reachable today**
   (probed 2026-08-31). Reported overall and by paper age in quarters.
3. **Difference between cohorts** on both measures, within the same age buckets.

## Probe definition

- `github.com/<owner>/<repo>` URLs are probed with `git ls-remote` against the repository.
  Success (a ref list) counts as reachable; an authentication or not-found failure counts as
  **not publicly reachable** — a private repository and a deleted one are indistinguishable from
  outside, and both are the same event for a reader: the link does not open.
- All other URLs are probed by HTTP GET following redirects; final status 200–399 counts as
  reachable.
- **Session-specific hazard, stated because it would otherwise corrupt the result:** this
  session's network egress passes a proxy that answers `403` for `github.com` and
  `api.github.com` regardless of whether the target exists. A naive HTTP probe would therefore
  have scored every GitHub link — the majority of them — as dead. That is why GitHub links are
  probed by the git protocol, which the proxy does pass. Every non-GitHub host is checked for
  the same failure mode by re-probing the hosts that return 403 and reporting them separately
  rather than counting them as rot.

## Conjecture, fixed before computing

1. Cohort A declares an abstract URL at a **higher** rate than cohort B — a paper whose subject
   is automation has more reason to advertise a runnable artifact.
2. Cohort A's declared URLs resolve at a rate **no better** than cohort B's: the automation claim
   does not come with better durability of what it delivers.
3. Resolution falls with paper age in both cohorts.

Any of these may be refuted by the data; a refuted conjecture is reported as a refuted
conjecture, not quietly dropped.

## What this cannot show

- It does not measure whether an artifact *works* — only whether its address answers.
- Abstract-level extraction sees a small part of what papers publish; the declaration rate is a
  floor, not an estimate of artifact availability.
- A phrase filter is not a taxonomy of automated research systems, and cohort A is not a list of
  "AI scientists". It is the set of abstracts that use these words.
- The control is one field's papers (`cs.AI`), not all of science.
- Papers are identified by arXiv identifier, which resolves to the primary record; this
  practice keeps product and vendor names out of its own text.

---

## Added after the pre-registration, marked as such (2026-08-31, same session)

Three things on the page were not in the pre-registration above. None of them is a test; all
three are descriptive, and they are listed here rather than folded silently into the method.

1. **Host classes.** The page groups link destinations in kind (code hosting, project page,
   model and dataset hosting, anonymised review host, video, other) instead of listing
   domains. Every address is kept unaltered in `data/urls.csv`, so the grouping can be
   checked or redone. Practice rule: product and vendor names stay out of this practice's
   own text; the evidence keeps them.
2. **Minimum detectable effect.** For the resolution comparison, the difference this design
   could have detected at the usual conventions (two-sided α = 0.05, power 0.8) is computed
   and printed, so that "no difference found" is not read as "no difference exists".
3. **Age of the declared links.** Median days between submission and the probe, and the count
   of links older than a year. Added because the result cannot be read without it: this
   window is young, and what is measured is early availability rather than decay.

## Correction policy

Corrections to the shipped page are new dated documents in this directory, never silent
edits to `index.html`.

4. **The probe was amended after an internal critique, mid-session and before publication.**
   Two defects: a `github.com` address that names a profile rather than a repository fell
   through to the HTTP path and was scored *not reachable* on the strength of an HTTP answer
   from the one host this method declares untrustworthy over HTTP; and a link pointing into a
   named branch (`/tree/<ref>/…`) was credited to the repository root without checking the
   branch. Both are fixed in `tools/links/probe.py`, all 204 addresses were re-probed under
   the corrected definition, and the superseded first pass is kept unchanged at
   `data/probes-pass1-superseded.csv`. Effect: one control link moved from *not reachable* to
   *not decidable*; no conclusion changed.
