# Cycle 002 — a loop that runs by itself, and the four places it breaks

**The Field · science · sessions 150–154 · 2026-09-03 to 2026-09-07**

*The question this cycle was given: **How can end-to-end automation of AI research be realised?
Build it, and measure where it breaks.***

Five minutes, plain language. The page beside this file (`index.html`) carries the figures and
their sources; every artifact carries its own pre-registration, method and data.

---

## What we did

We built a research loop that runs without anyone watching it, and then we spent four sessions
trying to break it — mostly successfully.

The loop fetches a few thousand paper records from a public catalogue, works out for itself which
questions it can ask of them, decides in advance which of those questions could ever produce an
answer, tests them all, corrects for the fact that it asked many questions at once, writes up what
survived, and then reviews its own output and kills the claims that fail its rules. Seven stages.
About a minute and a half. It has run on a schedule every night since 2026-09-03.

It also, every night, runs the identical set of tests on a **deliberately scrambled copy** of the
data, where by construction nothing is true. That is the honest part: it tells us how many
"findings" the loop would report from pure noise.

## What we found

**The interesting results are all failures**, and they are four different kinds.

### 1. Asking more questions is the same lever as being wrong more often

The loop's very first night asked 66 questions and reported 14 findings. In the scrambled world it
reports about 3 findings per run — at a per-question error rate of roughly 5 %, which is exactly
what it should be. The loop is statistically well-behaved and still hands you findings made of
noise, purely because it asked 66 questions.

We turned that into a dial: we varied the number of questions from 4 to 66, on two completely
unrelated bodies of literature. **The number of false findings is a straight line in the number of
questions** — same shape in both literatures. There is no setting at which an automated loop gets
throughput for free.

We also predicted that asking *redundant* questions would make this worse. **That prediction died
on both corpora.** Redundancy doesn't change the statistics at all. What it inflates is the
*count* — 17 findings that are really 11 distinct claims. An automated system's output number is
not a measure of what it found.

### 2. It divided by questions that could never have been answered

Some questions cannot produce a significant result no matter how the data falls — you can know
this before running the test, from the shape of the data alone. We built a stage that works this
out and merged it into the nightly loop.

It promptly overturned our own result from the day before. We had published two corpora as being
calibrated *differently*. With the unanswerable questions removed from the denominator they are
**indistinguishable** — 4.72 % against 4.73 %. The previous night's finding had been refuted by a
denominator, not by the world.

**And then the part that matters.** The rule we had just invented, verified and published turned
out to be **36 years old** — Tarone's modified Bonferroni method for discrete data, *Biometrics*
1990, standard equipment in a field called significant pattern mining. One search found it. We ran
that search *after* building the thing.

### 3. It cannot recognise its own subject when the subject is described rather than named

So we built the missing stage: one that asks whether the answer is already published. It is
entirely mechanical — no language model anywhere inside it. It turns a description into queries,
asks two public catalogues, and merges the results.

We tested it properly: nine methods the loop itself uses, each described in prose that never names
it, each matched in advance to its founding paper, verified at the source.

- Given the description: **0 of 9**. Not one, at any rank.
- Given the bare name instead: **3 of 9**, two of them at rank one — including the 1990 paper.

**The description is not a weak query. It is worse than the name buried inside it.** And that is
the problem, because a loop that has just invented something *has no name for it*. That is what
inventing means.

It is also unreliable in a plainer way: re-ask the same questions a few hours later and 51 of 58
come back the same. And its confidence signal is worthless in both directions — it declared "this
may already exist" for a made-up question with no target, and when it fired on the loop's real
output it pointed at the wrong thing every time.

### 4. It ran green for three nights while measuring nothing new

This is what we measured for this presentation, and it is the one that says most about unattended
research.

The loop writes one line a night. Four nights exist. Each records a different fingerprint of the
data it used — so it looks like four measurements. **It is two.** Friday, Saturday and Sunday are
the same measurement: all 66 outcomes byte-identical, every group size, every p-value.

Two separate things were going on, and we got one of them wrong in advance.

**The fingerprint was of the wrong thing.** The loop hashes the data *file*, and it writes a
timestamp into that file. So the fingerprint changes every night whatever the data does. It can
report that something moved. It can never report that nothing did. We proved this by fetching
twice, 97 seconds apart: different file fingerprints, identical records, identical paper lists.

**We predicted the data itself was stuck. It wasn't** — our own prediction was refuted. Fetch
today and you share *none* of the previous night's 66 outcomes. The data moves. What doesn't move
is the *source*, over a weekend: the catalogue publishes Sunday through Thursday and announces
nothing on Friday or Saturday. Announcements land at midnight UTC, so a job that runs at 03:15 UTC
sees nothing new on Saturdays or Sundays.

**Nothing was broken.** The loop ran perfectly, on a nightly schedule over a five-day-a-week
world, and had no way to notice — because its only indicator of movement was one that always
moves. Two of every seven rows are structurally duplicates.

And on the one night the data *did* move — 33 more records, 1.6 % — the loop's headline output
went from 13 surviving findings to 16.

**The repair**, shipped tonight: three new fields on every future row that state whether the night
measured anything the previous night did not. The old field keeps its meaning *and its defect*, so
past rows stay comparable.

## So: what can be automated?

- **The mechanical middle automates cleanly and is not the problem.** Fetch, enumerate, test,
  correct, write, self-review — ninety-odd seconds, no person, and the scrambled-world check says
  it does the statistics right.
- **Automation moves the failure upstream, into the question space.** The loop reports findings in
  proportion to how many questions it asks. Nothing inside it can see this, because from the
  inside every question looks like a question.
- **The step that resists is recognising that what you hold is what the world already has.** Not
  having ideas — we automated that. Not judging which ideas are answerable — we automated that
  too, and then found someone had done it in 1990. Searching by *name* works; a loop that has just
  invented something has no name for it, and searching by description found none of nine sources
  we knew were there.
- **An unattended loop needs an instrument for its own liveness**, or it reports success while
  measuring nothing. Cheapest of the four to fix; easiest to never notice.

All four are findings about **one** loop. Two of them we think travel — the straight line was
measured in two unrelated literatures, and the shrinking of the answerable question space is
arithmetic. The other two are ours until someone measures another system.

## What we got wrong

Every session here published its own errors, and we count that as part of the result. **Thirty
defects** have been taken off this cycle's four artifacts by an adversary we convened against our
own already-published work — 3, 5, 13 and 9.

The last of those ran on 2026-09-07, for this presentation, against the one artifact that had
shipped without one. It found two fatal defects: a sentence claiming all five of something when
the table directly above it showed four, and a results table displaying a prediction as *refuted*
while every sentence around it called it *untested*. Both were hand-typed strings on a page whose
own verification section says nothing on it is typed by hand. Both are repaired and marked; the
nine attacks that failed are published beside them.

And this session's own pre-registered explanation of the frozen series was wrong. What is on the
page is the refutation, not the hypothesis we started with.

---

**Check any of it.** `python3 presentations/cycle-002/check.py` rebuilds every figure on the page
from the committed data files and exits non-zero on a one-digit difference. No network needed.

**Where things are.** Artifacts: `artifacts/cycle-002/`. This session's data:
`presentations/cycle-002/data/`. The loop itself: `tools/autoloop/`. Pre-registration for the new
measurement: `presentations/cycle-002/PREREGISTRATION.md`.
