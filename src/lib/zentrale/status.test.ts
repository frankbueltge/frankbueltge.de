// src/lib/zentrale/status.test.ts
import { describe, it, expect } from 'vitest'
import { latestRunPerWorkflow, summarizeCommits, chronicleLast, vitalSignsLast, ageDays, buildInbox } from './status'

describe('latestRunPerWorkflow', () => {
  it('behält pro Workflow-Namen nur den jüngsten Lauf, auch bei durcheinandergewürfelter Eingabe', () => {
    const runs = [
      { name: 'field-integrate', conclusion: 'success', status: 'completed', created_at: '2026-07-15T08:00:00Z', html_url: 'https://x/1' },
      { name: 'atelier-integrate', conclusion: 'failure', status: 'completed', created_at: '2026-07-16T09:00:00Z', html_url: 'https://x/2' },
      { name: 'field-integrate', conclusion: 'failure', status: 'completed', created_at: '2026-07-17T10:00:00Z', html_url: 'https://x/3' },
      { name: 'atelier-integrate', conclusion: 'success', status: 'completed', created_at: '2026-07-14T07:00:00Z', html_url: 'https://x/4' },
    ]
    const result = latestRunPerWorkflow(runs).sort((a, b) => a.workflow.localeCompare(b.workflow))
    expect(result).toEqual([
      { workflow: 'atelier-integrate', conclusion: 'failure', status: 'completed', at: '2026-07-16T09:00:00Z', url: 'https://x/2' },
      { workflow: 'field-integrate', conclusion: 'failure', status: 'completed', at: '2026-07-17T10:00:00Z', url: 'https://x/3' },
    ])
  })

  it('ein einzelner Workflow-Name bleibt einzeln erhalten', () => {
    const runs = [{ name: 'praemie-run', conclusion: null, status: 'in_progress', created_at: '2026-07-17T06:00:00Z', html_url: 'https://x/5' }]
    expect(latestRunPerWorkflow(runs)).toEqual([{ workflow: 'praemie-run', conclusion: null, status: 'in_progress', at: '2026-07-17T06:00:00Z', url: 'https://x/5' }])
  })
})

describe('summarizeCommits', () => {
  const commits = [
    { sha: 'a1', commit: { message: 'fix: erste Zeile\n\nweiterer Text', committer: { date: '2026-07-16T23:00:00Z' } } },
    { sha: 'b2', commit: { message: 'feat: zweite Zeile', committer: { date: '2026-07-17T00:00:00Z' } } },
    { sha: 'c3', commit: { message: 'chore: dritte Zeile', author: { date: '2026-07-17T05:00:00Z' } } },
  ]

  it('zählt Commits ab dem since-Zeitpunkt (inklusive Grenze), last = neuester', () => {
    const result = summarizeCommits(commits, '2026-07-17T00:00:00Z')
    expect(result.count).toBe(2)
    expect(result.last).toEqual({ sha: 'c3', message: 'chore: dritte Zeile', date: '2026-07-17T05:00:00Z' })
  })

  it('ein Commit knapp vor dem Cutoff zählt nicht mehr mit', () => {
    const result = summarizeCommits(commits, '2026-07-17T00:00:01Z')
    expect(result.count).toBe(1)
    expect(result.last?.sha).toBe('c3')
  })

  it('Message wird auf die erste Zeile gekürzt', () => {
    const result = summarizeCommits(commits, '2026-07-16T23:00:00Z')
    expect(result.last?.message).toBe('chore: dritte Zeile')
    const firstCommitResult = summarizeCommits([commits[0]], '2026-07-16T23:00:00Z')
    expect(firstCommitResult.last?.message).toBe('fix: erste Zeile')
  })
})

describe('chronicleLast', () => {
  it('wählt den Eintrag mit dem größten Datum', () => {
    const entries = [
      { collective_session: 24, date: '2026-07-11', summary: 'a', verdict: 'pass' },
      { collective_session: 25, date: '2026-07-12', summary: 'b', verdict: null },
    ]
    expect(chronicleLast(entries)).toEqual({ date: '2026-07-12', summary: 'b', verdict: null, session: 25 })
  })

  it('bei Gleichstand gewinnt der spätere Eintrag in der Datei (Nummerierungs-Drift)', () => {
    const entries = [
      { collective_session: 24, date: '2026-07-11', summary: 'erste 24', verdict: 'pass' },
      { collective_session: 24, date: '2026-07-11', summary: 'zweite 24', verdict: 'fail' },
    ]
    expect(chronicleLast(entries)?.summary).toBe('zweite 24')
  })

  it('leeres Array → null', () => {
    expect(chronicleLast([])).toBeNull()
  })

  it('Datenmüll (String, null, Objekt statt Array) → null, wirft nie', () => {
    expect(chronicleLast('kaputt')).toBeNull()
    expect(chronicleLast(null)).toBeNull()
    expect(chronicleLast({ not: 'an array' })).toBeNull()
    expect(chronicleLast([{ no: 'date field' }])).toBeNull()
  })
})

