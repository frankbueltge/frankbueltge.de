// RSS for Common Ground: one item per committed day, the last thirty. The item text is the
// day's converging topics — what more than one independent source carried that morning — so a
// feed reader gets the reading itself, not a teaser that has to be clicked to mean anything.
import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getTrendingDays } from '@/lib/trending/data'
import { feedTitle } from '@/lib/trending/format'
import { convergingRows } from '@/lib/trending/view'

export function GET(context: APIContext) {
  const days = getTrendingDays()
  return rss({
    title: 'Common Ground (trending ledger) — frankbueltge.de',
    description:
      'What the web is searching, reading and posting about — cross-checked across independent sources every morning, kept as open data.',
    site: context.site!,
    items: days.slice(0, 30).map((day) => {
      const rows = convergingRows(day)
      const description = rows.length
        ? rows.map((r) => `${r.label} — ${r.platformsText} (${r.signalsText})`).join(' · ')
        : 'No topic surfaced on two or more independent platforms that morning; the per-source lists stand on their own.'
      return {
        title: feedTitle(day),
        link: `/trending/${day.date}/`,
        pubDate: new Date(day.generated_at),
        description,
      }
    }),
  })
}
