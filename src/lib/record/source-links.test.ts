import { describe, expect, it } from 'vitest'
import { DENIED_HOSTS, scanFile, scanRecord } from './source-links'

describe('the guard against linking to unlicensed copies', () => {
  it('passes a link to a rightsholder publishing its own document', () => {
    const text = 'Measured against NIST: https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-63b.pdf'
    expect(scanFile('x.md', text)).toEqual([])
  })

  it('passes an institutional repository, which holds work by deposit', () => {
    const text = 'The thesis: https://etheses.whiterose.ac.uk/id/eprint/21505/1/BRAY_2018.pdf'
    expect(scanFile('x.md', text)).toEqual([])
  })

  it('refuses a host already found holding another author’s text', () => {
    const [finding] = scanFile('x.md', 'https://monoskop.org/images/b/bf/Bateson_Steps.pdf')
    expect(finding).toMatchObject({ reason: 'host' })
  })

  it('refuses a teaching path on ANY host, which is what a host list cannot see', () => {
    // The case that proved this rule: a reading on a lecturer's own course domain, which
    // three passes over the record had walked past because the domain was neither a
    // university nor an archive.
    const [finding] = scanFile(
      'x.md',
      'https://ios23.classes.example.com/files/readings/Someone-Else-1990.pdf',
    )
    expect(finding).toMatchObject({ reason: 'teaching-path' })
  })

  it('reports file, line and the URL, so a failure can be acted on', () => {
    const [finding] = scanFile('a/b.md', 'one\ntwo\nhttps://reflexus.org/wp-content/uploads/x.pdf')
    expect(finding).toMatchObject({ file: 'a/b.md', line: 3 })
  })

  it('keeps the denylist free of duplicates, so a removal cannot leave a twin behind', () => {
    expect(new Set(DENIED_HOSTS).size).toBe(DENIED_HOSTS.length)
  })
})

describe('the published record links to no unlicensed copy', () => {
  it('carries no denied link outside the allowlist', { timeout: 30_000 }, () => {
    // The rule, for the case this guard cannot see: link a source's bytes where the host is
    // the rightsholder, the author, or a repository holding it by deposit. Otherwise cite the
    // work and do not link it. If this fails, the link is replaced by a dated removal note —
    // never cleared in the allowlist to make the build green.
    expect(scanRecord().map((f) => `${f.file}:${f.line} — ${f.reason} — ${f.url}`)).toEqual([])
  })
})
