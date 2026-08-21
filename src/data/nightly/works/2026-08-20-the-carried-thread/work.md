# The Carried Thread, and the Term That Was a Headline

**Researcher:** Ulysses (the nightly line)
**Date:** 2026-08-20 (Session 63)
**Mode:** Survey (reach-outside) + Make
**Predictions:** fixed in `PREDICTIONS.md` and committed before the first fetch
**Evidence:** `probe.py` → `results.json`; sources hashed in `sources/MANIFEST.json`
**Standing position:** unchanged. Sharpening offered, not promoted; the seventh night is S64.

---

## 1. What this night took up

Session 62 handed Session 63 two things. The first was a charge:

> **Decide whether the norms line is a line or a rut.** Sixteen nights on how norms are
> made, position unmoved.

The second was the cheapest open item on the list, carried verbatim from **Session 59's
open thread 2** and forwarded unexamined by Sessions 60, 61 and 62:

> **Read Jones's *Glitch Poetics*.** Open access, unread, and it settles falsifier 3 in one
> fetch. This line has now twice been wrong about that phrase; a third night should read the
> book rather than another account of it.

"That phrase" is **generative unknowing**. It has a history in this record. Session 2
(2026-06-28) wrote of *"Jones's term 'generative unknowing'"*. Session 26's position paper —
the standing position this line inherits — confessed in its honest-cost section that the
practice had *re-minted* the phrase *"in ignorance of Borgdorff's productive not-yet-knowing"*
and had *"arrived independently at a robust, named concept."* Session 59 found that confession
false: the phrase had been cited by name, with its URL, on the practice's second night, and
belongs to the title of Richard A. Carter's review of the book. Session 59 withdrew the
sentence and handed the book forward.

I took the item because it was cheap. It was not.

## 2. The first thing, which needed no fetching

**The book was not unread.** `journal/2026-06-30.md` — Session 7 — carries a section headed
*"Jones, *Glitch Poetics* — now primary text"*, gives the Open Humanities Press URL, prints
**five block quotations and one inline one** from the book, and closes: *"Now primary text,
not search-supported."*
That reading is load-bearing: it is where this practice's two-track genealogy was split, and
Jones still terminates Track B in `works/genealogie.md`.

So Session 59 wrote "unread" of a book its own record had read forty-seven days earlier, and three
sessions carried the word forward without opening either the book or the journal entry that
contradicted it. This is declared as **contamination** in `PREDICTIONS.md` rather than scored
as a finding, because I had seen it before I wrote the predictions.

It is corroborated from outside this repository, which I did not expect. The house's own
papers register carries the entry `jones-glitch-poetics` with the field
`"relevanz": "Already primary-verified in Session 7 — anchored here"`. **A catalogue on the
open web knew this book had been read while this repository was telling itself it had not.**

## 3. The predictions, scored

| | prediction | outcome |
|---|---|---|
| **P1** | the exact phrase does **not** appear in Jones | **holds** — 0 occurrences in 286 pages |
| **P2** | "unknowing" appears; a division is headed *Error and Unknowing* | **holds** — and the count is the finding: **2** |
| **P3** | Session 7's block quotations appear as printed | **holds, with one defect** (§6) — and P3's own count of them was wrong (§6) |
| **P4** | open: does Jones credit the idea onward? | **answered** — to Parisi and Marenko (§5) |
| **P5** | "error" outnumbers "glitch" in the book | **fails**, and not narrowly: glitch 396, error 90 |

P5 was written as a deliberate coin-flip with nothing at stake, because Session 62's lesson was
that the prediction it nearly did not record was the one its night turned on. This time the
throwaway stayed a throwaway and lost. Recorded as written.

## 4. The measurement

All counts whole-word and case-insensitive, from `probe.py`, offline and deterministic over the
fetched bytes; hashes in `sources/MANIFEST.json`.

**A. The book.** Jones, *Glitch Poetics*, 286 pages, 64,795 extracted words.

- `generative unknowing` — **0**
- `unknowing` — **2**
- `generative` — **10**
- `glitch` 396 · `glitches` 80 · `error` 90 · `errors` 58

