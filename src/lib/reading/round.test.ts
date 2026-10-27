import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { roundProblems, type Round } from './round'
import { CURRENT_ROUND, ROUNDS } from './rounds'
import { fmtValue } from './estimate'

describe('the committed rounds', () => {
  it('lists every round file in rounds.ts, so the Functions see the same rounds as the pages', () => {
    const files = readdirSync('src/data/reading/rounds').filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')).sort()
    expect(ROUNDS.map((r) => r.id).sort()).toEqual(files)
  })

  it('keeps every rule of a round', () => {
    for (const r of ROUNDS) expect(roundProblems(r), r.id).toEqual([])
  })

  it('pins the briefing it reads to a commit, never to a branch', () => {
    for (const r of ROUNDS) expect(r.briefing.url).toMatch(/\/blob\/[0-9a-f]{40}\/briefings\/after-cycle-\d{3}\.md$/)
  })

  it('names the round after the briefing it reads', () => {
    for (const r of ROUNDS) expect(r.briefing.url.endsWith(`/briefings/${r.id}.md`)).toBe(true)
  })

  it('never lets a gist or a title give away the figure an estimate asks for', () => {
    for (const r of ROUNDS) {
      const shown = r.matters.map((m) => `${m.title} ${m.gist}`).join(' ').toLowerCase()
      for (const e of r.estimates) {
        const forms = new Set([e.truth_label.toLowerCase(), fmtValue(e.kind, e.truth).toLowerCase()])
        // a bare number is the answer for a count or a temperature; for a share only with its sign
        // ("9 to 20 November" is a date, "20 %" is the answer)
        if (e.kind === 'percent') for (const f of [`${e.truth}%`, `${e.truth} per cent`, `${e.truth} percent`]) forms.add(f)
        else for (const f of [String(e.truth), e.truth.toLocaleString('en-GB')]) forms.add(f)
        if (e.kind === 'count' && e.truth >= 1e6) forms.add(`${Math.round(e.truth / 1e6)} million`)
        if (e.kind === 'percent' && e.truth === 20) forms.add('a fifth')
        for (const f of forms) {
          // a figure stands on its own: "20" inside "2026" is a year, not the answer
          const re = new RegExp(`(?<![0-9.,])${f.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![0-9])`)
          expect(re.test(shown), `${r.id}: "${f}" (${e.id}) appears before it is asked`).toBe(false)
        }
      }
    }
  })

  it('asks every round the same question, so one round can be read against another', () => {
    expect(new Set(ROUNDS.map((r) => r.question)).size).toBe(1)
  })

  it('never lets a title or a gist say how loud the web was, before the reader has chosen', () => {
    for (const r of ROUNDS) for (const m of r.matters) expect(`${m.title} ${m.gist}`, m.id).not.toMatch(/\b(quiet|loud|trend\w*|attention|headlines?|ignored|overlooked)\b/i)
  })

  it('takes part in the newest round', () => {
    expect(CURRENT_ROUND).toBe(ROUNDS.at(-1))
  })
})

describe('roundProblems', () => {
  const base = (): Round => JSON.parse(JSON.stringify(CURRENT_ROUND)) as Round

  it('refuses an unpinned briefing, a broken quiet order and an estimate without a matter', () => {
    const r = base()
    r.briefing.url = 'https://example.org/briefing.md'
    r.matters[0]!.quiet_rank = 9
    r.estimates[0]!.matter = 'nowhere'
    const problems = roundProblems(r).join(' | ')
    expect(problems).toContain('briefing url')
    expect(problems).toContain('quiet ranks')
    expect(problems).toContain('unknown matter')
  })

  it('refuses more pairs per reading than the matters make', () => {
    const r = base()
    r.pairs_per_reading = (r.matters.length * (r.matters.length - 1)) / 2 + 1
    expect(roundProblems(r)).toContain('pairs per reading')
  })

  it('refuses a figure outside the range an answer may take', () => {
    const r = base()
    const pct = r.estimates.find((e) => e.kind === 'percent')!
    pct.truth = 140
    expect(roundProblems(r).some((p) => p.includes('truth out of range'))).toBe(true)
  })
})
