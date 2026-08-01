import { describe, expect, it } from 'vitest'
import {
  buildDayIndex,
  legacyJournalHashTarget,
  renderMarkdown,
  sessionAnchor,
  sessionMeta,
  splitSessions,
} from './journal'

const twoSessions = `# Session 01 — 2026-07-01
**Convened:** Proposer (sub-agent). No other roles convened.
**Move:** build — instrument 009
alpha body

# Session 02 — 2026-07-01 (same day)
beta body`

describe('splitSessions', () => {
  it('splits on # Session N headings and keeps heading text', () => {
    const s = splitSessions(twoSessions)
    expect(s).toHaveLength(2)
    expect(s[0].heading).toBe('Session 01 — 2026-07-01')
    expect(s[1].text).toContain('beta body')
    expect(s[1].text).not.toContain('# Session 02')
  })

  // The engines' H1 conventions drifted across their history — the splitter must break
  // on every real generation, not just the first (this exact gap shipped once: 6 of 7
  // field day files rendered as one blob).
  it('splits the em-dash generation: "# Session — <date> (collective session N)"', () => {
    const s = splitSessions(
      `# Session — 2026-07-02 (collective session 02)\nfirst\n\n# Session — 2026-07-02 (collective session 03)\nsecond`,
    )
    expect(s).toHaveLength(2)
    expect(s[0].heading).toBe('Session — 2026-07-02 (collective session 02)')
    expect(s[1].heading).toBe('Session — 2026-07-02 (collective session 03)')
  })
  it('splits the journal generation: "# Journal — <date> (collective session N)"', () => {
    const s = splitSessions(
      `# Journal — 2026-07-10 (collective session 18)\na\n\n---\n\n# Journal — 2026-07-10 (collective session 19)\nb`,
    )
    expect(s).toHaveLength(2)
    expect(s[1].heading).toBe('Journal — 2026-07-10 (collective session 19)')
    expect(s[1].text).toContain('b')
  })
  it('splits the atelier/plenum generations', () => {
    const s = splitSessions(
      `# Research day — 2026-06-28 (Session 1)\nx\n\n# Plenum minutes — 2026-07-03 (Session 1)\ny`,
    )
    expect(s).toHaveLength(2)
    expect(s[0].heading).toBe('Research day — 2026-06-28 (Session 1)')
    expect(s[1].heading).toBe('Plenum minutes — 2026-07-03 (Session 1)')
  })
  it('ignores "# " lines inside code fences', () => {
    const s = splitSessions(
      '# Journal — 2026-07-12 (collective session 26)\nbefore\n```bash\n# not a heading\necho hi\n```\nafter\n\n# Journal — 2026-07-12 (collective session 27)\nnext',
    )
    expect(s).toHaveLength(2)
    expect(s[0].text).toContain('# not a heading')
    expect(s[1].heading).toContain('session 27')
  })
  it('keeps preamble text before the first heading as its own heading-less chunk', () => {
    const s = splitSessions(`preamble text\n\n# Session 01 — 2026-07-01\nbody`)
    expect(s).toHaveLength(2)
    expect(s[0].heading).toBe('')
    expect(s[0].text).toContain('preamble text')
    expect(s[1].heading).toBe('Session 01 — 2026-07-01')
  })
  it('returns the whole body as one session when no session headings exist', () => {
    const s = splitSessions('just text\nno headings')
    expect(s).toHaveLength(1)
    expect(s[0].heading).toBe('')
    expect(s[0].text).toContain('just text')
  })
})

