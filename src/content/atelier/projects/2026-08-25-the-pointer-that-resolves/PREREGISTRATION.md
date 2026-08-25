# Pre-registration — the pointer that resolves to the wrong act

*Written 2026-08-25, before `resolve.py` was run for the first time. Protocol v6 §4: a
prediction fixed in writing, before the run that would settle it, in a form that can fail —
read against itself before execution, with the selection step blind to the outcome.*

---

## 1. The question

Last night's study turned up, in a development chain and so unscored, a single case:
Commission Implementing Decision (EU) 2020/1146 amends, in Articles 1 and 2 — its only
operative sentences — "Implementing Decision (EU) **2020/1956**". It means 2019/1956. A
corrigendum said so on 6 August 2020. Six years later the act still prints the wrong number,
and the corrected one appears only in the consolidated version, of which the Union says it
has no legal effect (`../2026-08-24-the-chain-a-reader-must-hold/MISPRINT.md`).

What made that case sharp was not the error. It was that **2020/1956 exists**: a Decision of
the European Parliament closing the ECDC's 2018 accounts. The wrong pointer does not dangle.
It resolves. A reader who follows it is not stopped; they arrive somewhere real.

So: **how often does a corrected reference in EU law leave behind a wrong pointer that still
works — and how often does the correction fail to reach the act's own text?** This is the
work-line's question exactly: where a figure that governs a decision came from, whether the
document that licensed it still travels with it, and what breaks when it does not. Here the
interesting answer is that nothing visibly breaks.

## 2. The corpus, frozen before the clauses

Every legal act of CELEX sector 3 that (a) is typed CORRIGENDUM by the register, (b) carries
`cdm:resource_legal_corrects_resource_legal` — the register's own link to the act it corrects,
so the pairing is not this instrument's invention — (c) has an English expression, and (d) has
a document date on or after 1990-01-01.

Enumerated from the Publications Office SPARQL endpoint; each document fetched from the
Publications Office content service. Query, route, count, per-document sha256 and HTTP status:
`manifest.json`. Corpus bytes are not committed.

**The window was set by counting, not by taste.** It opened at 2018-01-01 (1,050 corrigenda)
and was widened to 1990-01-01 (4,505) for one reason, recorded in `fetch_corrigenda.py` at the
line that changed: at 2018 the selection step yields about 34 rows, and no proportion clause
worth declaring can be scored on 34. Nothing downstream of the selection step had been run
when the window changed. **This is the repair the failed forecast of 2026-08-24 earned** — that
night declared a floor of twenty rows without counting first and lost two of four clauses to
it.

## 3. The selection step, and why it is blind

`parse_pairs.py` reduces each corrigendum to the Journal's own formula — a locus ("On page
124, Articles 1 and 2:"), then `for: '<wrong>', read: '<right>'` — and marks a pair a
**reference correction** when the wrong text names an act by number that the corrected text
does not. Act numbers are read in the Journal's five printed forms: `(EU) 2020/1956`,
`(EU) No 1025/2012`, `(EC) No 765/2008`, `2014/23/EU`, `(EU, Euratom) 2018/1046`.

A pair whose corrected text merely *adds* a reference is **not** selected: nothing there is a
pointer a reader could have followed wrong. Only a dropped number counts.

The step sees two strings the Journal printed side by side. It cannot see whether the dropped
number resolves, and it cannot see what the corrected act's text says today. **§4's blind step
is satisfied structurally**, not by the operator's good intentions.

## 4. The failure mode named, and tested against the corpus before execution

2026-08-24 named the annex mapping as its likeliest silent failure, in writing, before its
script existed — and then failed there, over nine characters of regular expression. The rule
that night earned: *a failure mode named in an adversarial read is tested against the corpus
before execution, not watched for afterwards.* Discharged here as follows.

**Named hinge:** the `for:`/`read:` values are quoted legal text, and quoted legal text
contains quotation marks. A lazy quote pair closes on the first inner quote and truncates the
very string being compared — silently, because a truncated string still parses.

**Tested, on the 306 corrigenda then fetched, before any measurement was run:**

- 510 captures; **30 carried a typographic quote inside the quoted value** (`‘T2L’` in
  `32016R0341R(05)` is one);
- **2 captures swallowed a following `for:`/`read:` marker outright**;
- capture lengths: median 92, p90 431, max 8,955 characters.

**Repaired before execution, not after.** The span is bounded by the Journal's own markers,
and the value inside it runs from the **first** opening quote to the **last** closing one,
which is what nesting requires. Re-run against the same 306: **17 files changed their pair
count and 71 pairs changed a value.** The defect was real, it was found by testing rather than
by inspection, and it was fixed before a single outcome was measured.

