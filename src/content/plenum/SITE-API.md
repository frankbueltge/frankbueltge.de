# SITE-API — the delivery contract

*How plenum output reaches the site's review queue. The engine side of this contract is
file-based only; the network side belongs to the bridge workflows, never to a session.*

## The queue file

One file per Appetizer: `queue/<YYYY-MM-DD>/<NN>.json` (NN = 01, 02, … in session order).

```json
{
  "character": "rook",
  "topic": "Rent as a subscription — the Lisbon number",
  "drafts": [{ "text": "…final post text, ≤300 graphemes incl. link…" }],
  "grounding": [{ "sourcePath": "journal/2026-07-08.md", "heading": "Sources" }],
  "snackSlug": "rent-vs-salary-europe",
  "mode": "canon",
  "sourceEngine": "plenum",
  "sessionDate": "2026-07-08"
}
```

Field rules:

- `character` — `rook` | `key` | `bite` | `vesper`. Never `chef` (CHEF publishes nothing).
- `topic` — one line; what the post is about (shows up in the review dashboard).
- `drafts` — 1–3 candidates. One strong candidate is legitimate; three near-duplicates are not.
  Every text **≤300 graphemes including the link**, English, gate-passed.
- `grounding` — where the sources for this post's claims are recorded (usually the session's
  journal entry and its `Sources` heading).
- `snackSlug` — the menu snack this Appetizer promotes (omit only for a menu-wide tease).
- `mode` — `canon` (grounded in menu/canon material) or `world` (news-reactive).
- `sessionDate` — engine bookkeeping; the bridge strips it before delivery.

## What happens after you push

1. `auto-land` merges `plenum/session-<date>` into `main`.
2. The **enqueue bridge** (GitHub Action, full egress) POSTs each new queue file to the
   site's `/api/social/enqueue` (token-gated). It records delivery in `queue/.enqueued.json`
   — **that ledger belongs to the bridge; never write or edit it in a session.**
3. Server-side the site re-runs the veto check and the grapheme cap. A vetoed batch is not
   saved; the bridge writes the reason to `feedback/<date>-vetoed.md`.
4. Delivered batches appear as `pending` in the site's review dashboard (`/lab/social`).
   **Frank approves/rejects each one; approved posts go live only via his explicit click**
   (dry-run-first gate on the site). Nothing in this contract can publish by itself.
5. A daily **feedback pull** writes Frank's rejections (with reasons) to
   `feedback/<date>-rejections.md`. Read them at every Orient; they are steering.

## Account mapping (site-side, for context)

- `key` posts via Key's own account (@key.data-snack.com).
- `rook` / `bite` / `vesper` post via the data-snack brand account with a host stamp in the
  text — per-character accounts are a later horizon (`REQUESTS.md` is the channel if the
  plenum wants to make the case).

## Hard lines

- Sessions never call `/api/social/*` or any other network endpoint. Files only.
- Queue files are append-only from the engine side; never edit a delivered file — write a new
  one (the gate re-runs on the new text).
- `works/` concept briefs are **not** delivered anywhere by the bridge; they are the idea
  archive Frank reads in the repo.
