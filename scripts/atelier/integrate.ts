// scripts/atelier/integrate.ts
// Usage: tsx scripts/atelier/integrate.ts <sourceDir> <siteDir> [ns]
// ns defaults to 'atelier'; pass 'field' (or another) to integrate a second engine.
// Prints the JSON report to stdout; exit 0 always (the workflow decides on rejects/build).
import { integrate } from '../../src/lib/atelier/integrate'

const [sourceDir, siteDir, ns] = process.argv.slice(2)
if (!sourceDir || !siteDir) { console.error('usage: integrate <sourceDir> <siteDir> [ns]'); process.exit(2) }
const report = integrate({ sourceDir, siteDir, ns: ns || undefined })
console.log(JSON.stringify(report, null, 2))
