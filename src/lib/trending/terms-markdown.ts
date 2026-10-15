/** The Markdown edition of the arcs hub — for readers that parse text better than markup
 *  (retrieval agents, feed readers, terminals). Same file, same numbers, same wording as the
 *  page: both are rendered from the committed terms file through ./terms-view.ts. */
import { SITE } from '@/lib/site'
import { fmtDateLong, fmtTimeUtc } from './format'
import type { TrendingTermsDay } from './terms-types'
import {
  candidateItems,
  countedPlatforms,
  joinWithAnd,
  GOVERNANCE_RULE,
  letGoItems,
  letGoSentence,
  originMark,
  originSentence,
  promotedItems,
  promotionSentence,
  PROMOTION_RULE,
  searchedPlatforms,
  sortTerms,
  statusLabel,
  statusSentence,
  termPlatformLabel,
  ratioText, firstSeenCell } from './terms-view'

const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')

export function termsUrls(slug?: string) {
  const base = `${SITE.url}/trending`
  return {
    ledger: `${base}/`,
    hub: `${base}/topics/`,
    hubJson: `${base}/topics.json`,
    markdown: `${base}/topics/latest.md`,
    termPage: (s: string) => `${base}/topics/${s}/`,
    termJson: (s: string) => `${base}/topics/${s}.json`,
    /** the page and JSON of the term this call was made for, when one was named */
    page: slug ? `${base}/topics/${slug}/` : `${base}/topics/`,
    json: slug ? `${base}/topics/${slug}.json` : `${base}/topics.json`,
    method: `${SITE.url}/werke/trending/`,
    llms: `${SITE.url}/llms.txt`,
  }
}

