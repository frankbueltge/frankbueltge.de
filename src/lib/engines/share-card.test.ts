// The preview image of a shared practice page (2026-10-18): a card on the paper ground where the
// maker committed no still, the maker's own still cut to the card's frame where it did.
import { rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { describe, expect, it } from 'vitest'
import { CARD, renderCard, renderStill, stillWindow, voiceOf } from './share-card'

const PNG = [0x89, 0x50, 0x4e, 0x47]

describe('the card on the paper ground', () => {
  it('is a 1200 × 630 PNG on the paper colour, with the practice’s voice at its edge', async () => {
    const png = await renderCard({ kicker: 'The Field · Meridian', title: 'Where the Near Miss Is Decided', line: 'presentation · cycle 007', practice: 'field' })
    expect([...png.slice(0, 4)]).toEqual(PNG)
    const { width, height } = await sharp(png).metadata()
    expect({ width, height }).toEqual(CARD)
    const { data } = await sharp(png).raw().toBuffer({ resolveWithObject: true })
    const at = (x: number, y: number) => [...data.subarray((y * CARD.width + x) * 4, (y * CARD.width + x) * 4 + 3)]
    expect(at(600, 600)).toEqual([0xf3, 0xef, 0xe6])
    expect(at(4, 300)).toEqual([0x2c, 0x6a, 0xa3])
  }, 20_000)

  it('draws the same card for the same page', async () => {
    const input = { kicker: 'The Studio · Ensemble', title: 'Filed Under', line: null, practice: 'studio' }
    expect(Buffer.from(await renderCard(input)).equals(Buffer.from(await renderCard(input)))).toBe(true)
  }, 20_000)

  it('gives a house without a voice of its own the ink', () => {
    expect(voiceOf('n-1').mark).toBe('#161412')
    expect(voiceOf('studio').text).toBe('#aa4b23')
  })
})

describe('the maker’s still', () => {
  it('takes the largest window of the card’s shape, centred across, from the top', () => {
    expect(stillWindow(1100, 4000)).toEqual({ left: 0, top: 0, width: 1100, height: 578 })
    expect(stillWindow(2400, 630)).toEqual({ left: 600, top: 0, width: 1200, height: 630 })
  })

  it('is cut and scaled to the card’s frame as a JPEG', async () => {
    const tall = await sharp({ create: { width: 1100, height: 3000, channels: 3, background: '#203040' } }).png().toBuffer()
    const file = join(tmpdir(), `share-card-still-${process.pid}.png`)
    await sharp(tall).toFile(file)
    const jpg = await renderStill(file)
    rmSync(file, { force: true })
    expect([...jpg.slice(0, 2)]).toEqual([0xff, 0xd8])
    const { width, height, format } = await sharp(jpg).metadata()
    expect({ width, height, format }).toEqual({ ...CARD, format: 'jpeg' })
  })
})
