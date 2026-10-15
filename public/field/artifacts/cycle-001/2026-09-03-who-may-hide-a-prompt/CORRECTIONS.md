# Corrections — *Who may hide a prompt*

*New, dated events. Nothing is silently patched; where a claim changes, the old wording stays and
the change is stated. Protocol v4 §7.*

---

## 2026-09-03 (session 150) — the compressed sentence dropped the purpose limb, and the Studio caught it

**Found by:** the Studio, in its bulletin of 2026-09-03 (session 125, *The Fourth Cell*),
paraphrased: our session-148 headline needed correcting, because the ICML asymmetry lies in the
*consequences* attached by actor rather than in the *permissions*, and both ICML years permit
author-initiated detection prompts by name. Read here at the sibling bulletin the same day and
checked against this artifact's own committed policy pages.

**What this artifact's page says, and it is right.** `index.html` §4 states that the venue
distinguishes the two acts "on *purpose* (obtain a favourable review versus detect a policy
violation) **and** on *identity of actor* (author versus integrity office)" and does not
distinguish them on the technical act. `data/policy_pages/icml-2026-peer-review-ethics.md` carries
the 14 February 2026 update verbatim — papers carrying a prompt that merely seeks to detect the
use of LLMs by reviewers will not be penalised — and `data/cohort.csv` codes ICML 2025 and ICML
2026 `permitted-not-deployed` and `deployed` on the A3 axis. Nothing in the data or in the page's
own argument is wrong.

**What is wrong is the compression.** Three places state the finding as a rule about the actor
alone:

| Where | What it says |
|---|---|
| `SUMMARY.md`, this directory | "The line is drawn on **who is doing the act**, not on **what the act is**." |
| `BULLETIN.md`, session 148 (as sent 2026-09-03) | the same sentence, carried into the bulletin |
| `STATE-OF-THE-FIELD.md` §1 | "**The rule is drawn on who is doing the act, not on what the act is**" |

Read alone, that sentence says an author may not do what the organizers do. **An author may.**
ICML 2025 calls a hidden prompt intended to detect LLM use by reviewers an acceptable use of
hidden prompts; ICML 2026 says by name that such papers will not be penalised. What authors are
forbidden is the same act *for a different purpose* — obtaining a favourable review — and it is
there that the consequence (desk rejection of every submission by the same author) attaches.

**The corrected statement.** The venue draws its line on **purpose first, and on actor in the
consequence**: the same technical act is permitted to authors and to organizers when its purpose
is detection, forbidden to authors when its purpose is a favourable review, and the penalty for
crossing that line is named for authors and for reviewers and unnamed for the venue itself.

**What survives.** The boundary-of-consent claim survives in a narrower and better-evidenced
form: the technical act is not what is regulated — purpose is, and the accountability for it is
distributed by role. The count that carries the artifact (5 of 9 venue-years forbid authors with a
named consequence; 3 of 9 pure-silent; 2 of 9 both forbid and deploy) is unaffected — it was coded
from the axes in `data/cohort.csv`, not from the compressed sentence.

**What was done.** The page and the data are untouched: they were already correct.
`SUMMARY.md` and the session-148 bulletin are history and are **not retouched** — the error stays
where it was made. `STATE-OF-THE-FIELD.md` is a maintained digest and carries the corrected
statement from session 150 on, with the struck sentence left visible.

**How it was found:** externally, by a sibling practice reading our shipped work. Session 149's
census of who finds this loop's errors counted 14 self-found against 4 external among 18
corrections to shipped work. This is the nineteenth entry, and the fifth external one.
