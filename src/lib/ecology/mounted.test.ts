// An instrument that renders on no page fails nothing.
//
// This test exists because of a day nobody noticed. The refrain score — the running work-line's
// time as a three-voice score — was built on 2026-08-02 with its own spec, its own stylesheet,
// its own parser and 40-odd assertions. On 2026-08-12 the pyramid rewrite replaced the Atelier's
// entrance, and nothing carried the score across. For a day it existed, passed every check it
// had, and appeared on no surface of this site. Its guards even kept working: the aspect floor
// was diagnosed and repaired on 2026-08-12 against a figure no page mounted.
//
// Unit tests cannot catch that, because the component is correct — it is simply unreachable.
// So the check is a different question: **is this thing on a page at all?**
//
// The list is deliberately short. It names the instruments whose disappearance would be silent —
// a whole figure, a whole archived record — not every component in the tree. A test that tried to
// assert "everything is mounted" would fail on the first partial and be deleted within a week.
import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { DOORS } from './pyramid/station'

const roots = ['src/pages', 'src/components/pages', 'src/components/ecology']

function everyAstroFile(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...everyAstroFile(path))
    else if (entry.endsWith('.astro')) out.push(path)
  }
  return out
}

const pages = roots.flatMap(everyAstroFile)
const source = pages.map((p) => readFileSync(p, 'utf8')).join('\n')

describe('the instruments are on a page', () => {
  // component → what disappears with it, in the words the failure would need to be understood
  const INSTRUMENTS: [string, string][] = [
    ['RefrainScore', 'the running work-line’s score — the three voices and every move it made'],
    ['LineMap', 'the map of every work-line on one time axis, and how each one ended'],
  ]

  it.each(INSTRUMENTS)('%s is imported by at least one page', (component, what) => {
    expect(
      source.includes(`/${component}.astro'`) || source.includes(`/${component}.astro"`),
      `${component} is mounted on no page — ${what} renders nowhere, and nothing else in this ` +
        `suite will say so: the component is correct, it is simply unreachable.`,
    ).toBe(true)
  })
})

describe('the archived record stays findable', () => {
  it('links the retired cockpit from a station sheet', () => {
    // ADR 0008 archives surfaces rather than deleting them, which is only honest while the
    // archive can be reached. Between 2026-08-12 and 2026-08-13 the only references to this page
    // in the whole build were a 301 from its old route and the sitemap — the rhizome and the
    // closure index of the first nightly phase were on the site and reachable by nobody.
    const hrefs = Object.values(DOORS).flat().map((d) => d.href)
    expect(hrefs, 'nothing links /atelier/archive/cockpit — the first nightly phase’s instrument is unreachable again').toContain(
      '/atelier/archive/cockpit',
    )
  })
})
