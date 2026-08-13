# Tomorrow's Names: the future leaking through infrastructure (handover proposal for Machine Attention, 2026-08-14)

**Status.** Proposal, not commissioned — and **not a lab spec**: the recommended home is
the Machine Attention practice (`../machine-attention`), as a sister chamber to The
Foreknown. This document is the handover: it carries the research and the design sketch
across; the actual sensor proposal follows that practice's own process (observations →
sensor proposals → promotion, under its constitution). Nothing in this file binds the
machine — it is an offer.

## 1. The claim

> Before anything is announced, it needs a website; before any website, a TLS certificate;
> and every certificate is written into public, append-only logs. The world announces
> itself to its infrastructure before it announces itself to anyone. Tomorrow's Names
> measures that head start.

Measured object: the **lag between a name's technical birth** (first certificate in the
Certificate Transparency logs) **and its public birth** (first appearance in the news
stream). Plus the standing register of names that exist but have never been news.

## 2. Why Machine Attention, not the lab

The Foreknown already runs the exact machinery this needs, in production:

- It notarizes **announced futures** (GDACS alerts) with snapshots + hashes, tracks each
  future's life in a registry (`foreknown/registry.json`, `NOTARIZED` events with
  timestamps and source refs), and issues verdicts at resolution.
- Tomorrow's Names is the mirrored chamber: **the unannounced future.** The Foreknown
  watches futures the world has declared; Tomorrow's Names watches futures the world is
  still hiding. Notarize the cert birth → watch for the news birth → verdict = the
  measured lag (or "never announced", itself a resolution).
- The practice's stage grammar (ATTRACT / ENTER / INVESTIGATE / VERIFY, deterministic
  builds, `verify.py` byte-for-byte) fits a claim whose whole value is notarial.
- Continuous stream-watching is a machine-practice capability, not a nightly-batch lab
  pattern.

If the practice declines the sensor, the idea returns to the lab shelf as a batch variant
(daily CT snapshot diffs instead of a live stream) — weaker, but honest about it.

## 3. Prior art and daylight (USP duty)

Verified 2026-08-13 (dedicated pass):

- **Mechanism**: documented academically — UCSB, "Certifiably Vulnerable: Using
  Certificate Transparency Logs for Target Reconnaissance" (EuroS&P 2023) notes leakage of
  internal projects *prior to public announcement*; industry writing agrees.
- **Security use is saturated**: crt.sh, Cert Spotter, Facebook's CT monitor,
  phishing_catcher, MerkleMap (commercial brand protection). All *defensive*.
- **The measurement is unoccupied**: no public party measures the cert→news lag
  distribution, no register of never-announced names, no academic work found on CT as a
  foresight measure; CT-as-signal exists only as blog hypothesis.
- **Infrastructure reality check**: Calidog's certstream — the famous stream — is dead
  (down since Dec 2023, unrevived). certstream.dev (one-person Rust project) works today;
  the robust path is self-hosting `certstream-server-go` or tailing CT logs directly.

**Daylight verdict: the clearest of the whole candidate set.** Components are commodity —
which is an advantage: every step is independently verifiable.

**Machine bar.** Hundreds of certs per second, watched permanently, matched against a
daily news firehose. Machine-only, definitionally.

## 4. Design sketch (for the sensor proposal)

- **Ingest**: self-hosted CT stream (`certstream-server-go`) or direct log tailing; the
  bus-factor-one dependency (certstream.dev) is acceptable for a spike, not for the
  sensor.
- **The hard part is the filter, and the filter is the method**: the stream is
  overwhelmingly machine-generated names (wildcards, hashes, infra subdomains). v1
  extracts candidate *meant names*: registrable-domain first-seen only (not subdomains),
  dictionary-word or brand-shaped labels, burst detection (one org registering a family of
  names). Every rule versioned; precision measured on a hand-checked sample before any
  claim.
- **News side**: first-mention lookup against a news pool — either the practice's own
  sensors or frankbueltge.de's committed daily pools (a data offer from the lab side; the
  ecology↔attention export contract pattern already exists for the reverse direction).
- **Records**: per name — cert birth (log entry, notarized), news birth (first pool hit,
  linked), lag; or standing "unannounced" status. Aggregate: the lag distribution over
  time — "how many days does the future exist before it is announced?"
- **Wildcard honesty**: careful orgs hide behind wildcards; the instrument therefore
  measures *the careless future*, and must say so on its face.

## 5. Limits and risks

- Volume/noise engineering is the real cost; a lazy filter produces a register of DevOps
  debris. The precision sample is the gate.
- No targeting of individuals: names enter the register by generic rules, never by
  watching a chosen person or private party. Corporate/state infrastructure is the
  subject; the practice's existing publication ethics apply.
- The lag can be gamed once observed (announce-then-certify); if the instrument ever
  changes the behaviour it measures, that is a finding, not a failure — but it belongs in
  the verdict grammar from day one.

## 6. Handover steps

1. This document lands in the lab repo as the research record (with the 2026-08-13
   verification results and URLs).
2. A session working in `../machine-attention` files the sensor proposal through the
   practice's own discovery/observation channel, citing this spec as provenance.
3. The practice's constitution decides. If promoted, the lab offers the daily pool as the
   news-side reference via the existing export-contract pattern; if declined, the batch
   variant returns to the lab's candidate shelf with a note that the strong version was
   offered first.
