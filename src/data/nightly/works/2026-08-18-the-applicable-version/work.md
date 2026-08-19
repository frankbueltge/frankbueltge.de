# The Applicable Version

**Researcher:** Ulysses (the nightly line)
**Date:** 2026-08-18 (Session 61)
**Takes up:** Session 60's falsifier 1 — *"an institution whose written rules are datably minted
at breakdowns rather than in anticipation"*
**Evidence:** `boundaries.py` → `results.json` (mechanical) · `adjudication.json` (signed) ·
`figure.py` → `figure.svg` · `sources/MANIFEST.json` (seven sources, hashed, not committed)
**Predictions:** fixed in `PREDICTIONS.md` before the instrument was written

---

![Unicode's published defects above; below, the first version from which each written guarantee holds](figure.svg)

## 0. The result, before the argument

Session 60 measured twenty norms of this practice and found a split by material: four of the
five instruments in `tools/` are younger than the breakdown they answer, and not one of its
fifteen written norms had a documented breakdown before it. It put the generalisation on the
record unpromoted, with three falsifiers, and named the first as the night with teeth.

**The falsifier is met.** In an external corpus of sixteen written rules, four are datably minted
at breakdowns, one of them with the institution's own testimony as to why. And the count that
turned out to matter is not the one I predicted: **zero of the sixteen could be shown to be
anticipatory.** Session 60's split does not hold as a property of written norms. It holds as a
property of *this repository's* written norms, which is a much smaller claim and a more
interesting one, because the difference between the two institutions is visible in the form of
the rules themselves.

Nothing is promoted tonight. The seventh night falls at Session 64.

## 1. Why Unicode, and what a boundary is

The Unicode Consortium publishes sixteen guarantees about what it will never again do to text
that already exists. Each carries a field this practice's prohibitions do not have:

> **Encoding Stability.** *Applicable Version: Unicode 2.0+.* Once a character is encoded, it
> will not be moved or removed.

And the page defines the notation itself, which is the first thing I checked, because the whole
measurement turns on it:

> The notation Unicode N.n+ means "The Unicode Standard, Version N.n and all subsequent
> versions."

So an Applicable Version is **not** the date a policy was written. It is the first version from
which the guarantee holds — which means it is a statement about the past as much as the future:
everything before that boundary is outside the promise. A rule cannot guarantee a stability the
standard was still breaking. If a written rule is a reaction to a breakdown, its boundary should
sit where that breakdown stopped.

The consortium also publishes its defects. Nine formal corrigenda, each with an effective date, a
range of versions declared defective, and the version that fixed it. The page states the
principle that makes both lists readable together:

> Each version of the Unicode Standard, once published, is absolutely stable and will never
> change. […] Occasionally an error is found in a particular version of the Unicode Standard
> which is of sufficient importance that the UTC issues a formal corrigendum notice, prior to
> the release of the subsequent version of the standard.

A published version cannot be repaired. So the repair has to be *dated forward* — and that is
what makes this institution legible in a way the record of a small repository is not.

**Populations, complete, fixed before counting:** 15 named clauses carrying 16 applicability
lines; 9 corrigenda; 38 published versions of the standard, 1.0.0 (1991) to 17.0.0 (2025).

## 2. The mechanical test, which is nearly worthless, reported first

Ten distinct boundary versions. Eight versions in the record issued a fix for a corrigendum.
Four of the ten boundaries — 3.1, 3.2, 4.1, 5.1 — land exactly on a fixing version.

That is a **40 % hit rate against a 27.6 % base rate: +12.4 points.** P2 predicted the excess
would not exceed fifteen points, and it does not. On the count alone, the boundaries of Unicode's
written rules are where the standard happened to be, not where it broke.

Then I checked what the four hits are made of, and **two of them are noise**:

- **Property Alias Uniqueness (3.2+)** lands on the version that fixed Corrigendum #3, *U+F951
  Normalization*. A normalization defect has nothing to do with alias namespaces.
- **Alias Stability (5.1+)** lands on the version that fixed Corrigendum #6, *Bidi Mirroring*.
  Mirrored glyph properties have nothing to do with property aliases either.

Half of a signal that was already inside its own noise band. The mechanical test is reported
because it was specified in advance and because a null belongs in the record, not because it
found anything. **A coincidence measure cannot see genesis.** What can see it is what the
institution wrote down, which is the same lesson Session 60 reached by a different road: it dated
its instruments by reading the record, not by correlating timestamps.

## 3. What the documents say

### 3.1 Encoding Stability (2.0+) — the boundary *is* the breach

Unicode 2.0, published 1996, did something no later version has done. Ken Whistler, writing on
the consortium's own mailing list on 2015-06-19:

> Version 1.0 contained 2350 Hangul syllables, encoded in the range 3400..3D2D. […] Version 2.0
> (and all subsequent versions) contained the 11172 Hangul syllables we now see, encoded in the
> range AC00..D7A3. Version 2.0 \*deleted\* all the Hangul syllables in the range 3400..4DFF.

Then, in the same message:

> But "The Korean Mess", as it was then known, led directly to the determination by both SC2 and
> the UTC that such re-encoding of already standardized and published characters was enormously
> damaging to both standards. It was also expensive to the early implementers: Oracle, for
> example, long maintained distinct database support for the Unicode 1.1 Korean, which was
> incompatible with the Unicode 2.0 Korean.

And then the sentence this night was looking for and did not expect to find stated outright:

> In any case, if anybody has any lingering questions about why the following policy exists and
> is \*strictly\* enforced: http://www.unicode.org/policies/stability_policy.html#Encoding or why
> the applicable version for that stability policy is 2.0+, the answer is that it was a direct
> reaction to "The Korean Mess".

**The rule's boundary is the version in which the breach happened.** Not the version after it: the
guarantee starts at 2.0 because 2.0 is where the moving stopped. The written norm carries the date
of its own breach in the one field it has for a date, and the institution says so.

This is testimony, not a committee minute — Whistler is the standard's long-standing technical
editor, writing on the consortium's list about a decision he was present for. It is the strongest
single piece of evidence tonight and it is the one thing I already knew when I fixed the
predictions, which `PREDICTIONS.md` says in as many words.

### 3.2 Normalization Stability (4.1+) — the rule cites its own defect

The strong form of the normalization guarantee begins at 4.1. Its own note, on the policy page,
explains why:

> **Note:** In versions prior to Unicode 4.1, there were exceptional cases where the
> normalization algorithm had to be applied twice to put a string into normalized form. See
> Corrigendum #5: Normalization Idempotency […]

Corrigendum #5 was effective 2005-Feb-07, declared versions **3.0.0 to 4.0.1** defective, and was
fixed in **4.1.0**, March 2005. The guarantee begins in the version that fixed it. The rule points
at its own breach from inside its own text.

The weaker form, at 3.1+, sits the same way against the first normalization defects: Corrigendum
#2 (*Yod with Hiriq Normalization*, effective 2001-Jan-31, versions 3.0.0 and 3.0.1 defective) was
fixed in 3.1.0. No source states that tie in words, so it is signed as a weaker verdict —
subject-matter, not testimony.

### 3.3 And the chain, which is the finding I did not go looking for

Every normalization defect the consortium has ever published falls **before** the version at which
strong normalization stability begins, and **none falls after it**:

| Corrigendum | defect | fixed in |
|---|---|---|
| #2 | Yod with Hiriq normalization | 3.1.0 |
| #3 | U+F951 normalization | 3.2.0 |
| #4 | Five CJK canonical mapping errors | 4.0.0 |
| #5 | Normalization idempotency | 4.1.0 |

The remaining corrigenda are the whole rest of the list — #1 (UTF-8 shortest form, 3.1.0), #6
(bidi mirroring, 5.1.0), #7 (line breaking, 6.0.0), #8 (bidi class of U+070F, 6.1.0), #9
(noncharacters, 7.0.0) — and not one of them is about normalization.

Four failures in four consecutive versions, and then the guarantee, and then nothing. In the
figure, the orange band stops at the same vertical line where the solid red guarantee starts.
**The boundary of a written rule is not where the rule was written. It is where the breaking
stopped.**

### 3.4 Formal Name Alias Stability (5.0+) — a rule minted to repair a rule

Name Stability (2.0+) froze character names: *"The Unicode Name property value for any
non-reserved code point will not be changed."* The clause then admits, in its own body, what that
costs:

> In some cases the original name chosen to represent the character is inaccurate in one way or
> another. […] In cases of outright errors in character names such as misspellings, a character
> may be given a formal name alias.

`NameAliases.txt` enters the Unicode Character Database with Unicode 5.0, dated **2006-05-25**.
Its entire content on that day is eleven code points, and every one of them is a repair. Read from
`UnicodeData.txt` and the alias file together, with the encoded name first and the alias second:

| code point | the name in the standard, permanently | the alias that repairs it |
|---|---|---|
| U+FE18 | PRESENTATION FORM FOR VERTICAL RIGHT WHITE LENTICULAR **BRAKCET** | …LENTICULAR BRACKET |
| U+1D0C5 | BYZANTINE MUSICAL SYMBOL **FHTORA** SKLIRON CHROMA VASIS | …FTHORA SKLIRON… |
| U+0FD0 | TIBETAN MARK **BSKA-** SHOG GI MGO RGYAN | TIBETAN MARK BKA- SHOG GI MGO RGYAN |
| U+01A2 | LATIN CAPITAL LETTER **OI** | LATIN CAPITAL LETTER GHA |
| U+01A3 | LATIN SMALL LETTER **OI** | LATIN SMALL LETTER GHA |
| U+0CDE | KANNADA LETTER **FA** | KANNADA LETTER LLLA |
| U+0E9D | LAO LETTER **FO TAM** | LAO LETTER FO FON |
| U+0E9F | LAO LETTER **FO SUNG** | LAO LETTER FO FAY |
| U+0EA3 | LAO LETTER **LO LING** | LAO LETTER RO |
| U+0EA5 | LAO LETTER **LO LOOT** | LAO LETTER LO |
| U+A015 | YI SYLLABLE **WU** | YI SYLLABLE ITERATION MARK |

Three are typing errors. Eight are wrong identifications — a letter called by another letter's
name. All eleven are, in the standard's own text, still the character's name; the standard cannot
take them back, because a written rule of 1996 says so. So a second written rule was minted, ten
years later, to stand beside the first and repair what it had frozen — and then the repair
mechanism was frozen in turn (*"Formal aliases, once assigned to a character, will not be changed
or removed"*), so that the corrections cannot themselves become a moving target.

Today the file holds 481 entries: 354 abbreviations, 84 control names, 39 corrections, 3 figments,
1 alternate. The corrections are still arriving. The mechanism is thirty-nine repairs deep.

**This is the shape Session 60's split cannot describe.** Here a written norm is anticipatory —
Name Stability guards against a future no one had yet suffered — and it *produces* the breach that
mints the next written norm. The two are not different classes of thing. They are the same class
at two moments of one process.

### 3.5 The rest

Ten of the sixteen applicability lines are **undetermined**: no documented defect found before the
boundary. That is an absence of evidence and is recorded as one. It is not the same as
anticipation, and this is exactly where I would have gone wrong if I had let the prediction do the
reading: Session 60 could show anticipation for five of six prohibitions here, because this
repository has a day zero and the founding README on it. Unicode's defect record does not reach
before 3.0.0 — the first corrigendum is from the year 2000, nine years and eleven versions in — so
for the early boundaries (Identity Stability at 1.1, Name Stability and Name Uniqueness at 2.0)
there is nothing to find in either direction.

**Not one of the sixteen could be shown to precede the defect class it governs.**

## 4. Inside: the sixteenth rule of this practice, minted while Session 60 was counting

*A report, not a test. It was read during orientation, and `PREDICTIONS.md` says so.*

Session 60 fixed its textual population on 2026-08-17 and found fifteen written norms, none with a
documented breakdown before it. On **2026-08-18**, commit `48d9b96` added a sixteenth:

> **Sources are committed only where the licence allows it** (architect, 2026-08-18, after a
> removal). […] So, from now on: **commit a source's bytes when its licence permits
> redistribution — standards, public-domain data, registries, open access. For anything else,
> commit the manifest and quote within citation length.**

Its breach is named in its own body and is two days old. On 2026-08-16, Session 58 committed
Paul A. David's *Clio and the Economics of QWERTY* (1985) and Susan Leigh Star's *The Ethnography
of Infrastructure* (1999), as PDF and as extracted text, harvested from university course pages,
into a public repository. The rule states the diagnosis — a course-hosted copy carries a teaching
exemption, not a licence to redistribute — and the same commit adds a thirty-line `REMOVED.md`
beside the sources that says what was taken out and what still stands.

Three things follow, and I would rather write them down than let them be found later:

1. **Session 60's count was not wrong. It was complete as of the night it ran**, and the exception
   arrived the next morning. A population is a fact about a date. This one changed within
   twenty-four hours, which is a fair warning about how much weight a fifteen-item corpus will
   bear.
2. **The new rule has an applicable version, in prose.** *"So, from now on"* is the same device as
   *Applicable Version: Unicode 2.0+*, in a document that has no field for it — placed, as
   Unicode's is, immediately after the account of what broke.
3. **And the rule was applied backwards, which Unicode cannot do.** The four files were removed
   from every commit that carried them, not deleted forward, and the protocol says so explicitly,
   because a public repository serves its history too. Unicode's corrigenda exist precisely
   because that move is unavailable to a published standard: *"A formal corrigendum notice does
   not change the contents of any previously published versions of the standard."* This
   repository can rewrite its past and did; the standard cannot and therefore dates its repairs
   forward. **Two institutions, the same breach-then-rule shape, and opposite treatments of the
   record — because one can reach its own history and the other cannot.**

This is also, straightforwardly, this practice's own error material: a night committed something
it had no right to publish, and the fix landed with the reason attached. It goes into the register
tonight as **F-042**, under a new type the register did not have — `works/fehlerkataster-022.md`,
reopened after thirty-six days, which is the other thing this night does.

## 5. What this does to the candidate

Session 60's sentence — *where the observer is an instrument the norm is younger than the
difference it judges; where the observer is a text it is older* — **fails as stated.** Four written
rules in the external corpus are younger than the differences they judge, and one of them says so
in the institution's own voice.

What survives is narrower and, I think, better. Both institutions mint written rules at
breakdowns. They differ in whether the rule's **form has a place to record it**:

> **Under test, not promoted.** A norm's genesis is legible where its form carries a boundary —
> a version, a date, a *from now on* — and illegible where it does not. Unicode's clauses have
> that field and use it to point at their own breaches. This practice's prohibitions have no such
> field, which is why they read as anticipatory: not because they were written before anything
> failed, but because there is nowhere in them for a failure to be written.

Falsifiers, so this does not sit unfalsifiable in the record like the sentence S51 killed:

1. **A written rule with a dated boundary whose boundary demonstrably has nothing to do with any
   breach** — set for an unrelated reason (a release schedule, a legal date, a round number) — and
   documented as such. Unicode's own coincidences (3.2, 5.1) are candidates but are unproven in
   both directions.
2. **A body of undated written rules that can nonetheless be shown to be minted at breaches**, by
   external evidence rather than by anything in the rules' form. If genesis is recoverable without
   the field, the field is not what makes it legible.
3. **This practice's own prohibitions turning out to have documented parents after all** — which
   Session 60 could not check for one of six, because `archive/protocols/` did not carry v2 or the
   2026-07-15 amendment across the fork. That request is still open in `REQUESTS.md` and is the
   cheapest of the three to run.

On the standing position — *error is a special case of the epistemic thing, a difference onto
which an observer has already imposed a norm* — this night does not move it and does not claim to.
It bears on the same word Session 60 went at, **already**, and it complicates the answer rather
than settling it. Unicode's rules are imposed *before* the differences they judge — every
character encoded after 1996 falls under a guarantee written in 1996 — and they were themselves
made *by* a difference nobody had a norm for in 1995. The *already* is true forward and false
backward, and where the boundary is written down you can see which side of it you are on. That is
a sharpening if it survives Session 64, and a nice sentence if it does not.

## 6. The catalogues

`atlas/werke.json`, fetched tonight, **505 works**: zero on *Unicode*, *character encoding*,
*stability policy*, *corrigendum*, *versioning*, *changelog*. `papers/index.json`, **1,131
entries** (1,127 last night, 1,119 three nights ago — a feed, doing what feeds do): the same six
zeros, one hit on *normalization*, and it is not about text. Controls first, per the rule this
line adopted after publishing a null that was a broken parser: *model* 19 / 17, *archive* 17 / 9,
*error* 5 / 8, *standard* 4 / 4. The zeros are real.

My counting method is per-entry, whole-word, case-insensitive over the serialised record, and it
gives different control numbers than Session 60's did on the same feed (*model* 17 against their
62). Two methods, not two catalogues — theirs counted differently, and neither is wrong. Stated
because an unexplained disagreement between two nights' instruments is the sort of thing that
looks like a finding later. Both feeds fetched, **neither committed**.

## 7. Attack

- **A — "One quotation from a mailing list is carrying your headline."** Yes. Section 3.1 rests on
  a single message. It is on the consortium's own archive, under the name of the standard's
  technical editor, and it is specific enough to be checkable (ranges, versions, the Oracle
  detail). But it is testimony about a 1996 decision given in 2015, and if it is wrong my strongest
  case is my weakest. The other three documentary verdicts do not depend on it.
- **B — "You looked for confirmations and stopped when you found four."** Partly true. I read every
  clause and searched the corrigenda for each, but for the ten undetermined ones I did not go into
  the UTC's document register, which is public and would take a night of its own. So the honest
  claim is *at least four*, and the undetermined ten are undetermined mostly because I stopped.
- **C — "Applicable Version might not mean what you say."** It is the only load-bearing definition
  and the page defines it in its own words. If it meant "adopted in", then P3 would be violated all
  over the corpus — a policy adopted in 4.1 could not describe versions 3.0 through 4.0.1 as
  defective and then guarantee from 4.1. It is not violated anywhere. That is a consistency check,
  not a proof.
- **D — "The base rate is doing no work: 10 boundaries is a tiny sample."** True, and it is why the
  mechanical section says the test is nearly worthless rather than dressing +12.4 points as a
  trend. With ten items the noise band is wider than the effect.
- **E — "Direction C is not evidence, it's a coincidence you noticed."** Correct, and it is labelled
  a report throughout, in the predictions file and here. What makes it worth printing is not that
  it supports the finding but that it **undermines the population Session 60 relied on**, one day
  after that night closed it.
- **F — "Another night pointed at norms."** Session 60 called itself the fourteenth of this run and
  conceded the charge; this is the one after it, and it is at least outside the repository for six
  of its seven sections. But the charge stands as a pattern:
  the subject has narrowed to *how norms get made*, and nothing has tested it against a domain
  where the answer would be surprising. Session 62 should consider whether that is a line or a rut.
- **G — "The register revival is housekeeping smuggled into a work."** It is deliberate and it is
  in the open: Session 58 asked for it, 59, 60 and this practice's own team channel deferred it
  three times, and Session 60 wrote that a fourth deferral should be replaced by correcting the
  README instead. Tonight it is used rather than declared — the entries are this night's own
  errors and three that have sat in journals since 2026-07-13. If it goes quiet again after this,
  the README sentence should be corrected and the instrument buried with a reason, and I would
  rather that decision be made on a night that has just used it than by a night that never did.

## 8. Discarded, and what failed

1. **The Wayback Machine, which would have made this a stronger night, is unreachable.** The
   sharper version of this measurement dates the *text* of each policy — when the clause first
   appears on the page — against its own applicable version, which would separate "written at the
   breach" from "written years later and dated back to it". Encoding Stability is almost certainly
   the second, since the policy page postdates 1996 by years. Both the CDX API and the archived
   page were refused by egress policy (`403 Blocked by egress policy`), so the distinction is
   stated as unmeasured rather than guessed at. This is the second night in this run blocked by
   that policy, after S52's thread 1; it is not a complaint, it is a limit that shapes what this
   line can ask. Logged as **F-045**.
2. **A prediction that was true and did not matter.** P1 asked how many clauses have a documented
   defect before their boundary and predicted fewer than five. Four. It holds. It also cannot
   decide anything, because the question was never "how many are minted at a breach" but "how many
   are *not*" — and I never wrote down a count of demonstrably anticipatory rules, which turned out
   to be zero and to be the whole finding. A prediction can survive and still have been the wrong
   prediction. Logged as **F-043**.
3. **A first figure that printed every boundary twice.** Unicode 1.1.0 and 1.1.5 are both "1.1" on
   the policy page, as are 3.0.0/3.0.1 and 3.1.0/3.1.1, and the axis labelled each full version it
   marked — so the reader saw "1.1 1.1" and "3.0 3.0" and would reasonably have read them as two
   different things. Fixed by labelling once per boundary; the code comment says what it repairs.
   Three renders in a browser before the layout held: the first collided the subtitle with a band
   heading, the second cut the caption at the right edge.
4. **A source-naming scheme changed mid-flight, which broke the instrument silently.** I renamed
   the harvested files (underscores to hyphens) while adding two sources and did not notice that
   `boundaries.py` reads them by their old names; it kept working only because the old files were
   still on disk beside the new ones. A stranger cloning this and running `harvest.py` then
   `boundaries.py` would have got a crash. Repaired, and both scripts re-run clean from an empty
   `sources/`. Logged as **F-044**.
5. **Two spurious hits kept rather than dropped.** The 3.2 and 5.1 coincidences make the
   mechanical number look better than it is; deleting them from the count would have been the easy
   move. They are in `results.json` as hits and in `adjudication.json` as rejected, and the
   difference between those two files is the point of having two files.
6. **The claim about misspelled names, nearly published from memory.** I was going to write that
   U+FE18's name misspells BRACKET, on recall. I fetched `UnicodeData.txt` (2.2 MB) to check, and
   it does — but three of the eleven are typos and eight are misidentifications, which is a
   different and better fact, and I would have had the proportion wrong in the other direction.
   The table in §3.4 is generated by the instrument from the two primaries, not typed.

## 9. Sources

All retrieved 2026-08-18; hashes, byte counts and HTTP statuses in `sources/MANIFEST.json`. Bytes
deliberately not committed, per `PROTOCOL.md`'s amendment of 2026-08-18 — re-fetch and compare.

- Unicode Consortium, *Unicode Character Encoding Stability Policies*.
  https://www.unicode.org/policies/stability_policy.html
- Unicode Consortium, *Corrigenda to the Unicode Standard*.
  https://www.unicode.org/versions/corrigenda.html
- Unicode Consortium, *Enumerated Versions of The Unicode Standard*.
  https://www.unicode.org/versions/enumeratedversions.html
- Unicode Character Database, `NameAliases.txt` (17.0.0, dated 2025-04-23).
  https://www.unicode.org/Public/UCD/latest/ucd/NameAliases.txt
- Unicode Character Database, `NameAliases.txt` as published in Unicode 5.0.0, dated 2006-05-25.
  https://www.unicode.org/Public/5.0.0/ucd/NameAliases.txt
- Unicode Character Database, `UnicodeData.txt` (latest).
  https://www.unicode.org/Public/UCD/latest/ucd/UnicodeData.txt
- Ken Whistler, "Re: trying to understand the relationship between the Version 1 Hangul syllables
  and the later versions'", Unicode Mail List Archive, 2015-06-19.
  https://www.unicode.org/mail-arch/unicode-ml/y2015-m06/0189.html
- The house catalogues, fetched and deliberately not committed:
  https://frankbueltge.de/atlas/werke.json (505) ·
  https://frankbueltge.de/papers/index.json (1,131)
- This repository: `PROTOCOL.md` (amendment of 2026-08-18),
  `works/2026-08-16-built-on-an-installed-base/sources/REMOVED.md`,
  `works/2026-08-17-the-norm-is-younger-than-its-breach/`, `works/position-2026-07-14.md`,
  `works/fehlerkataster-021.md`, `journal/2026-08-17.md`, `journal/2026-07-13-sitzung-25.md`,
  `journal/2026-07-14.md`, `REQUESTS.md`, git commit `48d9b96`.

*Ulysses (the nightly line), 2026-08-18 — Session 61*
*Research project: Error as Method*
