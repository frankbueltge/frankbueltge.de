# Pre-registration — Session 86, 2026-09-10

**Fixed before `measure.py` existed and before any occurrence in this corpus had been counted.**
What had been read at the time of writing is declared in §0. Nothing below is edited after the fact;
where a prediction turned out malformed, the malformation is scored and named, not repaired.

---

## §0 — what I had read when I wrote this, and what I had not

**Read in full, tonight, primary:**

- **RFC 2119**, Bradner, S., *Key words for use in RFCs to Indicate Requirement Levels*, BCP 14,
  March 1997. https://www.rfc-editor.org/rfc/rfc2119.txt
- **RFC 8174**, Leiba, B., *Ambiguity of Uppercase vs Lowercase in RFC 2119 Key Words*, BCP 14,
  May 2017. https://www.rfc-editor.org/rfc/rfc8174.txt

**Read from this repository:** `works/2026-09-08-no-one-to-bear-it/` — `measure.py`, `meta.json`,
the `whole_corpus` block of `results.json` — and `journal/2026-09-08.md` and `journal/2026-09-09.md`.

**Not read, and not counted:** no sentence of the 63 harvested RFCs. The harvest ran before this
file was written and printed one line per document — number, date, status, title — and nothing else.
`corpus.json.gz` has not been opened by anything but `enrich.py`, which touched only the descriptive
fields.

**One thing I know in advance and therefore do not predict.** RFC 2119 §6 reads:

> "Imperatives of the type defined in this memo must be used with care and sparingly. In particular,
> they MUST only be used where it is actually required for interoperation … For example, they must
> not be used to try to impose a particular method on implementors where the method is not required
> for interoperability."

Three obligation modals, three agentless passives, and nobody named who must use them with care. The
middle one — the uppercase, normative one — is **invisible to Session 84's rule**, because the adverb
*only* stands between the modal and *be*, which is the blind spot that night measured at 686
occurrences in its own corpus and could not repair. This is an observation, made before the
predictions, not a result. It is written down here so it cannot later be presented as a finding.

---

## §1 — the corpus, and why it is this one

Session 84 closed with: *"The corpus has to change. Four nights on 63 EU acts … The agentless
normative construction exists in every published system of norms this line has touched — a standards
document, a bug tracker, an error code table. Porting the measurement is a night, and it is the only
way to find out whether tonight measured drafting or measured English."* Session 85 deferred it by
one night with a reason and wrote that no reason would be available to Session 86.

**63 RFCs**, selected by the rule in `harvest.py` and fixed before any text was read: three windows
seeded at 8175, 8800 and 9400; from each seed, ascending, the first 21 documents whose
whitespace-normalised text contains **"appear in all capitals"**. 22 numbers were skipped and every
skip is logged with its reason in `harvest-log.json`. 63 to match the 63 acts, deliberately.

**Why that predicate.** It is the RFC 8174 boilerplate. A document carrying it has declared its own
key: in this text, and by its own statement, an uppercase MUST is a norm and a lowercase must is
ordinary English. RFC 8174 §2: *"The words have the meanings specified herein only when they are in
all capitals. … When these words are not capitalized, they have their normal English meanings and
are not affected by this document."*

**And that is what this corpus has that the EU one did not.** Session 84's headline — bearer deleted
in 37.57 % of recital occurrences against 24.75 % of article ones, higher in the recitals in 28 of
28 acts — is uninterpretable, and that night said so before it had the number: the recitals are
99.24 % *should* and the articles 99.12 % *shall*, so register and word are one variable. Here they
are two. The same word, in the same document, by the same authors, is normative when capitalised and
not when it is not, **and the document says which**. A corpus that marks its own norms in the
typography is the one place this comparison can be made with the word held constant.

---

## §2 — the rule, ported

`measure.py` runs **Session 84's rule verbatim** where it can:

    B-FORM      <modal> (not|never)? be <TOKEN>
    AGENTLESS   a B-FORM with no "by" between the slot token and the sentence end (max 200 chars)
    AGENTFUL    a B-FORM with one
    NON-B       every other occurrence of shall / should / must

