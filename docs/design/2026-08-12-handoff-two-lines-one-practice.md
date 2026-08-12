# Handoff — two lines, one practice

**Written:** 2026-08-12, at the end of a long session. **For:** the next session, which should
start from this document rather than from that session's transcript — half of the reasoning in it
was corrected while it ran, and reading it in order would mean learning the wrong things first.

**Status:** the work below is DONE and on `main` unless a line says otherwise. The open items in
§5 are not started.

---

## 1. What was decided, in Frank's words

> „Es geht ja hier darum auch parallel mit verschiedenen Protokollen, Verfassungen oder Setups und
> Richtungen zu experimentieren. Wahrscheinlich mache ich zukünftig noch mehr Forks, auch bei den
> anderen Praxen."

`error-as-method` is **not a fourth practice**. It is the Atelier running under a second
constitution. The ecology is meant to grow this way — more forks, of the other practices too.

The naming convention that follows from it is now binding and written into
`docs/wording-kanon.md` (§ "Ergänzung 2026-08-12"):

| Word | Job |
|---|---|
| **line** | what runs — a constituted strand of a practice. The Atelier runs **two**: the **nightly line**, the **work-line** |
| **constitution** | what governs and separates them — "One founding text, two constitutions" |
| **Protocol vN** | the constitution's number, always spelled out; never a name for a line |

Rejected, with reasons, so nobody proposes them again: naming lines after protocol numbers
(self-invalidating — the numbers move), "arm" (anatomy, not the point), Deleuzian vocabulary
(only *agencement* fits, and it needs a footnote), and "Ulysses v2/v3" (collides with Protocol
v2, the founding text — this confusion actually happened).

**The pyramid keeps three stations.** Lines live *inside* a station, never beside it, or the
ecology grows a corner per fork and a visitor understands nothing.

---

## 2. The finding this session is actually about

One failure, four instances, all the same shape: **a constitution is rewritten and the machinery
it named is left behind.** Nothing fails loudly, because a dead pointer in a protocol produces no
error — the session simply does not find what it was told to use and reads everything instead.

| what | v3 named it | v6 names it | consequence |
|---|---|---|---|
| the memory tool | ✓ 3× | **0×** | `SOURCE_GLOBS` never learned `projects/`; a line's whole record was unreachable by recall |
| the Research Foundation | in §3/§5.4/§11 | one appendix path | ~57,000 words with no part marked load-bearing |
| §8's size floors | written | written | **never counted** — SCORE 40,691 words against "a page" |
| **the rhizome** | ✓ 5× | **0×** | last updated 2026-07-18, session 43 — the last night |

> **A house that revises its constitution more often than its tools will always end up reading
> what it should be able to query.**

Full measurements: `docs/design/2026-08-12-the-floors-that-were-never-run.md`.

---

## 3. What was built and is live

**Constitutional (ulysses, Protocol v6 amended — no v7):**
- §8's floors are counted at the gate (`tools/validate_v4_projects.py`), **live lines only** — a
  CLOSED record is archive and is never compacted afterwards.
- Recall returns to §8; reading a record end to end is forbidden.
- The Foundation gets a named standing text under 4,000 words.
- **The open horizon is closed**: an arc ships or ends within twelve worked sessions, renewable
  once. Ticks no longer serve a line by default — only when it has a live pre-registered clause
  awaiting test.
- A line passes its arc gate only with **one pre-registered clause that can fail**, plus two
  conditions the practice found for itself: the pre-registration must be read adversarially
  before execution, and a selection step must be blind to the outcome.

**Memory, in every house that has records:**

| repo | before | after |
|---|---|---|
| ulysses | index blind to `projects/` | 330 files · 29 tests |
| field-research | four gaps, 57 files unreachable | 359 files · 39 tests |
| studio | **no recall at all**, against 585,000 words | 231 files · 23 tests |
| error-as-method | constitution promised an index it lacked | 83 files · 23 tests |

`machine-attention` deliberately skipped: 19 markdown files total, 16 of them `docs/`.

Each repo now carries `tools/memory/test_sources.py`, which fails if a record directory falls out
of the index — the check that did not exist for six weeks. `ulysses` additionally has
`tools/test_constitution_refs.py`: every path the constitution names must resolve or be declared
as living elsewhere.

**It worked, measurably.** The floor became countable at 23:21 UTC; at **23:44** the practice
compacted, in its own words *"compaction under the §8 floor"* — SCORE 40,691 → 891, TRACE 87,240 →
3,849. All four breaches gone by morning, unprompted.

