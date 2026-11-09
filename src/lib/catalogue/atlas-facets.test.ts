import { describe, expect, it } from 'vitest'
import works from '@/data/atlas/werke.json'
import { FORM_LABEL, SHOWN_LABEL, formGroup, shownGroup } from './atlas-facets'

type W = { form: string; venue_prize: string; added_on?: string | null }
const atlas = works as W[]

describe('atlas facets', () => {
  it('sorts forms into six groups and never guesses an unknown one', () => {
    expect(formGroup('physical-installation')).toBe('installation')
    expect(formGroup('digital-web')).toBe('screen')
    expect(formGroup('hybrid')).toBe('mixed')
    expect(formGroup('something-new')).toBe('mixed')
  })

  it('reads where a work was shown from its venue line', () => {
    expect(shownGroup('S+T+ARTS Prize 2024 (Ars Electronica)')).toBe('ars')
    expect(shownGroup('Rhizome ArtBase')).toBe('rhizome')
    expect(shownGroup('dataphys.org — List of Physical Visualizations')).toBe('dataphys')
    expect(shownGroup('Barbican Centre, London')).toBe('venues')
  })

  it('labels every group the data produces, and no group holds most of the atlas alone', () => {
    const forms = new Map<string, number>()
    for (const w of atlas) forms.set(formGroup(w.form), (forms.get(formGroup(w.form)) ?? 0) + 1)
    for (const g of forms.keys()) expect(FORM_LABEL[g as keyof typeof FORM_LABEL]).toBeTruthy()
    for (const w of atlas) expect(SHOWN_LABEL[shownGroup(w.venue_prize)]).toBeTruthy()
    // The point of replacing stance: a filter whose largest option holds four fifths of the
    // works separates nothing. Keep the largest form group under half.
    expect(Math.max(...forms.values()) / atlas.length).toBeLessThan(0.5)
  })

  it('dates every work by the day it entered the atlas', () => {
    for (const w of atlas) expect(w.added_on, 'an atlas entry without added_on').toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
