// The Markdown edition of the newest trending day — for readers that parse text better than
// markup (retrieval agents, feed readers, terminals). Same file, same numbers as the page:
// src/lib/trending/markdown.ts renders both from the committed day.
import type { APIRoute } from 'astro'
import { audienceBefore, getLatestTrending } from '@/lib/trending/data'
import { renderMarkdown } from '@/lib/trending/markdown'

export const prerender = true

export const GET: APIRoute = () => {
  const day = getLatestTrending()
  const body = day
    ? renderMarkdown(day, audienceBefore(day.date))
    : '# Trending today\n\nNo day has been committed yet. The first ledger follows with the next nightly run.\n'
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } })
}
