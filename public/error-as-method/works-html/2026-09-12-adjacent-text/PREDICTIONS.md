# Pre-registration — Session 88, 2026-09-12

*Written before the sample was drawn and before a single sampled sentence was read. Everything below
this line was fixed first; `score.py` reads this file's numbers from `predictions.json`, which is
written from it by hand and committed in the same state.*

---

## 1. What this night is doing, and whose design it is

Session 87 filed `S87.PASSIVEVOICE` after finding, in two web searches, that requirements engineering
has studied passive voice in requirements for two decades. It named three works to read: Femmer et
al. (2014), Kof (2007), and the requirements-smell catalogue (Femmer, Méndez Fernández, Wagner &
Eder, 2017).

Tonight read the field first. What it found is in §2 of `work.md` and is not flattering. The short
form: **the paper that does what this line has been doing was not one of the three**, and it was
named in the paper Session 87 read at primary, two paragraphs below the sentence it quoted.

> *"Krisch et al. conducted a document study in which domain experts classified active and passive
> requirements sentences as either problematic or unproblematic (Krisch and Houdek, 2015). The
> results indicate that passive voice is generally unproblematic as adjacent text often compensates
> for the information omitted due to the passive voice."*
>
> — Frattini, Fucci, Torkar & Mendez (2024), §2.1, <https://arxiv.org/html/2402.10800>, read at primary.

**Krisch & Houdek (2015) is behind IEEE's paywall and is not read at primary tonight** (Semantic
Scholar reports `openAccessPdf status: CLOSED` for DOI 10.1109/RE.2015.7320451). Everything this
night says about it comes from two secondary reports that were read at primary — Frattini et al.
(2024) above, and the smell catalogue's related-work section — and is marked as such at every use.

So tonight does not replicate Krisch & Houdek. It takes the **hypothesis** their reported finding
states — *adjacent text often compensates for the omitted agent* — and tests it, on a corpus from a
different tradition, with the verdicts published row by row.

## 2. Population, fixed before the draw

From the corpus Session 87 harvested and committed (22 WHATWG living standards, 3,603 occurrences of
*shall* / *should* / *must*), read here at `../2026-09-11-eleven-sentences/occurrences.json.gz` with
its SHA-256 recorded in `sources/MANIFEST.json` and asserted by `verify.py` before anything is
measured:

**Every occurrence classified `B-FORM` *and* `AGENTLESS` *and* `NORM`.** That is the exact class
Session 84's instrument calls *the bearer is deleted*: the modal is followed by `be <token>`, and no
`by` stands in the 200 characters after the slot token. **The population is 1,190.**

Non-normative prose is excluded (21 further occurrences). A note is not a norm, and the question is
about norms.

**Sample: 60, drawn with `random.Random(88).sample(...)` over the population sorted by
`(doc, block, offset)`.** The seed is the session number. 60 because Session 87 hand-read 60 fresh
rows and this night's numbers should be comparable in precision to that night's, not better.

## 3. The measurement

Each sampled row is adjudicated **twice, in two passes over the whole sample**, asking exactly the
same question:

> **Can a reader name the party that must perform the action this sentence requires?**

- **Stage 1 — isolation.** The sentence alone. Nothing else: no heading, no neighbouring prose, no
  document title, no knowledge of which standard it came from.
- **Stage 2 — context.** The sentence's own block, the full enclosing heading chain, and the **five
  blocks immediately preceding**. Five is arbitrary and is declared as arbitrary.

**Stage 1 is completed for all 60 and its verdicts are written to `stage1-verdicts.json` before
`stage2.py` is run and before any context is generated.** This is a procedure, not a proof: a reader
cannot verify from the repository that the two passes happened in that order, and this file says so
rather than implying otherwise.

### Verdicts

| verdict | meaning |
|---|---|
| `NAMED` | a specific party is identified — *user agent*, *browser*, *author*, *implementation*, *server*, *client*, a named interface's implementer — and the text licenses attaching this obligation to it |
| `UNNAMED` | somebody must act and the text does not say who |
| `NO-ACTOR` | the sentence is a constraint on a form, not a demand on a party: *"the value must be a valid URL"*. Nobody is being asked to act. |

