# Semantic Memory Tool — design (shared, reusable)

Design spec · 2026-07-01 · for review · **layer B** of the memory architecture
(`2026-07-01-meridian-collective-design.md`)

## Purpose

A reusable **learning-memory retrieval layer** for the lab's autonomous engines. Any engine's
nightly cloud session can index its own archive (journal / works / `memory/` / sources) and later
**recall** the most relevant past material for a query — extending memory beyond the model's
context window. **Built once; consumed by every engine** (Meridian/the collective, Ulysses, future
ones). Git-native (committed index), agent-side (no site-runtime dependency; the lab site stays
static).

## Requirements

- **Index:** given an engine's repo, chunk + embed its markdown archive into a **committed** index
  file (chunks + vectors + provenance/path). Versioned in git.
- **Recall:** `recall(query, k)` → top-k chunks (text · source path · score) for the session to read.
- **Reusable:** one tool, pointed at any engine's archive — no per-engine code duplication.
- **Git-native + static-site-safe:** the index is a committed file; embedding + retrieval run in the
  cloud session (or a workflow), **never** at the site's build/runtime.
- **Honest:** retrieval returns real committed text with source paths; no fabrication; the recalling
  session still cites the underlying source, not "my memory".
- **Cheap upkeep:** incremental re-index of changed files nightly; full rebuild on consolidation (C).

## Architecture (defaults; resolved in the plan after the feasibility probe)

- **Embeddings (the open question):** run in the cloud session. Default preference: a **small local
  embedding model** (self-contained, free, no vendor dependency). Fallback: a cheap embedding
  endpoint. Decided by what is actually feasible/cheap in the CCR environment — see gate.
- **Store:** **file-based** committed index (e.g. `memory/index.jsonl` — one record per chunk:
  `{id, path, text, vector, updated}`). No runtime DB (fits "git is the archive"). Cosine similarity
  computed in-process at recall time.
- **Interface:** a small **CLI** the session calls via Bash — `memory index <repo>` and
  `memory recall "<query>" -k N` (JSON out). Simplest, git-native, trivially reusable across engines.
  (Option, later: wrap as an MCP tool so it's attachable as a first-class tool.)
- **Chunking:** by markdown section/heading with overlap; keep source path + heading for provenance.

## Feasibility gate (prove first, like the collective's sub-agent probe)

Can the CCR cloud session **produce embeddings cheaply** (small local model download + run, or a
usable endpoint)? Verify with a tiny probe before building the rest. **Fallback if impractical:**
keyword/BM25 retrieval + LLM re-rank — no embeddings, still a real recall layer, fully git-native.

## Consumers & rollout

1. Build + prove the tool standalone.
2. Wire it into **Meridian/the collective** first (it's the memory-hungry one).
3. Offer it to **Ulysses** and future engines (each indexes its own archive; same tool).

## Not in scope

- Site-runtime / visitor-facing search (the lab site stays static).
- Weight-level fine-tuning.
- A hosted vector database (file-based committed index only).