describe('vitalSignsLast', () => {
  it('liest die echte Form { updated, history } und wählt den jüngsten Eintrag nach Datum/Session', () => {
    // history steht in der echten Datei (src/data/atelier/vital-signs.json) neueste zuerst —
    // vitalSignsLast darf sich darauf NICHT verlassen, deshalb hier absichtlich so sortiert.
    const data = {
      updated: '2026-07-17',
      history: [
        { session: 34, date: '2026-07-17', closure: 0.32 },
        { session: 33, date: '2026-07-16', closure: 0.3 },
      ],
    }
    expect(vitalSignsLast(data)).toEqual({ date: '2026-07-17', closure: 0.32, session: 34 })
  })

  it('funktioniert unabhängig von der Array-Reihenfolge (ältester zuerst)', () => {
    const data = {
      updated: '2026-07-17',
      history: [
        { session: 33, date: '2026-07-16', closure: 0.3 },
        { session: 34, date: '2026-07-17', closure: 0.32 },
      ],
    }
    expect(vitalSignsLast(data)).toEqual({ date: '2026-07-17', closure: 0.32, session: 34 })
  })

  it('akzeptiert defensiv auch eine reine Array-Form', () => {
    const data = [
      { session: 1, date: '2026-07-01', closure: 0.1 },
      { session: 2, date: '2026-07-02', closure: 0.2 },
    ]
    expect(vitalSignsLast(data)).toEqual({ date: '2026-07-02', closure: 0.2, session: 2 })
  })

  it('kaputte Eingabe → null, wirft nie', () => {
    expect(vitalSignsLast(null)).toBeNull()
    expect(vitalSignsLast('kaputt')).toBeNull()
    expect(vitalSignsLast({ history: 'kaputt' })).toBeNull()
    expect(vitalSignsLast({ history: [] })).toBeNull()
  })
})

describe('ageDays', () => {
  it('rundet ab auf ganze Tage (Verweildauer, kein Kalendertag-Delta)', () => {
    expect(ageDays('2026-07-16T23:00:00Z', '2026-07-17T01:00:00Z')).toBe(0)
    expect(ageDays('2026-07-16T00:00:00Z', '2026-07-17T01:00:00Z')).toBe(1)
    expect(ageDays('2026-07-10T00:00:00Z', '2026-07-17T00:00:00Z')).toBe(7)
  })
})

describe('buildInbox', () => {
  it('überspringt Issues mit nicht parsbarem Titel und kürzt den Excerpt auf ~600 Zeichen', () => {
    const issues = [
      {
        number: 1,
        title: 'Request aus field-research: 2026-07-01 — Request: Foo',
        html_url: 'https://x/1',
        created_at: '2026-07-15T00:00:00Z',
        body: 'x'.repeat(650),
      },
      { number: 2, title: 'Irgendein anderer Issue-Titel', html_url: 'https://x/2', created_at: '2026-07-16T00:00:00Z', body: 'y' },
    ]
    const result = buildInbox(issues, '2026-07-17T00:00:00Z')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      repo: 'field-research',
      heading: '2026-07-01 — Request: Foo',
      issueNumber: 1,
      issueUrl: 'https://x/1',
      openedAt: '2026-07-15T00:00:00Z',
      ageDays: 2,
    })
    expect(result[0].excerpt).toHaveLength(600)
  })

  it('fehlender Body → leerer Excerpt statt Crash', () => {
    const issues = [{ number: 3, title: 'Request aus studio: Titel', html_url: 'https://x/3', created_at: '2026-07-17T00:00:00Z' }]
    const result = buildInbox(issues, '2026-07-17T00:00:00Z')
    expect(result[0].excerpt).toBe('')
  })
})
