import { describe, expect, it } from 'vitest'
import { buildSnapshot, parseGcatActive } from './snapshot'
import type { Omm } from './types'

const GCAT_TSV = [
  '#JCAT\tPiece\tName\tLaunchDate\tLState\tOwner\tOwnState\tUNState\tMass\tClass\tCategory\tTF\tPerigee\tApogee\tInc\tOpOrbit',
  '# Updated 2026 Jun 10',
  'S00965\t1964-083D\tNNS 30020\t1964 Dec 13\tUS\tBUWEPS\tUS\tUS\t54.000\tD\tNAV\tZ\t1027\t1084\t89.98\tLEO/P',
  'S39084\t2013-008A\tLandsat 8\t2013 Feb 11\tUS\tUSGS\tUS\tUS\t1512\tC\tIMG\tZ\t702\t703\t98.2\tLEO/S',
].join('\n')

function omm(partial: Partial<Omm>): Omm {
  return {
    OBJECT_NAME: 'X', OBJECT_ID: '2013-008A', NORAD_CAT_ID: 39084, EPOCH: '2026-06-12T00:00:00',
    MEAN_MOTION: 14.57, ECCENTRICITY: 0.0001, INCLINATION: 98.2, RA_OF_ASC_NODE: 100,
    ARG_OF_PERICENTER: 90, MEAN_ANOMALY: 0, EPHEMERIS_TYPE: 0, CLASSIFICATION_TYPE: 'U',
    ELEMENT_SET_NO: 999, REV_AT_EPOCH: 1, BSTAR: 0.0001, MEAN_MOTION_DOT: 0,
    MEAN_MOTION_DDOT: 0, ...partial,
  }
}

describe('parseGcatActive', () => {
  it('parst Datenzeilen, überspringt #-Zeilen, indiziert nach Piece', () => {
    const map = parseGcatActive(GCAT_TSV)
    expect(map.get('2013-008A')).toEqual({ class: 'C', category: 'IMG', owner: 'USGS', state: 'US' })
    expect(map.get('1964-083D')?.class).toBe('D')
    expect(map.size).toBe(2)
  })

  it('unbekannte Klasse wird null', () => {
    const tsv = GCAT_TSV.replace('\tC\tIMG\t', '\tX\tIMG\t')
    expect(parseGcatActive(tsv).get('2013-008A')).toEqual({
      class: null, category: 'IMG', owner: 'USGS', state: 'US',
    })
  })
})

describe('buildSnapshot', () => {
  it('joined OMM mit GCAT über OBJECT_ID, dedupliziert über NORAD, sortiert nach Name', () => {
    const groups = {
      resource: [omm({ OBJECT_NAME: 'LANDSAT 8', OBJECT_ID: '2013-008A', NORAD_CAT_ID: 39084 })],
      sar: [
        omm({ OBJECT_NAME: 'LANDSAT 8', OBJECT_ID: '2013-008A', NORAD_CAT_ID: 39084 }), // Duplikat
        omm({ OBJECT_NAME: 'ANONYM', OBJECT_ID: '2099-001A', NORAD_CAT_ID: 99999 }),    // ohne GCAT
      ],
    }
    const snap = buildSnapshot(groups, parseGcatActive(GCAT_TSV), '2026-06-12T05:00:00Z')
    expect(snap.satellites).toHaveLength(2)
    const landsat = snap.satellites.find((s) => s.norad === 39084)!
    expect(landsat.gcat).toEqual({ class: 'C', category: 'IMG', owner: 'USGS', state: 'US' })
    expect(landsat.group).toBe('resource') // erste Gruppe gewinnt
    const anon = snap.satellites.find((s) => s.norad === 99999)!
    expect(anon.gcat).toEqual({ class: null, category: null, owner: null, state: null })
    expect(snap.generated_at).toBe('2026-06-12T05:00:00Z')
    expect(snap.sources.map((s) => s.name)).toEqual(['CelesTrak', 'GCAT (J. McDowell, planet4589.org)'])
  })
})
