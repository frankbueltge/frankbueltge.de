import { mkdir, writeFile } from 'node:fs/promises'
import { buildSnapshot, parseGcatActive } from '../src/lib/ueberflug/snapshot'
import type { Omm } from '../src/lib/ueberflug/types'

const UA = 'frankbueltge.de werkgruppe (hello@frankbueltge.de)'
const GROUPS = ['resource', 'sar', 'weather'] as const
const GCAT_URL = 'https://planet4589.org/space/gcat/tsv/derived/active.tsv'
const OUT = 'src/data/ueberflug/satellites.json'

async function get(url: string): Promise<Response> {
  const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(30_000) })
  if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`)
  return r
}

const groups: Record<string, Omm[]> = {}
for (const g of GROUPS) {
  const r = await get(`https://celestrak.org/NORAD/elements/gp.php?GROUP=${g}&FORMAT=json`)
  groups[g] = (await r.json()) as Omm[]
  console.log(`${g}: ${groups[g].length} Satelliten`)
}
const gcat = parseGcatActive(await (await get(GCAT_URL)).text())
console.log(`GCAT: ${gcat.size} aktive Objekte`)

const snapshot = buildSnapshot(groups, gcat, new Date().toISOString().replace(/\.\d+Z$/, 'Z'))
const matched = snapshot.satellites.filter((s) => s.gcat.class !== null).length
if (snapshot.satellites.length < 200) {
  throw new Error(`nur ${snapshot.satellites.length} Satelliten — Quelle unvollständig, nicht schreiben`)
}
if (matched / snapshot.satellites.length < 0.5) {
  throw new Error('GCAT-Join-Quote < 50 % — Feldstruktur prüfen, nicht schreiben')
}
await mkdir('src/data/ueberflug', { recursive: true })
await writeFile(OUT, JSON.stringify(snapshot, null, 1) + '\n')
console.log(`geschrieben: ${OUT} — ${snapshot.satellites.length} Satelliten, ${matched} mit GCAT-Klasse`)
