// scripts/atelier/rejection-feedback.ts — CLI for the integrate workflows.
// Usage: npx tsx scripts/atelier/rejection-feedback.ts /tmp/report.json field
// Prints markdown to stdout when the report contains rejections; prints nothing otherwise.
import { readFileSync } from 'node:fs'
import { rejectionFeedback } from '../../src/lib/atelier/feedback'

const [, , reportPath, ns] = process.argv
if (!reportPath) {
  console.error('usage: rejection-feedback.ts <report.json> <ns>')
  process.exit(2)
}
const report = JSON.parse(readFileSync(reportPath, 'utf8'))
const date = new Date().toISOString().slice(0, 10)
const md = rejectionFeedback(report, ns ?? 'atelier', date)
if (md) process.stdout.write(md)
