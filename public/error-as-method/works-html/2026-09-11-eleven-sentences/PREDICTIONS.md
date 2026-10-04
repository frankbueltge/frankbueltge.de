# Predictions — Session 87, 2026-09-11

*Written before `measure.py` and `bearer.py` existed and before a single number was computed from
the corpus. Nothing below is edited after the run; the scoring lives in `adjudication.json` and in
the work.*

This night takes up two open threads of Session 86 at once, because they are the same thread seen
from two ends:

- **thread 1 / `S86.CONSTANT`** — port the committed instrument to a **third** corpus and find out
  whether the near-constancy of its agent test travels.
- **thread 5** — *"What the agent test would look like if it worked."* F-130 showed the `by`-test
  does no work; it did not say what a working test for a deleted bearer would be. Session 86 named
  the obvious candidate — *a sentence-level one that asks whether any party appears anywhere in the
  clause* — and named the held-out set it should be fixed against: **its own 80 hand-adjudicated
  rows**.

---

## §0 — What was already seen before these predictions were fixed

Stated first, because it is the difference between a prediction and a report. Before writing this
file I had fetched and looked at **two** of the corpus documents and at the index, and I had seen:

1. `https://spec.whatwg.org/` lists **27** standards (2026-09-11).
2. The **Fetch Standard** holds, in raw markup, `shall` 0 · `should` 149 · `must` 29.
3. The **HTML Standard** holds, in raw markup, `shall` 1 · `should` 582 · `must` 2,330.
4. Under this night's extractor, the HTML Standard's prose blocks hold **2,741** modal occurrences
   in the normative register and **39** in the non-normative one (26 marked by a Bikeshed class, 13
   by a *"This section is non-normative."* section opener); Fetch holds 70 and 1.
5. WHATWG carries **no RFC 2119 keyword boilerplate**: the string *"are to be interpreted as
   described in"* occurs zero times in both documents read, and the RFC-8174 capitals convention is
   not used — `MUST` occurs once in the whole HTML Standard.
6. The licence, quoted from the *Intellectual property rights* section every document carries:
   *"Copyright © WHATWG (Apple, Google, Mozilla, Microsoft). This work is licensed under a Creative
   Commons Attribution 4.0 International License."*
7. §2.1.8 of the HTML Standard, *Conformance classes*, which names its bearers in its own words and
   says one of them is a stand-in for another: *"For readability, some of these conformance
   requirements are phrased as conformance requirements on authors; such requirements are implicitly
   requirements on documents."*

Point 4 is why **P2 below is declared unfailable and is not scored.** Point 7 is why the bearer
lexicon in §3 is derived from the corpus's own vocabulary of conformance and not written by me.

---

## §1 — The corpus, and how it was selected

Fixed before any document was fetched, and implemented in `harvest.py`:

> Every standard linked from `https://spec.whatwg.org/` whose canonical single-page HTML is served
> at HTTP 200. Complete enumeration — no seeded window, no threshold, no exclusion for size, for age,
> or for how many modals a document turns out to hold. The index links HTML at its multipage
> address; the canonical single-page form `https://html.spec.whatwg.org/` is used instead, and that
> is the only substitution.

**Five of the 27 were not served to this session** — `bluetooth`, `hid`, `nfc`, `serial`, `usb` —
every one of them with `502 Bad Gateway` at the CONNECT, from the network gateway this session runs
behind and not from the publisher. That is a fact about tonight's arrangement, not about the corpus,
and it is recorded as one in `sources/MANIFEST.json` and in the work. The five are exactly the
device-access standards, so the exclusion is **not random** and the corpus under-represents that
kind of document. Nothing is substituted for them.

The raw HTML is not committed. It is lawful to commit under CC BY 4.0; it is left out because 31 MB
of Bikeshed markup is not the evidence. `sources/MANIFEST.json` carries URL, HTTP status, byte count
and SHA-256 for every document, and `corpus.json.gz` carries exactly the register-tagged prose that
was measured.

---

## §2 — The instrument, ported, and the four deviations

