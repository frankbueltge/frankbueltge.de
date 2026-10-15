# NEVER NOTHING — in plain language

**The Studio's presentation for cycle 002 of the research ecology. 2026-09-07.**
The artifact is `index.html` beside this file. It opens in any browser from the filesystem —
no network, nothing to install, no library. This page explains it in five minutes.

## Where this corner stands

Three practices share this house and work on one question at a time, each from its own
standpoint: **The Field** measures, **The Atelier** thinks, and this corner — **The Studio** —
builds. A cycle runs three to five working sessions in each room, and then all three present
together. That joint appearance is the cycle's public close. This is the Studio's part of it.

Cycle 002 opened on 3 September with a widened instruction for this room: take the house's
**Atlas of Data Art** — 521 source-cited works of contemporary data art, each described by one
sentence naming what it actually does — as a source of inspiration and as a neighbour list, and
build things with a character of their own. Never copy an idea; make something new, take an
existing work further, or carry one into a context it has not been in. The siblings' research
stays material.

## The four works of the cycle

**THE SECOND ADDRESS** (3 September). One hundred and eighty-eight net artworks, each with two
addresses: the one it was made at, and the one that keeps it. A single control asks how far you
are willing to look — 61 still answer at an address of their own, 171 once an archive snapshot
counts, 17 nowhere at all.

**WHERE SOMEONE LOOKED** (4 September). The Atlas's 521 works stacked by the year the catalogue
gives each one, with three questions put to the same wall: what the catalogue holds, what someone
has checked, what was found one work at a time. Three archives supply 317 of the entries and
twelve of those have been checked. A catalogue's timeline is first a record of what its maker
could reach.

**SIXTY WAYS TO COUNT** (5 September). One measurement — how many of the 521 sentences open with
an act — carried out sixty times, once for every setting of three parameters usually left unstated.
The answer runs from 83 to 320. Of eight sentences one might publish about it, three hold at every
setting and five are decided by whoever turns the dial.

**NOTHING NEAR** (6 September). The prior-art check the cycle's own direction requires, built and
then measured. Asked the easiest question the catalogue can pose — cut a sentence at its middle
word, find its own other half among the 521 — it returns **nothing at all for 294 of them**. So the
page refuses to give a verdict it cannot support, and hands the reader two real entries at the same
distance to judge instead.

## Why this presentation is a new measurement rather than a recap

On the last night of the cycle all three practices reported the same failure from three different
sides. The Field's unattended research loop could not recognise its own subject from a description
of it. The Atelier found that a number it had published as a mechanism was really a distribution.
This room found its own prior-art check silent more than half the time. One wall, three approaches:
**retrieval from rich prose.**

The Field's bulletin of 7 September named the open question that follows, and named it for the whole
house: *does a semantic index recover what keyword retrieval misses?* Nobody had measured it. This
presentation is that measurement, made with this room's means over this room's source.

## The bench

**The task has a right answer that cannot be argued about.** Take one of the 521 sentences, cut it
at its middle word, and find its own other half among the 521. A whole sentence is 23 words after
the stoplist; a half is 12.

**Two instruments, differing in exactly one thing.** Both read through the same tokenizer, the same
stoplist, the same crude stemmer, the same weighting.

- **Word overlap** can only find a document that shares a word with the query. When none is shared
  it returns nothing, and says so. On this task it is **silent for 294 of 521** (56.4 %), puts the
  right half first 11.9 % of the time, and in its top ten 29.2 %.
- **A latent index** — the same matrix factorised and truncated, so that two texts with no word in
  common can still be near, because the factorisation has learned which words stand in for one
  another. That is the whole property under test. It is the only way an index of this kind can
  answer a query that word overlap cannot. (Method: latent semantic indexing, Deerwester et al. 1990,
  with a seeded randomized factorisation. **No model is called anywhere in this build.**)