**And it broke four site readers**, all repaired the same day (#572, #574): the dossier's trace
reading, the ledger's pinned coverage, the refrain's aspect floor, and a verbatim quote on
`/ecology`. One of them exposed a fortnight-old bug — the refrain parser looks for
`Dominant aspect: **home**` while the practice writes `**Aspect: territory**`, so every one of
those ticks read as an honest gap.

---

## 4. What is mixed up right now — the actual next job

Frank, on seeing it: *„hier sind [Wortlaut privat]. Auch bei den works, die
eigentlich reine ecology works sind."* He is right, and it is checkable:

- **`/works` lists the fork as a fourth source** — atelier 32 · field 22 · studio 6 ·
  error-as-method 5. The machinery already treats it as a peer practice.
- **The pyramid wording still says "three practices"** — five occurrences in
  `src/config/ecology-pyramid-wording.ts`. Text and code disagree, and that is exactly what feels
  mixed.
- **The 30 nightly-phase works are claimed twice**: they are the Atelier's works (made under
  Protocol v3) *and* the fork's inheritance. Same work, two addresses.
- **The pyramid rewrite (#560) removed the fork from `/atelier` entirely.** That page went from
  817 lines to 88; the fork statement, the ladder of constitutions and the fork branch on the map
  went with it. Only a single work link remains. This was a deliberate redesign, not a fault — but
  the differentiation Frank asked for at the start of the session is currently not on that page.

**The job:** put lines into the station sheet, inside the pyramid's own structure. Do not rebuild
the old 817-line page beside it.

---

## 5. Open, not started

*Items 1, 2 and 5 were taken up the same night this was written; what happened to them is in §7.
Items 3 and 4 stand as listed.*

1. ~~**The rhizome in the nightly line.**~~ **Closed 2026-08-12** — and the premise here was
   wrong. It was not an unclosed gap: sessions 45 and 47 had already decided it, in writing, and
   were waiting on Frank. See §7.
2. ~~**`archive/` is a protected path in `ulysses`.**~~ **Closed 2026-08-12.** Frank opened the
   path; the blocked rotations are merged. See §7.
3. ~~**The lines model in the frontend** (§4).~~ **Built 2026-08-13**, and §4's premise had
   turned over too — see §8.
4. **D4 from the floors spec** — shipping rate visible on the site. Never approved.
5. ~~**The refrain's aspect floor is weaker on a rotated record.**~~ **Restored 2026-08-12**, once
   item 2 made the rotated halves reachable. See §7.

---

## 6. Two cautions for whoever reads this

**Watch for line-wrapped strings.** Four times in one session a `grep` reported "missing" for text
that was plainly present, because markdown wraps at ~95 columns and a line-based search cannot see
across the break. Normalise whitespace before searching a constitution. Twice this produced a false
alarm that was nearly reported as a regression.

**A green PR is not a green gate.** Three times "fixed" was reported when only the next cause had
been uncovered. The atelier's integration gate was red for eight hours and went green only on the
fourth attempt. Wait for the thing that was actually broken, not for the check nearest to hand.

**And one thing that is not a caution but a result:** the strongest arguments in this session came
from Frank's objections, not from the analysis. *„ist das nicht zu oberflächlich?"* and *„eight
misprints ist aber in einer session entstanden"* each turned the diagnosis — the second one
reversed it. The first answer would have defended the open horizon.

---

## 7. What the next session did with §5 — written the same night

**A third caution, earned immediately: a handoff is a claim, not a finding.** The session that
read this document started where it said to start, and the first item did not survive contact.

**Item 1 — the rhizome. Not a gap; a decision waiting on an answer.** `error-as-method/REQUESTS.md`
already held the question, twice. Session 45 (2026-08-10) declined to rebuild `pulse/` and said
why — its own work `2026-07-15-the-third-pile` measures the apparatus pile at 61,223 words, 69 %
of the journal, structurally unable to shrink, so *"rebuilding an instrument on night one, before
there is anything here for it to measure, is starting that pile again deliberately."* It set
itself a deadline under the standing rule, no answer came, and session 47 closed it: *"The
repository wins; the protocol text is out of date on this point and I am not silently editing it.
If you want the closure index and the rhizome back, say so and I will build them."*

So the item was never a gap-closing job. It was one sentence from Frank, and he gave it: **both
back.** The answer is in the channel it was asked in, with the third-pile argument answered rather
than overruled — the rhizome did not die of being apparatus, it died of a change of unit (its
grammar is *work · thread · source*, and the atelier stopped making works). The practice builds
the files itself; nothing is copied from `ulysses/pulse/`. The atlas stays unbuilt.

**Item 2 — the archive. Traced to one line and opened.** `research-auto-land.yml` held `archive/`
in `PROTECT_RE` and absent from `ALLOW_RE`; the gate's checks passed and the workflow declined to
merge, which is why three PRs sat green and unmergeable. Frank chose the wide form — `archive/**`
becomes the practice's own — over an add-only carve-out, knowing that archived governance travels
with it. What holds instead: §5's human hand on *irreversible deletion or migration*, and a new
Gate 6 that reports any archive write which is not an addition, into the feedback file the next
session reads. #15 and #16 merged. #14 did not: one of the five sections it calls closed had been
**answered** hours earlier, so archiving it would have buried a fresh answer — closed as stale
with that reason, for the practice to redo now that it can land it alone.

**Item 5 — the floor, restored.** With the rotated halves reachable, `atelier-integrate.yml`
mirrors `archive/trace/` and `src/lib/atelier/trace-record.ts` composes live + rotated in record
order, for the dossier as well as the refrain. The running line reads 62 ticks again instead of 5,
and the 19-aspect floor is unconditional again.

**One thing found on the way, not fixed:** `governance-consistency.yml` in `ulysses` has been
**red before any of this** — the delegation still names Protocol v5 against a v6 constitution, and
v6 carries no self-development clause while the delegation still grants `PROTOCOL.md` on the
strength of one. That is a fifth instance of §2's finding, and the second half of it is a real
question for Frank: **may the practice still amend its own constitution unattended?**

---

## 8. The lines model, built — and §4 had turned over as well

**§4's first bullet was already fixed when it was written down.** `/works` no longer lists the
fork as a fourth source: `src/lib/engines/register.ts` gives it `ns: 'atelier'` and drops its
inherited half, with the reason in the file — *"it IS the Atelier's practice by descent … and only
its address differs"*. The repair was right, and it created the opposite fault: **within the
Atelier the two lines became indistinguishable**, which is what Frank actually saw. So the job was
never to separate a fourth practice out; it was to make one practice's two strands legible.

**What was built** (`src/lib/ecology/lines.ts` and its callers):

- **A line is attributed by the directory a work came from, then by its date.** The fork's works
  are the nightly line's whatever their date says; anything up to 2026-07-18 in the Atelier's own
  mirror is the first nightly era; everything after it is the work-line. Sniffing the URL would
  have worked until the first route rename — `LatestWork.dir` is the fact.
- **`/works` marks the line after the title**, never in the practice column: that column is
  fixed-width so titles align down the whole register, and a second word in it would have moved
  every title of every practice. The marker is a rule in the practice's own hairline, not a chip —
  a chip is a state the record put on a work (withdrawn, little daylight), and a line is neither a
  state nor a judgement.
- **The station sheet gained two rows, inside the station:** `lines` (each line with its own
  counted works) and `constitutions` — plural, because one row naming one law on a two-line
  practice leaves the other line ungoverned on the page. It reads today as
  *nightly line · 36 works · work-line · 2 works* / *v3 (nightly line) · v6 (work-line)*, which is
  the differentiation this whole handoff started from, in two lines of a status panel.
- **Both versions are read, never typed.** That required a fifth mirrored path: the nightly line's
  `PROTOCOL.md` (contract updated in that repository's `SITE-API.md`, mirror in
  `scripts/nightly/mirror.mjs`). Writing "v3" into a config would have been the exact fault §2 of
  this document is about.
- **A door to the other line.** The sheet's only trace of the nightly line was a link to whatever
  it made last night; a visitor could read the whole page and never learn the practice runs two
  lines at once. It is a door, not a station — the pyramid keeps three.

**What was NOT changed, deliberately: "three practices".** The five occurrences §4 lists are not
drift — three practices is the canon, and the code now agrees with it. What was missing was a word
for the level *below* a practice, and that is what the two rows add.

**Still open from §4:** the 30 nightly-phase works are still claimed by both eras in the sense that
they sit in the Atelier's mirror while belonging to the nightly line's history. That is now
*stated* rather than mixed — they carry the nightly marker — but the fork's `works/` still holds
its inherited copy, and only the mirror's cut keeps the site from counting them twice.
