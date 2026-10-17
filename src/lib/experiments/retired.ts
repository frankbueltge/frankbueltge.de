// src/lib/experiments/retired.ts — what a retired work owes.
//
// Frank's decision of 2026-10-17 (wording private, paraphrased): instruments that measure nothing
// are retired the way Machine Attention retired The Foreknown and Dark Ocean — the nightly run
// stops, the archive stays, the reason is committed, and the page says RETIRED. The reason itself
// lives in src/data/werke.ts (`retired.reason`), once; this module holds the frame around it and
// the arithmetic of the archive that stays, so the page, the method sheet and the shelf say the
// same thing.
//
// The same arrangement as unarchived.ts: a retired page and a running page look identical to a
// reader, and only the page can tell them apart. werke.test.ts fails if a werk carries `retired`
// and its page never mounts the notice.
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Werk } from '@/data/werke'

const HOUSE_REPO = 'https://github.com/frankbueltge/frankbueltge.de'

export type RetiredRecord = NonNullable<Werk['retired']>

/** The words around the reason. No digit is typed here: dates and counts come from the record. */
export const RETIRED_NOTICE = {
  /** the short mark, for a card or a strip */
  badge: 'retired',
  /** the kicker over the notice: "RETIRED · <date>" */
  kicker: (on: string) => `RETIRED · ${on}`,
  /** what the dated archive is, said once */
  dated: (p: { nights: number; first: string; last: string; path: string }) =>
    `The archive stays: ${p.nights.toLocaleString('en-GB')} nightly files, ${p.first} to ${p.last}, in ${p.path}.`,
  /** what a single rewritten snapshot's archive is */
  history: (p: { path: string }) =>
    `The archive stays: the instrument kept one file, rewritten every night, and each night's reading is a commit in the history of ${p.path}.`,
  /** the link text to the archive */
  open: 'open the archive →',
  /** what the rest of the page is, now */
  rest: 'What follows is the last reading, as the instrument left it.',
} as const

/** The dated nights an archive directory holds, from its own filenames: ascending, unique,
 *  `latest.json` and every other non-dated name ignored. Pure, so the count the notice prints is
 *  tested without touching the disk. */
export function archiveSpan(names: readonly string[]): { nights: number; first: string; last: string } | null {
  const days = [
    ...new Set(names.map((n) => /^(\d{4}-\d{2}-\d{2})\.json$/.exec(n)?.[1]).filter((d): d is string => Boolean(d))),
  ].sort()
  if (days.length === 0) return null
  return { nights: days.length, first: days[0], last: days[days.length - 1] }
}

/** Where a reader opens the archive: the directory for dated files, the file's commit history
 *  for a single snapshot. */
export function archiveHref(archive: RetiredRecord['archive']): string {
  return archive.kind === 'dated'
    ? `${HOUSE_REPO}/tree/main/${archive.path}`
    : `${HOUSE_REPO}/commits/main/${archive.path}`
}

/** The sentence about the archive, read from the repository at build time — relative to the
 *  working directory, the way the globe's layers read theirs (src/lib/globe/layers/archive.ts). */
export function archiveLine(archive: RetiredRecord['archive']): string {
  if (archive.kind === 'history') return RETIRED_NOTICE.history({ path: archive.path })
  const span = archiveSpan(readdirSync(resolve(process.cwd(), archive.path)))
  if (!span) throw new Error(`retired: ${archive.path} holds no dated nightly file — nothing to call an archive`)
  return RETIRED_NOTICE.dated({ ...span, path: `${archive.path}/` })
}
