import { describe, expect, it } from 'vitest'
import { renderMarkdown, sessionAnchor, sessionMeta, splitSessions } from './journal'

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
