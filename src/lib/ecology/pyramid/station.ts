// src/lib/ecology/pyramid/station.ts — one station sheet's contents, assembled from that
// station's own committed record.
//
// Level 1 of the pyramid. Each of the four rooms replaces what used to be six to eight pages, so
// the assembly here has one job: gather exactly what a single condensed sheet shows — the status
// panel, the lede (what this practice has in hand right now), the last few entries of its record,
// and the doors down to Level 2 — and refuse to gather anything the record does not have.
//
// The status panel is the sharpest case. Five rows, and every one of them is a fact somewhere in
// the repository: the last landing comes from the practice's own chronicle or trace, the count
// from the works register, the running work from the practice's own arc, and the constitution's
// version from the mirrored PROTOCOL.md — parsed, never typed, because a hardcoded version number
// is exactly the drift the Aktualitätsregel was written against (on 2026-07-24 /atelier said "v4"
// while the practice ran v5).

import { existsSync } from 'node:fs'
import { PYRAMID } from '@/config/ecology-pyramid-wording'
import { allWorks } from '@/lib/engines/register'
import type { LatestWork } from '@/lib/engines/latest'
import { stationById, type Station, type StationId } from './model'
import { buildLandings, firstClause, type Arc, type Landing } from './landings'
import { ATELIER_LINES, countByLine } from '@/lib/ecology/lines'
import { readN1Facts } from '@/lib/ecology/n1-line'
import type { PulseSnapshot } from '@/lib/pulse/render'

