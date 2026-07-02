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
})
