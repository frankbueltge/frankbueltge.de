import { existsSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { F0, GROUPS } from './groups'
import { rowHarmonic, rowName, rowOfVoice, rowOrganFile, ROWS, testLabel, VOICE_FULL_SHARE, VOICE_GAP_SECONDS, VOICE_SILENT_SHARE, voiceOfRow, voiceOfTest, VOICES } from './voices'

describe('the voices below the pages', () => {
  it('sound lower than every kind of page, the more basic the lower: messengers on the third harmonic, ways around on the second', () => {
    expect(VOICES.map((v) => [v.id, v.harmonic, F0 * v.harmonic])).toEqual([
      ['talk', 3, 165],
      ['around', 2, 110],
    ])
    const lowestPage = Math.min(...GROUPS.map((g) => g.harmonic))
    for (const v of VOICES) expect(v.harmonic).toBeLessThan(lowestPage)
    // the ground itself stays free, for a network that is switched off
    expect(VOICES.some((v) => v.harmonic === 1)).toBe(false)
  })

  it('take their rows after the six kinds of page', () => {
    expect(ROWS).toBe(8)
    expect([rowOfVoice(0), rowOfVoice(1)]).toEqual([6, 7])
    expect(voiceOfRow(6)?.id).toBe('talk')
    expect(voiceOfRow(5)).toBeNull()
    expect(rowName(0)).toBe(GROUPS[0]!.name)
    expect(rowName(7)).toBe('ways around a block')
    expect(Array.from({ length: ROWS }, (_, row) => rowHarmonic(row))).toEqual([4, 5, 6, 7, 9, 11, 3, 2])
  })

  it('have a rendered tone each', () => {
    for (let row = 0; row < ROWS; row++) expect(existsSync(`public${rowOrganFile(row)}`), rowOrganFile(row)).toBe(true)
  })

  it('know which tests they hear, and leave the others silent', () => {
    expect(voiceOfTest('signal')).toBe(0)
    expect(voiceOfTest('facebook_messenger')).toBe(0)
    expect(voiceOfTest('tor')).toBe(1)
    expect(voiceOfTest('psiphon')).toBe(1)
    for (const silent of ['web_connectivity', 'openvpn', 'torsf', 'stunreachability', 'dnscheck', 'toString', '']) {
      expect(voiceOfTest(silent), silent).toBeNull()
      expect(testLabel(silent), silent).toBe('')
    }
    expect(testLabel('facebook_messenger')).toBe('Facebook Messenger')
    expect(testLabel('vanilla_tor')).toBe('Tor')
  })

  it('move slowly: one tone per country in the length of a block, and weights between a tenth and a half', () => {
    expect(VOICE_GAP_SECONDS).toBe(300)
    expect(VOICE_SILENT_SHARE).toBeLessThan(VOICE_FULL_SHARE)
  })
})
