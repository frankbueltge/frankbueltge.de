/** The Markdown edition of a trending day — for readers that parse text better than HTML
 *  (LLM retrieval, feed readers, terminals). Same file, same numbers as the page. */
import { SITE } from '@/lib/site'
import { classLabel, compact, fmtDateLong, fmtTimeUtc, platformLabel } from './format'
import type { TrendingAudience, TrendingDay } from './types'
import { AUDIENCE_CLASSES } from './types'
import { audienceDimensionRows, audienceMissingDimensions, convergingRows, sourceColumns } from './view'

const esc = (s: string) => s.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')

export function trendingUrls(date: string) {
  const base = `${SITE.url}/trending`
  return {
    page: `${base}/`,
    day: `${base}/${date}/`,
    latestJson: `${base}/latest.json`,
    dayJson: `${base}/${date}.json`,
    index: `${base}/index.json`,
    feed: `${base}/feed.xml`,
    markdown: `${base}/latest.md`,
    llms: `${SITE.url}/llms.txt`,
    method: `${SITE.url}/werke/trending/`,
  }
}

export function renderMarkdown(day: TrendingDay, audience?: TrendingAudience): string {
  const u = trendingUrls(day.date)
  const rows = convergingRows(day)
  const out: string[] = []
  out.push(`# Trending today — ${fmtDateLong(day.date)}`)
  out.push('')
  out.push(`Common Ground, the nightly ledger of what the web is searching, reading and posting about. Generated ${day.generated_at} (${fmtTimeUtc(day.generated_at)} UTC), ${day.summary.sources_ok} of ${day.summary.sources_total} sources answered, pipeline ${day.pipeline_version}, method v${day.method_version}.`)
  out.push('')
  out.push(`- Canonical: ${u.day}`)
  out.push(`- JSON: ${u.dayJson} (latest: ${u.latestJson}, archive index: ${u.index})`)
  out.push(`- RSS: ${u.feed} · Markdown: ${u.markdown} · llms.txt: ${u.llms}`)
  out.push(`- Licence: CC0 1.0 for the data; method sheet: ${u.method}`)
  out.push('')
  out.push('## Converging now')
  out.push('')
  if (rows.length === 0) {
    out.push('No topic surfaced on two or more independent platforms today. The per-source lists below stand on their own.')
  } else {
    out.push('Topics surfacing on two or more independent platforms at once, matched by a disclosed token rule, not by a model.')
    out.push('')
    out.push('| Topic | Platforms | Signals | First seen | Days hot | Links |')
    out.push('|---|---|---|---|---|---|')
    for (const r of rows) {
      const links = r.links.slice(0, 3).map((l) => `[${esc(l.publisher ?? l.title)}](${l.url})`).join(', ')
      const topic = r.url ? `[${esc(r.label)}](${r.url})` : esc(r.label)
      out.push(`| ${topic} | ${esc(r.platformsText)} | ${esc(r.signalsText)} | ${r.firstSeen} | ${r.daysHot} | ${links} |`)
    }
  }
  out.push('')
  out.push('## By source')
  out.push('')
  for (const col of sourceColumns(day, 10)) {
    const state = col.status === 'ok' ? `${col.count} signals` : `${col.status}${col.note ? ` — ${col.note}` : ''}`
    out.push(`### ${col.name} (${state}${col.asOf ? `, as of ${col.asOf}` : ''})`)
    out.push('')
    if (col.signals.length === 0) out.push('_nothing recorded_')
    for (const s of col.signals) {
      const label = s.url ? `[${esc(s.label)}](${s.url})` : esc(s.label)
      out.push(`- ${label}${s.geo ? ` (${s.geo})` : ''} — ${s.magnitudeText}`)
    }
    out.push('')
  }
  out.push('## Who read this yesterday')
  out.push('')
  if (!audience || audience.edge.status !== 'ok') {
    out.push('Audience counter in standby — no analytics token is connected yet; nothing here is estimated.')
  } else {
    out.push(`Edge requests to /trending* on ${audience.day}: ${compact(audience.edge.total)} in total${audience.edge.sample_interval_avg && audience.edge.sample_interval_avg > 1 ? ` (sampled, average interval ${audience.edge.sample_interval_avg})` : ''}.`)
    out.push('')
    for (const c of AUDIENCE_CLASSES) out.push(`- ${classLabel(c)}: ${compact(audience.edge.classes?.[c] ?? 0)}`)
    if (audience.edge.bots.length) {
      out.push('')
      out.push('Named bots: ' + audience.edge.bots.slice(0, 10).map((b) => `${b.name} ${compact(b.requests)}`).join(', '))
    }
    const countries = audienceDimensionRows(audience.edge.countries)
    if (countries.length) {
      out.push('')
      out.push('Countries: ' + countries.map((r) => `${r.name} ${r.requests}`).join(', ') + '.')
    }
    const referers = audienceDimensionRows(audience.edge.referers)
    if (referers.length) {
      out.push('')
      out.push('Referring hosts: ' + referers.map((r) => `${r.name} ${r.requests}`).join(', ') + '.')
    }
    const missing = audienceMissingDimensions(audience)
    if (missing.length) {
      const named = missing.map((k) => (k === 'countries' ? 'countries' : 'referring hosts')).join(' and ')
      out.push('')
      out.push(`Not in this record: ${named} — ${audience.edge.extra_note || 'the file gives no reason'}.`)
    }
    // The browser-beacon half is retired from `trending-audience/2` on (2026-09-03): a
    // client-side beacon cannot see a reader that runs no JavaScript, which is most of the
    // readers this page is built for. The two `/1` days that carry it still report it.
    if (audience.umami?.status === 'ok') out.push(`\nHuman page views (browser beacon, script-executing browsers only): ${compact(audience.umami.pageviews)}.`)
  }
  out.push('')
  out.push('## Method (v1)')
  out.push('')
  out.push(`1. Eight open sources are read every morning at 06:40 UTC: ${day.sources.map((s) => platformLabel(s.id)).join(', ')}.`)
  out.push('2. Labels are normalised to tokens (case, diacritics, stopwords) and matched across sources by a token-overlap rule; clusters become topics.')
  out.push('3. A topic scores by how many independent platforms carry it, then by rank within each source.')
  out.push('4. Every day is committed as JSON and never edited afterwards; first-seen and days-hot come from that archive.')
  out.push('5. No language model writes anything here: every label and count is a source’s own.')
  out.push('')
  out.push('## Cite')
  out.push('')
  out.push(`frankbueltge.de, Common Ground — trending ledger for ${day.date}, ${u.day} (data CC0 1.0).`)
  out.push('')
  return out.join('\n')
}
