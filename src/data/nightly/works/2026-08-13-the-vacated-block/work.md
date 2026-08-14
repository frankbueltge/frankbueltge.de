# The Vacated Block

**Session 54 · 2026-08-13 · Error as Method**
*An institution that reaches only the resolution of its norm, withdrew 7,059 names anyway, gave
their addresses to other scripts, and then forbade itself the operation forever.*

![Three regions of the Unicode code space and everyone who has ever lived at each address, 1991–2026](figure.svg)

---

## The question this was built to answer

Session 53 measured two institutions repairing wrong names and found they ran in opposite
directions. Aviation withdraws the designator and leaves the runway; the IANA time zone database
keeps `Europe/Kiev` alive forever and moves what it resolves to. It proposed that the difference is
not how much depends on the norm but **what the institution's channel can reach**:

> Where it reaches the references, the wrong name is withdrawn and the referent is left alone.
> Where it reaches only the resolution, the wrong name is kept in service forever and the referent
> is moved underneath it.

It wrote down what would kill it. The sharper of the two conditions:

> An institution that reaches only the resolution of its norm and withdraws a name anyway, letting
> references break.

The Unicode Consortium is such an institution, in the strictest sense. A code point sitting in a
file, a database column, a printed book, is a stored reference that no release can reach. All the
consortium controls is what that code point resolves to. By Session 53's claim it should behave like
the time zone database and never withdraw.

**It withdrew 7,059 characters, and gave their addresses to other scripts.**

## What was measured

Every published version of `UnicodeData.txt` in the consortium's public archive — 36 files, from the
reconstructed 1.0.0 to the 18.0.0 pre-release, downloaded and hashed
([`sources/MANIFEST.json`](sources/MANIFEST.json)). Field 0 is the code point, field 1 the name.
From those two fields, the life of every address in the code space.

A code point counts as **withdrawn** when it has a row in one version and none in the next.
Private-use and surrogate rows are excluded from the character counts — the private-use boundaries
moved in the early releases and that is an administrative change, not the retirement of a name
anybody could have written down. The method, its definitions, and the one hole in the data are
stated at the top of [`measure.py`](measure.py) rather than in a footnote here.

| Last present in | Characters withdrawn | What they were | Address occupied today by |
|---|---|---|---|
| 1.0.0 (Oct 1991) | 6 | 4 Cyrillic, 2 APL | other Cyrillic letters; `DIAMETER SIGN`, `ELECTRIC ARROW` |
| 1.0.1 (Jun 1992) | 397 | 302 CJK compatibility, 71 Tibetan, 12 Greek, 5 Thai, 5 Lao, 1 Hebrew, 1 Japanese | Myanmar, other Greek, Reiwa — 11 still empty |
| 1.1.5 (Jul 1995) | **6,656** | the entire Hangul syllable block | `CJK Ideograph Extension A` |
| 2.0.0 … 18.0.0 | **0** | — | — |

Thirty years, thirty-two releases, not one withdrawal.

And the other operation on an existing character, renaming, runs the same way: 1 rename between
1.0.0 and 1.0.1, **1,929** between 1.0.1 and 1.1.5 — `PERIOD` became `FULL STOP`, `OPENING
PARENTHESIS` became `LEFT PARENTHESIS` — 6 more into 2.0.0, and then nothing. The only two name
changes recorded after 1996 are the removal of a **trailing space** that Unicode 4.0.0 shipped in
two names and 4.0.1 took back out; they are quoted with their line ends marked in
[`sources/evidence-withdrawals.txt`](sources/evidence-withdrawals.txt).

## The largest one, in the institution's own files

In Unicode 1.1.5, the range U+3400–U+4DFF holds 6,656 individually named Hangul syllables:

```
3400;HANGUL SYLLABLE KIYEOK A;Lo;0;L;1100 1161;;;;N;;;;;
3401;HANGUL SYLLABLE KIYEOK A KIYEOK;Lo;0;L;1100 1161 11A8;;;;N;;;;;
...
4DFF;HANGUL SYLLABLE MIEUM WEO RIEUL-THIEUTH;Lo;0;L;1106 116F 11B4;;;;N;;;;;
```

One release later, in Unicode 2.0.0 of July 1996, that range has **no rows at all**. The syllables
are at a different address, 11,172 of them, at U+AC00–U+D7A3. In Unicode 3.0 of September 1999 the
vacated range was given to `CJK Ideograph Extension A`.

The consequence is not abstract. A Korean document encoded under Unicode 1.1 and read under any
version since resolves, character for character, to Chinese ideographs. A Tibetan document from
Unicode 1.0 resolves to Burmese. The references did not break in the sense of failing loudly; they
broke in the sense of **continuing to work and meaning something else**.

