// src/lib/reception/register.ts
// A work's reception: critiques and visitor responses, committed = published (Git is the
// archive). Visitor texts arrive through the letterbox (/post) and are committed here only
// after review AND with the writer's explicit permission to publish — letters are mail by
// default, never publications. Every entry names its author mark and role; machine-written
// critiques say so.
import { z } from 'zod'
import raw from '@/data/reception/register.json'

export const receptionEntrySchema = z.object({
  /** stable id, `<yyyy-mm-dd>-<slug>` */
  id: z.string().regex(/^\d{4}-\d{2}-\d{2}-[a-z0-9-]+$/),
  work: z.object({
    ns: z.enum(['studio', 'field', 'atelier', 'plenum']),
    slug: z.string().min(3),
    title: z.string().min(1),
  }),
  author_mark: z.string().min(2),
  /** who is speaking: a critic's piece or a visitor's response */
  role: z.enum(['critic', 'visitor']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** plain paragraphs, rendered as written — no markup */
  paragraphs: z.array(z.string().min(1)).min(1),
  /** honest provenance line, e.g. "written by the conductor session on Frank's request" */
  provenance: z.string().min(3),
})
export type ReceptionEntry = z.infer<typeof receptionEntrySchema>

export function loadReception(): ReceptionEntry[] {
  const entries = z.array(receptionEntrySchema).parse(raw)
  return [...entries].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
}

/** entries for one work, oldest first (a reception reads chronologically) */
export function receptionFor(ns: string, slug: string): ReceptionEntry[] {
  return loadReception()
    .filter((e) => e.work.ns === ns && e.work.slug === slug)
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** slugs that have any reception, per namespace — for index-card links */
export function receivedSlugs(ns: string): Set<string> {
  return new Set(loadReception().filter((e) => e.work.ns === ns).map((e) => e.work.slug))
}
