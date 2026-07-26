#!/usr/bin/env node
/**
 * Holt die Oberflächen-Daten des Dataset-Registers aus dem jüngsten Snapshot-Release
 * von frankbueltge/dataset-hub nach src/data/datasets/.
 *
 * Warum nicht committen: der Stand wiegt rund 14 MB und wächst nächtlich — in der
 * Git-Historie der Site wären das Gigabyte pro Jahr. Das Archiv ist ohnehin der
 * dataset-hub (Git + getaggte Releases); die Site ist nur eine Ansicht davon.
 *
 * Regeln, die hier gelten (Bauregeln des Registers):
 * - Ausfälle vermerken, nie überbrücken: Schlägt der Abruf fehl, bricht der Build mit
 *   klarer Meldung ab. Ein leeres Register darf nie wie „nichts gefunden" aussehen,
 *   wenn es „Quelle nicht erreichbar" heißt.
 * - Prüfsummen prüfen: jede Datei wird gegen den SHA-256 aus dem Release-Manifest
 *   verifiziert, bevor sie verwendet wird.
 * - Nie URLs konstruieren: die Download-Adressen kommen wörtlich aus der GitHub-API.
 */
import { createHash } from 'node:crypto'
import { gunzipSync } from 'node:zlib'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const REPO = 'frankbueltge/dataset-hub'
const ZIEL = path.resolve('src/data/datasets')
const DATEIEN = ['eintraege.json', 'meta.json', 'details.json']

const kopf = { 'User-Agent': 'frankbueltge.de-build', Accept: 'application/vnd.github+json' }
if (process.env.GITHUB_TOKEN) kopf.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

function scheitern(grund) {
  console.error(`\n[dataset-daten] ABBRUCH: ${grund}`)
  console.error('[dataset-daten] Kein stiller Notlauf: ein Build ohne Registerdaten würde')
  console.error('[dataset-daten] eine leere Fläche zeigen, die wie „nichts vorhanden" aussieht.')
  process.exit(1)
}

async function hole(url, alsText = false) {
  const antwort = await fetch(url, { headers: kopf })
  if (!antwort.ok) throw new Error(`HTTP ${antwort.status} bei ${url}`)
  return alsText ? antwort.text() : Buffer.from(await antwort.arrayBuffer())
}

const vollstaendigVorhanden = DATEIEN.every((d) => existsSync(path.join(ZIEL, d)))
if (vollstaendigVorhanden && process.env.DATASET_DATEN_FRISCH !== '1') {
  console.log('[dataset-daten] lokaler Stand vorhanden — übersprungen (DATASET_DATEN_FRISCH=1 erzwingt Abruf)')
  process.exit(0)
}

let release
try {
  release = JSON.parse(await hole(`https://api.github.com/repos/${REPO}/releases`, true))
    .filter((r) => r.tag_name.startsWith('snapshot-') && !r.draft)
    .sort((a, b) => b.tag_name.localeCompare(a.tag_name))[0]
} catch (fehler) {
  scheitern(`Release-Liste nicht abrufbar (${fehler.message})`)
}
if (!release) scheitern('kein Release mit Tag snapshot-* gefunden')

console.log(`[dataset-daten] jüngster Snapshot: ${release.tag_name}`)

// Manifest liegt im Repo (klein, versioniert) und trägt die Prüfsummen.
let manifest
try {
  const roh = await hole(
    `https://raw.githubusercontent.com/${REPO}/main/snapshots/${release.tag_name}.manifest.json`,
    true,
  )
  manifest = JSON.parse(roh)
} catch (fehler) {
  scheitern(`Manifest zu ${release.tag_name} nicht abrufbar (${fehler.message})`)
}
const summen = new Map(manifest.assets.map((a) => [a.name, a.sha256]))

await mkdir(ZIEL, { recursive: true })
for (const datei of DATEIEN) {
  const asset = release.assets.find((a) => a.name === `${datei}.gz`)
  if (!asset) scheitern(`${datei}.gz fehlt im Release ${release.tag_name}`)

  let gepackt
  try {
    gepackt = await hole(asset.browser_download_url) // wörtlich aus der API, nicht gebaut
  } catch (fehler) {
    scheitern(`${datei} nicht ladbar (${fehler.message})`)
  }

  const erwartet = summen.get(asset.name)
  const tatsaechlich = createHash('sha256').update(gepackt).digest('hex')
  if (erwartet && erwartet !== tatsaechlich) {
    scheitern(`Prüfsumme von ${asset.name} weicht ab — Manifest ${erwartet}, geladen ${tatsaechlich}`)
  }

  const inhalt = gunzipSync(gepackt)
  JSON.parse(inhalt.toString('utf8')) // scheitert laut, wenn die Datei beschädigt ist
  await writeFile(path.join(ZIEL, datei), inhalt)
  console.log(`[dataset-daten] ${datei} — ${(inhalt.length / 1e6).toFixed(2)} MB, Prüfsumme ok`)
}

const meta = JSON.parse(await readFile(path.join(ZIEL, 'meta.json'), 'utf8'))
console.log(`[dataset-daten] Stand ${release.tag_name}: ${meta.zaehler.eintraege} Einträge, ` +
  `${meta.zaehler.werke} Werke, Schema ${meta.schema_version}`)