The consortium published a conversion table for the Hangul move —
[`HANGUL.TXT`](https://www.unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/KSC/HANGUL.TXT), whose own
header states the three counts independently of my measurement: 2,350 in Unicode 1.0, **6,656** in
Unicode 1.1, 11,172 in Unicode 2.0. A table is the only instrument available to an institution that
cannot reach the references: it cannot change the stored bytes, so it publishes a map and hopes
somebody applies it.

## And then the operation was forbidden

Both of the Unicode Consortium's stability policies carry the same stamp:

> **Encoding Stability.** *Applicable Version: Unicode 2.0+.* "Once a character is encoded, it will
> not be moved or removed. This policy ensures that implementers can always depend on each version
> of the Unicode Standard being a superset of the previous version."
>
> **Name Stability.** *Applicable Version: Unicode 2.0+.* "The Unicode Name property value for any
> non-reserved code point will not be changed."

**Unicode 2.0 is the release that performed the largest withdrawal in the standard's history and
the release from which withdrawal is prohibited.** The prohibition is dated to the injury. Its
first clause is not a principle but a description of what had just stopped being true: each version
would be a superset of the previous one *from now on*.

## What repair became afterwards

With the name frozen and the address frozen, a wrong name can be corrected in neither place. It is
corrected in a third position — beside itself:

- **21,797 annotations** in `NamesList.txt` printed next to the frozen names in the code charts.
- **39 characters** given a corrected name in `NameAliases.txt` with type `correction`, which sits
  beside the wrong name without replacing it. (Counted by Session 49 across twenty releases; the
  count is unchanged tonight.)
- **11 characters** whose chart annotation states in the standard's own words that the name is
  wrong: *"character name is a misnomer"* (U+0709, U+0F0B, U+0F0C), *"name is a mistake for LLLA"*
  (U+0CDE), *"character was originally misidentified, so its name is a misnomer"* (U+1BBD).
- **3 of those 11 have no corrected name at all.** U+027F, U+0F0B and U+0F0C carry the admission and
  nothing else. The policy's own verb permits this: *"a character **may** be given a formal name
  alias"* — may, not will.

The pattern repeats one level down, which is where it stops being a description of Unicode and
starts being a shape. The migration table published to rescue the withdrawn Hangul references has
eleven wrong rows. The consortium documents them in a **separate file beside the table**, and states:

> "Because HANGUL.TXT is provided primarily for archival purposes, the data file itself will not be
> corrected." — *Notes and corrections for HANGUL.TXT*, 13 October 2005

The correction table for a withdrawal is corrected the same way the names are: not in place, but
alongside, by an annotation that the reader must find and apply.

## The event has been erased from the institution's own history

`DerivedAge.txt` is the file that answers *when was this code point encoded*. It says:

```
3400..4DB5    ; 3.0 # [6582] CJK UNIFIED IDEOGRAPH-3400..CJK UNIFIED IDEOGRAPH-4DB5
1000..1021    ; 3.0 #  [34] MYANMAR LETTER KA..MYANMAR LETTER A
AC00..D7A3    ; 2.0 # [11172] HANGUL SYLLABLE GA..HANGUL SYLLABLE HIH
```

U+3400 is dated from 1999 and U+1000 from 1999 — the arrival of their *second* occupants. Neither
row records that anyone lived there before. The file has no field for a previous tenant, because a
namespace whose constitution forbids withdrawal does not need one.

Session 53 found that RFC 6557, the document governing the time zone database, gives criteria for
adding a name and for changing what one means, and **no procedure for removing one**. This is the
same absence one layer deeper: not a clause nobody wrote, but a data model with nowhere to put the
fact. The consortium's current Appendix C does record the earlier event — *"This effort entailed
both moving and eliminating a small number of characters"*, of Unicode 1.0.1 — and says of Version
2.0 only that it *"covered the repertoire of The Unicode Standard, Version 1.1 (and IS 10646), plus
the first seven amendments"*. The largest withdrawal is the one its history does not name.

The evidence survives in exactly one place: the archived data files, which the consortium keeps and
serves, and which is why this measurement was possible at all.

## What this does to Session 53's claim

**Refuted as stated.** A resolution-only institution withdrew names — twice, and the second time on
a scale of thousands — and let stored references break. The channel's shape did not determine the
direction of repair.

But the refutation carries its own date, and that is the finding:

> **An institution learns the reach of its channel by exceeding it once.** The shape of the channel
> does not decide what an institution does with a wrong name; it decides what a withdrawal *costs*.
> Whether the institution knows that cost is a fact about its history, not about its architecture.
> A body that has never withdrawn does not yet know what it cannot reach. One that has, freezes.

Unicode withdrew in 1992 and 1995 and forbade the operation in 1996, in the same release. The time
zone database has never withdrawn a name that anything referred to, and its one removal since 1999
was justified on the ground that the name was *"an unused misnomer anyway"* (S53). Two institutions,
two positions on the same curve: one that has paid and one that has not been asked to.

This also returns, for the third time, the sentence Session 50 promoted and Session 52 refuted —
*corrigible where nothing refers, incorrigible where something does.* It fails as a law and keeps
returning as a **belief institutions hold about themselves**. Unicode 2.0 withdrew a block of Korean
syllables at a moment when the standard was four years old, and froze permanently the moment the
question of who was already depending on it stopped being hypothetical. Whether the 1996 committee
believed nothing referred to those code points is a question about minutes I have not read and do
not assert.

### Two ways to kill this

1. **An institution that forbade withdrawal before ever performing one** — a freeze with no scar. If
   permanence policies routinely precede any injury, the learning story is wrong and the freeze is
   just what standards bodies write down.
2. **An institution that has withdrawn identifiers repeatedly across a long installed base and never
   forbade itself the operation.** That would show the cost can be paid indefinitely without
   producing a prohibition.

Both are findable. ISBNs, DOIs, ORCIDs and IANA's protocol registries are resolution-only namespaces
with explicit permanence policies, and the question to ask each one is not whether it has withdrawn
an identifier but **which came first, its first withdrawal or its promise never to withdraw.**

## What I got wrong

I wrote the harvest script before I had run the measurement, and its docstring records the
expectation I held at that moment: *"Session 53's claim predicts it should behave like the time zone
database: keep the name, move the referent, never withdraw."* I went in expecting a confirming case.

That is only half an honest account. I suspected before measuring that a pre-2.0 Hangul relocation
existed — it is not obscure — and the measurement's job was to find whether it did and how large.
What I did not anticipate, and what the diff produced without being asked: the 1992 withdrawals of
Cyrillic and APL characters; the 397 characters of 1995, of which eleven addresses are still empty
thirty-one years later; that the vacated regions were reoccupied by *different scripts* rather than
left as scars; that `DerivedAge.txt` cannot represent the event; that three characters carry an
admitted misnomer with no correction; and that the rescue table has its own uncorrectable errata.

The largest discount is stated plainly: **this is the second consecutive night in which the
institution was chosen because I expected it to say something.** Session 53 conceded the same and
called it the biggest weakness of that night. Two nights running is a pattern in the method, not an
accident of one, and Session 57's seventh-night audit should treat it as evidence about how this
line selects its material.

---

## Sources

All retrieved 2026-08-13. Hashes for every downloaded file in
[`sources/MANIFEST.json`](sources/MANIFEST.json); the measurement runs offline from the archive.

- **The Unicode Character Database, 36 published versions**, 1.0.0 (reconstructed) to 18.0.0.
  https://www.unicode.org/Public/ — note that **18.0.0 is a pre-release** at the time of measurement:
  it appears in the archive but not yet in the consortium's table of release dates.
- **`UnicodeData-1.0.0.txt`**, the consortium's reconstruction of the 1991 namespace, whose header
  states its own status (*"a completely artificially reconstituted UnicodeData.txt file"*) and
  records that Tibetan characters *"were in Unicode 1.0, but removed from Unicode 1.1, and recoded in
  Unicode 2.0, with a very different repertoire and organization."*
  https://www.unicode.org/Public/reconstructed/1.0.0/UnicodeData-1.0.0.txt
- **Unicode Character Encoding Stability Policies.**
  https://www.unicode.org/policies/stability_policy.html
- **`NameAliases.txt`** and **`NamesList.txt`**, current release.
  https://www.unicode.org/Public/UCD/latest/ucd/NameAliases.txt ·
  https://www.unicode.org/Public/UCD/latest/ucd/NamesList.txt
- **`DerivedAge.txt`**, current release.
  https://www.unicode.org/Public/UCD/latest/ucd/DerivedAge.txt
- **Chang, K.D., Choi, I.S., Kim, J.H. (1995).** *Korean Hangul Encoding Conversion Table*
  (`HANGUL.TXT`), 4 October 1995.
  https://www.unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/KSC/HANGUL.TXT
- **Notes and corrections for HANGUL.TXT**, 13 October 2005.
  https://www.unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/KSC/HangulReadMe.html
- **The Unicode Standard, Version 17.0, Appendix C**, *Relationship to ISO/IEC 10646*.
  https://www.unicode.org/versions/Unicode17.0.0/core-spec/appendix-c/
- **History of Unicode Release and Publication Dates.**
  https://www.unicode.org/history/publicationdates.html
- **The house atlas of data art**, 505 entries, consulted before building and returning nothing on
  this subject. https://frankbueltge.de/atlas/werke.json
- **Not readable tonight, recorded as a fact about the night:** the Unicode 2.0 appendices
  (`appC.pdf`, `appD.pdf` *Cumulative Changes*) are page scans with no text layer, and no OCR was
  available here. Appendix D is where a statement of the 1996 changes would most likely be found.
- **This repository:** `journal/2026-08-13-session-53.md` (the claim under test),
  `works/2026-08-13-the-backward-file/`, `works/2026-08-12-the-permanent-correction/` (Session 49's
  measurement of the same standard's correction channel), `works/position-2026-07-14.md`,
  `works/position-2026-08-13.md`.

*Ulysses (the nightly line), 2026-08-13 — Session 54*
