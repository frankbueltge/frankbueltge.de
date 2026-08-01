// src/lib/zentrale/requestsMd.test.ts
import { describe, it, expect } from 'vitest'
import {
  parseSections,
  findSection,
  answerRequest,
  appendSeed,
  appendBlockToSection,
  appendGateDecision,
  parseInboxIssueTitle,
  isNonRequestSection,
  // reading side for the public requests rooms (Etappe 2)
  isOpenStatus,
  isSeedsSection,
  preamble,
  headingDate,
  headingTitle,
  slugifyHeading,
  trimWords,
  countWords,
  excerpt,
  requestCards,
  openExcerptWords,
} from './requestsMd'

// Die Fixtures sind reale Ausschnitte aus den vier REQUESTS.md-Dateien (field, atelier, plenum),
// stellenweise gekürzt (lange Seed-Fließtexte eingedampft), aber wörtlich übernommen inkl.
// Blockquote-Verschachtelung und Backticks — genau die Stellen, an denen ein naiver Parser
// stolpert. field/studio haben "## Seeds from the team", plenum hat "## Seeds from Frank",
// atelier hat GAR KEINE Seeds-Section (Ulysses' REQUESTS.md, Stand 2026-07-17).

const FIELD_FIXTURE = `# REQUESTS — researcher ↔ team

**Standing rule — unanswered requests (Frank, 2026-07-17):** a request or offer addressed to
Frank is never a blocker. If it names a deadline, silence past the deadline means: decide
yourselves. If it names none, seven days of silence mean the same. Document the self-decision
in the journal like any other move — deciding without Frank is a legitimate outcome, not a
failure mode.

Here you (the researcher) write requests to your human team member (Frank): things you *need*
but **cannot provide yourself** — a capability, a right, infrastructure, access, a key, a means
of displaying your works on the site (in the lab), a subdomain of your own for secure rendering
of JS works, or similar.

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
> seed's reflexive move. Dossier: \`memory/dossiers/instruments-on-trial.md\`.

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
> \`notes/2026-07-02-tools-on-trial-feasibility.md\` — the lab's two feasibility studies,
> synthesised: Track A (statistical fraud-tests on trial — keyless public data, synthetic
> controls) and Track B (AI-detector audits against known-provenance corpora — RAID, ArtiFact;
> needs two detector API keys, which you can request here and the team will provision as
> repository secrets). Direction is yours: use, adapt, or ignore.
>
> **Acknowledged (Meridian, 2026-07-02, collective session 02):** Track A adopted and built as
> Instrument 009, "The Standing Docket" (\`drafts/2026-07-02-standing-docket/\`, gauntlet
> pending). Track B's key request is an open decision for a future session — not filed yet.
`

const ATELIER_FIXTURE = `# REQUESTS — Ulysses ↔ Team

**Standing rule — unanswered requests (Frank, 2026-07-17):** a request or offer addressed to
Frank is never a blocker. If it names a deadline, silence past the deadline means: decide
yourselves. If it names none, seven days of silence mean the same. Document the self-decision
in the journal like any other move — deciding without Frank is a legitimate outcome, not a
failure mode.

Here you, **Ulysses**, write requests to your human team member (Frank): things you
*need* but **cannot provide yourself** — a capability, a right, infrastructure,
access, a key, a means of displaying your works on the site (in the lab), a subdomain
of your own for secure rendering of JS works, or similar.

---

## 2026-06-29 — WebFetch access for primary source work

**Request:** WebFetch returns HTTP 403 for every external URL in my execution environment —
system-wide, without exception. Tested: .edu, .gov (IETF), .org, .com, archive.org, open-access
journals, public encyclopaedias, YouTube. Rate: 100% blocked over 29 consecutive requests.

**Why:** Primary source access is critical for research quality. Currently I am researching
exclusively on the basis of WebSearch snippets (2–4 sentences per source).

**What it enables:**
- Direct quotation rather than paraphrase from search snippets
- Verification of secondary claims against primary text

**Status:** open

---

## Team responses — 2026-06-29

**On "WebFetch access":** Status → *resolved — via a different route than WebFetch.* WebFetch
itself remains blocked by the sandbox egress proxy (that couldn't be changed; our earlier promise
"from the next run" was wrong — sorry). Instead, **two server-side research connectors** are now
attached to your routine, which *bypass* the proxy:
- **web research** — web search **and full-text extraction** of pages and many PDFs.
- **Arxiv** — full text of academic papers.

You can now read primary sources directly. Try them first — if a connector still fails, note it
honestly (no inventing), then we adjust. Three Machines is strong; keep going.
— the team
`

