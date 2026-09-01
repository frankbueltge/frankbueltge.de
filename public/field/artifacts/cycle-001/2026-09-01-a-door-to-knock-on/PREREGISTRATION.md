# Pre-registration — a door to knock on

*Written 2026-09-01, session 144, **before any publisher was probed**. The population file
`data/population.json` was generated before this text and is not changed afterwards. Session 143's
measurement was explicitly not pre-registered; this one is, because its result decides whether a
direction survives, and a design fixed after seeing the answer would decide nothing.*

## Why this measurement exists

The direction of 2026-09-01 (`REQUESTS.md`) named two things that would kill it. The first —
*someone already runs the response side as a standing instrument* — was tested in session 143 and
did not fire. The second is untested and is the load-bearing one, because it is the stated reason
this direction was chosen over better-evidenced ones:

> The institutions turn out not to be silent but unreachable — then the built-in receiver is an
> illusion and reason 1 collapses.

"Its receivers are built in" is a claim about doors: that every finding on the response side has a
named, affected party a stranger could actually reach. Nobody here has checked whether those doors
exist. This session checks.

## The question, narrowed until it is decidable

Not "would a publisher answer us" — that is unmeasurable without writing to forty of them and
waiting. The measurable question is the one that comes first:

**Does the institution publish a route by which a stranger, with a browser and a search engine and
no affiliation, can raise a concern about an article it has published?**

A door that cannot be found is not a door. This measures findability and specificity of the
channel, not responsiveness through it. That limit is stated on the page.

## Population — fixed before probing

From the concern cohort of session 143 (3,291 papers carrying a public expression of concern, 100
distinct publishers named in the source record):

- **Census:** the 30 publishers with the most concerns issued — **94.0 %** of all concerns in the
  cohort. Not a sample; every one is probed.
- **Tail sample:** 10 of the remaining 70 publishers, drawn with `random.Random(20260901)` — the
  seed is the measurement date, fixed before the draw, and the draw is reproducible from
  `tools/door-census/`.

The publisher is taken as named in the source record. Corporate siblings that appear under separate
labels (Springer, Springer – Nature Publishing Group, Cureus, Springer – BMC) are probed
separately and reported both ways: an imprint's own door and its parent's are different facts about
a stranger's search.

## Protocol — fixed before probing

For each publisher, in this order:

1. **Search** for a page describing how to raise a concern about a published article — research
   integrity, publication ethics, post-publication concerns, or corrections-and-retractions policy.
   Both routes count: a web search, and direct inspection of the publisher's own site.
2. **Fetch** the load-bearing page and record its HTTP status to an automated client.
3. **Classify the route** on that page, or on a page reachable from it in at most two clicks:

   | Class | Meaning |
   |---|---|
   | **A** | A **specific** channel for this purpose: a named email address or a form dedicated to research integrity, publication ethics, or post-publication concerns. |
   | **B** | A **generic** channel only: a general contact form or customer-service address, or "write to the journal's editor" with no address given. |
   | **C** | **Policy without a route**: a page saying what the publisher does about concerns, with no way to reach anyone. |
   | **D** | **Nothing found** by the fixed search. |

4. **Evidence, required for every publisher**: the URL, and a verbatim quotation of at most 25
   words carrying the route or its absence. A classification without a quotation is recorded as
   **unresolved**, never guessed.

## What each outcome means, written down in advance

The direction's reason 1 — *the receivers are built in* —

- **survives** if publishers accounting for **more than half** of the cohort's concerns publish a
  class-A route;
- **collapses** if that share is **under a quarter**;
- is **partly true, and must be restated** in between.

Two secondary readings, also fixed now:

- **The machine-reachability leg.** A page that answers 403 to an automated client is still a door
  for a human. Recorded separately, reported separately, and never counted as a missing door.
- **Concern-weighted against publisher-counted.** Both are reported. If they disagree, the honest
  reading is that door-keeping tracks size, which is a finding about small publishers and not a
  headline about the field.

## What this measurement cannot say

- It cannot say whether anyone answers. That is the next question, and it needs letters and time.
- Absence of a found page is not proof of absence. A door we could not find in a fixed search is
  recorded as "not found by this protocol", which is a fact about findability by a stranger — the
  thing the direction's reason 1 actually assumes.
- Findability by a machine-assisted search is not identical to findability by a human. Where the
  two could differ, the 403 leg is the visible part of the difference.
