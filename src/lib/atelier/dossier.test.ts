// The dossier, checked twice — once against fixtures for each shape the archive contains, and
// once against the REAL committed records, because the entrance's whole claim is "this is what
// the record says right now" and a fixture can only prove the parser runs.
//
// The counts below are deliberately exact, and every one of them is a tripwire someone should
// look at when it fires. A line that gains a trace, a journal entry that starts naming its
// work-line, a record whose question moves to another section: each of those changes the front
// door of this site, and it should change a test at the same time rather than quietly changing
// what the entrance claims the practice is working on.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  attachJournal,
  buildDossiers,
  fm,
  lineName,
  moveKind,
  moveNumber,
  moveTitle,
  parseFrontmatter,
  parseJournal,
  parseTrace,
  readQuestion,
  renderInline,
  sortDossiers,
  splitFrontmatter,
  splitInlineNote,
  standOf,
  type Dossier,
  type DossierInput,
} from './dossier'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const PROJECTS = `${ROOT}src/content/atelier/projects`
const JOURNAL = `${ROOT}src/content/atelier/journal`

/** The real records, read the way the page's globs hand them over: absolute repo path → raw. */
function realInput(): DossierInput {
  const scores: Record<string, string> = {}
  const traces: Record<string, string> = {}
  const decisions: Record<string, string> = {}
  const journal: Record<string, string> = {}
  const files: string[] = []
  // "the way the page's globs hand them over" is meant literally: dossier-data.ts globs
  // projects/*/SCORE.md, */TRACE.md, */DECISION.md and projects/*/*.md — ONE level, files
  // only. A line that grows a subdirectory (work/, which landed with negative-parallax and
  // kartographie-statt-kopie on 2026-08-01) is invisible to the site, so it stays invisible
  // here. Reading it as a file threw EISDIR before this filter and took the whole suite
  // down at import time, which blocked the nightly integrate rather than reporting drift.
  for (const dir of readdirSync(PROJECTS, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue
    for (const entry of readdirSync(`${PROJECTS}/${dir.name}`, { withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) continue
      const name = entry.name
      const key = `/src/content/atelier/projects/${dir.name}/${name}`
      files.push(key)
      const raw = readFileSync(`${PROJECTS}/${dir.name}/${name}`, 'utf8')
      if (name === 'SCORE.md') scores[key] = raw
      if (name === 'TRACE.md') traces[key] = raw
      if (name === 'DECISION.md') decisions[key] = raw
    }
  }
  for (const name of readdirSync(JOURNAL)) {
    journal[`/src/content/atelier/journal/${name}`] = readFileSync(`${JOURNAL}/${name}`, 'utf8')
  }
  return { scores, traces, decisions, journal, files }
}

const real = buildDossiers(realInput())
const line = (id: string): Dossier => {
  const d = real.find((x) => x.id === id)
  if (!d) throw new Error(`no dossier for ${id}`)
  return d
}

// ————————————————————————————————————————————————— frontmatter ——————————————

describe('the frontmatter reader handles the shapes the records actually use', () => {
  it('splits the head from the body, and survives a record that has no head', () => {
    expect(splitFrontmatter('---\na: 1\n---\nbody')).toEqual({ head: 'a: 1', body: 'body' })
    expect(splitFrontmatter('# Trace\n\nbody')).toEqual({ head: '', body: '# Trace\n\nbody' })
  })

  it('reads scalars, strips the quotes YAML allows, and keeps empty keys empty', () => {
    const d = parseFrontmatter('status: ACTIVE\ntitle: "A — B"\npublication_approved_by:')
    expect(fm(d, 'status')).toBe('ACTIVE')
    expect(fm(d, 'title')).toBe('A — B')
    expect(fm(d, 'publication_approved_by')).toBeNull()
  })

  it('folds a `>` block into one paragraph, so a 92-column record reads as a sentence', () => {
    const d = parseFrontmatter('work_line:\n  work_intention: >\n    A work that holds\n    the three levels together.\n  horizon: open (months)')
    expect(fm(d, 'work_line', 'work_intention')).toBe('A work that holds the three levels together.')
    expect(fm(d, 'work_line', 'horizon')).toBe('open (months)')
  })

  it('keeps an inline comment, because in these records the comment carries the content', () => {
    const d = parseFrontmatter('work_line:\n  refrain_aspect: home  # tick 21 — the criterion')
    expect(splitInlineNote(fm(d, 'work_line', 'refrain_aspect')!)).toEqual({
      value: 'home',
      note: 'tick 21 — the criterion',
    })
  })

  it('reads the running line’s real frontmatter, nested block and all', () => {
    const np = line('2026-07-23-negative-parallax')
    expect(np.kind).toBe('work-line')
    expect(np.status).toBe('ACTIVE')
    // Read, not pinned: a disposition moves as the line works (this one went
    // PUBLICATION_CANDIDATE → PUBLISH on 2026-08-01). What this test is about is the PARSER —
    // a nested frontmatter block, folded to one paragraph.
    expect(np.disposition).toMatch(/^[A-Z_]+$/)
    expect(np.intention?.text).toContain('three-level displacement of error')
    expect(np.territory?.text).toContain('negative-parallax population')
    expect(np.horizon).toContain('open (months')
    // The refrain is read, not pinned — it moved from 'home' to 'territory' as the line worked.
    expect(np.refrain?.value).toBeTruthy()
    // The folded block is one paragraph, not the record's hard wraps.
    expect(np.intention?.text).not.toContain('\n')
  })
})

// ————————————————————————————————————————————————— the stand ————————————————

describe('the stand is derived from the record, never typed', () => {
  it('reads a disposition as the stand and an absent one as still running', () => {
    expect(standOf('PUBLICATION_CANDIDATE')).toBe('PUBLICATION_CANDIDATE')
    expect(standOf('KILL')).toBe('KILL')
    expect(standOf('')).toBe('RUNNING')
    expect(standOf(null)).toBe('RUNNING')
  })

  it('derives every real line’s stand from its own record, never from a typed field', () => {
    // Naming which line holds which stand was a snapshot, and a snapshot of a live archive
    // fails as the archive works: negative-parallax was the PUBLICATION_CANDIDATE here until
    // it was published on 2026-08-01, and that failure blocked the integrate instead of
    // telling anyone the entrance had changed. The derivation is the durable claim.
    for (const d of real) expect(d.stand, d.id).toBe(standOf(d.disposition))
    // …and the real archive exercises more than one shape, not just the fixtures above.
    expect(new Set(real.map((d) => d.stand)).size).toBeGreaterThan(1)
  })
})

// ————————————————————————————————————————————————— trace headings ———————————

describe('a move’s number is read from the record’s own numbering, not guessed', () => {
  it('prefers the leading number over a tick named inside the heading', () => {
    // The meta-line numbers ITS moves `#20` and mentions the OTHER line's tick 19 in the same
    // heading. Reading `tick` first mis-numbered every observation on that line by one.
    const h = "#20 — 2026-07-31 — Observation on the work-line's tick 19 (the gauge)"
    expect(moveNumber(h)?.value).toBe(20)
    expect(moveTitle(h)).toBe("Observation on the work-line's tick 19 (the gauge)")
  })

  it('reads all five numbering shapes the committed traces use', () => {
    expect(moveNumber('Tick 9 — 2026-07-26 — Home operation: the ruler’s own unit')?.value).toBe(9)
    expect(moveNumber('2026-07-18 — Tick 2: the primary reading')?.value).toBe(2)
    expect(moveNumber('In-vivo observation #10 — 2026-07-26 (a pure territory tick)')?.value).toBe(10)
    expect(moveNumber('T-003 — Pre-emption: the semantic distinction')?.value).toBe(3)
    expect(moveNumber('Trace entries')).toBeNull()
  })

  it('lifts number and date out of the title and leaves the record’s own words', () => {
    expect(moveTitle('Tick 21 — 2026-08-01 — The criterion that actually travels')).toBe(
      'The criterion that actually travels',
    )
    expect(moveTitle('2026-07-18 — Tick 2: the primary reading (Expose + Register)')).toBe(
      'the primary reading (Expose + Register)',
    )
    expect(moveTitle('In-vivo observation #10 — 2026-07-26 (a pure territory tick)')).toBe(
      'a pure territory tick',
    )
  })

  it('closes an orphaned bracket but never eats a legitimate one', () => {
    // The whole title is bracketed and the opening bracket left with the date …
    expect(moveTitle('Tick 6 — 2026-07-24 (home operation; the caption-strip test)')).toBe(
      'home operation; the caption-strip test',
    )
    // … but here the brackets are balanced and both belong to the record.
    expect(moveTitle('2026-07-25 — Tick 1: the first move (territory)')).toBe(
      'the first move (territory)',
    )
  })

  it('classifies the move from the record’s own vocabulary, specific before general', () => {
    expect(moveKind('Tick 16 — 2026-07-30 — Opening operation: the repair')).toBe('opening')
    expect(moveKind('Tick 8 — 2026-07-25 — Home operation: the postulate')).toBe('home')
    expect(moveKind('T-002 — Expose: the distinction tested')).toBe('expose')
    expect(moveKind('Compost in — 2026-07-25 — from the encounter line')).toBe('compost')
    expect(moveKind('Tick 19 — 2026-07-31 — The rate question')).toBe('move')
  })
})

// ————————————————————————————————————————————————— the trace ————————————————

describe('the trace is read in every grammar the archive keeps', () => {
  it('never puts an undated structural heading on a timeline', () => {
    // `## Trace entries` has no date of its own. Dating it from the first `- Date:` under it
    // produced one fictional move per line, titled after a container.
    const raw = [
      '# Consequential trace record',
      '',
      '## Trace entries',
      '',
      '### T-001 — Initiation: the phrase located',
      '',
      '- Date: 2026-07-20',
      '- What happened: The phrase was found in the live world.',
      '',
      '### T-002 — Expose: the distinction tested',
      '',
      '- Date: 2026-07-21',
      '- Operation performed: The primaries were read.',
    ].join('\n')
    const ticks = parseTrace(raw)
    expect(ticks.map((t) => t.title)).toEqual([
      'Initiation: the phrase located',
      'Expose: the distinction tested',
    ])
    expect(ticks.map((t) => t.date)).toEqual(['2026-07-20', '2026-07-21'])
    expect(ticks[0].lead).toBe('The phrase was found in the live world.')
    expect(ticks[1].lead).toBe('The primaries were read.')
  })

  it('does not descend to sub-headings when the top level already carries the moves', () => {
    // Otherwise the running line's ~100 sub-findings would each become a "move".
    const raw = [
      '## Tick 1 — 2026-07-23 — initiation',
      '',
      'The construct was built.',
      '',
      '### Provisional 1 — 2026-07-23 — confirmed at source',
      '',
      'A sub-finding, not a move.',
    ].join('\n')
    expect(parseTrace(raw).map((t) => t.title)).toEqual(['initiation'])
  })

  it('quotes a move that opens in bold — which is how this practice writes what matters', () => {
    const raw = '## Tick 21 — 2026-08-01 — The criterion\n\n**Pre-registered before any count,\nwith five defeat conditions.**\n\nMore prose.'
    expect(parseTrace(raw)[0].lead).toBe(
      '**Pre-registered before any count, with five defeat conditions.**',
    )
  })

  it('reads a budget that runs past its first line, in both shapes the records use', () => {
    const bold = '## Tick 2 — 2026-07-19 — Expose\n\n**Budget:** 2 of ≤ 6 ticks; 0 EUR;\n0 extractions.\n\nnext'
    expect(parseTrace(bold)[0].budget).toBe('2 of ≤ 6 ticks; 0 EUR; 0 extractions.')
    const field = '## Trace entries\n\n### T-001 — Judge\n\n- Date: 2026-07-21\n- Budget note: tick 4 of ≤5;\n  0 EUR.'
    expect(parseTrace(field)[0].budget).toBe('tick 4 of ≤5; 0 EUR.')
  })

  it('leaves a move without a stated summary empty rather than borrowing a neighbour’s', () => {
    const raw = '## Trace entries\n\n### T-005 — Judge: the kernel does not clear §5.4\n\n- Date: 2026-07-23\n- Type: judge / typed outcome'
    const t = parseTrace(raw)[0]
    expect(t.title).toBe('Judge: the kernel does not clear §5.4')
    expect(t.lead).toBeNull()
  })

  it('reads the real traces: every line that has one, and the running line in full', () => {
    // Which lines carry a TRACE.md is read off the archive rather than counted into the test:
    // "10 of the 12" stopped being true the night a thirteenth line landed. The claim that
    // matters is the correspondence — a line shows ticks exactly when it has a trace to show,
    // and shows none when it has not (gate-rehearsal, an infrastructure fixture, is the
    // standing example of the second case).
    // …and only one direction of it holds, which is the direction that guards against
    // invention: no line shows moves it has no trace for. The reverse is FALSE by a real
    // counterexample — sixty-cases-blind (landed 2026-08-01) carries a 180-line TRACE.md
    // written as a study report, in thematic sections rather than numbered moves, and
    // honestly yields none. A dossier that manufactured moves there would be lying.
    for (const d of real) {
      if (!existsSync(`${PROJECTS}/${d.id}/TRACE.md`)) expect(d.ticks, d.id).toEqual([])
    }
    expect(real.some((d) => d.tickCount > 0), 'no line shows a move — the trace parser went silent').toBe(true)

    // The running line, read in full: its moves are numbered from its own record, the newest
    // sorts last, and the composted-in move from the encounter line is carried as such.
    const np = line('2026-07-23-negative-parallax')
    expect(np.tickCount).toBe(np.ticks.length)
    expect(np.ticks.filter((t) => t.kind === 'compost').length).toBeGreaterThanOrEqual(1)
    const newest = np.ticks[np.ticks.length - 1]
    expect(newest.number).toBe(Math.max(...np.ticks.map((t) => t.number ?? 0)))
    expect(newest.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(newest.lead).toBeTruthy()

    // The T-00N template lines are read at their own level, and are not one fake move each.
    for (const id of ['2026-07-20-vegetative-em', '2026-07-21-untested-second', '2026-07-22-unmoved-ground']) {
      const d = line(id)
      expect(d.tickCount).toBeGreaterThan(1)
      expect(d.ticks.map((t) => t.title)).not.toContain('Trace entries')
    }
  })

  it('gives every real move a date, and every date the shape the archive uses', () => {
    for (const d of real) {
      for (const t of d.ticks) expect(t.date).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })
})

// ————————————————————————————————————————————————— the journal ——————————————

describe('journal entries find their line by what the entry itself declares', () => {
  it('reads the byline, its work-line and its opening paragraph — not the byline as the lead', () => {
    const raw = [
      '# 2026-08-01 — A number with no single value',
      '',
      '**Work-line:** `2026-07-23-negative-parallax` · tick 21 · home operation',
      '',
      'Two days ago I measured whether a threshold',
      'carries its warrant downstream.',
    ].join('\n')
    const e = parseJournal(raw, '/src/content/atelier/journal/2026-08-01-a-number.md')
    expect(e.date).toBe('2026-08-01')
    expect(e.title).toBe('A number with no single value')
    expect(e.workLine).toBe('2026-07-23-negative-parallax')
    expect(e.byline).toContain('tick 21 · home operation')
    expect(e.lead).toBe('Two days ago I measured whether a threshold carries its warrant downstream.')
    expect(e.source).toBe('src/content/atelier/journal/2026-08-01-a-number.md')
  })

  it('prefers the declared work-line over the filename, and falls back to the filename', () => {
    const declared = parseJournal(
      '# 2026-08-01 — X\n\n**Work-line:** `2026-07-23-negative-parallax` · tick 21\n\nprose.',
      '/src/content/atelier/journal/2026-08-01-nothing-in-the-name.md',
    )
    const byName = parseJournal(
      '# 2026-07-24 — Y\n\nprose.',
      '/src/content/atelier/journal/2026-07-24-negative-parallax-expose.md',
    )
    const attached = attachJournal([declared, byName], ['2026-07-23-negative-parallax'])
    expect(attached['2026-07-23-negative-parallax']).toHaveLength(2)
  })

  it('does not let a shorter line name steal a longer line’s entries', () => {
    const e = parseJournal('# 2026-07-24 — Z\n\nprose.', '/src/content/atelier/journal/2026-07-24-null-island-ii-expose.md')
    const attached = attachJournal([e], ['2026-07-19-null-island', '2026-07-24-null-island-ii'])
    expect(attached['2026-07-19-null-island']).toHaveLength(0)
    expect(attached['2026-07-24-null-island-ii']).toHaveLength(1)
  })

  it('lineName drops the date the folder carries', () => {
    expect(lineName('2026-07-23-negative-parallax')).toBe('negative-parallax')
  })

  it('attaches the real journal — including the entries a filename rule cannot see', () => {
    // THE REASON THIS RULE EXISTS. Many of the running line's newest entries are titled after
    // their finding, not their line; the filename rule alone saw a fraction of them and the
    // entrance therefore looked stalled at 24 July while the line moved daily. The exact
    // count made this a record of one night rather than of the rule, so the rule is checked:
    // entries attach, and the line's last move is its newest tick.
    const np = line('2026-07-23-negative-parallax')
    expect(np.journalCount).toBeGreaterThan(0)
    expect(np.lastMove).toBe(np.ticks[np.ticks.length - 1].date)

    // The nightly register (28 Jun – 18 Jul) predates every line and stays unattached — so
    // attachment is real but never total, in either direction.
    const journalFiles = readdirSync(JOURNAL).filter((f) => f.endsWith('.md')).length
    const attachedTotal = real.reduce((n, d) => n + d.journalCount, 0)
    expect(attachedTotal).toBeGreaterThan(0)
    expect(attachedTotal).toBeLessThan(journalFiles)
  })
})

// ————————————————————————————————————————————————— inline markup ———————————

describe('the record’s own emphasis is rendered, not printed as syntax', () => {
  it('renders bold, italic and code the way the record wrote them', () => {
    expect(renderInline('**Pre-registered** before any count')).toBe(
      '<b>Pre-registered</b> before any count',
    )
    expect(renderInline('What *kind of thing* is a negative parallax')).toBe(
      'What <i>kind of thing</i> is a negative parallax',
    )
    expect(renderInline('a seed landed in `REQUESTS.md`')).toBe(
      'a seed landed in <code>REQUESTS.md</code>',
    )
  })

  it('escapes before it emphasises, so nothing in a record can become markup', () => {
    // The archive genuinely contains angle brackets — this is from the running line.
    expect(renderInline('ϖ/σ_ϖ > 10 and BP flux-over-error > 10')).toContain('&gt; 10')
    expect(renderInline('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;',
    )
    expect(renderInline('AT&T')).toBe('AT&amp;T')
  })

  it('does not turn a mid-word underscore or a multiplication into emphasis', () => {
    expect(renderInline('astrometric_params_solve = 31')).toBe('astrometric_params_solve = 31')
    expect(renderInline('2 * 3 * 4')).toBe('2 * 3 * 4')
  })

  it('keeps a link’s text and drops its target — the dossier cites paths itself', () => {
    expect(renderInline('see [the note](https://example.org/x) for this')).toBe(
      'see the note for this',
    )
  })

  it('changes no word of any real quotation — only its markers', () => {
    const strip = (s: string) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    for (const d of real) {
      for (const m of d.moves) {
        if (!m.text) continue
        // The emphasis patterns below are renderInline's own, marker-stripping instead of
        // tag-wrapping — including its flanking rule (a span may not open or close on
        // whitespace). An earlier copy here omitted that rule, and on 2026-08-04 a dossier
        // wrote `COUNT(*)` before an italic journal name: without flanking, one match ran
        // from the literal asterisk all the way to the italic's opening one, swallowing
        // both. renderInline was right; its understudy was not. If those patterns change,
        // change them here in the same commit.
        const plain = m.text
          .replace(/\*\*|`/g, '')
          .replace(/(^|[\s(“"—–-])\*([^*\s][^*\n]*?[^*\s]|[^*\s])\*/g, '$1$2')
          .replace(/(^|[\s(“"—–])_([^_\s][^_\n]*?[^_\s]|[^_\s])_/g, '$1$2')
        expect(strip(renderInline(m.text))).toBe(plain)
      }
    }
  })
})

// ————————————————————————————————————————————————— the question —————————————

describe('the question is quoted from the record, or stated as missing', () => {
  it('reads SCORE §2’s Initial question whole, past the record’s hard wraps', () => {
    const body = '## 2. Problem construction\n\n**Initial question**\n\nWhat kind of thing is this —\nand what follows from it?\n\n**Consequential non-fit**\n\nSomething else.'
    const q = readQuestion(body, 'src/x/SCORE.md')
    expect(q?.text).toBe('What kind of thing is this — and what follows from it?')
    expect(q?.label).toBe('initial question')
    expect(q?.source).toBe('src/x/SCORE.md')
  })

  it('falls back to a question SECTION for the encounter template, which has no such field', () => {
    const body = '## 2. Local question (reshaped from Frank’s candidate)\n\nWhether the world carries the signature.\n\n## 3. Method\n\nNot this.'
    const q = readQuestion(body, 'src/x/SCORE.md')
    expect(q?.text).toBe('Whether the world carries the signature.')
    expect(q?.label).toBe('local question')
  })

  it('returns null where the record states none, rather than inventing one', () => {
    expect(readQuestion('## 1. Source situation\n\nA fixture.', 'src/x/SCORE.md')).toBeNull()
  })

  it('finds a question for every real line but the infrastructure fixture', () => {
    const without = real.filter((d) => d.question === null).map((d) => d.id)
    expect(without).toEqual(['2026-07-18-gate-rehearsal'])
    // Every quoted question carries the path it was read from — the house honesty rule.
    for (const d of real) {
      if (d.question) expect(d.question.source).toBe(`src/content/atelier/projects/${d.id}/SCORE.md`)
    }
  })
})

// ————————————————————————————————————————————————— the dossier ——————————————

describe('the dossier assembles the record without adding to it', () => {
  it('builds one dossier per line, running lines first, newest activity leading', () => {
    // One dossier per line that has a record — derived from disk, because the archive gains
    // lines by working (sixty-cases-blind landed 2026-08-01) and gaining one is not drift.
    const lines = readdirSync(PROJECTS, { withFileTypes: true })
      .filter((e) => e.isDirectory() && existsSync(`${PROJECTS}/${e.name}/SCORE.md`))
    expect(real).toHaveLength(lines.length)

    // The ordering rule, which does not drift: ACTIVE lines lead, CLOSED follow.
    const firstClosed = real.findIndex((d) => d.status !== 'ACTIVE')
    if (firstClosed >= 0) {
      expect(real.slice(0, firstClosed).every((d) => d.status === 'ACTIVE')).toBe(true)
      expect(real.slice(firstClosed).every((d) => d.status === 'CLOSED')).toBe(true)
    }
  })

  it('sorts by last move inside each group, and is stable on a tie', () => {
    const mk = (id: string, status: string, lastMove: string) =>
      ({ id, status, lastMove }) as Dossier
    expect(
      sortDossiers([
        mk('b', 'CLOSED', '2026-07-20'),
        mk('a', 'CLOSED', '2026-07-20'),
        mk('c', 'ACTIVE', '2026-07-01'),
      ]).map((d) => d.id),
    ).toEqual(['c', 'a', 'b'])
  })

  it('leads each dossier with its newest moves, newest first, record before retelling', () => {
    const np = line('2026-07-23-negative-parallax')
    expect(np.moves).toHaveLength(4)
    const dates = np.moves.map((m) => m.date)
    expect([...dates].sort().reverse()).toEqual(dates)
    // Same day: the trace's own entry sorts above the journal entry that reports it. Which
    // kind leads on any given night depends on what the practice did that night, so the
    // TIE-BREAK is what is checked — a journal move is never followed by a trace move of the
    // same date. (Pinning moves[0] to 'journal' made an ordinary night's work a test failure.)
    for (let i = 1; i < np.moves.length; i++) {
      if (np.moves[i].date !== np.moves[i - 1].date) continue
      expect(
        np.moves[i - 1].from === 'journal' && np.moves[i].from === 'trace',
        `${np.moves[i].date}: a trace move sorted below the journal entry reporting it`,
      ).toBe(false)
    }
    const journalMove = np.moves.find((m) => m.from === 'journal')
    if (journalMove) expect(journalMove.href).toMatch(/^\/atelier\/journal\/.+\/$/)
  })

  it('carries a source path with every move, so a quote can always be checked', () => {
    for (const d of real) {
      for (const m of d.moves) {
        expect(m.source).toMatch(/^src\/content\/atelier\//)
        expect(m.source.startsWith('/')).toBe(false)
      }
    }
  })

  it('lists what the record consists of, and knows what each file is', () => {
    // The list is derived from the records on disk rather than frozen here: a line gains
    // records as it works (negative-parallax gained DECISION.md and REVIEW-2026-07.md on
    // 2026-08-01), and gaining one is the practice working, not the dossier drifting.
    for (const d of real) {
      const onDisk = readdirSync(`${PROJECTS}/${d.id}`, { withFileTypes: true })
        .filter((e) => e.isFile() && e.name.endsWith('.md'))
        .map((e) => e.name.replace(/\.md$/, ''))
        .sort()
      expect(d.sources.map((s) => s.label).sort(), d.id).toEqual(onDisk)
    }
    // …and it knows what each file IS, which is the part that would silently rot.
    const np = line('2026-07-23-negative-parallax')
    expect(np.sources.find((s) => s.label === 'PREREGISTRATION-tick21')?.note).toContain(
      'before the count',
    )
  })

  it('carries the closing ledger for exactly the lines whose record states one', () => {
    // Same coverage ledger.test.ts asserts — restated here because the dossier is now where a
    // visitor READS it, at readable size, instead of in a 5px gutter.
    const withLedger = real.filter((d) => d.ledger).map((d) => d.id).sort()
    expect(withLedger).toEqual([
      '2026-07-18-name-test',
      '2026-07-19-mach-ancestor',
      '2026-07-19-null-island',
      '2026-07-20-retraction-signature',
      '2026-07-20-vegetative-em',
      '2026-07-21-untested-second',
      '2026-07-22-unmoved-ground',
    ])
    expect(line('2026-07-20-retraction-signature').ledger?.full).toContain('Budget closed at 2')
  })

  it('never invents a value where the record is silent', () => {
    const gr = line('2026-07-18-gate-rehearsal')
    expect(gr.question).toBeNull()
    expect(gr.ledger).toBeNull()
    expect(gr.ticks).toEqual([])
    expect(gr.intention).toBeNull()
    // …and still produces a dossier, because a line that says little still says it publicly.
    expect(gr.title).toContain('Gate rehearsal fixture')
    expect(gr.stand).toBe('KILL')
  })

  it('bounds the moves it renders, and says the bound is a page-weight choice not a cut', () => {
    const two = buildDossiers(realInput(), 2)
    expect(two.find((d) => d.id === '2026-07-23-negative-parallax')!.moves).toHaveLength(2)
    // The full trace is still carried, so the page can say how many there are — the bound
    // applies to what is RENDERED, never to what is counted.
    expect(two.find((d) => d.id === '2026-07-23-negative-parallax')!.tickCount).toBe(
      line('2026-07-23-negative-parallax').tickCount,
    )
  })
})