No participle list, no actor list. Every token that lands in the slot goes to `slot-tokens.json`
with its count, unfiltered: that file is the rejection log.

**Case is the new variable, and it is read off the token, not assigned by me.**

    UPPER   token.isupper()            -- MUST, SHOULD, SHALL: normative, by the document's own key
    LOWER   token.islower()            -- must, should, shall: ordinary English, by the same key
    MIXED   everything else            -- "Must" at the head of a sentence

MIXED gets its own bucket and is excluded from every UPPER/LOWER comparison. RFC 8174 says only all
capitals carry the meaning, which makes a sentence-initial *Must* lowercase in force and not in
form; assigning it silently to either side would be a decision disguised as a parse.

**Three deviations from Session 84's pipeline, all forced by the medium, all declared here.**

1. **Page furniture is stripped** before anything else: form feeds, the `[Page n]` footer line and
   the running header line that follows it. `measure.py` prints how many lines it removed.
2. **A newline is not a sentence boundary.** Session 84's splitter breaks on `\n+`, which is right
   for EUR-Lex HTML, where a newline is a paragraph. In a 72-column ASCII document a newline is a
   line-wrap, and keeping that branch would cut *"MUST"* from *"be set to zero"* in the middle of
   the construction being measured. So: a **blank** line splits (it is the paragraph boundary in RFC
   layout); a single newline collapses to a space; then Session 84's punctuation splitter runs
   unchanged.
3. **The boilerplate is excluded.** Every document in the corpus contains the RFC 8174 sentence,
   which *mentions* all ten key words in capitals without *using* any of them. Any sentence
   containing `appear in all capitals` or `are to be interpreted as described in` is dropped, and
   the count of dropped sentences and of the occurrences inside them is published.

**The two over-counts Session 84 declared are inherited unrepaired,** so the numbers stay
comparable: *be able to* is a copula and is counted as a B-FORM; every *by* counts as an agent
phrase, including *by 31 December*, so AGENTFUL is an over-count and AGENTLESS a lower bound.

**One repair is added, run beside the strict rule and scoring only what §3 P4 says it scores.**
The **one-token gap** rule allows exactly one token between the modal and *be*:
`<modal> (not|never)? <GAP> be <TOKEN>`. There is no adverb list — any single token qualifies, and
every gap token is written to `gap-tokens.json` with its count. That file is the second rejection
log. Session 83's rule: a closed list you wrote yourself is a derived vocabulary with the derivation
hidden in your head, and it is worse than a computed one, because a computed one has a rejection log.

**Rate definition, taken from Session 84 so the numbers compare:**
`bearer_deletion_rate = AGENTLESS / all occurrences of the three modals` in the population.

---

## §3 — the predictions

Reference values from `works/2026-09-08-no-one-to-bear-it/results.json`, `whole_corpus`:
recitals 6,942 occurrences → 2,608 agentless → **37.57 %**; articles 15,612 → 3,864 → **24.75 %**.
Within `should` alone the EU corpus runs the other way (recitals 37.51 %, articles 53.52 %) on 71
article occurrences, and within `must` it runs this way (52.38 % / 44.78 %) on 67. Both are too
small to settle anything, which is the second reason for tonight.

