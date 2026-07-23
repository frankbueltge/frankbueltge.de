// src/lib/zentrale/requestsMd.test.ts
import { describe, it, expect } from 'vitest'
import { parseSections, findSection, answerRequest, appendSeed, parseInboxIssueTitle, isTeamSection } from './requestsMd'

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

describe('isTeamSection', () => {
  it('erkennt Team-eigene Sections (Seeds/Team note/Team responses)', () => {
    expect(isTeamSection('Seeds from the team')).toBe(true)
    expect(isTeamSection('Seeds from Frank')).toBe(true)
    expect(isTeamSection('Team note — 2026-07-17 — a seed: the machine that reviews its own research')).toBe(true)
    expect(isTeamSection('Team responses — 2026-06-29')).toBe(true)
  })

  it('lässt echte Anfragen der Kollektive durch', () => {
    expect(isTeamSection('2026-07-16 — The playthrough: "No Way of Knowing" is premiere-ready')).toBe(false)
    expect(isTeamSection('2026-07-06 — Delivered: the data-art field archive you asked for')).toBe(false)
    // "Seed" mitten im Titel ist kein Team-Präfix
    expect(isTeamSection('2026-07-18 — Seed: a title')).toBe(false)
  })
})