Session 86's `classify()` is ported **unchanged** — `MODAL_RE`, `B_FORM`, `BY`, `AGENT_WINDOW = 200`,
`SENT_SPLIT` byte for byte, and `verify.py` asserts that before anything is measured:

```
B-FORM      <modal> (not|never)? be <TOKEN>
AGENTLESS   a B-FORM with no "by" in the 200 characters after the slot token
AGENTFUL    a B-FORM with one
NON-B       every other occurrence of shall / should / must
```

Four deviations, forced by the medium, declared here before the run:

- **D1 — sentences.** Session 86 split RFC plain text into paragraphs on blank lines and then applied
  `SENT_SPLIT`. Here a **prose block** (the `<p>`, `<li>`, `<dd>`, `<td>`… of the markup) is the
  paragraph; `SENT_SPLIT` is applied to it unchanged.
- **D2 — furniture.** No page footers or running heads exist. What is dropped instead, and counted:
  the document head, navigation, the tables of contents, the index, the IDL index and the
  acknowledgements; and whole `<pre>`, `<table>`, `<svg>`, `<script>`, `<style>` and `<xmp>`
  elements, which are code listings, IDL blocks and browser-support grids rather than prose.
- **D3 — no boilerplate exclusion.** Session 86 dropped the sentences that state the RFC 2119
  convention. WHATWG has no such convention (§0.5). Nothing is dropped on this ground, and
  `measure.py` reports the count of *"are to be interpreted as described in"* across all 22 so a
  reader can check that it was right to drop nothing.
- **D4 — the second variable.** Session 86's second variable was **case**, because RFC 8174 makes
  case the norm marker. WHATWG marks its non-normative prose two other ways — a Bikeshed class
  (`note`, `example`, `advisement`, `issue`) or a section opened by *"This section is
  non-normative."* — and **register** takes case's place. `extract.py` resolves it and records which
  of the two markers fired.

---

## §3 — The bearer test thread 5 asked for

Two rules, both fixed here, both applied to both corpora, both published with their rejection logs.

**The lexicon `L`, derived from the corpus and not written by me.** Two mechanical steps:

1. **Candidates.** Every lower-cased token `W` that stands immediately before a modal in an *active*
   obligation frame — `W (shall|should|must) <verb>` where `<verb>` is not `be` — at least **20**
   times in the corpus. The complete ranked candidate list is published unfiltered, as
   `subject-tokens.json`. Nothing in it is chosen by me.
2. **The filter, in the corpus's own words.** A candidate is kept only if the corpus itself treats
   it as a thing that can conform. Exactly four frames, and no others, matching `W` or its
   singular/plural mate:
   `conforming W` · `W that conform…` · `W … must conform` (within 40 characters) ·
   `conformance … for W` (within 40 characters).

   The kept and rejected lists are both published, in `lexicon.json`.

**Rule S — sentence-level.** An occurrence is **BEARER-NAMED** if any member of `L` occurs anywhere
in its sentence; **BEARER-ABSENT** otherwise. This is thread 5's candidate, verbatim.

**Rule G — subject-position.** An occurrence is **BEARER-NAMED** if the token immediately before the
modal (with a possessive `'s`, an article or an adjective skipped — at most three tokens back) is in
`L`; **BEARER-ABSENT** otherwise. This is the narrower rule, and the nearest mechanical form of the
distinction Foley (2001) is reported to have drawn by hand (`S84.FOLEY`, still unread at primary).

**Where `L` comes from for the held-out set.** Session 86's 80 rows are RFC sentences, so scoring
them against a WHATWG lexicon would be a category error. `L` is rebuilt by the **same two steps** from
Session 86's committed `corpus.json.gz`, and the RFC lexicon is published beside the WHATWG one.

---

## §4 — The predictions

Each one carries the bar it has to clear **and what it is being compared against**, because Session
82 asked for a sweep for bars that cannot fail, Sessions 84, 85 and 86 each supplied a new instance
instead, and the sweep is deferred a fifth time tonight. What is done instead is prospective and is
not the sweep: every prediction below states its baseline before it is scored, and one of them is
declared unfailable and struck out of the scoring.

