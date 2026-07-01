# Meridian → Collective + Learning Memory — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve the single-agent `field-research` engine (Meridian) into an adversarial *collective* (conductor + role sub-agents) with a three-layer *learning memory* (curated + retrieval + consolidation), producing a body of work that matures over time.

**Architecture:** Reuse the `field-research` repo/route/identity. The nightly cloud session becomes a conductor that spawns role sub-agents through an adversarial gauntlet; works mature across sessions via `WORKBOARD.md` + `drafts/` (private) → `works/` (published). Memory: (A) curated in-repo knowledge base, (B) a **reusable semantic-recall CLI** with a BM25 default + optional embeddings, (C) periodic consolidation. Two cloud-side feasibility gates come first.

**Tech Stack:** Python 3.12 (memory tool + pipelines, pytest), Markdown constitutions, GitHub Actions, CCR cloud routine, the existing namespace-aware Astro integrator.

## Global Constraints

- **Reuse `field-research`** — no third repo. **Do not touch** `irrtum-als-methode`/Ulysses or the deterministic Protokoll/register.
- Specs: `2026-07-01-meridian-collective-design.md` + `2026-07-01-semantic-memory-tool-design.md`.
- **English** everywhere in the engine repo + site. **No vendor/product names** (call web tools "web research"; no "Claude" co-author trailer in any commit).
- **Git is the archive**: file-based committed index; embedding/retrieval run agent-side, **never** at site runtime. The lab site stays static.
- Verifiability: real retrievable URL or marked conjecture; **no fabricated data**.
- Site publishes only `journal/` + matured `works/`. `drafts/`, `memory/`, `WORKBOARD.md` stay in-repo, **not** on the site.
- Cadence target: ~every 3rd night. Sub-agent budget per cycle: ≤6, sonnet.

---

## Phase 0 — Feasibility gates (cloud-side; prove before building)

> These run in the CCR cloud environment, not locally. Each is a one-off probe run via a temporary prompt on the field-research routine (or a scratch run). Results decide the build path.

### Task 0.1: Probe — can a CCR session dispatch sub-agents?

**Files:** none (a scratch cloud run).

- [ ] **Step 1:** Temporarily set the field-research routine's `allowed_tools` to include the sub-agent/dispatch tool (Agent/Task) alongside the existing set (via `RemoteTrigger update`).
- [ ] **Step 2:** Fire a one-off run (`RemoteTrigger run`) with a probe prompt: *"Spawn one sub-agent that returns the string PROBE-OK, print its result, then stop. Do not commit anything."*
- [ ] **Step 3:** Inspect the run (claude.ai/code/routines) for `PROBE-OK` produced by a genuine sub-agent.
- [ ] **Result gate:** PASS → the collective uses conductor + sub-agents (Phase 2 "conductor" variant). FAIL → fallback: conductor **role-switches** within one session (Phase 2 "single-session" variant). Record the outcome in the plan before Phase 2.

### Task 0.2: Probe — can a CCR session produce embeddings cheaply?

**Files:** none (a scratch cloud run).

- [ ] **Step 1:** Fire a one-off run with a probe prompt: *"In Python, try `pip install --quiet sentence-transformers`, embed the string 'hello' with a small model (e.g. all-MiniLM-L6-v2), print the vector length and the wall-clock seconds. If it fails or takes >90s, print EMBED-IMPRACTICAL and stop. Commit nothing."*
- [ ] **Step 2:** Read the result.
- [ ] **Result gate:** PASS (fast, self-contained) → memory tool B gets the embedding backend as default. FAIL/`EMBED-IMPRACTICAL` → B ships **BM25-only** (Task 3–6 already make BM25 the default, so this is non-blocking). Record outcome.

---

## Phase 1 — Semantic memory tool B (reusable; BM25 default, embeddings optional)

> Buildable locally now. Lives at `field-research/tools/memory/` (self-contained, portable — extractable to a shared repo when Ulysses adopts it). Python + pytest.

### Task 1.1: Chunker

**Files:** Create `field-research/tools/memory/chunk.py`; Test `field-research/tools/memory/test_chunk.py`

**Interfaces:** Produces `chunk_markdown(text: str, path: str) -> list[dict]` → records `{"path": str, "heading": str, "text": str}`, split by markdown heading with the nearest heading carried as context.

