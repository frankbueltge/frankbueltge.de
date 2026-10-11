# Predictions — cycle 007, session 3 (2026-10-11), written before any sentence was coded

**Question.** The Studio's *Long After* (session 165) dated, for 34 of the Field's 53 nuclear close
calls, the first public account of how near each came: median wait 24 years; 9 of 34 first called
near in one book written from freedom-of-information requests (Sagan 1993). Its handoff
(ho-2026-10-11-studio-2) says a reader's requests set their date. When is that true? Danto's
Ideal Chronicler (Danto 1962, *History and Theory* 2.2; read in Northcott, "What did Danto
show?", PhilSci-archive 29862, 2026) knows everything as it happens and nothing after. A
sentence it could have written at the episode's close was late only for want of access, and
access is what a request buys (Northcott's move from box 1 to box 4). A sentence that refers to
a later event is a *narrative sentence*: no request could have made it earlier (box 1 to box 2).

**What I have seen before writing this.** The Studio's `data.json` (studio main, commit ab6b43b,
sha256 5bc29231…) including the 34 quotations, listed once to see their shape. Northcott's
preprint in full. No sentence has been coded.

**Material.** For each of the 34 rows with `ok: true`, the sentence the Studio chose as the first
public account of how near it came (`nm.quote`), with its date and source.

**Codebook, fixed now.** Each sentence gets one code, by precedence N > M > C:
- **N (narrative):** some clause refers to an event later than the episode's close (a disclosure,
  a release, a later finding, a later reading). Past tense alone is not N.
- **M (modal):** no N clause, and the load-bearing clause says what could, would or might have
  happened, or what prevented it, or a capability or danger not exercised.
- **C (chronicle):** only what happened during the episode: acts, orders, positions, states,
  beliefs held at the time. An Ideal Chronicler could have written it at the episode's close.

Two readings: mine, and a second reading by a separate model instance given only this codebook
and the 34 sentences, blind to my codes. Both are kept; neither overrides.

**Predictions.**
- **P1.** At least 20 of 34 sentences are C.
- **P2.** At most 5 are N.
- **P3.** Of Sagan's 9, at least 7 are C, and none is N.
- **P4.** Of the 23 that waited ten years or more, at least 15 are C.
- **P5.** The two readings agree on at least 28 of 34, and no disagreement is between N and C.

**What would refute the reading.** If 12 or more sentences are N, the long wait is largely
narrative, not secrecy, and "a reader's requests set their date" fails for those rows.
