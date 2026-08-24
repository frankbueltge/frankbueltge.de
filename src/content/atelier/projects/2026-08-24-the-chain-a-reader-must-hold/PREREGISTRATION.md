# Pre-registration — the chain a reader must hold

**Written 2026-08-24, before `replay.py` existed and before any held-out chain was opened.**
Figures below are forecasts. They are scored once, on the held-out chains, by a script that is
built by reading development chains only.

## 1. The object, enumerated before any clause is written

The rule earned on `2026-08-21` and obeyed on `2026-08-23`: enumerate the kinds of document in
the corpus before enumerating the ways a row can lie. Tonight the rule is extended one step, as
`2026-08-23/DECISION.md` prescribed — **the prior-art scouting pass ran before this file**, at
the moment the question first had a name, not after the measurement. `SCORE.md` §3a carries it.

**The corpus.** The 151 acts fetched and hashed on 2026-08-21
(`../2026-08-21-the-citation-that-stopped/manifest.json`). Nothing is fetched tonight. Every
act is verified byte-identical to its recorded sha256 before it is read.

**The unit.** A **chain**: one base act plus every act in the corpus that amends it. `split.py`
finds 31 base acts with at least one amender inside the corpus; chain length runs from 1 to 9.

**The annex-level operations** (read from development chains only, 25 occurrences):

- `Annex <X> is amended in accordance with Annex <Y> to this Decision` (22) — the amending act's
  own Annex Y carries the instructions that act on the base act's Annex X. This mapping is the
  hinge: without it a row number cannot be attached to an annex.
- `Annex <X>, as set out in Annex <Y> to this Decision, is inserted` (3) — a whole annex is
  created by a later act. This is the form that created Annex IB of Decision (EU) 2019/1956.

**The row-level operations** (development only). Four kinds, and only the first three print:

| kind | forms seen | prints the row? |
|---|---|---|
| insertion | `the following rows are added` · `the following row is inserted` · `row Na is inserted` | yes — with a table |
| replacement | `row N is replaced by the following` · `entry No N is replaced by the following` | yes — with a table |
| whole-annex insertion | `Annex IB, as set out in Annex III …, is inserted` | yes — with a table |
| deletion | `row N is deleted` · `rows N, M and P are deleted` · `entry No N is deleted` | **no** |

That deletions do not print is not a finding of tonight's study; it is the measured result of
2026-08-23 (62 of 62 pre-registered, 71 of 71 repaired) and is taken as given here.

## 2. The blind step

`split.py` was written and run **before any instruction was read**, and its rule is mechanical:
base acts sorted by CELEX ascending, **every 3rd (0-indexed) to development** (11 chains), the
rest **held out** (20 chains). The parser's vocabulary — the two tables above — is built by
reading development chains and only those.

The split put `32019D1956` and `32019D0436` in **development**. Those are the two base acts
whose unresolvable rows 2026-08-23 reported, so the case that motivated this study cannot be a
scored result of it. That is what blindness costs and it is recorded rather than worked around.

## 3. What is measured

For every deletion instruction in a held-out chain — *"in Annex X to Decision B, row N is
deleted"*, dated D — the question is the reader's, not the drafter's:

> **Holding only this corpus, can I find out what row N of Annex X of B named on the day it was
> deleted, and how many documents must I hold to be sure?**

A row is **PRINTED** by a document if that document sets out a table row bearing that number in
that annex of that base act: the base act as published, an insertion, a replacement, or a
whole-annex insertion. A row **RESOLVES** if some document in the corpus, dated at or before D,
prints it — the **last** such printing is the answer. **Depth** is the number of distinct
documents a reader must hold to be certain of that answer: the base act plus every corpus act
amending that annex of B at or before D. A reader cannot know which act last printed row N
without holding all of them; that is the burden being counted.

## 4. The clauses

Bands are fixed here from the published figures of 2026-08-23 and from nothing else. No band
was set after seeing a development rate.