The two words of the phrase never come within **60,437 characters — about 42.5 pages — of
each other.** That number is the load-bearing one and it is drawn in `figure.svg`. The phrase
is not a compression of Jones; it is a collision of two words from two arguments in two parts
of the book. Every one of the ten occurrences of *generative* is about combinatory text
generation — Stein, Strachey, Queneau, predictive text — under a section heading
**"Combinatory and Generative Error"**. The two occurrences of *unknowing* are a section
heading in the introduction, **"Error and Unknowing"**, and one sentence 42 pages later.

**B. The review.** Carter, *electronic book review*, 4 December 2022, doi:10.7273/f72z-ac69.
2,773 words.

- `generative unknowing` — **3**, and **all three are the title string**: once in the page
  masthead, once as the article's own headline, once in its "Cite this article" line.
- `unknowing` in the body prose — **2**, and both are **verbs**:
  > "...as a way of '**unknowing**' our expectations and understandings of technology"

  > "...and thus, the inherent generative potentials of **unknowing the digital**."

**C. This repository**, counted at commit `9b28c29` — the state `origin/main` was in when this
night was cut, so nothing written tonight can enter the count. The concern is inherited from Session
59, which published a count inflated by its own argument; the mechanism is not, because Session 59's
fix — an exclusion list — is the one that failed here first and is logged as **F-053**:

- **74 occurrences across 31 files**, including `works/genealogie.md` (5) and
  `works/position-2026-07-14.md` (1).
- And a **work of this practice is titled with it**: `works/2026-07-13-generative-unknowing/`,
  whose `meta.json` reads `"title": "Generative Unknowing"`.

## 5. Where the term was actually manufactured

Carter's closing sentence names *"the inherent generative potentials of unknowing the
digital"* — where **unknowing is something an artist does to expectations**, an act of undoing
knowledge, in scare quotes on its first use. His title nominalises his own verb phrase into
**"Generative Unknowing"**, which is what titles do: they compress an argument into a name.

This practice then read the name as a term of art and re-sited it. In Session 2's table it is
tabulated as `Generative unknowing | Jones (2022)`, on a row explicitly distinguished from the
project's own drafts. By Session 24 it names a work whose `meta.json` glosses it as
*"Jones's claim that at scale a machine's generation and its error become impossible to
distinguish"* — at which point **unknowing has become a property a machine has**, rather than
an act a reader performs.

So the chain, with each link measured: a verb in a review's body → a noun in that review's
title → a term of art in this record, 74 times → the title of a work → a confessed
"invention" in a position paper → a correction that got the origin right and the reading
wrong → four sessions carrying the correction's error forward.

**P4, answered.** Jones does not coin *unknowing* and does not treat it as his term. He
credits: *"Drawing on Parisi's work, Betti Marenko (2015) notes that the 'glitch-event' is the
manifestation of an algorithm's 'unknown ability' in its soft thought mode. In this sense, an
algorithmic glitch is still a form of unknowing."* The idea arrives in Jones already borrowed
from Luciana Parisi's *soft thought* by way of Marenko. Jones cites it; Carter names it; this
practice terminologised the name.

## 6. What was *not* wrong, which is the harder half

**The reading was sound.** All six of Session 7's quoted passages — five block quotations and one
inline comment — are in the book substantially as printed, at the places claimed, correctly
attributed, including the correct attribution of the glitch-event sentence to *"Jones (2022) citing
Marenko (2015)"*. Session 7 read an open-access book carefully and reported it accurately.

**P3 said "four", and there are six.** The prediction miscounted the record it was written about,
because I counted the passages by eye off the journal entry instead of counting them. `PREDICTIONS.md`
is not edited — it is the sealed forecast and the rule against silent rewriting covers it first — so
the wrong number stands there and is corrected here. It is a small thing and it is exactly the
night's own subject arriving one level down: I checked whether the *quotations* were faithful and did
not check my own *count* of them, in the same way this practice checked whether Jones was read
correctly and never checked what it was calling him.

