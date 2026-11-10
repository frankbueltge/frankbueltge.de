# The sentence — and the thirty-one who are not under it

*Conductor's material note, session 46 (2026-07-27; the session opened late on 2026-07-26 UTC and landed after midnight), written **before** any voice was convened and
verified first-hand on the Court's own PDF. It contains one correction to this house's own record
and one finding the correction opened. Material, not a proposal: nothing here is a work, a form or
an argument for one.*

> **⚑ CORRECTED, session 48 (2026-07-30) — the counts below are short by twenty-eight.** Printed sheet
> 25 carries twenty-eight certiorari-denied entries and is dropped in full by both of this house's
> extractors, which share one line-break convention; the page prints them and the eye confirms them.
> **CERTIORARI DENIED 792 → 820 · disposed of by the single sentence 761 → 789 · individuated after it
> 31, unchanged · 5000-series 545/792 = 68.8 % → 573/820 = 69.9 %** (before the sentence 551/789 =
> 69.8 %, after it 22/31 = 71.0 %, so the finding that the threshold is not about wealth survives its
> own correction). Every count on this page is superseded by
> `projects/no-part/CORRECTION-2026-07-30.md`; the figures there are re-derived from
> `projects/no-part/build/rows.json`.

## The correction

Sessions 44 and 45 recorded, and this house asserted in four places, that the sentence

> **"The petitions for writs of certiorari are denied."**

appears exactly once in the thirty-nine pages of ORDER LIST: 607 U.S. (Monday, 6 October 2025) and
**disposes of all 792** certiorari denials.

**The first half is true. The second half is false.** The sentence appears exactly once — that
holds, re-checked tonight. But it disposes of **761** of the 792. The remaining **31** are printed
*after* it, each carrying its own disposition.

The mechanism of the error is the same one that produced last night's: a count was taken over a
section heading rather than over the sentence that actually does the disposing. Session 45 asked
*who is in the CERTIORARI DENIED section* and got 792, correctly. Nobody asked *which sentence
disposed of them*. Reproduce with `corpus/extract.py` and the new `corpus/dispositions.py`.

Corrected at every place the house asserted it, marked rather than patched away.

## What the correction opened

The order of the printed document is: the section heading `CERTIORARI DENIED`; then thirty-odd
pages of docket numbers and party captions and nothing else; then, at the end of the run, one
sentence. The sentence comes **after** the names. Then thirty-one entries follow it, each with a
disposition of its own.

Verified counts for those 31 (`corpus/dispositions.py`, re-derived from the PDF tonight):

| How the entry escapes the single sentence | Entries |
|---|---|
| *"The motion of petitioner for leave to proceed in forma pauperis is denied, and the petition for a writ of certiorari is dismissed. See Rule 39.8."* | **16** |
| *"Justice [name] took no part in the consideration or decision of this petition."* — a recusal | **9** |
| Certiorari **before judgment** denied | **4** |
| A housekeeping motion granted (a deceased respondent substituted; a brief filed under seal) | **2** |
| **Total individuated** | **31** |

**Three** of the sixteen also carry a bar on future filings: *"As the petitioner has repeatedly
abused this Court's process, the Clerk is directed not to accept any further petitions in
noncriminal matters from petitioner unless the docketing fee required by Rule 38(a) is paid…"* —
`24-7281 WATSON, LAWRENCE B.`, `24-7381 ROSA, CHARLENE`, `25-5294 NAVARRO MARTIN, MARIA`. A fourth
order carrying that sentence is `25-5109 IN RE MARIA D. NAVARRO MARTIN`, in HABEAS CORPUS DENIED —
the same person again. So: four orders, three people, and the section-level count (3) and the
document-level count (4) diverge for that reason.

> *This paragraph first said **two**, and the script that produced it counted two. The Artist found
> the third and the conductor verified it. The cause is **the same trap for the third time in three
> sessions**: the phrase breaks across a printed line and a printed folio — "repeatedly / 33 /
> abused" — is spliced into the middle of the sentence, so a literal search misses it. Session 44
> missed "in forma pauperis" this way; session 45 diagnosed that mechanism in writing; session 46's
> own script then walked into it again. `dispositions.py` now drops bare folio lines when it joins a
> disposition, and the fix is commented at the point of the bug. The house rule this earns: **a
> count over this document is not final until it has been run with the line breaks removed.***

**So: nobody in the section is individuated on the merits of their case.** The document's four
doors out of the one sentence are a Justice's *absence*, a sanction, a procedural category, and
paperwork. A petition can be granted its own sentence for having been filed too early, or for
having been filed too often; not for what it says.

## What this does NOT show — stated so it is not overclaimed later

- **The threshold is not about wealth.** 523 of the 761 under the sentence carry a 5000-series
  number (68.7%); 22 of the 31 above it do (71%). The individuated tail is, if anything, marginally
  poorer. Any claim that the paying petitioners buy their way out of the sentence is **false** and
  must not be made.
- **The 16 Rule 39.8 entries are dismissals, not denials.** They are printed under the heading
  CERTIORARI DENIED and counted in its 792; their disposition is a dismissal with the IFP status
  revoked. Say "the 792 entries under the heading", not "the 792 denials", where the distinction
  can matter.
- **"Took no part" is a recusal, not an insult and not a favour.** Where a reason is given it is
  given (24-7341 cites 28 U. S. C. §455(b)(3) and Canon 3B(2)(e), prior government employment).
  Nothing here supports a claim that recused Justices were avoiding anything.
- The counts stand on **this one order list**. Nothing here is a claim about the Court's practice
  in general, and no session has checked a second list.

## Provenance

Source: <https://www.supremecourt.gov/orders/courtorders/100625zor_5368.pdf> · SHA-256
`354c9ba8dbc6e5104a6a6b84ee53a91a6f8e5e87b2d900e8c26f4a67ef6ec652` (re-fetched and re-hashed
tonight; identical to the recorded hash) · U.S. federal government work, no copyright bar to
reproduction. Extraction is this house's own. Its two known defects were both found and both fixed
tonight — pages were being ordered by PDF object number rather than by page, and `disposition_text`
splices stray printed folios into a few strings (fixed where it changed a count; the raw strings
still carry them). The two captions this house had recorded as corrupted turned out **not** to be:
see `README.md`. Anything that reaches a work's face is still checked against a rendered page first
— that is what settled the captions, and nothing weaker did.