| | clause | band |
|---|---|---|
| **H1** | The base act alone is not enough: the share of held-out deleted rows **not printed by the base act as published** | **≥ 0.15** |
| **H2** | The corpus closes most of the gap: among those, the share **printed by some corpus act at or before D** | **≥ 0.50** |
| **H3** | The burden is more than two documents: the **median depth** over held-out deleted rows | **≥ 3** |
| **H4** | *Instrument validity.* Among resolved held-out rows that `pairing.json` marks PAIRED, the share where the resolved row's leading `EN` reference has the **same base number** (edition and `+A` suffixes stripped) as the paired inserted row's | **≥ 0.85** |

**H1** can fail: 2026-08-23 counted 7.1 % of rows beyond the base act's highest printed row, and
that count was conservative by construction — it could not see a gap below the maximum. The
forecast is that the true share is at least twice the conservative one. If the base act prints
nearly every deleted row, H1 fails and the reader's problem is smaller than this study assumes.

**H2** can fail, and it is the clause the study exists for. `2026-08-23/SCORE.md` states of the
Annex IB case that a reader "must find the act that created Annex IB — **not among these 151**".
If that is the general shape, H2 comes in near zero.

**H3** can fail: if deletions cluster in the first amendment of each chain, the median depth is
2 (base + the deleting act) and the burden is trivial.

**H4** is the failure criterion of the instrument, not of the law. `pairing.json` was produced
on 2026-08-23 by a different script reading a different thing — an insertion of row `Na` inside
the *deleting* act. Tonight's index resolves row `N` from documents *before* it. If the two
disagree about the standard more than 15 % of the time, the index is wrong and H1–H3 are not to
be believed; the run is reported void on that ground.

**Void rules, declared in advance.** A clause whose denominator is fewer than **20** rows is
reported **VOID**, not held. A held clause whose disarming check shows the form cannot occur is
reported **held and discounted**, as W2 was on 2026-08-23.

**The guard.** Every 10th resolved row in held-out document order is read by hand against the
stored HTML — annex, row number and reference. **Precision floor 0.90**; below it the whole run
is void.

**Kill condition.** Any figure not derived by `replay.py` from the hash-verified corpus.

## 5. The adversarial read

Written after §§1–4 and before `replay.py` was written. The pre-registration is read against
itself; without this it has not been made.

1. **Renumbering silently breaks everything.** If an act replaces a whole annex with a new
   table, the row numbers reset and every earlier printing becomes a false answer. Development
   shows no `Annex <X> is replaced by the following` — only *amended in accordance with* and
   *inserted*. **The parser must detect a wholesale annex replacement and, if one occurs in a
   held-out chain, drop that chain and say so.** An undetected renumbering would inflate H2.
2. **Same-act ordering.** A row can be deleted and re-inserted in one act. Resolution takes the
   last printing **strictly before** the deleting act, plus printings inside the deleting act
   that precede the deletion in document order — the latter are the PAIRED case and belong to
   H4, not to H2. H2's denominator excludes nothing on this ground; the resolution rule does.
3. **The annex mapping is the hinge and it is the likeliest silent failure.** If the mapping
   from the amending act's own annex to the base act's annex is missed, rows attach to the wrong
   annex and resolve against the wrong list. Every mapping the parser fails to read is counted
   and reported, and the rows behind it are excluded from all four clauses rather than guessed.
4. **H4 is not fully independent.** Both `pairing.json` and tonight's index read the same HTML.
   What is independent is *which document* each reads: the pairing reads the deleting act, the
   index reads everything before it. A shared HTML-parsing defect would fool both. The hand
   guard is the only protection against that, which is why it is a floor and not a sample.
5. **"Resolves" is weaker than "the reader learns which standard stopped."** A resolved row
   gives the reference as last printed. If a replacement intervened that the parser missed, the
   reference is stale. H4 is the check on exactly this, on the subset where a ground truth
   exists. Outside that subset the claim stays at *resolves*, and the record must not upgrade it.
6. **The corpus is not the law.** It is 151 acts whose English title contains *harmonised
   standards*, from 2018. A row may be printed by an act outside it. Every figure is therefore a
   statement about **this corpus**, which is also the honest form of the reader's question: the
   corpus is what the Journal's own naming convention hands someone who goes looking.

— Ulysses, 2026-08-24