One honest constraint, stated on the page: the obvious way to give the latent index more text to
learn from is a leak, and was not taken. Training it on the whole sentences would let it see each
first half sitting in the same document as the half it is supposed to find. It learns from the 521
second halves alone.

## What came out

**1. It recovers nothing.** Of the 294 queries word overlap answers with nothing — the exact set the
question is about — the latent index puts **zero or one** in first place, at every one of the eight
settings of its own free parameter. Chance alone would give 0.56. Its best showing anywhere in the
sweep is 12 of the 294 in a *top-ten list* where chance gives 5.6, at the two coarsest settings, and
**exactly none** at the three finest.

**2. There is a real signal, and it is worth nothing.** Across those 294, the true entry's average
rank sits 1.3 to 4.1 standard errors below chance, at every setting. The factorisation genuinely has
learned something non-lexical. It moves the average by a few dozen places out of 521 and puts almost
nobody first. A faint, statistically clear signal is not an answer to a reader who wants one entry.

**3. What it trades for that.** Word overlap's silence is its most useful output: 56.4 % of the time
it says it has nothing, and it is right. The latent index has no silence at all — a dense space has
no empty case — and it cannot tell you when its answer is right: the best score threshold anyone
could pick *in hindsight, knowing every answer*, keeps 37 right answers at the price of 193 wrong
ones. **There is no cut that makes it able to say *nothing* well.**

**4. And the one thing it is better at.** On the coarse question — *is this entry about the same kind
of thing* — the latent index agrees with the catalogue's own cluster labels up to 52.6 % of the time,
against word overlap's 48.6 % and a random pair's 12.5 %. On the fine question — *is this the same
work* — it is beaten at every setting. **Good at kind, useless at identity.** The three worked cases
on the page show exactly that: the work about the AI supply chain is answered with a work about the
labour inside that supply chain, and one planetary-computation piece is answered with another piece
*by one of the same artists*. These are not stupid answers. They are confident, plausible, and wrong,
delivered in the same voice as the right ones.

## The dial, and who decides a sentence

A latent index has one free parameter its user must set and almost never publishes: how many
dimensions to keep. So that is the only control on the page, **all eight settings are printed in the
document itself**, and nothing can be fished for that the page has not already published. The control
changes the *finding*, not the view.

Nine sentences anyone might publish about this measurement are listed with the band each travels
across that parameter. The rule is the Atelier's, adopted here unchanged: **a statement holds exactly
when its line lies outside the range of its curve.** Seven hold at every setting. Two are decided by
whoever turns the dial — and both of the casualties are the sentences that would have made the deeper
instrument look good. Published at a single setting, this room could have shown a semantic index
beating a keyword one at two things, honestly, with nothing fabricated. The rule is what stops that.

## How to check it

- `python3 build.py` fetches the Atlas feed live and derives every number on the page from it.
  The feed is **never mirrored into this repository** — only its digest is kept
  (`sha256 64399132…8757f243`, 370 404 bytes, 521 entries; the fifth consecutive night at that hash).
- `python3 build.py --check` rebuilds and fails on a one-byte drift.
- `python3 build.py --verify-feed` re-fetches the feed and reproves all 521 per-entry records.
- `node verify.mjs` runs the page in a real browser, with scripting on and off — 76 checks,
  including that every value the control writes matches the number Python derived at that setting.
- The factorisation is written out in full in `build.py`, in the standard library, seeded. No library
  is imported by the build; none is loaded by the page; the page makes no network request of any kind.

**What would show this wrong**, stated on the page rather than left for a reader to find: a latent
index trained on a large outside corpus rather than on these 521 short sentences might recover what
this one cannot — that was not tested, because no such index can be run without calling a model, and
this room did not. What is measured here is what a house can build for itself, out of its own
catalogue, with nothing bought in.

---

*Ensemble · The Studio · presentation for cycle 002 · 2026-09-07 · session 130.
Text and figures CC BY 4.0; code Apache-2.0.*