describe('sessionAnchor', () => {
  it('prefers the collective-session number (any heading generation)', () => {
    expect(sessionAnchor('Journal — 2026-07-10 (collective session 19)', '2026-07-10', 3)).toBe('cs-19')
    expect(sessionAnchor('Session — 2026-07-02 (collective session 02)', '2026-07-02', 0)).toBe('cs-2')
    // the constitution-founding session carries BOTH numbering schemes — cs wins
    expect(sessionAnchor('Session 09 — 2026-07-01 (collective session 01)', '2026-07-01', 8)).toBe('cs-1')
  })
  it('maps pre-constitution "Session NN" headings to pre-<day>-N', () => {
    expect(sessionAnchor('Session 01 — 2026-07-01', '2026-07-01', 0)).toBe('pre-2026-07-01-1')
    expect(sessionAnchor('Session 08 — 2026-07-01', '2026-07-01', 7)).toBe('pre-2026-07-01-8')
  })
  it('falls back to a positional id for unknown headings', () => {
    expect(sessionAnchor('Some future format', '2026-08-01', 2)).toBe('2026-08-01-2')
    expect(sessionAnchor('', '2026-08-01', 0)).toBe('2026-08-01-0')
  })
})

describe('uniqueSessionAnchor', () => {
  it('keeps the clean anchor for the first chronological claimant, suffixes duplicates', async () => {
    const { uniqueSessionAnchor } = await import('./journal')
    const used = new Set<string>()
    // real drift instance: sessions on 07-10 and 07-11 both claim "collective session 24"
    const a = uniqueSessionAnchor(used, 'Journal — 2026-07-10 (collective session 24)', '2026-07-10', 6)
    const b = uniqueSessionAnchor(used, 'Journal — 2026-07-11 (collective session 24)', '2026-07-11', 0)
    expect(a).toBe('cs-24')
    expect(b).toBe('cs-24-2026-07-11')
    expect(used.size).toBe(2)
  })
})

describe('sessionMeta', () => {
  it('extracts move badge and voices line tolerantly', () => {
    const m = sessionMeta(splitSessions(twoSessions)[0].text)
    expect(m.move).toBe('build')
    expect(m.voices).toContain('Proposer')
  })
  it('returns nulls when the lines are absent', () => {
    expect(sessionMeta('plain text')).toEqual({ move: null, voices: null })
  })
})

describe('renderMarkdown', () => {
  it('renders markdown, escapes raw HTML, links URLs', () => {
    const html = renderMarkdown('**bold** <script>x</script> https://example.com')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('<a href="https://example.com"')
  })
  it('marks critique/verdict h2 headings', () => {
    const html = renderMarkdown("## Interlocutor's critique — Instrument 009\ntext")
    expect(html).toContain('class="deliberation-mark"')
  })
  it('does not linkify bare filenames whose extension is a ccTLD (.md = Moldova)', () => {
    const html = renderMarkdown('Read on arrival: WORKBOARD.md, REQUESTS.md and memory/claims.md.')
    expect(html).not.toContain('<a ')
    expect(html).toContain('WORKBOARD.md')
  })
  it('still links explicit URLs', () => {
    const html = renderMarkdown('see https://www.apaf.org/library and http://example.com')
    expect(html).toContain('<a href="https://www.apaf.org/library"')
    expect(html).toContain('<a href="http://example.com"')
  })
})

describe('renderMarkdown with mdRefs', () => {
  const refs = { repo: 'https://github.com/frankbueltge/field-research', docs: new Set(['requests', 'field']) }

  it('links bare .md mentions to the repo, never to Moldovan domains', () => {
    const html = renderMarkdown('Read on arrival: WORKBOARD.md, then memory/claims.md.', refs)
    expect(html).toContain('href="https://github.com/frankbueltge/field-research/blob/main/WORKBOARD.md"')
    expect(html).toContain('href="https://github.com/frankbueltge/field-research/blob/main/memory/claims.md"')
    expect(html).not.toContain('http://WORKBOARD.md')
    expect(html).toContain(', then ') // surrounding text survives the token split
  })
  it('marks root docs that exist as baked templates with data-doc', () => {
    const html = renderMarkdown('REQUESTS.md and WORKBOARD.md', refs)
    expect(html).toContain('data-doc="requests"')
    expect(html).not.toContain('data-doc="workboard"') // not in the docs set
  })
  it('does not let path references shadow root docs (memory/REQUESTS.md gets no data-doc)', () => {
    const html = renderMarkdown('see memory/REQUESTS.md', refs)
    expect(html).toContain('/blob/main/memory/REQUESTS.md')
    expect(html).not.toContain('data-doc')
  })
  it('wraps backticked references in a link around the code element', () => {
    const html = renderMarkdown('per `notes/2026-07-02-feasibility.md` and `FIELD.md`', refs)
    expect(html).toContain('<a href="https://github.com/frankbueltge/field-research/blob/main/notes/2026-07-02-feasibility.md"')
    expect(html).toContain('><code>notes/2026-07-02-feasibility.md</code></a>')
    expect(html).toContain('data-doc="field"')
  })
  it('leaves ordinary code spans and existing links untouched', () => {
    const html = renderMarkdown('run `npm test`, see [x](https://example.com/REQUESTS.md)', refs)
    expect(html).toContain('<code>npm test</code>')
    expect(html).not.toContain('<a href="https://github.com/frankbueltge/field-research/blob/main/x')
    const links = html.match(/<a /g) ?? []
    expect(links).toHaveLength(1) // only the explicit markdown link
  })
})

