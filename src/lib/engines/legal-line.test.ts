import { describe, expect, it } from 'vitest'
import { SHARE } from '@/config/share-wording'
import { FONT_HOSTS, LEGAL_MARKER, injectLegal, legalLine, stripLegal, withoutFontHosts } from './legal-line'

const count = (s: string, needle: string) => s.split(needle).length - 1

describe('the last line of a published practice page', () => {
  const page = '<!doctype html><html><head><title>t</title></head><body><main>work</main></body></html>'

  it('says an AI system made the page, and names the imprint and the privacy notice', () => {
    const out = injectLegal(page)
    expect(out).toContain(SHARE.legal.made)
    expect(out).toContain('href="/imprint"')
    expect(out).toContain('href="/privacy"')
  })

  it('names no product: the tool stays generic', () => {
    expect(SHARE.legal.made).toMatch(/AI system/)
    expect(SHARE.legal.made).not.toMatch(/Claude|GPT|Gemini|Anthropic|OpenAI|Google/i)
  })

  it('says it is the site speaking, like the frame and the back strip', () => {
    expect(legalLine()).toContain(SHARE.legal.note)
  })

  it('stands last in the body and leaves the work byte for byte', () => {
    const out = injectLegal(page)
    expect(out.indexOf(LEGAL_MARKER)).toBeGreaterThan(out.indexOf('</main>'))
    expect(out.indexOf(LEGAL_MARKER)).toBeLessThan(out.indexOf('</body>'))
    expect(stripLegal(out)).toBe(page)
  })

  it('is written anew, never stacked', () => {
    const twice = injectLegal(injectLegal(page))
    expect(twice).toBe(injectLegal(page))
    expect(count(twice, `<div class="${LEGAL_MARKER}"`)).toBe(1)
  })

  it('reaches a fragment that never closes a body', () => {
    const out = injectLegal('<title>t</title><p>work</p>')
    expect(out.startsWith('<title>t</title><p>work</p>')).toBe(true)
    expect(out).toContain(SHARE.legal.made)
  })

  it('brings no script, no request to another host and no style attribute', () => {
    const line = legalLine()
    expect(line).not.toMatch(/<script/i)
    expect(line).not.toMatch(/https?:\/\//)
    expect(line).not.toMatch(/\sstyle=/)
  })
})

describe('no published practice page asks a font host for anything', () => {
  it('takes off the stylesheet and the preconnect hint, and nothing else', () => {
    const head =
      '<link rel="preconnect" href="https://fonts.googleapis.com">' +
      '<link href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;1,400&display=swap" rel="stylesheet">' +
      '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link rel="stylesheet" href="./own.css"><link rel="canonical" href="https://frankbueltge.de/atelier/x/">'
    const { html, removed } = withoutFontHosts(`<head>${head}</head><body><a href="https://fonts.googleapis.com/">a link a reader may follow</a></body>`)
    expect(removed).toBe(3)
    expect(html).toBe(
      '<head><link rel="stylesheet" href="./own.css"><link rel="canonical" href="https://frankbueltge.de/atelier/x/"></head>' +
        '<body><a href="https://fonts.googleapis.com/">a link a reader may follow</a></body>',
    )
  })

  it('reads single quotes, no quotes and a protocol-relative address', () => {
    for (const tag of [
      "<link rel='stylesheet' href='https://fonts.googleapis.com/css?family=Inter'>",
      '<link rel=dns-prefetch href=//fonts.gstatic.com>',
      '<LINK HREF="HTTPS://FONTS.GOOGLEAPIS.COM/css2?family=A" REL="stylesheet">',
    ])
      expect(withoutFontHosts(tag)).toEqual({ html: '', removed: 1 })
  })

  it('leaves a page without such a tag byte for byte', () => {
    const page = '<head><link rel="stylesheet" href="/fonts/own.css"><link rel="icon" href="https://example.org/fonts.googleapis.com.png"></head>'
    expect(withoutFontHosts(page)).toEqual({ html: page, removed: 0 })
  })

  it('knows the hosts by name', () => {
    expect(FONT_HOSTS).toContain('fonts.googleapis.com')
    expect(FONT_HOSTS).toContain('fonts.gstatic.com')
  })
})
