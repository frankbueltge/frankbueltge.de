import type { GcatClass, Omm, SatEntry, SatSnapshot } from './types'

export interface GcatMeta {
  class: GcatClass | null
  category: string | null
  owner: string | null
  state: string | null
}

const GCAT_CLASSES = new Set(['C', 'D', 'B', 'A'])

/** GCAT active.tsv → Map nach internationalem Designator (Spalte "Piece"). */
export function parseGcatActive(tsv: string): Map<string, GcatMeta> {
  const lines = tsv.split('\n')
  const header = (lines[0] ?? '').replace(/^#/, '').split('\t')
  const col = (name: string) => header.indexOf(name)
  const iPiece = col('Piece'), iClass = col('Class'), iCat = col('Category')
  const iOwner = col('Owner'), iState = col('OwnState')
  const map = new Map<string, GcatMeta>()
  for (const line of lines.slice(1)) {
    if (!line.trim() || line.startsWith('#')) continue
    const f = line.split('\t').map((c) => c.trim())
    const piece = f[iPiece]
    if (!piece) continue
    const cls = f[iClass]
    map.set(piece, {
      class: GCAT_CLASSES.has(cls) ? (cls as GcatClass) : null,
      category: f[iCat] || null,
      owner: f[iOwner] || null,
      state: f[iState] || null,
    })
  }
  return map
}

const SOURCES = [
  { name: 'CelesTrak', url: 'https://celestrak.org/NORAD/elements/', license: 'frei verfügbar; Attribution. Ursprünglich USSPACECOM/Space-Track.' },
  { name: 'GCAT (J. McDowell, planet4589.org)', url: 'https://planet4589.org/space/gcat/', license: 'CC-BY 4.0' },
]

export function buildSnapshot(
  groups: Record<string, Omm[]>,
  gcat: Map<string, GcatMeta>,
  generatedAt: string,
): SatSnapshot {
  const byNorad = new Map<number, SatEntry>()
  for (const [group, records] of Object.entries(groups)) {
    for (const o of records) {
      if (byNorad.has(o.NORAD_CAT_ID)) continue
      const meta = gcat.get(o.OBJECT_ID) ?? { class: null, category: null, owner: null, state: null }
      byNorad.set(o.NORAD_CAT_ID, {
        norad: o.NORAD_CAT_ID, name: o.OBJECT_NAME, intl: o.OBJECT_ID, group, gcat: meta, omm: o,
      })
    }
  }
  return {
    generated_at: generatedAt,
    sources: SOURCES,
    satellites: [...byNorad.values()].sort((a, b) => a.name.localeCompare(b.name)),
  }
}