/** The mirrored constitutions, raw. One glob for all four namespaces… */
const PROTOCOLS = import.meta.glob('/src/content/*/PROTOCOL.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

/** …and one for the nightly line's, which lives with the rest of that line's mirror in
 *  src/data/nightly rather than in the content tree (SITE-API.md in the practice's repository
 *  names the path). It is a second CONSTITUTION of the same practice, not a fourth practice —
 *  read exactly like the others so that neither version is ever typed into a config. */
const NIGHTLY_PROTOCOL = import.meta.glob('/src/data/nightly/PROTOCOL.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const protocolFor = (ns: string, protocols: Record<string, string>): string | undefined =>
  ns === 'nightly' ? NIGHTLY_PROTOCOL['/src/data/nightly/PROTOCOL.md'] : protocols[`/src/content/${ns}/PROTOCOL.md`]

export interface Constitution {
  /** the version the mirror's own H1 states */
  version: string
  /** the date the text states it was decided, where it states one */
  adopted: string | null
  /** the practice's own name for its constitution, from that same H1 */
  name: string
}

/**
 * Read a practice's constitution out of its mirror.
 *
 * The three practices do not spell their H1 the same way — "Research Protocol v6 — the work-line
 * protocol, sharpened", "Research Protocol v3 — the counter-measurement protocol", "Studio
 * Protocol v2 — works of force" — and that difference is theirs to keep. So the pattern matches
 * "<anything> Protocol v<N>" rather than any one practice's wording, and the subtitle after the
 * dash is carried through as the practice's own name for its law.
 *
 * Fail-loud: a mirror with no recognisable version is an integration fault, not a reason for a
 * quiet default (the rule src/lib/atelier/protocol-version.ts already sets for the Atelier).
 */
export function readConstitution(ns: string, protocols: Record<string, string> = PROTOCOLS): Constitution {
  const raw = protocolFor(ns, protocols)
  if (!raw) throw new Error(`ecology/pyramid: no mirrored PROTOCOL.md for "${ns}" — mirror missing`)
  const heading = /^#\s+(.*?Protocol v(\d+))\s*(?:[—–-]\s*(.*))?$/m.exec(raw)
  if (!heading) {
    throw new Error(`ecology/pyramid: ${ns}/PROTOCOL.md carries no "… Protocol vN" heading — mirror broken or format changed`)
  }
  return {
    version: `v${heading[2]}`,
    adopted: /(?:Decided and drafted|Adopted)[^.]*?(\d{4}-\d{2}-\d{2})/.exec(raw)?.[1] ?? null,
    name: (heading[3] ?? '').trim() || heading[1],
  }
}

/**
 * A station's door description, split into the headline and the rest.
 *
 * The doors already say what each practice does, in one sentence approved for the hub, and every
 * one of them is built the same way: a claim, an em-dash, then what backs it. The sheet's H1 takes
 * the claim and its sub-line takes the backing — so a station sheet cannot describe its practice
 * differently from the door that leads to it, which is the failure mode this whole rebuild exists
 * to end.
 */
export function splitDoorLine(description: string): { lead: string; rest: string } {
  const at = description.indexOf(' — ')
  if (at < 0) return { lead: description, rest: '' }
  return { lead: description.slice(0, at), rest: description.slice(at + 3) }
}

/** Cut at a word boundary, never mid-word, and mark the cut. */
function shorten(text: string, max: number): string {
  if (text.length <= max) return text
  const soft = text.lastIndexOf(' ', max)
  return `${text.slice(0, soft > 0 ? soft : max)}…`
}

export interface StatusRow {
  key: string
  value: string
  /** the cadence row wears the live accent; everything else is plain ink */
  live?: boolean
}

export interface Door {
  title: string
  sub: string
  href: string
}

export interface LogEntry {
  date: string
  marker: string | null
  line: string
  href?: string
}

export interface StationSheet {
  station: Station
  landing: Landing | null
  arc: Arc | null
  status: StatusRow[]
  /** the newest thing this practice made — the sheet's lede */
  lede: LatestWork | null
  /** what the record says about the lede, verbatim and cut to a teaser */
  ledeTeaser: string | null
  log: LogEntry[]
  doors: Door[]
  /** how many things this practice has on the record, and what it calls them */
  made: { count: number; noun: string }
}

/** The registers each practice keeps, as Level-2 doors. Titles are the practices' own words for
 *  their rooms; the hrefs are the routes those registers already live at.
 *
 *  Exported so a test can ask whether an archived surface is still reachable — see
 *  src/lib/ecology/mounted.test.ts. Nothing else reads it from outside. */
export const DOORS: Record<StationId, Door[]> = {
  atelier: [
    { title: 'works', sub: 'the register — every work, newest first', href: '/atelier/works' },
    { title: 'journal', sub: 'every session, unedited', href: '/atelier/journal' },
    { title: 'constitution', sub: 'the protocol, as mirrored', href: '/atelier/protocol' },
    { title: 'team channel', sub: 'REQUESTS — the one steering channel', href: '/atelier/requests' },
    // The one door here that is not a register: it leads to this practice's OTHER line, which
    // keeps its own room because it keeps its own record and its own constitution. Until now the
    // sheet's only trace of it was a link to whichever work it made last night — a visitor could
    // read this whole page and never learn that the practice runs two lines at once, which is
    // precisely what Frank saw on 2026-08-12. A door, not a station: the pyramid keeps three.
    // No protocol number in this string: the numbers move (v3 may develop, v6 becomes v7), and a
    // door that names one is wrong at the next amendment. The constitutions row above states both,
    // read from the two mirrors.
    { title: 'the nightly line', sub: 'the same practice under its other constitution — its own room', href: '/error-as-method' },
    // The third line's door (Frank, 2026-08-15). Like the nightly line it keeps its own room —
    // more so: its repository is mirrored whole and served as the practice's OWN surface, never
    // a house window, so this door is the only thing the house owns about it. The door's title
    // is the route's name; the status rows above render whatever title the practice currently
    // declares in its window contract.
    { title: 'n-1 — the third line', sub: 'founded 2026-08-15 on this practice’s own paper — its own record, its own surface', href: '/n-1' },
    // The rhizome and the closure index, as the first nightly phase left them. Archived and, until
    // 2026-08-13, unlinked: the pyramid rewrite removed the way in, and the only references left
    // anywhere in the build were a 301 from its old route and the sitemap. A retired instrument may
    // be retired; it may not be unfindable, or the record it holds is a claim nobody can check.
    // The sheet says frozen, and the date says which phase — it is not offered as current.
    { title: 'the cockpit (archived)', sub: 'the first nightly phase’s instrument — rhizome and closure, frozen 2026-07-18', href: '/atelier/archive/cockpit' },
  ],
  field: [
    { title: 'instruments', sub: 'the register — each with its record', href: '/field/instruments' },
    { title: 'journal', sub: 'every session, unedited', href: '/field/journal' },
    { title: 'constitution', sub: 'the protocol, as mirrored', href: '/field/protocol' },
    { title: 'team channel', sub: 'REQUESTS — the one steering channel', href: '/field/requests' },
    // The survey stood on this practice's old entrance and was orphaned when the station sheet
    // replaced it — nothing else on the site links it. It belongs here: a primary-source survey
    // of automated research is this practice's subject, from the outside.
    { title: 'the survey', sub: 'end-to-end AI research automation, mid-2026', href: '/e2e-automation' },
  ],
  studio: [
    { title: 'premieres', sub: 'the register — what reached the stage', href: '/studio/works' },
    { title: 'journal', sub: 'every session, unedited', href: '/studio/journal' },
    { title: 'constitution', sub: 'the protocol, as mirrored', href: '/studio/protocol' },
    { title: 'team channel', sub: 'REQUESTS — the one steering channel', href: '/studio/requests' },
  ],
  middle: [
    { title: 'crossings', sub: 'every recorded encounter, in full', href: '/encounters/register' },
    { title: 'the plenum', sub: 'the guest voice, with a lane and no door', href: '/plenum' },
    { title: 'reception', sub: 'what came back from outside the house', href: '/reception' },
    { title: 'seeds', sub: 'what visitors offered the practices', href: '/seed' },
  ],
}

/**
 * The practice's own window — the n-1 model carried to the three practices (Frank, 2026-08-16):
 * a `window/` directory in the practice's own repository, mirrored byte for byte by its
 * integrate workflow to public/<station>/window/ and served verbatim on this domain. Authored
 * and updated by the practice itself; the house's only act is the mirror.
 *
 * The door exists only where the mirror carries an entry page — a door onto nothing would be
 * the site promising a surface the practice has not built. The check is against the committed
 * mirror at build time, so the door appears with the integrate commit that brings the window
 * and leaves with the one that removes it. The Middle is not a practice and gets none.
 */
export function windowDoor(id: StationId, exists: (path: string) => boolean = existsSync): Door | null {
  if (id === 'middle') return null
  if (!exists(`public/${id}/window/index.html`)) return null
  return {
    title: 'the practice’s own window',
    sub: 'authored and updated by the practice itself, mirrored verbatim — no human in the path',
    href: `/${id}/window/`,
  }
}

/** What each practice calls the things it makes, plural. The Middle records rather than makes. */
const NOUNS: Record<StationId, string> = {
  atelier: 'works',
  field: 'instruments',
  studio: 'premieres',
  middle: 'crossings',
}

export interface StationSheetInput {
  id: StationId
  snapshot: PulseSnapshot
  works?: readonly LatestWork[]
  /** the practice's own record rows, newest last — chronicle entries, trace moves, crossings */
  log: LogEntry[]
  /** how many things this practice has on the record */
  made: number
}

/**
 * One station sheet. The caller supplies the log and the count because the four practices keep
 * four different kinds of record and only the caller knows which one it is reading — everything
 * else is derived here so all four sheets are assembled the same way.
 */
export function buildStationSheet({ id, snapshot, works = allWorks(), log, made }: StationSheetInput): StationSheet {
  const station = stationById(id)
  const K = PYRAMID.station.statusKeys
  const landings = buildLandings({ snapshot, works })
  const own = landings.find((l) => l.station.id === id)!
  const noun = NOUNS[id]

  const lede = id === 'middle' ? null : works.find((w) => w.ns === id) ?? null

  const status: StatusRow[] = [
    {
      key: K.landed,
      value: own.landing ? `${own.landing.date}${own.landing.marker ? ` · ${own.landing.marker}` : ''}` : PYRAMID.station.absent,
    },
    { key: K.cadence, value: own.status, live: true },
    { key: K.made, value: `${made} ${noun}` },
    // A status row is a reading, not a paragraph. Work-line titles run to a dozen words in this
    // house, and the full title is on the lede card three rows below in any case.
    { key: K.arc, value: own.arc ? shorten(own.arc.title, 52) : PYRAMID.station.absent },
  ]

  // A practice that runs more than one LINE says so here, inside its own station — never as a
  // node of its own (canon 2026-08-12: the pyramid keeps three stations). Two rows carry it: what
  // runs, and what governs each strand. A single constitution row on a multi-line practice would
  // be a lie by omission — it would name one law and leave the other lines ungoverned on the page.
  //
  // Each line states itself in its own unit. The two Ulysses-run strands land works in the
  // register, so they are counted from it; n-1 keeps its whole record in its own mirrored
  // repository, so its row states what the mirror states — the practice's current title (its
  // own window declaration; the working title is a placeholder the practice will replace) and
  // its founding date — and its law is the Dowry, which carries no version by design.
  const lines = id === 'atelier' ? ATELIER_LINES : []
  if (lines.length > 1) {
    const counts = countByLine(works)
    const n1 = lines.some((l) => l.id === 'n-1') ? readN1Facts() : null
    status.push({
      key: K.lines,
      value: lines
        .map((l) =>
          l.id === 'n-1'
            ? `${n1!.title} · founded ${n1!.founded} · its own record`
            : `${l.label} · ${counts[l.id]} ${counts[l.id] === 1 ? 'work' : 'works'}`,
        )
        .join('  ·  '),
    })
    status.push({
      key: K.constitutions,
      value: lines
        .map((l) =>
          l.id === 'n-1'
            ? `${n1!.law} (${n1!.title})`
            : `${readConstitution(l.law.ns).version} (${l.label.replace(/^the /, '')})`,
        )
        .join(' · '),
    })
  } else if (id !== 'middle') {
    // The Middle has no constitution of its own — it is the zone the practices meet in, and saying
    // otherwise would make it a fourth practice. Its sheet simply has one row fewer.
    const law = readConstitution(id)
    status.push({ key: K.constitution, value: `${law.version}${law.adopted ? ` · ${law.adopted}` : ''}` })
  }

  const window = windowDoor(id)

  return {
    station,
    landing: own.landing,
    arc: own.arc,
    status,
    lede,
    ledeTeaser: lede ? firstClause(lede.blurb, 320) : null,
    log: log.slice(0, 3),
    doors: window ? [...DOORS[id], window] : DOORS[id],
    made: { count: made, noun },
  }
}
