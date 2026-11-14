// src/lib/ill-tempered-week/pages.ts — which album stands where on the site (2026-11-14), and the links its scores
// carry. Build time only (it reads the committed day files through sources.ts).
//
// The front page (/ill-tempered-week/) plays the newest complete album and, while a week runs, that week's Overlooked
// so far. Every album also has a page of its own (/ill-tempered-week/<week>/), from its first day on: when a week
// completes, the album before it leaves the front page, and its scores stay reachable at its own address.
import type { Album, Overlooked, Turn, Unison, UnisonEvent } from './albums'
import { dayLinks, linkFor } from './sources'

/** The line a score shows before anything plays. */
export const HINT = 'Press play: a line follows the music through the score. Click anywhere in it to jump there; point at a mark to see what it is and where it came from.'

/** An album's own address. */
export const albumPath = (week: string): string => `/ill-tempered-week/${week}/`

export interface OverlookedLinks {
  /** per day: the overlooked headline's link, and each murmured headline's */
  days: { text: string | null; attended: (string | null)[] }[]
}

export interface UnisonLinks {
  days: { said: string | null; overlooked: string | null }[]
}

/** Each headline's link, from the committed day file its record names; none is guessed. */
export function overlookedLinks(piece: Overlooked): OverlookedLinks {
  return {
    days: piece.days.map((d) => {
      const day = dayLinks(d.day)
      return { text: linkFor(day, d.text, d.source), attended: d.attended.map((a) => linkFor(day, a.text)) }
    }),
  }
}

export function unisonLinks(piece: Unison): UnisonLinks {
  return {
    days: piece.days.map((d) => {
      const day = dayLinks(d.day)
      return { said: d.said ? linkFor(day, d.said) : null, overlooked: linkFor(day, d.overlooked) }
    }),
  }
}

/** Every war signal of the week in the order it enters, as the table under Unison lists it. */
export function warSignals(piece: Unison): (UnisonEvent & { day: string; href: string | null })[] {
  return piece.days
    .flatMap((d) => d.events.map((e) => ({ day: d.day, ...e, href: linkFor(dayLinks(d.day), e.text) })))
    .sort((a, b) => a.at_s - b.at_s)
}

/** The link of the headline said in the turn's silent bar, where the week turned and the day file holds it. */
export function turnSaidLink(piece: Turn): string | null {
  const day = piece.days.find((d) => d.turn)
  return day?.said ? linkFor(dayLinks(day.day), day.said) : null
}

export interface FrontPage {
  /** the album played in full: the newest complete one (the growing week, only until one exists) */
  album: Album
  /** the week still growing, shown above the album while it runs */
  growing: Album | null
  /** every other album, newest first */
  earlier: Album[]
}

/** What the front page shows of the albums on file (oldest first, as readAlbums gives them). */
export function frontPage(albums: readonly Album[]): FrontPage {
  const newest = albums.at(-1)!
  const album = albums.filter((a) => a.complete).at(-1) ?? newest
  const growing = newest.complete || newest === album ? null : newest
  return { album, growing, earlier: albums.filter((a) => a !== album && a !== growing).reverse() }
}

export interface AlbumPageProps {
  album: Album
  /** the weeks of the album before and after, where there is one */
  older: string | null
  newer: string | null
}

/** One page per album on file, each knowing its neighbours. */
export function albumPages(albums: readonly Album[]): { params: { week: string }; props: AlbumPageProps }[] {
  return albums.map((album, i) => ({
    params: { week: album.week },
    props: { album, older: albums[i - 1]?.week ?? null, newer: albums[i + 1]?.week ?? null },
  }))
}