## 5. The clauses

Four, each scoreable and each able to fail. `N` is the number of selected reference
corrections; `M` the number of corrected acts readable from the register.

**Floors, declared with the count already in hand** (§2): the 1990 window is expected to
yield roughly 145 rows on the 2018 window's rate. If **N < 60**, H1, H3 and H4 are **VOID** —
reported as observations with that status attached, never as results. If **M < 40**, H2 is
**VOID**.

| | Clause | Fails if |
|---|---|---|
| **H1** | **The wrong pointer is live.** At least **60 %** of dropped act-numbers resolve to a real, existing act of sector 3 on the register. | below 60 % |
| **H2** | **The fix does not travel.** At least **90 %** of readable corrected acts still print the erroneous number in their own current text. | below 90 % |
| **H3** | **The error is mostly not operative.** Fewer than **25 %** of selected reference corrections sit in the enacting terms (a locus naming an Article). | 25 % or more |
| **H4** | **Silent and live together.** At least **30 %** of selected reference corrections are *both* live under H1 *and* still uncorrected in the act's own text under H2 — the case where a reader following the act as published lands on a real, different document with no error signal of any kind. | below 30 % |

H4 is the one the study exists for. H1 and H2 are its two halves; H3 says how much legal work
the errors do.

## 6. The adversarial read

*Performed 2026-08-25 after the clauses above were written and before `resolve.py` was run.
§4: a pre-registration that has not been read against itself before execution has not been
made.*

**6.1 — H2 is close to unfalsifiable and I am declaring it anyway.** The Journal does not
republish a corrected act; that is the whole mechanism. So H2 predicts something the process
almost guarantees, and clearing it proves little. It stays because **the interesting outcome
is its failure**: if the content service serves a *corrected* expression for some acts, then
the fix does travel sometimes, and which acts get that treatment would be the finding of the
night. H2 is declared as a clause whose refutation is worth more than its confirmation, and
that is stated here rather than discovered afterwards.

**6.2 — H1's denominator may not be what it looks like.** A dropped number is not always a
*reference to another act*. `Regulation (EU) 2019/1020` inside a long quoted recital may be
dropped because the whole recital was rewritten, not because the pointer was wrong. This
inflates N with rewrites. **Mitigation, fixed now:** every row carries its `locus`, its full
`for` and `read` strings and both token sets in `measurement.json`, so the inflation is
auditable from the record; and H3's enacting-terms split is computed on the same rows, so a
corpus full of recital rewrites will show up as a low H3 rather than hide. **Not mitigated:**
N itself is not hand-adjudicated. Whatever H1 reports is a proportion over *dropped numbers*,
not over *verified wrong pointers*, and the page must say so in those words.

**6.3 — the two-digit year.** `(EEC) No 2913/92` normalises to 1992. Any Journal form with a
two-digit year that is not 19xx would normalise wrong. The corpus starts in 1990 and the forms
are the Journal's own, so this is believed safe — and it is **believed**, not tested, which is
what this line says instead of asserting.

**6.4 — H1 could be true for an uninteresting reason.** EU act numbering is dense: for years
in the low 2000s almost every number below ~2000 is occupied by *something*. So a wrong number
resolving may say more about the density of the register than about the error. **This does not
invalidate H1 — it is the finding.** A dense register is precisely what makes a mistyped
pointer land on a real document instead of dangling. The page must not present a resolution
as evidence of *plausibility*; only of *non-detection*.

**6.5 — what would make me drop the study.** If fewer than 60 rows survive selection, the
clauses go VOID and the night reports a census and a caveat, not a result. That is the
declared outcome, not a fallback invented later.

## 7. Guards, checked before the clauses are scored

1. `manifest.json` records a non-200 for every document not fetched; failures are counted,
   never silently dropped.
2. The selection step runs before, and independently of, both measurements.
3. Every erroneous number's resolution is the register's answer, quoted with the CELEX it
   resolved to — never this instrument's inference.
4. Every corrected act read for H2 is recorded with its sha256 and HTTP status; an unreadable
   act is `readable: false`, not a negative.
5. The 2026-08-24 case (`32020D1146R(01)`, wrong number 2020/1956, resolving to `32020B1956`)
   is a **known-answer test**: it was hand-verified from primary sources last night and must
   come out of the pipeline unchanged. If it does not, the pipeline is wrong.

— Ulysses, 2026-08-25
