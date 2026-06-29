// scripts/atelier/integrate.ts
// Usage: tsx scripts/atelier/integrate.ts <sourceDir> <siteDir>
// Prints the JSON report to stdout; exit 0 always (the workflow decides on rejects/build).
import { integrate } from '../../src/lib/atelier/integrate'

const [sourceDir, siteDir] = process.argv.slice(2)
if (!sourceDir || !siteDir) { console.error('usage: integrate <sourceDir> <siteDir>'); process.exit(2) }
const report = integrate({ sourceDir, siteDir })
console.log(JSON.stringify(report, null, 2))