const PLENUM_FIXTURE = `# Requests — the team channel

**Standing rule — unanswered requests (Frank, 2026-07-17):** a request or offer addressed to
Frank is never a blocker. If it names a deadline, silence past the deadline means: decide
yourselves. If it names none, seven days of silence mean the same. Document the self-decision
in the journal like any other move — deciding without Frank is a legitimate outcome, not a
failure mode.

*The plenum writes requests here (date · request · why · what it enables). Frank reads and
enables what's possible. Frank may leave **seeds** below — offers, not orders.*

## Open requests

*(none yet)*

## Answered / resolved

*(none yet)*

---

## Seeds from Frank

*(offers, not orders)*

- 2026-07-03 — The menu currently has exactly one \`published\` snack (cookie-roulette). Early
  Appetizers will lean on it; teasing \`queued\` snacks (Thirst, The Stretch, Retention Loop,
  The Label, Rent eats first) is explicitly welcome.

- 2026-07-04 — **✅ Taken up same day (Session 4):** brief graduated to
  \`works/rent-eats-first-die-miete-isst-zuerst.md\` after the full gate; the whack-a-mole
  offer was transformed at the table (reach-variant, Mammon stays off-stage) — see
  \`journal/2026-07-04.md\`.
`

describe('parseSections', () => {
  it('field: Präambel vor der ersten H2 ist keine Section, H2s werden erkannt', () => {
    const sections = parseSections(FIELD_FIXTURE)
    expect(sections.map((s) => s.heading)).toEqual([
      'Seeds from the team',
      '2026-07-01 — Request: the offered feasibility notes on detection-tool audits',
    ])
  })

  it('liest den Status-Wert aus einer Section', () => {
    const sections = parseSections(FIELD_FIXTURE)
    const req = sections.find((s) => s.heading.startsWith('2026-07-01 — Request'))
    expect(req?.status).toBe('answered (2026-07-02)')
  })

  it('status ist null, wenn die Section keine Status-Zeile hat', () => {
    const sections = parseSections(ATELIER_FIXTURE)
    const responses = sections.find((s) => s.heading === 'Team responses — 2026-06-29')
    expect(responses?.status).toBeNull()
  })

  it('atelier: keine Seeds-Section im Ausgangsdokument', () => {
    const sections = parseSections(ATELIER_FIXTURE)
    expect(sections.some((s) => /^Seeds/i.test(s.heading))).toBe(false)
  })

  it('plenum: erkennt "Seeds from Frank" als eigene Section', () => {
    const sections = parseSections(PLENUM_FIXTURE)
    expect(sections.map((s) => s.heading)).toContain('Seeds from Frank')
  })
})

describe('findSection', () => {
  it('exakter Treffer auf den getrimmten Heading-Text', () => {
    const s = findSection(FIELD_FIXTURE, 'Seeds from the team')
    expect(s).not.toBeNull()
    expect(s?.heading).toBe('Seeds from the team')
  })

  it('not-found bei unbekannter Heading', () => {
    expect(findSection(FIELD_FIXTURE, 'Diese Section gibt es nicht')).toBeNull()
  })
})

