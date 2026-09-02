// The Markdown edition of the arcs hub — for readers that parse text better than markup
// (retrieval agents, feed readers, terminals). Same file, same numbers, same wording as the
// page: src/lib/trending/terms-markdown.ts renders both from the committed run.
import type { APIRoute } from 'astro'
import { getLatestTerms } from '@/lib/trending/terms-data'
import { renderTermsMarkdown } from '@/lib/trending/terms-markdown'

export const prerender = true

export const GET: APIRoute = () => {
  const file = getLatestTerms()
  const body = file
    ? renderTermsMarkdown(file)
    : '# Trends in the making\n\nNo run of the term tracker has been committed yet. The first one follows with the next nightly pipeline.\n'
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
}
