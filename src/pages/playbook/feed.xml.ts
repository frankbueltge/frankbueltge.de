import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { RECORDING } from '@/data/playbook/recording'

// A podcast feed for the found recording (2026-09-20).
//
// Why a feed and not a better web player. Reported from an iPhone: playback stops a few seconds
// after the screen locks. That is not a bug in the page — it is what Safari does with a
// backgrounded tab. The element plays out the buffer it already holds and then stalls, because
// the tab is no longer allowed to fetch. A Media Session makes the lock screen show the right
// name and controls; it does not buy the tab the right to keep downloading.
//
// How everything else does it: Spotify and the broadcasters' apps are NATIVE apps holding a
// background-audio entitlement, and podcasts in general are a FEED that a native app subscribes
// to. So the way to make a 23-minute recording behave like a podcast is to publish it as one.
// In a podcast app it gets background playback, the lock screen, a sleep timer, variable speed
// and a resume position — none of which this site has to build, and all of which it would build
// badly.
//
// Not submitted anywhere. This feed is the artefact; the URL is enough to subscribe by hand in
// Overcast, Pocket Casts, AntennaPod and the rest. Listing it in a directory would be the house
// sending something outward, which is not a thing a session does on its own.
const SITE = 'https://frankbueltge.de'
const PAGE = `${SITE}/playbook/`

export async function GET(context: APIContext) {
  return rss({
    title: RECORDING.title,
    description:
      'A found recording, kept by the lab and checked before serving: two synthetic voices read the existential-risk literature as a manual for finishing the species, address the listener as the species that supplied the blueprints, and answer the strongest argument against their own premise by going after cooperation rather than infrastructure. The page it comes from names the three places it slips.',
    site: context.site ?? SITE,
    xmlns: { itunes: 'http://www.itunes.com/dtds/podcast-1.0.dtd' },
    // Channel-level iTunes data. No <itunes:owner> email: that is required to submit a show to
    // a directory, and nothing here is submitted — an address published for no reason is an
    // address harvested for no reason.
    customData: [
      '<language>en</language>',
      `<itunes:title>${RECORDING.title}</itunes:title>`,
      '<itunes:author>Frank Bültge</itunes:author>',
      '<itunes:type>episodic</itunes:type>',
      '<itunes:explicit>false</itunes:explicit>',
      '<itunes:category text="Technology"/>',
      `<itunes:image href="${SITE}/playbook/cover.png"/>`,
      '<itunes:summary>Two synthetic voices read the existential-risk literature as a manual for finishing the species. Machine-made, and checked before it was served.</itunes:summary>',
    ].join(''),
    items: [
      {
        title: RECORDING.title,
        link: PAGE,
        pubDate: new Date(`${RECORDING.generated}T00:00:00Z`),
        description:
          'Two synthetic voices work from Ord, Bostrom, Kasirzadeh, RAND, MIRI and ALLFED, state the strongest published argument against their own premise, and answer it by observing that the survival plan in the literature is made almost entirely of cooperation. Three slips are named on the page this comes from.',
        // No hand-set guid: @astrojs/rss derives one from `link`, and a second <guid> would make
        // the feed invalid. Swapping the recording therefore means giving the new file its own
        // name, so the enclosure URL changes and apps see a new episode rather than re-serving
        // the old bytes from cache.
        enclosure: {
          url: `${SITE}${RECORDING.src}`,
          length: RECORDING.bytes,
          // The type podcast clients expect for .m4a. The server answers the same bytes as
          // audio/mp4, which is what a browser's <audio> element wants; one container, two
          // names for it, and every client gets the one it reads.
          type: 'audio/x-m4a',
        },
        customData: [
          `<itunes:duration>${RECORDING.duration}</itunes:duration>`,
          '<itunes:explicit>false</itunes:explicit>',
          `<itunes:image href="${SITE}/playbook/cover.png"/>`,
        ].join(''),
      },
    ],
  })
}