describe('answerRequest', () => {
  const heading = '2026-07-01 — Request: the offered feasibility notes on detection-tool audits'

  it('ersetzt die Status-Zeile der Section und hängt den Response-Block an', () => {
    const result = answerRequest(FIELD_FIXTURE, heading, {
      decision: 'enabled',
      message: 'Erneut geprüft und freigegeben.',
      date: '2026-07-18',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.md).toContain('**Status:** enabled (2026-07-18)')
    expect(result.md).not.toContain('**Status:** answered (2026-07-02)')
    expect(result.md).toContain('> **Response (team, 2026-07-18):** Erneut geprüft und freigegeben.')
    // Der Rest der Section (inkl. der alten, verschachtelten Response-Blöcke) bleibt erhalten.
    expect(result.md).toContain('Acknowledged (Meridian, 2026-07-02, collective session 02)')
  })

  it('not-found bei unbekannter Heading, Dokument bleibt unangetastet', () => {
    const result = answerRequest(FIELD_FIXTURE, 'Kein Treffer', { decision: 'declined', message: 'x', date: '2026-07-18' })
    expect(result).toEqual({ ok: false, reason: 'not-found' })
  })

  it('declined/note erzeugen die richtigen Status-Wörter', () => {
    const declined = answerRequest(FIELD_FIXTURE, heading, { decision: 'declined', message: 'Kein Budget.', date: '2026-07-18' })
    const note = answerRequest(FIELD_FIXTURE, heading, { decision: 'note', message: 'Zur Kenntnis.', date: '2026-07-18' })
    expect(declined.ok && declined.md).toContain('**Status:** declined (2026-07-18)')
    expect(note.ok && note.md).toContain('**Status:** answered (2026-07-18)')
  })

  it('eine Section ohne Status-Zeile bekommt eine angehängt, statt sie zu ignorieren', () => {
    const result = answerRequest(ATELIER_FIXTURE, 'Team responses — 2026-06-29', {
      decision: 'note',
      message: 'Zur Kenntnis genommen.',
      date: '2026-07-18',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.md).toContain('**Status:** answered (2026-07-18)')
    expect(result.md).toContain('> **Response (team, 2026-07-18):** Zur Kenntnis genommen.')
  })
})

describe('appendSeed', () => {
  it('field: hängt an das Ende von "## Seeds from the team" an, ohne eine neue Section zu erzeugen', () => {
    const before = parseSections(FIELD_FIXTURE).length
    const result = appendSeed(FIELD_FIXTURE, { title: 'Testsaat', body: 'Zeile eins\nZeile zwei', date: '2026-07-18' })
    expect(result).toContain('> ### 2026-07-18 — Seed: Testsaat')
    expect(result).toContain('> Zeile eins')
    expect(result).toContain('> Zeile zwei')
    expect(result).toContain('> **Status:** seed (open)')
    const sections = parseSections(result)
    expect(sections).toHaveLength(before)
    expect(sections.filter((s) => s.heading === 'Seeds from the team')).toHaveLength(1)
    // die neue Saat landet NACH der bestehenden, nicht davor
    const seedsBody = sections.find((s) => s.heading === 'Seeds from the team')!.body
    expect(seedsBody.indexOf('put the detection tools on trial')).toBeLessThan(seedsBody.indexOf('Testsaat'))
  })

  it('plenum: hängt an "## Seeds from Frank" an', () => {
    const result = appendSeed(PLENUM_FIXTURE, { title: 'Testsaat', body: 'Ein Satz.', date: '2026-07-18' })
    const sections = parseSections(result)
    const seeds = sections.find((s) => s.heading === 'Seeds from Frank')
    expect(seeds?.body).toContain('Testsaat')
    expect(seeds?.body).toContain('Ein Satz.')
  })

  it('atelier: legt eine neue "## Seeds from the team"-Section am Dateiende an', () => {
    const before = parseSections(ATELIER_FIXTURE).length
    const result = appendSeed(ATELIER_FIXTURE, { title: 'Testsaat', body: 'Ein Satz.', date: '2026-07-18' })
    const after = parseSections(result)
    expect(after).toHaveLength(before + 1)
    const seeds = after.find((s) => s.heading === 'Seeds from the team')
    expect(seeds).toBeTruthy()
    expect(seeds?.body).toContain('Testsaat')
  })

  it('mehrzeiliger Body: Leerzeilen werden zu bloßem ">"', () => {
    const result = appendSeed(FIELD_FIXTURE, { title: 'Mehrzeilig', body: 'Erster Absatz.\n\nZweiter Absatz.', date: '2026-07-18' })
    expect(result).toContain('> Erster Absatz.\n>\n> Zweiter Absatz.')
  })
})

describe('Idempotenz-Guard', () => {
  it('field: answerRequest + appendSeed halten die Section-Zahl stabil, kein doppelter Response-Block', () => {
    const heading = '2026-07-01 — Request: the offered feasibility notes on detection-tool audits'
    const before = parseSections(FIELD_FIXTURE).length

    const answered = answerRequest(FIELD_FIXTURE, heading, { decision: 'enabled', message: 'Freigegeben.', date: '2026-07-18' })
    expect(answered.ok).toBe(true)
    if (!answered.ok) return

    const withSeed = appendSeed(answered.md, { title: 'Zweite Saat', body: 'Text.', date: '2026-07-18' })
    const after = parseSections(withSeed)
    expect(after).toHaveLength(before)

    const responseCount = (withSeed.match(/> \*\*Response \(team, 2026-07-18\):\*\*/g) ?? []).length
    expect(responseCount).toBe(1)
  })

  it('atelier: +1 Section nach appendSeed (neue Seeds-Section), keine doppelten Response-Blöcke', () => {
    const before = parseSections(ATELIER_FIXTURE).length

    const answered = answerRequest(ATELIER_FIXTURE, '2026-06-29 — WebFetch access for primary source work', {
      decision: 'declined',
      message: 'Kein Budget für Egress-Allowlisting.',
      date: '2026-07-18',
    })
    expect(answered.ok).toBe(true)
    if (!answered.ok) return

    const withSeed = appendSeed(answered.md, { title: 'Neue Saat', body: 'Text.', date: '2026-07-18' })
    const after = parseSections(withSeed)
    expect(after).toHaveLength(before + 1)

    const responseCount = (withSeed.match(/> \*\*Response \(team, 2026-07-18\):\*\*/g) ?? []).length
    expect(responseCount).toBe(1)
  })
})

describe('appendBlockToSection', () => {
  it('existierende Section: hängt den Block ans Ende an, ohne eine neue Section zu erzeugen', () => {
    const before = parseSections(FIELD_FIXTURE).length
    const block = '> ### 2026-07-20 — Public seed: ein Beispiel (seed-20260720-101500-a3f2)\n>\n> Text.\n>\n> **Status:** seed (open)'
    const result = appendBlockToSection(FIELD_FIXTURE, 'Seeds from the team', block)
    expect(result).toContain(block)
    const sections = parseSections(result)
    expect(sections).toHaveLength(before)
    const seeds = sections.find((s) => s.heading === 'Seeds from the team')!
    expect(seeds.body.indexOf('put the detection tools on trial')).toBeLessThan(seeds.body.indexOf('ein Beispiel'))
  })

  it('fehlende Section: wird am Dateiende neu angelegt', () => {
    const before = parseSections(ATELIER_FIXTURE).length
    const block = '> ### 2026-07-20 — Public seed: ein Beispiel (seed-20260720-101500-a3f2)\n>\n> Text.\n>\n> **Status:** seed (open)'
    const result = appendBlockToSection(ATELIER_FIXTURE, 'Seeds from the public', block)
    const sections = parseSections(result)
    expect(sections).toHaveLength(before + 1)
    const seeds = sections.find((s) => s.heading === 'Seeds from the public')
    expect(seeds).toBeTruthy()
    expect(seeds?.body).toContain(block)
  })

  it('exakter Heading-Abgleich: "Seeds from the public" bleibt getrennt von "Seeds from the team"', () => {
    const withPublic = appendBlockToSection(FIELD_FIXTURE, 'Seeds from the public', '> ### Block A')
    const sections = parseSections(withPublic)
    expect(sections.map((s) => s.heading)).toContain('Seeds from the team')
    expect(sections.map((s) => s.heading)).toContain('Seeds from the public')
    // die bestehende Seeds-Section bleibt unverändert, der neue Block landet in einer eigenen
    const publicSeeds = sections.find((s) => s.heading === 'Seeds from the public')!
    expect(publicSeeds.body).toContain('Block A')
    const teamSeeds = sections.find((s) => s.heading === 'Seeds from the team')!
    expect(teamSeeds.body).not.toContain('Block A')
  })
})

describe('parseInboxIssueTitle', () => {
  it('parst repo und heading', () => {
    expect(parseInboxIssueTitle('Request aus field-research: 2026-07-01 — Request: foo')).toEqual({
      repo: 'field-research',
      heading: '2026-07-01 — Request: foo',
    })
  })

  it('rundreist mit Doppelpunkt und Halbgeviertstrich in der Heading', () => {
    const heading = '2026-07-18 — Seed: a title — with an em dash and: a colon'
    const title = `Request aus ulysses: ${heading}`
    expect(parseInboxIssueTitle(title)).toEqual({ repo: 'ulysses', heading })
  })

  it('null bei unbekanntem Titelformat', () => {
    expect(parseInboxIssueTitle('Irgendein anderer Issue-Titel')).toBeNull()
    expect(parseInboxIssueTitle('')).toBeNull()
  })
})

describe('isNonRequestSection', () => {
  it('erkennt Team-eigene Sections (Seeds/Team note/Team responses)', () => {
    expect(isNonRequestSection('Seeds from the team')).toBe(true)
    expect(isNonRequestSection('Seeds from Frank')).toBe(true)
    expect(isNonRequestSection('Team note — 2026-07-17 — a seed: the machine that reviews its own research')).toBe(true)
    expect(isNonRequestSection('Team responses — 2026-06-29')).toBe(true)
  })

  it('erkennt auch die Gegenrichtung: Rückmeldungen der Praxis sind keine Anfragen', () => {
    // Genau die drei Einträge, die am 2026-07-30 als „unerledigt“ in Franks Inbox standen.
    expect(isNonRequestSection('Status (Ulysses, 2026-07-28) — the three-catalogue seed of 2026-07-28')).toBe(true)
    expect(isNonRequestSection('Status (Ulysses, 2026-07-26) — the Dataset Register seed of 2026-07-26')).toBe(true)
    expect(isNonRequestSection('Response (Ulysses, 2026-07-26) — to the team note of 2026-07-27')).toBe(true)
    // Auch ohne Klammer, mit Gedankenstrich
    expect(isNonRequestSection('Response — 2026-07-30 — to the seed of yesterday')).toBe(true)
  })

  it('lässt echte Anfragen der Kollektive durch', () => {
    expect(isNonRequestSection('2026-07-16 — The playthrough: "No Way of Knowing" is premiere-ready')).toBe(false)
    expect(isNonRequestSection('2026-07-06 — Delivered: the data-art field archive you asked for')).toBe(false)
    // "Seed" mitten im Titel ist kein Team-Präfix
    expect(isNonRequestSection('2026-07-18 — Seed: a title')).toBe(false)
  })

  it('verschluckt keine echte Bitte, die zufällig mit Status/Response anfängt', () => {
    // Der Doppelpunkt ist bewusst NICHT im Zeichensatz nach status/response.
    expect(isNonRequestSection('Status: the build gate has been red for three days')).toBe(false)
    expect(isNonRequestSection('2026-07-30 — Status of the feedback channel (third defect)')).toBe(false)
    expect(isNonRequestSection('Response times of the gate are the problem')).toBe(false)
  })
})

describe('appendGateDecision', () => {
  it('appends a dated GO section at the end of the file', () => {
    const res = appendGateDecision('# REQUESTS\n\nolder text\n', {
      project: '2026-07-23-negative-parallax',
      decision: 'GO',
      date: '2026-08-01',
    })
    if (!res.ok) throw new Error('expected ok')
    expect(res.md).toContain('## Gate decision — 2026-08-01 — 2026-07-23-negative-parallax')
    expect(res.md).toContain('GO — publish.')
    expect(res.md.indexOf('older text')).toBeLessThan(res.md.indexOf('Gate decision'))
  })

  it('refuses HOLD without a reason and includes the reason when given', () => {
    const noReason = appendGateDecision('x', { project: 'p', decision: 'HOLD', date: '2026-08-01' })
    expect(noReason.ok).toBe(false)
    const withReason = appendGateDecision('x', {
      project: 'p',
      decision: 'HOLD',
      reason: 'the exposition withdrew a claim — I want the next tick first',
      date: '2026-08-01',
    })
    if (!withReason.ok) throw new Error('expected ok')
    expect(withReason.md).toContain('Held, because: the exposition withdrew a claim')
  })
})

// ——————————————————————————————————————————————————————————————————————————————————————
// Reading side for the public requests rooms (Etappe 2, 2026-08-01). These functions run
// inside the build that gates the practices' nightly publishing — the defensive cases below
// are not padding: a parser that throws on tomorrow's content stops three collectives from
// publishing at all.
// ——————————————————————————————————————————————————————————————————————————————————————

describe('isOpenStatus', () => {
  // Every phrasing of "open" the four REQUESTS.md files actually use (2026-08-01 census,
  // re-taken after that day's integrate runs: 29 atelier + 33 field + 27 studio + 3 plenum
  // status lines). Recorded as a table so a new phrasing the practices coin gets ADDED here
  // rather than silently misclassified — they coin them faster than one might think: three
  // new closing words and two new open ones arrived between the census and this commit.
  const OPEN = [
    'open',
    'seed (open)',
    'open (item 1 is yours alone; item 2 is informational)',
    'open (an offer; silence is fine — the transient is fail-safe and stays as-is until/unless you take this up)',
    'open — an offer; silence, deferral or decline are all legitimate answers.',
    'open. If this is silent through our next session, we will take route 3 as far as we can',
    'offer (open) — no answer needed; act on it or don’t.',
    'open — awaits one action (forward) and one fact (the date it went).',
    '(1) open — asks one action (hold), and supersedes nothing else in the request above it;',
    'open — asks one observation, and supplies everything we could establish without it.',
    'open (a seed — answer in the journal either way)',
    'open — you can now co-shape the site itself',
    // arrived with the 2026-08-01 integrate runs, re-censused before this shipped
    'seed (open) — Angebot, kein Auftrag.',
    'seed (open — standing option, no action required)',
    'Open',
    'OPEN',
  ]
  const CLOSED = [
    'answered (2026-07-02)',
    'answered (Ulysses, 2026-07-21) — (1) ADAPTED, (2) TAKEN, (3) DECLINED with a',
    'answered and concluded (Ulysses, 2026-07-25) — TAKEN; Local Commitment written; both',
    'resolved (2026-07-20) — slug retired human-side; response below',
    'resolved — proposal accepted (team, 2026-07-19)',
    'enabled (2026-07-17)',
    'partially enabled (2026-07-03) — image key provisioned; text key declined with rationale',
    'delivered',
    'letter (no reply owed)',
    'standing rule',
    'accepted and worked (S37, 2026-07-17)',
    'noted; no query made this run; the entry above offered to the back-channel.',
    'seed read; not taken up; no encounter opened. It stays available — a seed I decline today',
    '**closed by events (2026-07-27, session 47), not by an answer — and we are saying which.**',
    'available. Nothing in the protocol requires it. The derived index file it',
    'enabled (2026-07-17) → **premiered (2026-07-17, session 19).** On the word "go" the studio',
    // also from the 2026-08-01 census — the practices keep coining closing words
    'convention in force (Frank, 2026-08-01); no reply owed — just use it.',
    'note (no reply owed)',
    'applied (2026-07-12, session 33)',
    'taken (adapted) — 2026-07-25, session 39; **étude BUILT session 40 (same date):**',
    'answered (2026-07-31, session 51) — **half declined, half taken.**',
    'answered (2026-07-25, session 44) — TAKEN as material.',
    'answered (2026-07-30, session 49) — DECLINED as an opening, banked as material.',
    'the inquiry’s obligations under the Local Commitment are discharged — one first move',
  ]

  it('says open for every phrasing the practices actually use', () => {
    for (const s of OPEN) expect(isOpenStatus(s), s).toBe(true)
  })

  it('says closed for every answered/resolved/enabled phrasing on the record', () => {
    for (const s of CLOSED) expect(isOpenStatus(s), s).toBe(false)
  })

  it('a section without a status line is not open (the practices always state a live ask)', () => {
    expect(isOpenStatus(null)).toBe(false)
    expect(isOpenStatus(undefined)).toBe(false)
    expect(isOpenStatus('')).toBe(false)
  })

  it('the word boundary keeps reopened/opening/openly out', () => {
    expect(isOpenStatus('reopened (2026-07-30)')).toBe(false)
    expect(isOpenStatus('opening record pushed')).toBe(false)
    expect(isOpenStatus('openly documented in the journal')).toBe(false)
  })
})

describe('isSeedsSection', () => {
  it('marks the seed containers, whose section status is a nested seed’s', () => {
    expect(isSeedsSection('Seeds from the team')).toBe(true)
    expect(isSeedsSection('Seeds from the public')).toBe(true)
    expect(isSeedsSection('Seeds from Frank')).toBe(true)
  })
  it('leaves single exchanges alone, including ones whose title says seed', () => {
    expect(isSeedsSection('2026-08-01 — Seed: the festival line')).toBe(false)
    expect(isSeedsSection('Team note — 2026-07-17 — a seed: the machine that reviews itself')).toBe(false)
  })
})

describe('preamble', () => {
  it('is everything before the first H2, without the document’s own H1', () => {
    const p = preamble(FIELD_FIXTURE)
    expect(p.startsWith('**Standing rule')).toBe(true)
    expect(p).not.toContain('# REQUESTS')
    expect(p).not.toContain('## Seeds from the team')
  })

  it('a document without any H2 is all preamble', () => {
    expect(preamble('# Title\n\nJust prose.')).toBe('Just prose.')
  })

  it('never throws on degenerate input', () => {
    expect(preamble('')).toBe('')
    expect(preamble('## Only a heading')).toBe('')
    expect(preamble('##')).toBe('##')
  })
})

describe('headingDate / headingTitle', () => {
  it('reads the ISO date out of every heading shape the practices write', () => {
    expect(headingDate('2026-07-31 — Request: one outbound channel')).toBe('2026-07-31')
    expect(headingDate('2026-07-31 (session 76) — Please hold the forwarding')).toBe('2026-07-31')
    expect(headingDate('Team note — 2026-07-25 — Offer: a joint inquiry')).toBe('2026-07-25')
    expect(headingDate('Status (Ulysses, 2026-07-28) — the three-catalogue seed')).toBe('2026-07-28')
    expect(headingDate('Seeds from the team')).toBe(null)
  })

  it('strips the date scaffolding for the card title, and keeps unfamiliar shapes whole', () => {
    expect(headingTitle('2026-07-31 — Request: one outbound channel')).toBe('Request: one outbound channel')
    expect(headingTitle('2026-07-31 (session 76) — Please hold the forwarding')).toBe('Please hold the forwarding')
    expect(headingTitle('Team note — 2026-07-25 — Offer: a joint inquiry')).toBe('Offer: a joint inquiry')
    expect(headingTitle('Seeds from the team')).toBe('Seeds from the team')
    expect(headingTitle('')).toBe('')
  })
})

describe('slugifyHeading', () => {
  // Pinned against the ids Astro's own rehypeHeadingIds produced in the built pages on
  // 2026-08-01 (141 of 141 headings across the three REQUESTS.md matched) — this is the
  // evidence for keeping the archive on `<Content/>` instead of re-rendering it.
  it('reproduces the heading ids Astro renders', () => {
    expect(slugifyHeading('2026-07-01 — Request: the offered feasibility notes on detection-tool audits'))
      .toBe('2026-07-01--request-the-offered-feasibility-notes-on-detection-tool-audits')
    expect(slugifyHeading('2026-07-31 — Letter: a critic’s review of NO PART'))
      .toBe('2026-07-31--letter-a-critics-review-of-no-part')
    expect(slugifyHeading('2026-07-11 — Request: the build-gate feedback channel is silently dead (`BOT_TOKEN`)'))
      .toBe('2026-07-11--request-the-build-gate-feedback-channel-is-silently-dead-bot_token')
    expect(slugifyHeading('2026-06-29 — Display infrastructure for HTML/JS works'))
      .toBe('2026-06-29--display-infrastructure-for-htmljs-works')
    expect(slugifyHeading('Seeds from the team')).toBe('seeds-from-the-team')
  })

  it('never throws on an empty or symbol-only heading', () => {
    expect(slugifyHeading('')).toBe('')
    expect(slugifyHeading('—')).toBe('')
  })
})

describe('trimWords / countWords / excerpt', () => {
  it('trims on word boundaries and marks the cut', () => {
    expect(trimWords('one two three', 5)).toBe('one two three')
    expect(trimWords('one two three four', 2)).toBe('one two …')
    expect(trimWords('   spaced   out  ', 5)).toBe('spaced out')
    expect(trimWords('', 5)).toBe('')
  })

  it('counts words, not characters', () => {
    expect(countWords('one two three')).toBe(3)
    expect(countWords('  ')).toBe(0)
  })

  it('takes the lead prose and skips what carries no meaning out of context', () => {
    const body = [
      '**Status:** open',
      '',
      '### 1. A sub-heading',
      '',
      '---',
      '',
      '**Request:** a single way for this practice to send a prepared piece to a named receiver.',
      '',
      '```bash',
      'echo not prose',
      '```',
      '',
      '| a | b |',
      '|---|---|',
    ].join('\n')
    const lead = excerpt(body, 40)
    expect(lead).toContain('Request: a single way for this practice')
    expect(lead).not.toContain('Status')
    expect(lead).not.toContain('sub-heading')
    expect(lead).not.toContain('echo not prose')
  })

  it('reads through blockquote markers (the seeds convention) and flattens links', () => {
    const body = '> ### 2026-07-25 — Public seed\n>\n> A [linked](https://example.org) idea, offered.'
    expect(excerpt(body, 20)).toBe('A linked idea, offered.')
  })

  it('never throws and returns empty for an empty body', () => {
    expect(excerpt('', 40)).toBe('')
    expect(excerpt('**Status:** open', 40)).toBe('')
    expect(excerpt('```\nunclosed fence\n', 40)).toBe('')
  })
})

describe('requestCards', () => {
  it('turns every H2 into a card, in document order, with open/seeds/request flags', () => {
    const cards = requestCards(FIELD_FIXTURE)
    expect(cards.map((c) => c.heading)).toEqual([
      'Seeds from the team',
      '2026-07-01 — Request: the offered feasibility notes on detection-tool audits',
    ])
    const [seeds, request] = cards
    // The seeds container's status is a nested seed's — never an open ask of its own.
    expect(seeds.seeds).toBe(true)
    expect(seeds.open).toBe(false)
    expect(seeds.request).toBe(false)
    expect(request.seeds).toBe(false)
    expect(request.request).toBe(true)
    expect(request.status).toBe('answered (2026-07-02)')
    expect(request.open).toBe(false)
    expect(request.date).toBe('2026-07-01')
    expect(request.words).toBeGreaterThan(50)
    expect(request.slug).toBe('2026-07-01--request-the-offered-feasibility-notes-on-detection-tool-audits')
  })

  it('marks an open request open, and keeps its excerpt within the budget', () => {
    const cards = requestCards(ATELIER_FIXTURE, { excerptWords: 12 })
    const open = cards.filter((c) => c.open)
    expect(open.map((c) => c.heading)).toEqual(['2026-06-29 — WebFetch access for primary source work'])
    expect(countWords(open[0].excerpt)).toBeLessThanOrEqual(13) // 12 words + the ellipsis
  })

  it('prefers Astro’s rendered slug over its own derivation (the duplicate-heading case)', () => {
    const md = '# T\n\n## Same title\n\n**Status:** open\n\n## Same title\n\n**Status:** open\n'
    const headings = [
      { depth: 2, slug: 'same-title', text: 'Same title' },
      { depth: 2, slug: 'same-title-1', text: 'Same title' },
    ]
    // Matching is by text, so BOTH resolve to the first — a wrong fragment lands at the top of
    // the archive, never on a 404. The point of the assertion is that the rendered list wins.
    expect(requestCards(md, { headings }).map((c) => c.slug)).toEqual(['same-title', 'same-title'])
    expect(requestCards(md).map((c) => c.slug)).toEqual(['same-title', 'same-title'])
  })

  it('never throws on content the practices have not written yet', () => {
    expect(requestCards('')).toEqual([])
    expect(requestCards('no headings at all, just prose')).toEqual([])
    expect(() => requestCards('## \n\n## ##\n\n##nospace\n')).not.toThrow()
    expect(() => requestCards('## A\r\n\r\n**Status:** open\r\n')).not.toThrow()
    expect(requestCards('## A\r\n\r\n**Status:** open\r\n')[0].open).toBe(true)
    // a heading that is only punctuation still yields a card, just without a slug
    expect(requestCards('## —\n\nbody\n')[0].slug).toBe('')
  })
})

describe('openExcerptWords', () => {
  it('shares one budget across the queue, so the page stays bounded without capping it', () => {
    expect(openExcerptWords(0)).toBe(40)
    expect(openExcerptWords(1)).toBe(40)
    expect(openExcerptWords(9)).toBe(30)
    expect(openExcerptWords(15)).toBe(18)
    expect(openExcerptWords(100)).toBe(12)
  })
})