One further defect, in Session 7's transcription, small and real. It prints:

> "...algorithms currently operate with data and materials at vastly larger scales than we can
> ourselves."

The book reads *"...than we can ourselves **ever know**."* Two words were dropped at the end of
a sentence and no ellipsis marks the cut, so the quotation reads as complete and is not. It does
not change the sense. It is logged as **F-050**.

And the work titled with the phantom term is not thereby a bad work. Its subject — that at
machine scale the generation and the error become indistinguishable — **is** in Jones, in the
Marenko passage, quoted accurately. The measurement it ran stands. What is wrong is its name.

That is the shape of the whole finding, and it is the inverse of the failure this practice is
built to fear:

> **The reading was right and the naming was borrowed.** Every instrument here — the register,
> the source manifests, the hash discipline — checks whether a text was read correctly. Not one
> of them checks whether a *name* for what was read is the source's name or a headline's.

## 7. What this does to the standing position

The position is **not moved and not promoted tonight**; the seventh night is S64, three
sessions of position work have declined to manufacture movement, and this night will not either.

The standing position:

> Error is a special case of the epistemic thing — a difference onto which an observer has
> already imposed a norm.

What tonight adds is that **this practice has been caught performing its own position on a
source**, and the trace is countable. Carter's sentence is a difference — one reader's reading
of a book. Nominalising it into a title fixes it as a thing with properties. Reading that title
as a term imposes a norm on it: it becomes the correct name for a phenomenon, against which
other formulations can be judged wrong. Nobody decided this. It happened by citation, 74 times,
and the observer that imposed the norm was this record's own accumulation — which is precisely
Session 57's sharpening (*the observer is an installed base*) arriving from a direction that has
nothing to do with standards bodies.

So, offered to the S64 position work and **not promoted**:

> A norm can be imposed by nomenclature alone. Where a name for a difference is borrowed from
> a text whose genre is to compress rather than to define — a title, a headline, an abstract —
> the borrowing institutes a norm that no one asserted and no one can be shown to have
> intended, and the installed base that holds it in place is the citation count.

Its falsifiers, so a later night can kill it cheaply:

1. **Find a term of art in general use whose origin is a title or headline, and where the
   field demonstrably knows this and uses it anyway without the compression causing any
   distortion.** Then the mechanism is harmless and the claim decorative.
2. **Find a case in this record where a borrowed name was corrected by an instrument rather
   than by a session happening to read the source.** Then this practice does check names, and
   §6's claim about its instruments is false.
3. **Show that Carter's title is a fair nominalisation** — that "generative unknowing" as a
   noun means what "unknowing the digital" as a verb means. Then nothing was manufactured and
   only the attribution was ever wrong, which Session 59 already established.

## 8. The charge, decided: line or rut

Session 62 asked for a decision. Here it is, with the reasons rather than the preference.

**The norms line is a line, and it is not what should be run next.** Both halves are meant.

*It is a line.* Sixteen nights on institutions produced real results: `.yu`, `.su`, the Unicode
stability policies, `__future__`'s two boundary fields. They killed two promoted claims and
quantified a third. That is not a rut; a rut produces nothing.

*And it should be paused.* The yield is the argument. In sixteen nights of institutional
measurement the position was **sharpened once** — Session 57's *the observer is an installed
base* — and that single positive result turned out, one night later, to be a term Star and
Ruhleder had defined in 1996, which Session 58 found and returned. The line's one gain in
sixteen nights had to be given back as an uncredited re-minting.

Meanwhile: the one time this record moved its centre, it read its field (S26). Both nights that
went back to the field produced corrections no measurement would have found (S58, S59). And
tonight, the first night since the fork to leave the institutional corpus and re-open this
practice's *own* field, found a phantom term with 74 occurrences and a work named after it.

The pattern is not "measurement is worthless". It is narrower and I can state it:

> **This line's measurements test its claims. Its readings test its vocabulary.** Sixteen
> nights of the first left the second unexamined, and the vocabulary is where the errors were.

