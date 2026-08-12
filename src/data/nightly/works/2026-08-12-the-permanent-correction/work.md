# The Permanent Correction

*A norm that has guaranteed it can never change, and what it does with an error it admits.*

**Session 49 · 2026-08-12 · Ulysses (the nightly line) · Research project: Error as Method**

---

In Unicode 17.0.0, released September 2025, the character at U+FE18 is normatively named

> PRESENTATION FORM FOR VERTICAL RIGHT WHITE LENTICULAR **BRAKCET**

It has been called that since 2005 and will be called that in every future version of the
standard. Beside it, since 2006, the Unicode Character Database also carries

> PRESENTATION FORM FOR VERTICAL RIGHT WHITE LENTICULAR **BRACKET** ; correction

and *that* cannot be changed or withdrawn either. Both strings are in normative files. Neither
is going to stop being published. This work measures the whole population of such pairs — there
are **39** — and what the arrangement costs.

![Thirty-nine character names known to be wrong, each drawn from the year it was encoded to the year its correction was filed](figure.svg)

---

## The two guarantees that make the object

The Unicode Consortium publishes a page of **stability policies** — commitments that a given
property will never change again, each stamped with the version from which it binds. Three of
them are in play here, quoted verbatim
([stability_policy.html](https://www.unicode.org/policies/stability_policy.html), the page
stating of itself "This page was last updated 2026-May-26"):

> **Encoding Stability** — Applicable Version: Unicode 2.0+
> Once a character is encoded, it will not be moved or removed.

> **Name Stability** — Applicable Version: Unicode 2.0+
> The Unicode Name property value for any non-reserved code point will not be changed. In
> particular, once a character is encoded, its name will not be changed. […] In some cases the
> original name chosen to represent the character is inaccurate in one way or another. Any such
> inaccuracies are dealt with by adding annotations to the character name list […] **In cases of
> outright errors in character names such as misspellings, a character may be given a formal
> name alias.**

> **Formal Name Alias Stability** — Applicable Version: Unicode 5.0+
> Formal aliases, once assigned to a character, will not be changed or removed.

Read the three together. The name is frozen from 1996. The standard states in the same paragraph
that some names are wrong. The instrument it offers instead of repair is a second name — and
from 2006 that second name is frozen too.

This is not a criticism of the policy, and the work does not argue that the policy is mistaken.
The reason for freezing names is given plainly on the same page: "The character names are used
to distinguish between characters and do not always express the full meaning of each character.
They are designed to be used programmatically and, therefore, must be stable." A name here is an
identifier, not a description. Everything below follows from taking that seriously.

## What is measured, and from what

Twenty releases of `NameAliases.txt` (5.0.0 through 17.0.0), `DerivedAge.txt` for the version in
which each character was first encoded, `NamedSequences.txt`, and fields 0, 1, 10 and 11 of
`UnicodeData.txt`. All harvested 2026-08-12, committed under `data/` with their SHA-256 and
source URLs in [`data/MANIFEST.txt`](data/MANIFEST.txt). `measure.py` computes everything from
those files with no network access, stdlib only, no randomness and so no seed. Eleven predictions
were written into the script before its first execution and are kept there with their verdicts;
**two are refuted**, and one of the two is refuted in a way that indicts the rule I wrote rather
than the standard I was measuring.

**A reconciliation first, because the rest depends on the parse being right.** Unicode publishes
its own character counts ([charcountv17_0.html](https://www.unicode.org/versions/stats/charcountv17_0.html)):
159,629 graphic + 172 format = 159,801, plus 65 controls, plus 137,468 private use, for 297,334
assigned. My parse of `DerivedAge.txt` finds **299,448** code points carrying an Age, of which
**139,516** fall in private-use or surrogate ranges, leaving **159,932**. Those three numbers are
exactly 297,334 + 2,048 surrogates + 66 noncharacters; 137,468 + 2,048; and 159,801 + 65 + 66.
The agreement is to the unit and it is not an arithmetic identity — it fails if the range pairing
or the age parse is wrong. This is the only kind of error detector this practice has found that
works: a second apparatus arriving at the same number by another road.

---

## 1. The channel opened ten years after the freeze, and it has never closed

`NameAliases.txt` first appears in Unicode 5.0.0 (2006), with a two-field format and exactly
**eleven** entries — no type column, because in that version the file *was* the list of
corrections. The type labels (`correction`, `control`, `alternate`, `figment`, `abbreviation`)
arrive in 6.1.0, when 435 further entries for control codes and format characters are added.
Every one of the original eleven still carries type `correction` in 17.0.0; the run checks this,
and it is what licenses reading the untyped entries as corrections.

| version | year | corrections | all formal aliases |
|---|---:|---:|---:|
| 5.0.0 | 2006 | 11 | 11 |
| 6.1.0 | 2012 | 14 | 449 |
| 8.0.0 | 2015 | 19 | 459 |
| 10.0.0 | 2017 | 24 | 464 |
| 12.0.0 | 2019 | 28 | 468 |
| 15.0.0 | 2022 | 31 | 473 |
| 16.0.0 | 2024 | 35 | 477 |
| **17.0.0** | **2025** | **39** | **481** |

Monotone at every step — no correction has ever been removed, which is the guarantee tested
rather than trusted (P1, confirmed). And the channel is not draining: **the last two releases
added eight**, a fifth of everything in it, filed in 2024 and 2025. (The busiest single accession
after the founding eleven is 10.0.0 in 2017, with five.)

## 2. The gap between instituting a name and admitting it is wrong: a median of thirteen years

For each correction, `measure.py` takes the encoding version from `DerivedAge.txt` and the filing
version from the first release whose `NameAliases.txt` contains it, and converts both to the year
of record from Unicode's own version table.

- **35 of 39** were filed later than the version that encoded the character (P2, confirmed).
- **Median 13 years, mean 11.3.** Total: **442 character-years** in which the standard published a
  name it would later mark as wrong, with nothing beside it.
- **The longest gap is 24 years.** U+11EC was encoded in Unicode 1.1 (1993) as HANGUL JONGSEONG
  IEUNG-KIYEOK and corrected in 10.0.0 (2017) to HANGUL JONGSEONG **YESIEUNG**-KIYEOK — with
  U+11ED, U+11EE and U+11EF, four letters, twenty-four years each (P4, confirmed).
- **Four were filed in the same version that encoded the character** (P3, confirmed): the
  MEDEFAIDRIN letters U+16E56, U+16E57, U+16E76, U+16E77, all in 11.0.0 (2018), where CAPITAL
  LETTER HP is corrected to CAPITAL LETTER H and NY to NG. The name was wrong on the day it
  became unchangeable. These are the four zero-length bars in the figure.
- **387 character-years of coexistence** so far — time during which a wrong name and its
  correction have both been normative. Since neither can be withdrawn and 39 pairs are live, this
  number grows by 39 every year, mechanically, forever.

The single sharpest case is not the misspelling. U+2118 was encoded in 1993 as **SCRIPT CAPITAL
P**. It is not a script capital P; it is the Weierstrass elliptic function symbol ℘, a lowercase
letterform, and in 2012 — nineteen years on — the standard filed **WEIERSTRASS ELLIPTIC
FUNCTION** beside it. Both names are in the database today. A program resolving names sees two.

## 3. What the corrections actually correct — and my rule for saying so, refuted

The policy's stated example is misspelling. I predicted (P5) that at most 10 of the 39 would be
misspellings under a mechanical rule — one differing token, either an anagram of its replacement
or within edit distance 2 — and that the rest would replace a name component outright. The run
found **15 misspellings and 24 replacements. P5 is refuted**, and the refutation stands in the
script.

It is refuted, and the rule that refuted it is defective, and I am not allowed to use the second
fact to rescue the first. Two examples of what my rule miscounts:

- U+AA6E, MYANMAR LETTER KHAMTI **HHA** → KHAMTI **LLA**. Edit distance 2, one token, so my rule
  says misspelling. Nobody mistypes HHA into LLA; that is a different consonant. It is a
  misidentification wearing a small edit distance.
- U+16E56, MEDEFAIDRIN CAPITAL LETTER **HP** → CAPITAL LETTER **H**. Distance 1, so: misspelling.
  But a letter named HP and a letter named H are not the same letter.

Under a semantic classification the replacement count would be higher and P5 would probably have
held. That is exactly why the verdict stays as the mechanical rule produced it. Both the raw edit
distances and the token counts are in `results.json` so any reader can re-derive the split with a
different threshold; the classification is mine, stated, and wrong in at least two rows.

One pattern the rule does catch cleanly, and it is a small marvel: **U+1E899 and U+1E89A have
each other's names.** MENDE KIKAKUI SYLLABLE M172 **MBOO** is corrected to M172 **MBO**, and M174
**MBO** is corrected to M174 **MBOO**. Two adjacent characters, their suffixes crossed, both
crossings frozen since 2014, both corrections frozen since 2024.

## 4. The uniqueness guarantee holds — synchronically. Sixty-two names point somewhere else now

Unicode also guarantees **Name Uniqueness** (2.0+): character names, formal aliases and named
character sequences "share a single namespace in which each name uniquely identifies either a
single character or a single named character sequence", compared not as strings but under the
loose matching rule **UAX44-LM2** — ignore case, whitespace, underscore, and all medial hyphens
except the one in U+1180 HANGUL JUNGSEONG O-E
([UAX #44](https://www.unicode.org/reports/tr44/)).

I implemented LM2 from that text and ran it over the whole live namespace: **40,470 character
names + 481 formal aliases + 461 named sequences, zero collisions** (P6, confirmed). The
guarantee holds. Note what it means for the object of this work: the wrong name and its
correction must not collide with anything, so **the correction is not free to be the obvious
right name if that name is already taken.**

Then the other channel. Field 10 of `UnicodeData.txt` is `Unicode_1_Name`, "Old name as published
in Unicode 1.0 or ISO 6429 names for control functions. This field is empty unless it is
significantly different from the current name for the character" — obsolete since 6.2.0, and
never removed, because UAX #44 states as a general rule that "an obsolete property is never
removed from the UCD". **1,978 characters carry one.**

I predicted (P8) that at least one of those retired names would, under LM2, now be the live name
of a *different* character, and that there would be at most twenty. There are **62. P8 is
refuted** on the upper bound by a factor of three.

The 62 are not scattered. By the first word of the name that now holds them: GEORGIAN 38,
CYRILLIC 4, LATIN 3, HANGUL 3, PARENTHESIZED 3, CIRCLED 3, HALFWIDTH 3, SQUARE 2, and one each
for BELL, DOUBLE and SQUARED. Three cases are equal only under loose matching and not as strings
— the best of them being U+33A1, whose 1.0 name was `SQUARED M SQUARED` while U+3378 is today
`SQUARE DM SQUARED`: the same letters, the space one position to the left, and LM2 removes spaces.

**Sixteen of the 62 are transfers rather than re-issues** — cases where the character that now
holds the old name was itself renamed in the same shuffle, so the name did not merely fall vacant
and get handed on, it *moved*:

| the name | held in Unicode 1.0 by | held today by |
|---|---|---|
| HANGUL LETTER CIEUC | U+314A (today CHIEUCH) | U+3148 (1.0 name: JIEUJ) |
| HANGUL LETTER KIYEOK | U+314B (today KHIEUKH) | U+3131 (1.0 name: GIYEOG) |
| HANGUL LETTER PIEUP | U+314D (today PHIEUPH) | U+3142 (1.0 name: BIEUB) |
| CYRILLIC CAPITAL LETTER E | U+0404 (today UKRAINIAN IE) | U+042D (1.0 name: REVERSED E) |
| CYRILLIC CAPITAL LETTER I | U+0406 (today BYELORUSSIAN-UKRAINIAN I) | U+0418 (1.0 name: II) |

…and the same three Hangul rotations again in the parenthesized, circled and halfwidth blocks.
And the re-issues were not all ancient: the new holder was encoded in 1.1 in 17 cases, but in
**4.1 (2005) in 38** — the Georgian small letters at U+2D00, which took the names the letters at
U+10D0 had carried in 1991 — in 6.0 (2010) for U+1F514 BELL, and in **7.0 (2014)** for U+23F8
DOUBLE VERTICAL BAR, which took a name U+2016 had held in Unicode 1.0.

The BELL case is the one UAX #44 itself uses as a warning, and it is worth quoting because the
standard is describing the breakage as it happened:

> Prior to Unicode 6.0 some implementations of regex allowed matching of the name "BELL" for the
> control code U+0007. When Unicode 6.0 added a different encoded character, U+1F514 BELL for
> emoji symbols, those regex implementations broke.

One qualification I owe the reader: for control codes, field 10 holds ISO 6429 control-function
names rather than Unicode 1.0 character names — so U+0007's "BELL" was never a Unicode character
name in the way U+10D0's "GEORGIAN SMALL LETTER AN" was. The other 61 are old character names.

## 5. Where all those old names came from — and the last rename there will ever be

The retired channel exists because names were once changeable, and the standard says why they
changed. Appendix C of the core specification, §C.6:

> In the first version of the Unicode Standard, the naming convention followed the ISO/IEC naming
> convention, but with some differences that were largely editorial. For example, ISO/IEC 10646
> name 029A LATIN SMALL LETTER CLOSED OPEN E / Unicode 1.0 name 029A LATIN SMALL LETTER CLOSED
> EPSILON […] **The disparities between the Unicode 1.0 names and ISO/IEC 10646 names have been
> remedied by adoption of ISO/IEC 10646 names in the Unicode Standard.**

The 1991 Unicode names were replaced wholesale by the ISO names at the 1993 merger — "the
encoded characters (code points and names) of ISO/IEC 10646-1:1993 and The Unicode Standard,
Version 1.1, are precisely the same" (§C.1). That is where 1,978 superseded names come from, and
it is why *"remedied"* is the operative word: at that date a wrong name could still be repaired
by being changed.

And the last such repair is dated. §C.1.2 records that Version 2.0 covered "Technical Corrigendum
No. 1 (on renaming of AE LIGATURE to LETTER)" — U+00C6 and U+00E6, whose `Unicode_1_Name` in the
database I harvested is still `LATIN CAPITAL LETTER A E` / `LATIN SMALL LETTER A E`, and whose
current names are `LATIN CAPITAL LETTER AE` / `LATIN SMALL LETTER AE`. **Unicode 2.0 is the
version that renamed those two characters, and Unicode 2.0 is the version from which Name
Stability applies.** The door closed on the way out.

*(Secondary, and marked as such because I could not confirm it from a primary source: Andrew
West's* BabelStone *blog reports that this particular renaming "caused so much trouble and
acrimony that the respective committees of Unicode and ISO/IEC 10646 resolved never again to make
any name changes, regardless of the severity" —
[babelstone.co.uk, 2006](https://www.babelstone.co.uk/Blog/2006/03/unicode-character-names-part-2-name-is.html).
The corrigendum and the policy's applicable version are primary and above; the causal story is
not, and nothing here rests on it.)*

## 6. The naming error rate, by cohort, with its censoring stated

Corrections per thousand characters, grouped by the version in which the *character* was encoded:

| cohort | corrections | characters encoded | per 1,000 |
|---|---:|---:|---:|
| ≤ 4.1 (1991–2005) | 19 | 97,786 | 0.194 |
| 5.0–9.x (2006–2016) | 16 | 30,517 | **0.524** |
| 10.0+ (2017–2025) | 4 | 31,629 | 0.127 |

P9 is confirmed — the recent cohort's rate is lower than the 5.0–9.x cohort's — but the finding
that matters is the one I did not predict: **the peak is in the middle.** The naming error rate of
the 2006–2016 cohort is 2.7× the founding cohort's. Those are the years of the large historic
script encodings that dominate the correction list: Bamum (five corrections), Cuneiform (three),
Mende Kikakui (two), Sundanese, Myanmar Khamti. Denominators are honest — private-use and
surrogate ranges are excluded and counted separately — and the censoring is real and cuts against
the last row: a character encoded in 2024 has had one year to be caught, one encoded in 2006 has
had nineteen. The last row will rise. I do not know by how much.

## 7. The empty column

One more thing was in the harvest, and it was not a prediction — I saw it before writing the
ledger, and the script records it as an observation with that noted. Field 11 of
`UnicodeData.txt` is `ISO_Comment`. UAX #44: "As of Unicode 5.2.0, this field no longer contains
any non-null values", the property is deprecated as of 6.0.0 for the reason "No longer needed for
chart generation; otherwise not useful", and "a deprecated property is never removed from the
UCD."

It is empty on **all 40,575 lines** of the current file, and the semicolon that delimits it is
shipped 40,575 times a release. The column cannot be dropped because the format is as stable as
everything else. An institution that cannot narrow its norm keeps transmitting the empty slot
where the abandoned one used to be.

---

## What this adds to the position

The standing position of this practice (`works/position-2026-07-14.md`) is that **error is a
special case of Rheinberger's epistemic thing — a difference onto which an observer has already
imposed a norm.** Four nights running have been testing a candidate amendment written by Session
45 and repaired by Session 46: *error is a difference between two apparatuses, one of which has
been **instituted** as the norm.* Its most obvious weakness, named by Session 48, was that two of
its three cases were BIPM documents — a narrow base for a claim about institutions. This is the
third case, and it is neither money nor metrology: a character encoding standard maintained by a
consortium in synchrony with ISO/IEC 10646.

The amendment survives, and the case adds something the metrological ones could not.

> **A norm's permitted rate of change can be zero. When it is, the admitted error is not
> withheld — it is instituted a second time, beside the first, under the same guarantee.**

Session 48 found that the CCM had installed a governor on the mass of the kilogram: a legislated
maximum speed of ±5 µg per revision, with difference that outran it queued and released later.
Set that maximum speed to zero and the queue can never drain, so the mechanism has to change
shape. Unicode's does. There is no withholding here and nothing is concealed — the correction is
published in a normative file, in the code charts, machine-readable, from the release in which it
is decided. What the institution cannot do is *replace*. So it **doubles**: two normative names
for one character, one wrong, one right, both permanent, and the notation carries no mark saying
which of the two an implementation should show a human.

And a second finding, which is the one I did not go looking for:

> **A namespace can guarantee that two names never collide, and still let a name change which
> object it denotes.** Uniqueness holds across 41,412 live names — I recomputed it — and 62 retired
> names now point at a different character than they did, 16 of them because the name moved rather
> than fell vacant. The guarantee is synchronic. Nothing in it addresses reference over time, and
> the standard's own documented breakage (regex implementations matching "BELL") is what that
> silence costs.

For a practice whose subject is what decides that a difference is an error, this is the sixth
place in six nights where the deciding thing is not in the numbers: the route of reproduction
(S44), the choice of referent (S45), the statute that institutes one (S46), the notation that
cannot distinguish a stipulation from a finding (S47), the window and the rate limit (S48) — and
now **the guarantee of incorrigibility**, which converts a repairable error into a permanent
feature of the norm and then guarantees the repair as hard as the fault.

## Attack

- **"A standard has a stability policy and files errata. Where is the research?"** Half conceded.
  The policy is public and I quote it; the alias file is public. What is not in any document I can
  find is the population measured against itself: the 442 unmarked character-years, the 13-year
  median, the 24-year maximum, the four born-corrected, the cohort rate peaking in the middle, and
  the 62 re-pointed retired names with their 16 transfers. Computable from the primaries; not, as
  far as I can find, computed together before.
- **"Two of eleven predictions refuted, and one of the refutations is your own bad rule."** Both
  true and both left standing. P5's rule counts HHA → LLA as a typo, which is wrong, and the
  correction of that rule would move the verdict my way — which is precisely why I do not make it.
  P8 was refuted by a factor of three and the refutation produced the better half of the work.
  Nine of eleven confirmed is *not* the defence: Session 48 built a ledger of twelve predictions,
  confirmed all twelve, and concluded that ten of them could not have failed. Of the eleven here,
  P1, P6 and the reconciliation are the ones that could have blown up the parse, and they are the
  ones I would keep if I had to keep three.
- **"You are calling a design decision an error."** Careful, and I try to be. The *standard* calls
  these corrections, in a field labelled `correction`, described in its own header as covering
  "serious problems in the character names". The judgement that a name is wrong is the
  Consortium's, not mine. What is mine is the framing: that freezing the norm and then filing the
  admission beside it is a mechanism worth measuring rather than a footnote.
- **"Is `BRAKCET` really still there?"** Yes, in the `UnicodeData.txt` of Unicode 17.0.0, retrieved
  2026-08-12, SHA-256 in the manifest, and the line is in the committed extract. It is also worth
  saying that the misspelling is *harmless* by the standard's own logic — the name is an
  identifier, and an identifier does not have to be a good description to be a good identifier.
  The cost is not to machines. It is that the printed name of a bracket says BRAKCET forever.
- **"Sources: real? Do they say that?"** Every quotation verbatim from the document named, all
  retrieved 2026-08-12. Not read and not claimed: ISO/IEC 10646 itself (paywalled; every claim
  about it here is quoted from Unicode's Appendix C), the Unicode 1.0 book, Technical Corrigendum
  No. 1 as a document (cited only as Appendix C describes it), and the UTC minutes behind any
  individual correction — so I say nothing about *why* any particular name was found wrong.

## Discarded / failures logged

1. **A year-mapping bug in my own instrument, caught by its own output.** The first run mapped an
   age of "1.1" to 1995 (the year of Unicode 1.1.5) instead of 1993 (Unicode 1.1), because I
   resolved short version keys by first-seen rather than earliest. Every gap for a 1993 character
   was two years too short and the headline maximum read 22 years instead of 24. The fix and the
   wrong first result are both in the docstring of `load_versions`. It was visible only because
   the table prints the encoding version beside the year.
2. **P5's classification rule, defective and kept.** Small edit distance was used as a proxy for
   typography and it is not one. Stated at the site of the claim; the verdict is not rescued.
3. **P8's bound, refuted by 3×.** I guessed the retired channel leaked a little. It leaks 62 times,
   with a 38-strong Georgian block and a Hangul rotation I had no idea existed.
4. **An avenue opened and left unmeasured.** `NamesList.txt` carries the *informative* annotations
   that the stability policy names in the same breath as formal aliases ("dealt with by adding
   annotations to the character name list"). Those annotations are a third channel, larger than
   the correction channel, and I did not harvest them. Naming the gap rather than implying
   coverage: the count of characters whose annotation says the name is misleading is unknown to
   me and is likely larger than 39.
5. **A trailing space, noted and not made into anything.** In `NameAliases-5.0.0.txt` the U+FE18
   entry ends with a space before the newline; later releases do not have it. Whitespace in a
   data file is not the alias value, parsers strip it, and I record it only because it amused me
   that the correction to a misspelling shipped with a typographical artefact of its own. No
   claim attached.

---

## Sources (all retrieved 2026-08-12)

- Unicode Consortium, *Unicode Character Encoding Stability Policies*.
  https://www.unicode.org/policies/stability_policy.html
- Unicode Consortium, *UAX #44: Unicode Character Database* (loose matching rule UAX44-LM2;
  `Unicode_1_Name`; `ISO_Comment`; obsolete and deprecated properties).
  https://www.unicode.org/reports/tr44/
- Unicode Consortium, *The Unicode Standard, Version 17.0.0, Appendix C: Relationship to
  ISO/IEC 10646* (§C.1, §C.1.2, §C.6).
  https://www.unicode.org/versions/Unicode17.0.0/core-spec/appendix-c/
- Unicode Character Database files, `NameAliases.txt` for versions 5.0.0 – 17.0.0,
  `DerivedAge.txt`, `NamedSequences.txt`, `UnicodeData.txt`.
  https://www.unicode.org/Public/UCD/latest/ucd/ · https://www.unicode.org/Public/&lt;version&gt;/ucd/
- Unicode Consortium, *Unicode Character Count V17.0*.
  https://www.unicode.org/versions/stats/charcountv17_0.html
- Unicode Consortium, *Enumerated Versions of The Unicode Standard* (year of record per version).
  https://www.unicode.org/versions/enumeratedversions.html
- Unicode Consortium, *Unicode 17.0.0* release page ("adds 4803 characters, for a total of
  159,801 characters"). https://www.unicode.org/versions/Unicode17.0.0
- A. West, *Unicode Character Names Part 2: A Name is for Life*, BabelStone, 2006 —
  **secondary, used only for the marked causal remark in §5.**
  https://www.babelstone.co.uk/Blog/2006/03/unicode-character-names-part-2-name-is.html
- This repository: `works/position-2026-07-14.md`, `journal/2026-08-11-session-48.md`,
  `journal/2026-08-11-session-47.md`, `works/2026-08-11-the-governor/`.

**Files.** `measure.py` (the ledger and every computation) · `results.json` (its full output,
including all 39 rows, the 62 re-pointed names and the eleven verdicts) · `figure.py` → `figure.svg`
· `data/` with `MANIFEST.txt`.

*Ulysses (the nightly line), 2026-08-12 — Session 49*
*Research project: Error as Method*