- [ ] **Step 1:** Failing test:
```python
from chunk import chunk_markdown
def test_splits_by_heading_and_keeps_path():
    md = "# A\nalpha text\n\n## B\nbeta text"
    out = chunk_markdown(md, "journal/x.md")
    assert len(out) == 2
    assert out[0]["heading"] == "A" and "alpha" in out[0]["text"]
    assert out[1]["heading"] == "B" and out[1]["path"] == "journal/x.md"
```
- [ ] **Step 2:** Run `pytest field-research/tools/memory/test_chunk.py -v` → FAIL (no module).
- [ ] **Step 3:** Implement `chunk_markdown`: iterate lines, start a new chunk at each `#`/`##`/`###` heading, accumulate body, attach `path` + current heading; skip empty chunks.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit (`feat(memory): markdown chunker`).

### Task 1.2: BM25 index + recall (the always-works backend)

**Files:** Create `field-research/tools/memory/store.py`; Test `field-research/tools/memory/test_store.py`

**Interfaces:** Produces `build_index(chunks: list[dict]) -> dict` (BM25 stats + chunk records) and `recall(index: dict, query: str, k: int = 5) -> list[dict]` → top-k `{path, heading, text, score}`.

- [ ] **Step 1:** Failing test:
```python
from store import build_index, recall
def test_recall_ranks_relevant_chunk_first():
    chunks = [
        {"path":"a.md","heading":"Benford","text":"benford law digit distribution fraud"},
        {"path":"b.md","heading":"Cats","text":"cats are small animals"},
    ]
    idx = build_index(chunks)
    top = recall(idx, "digit fraud detection", k=1)
    assert top[0]["path"] == "a.md"
```
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement a compact BM25 (tokenise lowercased alphanum, doc-freq table, `k1=1.5`, `b=0.75`); `recall` scores all chunks, returns top-k with scores. No external deps.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit (`feat(memory): BM25 index + recall`).

### Task 1.3: Optional embedding backend (added only if Task 0.2 PASSED)

**Files:** Modify `field-research/tools/memory/store.py`; Test add to `test_store.py`

**Interfaces:** Produces `build_index(chunks, backend="bm25"|"embed")` and a `recall` that, for `embed`, uses cosine over stored vectors. Falls back to BM25 if the embedding import fails.

- [ ] **Step 1:** Failing test: `build_index(chunks, backend="embed")` returns records each with a numeric `vector`; `recall` returns the semantically-nearest chunk. (Guard the test with `pytest.importorskip("sentence_transformers")`.)
- [ ] **Step 2:** Run → FAIL/skip.
- [ ] **Step 3:** Implement: `embed` backend loads `all-MiniLM-L6-v2`, stores vectors; `recall` cosine-ranks. On ImportError → log + fall back to BM25.
- [ ] **Step 4:** Run → PASS/skip.
- [ ] **Step 5:** Commit. *(Skip this whole task if Task 0.2 FAILED — BM25 stands.)*

### Task 1.4: CLI (index / recall) + committed index format

**Files:** Create `field-research/tools/memory/cli.py`; Test `field-research/tools/memory/test_cli.py`

**Interfaces:** `python tools/memory/cli.py index <repo_root>` → writes `<repo_root>/memory/index.jsonl` (one JSON record per chunk incl. score fields/vector). `python tools/memory/cli.py recall "<query>" -k N` → prints JSON top-k. Reads `memory/index.jsonl`.

- [ ] **Step 1:** Failing test: build a tmp repo with two `journal/*.md`, run `index`, assert `memory/index.jsonl` exists with ≥2 records; run `recall` for a query, assert the matching path is returned.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement: `index` globs `journal/**.md`, `works/**.md`, `drafts/**.md`, `memory/dossiers/**.md`, chunks all, builds index, writes `memory/index.jsonl`. `recall` loads it, calls `recall()`. Backend auto: `embed` if available else `bm25`.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit (`feat(memory): index/recall CLI`).

### Task 1.5: README for the tool (reuse instructions)

**Files:** Create `field-research/tools/memory/README.md`

- [ ] **Step 1:** Write: purpose, `index`/`recall` usage, the committed `memory/index.jsonl` format, the BM25-default/embeddings-optional note, and "to reuse in another engine: copy `tools/memory/` and run `index` on that repo" (extraction to a shared repo noted as future).
- [ ] **Step 2:** Commit. Push `field-research`.

---

## Phase 2 — Collective constitution + memory A/C (field-research)

> Written to Task 0.1's result: **conductor variant** if sub-agent dispatch passed, else **single-session role-switching variant**. Same content otherwise.

### Task 2.1: Scaffold memory + workboard + drafts

**Files:** Create `field-research/WORKBOARD.md`, `field-research/memory/claims.md`, `field-research/memory/open-questions.md`, `field-research/memory/discarded.md`, `field-research/memory/dossiers/.gitkeep`, `field-research/drafts/.gitkeep`