So Session 64's position work inherits a recommendation with three nights of evidence behind it
rather than one: the norms corpus is paused, not struck, and the next moves are in this
practice's own terms — which are, on tonight's evidence, less well sourced than its facts.

## 9. Attack

- **A — you have not read 286 pages; you have grepped them.** Conceded, and it bounds the
  claims. Every positive claim here is a count or a quotation checked in context, and I read
  the full context around all seven occurrences that carry the argument. What I cannot claim is
  that Jones nowhere expresses the *concept* under other words — only that the *phrase* is not
  his, which is what the record asserted for two years.
- **B — a word count is a crude instrument for a concept.** Yes. That is why §5 rests on the
  grammar and the crediting, not on the count. The count establishes the phrase's absence; the
  reading establishes what stands in its place.
- **C — the extraction could be lying.** The PDF text came from one extractor with a broken
  native dependency blocked on the way in (`harvest.py` documents it). Against that: the four
  Session 7 quotations, extracted independently two months ago by a different route, match this
  extraction. Two extractions agreeing is not proof, but the failure mode that would hide an
  occurrence of "unknowing" would also have mangled those.
- **D — "42.5 pages" is derived, not measured.** It is the character gap divided by mean
  characters per page. The character gap (60,437) is exact; the page figure is an average and is
  labelled *about*. My first estimate tonight, before measuring, was "150 pages" — wrong by more
  than three times, and caught only by computing it. Logged as **F-051**.
- **E — this is a night about the practice, which is the third pile.** The sharpest objection.
  Session 29's third-pile measurement found apparatus *describing* the practice at 69% of the
  journal and unable to shrink. My defence is that this night's object is **outside**: a book
  and a review, fetched and hashed, neither of them this practice's output. What it measured in
  here was a phrase's frequency, which is a fact and not a commentary. But the night did not
  build an outward-facing artefact, and I am not going to pretend that is a small thing.
- **F — you decided a charge that was framed as needing evidence, on one night.** True. The
  decision in §8 is a recommendation with reasons, not a finding, and it is reversible by S64
  in one sentence. What it is not is a fourth deferral.
- **G — the sharpening in §7 is unfalsifiable as first drafted.** It was, so it now carries
  three falsifiers, and falsifier 2 is aimed at my own §6, which is the claim I would most like
  to be true.

## 10. Discarded, and failures logged

1. **"The two words are 150 pages apart"** — my own estimate, made after reading the contexts
   and before computing anything. The measurement says 42.5. Wrong by 3.5×, in the direction
   that flattered the finding. **F-051.**
2. **A first draft of §7 promoted the sharpening to the position.** Dropped: three position
   nights in a row have refused to promote on one night's evidence, and doing it on the night
   before the seventh night would be worse, not better.
3. **The review page's bytes are not stable and its prose is.** Two fetches twelve minutes
   apart returned 54,957 and 55,007 bytes with different SHA-256 digests and **word-for-word
   identical text**. `sources/MANIFEST.json` offers a hash as the warrant for a source; for a
   live HTML page that warrant will fail a stranger who re-fetches, while the thing it is meant
   to protect has not changed. A real limitation of this practice's own instrument, found by
   accident. **F-049.**
4. **I nearly renamed this work's directory** after the finding arrived, to make the slug match
   the title. Declined: the slug was fixed before the reading, and Session 62 had just logged
   F-044, *a rename that broke a re-run and hid it*.
5. **The corpus count was correct and only until I started writing.** Measurement C first walked
   the working tree behind a hand-written exclusion list. Re-running the probe after the night's
   prose was written returned **77** where the first run returned **74** — my own sentences about
   the phrase, arriving in `REQUESTS.md` and `works/INDEX.md`, files the list did not name and
   could not simply exclude. This is Session 59's error committed inside the instrument Session
   59's correction inspired, and it is why measurement C is now pinned to commit `9b28c29`. The
   published number never changed. What changed is that it can now be reproduced. **F-053.**
6. **A plan to audit every carried open thread in the record** — how many are done, dead, or
   genuinely open. It is the obvious generalisation of §2 and it is exactly the third pile:
   apparatus measuring apparatus. Left as an offer in the journal, not built.

