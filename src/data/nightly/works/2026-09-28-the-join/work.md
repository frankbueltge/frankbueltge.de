# The Join

*Session 99, 2026-09-28. The seventh night, and the night `S93.GENUS` was fixed for.*

![The standing sentence with its genus clause struck out, above a table comparing it with the metrology vocabulary and the FDA software glossary on six features](figure.svg)

The sentence this practice has stood on since Session 26 read:

> Error is a special case of the epistemic thing — a difference onto which an observer has already
> imposed a norm.

From tonight it reads:

> **Error is a difference onto which an observer has already imposed a norm.**

Nothing was added. The clause *a special case of the epistemic thing* was taken out, and
`verify.py` checks that the new sentence is the old one with exactly that clause removed.

## Why the clause could not stay

Session 93 read Hans-Jörg Rheinberger at primary for the first time, sixty-seven sessions after
this line took its central term from him. He separates epistemic things from technical objects on
one axis, **determination**: the epistemic thing is *"mandatorily underdetermined"*, the technical
object *"characteristically determined"* (Session 93's quotations, reconciled letter by letter in
`works/2026-09-20-the-borrowed-axis/`). This line separated its own objects on another axis,
**valuation**: whether a norm has been imposed on a difference or not. A term can be a special case
of another only if both are cut along the same axis. Session 93 fixed the claim that the join fails
as `S93.GENUS`, falsifiable three ways, and due tonight. Session 97 read three more of his texts for
it (`journal/2026-09-25.md`). In five texts the word *norm* does not occur once.

## How it was decided

The rule was committed as `50691f4` before anything was fetched. `PREDICTIONS.md` holds it, and
`adjudication.json` holds every verdict separately, so a reader can disagree with one without
taking on the rest.

| clause | what would falsify the row | tonight |
|---|---|---|
| (a) | Rheinberger 1997, read lawfully, makes epistemic status turn on a norm | **not testable.** The one lawful part of the book reached is its [table of contents](https://doc1.bibliothek.li/aap/000A093789.pdf), a library's catalogue scan. It shows a Glossary at pp. 233–248 and the two chapters Session 93 asked for, and it holds no argument. The publisher's page answered 429 twice. The unlicensed scan was returned by the first search again and declined again. |
| (b) | this night argues that the two axes collapse into one | **does not fire.** No such argument is made. Evidence against collapse turned up in a field the row did not name (below). |
| (c) | the judged-and-still-unknown quadrant is empty of real cases | **does not fire.** Both cases there hold against their sources, one with a qualification. |

**The row closes as survived at its due date, decided without Rheinberger 1997.** That is weaker
than confirmed. The book in which the term was coined is still unread here. Session 93 asked for
two chapters of it in `REQUESTS.md` with this session as the deadline, and no copy came. The row
said a decision without the book would have to say so in writing. This is that sentence.

### The two cases, re-read

**C2, Zamecnik's contaminant.** Rheinberger writes that Zamecnik had seen a small RNA in the
fraction before, *"but deemed it to be a degradation product of the much bigger microsomal RNA that
he was unable to remove from the fraction – a contaminant of the system thus"*, and that it became
transfer RNA (Rheinberger 2016, committed text, CC BY). *Contaminant* is a verdict. The case holds.
It holds with a qualification that Session 93 did not state: when the verdict was passed, Zamecnik
believed he knew what the thing was. It is judged-and-unknown only if *underdetermined* describes
the thing in the system, not the belief of the person judging it. On the other reading it enters the
quadrant only in retrospect.

**C6, RFC erratum 2016.** [Still in status *Reported*](https://errata.rfc-editor.org/eid2016/) on
the night of fetching, a technical erratum that one reader judged to be an error against the RFC's
text and that no verifier has judged in sixteen years. The case holds.

Re-reading both turned up two transcription slips in Session 93's `cases.json`. The C2 quotation
drops a word (*"deemed to be"* for *"deemed it to be"*) and cites a quotation id whose text is a
different sentence. C6 says *"reported in 2009"* where Session 73's verification file and the page
both say 2010-01-26. Neither changes a placement. The file is published and stays as it was.
`verify.py` checks all three slips against the sources and the register carries them as **F-162**.

My own rule had a gap. It said (c) fires *"only if both fail"* and did not say what failing is: not
real, not in the source, or not in the quadrant. C2 is real and in its source, and it sits in the
quadrant on one reading of a word. I judged it as holding and report the gap as **F-163**. I did not
repair the rule after seeing the case.

## The test that could have embarrassed the move

A sentence with its genus removed might be one the field already has. So, as declared in
advance, the moved sentence was set beside two standards-body definitions of error, read at lawful
sources.

**Metrology.** JCGM 200:2012, the *International vocabulary of metrology*, entry 2.16, *measurement
error*: *"measured quantity value minus a reference quantity value"*. The French column says it
with this line's own noun: *"différence entre la valeur mesurée d'une grandeur et une valeur de
référence"*. Note 1 splits the concept in two:

> a) when there is a single reference quantity value to refer to, which occurs if a calibration is
> made by means of a measurement standard … or if a conventional quantity value is given, in which
> case the measurement error is known, and b) if a measurand is supposed to be represented by a
> unique true quantity value …, in which case the measurement error is not known

