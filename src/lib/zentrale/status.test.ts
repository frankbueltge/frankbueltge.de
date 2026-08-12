// src/lib/zentrale/status.test.ts
import { describe, it, expect } from 'vitest'
import {
  latestRunPerWorkflow,
  summarizeCommits,
  chronicleLast,
  vitalSignsLast,
  cacheIsUsable,
  newestJournalEntry,
  journalTitle,
  ageDays,
  buildInbox,
  trayFor,
} from './status'

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

describe('cacheIsUsable', () => {
  const TTL = 180_000 // 3 Minuten, wie in der Pages Function

  it('frischer Eintrag ohne Schreibaktion: verwendbar', () => {
    expect(cacheIsUsable(1_000_000, 1_060_000, TTL, null)).toBe(true)
  })

  it('älter als die TTL: nicht verwendbar', () => {
    expect(cacheIsUsable(1_000_000, 1_180_000, TTL, null)).toBe(false)
    // Genau auf der Grenze zählt als abgelaufen.
    expect(cacheIsUsable(1_000_000, 1_000_000 + TTL, TTL, null)).toBe(false)
  })

  it('vor der letzten Schreibaktion gebaut: nicht verwendbar, auch wenn er frisch ist', () => {
    // Der Fall aus der Praxis: Cache um 23:17 gebaut, um 23:18 gemergt und geschlossen,
    // um 23:19 neu geladen. Frisch genug — und trotzdem überholt.
    expect(cacheIsUsable(1_000_000, 1_120_000, TTL, 1_060_000)).toBe(false)
  })

  it('nach der letzten Schreibaktion gebaut: wieder verwendbar', () => {
    // Nach dem erzwungenen Neuaufbau darf der Cache wieder greifen — sonst löste jeder
    // Reload nach einer Aktion erneut zehn GitHub-Abfragen aus.
    expect(cacheIsUsable(1_100_000, 1_120_000, TTL, 1_060_000)).toBe(true)
    // Gleichstand zählt als "danach gebaut".
    expect(cacheIsUsable(1_060_000, 1_120_000, TTL, 1_060_000)).toBe(true)
  })

  it('TTL schlägt auch bei alter Schreibaktion durch', () => {
    expect(cacheIsUsable(1_000_000, 1_500_000, TTL, 900_000)).toBe(false)
  })
})

describe('newestJournalEntry', () => {
  const listing = [
    { type: 'file', name: '2026-07-25-negative-parallax-candidate.md', html_url: 'https://x/a', download_url: 'https://raw/a' },
    { type: 'file', name: '2026-07-26-negative-parallax-the-rulers-own-unit.md', html_url: 'https://x/b', download_url: 'https://raw/b' },
    { type: 'file', name: '2026-07-24-put-back-on-the-map-initiation.md', html_url: 'https://x/c', download_url: 'https://raw/c' },
  ]

  it('wählt nach Datumspräfix, nicht nach Listenreihenfolge', () => {
    expect(newestJournalEntry(listing)).toEqual({
      name: '2026-07-26-negative-parallax-the-rulers-own-unit.md',
      date: '2026-07-26',
      url: 'https://x/b',
      downloadUrl: 'https://raw/b',
    })
  })

  it('mehrere Einträge am selben Tag: alphabetisch letzter, damit die Anzeige nicht springt', () => {
    const sameDay = [
      { type: 'file', name: '2026-07-25-signature-in-the-world-return-move.md' },
      { type: 'file', name: '2026-07-25-signature-in-the-world-first-move.md' },
    ]
    expect(newestJournalEntry(sameDay)?.name).toBe('2026-07-25-signature-in-the-world-return-move.md')
    // Umgekehrte Eingabereihenfolge muss dasselbe liefern.
    expect(newestJournalEntry([...sameDay].reverse())?.name).toBe('2026-07-25-signature-in-the-world-return-move.md')
  })

  it('ignoriert Verzeichnisse, Nicht-Markdown und Namen ohne Datumspräfix', () => {
    const mixed = [
      { type: 'dir', name: '2026-07-26-ein-verzeichnis' },
      { type: 'file', name: 'README.md' },
      { type: 'file', name: '2026-07-20-echt.md' },
      { type: 'file', name: '2026-07-27-kein-markdown.txt' },
    ]
    expect(newestJournalEntry(mixed)?.name).toBe('2026-07-20-echt.md')
  })

  it('fremde/leere Eingabe → null statt Wurf', () => {
    expect(newestJournalEntry(null)).toBeNull()
    expect(newestJournalEntry([])).toBeNull()
    expect(newestJournalEntry({ message: 'Not Found' })).toBeNull()
    expect(newestJournalEntry([null, 'x', 42])).toBeNull()
  })
})

