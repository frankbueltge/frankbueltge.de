import { describe, expect, it } from 'vitest'
import { MAX_NAME, MAX_NOTE, MAX_OWNER_NOTE, cleanName, cleanNote, validateRating } from './text'

const ok = (body: Record<string, unknown>, owner = false) => validateRating(body, { owner })

describe('validateRating', () => {
  it('takes a bare rating', () => {
    expect(ok({ work: 'lab:consensus', score: 4 })).toEqual({ ok: true, value: { work: 'lab:consensus', score: 4, text: null, name: null } })
  })

  it('refuses an id that is not one, and a score outside 1 to 5', () => {
    for (const work of ['consensus', 'lab:', 'arch:arrival', 'lab:Con', 'lab:../x', 42, null]) expect(ok({ work, score: 3 })).toEqual({ ok: false, reason: 'unknown-work' })
    for (const score of [0, 6, 2.5, '3', null, undefined, Number.NaN]) expect(ok({ work: 'lab:consensus', score })).toEqual({ ok: false, reason: 'score' })
  })

  it('wants the licence box for a visitor’s note, and not for the architect’s', () => {
    expect(ok({ work: 'lab:consensus', score: 5, text: 'Moving.' })).toEqual({ ok: false, reason: 'consent' })
    expect(ok({ work: 'lab:consensus', score: 5, text: 'Moving.', consent: 'yes' })).toEqual({ ok: false, reason: 'consent' })
    expect(ok({ work: 'lab:consensus', score: 5, text: 'Moving.', consent: true })).toMatchObject({ ok: true, value: { text: 'Moving.' } })
    expect(ok({ work: 'lab:consensus', score: 5, text: 'Moving.' }, true)).toMatchObject({ ok: true, value: { text: 'Moving.' } })
  })

  it('counts a note in characters and gives the architect more room', () => {
    const visitor = 'é'.repeat(MAX_NOTE)
    expect(ok({ work: 'lab:consensus', score: 2, text: visitor, consent: true })).toMatchObject({ ok: true })
    expect(ok({ work: 'lab:consensus', score: 2, text: `${visitor}x`, consent: true })).toEqual({ ok: false, reason: 'text-too-long' })
    expect(ok({ work: 'lab:consensus', score: 2, text: 'x'.repeat(MAX_OWNER_NOTE) }, true)).toMatchObject({ ok: true })
    expect(ok({ work: 'lab:consensus', score: 2, text: 'x'.repeat(MAX_OWNER_NOTE + 1) }, true)).toEqual({ ok: false, reason: 'text-too-long' })
  })

  it('takes a name only with a note, never for the architect, and only short', () => {
    expect(ok({ work: 'lab:consensus', score: 3, name: 'Ada' })).toMatchObject({ ok: true, value: { name: null } })
    expect(ok({ work: 'lab:consensus', score: 3, name: 'Ada', text: 'Fine.', consent: true })).toMatchObject({ ok: true, value: { name: 'Ada' } })
    expect(ok({ work: 'lab:consensus', score: 3, name: 'Ada', text: 'Fine.' }, true)).toMatchObject({ ok: true, value: { name: null } })
    expect(ok({ work: 'lab:consensus', score: 3, name: 'n'.repeat(MAX_NAME + 1), text: 'Fine.', consent: true })).toEqual({ ok: false, reason: 'name-too-long' })
    expect(ok({ work: 'lab:consensus', score: 3, name: 7, text: 'Fine.', consent: true })).toEqual({ ok: false, reason: 'name' })
  })

  it('treats an empty or blank note as no note', () => {
    expect(ok({ work: 'lab:consensus', score: 3, text: '   \n\n ' })).toMatchObject({ ok: true, value: { text: null } })
    expect(ok({ work: 'lab:consensus', score: 3, text: 5 })).toEqual({ ok: false, reason: 'text' })
  })
})

describe('cleaning', () => {
  it('drops control and invisible characters, trailing blanks and runs of empty lines', () => {
    expect(cleanNote('a\u0000b​c‮d \t\r\n\n\n\nnext  ')).toBe('abcd\n\nnext')
    expect(cleanNote('café')).toBe('café')
  })

  it('puts a name on one line', () => {
    expect(cleanName('  Ada \n Lovelace⁦ ')).toBe('Ada Lovelace')
  })
})
