import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { getProtokollDays } from '@/lib/protokoll/data'
import { renderDay } from '@/lib/protokoll/render'

export async function GET(context: APIContext) {
  const days = await getProtokollDays()
  return rss({
    title: 'The Protocol — frankbueltge.de',
    description: 'Tägliches Sitzungsprotokoll der Welt. Beschluss: vertagt.',
    site: context.site!,
    items: days.slice(0, 30).map((day) => {
      const r = renderDay(day, 'de')
      return {
        title: r.kopf[0],
        link: `/protokoll/${day.date}/`,
        pubDate: new Date(day.generated_at),
        description: [...r.kopf, ...r.tops.flatMap((t) => [t.heading, ...t.lines, t.closing])].join(' '),
      }
    }),
  })
}