describe('journalTitle', () => {
  it('nimmt die erste Überschrift und streicht das vorangestellte Datum', () => {
    const md = "# 2026-07-26 — The ruler's own unit\n\nYesterday's tick ended with a list…"
    expect(journalTitle(md)).toBe("The ruler's own unit")
  })

  it('Überschrift ohne Datum bleibt unangetastet', () => {
    expect(journalTitle('# Was der Apparat nicht sieht\n\nText')).toBe('Was der Apparat nicht sieht')
  })

  it('rät nichts aus dem Fließtext, wenn es keine Überschrift gibt', () => {
    expect(journalTitle('Nur Fließtext, keine Raute.\n\nNoch mehr Text.')).toBeNull()
    expect(journalTitle('')).toBeNull()
    expect(journalTitle(null)).toBeNull()
  })

  it('ignoriert ## und tiefere Ebenen sowie Rauten ohne Leerzeichen', () => {
    expect(journalTitle('## Unterabschnitt\n\n#kein-heading\n\n# Echte Überschrift')).toBe('Echte Überschrift')
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
    // Eine 650 Zeichen lange Anfrage kommt VOLLSTÄNDIG an. Früher schnitt der Bau bei 600 ab,
    // und weil der Rest nie gesendet wurde, konnte der „mehr“-Knopf im Dashboard nichts
    // aufklappen (Frank, 2026-07-31: „passiert nix“).
    expect(result[0].excerpt).toHaveLength(650)
  })

  // 15s instead of the 5s default: the 20k-char regex pass is fast in isolation (~3.6s)
  // but occasionally exceeds 5s under full-suite parallel load — and a flaky timeout here
  // blocks the practices' nightly publishing gates, which run this suite 4x/day.
  it('eine wirklich lange Anfrage wird gedeckelt — die Grenze bleibt, sie liegt nur weit genug', { timeout: 15_000 }, () => {
    const issues = [
      {
        number: 9,
        title: 'Request aus field-research: 2026-07-31 — Request: lang',
        html_url: 'https://x/9',
        created_at: '2026-07-17T00:00:00Z',
        body: 'z'.repeat(20000),
      },
    ]
    const result = buildInbox(issues, '2026-07-17T00:00:00Z')
    expect(result[0].excerpt).toHaveLength(12000)
  })

  it('fehlender Body → leerer Excerpt statt Crash', () => {
    const issues = [{ number: 3, title: 'Request aus studio: Titel', html_url: 'https://x/3', created_at: '2026-07-17T00:00:00Z' }]
    const result = buildInbox(issues, '2026-07-17T00:00:00Z')
    expect(result[0].excerpt).toBe('')
  })

  it('trägt Fach und Frist-Restlaufzeit an jedem Eintrag', () => {
    const head = (b: string, f: string) =>
      `> tl;dr: eine Zeile\n> braucht: ${b}\n> frist: ${f}\n> kontext: irgendwo\n\nText.`
    const issues = [
      { number: 1, title: 'Request aus field-research: A', html_url: 'u', created_at: '2026-08-01T00:00:00Z', body: head('entscheidung', '2026-08-10 — bevor Anker A2') },
      { number: 2, title: 'Request aus studio: B', html_url: 'u', created_at: '2026-08-01T00:00:00Z', body: head('weiterleitung', 'keine') },
    ]
    const result = buildInbox(issues, '2026-08-02T00:00:00Z')
    expect(result[0]).toMatchObject({ tray: 'today', needsAction: true, fristInDays: 8 })
    expect(result[1]).toMatchObject({ tray: 'postoffice', needsAction: false, fristInDays: null })
  })
})

// Die Regel, an die die Praxen gebunden sind (Frank, 2026-07-17, im Kopf jeder REQUESTS.md):
// eine Anfrage an Frank ist NIE ein Blocker; schweigt er, entscheiden sie selbst. Am 2026-08-02
// zeigte die Steuerzentrale acht Einträge unter „Heute nötig" — ehrlich waren es null. Diese
// Tests halten die Sortierung an der Regel fest, damit die Oberfläche nicht wieder gegen sie läuft.
describe('trayFor — die Standing Rule, nicht das Bauchgefühl', () => {
  const NOW = '2026-08-02T12:00:00Z'
  const head = (braucht: string | null, fristDate: string | null, structured = true) =>
    ({ structured, braucht, fristDate })

  it('nur eine datierte Frist in Reichweite ist heute nötig', () => {
    expect(trayFor(head('entscheidung', '2026-08-02'), NOW)).toBe('today')
    expect(trayFor(head('entscheidung', '2026-08-16'), NOW)).toBe('today')
  })

  it('eine Frist jenseits des Fensters läuft, sie drängt nicht', () => {
    // Der Detektor-Arm (#310) nennt den 2026-11-25 — echt, aber nicht heute.
    expect(trayFor(head('entscheidung', '2026-11-25'), NOW)).toBe('running')
    expect(trayFor(head('entscheidung', `2026-08-${17}`), NOW)).toBe('running')
  })

  it('eine verstrichene Frist ist nicht mehr seine — die Entscheidung ist gefallen', () => {
    expect(trayFor(head('entscheidung', '2026-07-30'), NOW)).toBe('running')
  })

  it('ohne Frist läuft die Praxis bis zu ihrer nächsten Session weiter', () => {
    expect(trayFor(head('entscheidung', null), NOW)).toBe('running')
    expect(trayFor(head('antwort', null), NOW)).toBe('running')
  })

  it('Weiterleitung geht nie in „heute" — auch nicht mit naher Frist', () => {
    // Frank, 2026-08-02: die Post liegt im Post Office, ob sie rausgeht ist seine Entscheidung,
    // und er braucht dafür keine wiederholten Erinnerungen.
    expect(trayFor(head('weiterleitung', null), NOW)).toBe('postoffice')
    expect(trayFor(head('weiterleitung', '2026-08-03'), NOW)).toBe('postoffice')
  })

  it('„braucht: nichts" ist zur Kenntnis, nicht zur Tat', () => {
    expect(trayFor(head('nichts', null), NOW)).toBe('fyi')
  })

  it('eine Anfrage ohne Kopf läuft ebenfalls — die Regel gilt auch für sie', () => {
    // Vorher zählte sie als „möglicherweise nötig"; genau daher kam ein Teil des Lärms.
    expect(trayFor(head(null, null, false), NOW)).toBe('running')
  })
})