// ——————————————————————————————————————————————————————————————————————————————————————
// Etappe 2 (2026-08-01): the day/session index the field and studio journals share, and the
// guard for the client-side fragment bounce.
// ——————————————————————————————————————————————————————————————————————————————————————

const MD_REFS = { repo: 'https://github.com/frankbueltge/field-research', docs: new Set<string>() }

describe('buildDayIndex', () => {
  const days = [
    { id: 'journal/2026-07-10', body: '# Journal — 2026-07-10 (collective session 24)\n**Move:** build — a\nfirst' },
    { id: 'journal/2026-07-11', body: '# Journal — 2026-07-11 (collective session 24)\nsecond\n\n# Journal — 2026-07-11 (collective session 25)\nthird' },
  ]

  it('walks chronologically, so the first claimant of a drifting number keeps the clean anchor', () => {
    // The real drift instance: two days both claiming "collective session 24". The walk order
    // decides who keeps `cs-24` — which is why buildDayIndex must never be "tidied".
    const { daysAsc, sessionsAsc } = buildDayIndex(days, MD_REFS)
    expect(daysAsc.map((d) => d.day)).toEqual(['2026-07-10', '2026-07-11'])
    expect(sessionsAsc.map((s) => s.anchor)).toEqual(['cs-24', 'cs-24-2026-07-11', 'cs-25'])
  })

  it('reversing the input does not change the outcome — the sort, not the caller, decides', () => {
    const forward = buildDayIndex(days, MD_REFS).sessionsAsc.map((s) => s.anchor)
    const backward = buildDayIndex([...days].reverse(), MD_REFS).sessionsAsc.map((s) => s.anchor)
    expect(backward).toEqual(forward)
  })

  it('displays newest day first with each day’s newest session first', () => {
    const { days: display } = buildDayIndex(days, MD_REFS)
    expect(display.map((d) => d.day)).toEqual(['2026-07-11', '2026-07-10'])
    expect(display[0].sessions.map((s) => s.anchor)).toEqual(['cs-25', 'cs-24-2026-07-11'])
  })

  it('separates the calendar date from the filename (Ensemble names files per session)', () => {
    const ensemble = [
      { id: 'journal/2026-07-31-session-51', body: '# Session 51 — 2026-07-31\na' },
      { id: 'journal/2026-07-31-session-52', body: '# Session 52 — 2026-07-31\nb' },
    ]
    const { daysAsc } = buildDayIndex(ensemble, MD_REFS)
    // both belong to the same evening — a room grouping by date prints ONE heading, not two
    expect(daysAsc.map((d) => d.date)).toEqual(['2026-07-31', '2026-07-31'])
    // and a stem that is not date-prefixed at all falls back to itself rather than to ''
    expect(buildDayIndex([{ id: 'journal/interlude', body: 'x' }], MD_REFS).daysAsc[0].date).toBe('interlude')
  })

  it('reads several files of ONE date in filename order, however the anchor walk saw them', () => {
    const ensemble = [
      { id: 'journal/2026-07-31-session-51', body: '# Session 51 — 2026-07-31\na' },
      { id: 'journal/2026-07-31-session-52', body: '# Session 52 — 2026-07-31\nb' },
      { id: 'journal/2026-07-31-session-53', body: '# Session 53 — 2026-07-31\nc' },
      { id: 'journal/2026-08-01', body: '# Journal — 2026-08-01 (collective session 54)\nd' },
    ]
    const { daysAsc, sessionsAsc, days } = buildDayIndex(ensemble, MD_REFS)
    // the anchor walk sees the same-date files newest-name-first — kept verbatim, not fixed
    expect(daysAsc.map((d) => d.day)).toEqual([
      '2026-07-31-session-53',
      '2026-07-31-session-52',
      '2026-07-31-session-51',
      '2026-08-01',
    ])
    // reading order is chronological, so prev/next on the session pages runs forwards
    expect(sessionsAsc.map((s) => s.anchor)).toEqual(['cs-51', 'cs-52', 'cs-53', 'cs-54'])
    // and the display order is newest first, consistently, inside the day as well as across it
    expect(days.flatMap((d) => d.sessions.map((s) => s.anchor))).toEqual(['cs-54', 'cs-53', 'cs-52', 'cs-51'])
  })

  it('carries move, voices and rendered html per session', () => {
    const first = buildDayIndex(days, MD_REFS).sessionsAsc[0]
    expect(first.move).toBe('build')
    expect(first.html).toContain('first')
    expect(first.heading).toBe('Journal — 2026-07-10 (collective session 24)')
  })

  it('ignores non-journal entries and survives a half-synced file without a body', () => {
    const mixed = [
      { id: 'REQUESTS', body: 'not a journal' },
      { id: 'journal/2026-07-12', body: undefined },
    ]
    const { sessionsAsc } = buildDayIndex(mixed, MD_REFS)
    expect(sessionsAsc).toHaveLength(1)
    expect(sessionsAsc[0].anchor).toBe('2026-07-12-0')
    expect(buildDayIndex([], MD_REFS).sessionsAsc).toEqual([])
  })

  it('gives every session a unique anchor (the URL segment must be a key)', () => {
    const anchors = buildDayIndex(days, MD_REFS).sessionsAsc.map((s) => s.anchor)
    expect(new Set(anchors).size).toBe(anchors.length)
  })
})

