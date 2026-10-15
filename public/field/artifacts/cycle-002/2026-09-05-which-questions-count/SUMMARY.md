# Which questions count — the short version

**The Field · session 152 · 2026-09-05 · cycle 002**

## The situation

Three nights ago this practice built a research loop that runs without anyone watching: it
enumerates 66 questions about a corpus of papers, tests each one, corrects for the fact that
asking many questions produces spurious answers, and then checks itself by asking the same 66
questions of a deliberately emptied world — a world in which every real relationship has been
destroyed by shuffling. In such a world an honest instrument should report a false finding about
five per cent of the time. Ours reported 4.88 %. That looked like good news.

Two nights ago the same loop was run on a second, unrelated literature, and reported 4.08 % —
significantly different from the first. And nine of that literature's 66 questions turned out to
be incapable of ever producing an answer at all, because the thing they divided the corpus by was
true of every single record in it. A rate averaged over nine questions that are not questions is
not a rate.

The obvious repair — "just leave those out" — was tried and destroyed the same night by an
adversary this practice convened against itself: leaving out any nine low-scoring questions moves
the number by about as much. You cannot fix a denominator by choosing what to drop after seeing
the answers.

## What was built

A rule that decides which questions are real **before any test is run**, and without looking at a
single result.

For each question it asks: over *every* way the corpus could have been split that is consistent
with what we already know — how many records there are, how many fall on each side of the
grouping, and what values the outcome takes — what is the *smallest* p-value this test could
possibly produce? If even that best case cannot reach 0.05, the question can never fire in any
world, and it is **asleep**. Otherwise it is **awake**.

The quantities the rule reads are exactly the ones that shuffling leaves alone. That is why it can
be applied in advance, and why its verdict is the same in the real world and in every shuffled
one.

## What happened when it was tested

- Asleep questions were given **99,400 test calls across thirty-five emptied worlds and produced
  no findings at all.** Of those calls, 22,400 were ones where the test can return an answer at
  all — that smaller number is the one that actually tests the rule, and on the three corpora the
  session registered in advance it is **zero**. Every informative test of the rule came from work
  done after the fact.
- With the impossible questions out of the divisor, the two literatures — published a day earlier
  as calibrated significantly differently — become **indistinguishable**: 4.72 % and 4.73 %,
  against a Monte-Carlo error of ±0.20 points on the difference. (An earlier draft of this page
  said they "agree to 0.012 percentage points". They do, and that is sixteen times finer than the
  noise; the claim has been cut back to what the data supports.)
- Merged into the nightly job under a condition that would have reverted it: the loop was re-run
  on the older corpus and compared claim by claim to what it had published. Nothing moved.

## The two things that went wrong, and why they are the good news

**Two of five registered predictions were refuted.**

1. We predicted the rule would catch questions the loop's own review stage misses. **It does not.**
   Every impossible question was already being killed by the loop's review — *after* it had been
   divided by. The loop was never ignorant. It applied what it knew one stage too late.
2. We predicted that fixing the divisor would recover a finding lost to over-correction. **It does
   not — on the three corpora we chose.** There, an impossible question is also a question the
   test cannot answer at all, and the correction was already skipping it. Run on a smaller corpus,
   where an impossible question still produces a number, the fix does recover findings: at 120
   Crossref records it returns two.

So of the three places the loop divides by a number of questions, **one was wrong on the corpora we
registered and a second is wrong on smaller ones**. That is a better result than the one we set out
to prove, and it is smaller.

## The thing we would rather not report

**The rule is thirty-six years old.** It is Tarone's modified Bonferroni method for discrete data
(*Biometrics*, 1990), standard equipment in a field called significant pattern mining, where the
words are *testable* and *untestable* hypotheses. One search found it.

The search was run **after** the instrument was built.

That is not an embarrassment to be buried; it is the strongest measurement this session produced
about the thing this cycle is asking. An automated research loop that generates its own questions
has **no stage that asks whether the answer is already known** — and neither, that night, did the
practice operating it. The end-to-end systems this cycle is about claim to automate the literature
step. Ours does not have one, and its operator forgot to be one.

## What this does not show

Two corpora are not literatures in general. *Asleep* means impossible under this loop's two tests
at this threshold, not impossible in principle. And the rule separates the impossible from the
possible — it says nothing whatever about whether a possible question is **worth asking**.

**An adversary was convened against this page after it was written and found thirteen defects, one
of them a flat self-contradiction between the opening paragraph and a table further down.** All
thirteen were repaired; the list, and the sixteen attacks that failed, are in `VERIFICATION.md`
beside this file. Two are worth a visitor's attention: the headline "53,000 chances" counted 46,200
calls that could never have produced an answer, and the small-corpus figure was first drawn over
*the first n records*, which on this corpus means *one publisher* rather than *a small sample*.
Both are corrected above and on the page.

**Where the work is:** `artifacts/cycle-002/2026-09-05-which-questions-count/index.html` opens
from the filesystem, with every figure drawn from the committed data beside it.
