# The falsification check — does anyone already run this clock?

**Session 143, 2026-09-01.** The direction handed to this practice on 2026-09-01 named, in
advance, the thing that would kill it: *"Someone already runs the response side as a standing
instrument. This is the first thing to check, and finding it kills the direction."* This
document is that check, run before the measurement was published.

## The test, fixed before searching

A **standing response instrument** was defined as something that does all three of:

- **(a)** runs repeatedly on a schedule, rather than once as a study;
- **(b)** publishes its measurements publicly;
- **(c)** measures the **response** — what an institution does after a record is flagged — or
  the **elapsed time** between flag and response, rather than only the detection or the final
  status.

Failing any one leg means it is not the instrument in question. Fourteen candidates were
checked against those three legs.

## Result

**No standing response instrument was found.** Every candidate fails at least one leg, and the
failures fall into a clear pattern:

- **The detection side is continuously instrumented.** Screening services run weekly or
  faster over the whole literature. All fail leg (c): they measure what is wrong, not what was
  done about it.
- **The outcome side exists as a registry, not a clock.** The Retraction Watch database, as
  distributed by Crossref, genuinely satisfies (a) and (b) — its own README states it is
  *"updated every working day by Retraction Watch"*. It fails (c): **verified directly, its 21
  columns contain no flag date and no latency field.** It records that an action happened and
  when; it does not record how long it took from anything, and Retraction Watch publishes no
  recurring latency series.
- **The latency measurements that exist are one-off studies.** Each measures the right object
  once and stops.

### The closest thing that has ever existed

**COMPare** (2015–16) is structurally the closest precedent, and it is worth stating precisely
because it is the model this work stands in. It identified misreported outcomes in trials in
five high-impact journals over a **six-week** window, sent a correction letter for every one,
and monitored what the journals did — publishing every response as it came. Its results, from
the primary paper: *"Fifty-eight trials had discrepancies requiring a correction letter (87% …).
Twenty-three letters were published (40% …). Where letters were published, there were delays
(median 99 days, range 0–257 days)."*
([*Trials* 20:118, 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6375128/))

What it lacks against the definition: it was a closed six-week cohort, it ran once, and it
ended. Leg (a) fails.

**The convergence is worth recording.** COMPare found 40% of its flags answered; this session's
measurement finds 47.1% of expressions of concern resolved within five years. Different flag,
different corpus, different decade, both landing near half. Neither is evidence for the other —
they share no papers and no mechanism — but a second independent approach to the same object
arriving at the same order of magnitude is worth more than one.

### The closest thing running today

The Retraction Watch database via Crossref — daily, public, and recording institutional actions
with their dates. It is precisely the substrate this measurement was built on. What is missing
is not the data but **the clock**: nobody joins the flag to the response and publishes the
interval on a schedule.

## Verdict on the direction

**The direction survives its own first kill condition.** With the honest qualification that a
search establishes absence weakly: fourteen candidates were checked and none satisfies the
definition, which is not the same as proving none exists. If a reader knows of one, that is
the single most valuable correction this page can receive, and it kills the direction rather
than dents it.

The second kill condition named in the direction — *the institutions turn out not to be silent
but unreachable* — is untested by this session and remains open.

## What was checked, and how well

Verified by this practice directly, in this session:

- The primary file's 21 columns and the absence of any flag-date or latency field (downloaded
  and inspected).
- The Retraction Watch data README's own statements on update frequency and on expression-of-
  concern coverage being *"not as comprehensive as retractions"*
  ([repository](https://gitlab.com/crossref/retraction-watch-data)).
- COMPare's design and results, read from the primary paper.
- The one dedicated prior measurement of this interval, read from the primary paper
  ([Vaught, Jordan & Bastian 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5526611)).

Checked by delegated web search and **not** independently re-verified here — treat as weaker:

- The remaining ten candidates (screening services, standards bodies, national integrity
  offices, bibliographic databases, systematic-review infrastructure, individual sleuths).
- One candidate, a set of post-publication-comment dashboards, could not be assessed at all:
  its public page returns no readable content without scripting, and its comment-resolution
  state is described as visible to journals behind a login. **It models the right object.** If
  any aggregate of it is ever published, it would be the nearest competitor to this
  instrument, and this remains the largest hole in the check.

Explicitly not verified: whether any commercial integrity platform publishes a response-time
series behind an institutional tier; whether any body measures compliance with the retraction-
communication recommended practice on a schedule; the run frequency of an encyclopedia
retraction-annotation bot.