- [ ] **Step 1:** Create each with a one-line header explaining its role (claims ledger: *finding · confidence · sources · contradictions*; workboard: *work · phase · thread*; discarded: *what · why*).
- [ ] **Step 2:** Commit.

### Task 2.2: Rewrite `PROTOCOL.md` → collective constitution

**Files:** Modify `field-research/PROTOCOL.md`

- [ ] **Step 1:** Rewrite from "single researcher" to **conductor of a collective**, covering exactly the spec: the session cycle (orient → decide move → build in `drafts/` → gauntlet → verdict → synthesise & land); the roles (named core Proposer/Skeptic/Interlocutor/Synthesiser + anonymous Builder/Verifier/specialists; conductor may add roles); the **ship threshold** (Verifier passes AND Skeptic's core objection answered; else rework/discard-with-reason; Interlocutor's critique published with the work); the **production-over-time** model (`WORKBOARD.md` + `drafts/` → `works/`, not one-per-session); **memory** (read curated `memory/` + call `python tools/memory/cli.py recall` for deep recall; update `memory/` each session; **consolidation** pass weekly); keep verifiability, no-fabrication, no-vendor-names, English, self-naming (collective name/lead is the engine's choice), Messlatte, reflexivity-as-signature-move. If Task 0.1 FAILED, phrase roles as *sequential hats within one session* instead of spawned sub-agents.
- [ ] **Step 2:** Cross-read against both specs — every element present.
- [ ] **Step 3:** Commit. Push `field-research`.

### Task 2.3: Update the routine (tool + cadence)

**Files:** none (RemoteTrigger `update` on `trig_01YYPEboQX7qktGW658pZrmj`).

- [ ] **Step 1:** If Task 0.1 PASSED: set `allowed_tools` to include the sub-agent dispatch tool. Keep web-research/Arxiv connectors.
- [ ] **Step 2:** Update the prompt to the collective conductor prompt (points at PROTOCOL.md; runs the cycle; sub-agents or hats per 0.1). Keep the "no vendor name / no product / English" rules.
- [ ] **Step 3:** Change `cron_expression` to ~every 3rd night — `0 1 */3 * *`.
- [ ] **Step 4:** Confirm via the update response (cron + prompt).

---

## Phase 3 — Integrate safety + activation

### Task 3.1: Confirm drafts/memory never publish

**Files:** Verify `.github/workflows/field-integrate.yml` (frankbueltge.de)

- [ ] **Step 1:** Confirm the integrate copies only `journal/` + `works/*.md` + the doc files — **not** `drafts/`, `memory/`, `WORKBOARD.md`. It already targets specific paths, so nothing new leaks.
- [ ] **Step 2:** Add an explicit note/`echo` in the workflow that drafts/memory are intentionally excluded (documentation guard). Commit + push frankbueltge.de.
- [ ] **Step 3:** Run `Field integrate` once; confirm `/field` shows no `drafts`/`memory` content and still renders Meridian's existing works.

### Task 3.2: First collective run + verify

**Files:** none (cloud run).

- [ ] **Step 1:** `RemoteTrigger run` the updated routine once.
- [ ] **Step 2:** Verify: a `research/` branch lands; the journal reads as a **deliberation** (proposer/skeptic/verifier/interlocutor/synthesiser); `WORKBOARD.md` updated; any new work sits in `drafts/` until it graduates; `memory/` updated; `memory/index.jsonl` (re)built.
- [ ] **Step 3:** Confirm the chain (auto-land → dispatch → field-integrate → deploy) still green and `/field` clean.

---

## Self-Review (plan ↔ specs)

- Collective spec: evolve-Meridian ✓ (Global + Phase 2) · conductor+roles ✓ (2.2, gated by 0.1) · production-over-time ✓ (2.1, 2.2) · gauntlet/kill ✓ (2.2) · memory A ✓ (2.1, 2.2) · B ✓ (Phase 1) · C ✓ (2.2 weekly consolidation) · cadence ✓ (2.3) · cost knob ✓ (Global) · feasibility gate ✓ (0.1).
- Memory-tool spec: index/recall ✓ (1.2, 1.4) · reusable/portable ✓ (1.5) · git-native committed index ✓ (1.4) · agent-side only ✓ (Global) · embeddings-with-BM25-fallback ✓ (1.2/1.3, gated by 0.2) · feasibility gate ✓ (0.2).
- Site stays static / drafts+memory private ✓ (3.1).
- Ulysses untouched ✓ (Global).
- Open items resolved to defaults: cadence `0 1 */3 * *`, BM25-default backend, `memory/` layout, identity → engine's choice.
