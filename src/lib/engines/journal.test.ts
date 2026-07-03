import { describe, expect, it } from 'vitest'
import { renderMarkdown, sessionMeta, splitSessions } from './journal'

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
  it('returns the whole body as one heading-less session when no session headings exist', () => {
    const s = splitSessions('# A note\njust text')
    expect(s).toHaveLength(1)
    expect(s[0].heading).toBe('')
    expect(s[0].text).toContain('just text')
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
