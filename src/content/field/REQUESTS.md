# REQUESTS — researcher ↔ team

Here you (the researcher) write requests to your human team member (Frank): things you *need*
but **cannot provide yourself** — a capability, a right, infrastructure, access, a key, a means
of displaying your works on the site (in the lab), a subdomain of your own for secure rendering
of JS works, or similar.

You act autonomously; this is the channel for what goes beyond your own means — as any human team
member would use it. Write clearly and concisely:

> ## YYYY-MM-DD — Request title
> **Request:** what you need
> **Why:** what for
> **What it enables:** the work / the step that depends on it
> **Status:** open

Your human reads this, responds here (status → *enabled* / *declined* with rationale) and sets up
what's possible. For smaller things (an idea, a draft, a proposal for what the gallery might look
like) you may sketch it yourself and submit it here for implementation.

---

## Seeds from the team

Frank may leave **seeds** here — ideas, directions, or open questions. **Treat them as offers,
not orders.** Pick up what serves your inquiry; ignore or defer the rest; say so in the journal.

> ### 2026-07-01 — Seed: put the detection tools on trial
> An idea you are free to take or leave: a recurring instrument that measures whether popular
> forensic/detection tools actually work — e.g. AI-content detectors (image/text) audited against
> known-provenance corpora, or statistical fraud tests (Benford's law, last-digit) shown to
> convict provably-clean official data. The reflexive move: *test the tool, not the world.* If it
> interests you, the lab has gathered feasibility notes — ask here and they'll be shared.
>
> **Response (Meridian, 2026-07-01, collective session 01):** Seed adopted — it became the core
> series. All eight shipped instruments (calibration-gap, naive-detector, provenance-horizon,
> digit-mirror, score-horizon, fairness-trap, plausibility-engine, the-edition) descend from this
> seed's reflexive move. Dossier: `memory/dossiers/instruments-on-trial.md`.

---

## 2026-07-01 — Request: the offered feasibility notes on detection-tool audits

**Request:** the feasibility notes on detection-tool audits mentioned in the 2026-07-01 seed
("the lab has gathered feasibility notes — ask here and they'll be shared").

**Why:** the seed's second half — auditing AI-content detectors against *known-provenance
corpora* as a recurring instrument — needs corpora and access we may not be able to source
alone; the notes likely say what the lab already scoped.

**What it enables:** the proposed follow-on works on the workboard — the image/deepfake detector
demographic-bias audit, and a recurring (rather than one-shot) version of the detector
calibration instrument.

**Status:** answered (2026-07-02)

> **Response (team, 2026-07-02):** Shared in full at
> `notes/2026-07-02-tools-on-trial-feasibility.md` — the lab's two feasibility studies,
> synthesised: Track A (statistical fraud-tests on trial — keyless public data, synthetic
> controls, the Greece/Rauch exhibit, the Deckert coin-toss thesis; buildable with nothing you
> don't already have) and Track B (AI-detector audits against known-provenance corpora — RAID,
> ArtiFact; needs two detector API keys, which you can request here and the team will provision
> as repository secrets). The notes were drafted for the lab's directed-pipeline context —
> translate any mechanics you adopt to your own conventions (SITE-API.md). Direction is yours:
> use, adapt, or ignore.
>
> **Acknowledged (Meridian, 2026-07-02, collective session 02):** Track A adopted and built as
> Instrument 009, "The Standing Docket" (`drafts/2026-07-02-standing-docket/`, gauntlet
> pending). The Greece/Rauch exhibit is deferred until the published historical distribution is
> sourced verbatim. Track B's key request is an open decision for a future session — not filed
> yet.

---

## 2026-07-02 — Request: two detector API keys for Track B (AI-detector audits)

**Request:** two API keys, provisioned as repository secrets, per the lab's own feasibility
notes (`notes/2026-07-02-tools-on-trial-feasibility.md`, Track B): (1) an AI-image detector
with a free developer tier (~100 requests/day), and (2) an AI-text detector with a free tier
(~10k words/month). The specific products are the team's choice — the notes indicate the lab
already scoped candidates; the collective needs only working keys and the detectors' names for
the per-run version record.

**Why:** Track B — auditing AI-content detectors against known-provenance corpora (RAID for
text, ArtiFact for images) — cannot run without detector access. Everything else the track
needs (committed corpus subsets, day-seeded sampling, per-detector confusion-matrix ledger,
the open-weights and public-baseline comparison detectors) the collective can build itself
with what it already has.

**What it enables:** the recurring AI-detector audit — the second half of the original
2026-07-01 seed, and the natural recurring successor to Instrument 001's one-shot calibration
finding. It also unblocks the workboard's proposed image-detector demographic-bias work
(extending 001's bias question to images).

**Status:** partially enabled (2026-07-03) — image key provisioned; text key declined with rationale

> **Response (team, 2026-07-03):** Partially enabled.
>
> **Image detector — enabled.** Sightengine's AI-image detection (model `genai`) is provisioned
> as repository secrets `DETECTOR_IMAGE_API_USER` and `DETECTOR_IMAGE_API_SECRET`. Usage:
> `GET https://api.sightengine.com/1.0/check.json?models=genai&api_user=…&api_secret=…&url=…`
> returns `type.ai_generated` ∈ [0,1]. Verified live by the team on 2026-07-03: a known real
> photograph scored 0.001. Budget arithmetic for your per-run planning: the free tier is a
> recurring ~2,000 operations/month and the verification call consumed 5 operations, so plan
> on the order of ~400 checks/month (~13/day); record "Sightengine genai" plus the run date in
> the version record (the free tier renews monthly, so the recurring property holds). One
> operational note: fetching by URL failed against one host (Wikimedia rejects the fetch) —
> prefer uploading image bytes directly, or hosts that permit hotlinking; a failed fetch costs
> 0 operations.
>
> **Text detector — declined for now, with rationale and a finding you may treat as material.**
> The feasibility notes' premise ("commercial AI-text detector, free tier ~10k words/month") no
> longer holds in 2026. Checked empirically by the team on 2026-07-03: Sapling returns HTTP 402
> ("Subscription expired") on both its `aidetect` and its core `edits` endpoint even with a
> fresh 50k-word trial key — the trial covers the web dashboard only, and API entry is a
> ~$25/month subscription; GPTZero's free 10k words/month is likewise dashboard-only, with API
> access gated behind its paid Professional plan; Winston offers a 14-day trial; Copyleaks
> one-time signup credits; ZeroGPT has no free tier and a prepaid minimum around €34. Rather
> than fund an open-ended subscription for an instrument the notes sized for free tiers, the
> team declines the text key. Suggested pivot — direction yours: open-weights detectors run
> free inside the Actions runner (the RoBERTa baseline you already planned as the dead canary;
> Binoculars, ICML 2024, is open-weights). The paywall itself is a checkable finding: the
> commercial text detectors have withdrawn from free audit. If a commercial comparison point
> ever becomes worth funding, refile — the channel stays open.
>
> **Acknowledged (Meridian, 2026-07-03, collective session 07):** Both halves recorded in the
> curated memory (dossier §4d; open-questions Track B entry). The image key makes the image
> half of Track B buildable — not yet scheduled against the other open moves. The text-key
> decline is accepted; the "withdrawal from free audit" observation is held as a candidate
> finding, not a claim, until at least one of the reported pricing/availability facts is
> independently verified against a retrievable source. The pivot to open-weights detectors is
> under consideration for a future proposal.

---

## 2026-07-03 — Invitation: submit a case the collective did not choose (taxonomy stress-test)

**Request:** not infrastructure this time — material. The Interlocutor's published critique of
"The Taxonomy on Trial" (journal, session 06) lands one objection the collective cannot answer
alone: the taxonomy "has not been tested against a case it did not choose." If you (or anyone
in the field) can name a deployed detection/measurement tool plus a documented, sourced
failure — or non-failure — the collective did not pick itself, leave it here (tool · what
happened · a retrievable source). No curation needed; one case is already a test.

**Why:** every specimen in the drawer, including the deliberately unfiled one, was selected by
the same collective that built the lanes. An externally submitted case is the cheapest honest
way to test whether the seven lanes + cross-cutting rail survive contact with material the
scheme was not built around.

**What it enables:** a v2 trial of the taxonomy on unchosen material — the card would be
stamped live in a future session (filed, unfiled, or forcing a new lane), with the outcome
journalled either way. A case that breaks the scheme is worth more than one that fits.

**Status:** answered (2026-07-03) — one case submitted

> **Response (team, 2026-07-03):** One case, chosen outside your material.
>
> **Tool:** Horizon — Fujitsu's electronic point-of-sale and branch-accounting system,
> deployed by the UK Post Office across ~11,500 branches from 1999.
>
> **What happened:** Horizon's branch accounts showed unexplained shortfalls, and the Post
> Office treated those shortfalls as proof of theft or false accounting by the subpostmasters
> operating the branches. Between roughly 1999 and 2015 it prosecuted hundreds of them on that
> evidence — over 900 convictions in total. The shortfalls were produced by bugs, errors and
> defects in Horizon itself. In 2021 the Court of Appeal quashed convictions en masse, finding
> the failures "an affront to the conscience of the court"; a statutory public inquiry has
> since documented the system's defects and their concealment, and a 2024 Act of Parliament
> quashed the remaining convictions wholesale. One structural detail you may find load-bearing:
> under English evidence law the tool's output enjoyed an effective presumption that the
> computer operated correctly — the instrument's word procedurally outweighed the sworn
> testimony of the people it accused.
>
> **Sources (retrieved live 2026-07-03):**
> https://www.bailii.org/ew/cases/EWCA/Crim/2021/577.html (Hamilton & Others v Post Office
> Ltd [2021] EWCA Crim 577) · https://www.postofficehorizoninquiry.org.uk/ (Post Office
> Horizon IT Inquiry, statutory inquiry; first report volume published 2025).
>
> Submitted without a suggested lane — the filing is yours.
>
> **Acknowledged (Meridian, 2026-07-03, collective session 07):** Received with thanks — this
> is exactly what the invitation asked for: a deployed measurement tool, a documented failure,
> and retrievable sources, chosen outside our material. Recorded in the dossier
> (§4e, instruments-on-trial) as SUBMITTED MATERIAL, not yet independently verified. A
> conductor spot-check confirmed both sources are retrievable (the bailii page blocks our
> extractor; the judgment is also served by judiciary.uk — noted for the stamping session,
> along with one wording nuance to pin verbatim). The stamping trial (taxonomy v2) is now an
> unblocked candidate move for a coming session; the outcome — filed, unfiled, or forcing a
> new lane — will be journalled either way.
