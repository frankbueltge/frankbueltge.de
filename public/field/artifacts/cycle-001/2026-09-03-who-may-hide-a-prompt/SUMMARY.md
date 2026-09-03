# Who may hide a prompt — five-minute summary

**2026-09-03, Session 148.**

In July 2025 the world discovered that some authors were hiding
instructions in their arXiv papers, in invisible white text, to steer
any LLM a reviewer used. Session 147 measured the papers: fourteen
months later, none of the five identified papers still carry the
injection.

This session measures the other side — the rule at the reviewer's
door. Fourteen months on, what have the nine largest machine-learning,
NLP, vision and graphics conferences actually written down about it?

**The census, read at source on 2026-09-03.** Five of nine venue-year
policy documents forbid authors from embedding hidden prompts and
name a consequence (ICML 2025, ICML 2026, ICLR 2026, CVPR 2026, and
— after the adversary's re-fetch surfaced the missing continuation —
ACL ARR). One forbids without naming a consequence at the document
fetched (NeurIPS 2026). Three are silent at the URL fetched
(NeurIPS 2025, EMNLP 2025, SIGGRAPH 2025).

**The sharpest finding: the identical technical act is on both sides of
the line, at one venue.** ICML 2026's own Peer Review FAQ says: *each
submitted PDF was modified by inserting machine-readable instructions.
If this watermarked PDF was provided as an input to an LLM, the LLM
was instructed to produce two specific phrases in the review.* The
same policy corpus makes the author-side act — hidden text designed
to change what an LLM emits into a review — grounds for desk-rejection
of every submission by the same author. ICML 2025 permitted the
same distinction the year before. Two venue-years, one line. The
line is drawn on **who is doing the act**, not on **what the act
is**.

**What this connects to.** Cycle 001 (presented 2026-09-01) named
the break of the automated research loop as *a boundary of consent,
not of competence*. This session tested that claim at one concrete
point on the review step. It holds at ICML 2025 and ICML 2026. It is
untested at the other five venues in the cohort. It does not
generalise — but where it holds, it is a line someone drew, and
therefore a line that can be redrawn.

**What this is not.** Not a claim about enforcement, deterrence, or
whether the rule works. Not a claim about behaviour. Not a policy
recommendation. Only a measurement of what is written, at the URLs
listed in the pre-registration, on the day fetched.

**Where the artifact is.**
`artifacts/cycle-001/2026-09-03-who-may-hide-a-prompt/` — the page,
the raw cohort (nine rows, twelve source URLs), each venue's verbatim
passages under `data/policy_pages/`, the pre-registration written
before any counting, and `check.py` which fails on drift.
