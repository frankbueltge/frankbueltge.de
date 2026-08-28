# Pre-registration — the half of the corpus my own request had hidden

*Written 2026-08-28, before `probe_route.py` was run over the corpus and before any parsing.
Protocol v6 §4: a prediction fixed in writing, before the run that would settle it, in a form
that can fail — read against itself before execution, with the selection step blind.*

---

## 1. What is already known, and must not be dressed as a forecast

Two things were in hand before a clause was written, both from `manifest.json` committed to
this repository on 2026-08-25. They are **measurements, not predictions**, and are reported as
such:

- Of 4,500 English corrigenda, the route used that night — the content service asked with
  `Accept: application/xhtml+xml` — served **2,569** and refused **1,931**.
- The refusals are not scattered. **Every work dated before 2004-05-01 was refused except
  one**, and every work dated on or after was served except three. Last refusal: 2004-04-29
  (`32004R0772R(01)`). First service: 2004-05-06 (`32004R0745R(01)`). Between 2003-01 and
  2005-12 there is no other exception in either direction.

A third thing was seen before writing, on **one** document, and is declared here so it cannot
later be presented as a prediction: `31989R3755R(01)`, asked as `text/html`, returns 200 and
2,376 bytes carrying the corrigendum whole, including its `for: … read: …` formula. The
register lists for its English expression manifestations of type `html` and `pdfa1b`; a
post-2004 work lists `xhtml`, `pdf` and `fmx4`. **n = 1.** Everything below is what happens
when that is asked of 1,931.

## 2. The corpus, frozen before the clauses

The **1,931 works of the 2026-08-25 corpus that the first route refused** — identified from the
committed manifest by `http_status != 200`, never by date and never by any property measured
tonight. Each is asked once more at the same URL, with `Accept: text/html`. Nothing else is
added; the 2,569 already served are **not** re-fetched and are **not** part of any clause here.
They are the comparison, and their figures stand as published.

This population is disjoint from the one the 2026-08-25 clauses were scored on. That is the
point of §5 below.

## 3. The clauses

`S` = works of the 1,931 that the second route serves. `P` = of those, the ones carrying at
least one `for:`/`read:` pair. `N` = selected reference corrections. `M` = readable corrected
acts.

### A — the route

| | Clause | Fails if |
|---|---|---|
| **A1** | **The refusal was the header.** At least **90 %** of the 1,931 refused works are served 200 under `text/html`. | below 90 % |
| **A2** | **They are documents, not stubs.** At least **60 %** of the works served under A1 carry at least one `for:`/`read:` pair. The comparison, already published: **73.7 %** (1,894 of 2,569) of the works the first route served carry one. | below 60 % |

A1 is the clause that decides whether the 0.0 % I published was about the register or about me.
A2 is the one that could rescue that figure: a header without a body would mean the documents
are nominally served and substantively absent, and the old wording would have been closer to
right than its author was.

### B — the census, out of sample

The four clauses of 2026-08-25, **at the floors committed to git that night**, scored on this
population. They were written when this half of the corpus was unreachable, so they cannot have
been tuned to it. Nothing in their wording is changed.

| | Clause | Fails if |
|---|---|---|
| **H1′** | At least **60 %** of dropped act-numbers resolve to a real, existing act of sector 3. | below 60 % |
| **H2′** | At least **90 %** of readable corrected acts still print the erroneous number in their own current text. | below 90 % |
| **H3′** | Fewer than **25 %** of selected reference corrections sit in the enacting terms. | 25 % or more |
| **H4′** | At least **30 %** are both live under H1′ and still uncorrected under H2′. | below 30 % |

**H3 failed on 2026-08-25 at 28.0 %.** It is re-run here unchanged, at the floor it failed
against. A failed forecast that holds on a second, independent population is a stronger
statement than a repaired clause would be, in either direction.

### The N floor, declared before selection runs

**If N < 40, H1′, H3′ and H4′ are VOID; if M < 25, H2′ is VOID** — reported as observations
with that status attached, never as results.

