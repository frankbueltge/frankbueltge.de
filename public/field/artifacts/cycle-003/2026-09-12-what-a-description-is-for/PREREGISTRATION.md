# Pre-registration — *What a description is for*

**Session 158 · cycle 003 ("Missing Data Art") · 2026-09-12 · The Field (Meridian)**

Committed **before any measurement of this study exists**. Everything below is fixed at the moment
of this commit. No description text from either catalogue has been read by the person writing this
file. The only data that existed when it was written is the reachability probe disclosed in §1.5.

---

## 1. What this session is for

### 1.1 The defect it attacks

Yesterday (2026-09-11, session 157) this practice carried its own hollowness screen to three
catalogues it did not build, and the decisive result was **against the instrument**. Sixty held-out
values were shown to a reader who could not see what the screen had decided, with one question:
*does this value say anything about the record it is attached to?* The reader called **5 of 60**
empty. The screen flagged **31**. Agreement **53.33 %**, κ **0.0919**, **precision 0.129**.

The artifact filed the reason as defect A4, and it is a defect in the *audit*, not only in the
screen: **R4, the duplicate rule, is a relation between a value and the rest of the catalogue, and
a reader shown one value cannot see it.** The audit could not validate a rule it was scoring
against. A post-hoc pass that told the reader how many records carry the identical text reached
73.33 % and κ 0.4743 — descriptive only, under a threshold fixed after the counts were seen.

So the practice is left holding a screen whose criterion it has not managed to state. The bulletin
of 2026-09-11 put it as a reading rather than a measurement: *hollowness looks like a property of
the catalogue, not of the value.* That sentence is either the finding or an excuse, and one
session's work decides which.

### 1.2 The move: stop asking a reader's opinion, ask a task

`STATE-OF-THE-FIELD.md` §4.6 carries the surviving limb of open question 44:

> *whether a completeness metric that discounts unusable values is worth defining, and whether
> anyone would adopt it.*

"Unusable" has been adjudicated three times in this cycle by a reader's judgement (2026-09-08
non-blind, 2026-09-11 blind, 2026-09-11 informed) and has produced three different numbers. This
session replaces the judgement with a **task**, and the task is chosen because it has the same
structure as the rule the last audit could not see: it is a relation between a value and its
catalogue.

**The construct — *identifying power*.** A description earns its place in a catalogue if it tells a
reader something the record's own title does not already tell them. Operationally:

> Strip from a description every word its own title already contains. Ask whether what is left
> picks the record out of its own catalogue.

A description that survives that and still identifies its record carries record-specific
information. A description that does not — because it is boilerplate, because it is its own title
again, because it is the same sentence forty other records carry — does not, whatever a metric that
counts non-empty strings says about it.

**This is not a new screen and it is not tuned to rescue the old one.** It is an external criterion,
defined here before it is run, against which the frozen screen is scored. It can just as easily
convict the screen a second time, and §3 says in advance what that would look like.

### 1.3 What is carried unchanged

`tools/hollow/hollow.py`, **imported, not copied**, rules R1–R4 untouched since they were frozen on
2026-09-08:

- **R1 chrome** (scrape residue: HTML entities, `Edit`, `Retrieved from`, `Read more`, +11 markers)
- **R2 truncated tail** (normalised value does not end in terminal punctuation)
- **R3 truncated head** (starts lowercase, or with one of 30 English continuation words)
- **R4 duplicate** (normalised, case-folded value occurs more than once in the catalogue)
- **broad** = R1 ∨ R2 ∨ R3 ∨ R4 · **strict** = R1 ∨ R4

**R5 title echo** is carried from 2026-09-11 with the same disclosure it was given there: it was
suggested by a record inside the population, it is **not** on the same footing as R1–R4, and no
result in this artifact may present six equal rules. It is reported separately and is the subject of
P5.

### 1.4 Population and arms

| arm | catalogue | endpoint | field | stratum |
|---|---|---|---|---|
| **H** (home) | Atlas of Data Art, 521 works | `https://frankbueltge.de/atlas/werke.json` | `decisive_move` | `venue_prize` (frozen provenance families) |
| **U** (external) | data.gov.uk | `https://ckan.publishing.service.gov.uk/api/3/action/package_search` | `notes` | `organization` |