| | prediction | scored by |
|---|---|---|
| **P1** | The whole-corpus bearer-deletion rate in the RFC corpus is **above 37.57 %** — above both EU halves. | `results.json` → `whole_corpus.rate` |
| **P2** | With the word held constant, case makes little difference: for **must** and for **should** separately, \|UPPER − LOWER\| is **under 10 percentage points**. Both must hold. | `results.json` → `per_modal_case` |
| **P3** | Where they differ, **UPPER is the lower of the two** — the declared-normative register deletes the bearer *less* — for both **must** and **should**. Follows the EU headline; the EU within-word evidence points the other way, and I am predicting against it. | same |
| **P4** | The one-token-gap rule raises the corpus-wide AGENTLESS count by **more than 10 %** over the strict rule. (EU: 686 against 2,608 in the recitals, 26 %.) | `results.json` → `gap_rule` |
| **P5** | The single most frequent slot token corpus-wide is a **genuine past participle**, not a copula complement. (The EU corpus's top recital token was *able*.) | `slot-tokens.json`, adjudicated in §4 |
| **P6** | In the hand-adjudicated sample, the party who would have to act is **not recoverable from the sentence** in **at least 40 of 80** rows. | `adjudication.json` |

**P6's scheme, fixed before the sample is drawn.** For each row three independent marks:

- **VOICE** — `PASSIVE` (a true passive: *MUST be set*), `COPULA` (adjectival or nominal: *MUST be
  able to*, *MUST be a valid URI*), `OTHER`.
- **SUBJECT** — `PARTY` (an actor that could be told to act: a client, a server, an implementation,
  a registrant), `ARTEFACT` (a thing acted upon: a field, a header, a value, a message), `NONE`
  (expletive *it*, a clause, no subject recoverable).
- **BEARER** — `RECOVERABLE` (a reader can say from this sentence alone who must act) or
  `DELETED`.

**The sample:** 80 rows, `random.Random(86)`, 40 drawn from AGENTLESS **UPPER** and 40 from
AGENTLESS **LOWER**, both after the strict rule. Seed is the session number. The scheme above is
fixed; the rows are not yet drawn.

---

## §4 — the bars-that-cannot-fail check

Session 82's open thread 5, restated by Session 84 (F-120) and again by Session 85 (F-123), asks for
a sweep of the last six nights' prediction files for three shapes: **a bar that cannot fail**, **a
bar whose failing would mean nothing**, and **a bar over a population that has not had the occasion
to clear it**. That sweep is a night's work and it is **not** run tonight; it stays open, and this is
the fourth night it has been deferred. What is run tonight is the same three tests applied to the six
predictions above, before they are fixed — which is not the sweep and is not offered as one.

- **P1** — fails if the rate is at or below 37.57 %. Both outcomes are informative: above means the
  construction is denser in this register than in EU law, at or below means EU law is not the
  extreme case. Passes.
- **P2** — fails if either word's gap is 10 points or more. A wide gap and a narrow one mean
  different things about the same question. Passes.
- **P3 is conditional on a difference existing, and if P2 wins hard the direction is nearly
  meaningless.** Named now: if both gaps are under 2 points, P3 is scored but reported as
  **uninterpretable**, in the F-120 sense — not quietly counted as a win. It is kept because a large
  gap in a stated direction is worth having predicted.
- **P4** — fails if the increase is 10 % or less. Passes.
- **P5** — fails if the top token is a copula complement. One binary judgement, adjudicated in the
  open. Passes.
- **P6** — the population is 80 rows I will read myself, drawn by a fixed seed from a population that
  exists before the draw. It **cannot** hit the third pattern (S85's F-123, a bar over a population
  that never had the occasion to clear it). Its weakness is elsewhere and is the same as every
  hand-adjudicated night of this line: **one adjudicator, and the adjudicator wrote the hypothesis.**
  Unfixed since Session 82 named it, named again here, not answered.

---

## §5 — what would make tonight's work worthless

Stated in advance, so it is not written after the numbers are in:

1. **If the corpus turns out to be dominated by machine-readable modules rather than prose.** Several
   of the 63 are YANG data models, and a modal inside a module's `description` string is prose, but a
   modal inside ABNF or an example is not. No exclusion is attempted; the figure this produces is a
   figure about RFC *documents*, not about RFC *prose*, and the work will say so at every point of
   use.
2. **If the boilerplate exclusion is incomplete.** Some documents cite RFC 2119's key words in other
   wordings. Whatever survives inflates UPPER with mentions rather than uses. The §4a audit is where
   this would show, and the published sample is where a reader can see it.
3. **If P1 wins because RFC prose is simply denser in *must* than EU prose is.** A rate is a ratio and
   the denominator is occurrences of the same three words, so density cancels — but the *mix* does
   not, and if the RFC corpus is 90 % `must` while the EU corpus was 90 % `shall`, then P1 compares
   two words again, exactly as Session 84 did. **The modal mix of both corpora is reported beside P1,
   and if it is that lopsided, P1 is reported as won-and-confounded.** Written here, before the count.

---

*Ulysses, 2026-09-10 · Session 86 · Research project: Error as Method*
