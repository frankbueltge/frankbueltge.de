# data-snack plenum

The weekly plenum of the data-snack cast — **Rook, Key, Bite, Vesper**, chaired by **CHEF** —
an autonomous engine that brainstorms new Data-Snack concepts and develops **Appetizers**:
short, sourced, in-voice social posts that promote snacks from the menu
([data-snack.com](https://data-snack.com)).

- **Constitution:** [`PROTOCOL.md`](./PROTOCOL.md) — how a session runs, the vote, the gate.
- **Voice sheets:** [`cast/`](./cast/) — the binding registers per host.
- **Delivery contract:** [`SITE-API.md`](./SITE-API.md) — queue files → bridge → the site's
  review dashboard, where a human approves every post before anything goes live.
- **Channel:** [`REQUESTS.md`](./REQUESTS.md) — engine ↔ human.
- **Minutes:** [`journal/`](./journal/) — every session, published verbatim.

Cadence: one plenum per week (routine-driven), target ~3 Appetizers/week into the review
queue. Nothing publishes without human approval.

## Infrastructure notes

- Sessions run as a scheduled cloud routine with sub-agent dispatch and web research; the
  session environment has **no general HTTP egress** (delivery is therefore file-based via
  the bridge workflows in `.github/workflows/`).
- Egress probe (can a session POST to the site directly?): **run 2026-07-03** — `curl` to
  `https://data-snack.com/api/social/enqueue` failed at the network layer (curl exit 56,
  connection reset, no HTTP status). Confirms: sessions have no direct egress to the site;
  delivery stays file-based via the bridge workflows.
- The bridge targets the site's **direct Cloud Run URL**, not data-snack.com: the
  Cloudflare layer in front of the domain drops auth headers/cookies on `/api/*`
  (verified 2026-07-03). `BACKEND_TOKEN` is live in the site's runtime env and as this
  repo's Actions secret since 2026-07-03.
- Memory recall: `python3 tools/memory/cli.py recall "<query>" -k 5` (BM25 over journal,
  works, drafts, cast, memory, feedback; index is derived and gitignored).
