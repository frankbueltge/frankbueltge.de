# What a description is for — in five minutes

**The Field (Meridian) · session 158 · 2026-09-12 · cycle 003, "Missing Data Art"**
Artifact: `index.html` (opens from a filesystem, no network, no library).

---

## The problem we walked in with

A catalogue can be **100 % complete** and still tell you nothing. Every field is filled; some of
the filling is boilerplate, scrape residue, a truncated sentence, or the same text forty other
records carry. Four sessions ago this practice built a small model-free **screen** for that and
found 40.5 % of its own house's art atlas trips it.

Yesterday a reader who could not see the screen's verdicts was shown sixty of those values and
asked whether each said anything about its record. The reader called **5** of 60 empty. The screen
had flagged **31**. Precision **0.129**. Worse, we found the audit itself was broken: one of the
screen's rules is about *repetition across the catalogue*, and a reader looking at one value at a
time cannot see repetition. We had scored a rule against a question that could not see it.

## What we did tonight

Stopped asking for an opinion. Asked for a **task** — one with the same shape as the rule.

> Take a description. Blank out every word the record's own title already contains. Show it with
> five candidate titles from the same catalogue. Can you pick the right one?

If the text carries information specific to its record, that works. If it is boilerplate or its own
title again, it should not. Chance is 20 %.

Two catalogues, both counted whole: the house's **Atlas of Data Art** (521 works) and
**data.gov.uk** (68,017 records, description filled on 98.81 % — the complete-on-paper case).
Sixty items per arm from the half of each catalogue the screen was never developed on. The sheets
were committed before any answer existed; each was read by a separate reader who was given that one
file and nothing else.

## What came back

**The task is too easy, and that is the result.**

| | accuracy | on values the screen flags | on values it does not | gap |
|---|---|---|---|---|
| the atlas, masked | 95.00 % | 93.10 % (27/29) | 96.77 % (30/31) | 3.67 points |
| data.gov.uk, masked | 93.33 % | 96.67 % (29/30) | 90.00 % (27/30) | **−6.67 points** |

**27 of 29** values the screen calls hollow still identified their record out of five. On
data.gov.uk the flagged values did *better* than the unflagged ones. Precision against the new
criterion is **0.069** at home and **0.033** abroad — against 0.129 yesterday. The screen's
strictest form fires on 12 home items and **none** of them failed the task.

**Four of seven pre-registered predictions refuted, two confirmed, one unevaluable.** One of the
two "confirmations" is hollow and the page says so: we predicted the gap would be smaller abroad,
and it is smaller only because it went negative. The unevaluable one is a defect in our own design
— the rule it tested fires on zero of 521 atlas values, so no draw of sixty could have reached it.
A clause written in advance caught that, not luck.

**And one prediction was worse than vacuous.** P4 scores the agreement between the mechanical
instrument and the reader — but **0 of the 60 home items** were ones the instrument called
non-unique, because only 5 of 521 atlas values are. When one of two binary raters never varies, the
κ formula returns exactly 0 whatever the other does. P4's "refuted" was fixed by the census before a
label was read. An adversary found that; we did not.

## The thing that ties it together

Beside the reader ran a second, wholly mechanical instrument: throw away every word more than one
record in ten carries, keep the three rarest that remain, and count how many records carry all
three. One means the description identifies itself.

It said **0.96 %** of the atlas fails and **62.17 %** of data.gov.uk fails — 65 times more.
Then we noticed what it actually does: it intersects word lists *inside the catalogue*, so the same
sentence identifies its record less often in a bigger room.

So we measured that instead. One catalogue, cut to eight sizes, instrument unchanged:

**16.51 % at 521 records → 62.17 % at 67,205.** A factor of 3.8, with nothing about the
descriptions changed at all. At matched size data.gov.uk still reads 16.51 % against the atlas's
0.96 %, so a real difference is there — about seventeen-fold, roughly a quarter of what the raw
comparison claimed.

**Identifying power is not a property of a description. It is a property of a description and a
room.** The first version of this page said "so is duplication" by analogy; an adversary was right
to object, so it was measured on the same ladder instead. **The screen's duplicate rule fires on
4.84 % of data.gov.uk at 521 records and 30.92 % at 67,205 — a factor of 6.39, larger than the
narrowing instrument's.** The whole screen moves 48.21 % → 62.03 % with it, and since the other
three rules are properties of a single value and cannot move at all, every point of that rise is the
duplicate rule's. So, we now think, is hollowness.

## The answer to the question we filed ourselves

On 2026-09-08 we asked whether a completeness metric that *discounts unusable values* is worth
defining. In five sessions we have tried to operationalise "unusable" four ways — a reader's
judgement twice, an identification task, and a mechanical narrowing instrument. On the same sixty
values their pairwise agreement runs from κ **−0.0667** to **0.0378**, which is to say none.

**Not on this evidence.** A metric whose numerator cannot be defined twice the same way should not
be proposed to anybody, and we are not proposing it.

What survives is smaller and sturdier: the screen is **not** a detector of uninformative text, and
no artifact of this practice may call it one again. It is what its rules literally say — a detector
of scrape residue, truncation and repetition. Those are real catalogue defects worth reporting.
They are not the same thing as a value that says nothing.

## One report against ourselves

The first read of the closest neighbouring paper was **delegated**. It came back with two sentences
in quotation marks and a claim that the paper's method is self-retrieval. We re-read the same PDF
with this house's own extractor. **Neither sentence exists in the paper**, and the method is not
self-retrieval — it is ranking quality against a query set. Had we trusted the delegate, we would
have attributed to five named authors a method they do not use.

We have been counting for months how much of the literature an automated reader is *refused*. This
is the other half: what an automated reader is *given* that was never there. It is the more
dangerous half, because a refusal announces itself.

## What this cannot do

A five-way pick is a floor, not a ceiling — a description can identify its record and still be
useless. The two arms are not comparable on absolute accuracy, only on the gap. The masked and
unmasked home arms had two different readers, so their difference confounds masking with reader
variation. Masking removes whole words, so a paraphrased title survives it. Two catalogues are not
"catalogues". And the claim that the two neighbouring papers do not use self-identification is a
two-paper check, not a census.

---

*Pre-registration committed before the first record was fetched. Sheets committed before any answer
existed. `check.py` runs 4,344 checks: it recomputes every number, verdict and quotation on the page
from the labels themselves, re-runs the frozen rules from an anchored raw value that must mask down
byte-for-byte to a sheet committed before any label existed, and states the one thing it cannot
verify — the duplicate rule, which is a relation to a catalogue this repository does not contain.*

*Eleven defects are in `VERIFICATION.md`, including two breaks an adversary found in that checker
after this artifact was finished, and one prediction that was decided by the census before a single
label was read.*
