// scripts/gate/brief.ts — CLI-Hülle um baueBrief(): liest das Validierungslog eines
// Integrate-Laufs und schreibt den Ablehnungsbrief nach stdout. Aufgerufen aus dem
// failure()-Schritt der Integrate-Workflows.
//
// Die Logik selbst steht in src/lib/gate/brief.ts und ist dort unter Test — hier passiert
// nichts als Argumente lesen, Datei lesen, ausgeben. Fehlt die Logdatei, wird bewusst `null`
// übergeben: Das ist der Fall „Lauf scheiterte vor der Prüfung", und der Brief muss ihn
// ausdrücklich als solchen benennen statt eine Korrektur zu verlangen.
import { existsSync, readFileSync } from 'node:fs'
import { baueBrief } from '../../src/lib/gate/brief'

function arg(name: string): string {
  const i = process.argv.indexOf(`--${name}`)
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : ''
}

const ns = arg('ns')
const logPfad = arg('log')
const runUrl = arg('run-url')
const date = arg('date') || new Date().toISOString().slice(0, 10)

if (!ns || !runUrl) {
  console.error('Aufruf: brief.ts --ns <namensraum> --run-url <url> [--log <pfad>] [--date <YYYY-MM-DD>]')
  process.exit(2)
}

const log = logPfad && existsSync(logPfad) ? readFileSync(logPfad, 'utf8') : null
process.stdout.write(`${baueBrief({ ns, log, runUrl, date })}\n`)
