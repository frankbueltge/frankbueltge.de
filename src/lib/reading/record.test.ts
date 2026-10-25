import { describe, expect, it } from 'vitest'
import { RECORD_CONTRACT, serializeRecord, toRecordFile } from './record'

const SOURCE = 'https://frankbueltge.de/api/reading/record?round=after-cycle-010'
const entry = (id: string, day: string) => ({
  id,
  day,
  consent: '2026-10-26',
  primed: false,
  votes: [['hunger', 'cop31', 0, 1800], ['ebola', 'el-nino', 2, 2400]],
  estimates: [['aid-cut', 40, 6000]],
})

describe('toRecordFile', () => {
  it('keeps the readings in id order under CC0, with nothing the record did not hold', () => {
    const f = toRecordFile({ ok: true, round: 'after-cycle-010', entries: [entry('t-20261027-bbbbbbbbbbbb', '2026-10-27'), { ...entry('t-20261026-aaaaaaaaaaaa', '2026-10-26'), extra: 'dropped' }] }, SOURCE)
    expect(f).toMatchObject({ $contract: RECORD_CONTRACT, licence: 'CC0-1.0', readings: 2 })
    expect(f.entries.map((e) => e.id)).toEqual(['t-20261026-aaaaaaaaaaaa', 't-20261027-bbbbbbbbbbbb'])
    expect(Object.keys(f.entries[0]!)).toEqual(['id', 'day', 'consent', 'primed', 'votes', 'estimates'])
  })

  it('writes nothing from an answer in standby or a malformed reading', () => {
    expect(() => toRecordFile({ ok: false, reason: 'standby' }, SOURCE)).toThrow()
    expect(() => toRecordFile({ ok: true, round: 'r', entries: [{ ...entry('t-1', '2026-10-26') }] }, SOURCE)).toThrow()
    expect(() => toRecordFile({ ok: true, round: 'r', entries: [{ ...entry('t-20261026-aaaaaaaaaaaa', '2026-10-26'), votes: [['a', 'b', 7, 1]] }] }, SOURCE)).toThrow()
    expect(() => toRecordFile({ ok: true, round: 'r', entries: [{ ...entry('t-20261026-aaaaaaaaaaaa', '2026-10-26'), primed: 'no' }] }, SOURCE)).toThrow()
  })
})

describe('serializeRecord', () => {
  it('is valid JSON, one reading per line, and the same text for the same record', () => {
    const f = toRecordFile({ ok: true, round: 'after-cycle-010', entries: [entry('t-20261026-aaaaaaaaaaaa', '2026-10-26'), entry('t-20261026-cccccccccccc', '2026-10-26')] }, SOURCE)
    const text = serializeRecord(f)
    expect(JSON.parse(text)).toEqual(f)
    expect(text.split('\n').filter((l) => l.includes('"id":"t-')).length).toBe(2)
    expect(serializeRecord(toRecordFile(JSON.parse(text) && { ok: true, round: f.round, entries: f.entries }, SOURCE))).toBe(text)
  })

  it('writes an empty round as an empty list', () => {
    const text = serializeRecord(toRecordFile({ ok: true, round: 'after-cycle-010', entries: [] }, SOURCE))
    expect(JSON.parse(text).entries).toEqual([])
  })
})