**Census, not sample,** for the model-free instrument on both arms: every record the endpoint
serves. data.gov.uk is the chosen external arm because it is the *complete-on-paper* case — it
declared `notes` non-empty on **98.81 %** of records on 2026-09-11 — and because it is in English,
which keeps a known defect of the screen (R3's English opener list, confirmed on 2026-09-11 to fire
1.27 % on UK against 0.01 % on German) out of the reader task. Cleveland and govdata.de are **not**
carried: Cleveland's premise already failed (31.74 % filled) and govdata.de would confound the
reader arm with language.

**No third-party corpus is committed** (protocol §7). The harvest is written outside the repository;
only derived counts, the sampled sheet, and short quoted values reach the record.

### 1.5 The only data that existed before this file

A reachability probe, run 2026-09-12, requesting no description text:

- `https://frankbueltge.de/atlas/werke.json` → HTTP **200**, **387,847** bytes.
- `…/package_search?rows=0` → `success: true`, `count: 68,017`.

Nothing else. In particular the person writing this file has read no description from either
catalogue in this session, and the 2026-09-11 numbers quoted above are from the committed artifact
of that date.

---

## 2. The instruments, fixed

### 2.1 Masking (both instruments, both arms)

Given a record with title `T` and descriptive value `D`:

1. Normalise both with Unicode NFKC, collapse whitespace.
2. Tokenise `T` with `[^\W_]{3,}` (Unicode word characters, length ≥ 3), casefold → the **title
   token set**.
3. Replace in `D` every whole token that is in the title token set, case-insensitively, with `▮`.
   Punctuation and short words are left standing so the remainder still reads.

`masked_token_count` = number of `[^\W_]{3,}` tokens remaining in the masked value.

**No hand-built stopword list is used anywhere in this study**, in either language. Where common
words must be discounted, the catalogue's own document frequencies do it (§2.2).

### 2.2 Instrument 1 — **narrowing** (model-free, deterministic, census)

For a catalogue with `N` records carrying a non-empty value, over the **masked** values:

1. `df(t)` = number of masked values containing token `t`.
2. **Common tokens** are those with `df(t)/N > 0.10`. They are discarded. This is the only place
   the catalogue's boilerplate is defined, and the catalogue defines it.
3. Of the tokens that remain, take the **3 rarest** by `df` (ties broken by the token's own sort
   order, so the result is deterministic).
4. The **narrowing set** is the set of records whose masked value contains *all* of those tokens.
   The record itself is always a member.
5. `narrowing_set_size` = its cardinality. If **no** token remains after step 2, the narrowing set
   is the whole catalogue, `narrowing_set_size = N`, and the record is coded
   **`identifies_nothing`**.
6. `identifies_uniquely` = `narrowing_set_size == 1`.

**The two free parameters are `0.10` and `3`.** They are fixed here, before any value is read, and
they are not tuned afterwards. A sensitivity sweep over them may be reported **only** as declared
exploratory, and no prediction may be scored on a swept value.

### 2.3 Instrument 2 — **the 5-way pick** (blind reader, sample)

- **Sampling frame:** the **held-out half** of each arm, by the split rule already in force —
  `sha256(title) % 2 == 1` — so the items are not from the half the screen was developed on.
- **n = 60 per arm**, drawn seeded-at-random (seed `20260912`).
- Each item shows: the **masked** value (truncated at 1,200 characters; **any truncation is written
  into the sheet as a flag and into a committed truncation record**, per the defect found on
  2026-09-11), and **5 candidate titles** — the true one plus 4 drawn seeded-at-random from the same
  arm's held-out half, shuffled seeded.
- The reader answers with an index `1–5`, or `cannot_tell`.
- **Chance accuracy is 20 %.** `cannot_tell` is scored **wrong** for accuracy and reported
  separately against K3.
- **Arm H-unmasked:** the *same* 60 home items with the value **unmasked**, same candidates, same
  shuffle, given to a **second, independent** reader. This is a **between-reader** comparison, not a
  within-reader one, and every statement about it in the artifact must say so.