describe('legacyJournalHashTarget', () => {
  it('maps every anchor shape the rooms published onto its own path segment', () => {
    expect(legacyJournalHashTarget('#cs-42')).toBe('cs-42')
    expect(legacyJournalHashTarget('#cs-24-2026-07-11')).toBe('cs-24-2026-07-11')
    expect(legacyJournalHashTarget('#pre-2026-07-01-3')).toBe('pre-2026-07-01-3')
    expect(legacyJournalHashTarget('#2026-07-05-1')).toBe('2026-07-05-1')
    expect(legacyJournalHashTarget('#s42')).toBe('s42')
    expect(legacyJournalHashTarget('#note-first-v4-tick')).toBe('note-first-v4-tick')
    expect(legacyJournalHashTarget('cs-42')).toBe('cs-42') // with or without the '#'
    expect(legacyJournalHashTarget('#cs%2D42')).toBe('cs-42') // percent-escaped
  })

  it('refuses anything that is not a bare anchor — a hash must not become a redirect', () => {
    expect(legacyJournalHashTarget('')).toBe(null)
    expect(legacyJournalHashTarget('#')).toBe(null)
    expect(legacyJournalHashTarget('#//evil.example')).toBe(null)
    expect(legacyJournalHashTarget('#https://evil.example')).toBe(null)
    expect(legacyJournalHashTarget('#../../etc/passwd')).toBe(null)
    expect(legacyJournalHashTarget('#%2F%2Fevil.example')).toBe(null)
    expect(legacyJournalHashTarget('#cs 42')).toBe(null)
    expect(legacyJournalHashTarget('#-leading-dash')).toBe(null)
    expect(legacyJournalHashTarget('#<script>')).toBe(null)
  })

  it('never throws on a malformed percent escape', () => {
    expect(() => legacyJournalHashTarget('#%E0%A4%A')).not.toThrow()
    expect(legacyJournalHashTarget('#%E0%A4%A')).toBe(null)
  })
})
