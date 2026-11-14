import { existsSync, readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { BLOCK_SECONDS, decodeTape, deviationsOf, encodeTape, TAPE_MINUTE, tapeFile, WEB_TEST, type Deviation } from './block'
import { BLOCK_MS } from './clock'
import { GROUPS, OTHER } from './groups'
import { testsOf } from './ooni'
import { parseList } from './testlists'

const block = Date.parse('2026-11-12T19:35:00Z')
const lists = {
  global: parseList(['url,category_code,category_description,date_added,source,notes', 'https://www.dw.com/ru/,NEWS,News Media,2014-04-15,citizenlab,', 'https://example-casino.com/,GMB,Gambling,2017-01-01,ooni,'].join('\n')),
  byCountry: new Map<string, Map<string, string>>(),
}
const uid = (cc: string, test: string) => `20261112193806.003293_${cc}_${test.replace(/_/g, '')}_5413b98f121d3aad`
const row = (time: string, cc: string, test: string, input: string | null, flags: object) => ({
  measurement_start_time: `2026-11-12T${time}.000000Z`,
  probe_cc: cc,
  test_name: test,
  input,
  measurement_uid: uid(cc, test),
  ...flags,
})
const rows = {
  results: [
    row('19:38:05', 'RU', WEB_TEST, 'https://www.dw.com/ru/', { anomaly: true, confirmed: true }),
    row('19:35:00', 'IT', WEB_TEST, 'https://example-casino.com/', { anomaly: true, confirmed: true }),
    row('19:36:10', 'IR', WEB_TEST, 'https://someones-blog.example/', { anomaly: true }),
    row('19:37:00', 'RU', 'signal', null, { anomaly: true }),
    row('19:39:59', 'DE', WEB_TEST, 'https://www.dw.com/', {}),
    row('19:40:00', 'VE', WEB_TEST, 'https://www.dw.com/', { anomaly: true }),
  ],
}
const deviations = deviationsOf(testsOf(rows, block, block + BLOCK_MS), block, lists)

describe('a block of deviations', () => {
  it('keeps what deviated inside the block, in time order, with the kind of page', () => {
    expect(deviations.map((d) => [d.s, d.cc, d.state, d.test, GROUPS[d.group]!.id])).toEqual([
      [0, 'IT', 'confirmed', WEB_TEST, 'porn'],
      [70, 'IR', 'anomaly', WEB_TEST, 'other'],
      [120, 'RU', 'anomaly', 'signal', 'other'],
      [185, 'RU', 'confirmed', WEB_TEST, 'politics'],
    ])
  })

  it('names a page only when it is a news outlet, and then only its front page', () => {
    expect(deviations.map((d) => d.site)).toEqual(['', '', '', 'https://www.dw.com/'])
  })

  it('files a test that asks for no page under the last kind, without a page', () => {
    const signal = deviations.find((d) => d.test === 'signal')!
    expect(signal.group).toBe(OTHER)
    expect(signal.site).toBe('')
    expect(signal.uid).toBe(uid('RU', 'signal'))
  })
})

describe('the recording', () => {
  const tape = encodeTape(block, deviations, '2026-11-13')

  it('comes back as it went in', () => {
    const back = decodeTape(JSON.parse(JSON.stringify(tape)))!
    expect(back.from).toBe(block)
    expect(back.recorded).toBe('2026-11-13')
    expect(back.deviations).toEqual(deviations)
  })

  it('holds no tested address except a news outlet’s front page', () => {
    const text = JSON.stringify(tape)
    expect(text).not.toContain('casino')
    expect(text).not.toContain('someones-blog')
    expect(text).not.toContain('/ru/')
    expect(text).toContain('https://www.dw.com/')
  })

  it('is read like a stranger’s file: a row that is not exactly a row is dropped', () => {
    const good: (number | string)[] = [5, 'IR', 1, 0, 2, uid('IR', WEB_TEST)]
    const odd = {
      v: 1,
      from: '2026-11-12T19:35:00Z',
      recorded: '2026-11-13',
      tests: [WEB_TEST, 'Not A Test'],
      rows: [
        good,
        [5, 'IR', 1, 0, 2, 'javascript:alert(1)', 'javascript:alert(1)'],
        [5, 'IR', 1, 0, 2, uid('IR', WEB_TEST), 'https://user:pw@www.dw.com/'],
        [5, 'IR', 1, 0, 2, uid('IR', WEB_TEST), 'https://www.dw.com/deep/page?x=1'],
        [300, 'IR', 1, 0, 2, ''],
        [5.5, 'IR', 1, 0, 2, ''],
        [5, 'iran', 1, 0, 2, ''],
        [5, 'IR', 3, 0, 2, ''],
        [5, 'IR', 1, 1, 2, ''],
        [5, 'IR', 1, 9, 2, ''],
        [5, 'IR', 1, 0, GROUPS.length, ''],
        'not a row',
      ],
    }
    const back = decodeTape(odd)!
    expect(back.deviations).toHaveLength(4)
    expect(back.deviations.map((d) => d.uid)).toEqual([uid('IR', WEB_TEST), '', uid('IR', WEB_TEST), uid('IR', WEB_TEST)])
    expect(back.deviations.every((d) => d.site === '')).toBe(true)
  })

  it('refuses a file that is not a recording', () => {
    expect(decodeTape(null)).toBeNull()
    expect(decodeTape({ ...tape, v: 2 })).toBeNull()
    expect(decodeTape({ ...tape, from: '2026-11-12T19:36:00Z' })).toBeNull()
    expect(decodeTape({ ...tape, from: 'yesterday' })).toBeNull()
    expect(decodeTape({ ...tape, recorded: 'today' })).toBeNull()
    expect(decodeTape({ ...tape, rows: 'none' })).toBeNull()
  })

  it('lives in one file per hour of the day', () => {
    expect(tapeFile(0)).toBe('/comma/tape/00.json')
    expect(tapeFile(23)).toBe('/comma/tape/23.json')
    expect(tapeFile(24)).toBe('/comma/tape/00.json')
  })
})

describe('the recording that is committed', () => {
  const files = Array.from({ length: 24 }, (_, hour) => `public${tapeFile(hour)}`)

  it('has a block for every hour of one day, each from ten past the hour', () => {
    const days = new Set<string>()
    files.forEach((file, hour) => {
      expect(existsSync(file), file).toBe(true)
      const tape = decodeTape(JSON.parse(readFileSync(file, 'utf8')))
      expect(tape, file).not.toBeNull()
      const from = new Date(tape!.from)
      expect(from.getUTCHours(), file).toBe(hour)
      expect(from.getUTCMinutes(), file).toBe(TAPE_MINUTE)
      days.add(from.toISOString().slice(0, 10))
    })
    expect(days.size).toBe(1)
  })

  it('holds real blocks: hundreds of deviations each, from many countries, blockpages among them', () => {
    for (const file of files) {
      const raw = JSON.parse(readFileSync(file, 'utf8')) as { rows: unknown[] }
      const tape = decodeTape(raw)!
      // nothing was dropped on reading: every committed row is exactly a row
      expect(tape.deviations, file).toHaveLength(raw.rows.length)
      const web = tape.deviations.filter((d: Deviation) => d.test === WEB_TEST)
      expect(web.length, file).toBeGreaterThan(150)
      expect(new Set(web.map((d) => d.cc)).size, file).toBeGreaterThan(15)
      expect(web.some((d) => d.state === 'confirmed'), file).toBe(true)
      expect(web.every((d) => d.s >= 0 && d.s < BLOCK_SECONDS), file).toBe(true)
      expect(web.filter((d) => d.uid === '').length, file).toBe(0)
    }
  })

  it('sorts most pages into a named kind, so the lists were read when it was recorded', () => {
    const all = files.flatMap((file) => decodeTape(JSON.parse(readFileSync(file, 'utf8')))!.deviations.filter((d) => d.test === WEB_TEST))
    const named = all.filter((d) => d.group !== OTHER).length
    expect(named / all.length).toBeGreaterThan(0.5)
  })
})