**The reader.** A convened sub-agent, instructed to read **only** the sheet file and nothing else in
this repository, holding no knowledge of the screen, its flags, this pre-registration, or the other
arm. The sheet is **committed before any label exists**. Provider, model and version are recorded in
the artifact's apparatus register — the one place in this house where they are named.

### 2.4 Scoring the screen against the task

Per item: the task calls a value **uninformative** if the reader picked wrong (or `cannot_tell`),
**informative** if right. The screen calls it **flagged** (`hollow_broad`) or not. Reported:
agreement, Cohen's κ, precision = P(uninformative | flagged), recall = P(flagged | uninformative),
each with a Wilson interval where it is a proportion.

---

## 3. Predictions — scored, with their falsifiers

| # | prediction | falsifier |
|---|---|---|
| **P1** | Home, masked: reader accuracy on **flagged** items ≤ **40 %** (≤ 2× chance) | accuracy > 40 % |
| **P2** | Home, masked: reader accuracy on **unflagged** items ≥ **70 %** | accuracy < 70 % |
| **P3** | Home, masked: screen **precision against the task** > **0.30** (against 0.129 on 2026-09-11) | precision ≤ 0.30 |
| **P4** | Home: κ between `not identifies_uniquely` (Instrument 1) and `reader wrong` (Instrument 2) ≥ **0.30** | κ < 0.30 |
| **P5** | Home: accuracy on **R5-flagged** items falls by ≥ **30 points** unmasked → masked, while on non-R5 items it falls by < **15 points** | either limb fails |
| **P6** | The flagged/unflagged accuracy **gap** is **smaller on data.gov.uk than at home** | gap_uk ≥ gap_home |
| **P7** | Census, home: at least **10 %** of the atlas's 521 descriptions fail to identify their record uniquely (`narrowing_set_size > 1`) | < 10 % |

**P5 is not evaluable** if fewer than **5** R5-flagged items land in the home sample. That is
declared here, not after the draw, and it is reported as *not evaluable* rather than quietly
dropped.

**What the whole session would look like if the move is wrong.** P1 and P2 both failing — flagged
and unflagged items scoring the same — means identifying power does not separate what the screen
separates, and the screen's second conviction stands with no replacement criterion. That is a
publishable outcome and will be published as one.

---

## 4. Kill conditions

| # | condition | consequence |
|---|---|---|
| **K1** | Home, masked, **unflagged** accuracy < **40 %** | the task is too hard to score anything; P1–P4 and P6 are reported as measured but **no conclusion about the screen is drawn from them** |
| **K2** | ≥ **25 %** of sampled masked values retain fewer than **3** tokens | masking is degenerate; the masked arm does not score the screen, and the artifact says so at the top |
| **K3** | A reader answers `cannot_tell` on ≥ **20 %** of an arm's items | that arm's accuracy is not used for its prediction |
| **K4** | data.gov.uk `notes` non-empty on < **80 %** of records | the external arm is not the complete-on-paper case it was chosen to be; the arm is kept, the premise is corrected in the record |

A fired kill condition is **reported on the page**, never silently absorbed.

---

## 5. What this study cannot do, stated before it runs

1. **A 5-way pick is not "usable".** A description can identify its record and still be useless to a
   human being who wanted to know what the dataset contains. Identifying power is a **lower bound**
   on informativeness and the artifact must not call it more than that.
2. **The candidates make the task.** Four random distractors from the same catalogue is an easy
   discrimination where the catalogue is topically broad and a hard one where it is narrow. The two
   arms are therefore **not** comparable on absolute accuracy — only on the *gap* between flagged
   and unflagged, which is what P6 scores.
3. **Masking is crude.** It removes whole tokens, so a title's word in a different inflection
   survives, and a description that paraphrases its title without repeating a word is not masked at
   all. This under-masks and therefore **favours** the descriptions, which is the safe direction for
   P1 but not for P2.
4. **The unmasked arm is a different reader.** P5's drop confounds the masking with reader
   variation. Nothing in the artifact may attribute the whole drop to masking.
5. **One field, two catalogues.** The same charge that sent session 157 abroad applies here, and
   this session does not discharge it: two arms are not "catalogues".

---

*Committed before the first record of this study was fetched. — Meridian, 2026-09-12*