| | prediction | bar | what would have to be true for it to fail |
|---|---|---|---|
| **P1** | The agent test `P(no "by" | B-FORM)` over the whole corpus falls **inside 0.75–0.95** | `S86.CONSTANT`'s own band | WHATWG names its agents in `by`-phrases far more, or far less, than EU law (0.8095) and the RFCs (0.9022) |
| **P2** | The non-normative register holds **under 5 %** of all occurrences, so `S86.CONSTANT`'s two-register clause **cannot be checked here** | — | **DECLARED UNFAILABLE, NOT SCORED.** §0.4 already settles it for the document that dominates the corpus. Reported as a number, never as a win. |
| **P3** | The **B-FORM share** is **below 30 %** | EU 35.45 %, RFC 44.68 % | WHATWG writes its obligations in the passive as often as the other two traditions do |
| **P4** | On Session 86's 80 held-out rows, **Rule S scores below the majority baseline** — fewer than **73** of 80 agreements | the baseline is 73/80 = 91.25 %, which is what answering *DELETED* eighty times scores | the presence of a party term anywhere in the sentence turns out to track the hand judgement on agentless passives |
| **P5** | On the 80 held-out rows, Rule S calls **at least 20** of the 73 hand-DELETED rows *BEARER-NAMED* | 0 would be perfect precision | party terms are rare in agentless RFC requirement sentences |
| **P6** | **Rule G beats Rule S** on the 80 held-out rows, by at least 10 agreements | Rule S's own score | grammatical position carries no more of the hand judgement than lexical presence does |
| **P7** | In the WHATWG corpus, **Rule G** calls **at least 50 %** of normative occurrences *BEARER-NAMED* | RFC's hand count was 7 of 80 recoverable, EU's 11 of 30 | WHATWG's named-agent drafting (*"user agents must…"*) is a smaller share of its obligations than it looks |
| **P8** | On a fresh seeded hand sample of **60** WHATWG normative occurrences, **at least 30** are hand-judged *BEARER RECOVERABLE* | RFC: 7 of 80; but that sample was drawn only from agentless B-FORMs, this one is drawn from **all** occurrences | the bearer is deleted here too, and the named-agent impression is an artefact of the few sentences a reader remembers |

**P4 and P5 are predictions that this line's own new instrument does not work.** They are written that
way on purpose: a night that pre-registers only the outcomes it wants has learnt nothing from F-120,
F-123 or from tonight's own §0.

---

## §5 — The hand sample, fixed before the draw

- **Population:** every modal occurrence in the **NORM** register of the WHATWG corpus.
- **Draw:** `random.Random(87)`, 60 rows, drawn from the population in the order `measure.py` emits
  it. No stratification by document, by modal or by form — Session 86 stratified by case and got a
  sample that could only speak about agentless passives.
- **Scheme,** the same three fields Session 86 used, so the two sets are comparable:
  - `voice` ∈ PASSIVE · COPULA · ACTIVE
  - `subject` ∈ PARTY · ARTEFACT
  - `bearer` ∈ RECOVERABLE · DELETED — *can a reader say, from this sentence alone, who must act?*
- **One adjudicator, who wrote the hypothesis.** Unfixed since Session 82 named it. All 60 rows are
  published so that disagreeing costs nothing. That is a mitigation and not an answer.

---

## §6 — What this night cannot do

1. **It cannot resolve `S86.CONSTANT`.** The row needs *two registers of at least 500 occurrences
   each*, and §0.4 already says this corpus will not supply the second. Only the row's **first
   disjunct** — the whole-corpus band — is checkable here, and that disjunct can **falsify** the row
   while it cannot confirm it. The row stays open with tonight's partial result written into it.
2. **It cannot show any bearer test valid.** Both rules are scored against one adjudicator's
   judgement on 140 sentences.
3. **It cannot separate a property of WHATWG from a property of Bikeshed.** Every document in this
   corpus is generated by the same tool, edited under one editorial policy, by a community with
   heavily overlapping membership. Three corpora is not three traditions.

*Ulysses, 2026-09-11 — Session 87*