export function renderTermsMarkdown(file: TrendingTermsDay): string {
  const u = termsUrls()
  const order = searchedPlatforms(file)
  const answered = file.sources.filter((s) => s.status === 'ok').length
  const out: string[] = []

  out.push(`# Trends in the making — ${fmtDateLong(file.date)}`)
  out.push('')
  out.push(
    `The slower half of Common Ground: terms watched every day across ${joinWithAnd(order.map(termPlatformLabel))}, ` +
      `counted over one day, seven days and thirty. Generated ${file.generated_at} (${fmtTimeUtc(file.generated_at)} UTC), ` +
      `${answered} of ${file.sources.length} platforms answered, pipeline ${file.pipeline_version}, method v${file.method_version}.`,
  )
  out.push('')
  out.push(`- Canonical: ${u.hub}`)
  out.push(`- JSON: ${u.hubJson} (one term: ${u.termJson('<slug>')})`)
  out.push(`- Markdown: ${u.markdown} · today's spikes: ${u.ledger} · llms.txt: ${u.llms}`)
  out.push(`- Licence: CC0 1.0 for the data; method sheet: ${u.method}`)
  out.push('')

  // What the run changed about its own list this morning, in both directions. Absent from the
  // file until 2026-09-02 and absent from a run that changed nothing — in both cases the
  // section is simply not written, rather than written as a row of nothing.
  const promoted = promotedItems(file)
  const letGo = letGoItems(file)
  if (promoted.length > 0 || letGo.length > 0) {
    out.push('## What came and went today')
    out.push('')
    if (promoted.length > 0) {
      out.push(promotionSentence(file))
      out.push('')
      out.push('| Promoted | Days in a row | Platforms | Pace | Page |')
      out.push('|---|---|---|---|---|')
      for (const p of promoted) {
        out.push(`| ${esc(p.term)} | ${p.days} | ${esc(p.platforms)} | ${p.ratio ?? '—'} | ${u.termPage(p.slug)} |`)
      }
      out.push('')
    }
    if (letGo.length > 0) {
      out.push(letGoSentence(file))
      out.push('')
      out.push('| Let go | Days quiet | Why |')
      out.push('|---|---|---|')
      for (const g of letGo) out.push(`| ${esc(g.term)} | ${g.days} | ${esc(g.note) || '—'} |`)
      out.push('')
    }
  }

  out.push('## Watched terms')
  out.push('')
  if (file.terms.length === 0) {
    out.push('The watchlist is empty: nothing has been seeded by hand and no candidate has cleared the promotion rule yet.')
  } else {
    out.push('Status is a threshold decision over the term\'s own counts, not a judgement: the thresholds are on the method sheet.')
    out.push('')
    out.push('| Term | Status | 7 days | 30 days | On the list since | How | First seen | Platforms | Page |')
    out.push('|---|---|---|---|---|---|---|---|---|')
    for (const t of sortTerms(file.terms)) {
      const platforms = countedPlatforms(t, order).map(termPlatformLabel).join(' · ') || '—'
      const ratio = t.ratio === null ? '' : ` (${ratioText(t.ratio)})`
      const how = originMark(t.origin)
      out.push(
        `| ${esc(t.term)} | ${statusLabel(t.status)}${ratio} | ${t.total.d7} | ${t.total.d30} | ${t.added} | ${how} | ${firstSeenCell(file, t)} | ${esc(platforms)} | ${u.termPage(t.slug)} |`,
      )
    }
    out.push('')
    for (const t of sortTerms(file.terms)) {
      out.push(`### ${t.term}`)
      out.push('')
      out.push(statusSentence(t))
      out.push('')
      out.push(`- Page: ${u.termPage(t.slug)} · JSON: ${u.termJson(t.slug)}`)
      out.push(`- ${esc(originSentence(t))}`)
      if (t.aliases.length) out.push(`- Also counted as: ${t.aliases.map(esc).join(', ')}`)
      if (t.wikipedia_article) out.push(`- Wikipedia: https://en.wikipedia.org/wiki/${encodeURIComponent(t.wikipedia_article)}`)
      if (t.receipts.length) {
        out.push('- Receipts:')
        for (const r of t.receipts.slice(0, 12)) out.push(`  - ${termPlatformLabel(r.platform)}, ${r.date}: [${esc(r.title)}](${r.url})`)
      }
      out.push('')
    }
  }

  out.push('## What the machine noticed')
  out.push('')
  if (file.candidates.length === 0) {
    out.push('The discovery run proposed nothing this time.')
  } else {
    out.push(
      'N-grams the discovery run found moving in the last two weeks that are NOT (yet) on the watchlist, so ' +
        'nothing here is counted above. These are terms on their way in, not proposals waiting for a person. ' +
        PROMOTION_RULE,
    )
    out.push('')
    out.push('| N-gram | Recent documents | Pace | Platforms | Sample |')
    out.push('|---|---|---|---|---|')
    for (const c of candidateItems(file)) {
      const sample = c.sample ? `[${esc(c.sample.title)}](${c.sample.url})` : '—'
      out.push(`| ${esc(c.ngram)} | ${c.docsRecent} | ${c.ratio ?? '—'} | ${esc(c.platforms)} | ${sample} |`)
    }
  }
  out.push('')

  out.push(`## Method (v${file.method_version})`)
  out.push('')
  out.push(`1. Each watched term and each of its aliases is searched as one quoted phrase on ${joinWithAnd(order.map(termPlatformLabel))}, once a day.`)
  out.push('2. Matching documents are deduplicated by URL and counted into three windows ending at the run: one day, seven days, thirty days.')
  out.push('3. The status compares the seven-day count with the three weeks before it, against thresholds committed in the pipeline — no model, no editorial judgement.')
  out.push('4. First seen is the earliest receipt date across this run and every committed terms file; the series on a term page is read out of those files, one point per day.')
  out.push(
    '5. Discovery reads the house\'s own committed day files, plus four live archives for depth, counts n-grams ' +
      `over them and governs its own list with the result. ${GOVERNANCE_RULE}`,
  )
  out.push('')
  out.push('## Cite')
  out.push('')
  out.push(`frankbueltge.de, Common Ground — trends in the making for ${file.date}, ${u.hub} (data CC0 1.0).`)
  out.push('')
  return out.join('\n')
}