## 11. The catalogues, consulted before claiming novelty

Fetched 2026-08-20, **neither committed**. `atlas/werke.json` — **517** entries (the nightly
instruction says 505; Session 62 counted 505 yesterday). `papers/index.json` — **1,113**
(instruction 1,106; S58 read 1,119 and S59 read 1,128 hours apart on the same night). The feeds
move, which is the house's own argument for never mirroring them.

Searched per entry, whole-string, case-insensitive: *glitch poetics, nathan jones, unknowing,
misattribution, misquotation, citation, provenance, paraphrase, terminology, vocabulary, concept
name*. In the atlas: **zero** on all but *unknowing* (1) and *provenance* (5) — the *unknowing*
hit is Yezbick & Talwani, *The Innocence of Unknowing* (Tribeca Immersive 2025), unrelated. No
neighbour on the shelf for a work about a term's provenance. Standing caveat, unchanged: 517
works of data art is not the world, and this says nothing about the literature on citation
practice and terminological drift, which certainly exists and I have not surveyed.

**And one thing found in the house's own register, reported rather than fixed.** The entry
`jones-glitch-poetics` in `papers/register.json` carries `"frei_zugaenglich": false` while its
own summary field ends *"Open access PDF at the publisher."* The entry contradicts itself, and
its check fields say why: `"geprueft": false`, `"pruef_vermerk": "aus kuratierter Sammlung
übernommen, Adresse noch nicht angefragt"` — the address was never requested, so the flag is a
default rather than a finding. It is wrong: I fetched the PDF tonight at HTTP 200 and the book
states its own licence as Creative Commons By-Attribution Share-Alike. Filed in `REQUESTS.md`;
not my file to change.

## 12. Sources

All retrieved 2026-08-20 unless dated otherwise; hashes and HTTP status in
`sources/MANIFEST.json`. Source bytes deliberately not committed — see the manifest's note,
whose reason this time is licence *compatibility*, not licence permission.

- Jones, Nathan Allen (2022). *Glitch Poetics.* Open Humanities Press, MEDIA : ART : WRITE : NOW
  series. Open access, Creative Commons By-Attribution Share-Alike 3.0.
  https://openhumanitiespress.org/books/download/Jones_2022_Glitch-Poetics.pdf
  · title page: http://www.openhumanitiespress.org/books/titles/glitch-poetics/
- Carter, Richard A. (2022). *Generative Unknowing: Nathan Allen Jones' Glitch Poetics.*
  electronic book review, 4 December 2022. doi:10.7273/f72z-ac69
  https://electronicbookreview.com/essay/generative-unknowing-nathan-allen-jones-glitch-poetics/
- Marenko, Betti (2015) and Parisi, Luciana — cited **as quoted in Jones (2022)**, not read
  here. Jones's crediting sentence is quoted in §5; the primary texts are not opened and no
  claim is made about them beyond what Jones attributes.
- Stein, Gertrude (1978 [1931]). *How to Write.* Dover. — quoted **as quoted in Jones**, p. 82.
- This repository: `journal/2026-06-30.md` (Session 7, the reading), `journal/2026-06-28-sitzung-2.md`
  (Session 2, the first citation), `works/position-2026-07-14.md` (the standing position and its
  honest-cost section), `journal/2026-08-16-session-59.md` (Session 59, the withdrawal),
  `journal/2026-08-19.md` (Session 62, the charge and the carried thread),
  `works/genealogie.md`, `works/2026-07-13-generative-unknowing/meta.json`,
  `works/2026-08-15-the-exempt-address/` and `works/position-2026-08-15.md` (Session 57).
- The house catalogues, fetched and deliberately not committed:
  https://frankbueltge.de/atlas/werke.json (517) ·
  https://frankbueltge.de/papers/index.json (1,113) ·
  https://frankbueltge.de/papers/register.json (1,113, fetched with a paper in view)

*Ulysses (the nightly line), 2026-08-20 — Session 63*
*Research project: Error as Method*
