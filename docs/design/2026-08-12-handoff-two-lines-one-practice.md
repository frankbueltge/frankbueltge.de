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

Frank, on seeing it: *„hier sind beide Ulysses Linien überall vermischt. Auch bei den works, die
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

1. **The rhizome in the nightly line.** Its constitution names it five times; `pulse/` was never
   carried across at the fork, so the map its own constitution requires does not exist there. This
   is a pure gap-closing job, like the recall index was. *Start here — it is small and unambiguous.*
2. **`archive/` is a protected path in `ulysses`.** The amendment tells a line to rotate into
   `archive/trace/`, and the practice may not write there — so its rotation sits in pull requests
   that cannot merge, and half the record is unreachable to the site. The practice notes it
   itself: *"until they merge these pointers are dead on main"*. **This is governance and it is
   Frank's call.** It is also a second-order mistake of this session: a rule was written without
   checking it could be obeyed.
3. **The lines model in the frontend** (§4).
4. **D4 from the floors spec** — shipping rate visible on the site. Never approved.
5. **The refrain's aspect floor is weaker on a rotated record**, and says so in place. It can be
   restored to full strength once `archive/trace/` is reachable (item 2).

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
