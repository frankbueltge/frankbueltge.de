// /og/papers/<cycle>.png — the preview card of each of the Field's papers, and of their index
// (2026-10-18). Drawn on the paper ground by the same renderer the practices' own pages use when they
// are shared (src/lib/engines/share-card.ts), so a paper looks like the Field's work it is, not like a
// section of the site.
import type { APIRoute, GetStaticPaths } from 'astro'
import { loadPaperEntries, paperCard, PAPERS_INDEX_CARD } from '@/lib/ecology/papers'
import { renderCard, type CardInput } from '@/lib/engines/share-card'

export const getStaticPaths = (() => [
  ...loadPaperEntries().map((entry) => ({ params: { cycle: entry.dir }, props: { card: paperCard(entry) as CardInput } })),
  { params: { cycle: 'index' }, props: { card: PAPERS_INDEX_CARD as CardInput } },
]) satisfies GetStaticPaths

export const GET: APIRoute = async ({ props }) => {
  const png = await renderCard((props as { card: CardInput }).card)
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } })
}