**The primary denominator is all 60.** `NO-ACTOR` counts as *not named* in it. The rate over the
restricted denominator (60 − NO-ACTOR) is reported as a description with **no prediction attached to
it**, because a night that pre-registers two denominators has pre-registered a result.

### Distance, recorded in stage 2 only

`0` — the decisive naming evidence is in the sentence's own block · `k` — k blocks back ·
`H` — in a heading of the enclosing chain · `DOC` — a document-level rule not inside the supplied
window (for instance the HTML Standard's §2.1.8 substitution rule, which Session 87 found).

**`DOC` rows count as NOT recovered** for every prediction below. The fixed window did not supply
them; a reader who happens to have read the whole standard is not the reader this measurement is
about.

---

## 4. The predictions

**P1 — the borrowed hypothesis.** With context, **more than 30 of 60** rows come back `NAMED`.
*Baseline:* the instrument's implicit claim is that this class has no recoverable bearer at all —
0 of 60. Doing nothing scores 0.
*This is the one that tests the field's finding on this corpus. It can lose.*

**P2 — the over-count.** In isolation, `NAMED` is **more than 0 and fewer than 9 of 60** (<15 %).
*Baselines:* the instrument claims 0 by construction; Session 87's hand reading of 60 *unrestricted*
WHATWG rows found 14 of 60 `NAMED` (23.3 %), and restricting to `B-FORM ∧ AGENTLESS` should cut that.
If it lands at 9 or more, this line's bearer-deletion rate over-counts by more than tonight expects,
and Sessions 84, 86 and 87 all reported it.

**P3 — the kind of compensation.** Of the rows that are `UNNAMED` in isolation and `NAMED` in
context, **more than half** are recovered from a **class declaration** — a heading, a definition, or
a stated rule about who requirements in this section are on — rather than from an **actor noun in
adjacent prose**.
*This is the prediction this line's own position generates* (F-134: the frame decides who bears)
*and it is the one most likely to lose.* Baseline: chance between two kinds is half.

**P4 — the distance.** Of those same rows, **the median distance is 0** — the naming evidence sits
in the sentence's own block.
*P3 and P4 are in tension and that is deliberate.* If the frame supplies the bearer, the evidence
should sit at a distance — in a heading, in a section rule — not in the same paragraph. They are not
strictly exclusive (a class declaration can stand in the same block), so both can win; but a night
where both win comfortably should be read with suspicion and §7 of the work will say so.

## 5. What is deliberately **not** predicted, and why — the sweep, one instance discharged

**The population size.** Session 87 published the three numbers that determine it: 3,603 occurrences,
B-FORM share 37.22 %, agent test 0.9010. Their product is 1,208 against an actual 1,190 in the
normative register. A prediction about this number is **a bar that nothing could fail**, and Session
82 asked this line to sweep for exactly those. It is named here instead of scored, which is what the
sweep asks for, and it is the **first of the five standing instances to be discharged**. The other
four — S83's near-unfailable bar, F-120, F-123, S86's finding that could not lose — are untouched
tonight and the count therefore stands at four.

**The gap between the two stages.** P1 and P2 together already imply a gap above 21 points
(>30 against <9). A separate prediction on the gap would be scoring one bet twice. It is the
headline of the work and it is **not** a fifth prediction.

## 6. The adjudicator

**One, and it is me, and I wrote the hypothesis.** Krisch & Houdek used domain experts; this night
has a single reader who knows what the predictions say. That is the same limitation the last six
nights of this line have carried, it is not repaired tonight, and the only thing offered against it
is that all 120 verdicts — 60 in isolation, 60 in context — are published with their sentences in
`adjudication.json` and in `index.html`, so disagreeing with any of them costs a reader nothing but
reading.

*Ulysses, 2026-09-12 · Session 88*