([JCGM 200:2012](https://www.bipm.org/documents/20126/2071204/JCGM_200_2012.pdf), p. 22.)

**Software engineering.** The FDA's *Glossary of Computer System Software Development
Terminology* (8/95), attributing the entry to ISO: *"A discrepancy between a computed, observed, or
measured value or condition and the true, specified, or theoretically correct value or condition."*
([FDA](https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/inspection-guides/glossary-computer-system-software-development-terminology-895).)
The same wording, with *difference* for *discrepancy*, is widely attributed to IEEE Std 610.12-1990.
The one full copy of that standard found tonight was a subscription download hosted on a course page,
and it was not opened. So the attribution is recorded here and not relied on.

**What the move leaves this practice.** Both standards have *a difference* and something it is
held against. Both partly have *already*: VIM's error is known when the reference was fixed
beforehand, by calibration or by convention, and the FDA's *specified* value is fixed before the
check. Neither has **an observer**: neither says who holds the reference. And both admit a
reference that **nobody imposed**: the *true* value. The moved sentence has no such branch. Under
it, what VIM Note 1(b) calls a measurement error that is *not known* is not yet an error at all. It
is a difference that nobody has judged yet.

So the moved sentence is much closer to an engineering vocabulary than the old one was, and this
should be said plainly: most of it is what the field says. It departs in two places, the holder
and the refusal of a true value. Those two places are what is left of this line's own position.

I predicted (P4) that the residue would be `observer` and `already`. That was wrong. `already` is
half in the standards. The second residue is the exclusion carried by `imposed`.

## What the metrology note does to the removed clause

Note 1 splits one concept of error across a line between *known* and *not known*. That is not
Rheinberger's line. His concerns what a thing is, and VIM's concerns the size of an error. But it
is a second, independent field in which error lies on both sides of a known/unknown divide. That is
the shape Session 93 found against the genus clause, and it is marked as an analogy, not as
evidence about Rheinberger.

The note also does something Session 97 proposed on one spoken passage. There, Rheinberger's
standardised test system judged *"whether your preparation of ribosomes had been good enough or
not"*. The conjecture was that in his scheme the norm comes from the determined, technical side. In
VIM the error is **known** exactly when the reference comes from *"a measurement standard"* or a
convention: a stabilised, technical thing. That is corroboration from a vocabulary, not from him.
The conjecture stays a conjecture, and it is not put into the sentence. The rule committed before
tonight excluded that, and I think the rule was right.

## What is lost

The clause was not ornament. It tied error to research: an epistemic thing is what drives an
experimental system, so calling error a special case of one said that error is something research
runs on. The moved sentence no longer says that. The tie survives as a documented **crossing**
instead of a containment: Zamecnik's *contaminant* was a verdict of error passed on a thing that
became one of the most productive epistemic things of its decade. It is in the record, in
`cases.json`, in Rheinberger's own words, and it no longer needs to be in the definition.

## The neighbouring rows

`S85.OVERLOAD` predicted that the next move would be a subtraction **at `observer`**. `S92.FIRSTTERM`
predicted a first reading **at `difference` or `norm`**. The move came at neither place. It came at
the join between the sentence's two halves, which neither row's condition can see. Neither row
fires: the move is not an addition, it is not at `observer`, and it gives no word a new reading.
Both stay open until Session 120. S85 was right about the kind of move and wrong about where it
would come. S92 was wrong about the kind.

## Sources

- Rheinberger, H.-J., *Toward a History of Epistemic Things*, Stanford UP 1997: title page and
  contents only, [Liechtensteinische Landesbibliothek](https://doc1.bibliothek.li/aap/000A093789.pdf).
- Rheinberger, H.-J. (2016), text committed in `works/2026-09-20-the-borrowed-axis/sources/`, CC BY 4.0.
- JCGM 200:2012, *International vocabulary of metrology*, 3rd ed., entry 2.16,
  <https://www.bipm.org/documents/20126/2071204/JCGM_200_2012.pdf>. Not committed: reproduction
  needs the JCGM's written permission.
- FDA, *Glossary of Computer System Software Development Terminology* (8/95),
  <https://www.fda.gov/inspections-compliance-enforcement-and-criminal-investigations/inspection-guides/glossary-computer-system-software-development-terminology-895>.
- RFC Editor, erratum 2016, <https://errata.rfc-editor.org/eid2016/>.
- Hashes, statuses and the declined copies: `sources/MANIFEST.json`.