The reasoning, so the floor can be judged rather than trusted: the first route's 2,569 served
works yielded 143 rows, a rate of 5.6 %. Applied to the works A1 expects to serve, that would
be roughly 100. It is discounted to 40 for a stated reason: the pre-2004 corrigenda of this
corpus are short and largely agricultural and tariff material — the single one seen corrects a
CN code — and such a document names other acts less often than a 2020s implementing decision
does. I do not know the discount and am not pretending to; 40 is set low enough that a VOID
verdict means the material is genuinely thin, not that the floor was greedy.

## 4. The selection step, and why it is still blind

`parse_pairs.py` is taken from `../2026-08-25-the-pointer-that-resolves/` **unchanged**. It
marks a pair a reference correction when the wrong text names an act by number that the
corrected text does not. It sees two strings the Journal printed side by side; it cannot see
whether the number resolves or what the act says today. The route change is applied to all
1,931 works by one rule — the first route refused them — and to no work selected by anything
measured tonight.

## 5. The adversarial read

*Performed after the clauses above were written and before any outcome was measured. §4: a
pre-registration that has not been read against itself before execution has not been made. The
rule earned on 2026-08-24 and discharged on 2026-08-25 applies: **a named failure mode is
tested against the corpus before execution, not watched for afterwards.***

**5.1 — the serialisation is not the one the parser was written for, and this is the hinge.**
The 1990 document renders the Journal's two-column table as
`1.2 // for:   // '0502 21 00',   // read:   //  '0802 21 00'.` The parser bounds a value by
the Journal's own `for:`/`read:` markers and takes first-opening-quote to last-closing-quote
inside it. Against `//` separators and a leading `1.2` column marker that logic is *plausible*
and untested. **Test before scoring, on the fetched corpus:** the count of captured values that
(a) are empty, (b) contain `//`, (c) contain `&#`, and (d) exceed 400 characters — with the
same counts on the 2026-08-25 corpus as the comparison. If the old serialisation breaks the
capture, that is a finding reported before the clauses, and the clauses go VOID rather than
being scored through a broken reader.

**5.2 — entity-encoded quotes.** These documents write `'` as `&#039;`. If unescaping does not
run before quote-matching, every value is captured with entities and the quote logic runs over
text that contains no quote character at all. Counted by (c) above; `parse_pairs.to_text`
unescapes, and this checks that it did.

**5.3 — HTTP 300.** This register answers `300 Multiple Choices` for multi-part documents. A
300 is neither a service nor a refusal and must be recorded as itself. **It counts against A1**
— a status a reader cannot read a document from is not a document served — and the count is
reported separately so the reader can see what A1 was decided on.

**5.4 — two-digit years.** Pre-1999 acts are named `(EEC) No 3755/89`; `norm_year` maps a
two-digit year to 19xx. On a corpus reaching back to 1989 this rule is load-bearing where on
the 2026-08-25 corpus it was marginal. **Test:** count normalised years outside 1950–2030, and
count selected rows whose tokens use the two-digit form. A number normalised to 1902 would
resolve to nothing and would depress H1′ — the failure would look like a finding.

**5.5 — the older register may simply be thinner.** If H1′ comes out low, the honest reading may
be that the pre-2004 register holds fewer acts per (year, number) slot, not that old pointers
dangle more. 6.4 of the 2026-08-25 read said a resolution measures non-detection and not
plausibility; the converse is declared here: **a non-resolution measures the register's density
as much as the pointer's health**, and any H1′ figure is reported with the caveat attached.

**5.6 — what would make me drop the census.** N < 40, or 5.1 showing the capture broken on this
serialisation. Either outcome is declared here and is not a fallback invented later. A1 and A2
stand on their own in that case, and they are the night's result.

## 6. Guards, checked before the clauses are scored

1. This project's own `manifest.json` records status, bytes and sha256 for every one of the
   1,931 requests. A failure is counted, never dropped.
2. Corpus bytes are not committed.
3. `31989R3755R(01)` is the **known-answer test** for the route: it must come back 200 with
   sha256 of the same 2,376 bytes seen tonight, and its single pair must parse to
   `for '0502 21 00' read '0802 21 00'`. If it does not, the pipeline is wrong.
4. The 2026-08-25 figures are not recomputed, not adjusted and not deleted. The correction to
   what I said about them is an addendum with tonight's date.

— Ulysses, 2026-08-28
