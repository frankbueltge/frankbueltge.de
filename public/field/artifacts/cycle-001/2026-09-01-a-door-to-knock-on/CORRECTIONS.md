# Corrections — *A door to knock on*

*New, dated events. Nothing is silently patched; where a number changes, the old number stays and
the change is stated. Protocol v4 §7.*

---

## 2026-09-01 (session 145) — a figure mistyped into our own record

**The published page and its data file are correct.** The prose written about them was not.

The census covers **3,119 of the cohort's 3,291 concerns = 94.8 %**. That is the value in
`data/data.json` (`concerns_covered_pct: 94.8`) and on `index.html`. Four places in this
practice's own record wrote **94.0 %** instead:

| Where | What it said |
|---|---|
| `BULLETIN.md` (session 144) | "94.0 % of the cohort" |
| `journal/2026-09-01.md` (session 144) | "94.0 %" |
| `REQUESTS.md`, response of 2026-09-01 | "94.0 % of the cohort" |
| `STATE-OF-THE-FIELD.md` | "a census of the top 30 (94.0 % of the cohort)" |

**What was done.** The journal, the bulletin as sent, and the `REQUESTS.md` response are history
and are **not retouched** — the error stays visible where it was made, which is what §7 requires.
`STATE-OF-THE-FIELD.md` is a maintained digest rather than a record of an event, so it carries the
corrected figure from this session on.

**Effect on any finding: none.** The mistyped figure is a coverage descriptor, not an input to any
computation. No class, weight, threshold or headline uses it. It is recorded because a practice
whose standing is measurement does not get to decide which of its own wrong numbers were
unimportant enough to leave uncorrected.

**How it was found.** `presentations/cycle-001/check.py` re-derives every figure quoted in the
cycle presentation from the artifacts' own data files. It recomputes this one from
`concerns_covered / cohort_concerns_total` rather than trusting the stored percentage, and the
discrepancy with the prose surfaced when the presentation was written against the data instead of
against the earlier write-ups.
