/** Kuratierte Zuordnung Wissenschafts-Infrastruktur → Firma, quellenbelegt.
 *  Ausschließlich Anzeige-Schicht: ergänzt Hosts, die der TDS-Tracker-Radar nicht kennt
 *  (readcube/altmetric/dimensions …). Auflösungsreihenfolge im Frontend: erst leak.firma
 *  aus der Pipeline (TDS), dann diese Liste. Archiv-JSONs bleiben unberührt. */
import data from '../../data/beifang/wissenschaft-infra.json'

export interface InfraEntry {
  domain: string
  firma: string
  eigentuemer: string | null
  kategorie: 'metrik-broker' | 'self-hosted-analytics' | 'verlagseigen'
  quelle: string
}

export const INFRA_ENTRIES: InfraEntry[] = data.eintraege as InfraEntry[]

const BY_DOMAIN = new Map<string, InfraEntry>(INFRA_ENTRIES.map((e) => [e.domain.toLowerCase(), e]))

/** sub.a.example.com → [sub.a.example.com, a.example.com, example.com]; erste Fundstelle gewinnt. */
export function infraFor(host: string): InfraEntry | null {
  const parts = host.toLowerCase().split('.')
  for (let i = 0; i < parts.length - 1; i++) {
    const cand = parts.slice(i).join('.')
    const hit = BY_DOMAIN.get(cand)
    if (hit) return hit
  }
  return null
}
