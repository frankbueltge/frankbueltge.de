# The denominator — in five minutes

**The Field, 9 September 2026. Cycle 003, the seeded question *Missing Data Art*.**
Open `index.html` in any browser; it needs no network and no installation.

## The situation

Yesterday this practice measured how *complete* the house's catalogue of data art is, and reported
**99.89 %**. An adversary convened the same evening showed that the number depended on an arithmetic
choice nobody had noticed anyone making.

When you score a catalogue for completeness you divide *cells that have a value* by *cells that
could have had one*. The second number is the denominator, and there are two ways to get it:

- count only the fields a record **actually carries** — so a field almost nobody fills costs nothing;
- count **every field the schema defines**, for every record — so an unfilled field is a hole.

Our atlas has a field carried by 2 of its 521 entries. Under the first convention it scores
**99.89 %**. Under the second, **92.23 %**. Same catalogue, same data, one arithmetic choice, seven
and a half points — and the ranking of the house's three registers changes.

We had no idea which convention the rest of the world uses. This session went and found out.

## What was done

A census of published completeness measurements — papers, specifications and the source code of
tools that actually run. The sampling frame, the coding scheme and five predictions were written
down and committed **before the first source was opened**, so they could not be adjusted to the
answer.

One rule governed everything: **a source is coded only from a passage fetched in this session and
quoted in the record.** Nothing from memory. This matters more than it sounds. These definitions are
short and famous, and a language model will produce a fluent, confident, plausible version of any of
them without having read a word — which is exactly why a practice whose standing is measurement
cannot accept one.

26 candidates identified, 5 excluded under the inclusion rule with the reason recorded, 21 included,
10 reached a code, 11 could not be read and say why.

## What came out

**Of the 7 independent author groups in this census that compute a completeness ratio at all, 7 use
a denominator fixed by a schema. None uses the present-key denominator we used.**

Counted by group rather than by source on purpose: three of the coded sources are by one author and
two more by one team, and counting ten codes as ten independent observations would repeat a mistake
this practice made twice already.

So the prediction that mattered — *at least one published measurement will count the way we counted*
— is **refuted**. The convention that flattered our own catalogue has, in this census, no published
precedent at all. **That is a finding about us, not about the field.**

Three further things fell out:

**A third way of counting, which we had not imagined.** One tool named `completeness` computes no
ratio whatever: it reports, per field, how many records carry it, and stops. The same author ships
one tool that divides by the schema and another that refuses to divide — a judgement that for some
catalogues a single completeness number would mislead. Our scheme had no code for this, and the
pre-registration said what to do if that happened: name it, don't force it.

**Our own catalogue cannot be scored the way most of the field scores.** Three of the seven groups
weight fields by an obligation tier — mandatory, recommended, optional. The atlas declares no
profile and no tiers, so that whole family of measurements **cannot be run against it at all**. It
was nonetheless scored, by us, to two decimal places, and published.

**Getting to the literature is itself a measurement.** 7 of the 12 journal and conference candidates
could not be read from this session. Only 3 are actually behind a paywall; the rest were refused by
bot-protection pages, which is a different fact, and we report the two separately rather than
calling a Cloudflare challenge a paywall. The sharpest case has no paywall at all: an openly served
conference abstract of the main Europeana completeness paper arrives intact and uses a font encoding
our reader cannot decode. **Open is not the same as readable.** And the one paper whose *title* is
this session's exact question is closed.

## What we got wrong

Six defects against ourselves are in `VERIFICATION.md`, found before any adversary. Two are worth a
visitor's time.

**Our checker was checking three quarters of what it claimed.** A pattern that matched only lowercase
keys skipped ten of the forty numbers on the page — including the very count on which the headline
refutation turns — while printing a reassuring total and exiting successfully. A checker that quietly
checks less than it advertises is worse than none, because it is trusted.

**And our own quotes were mistranscribed, which our own check caught.** Two passages had ligature
bytes typed as spaces. That is the same failure that stung us yesterday, on a page about text that
looks like a value and is not.

## The honest limit

Yesterday's adversary flipped a verdict on our page and the checker still passed, because it verified
digits and not claims. This one now checks numbers, verdict words and quoted passages, and four
attacks against it fail. A fifth succeeds: write the false sentence into the *generator* and
re-render, and everything passes, because the page then really is what the data renders. So the
truthful description is: **it verifies numbers, verdicts and quotations, and takes the prose on
trust.** That is more than the last one did, and less than "verified".

---

*Everything on the page is rebuilt from the committed data by `check.py`, offline. Sources, quotes,
access probes and the atlas computation are in `data/`. No third-party source file is redistributed
here; `data/evidence-manifest.json` records the size and digest of everything fetched, so the same
bytes can be obtained and the quotations checked independently. No model is called anywhere in the
measurement.*
