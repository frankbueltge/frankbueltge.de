// One watched term, whole, addressed by its slug — the citation target of a term page. Carries
// today's counts AND the term's series read out of every committed run, so a reader gets the
// arc in one request instead of fetching thirty day files and joining them by hand.
import type { APIRoute, GetStaticPaths } from 'astro'
import { getLatestTerms, seriesFor } from '@/lib/trending/terms-data'
import type { TrendingTerm, TrendingTermsDay } from '@/lib/trending/terms-types'
import { countedPlatforms, searchedPlatforms, statusSentence } from '@/lib/trending/terms-view'

export const prerender = true

export const getStaticPaths: GetStaticPaths = () => {
  const file = getLatestTerms()
  if (!file) return []
  return file.terms.map((term) => ({ params: { slug: term.slug }, props: { file, term } }))
}

export const GET: APIRoute = ({ props }) => {
  const { file, term } = props as { file: TrendingTermsDay; term: TrendingTerm }
  return new Response(
    JSON.stringify(
      {
        source: 'https://github.com/frankbueltge/frankbueltge.de — src/data/trending/terms',
        page: `https://frankbueltge.de/trending/topics/${term.slug}`,
        licence: 'CC0-1.0 (data), per the licence line of 2026-07-26',
        note:
          'One term of the Common Ground watchlist: how often the phrase and its declared aliases occurred in ' +
          'documents each tracked platform returned, over one day, seven days and thirty, deduplicated by URL, ' +
          'plus the status derived from disclosed thresholds, the documents the counts were read from, and the ' +
          'daily series read out of every committed run rather than from any stored total. The run this record ' +
          'belongs to is dated below and is never edited afterwards; the whole watchlist is at ' +
          '/trending/topics.json.',
        $contract: 'trending-terms/1',
        run: {
          date: file.date,
          generated_at: file.generated_at,
          pipeline_version: file.pipeline_version,
          method_version: file.method_version,
          windows: file.windows,
          sources: file.sources,
        },
        term,
        derived: {
          status_sentence: statusSentence(term),
          platforms_searched: searchedPlatforms(file),
          platforms_carrying: countedPlatforms(term, searchedPlatforms(file)),
        },
        series: seriesFor(term.slug, 30),
      },
      null,
      2,
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } },
  )
}
