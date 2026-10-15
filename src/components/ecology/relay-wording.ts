// src/components/ecology/relay-wording.ts — the Middle's triangle, put into words (2026-10-05).
//
// The frame (RelayTriangleFigure.astro) hands the island plain strings and types no number into
// any of them; this module is that resolution, kept out of the .astro file so the island's test
// renders exactly what the page renders. Every count arrives from the model, every name from the
// wording canon.
import { ECOLOGY_V3 } from '@/config/ecology-v3-wording'
import { MIDDLE_V3 } from '@/config/middle-v3-wording'
import { WINDOWS, kindSummary, type RelayView, type TriangleModel, type WindowId } from '@/lib/ecology/relay-triangle'
import { PRACTICES, type PracticeId } from '@/lib/ecology/v3'

import type { RelayTriangleWording } from './RelayTriangle'

const W = MIDDLE_V3.triangle
const kinds = MIDDLE_V3.legend.kinds

export const practiceName = (p: PracticeId): string => ECOLOGY_V3.practices[p].name

const perPractice = <T>(f: (p: PracticeId) => T) =>
  Object.fromEntries(PRACTICES.map((p) => [p, f(p)])) as Record<PracticeId, T>

export function relayWording(view: RelayView): RelayTriangleWording {
  const perWindow = <T>(f: (m: TriangleModel, w: WindowId) => T) =>
    Object.fromEntries(WINDOWS.map((w) => [w, f(view.windows[w], w)])) as Record<WindowId, T>
  const windows: Record<WindowId, string> = {
    cycle: W.windows.cycle(view.windows.cycle.since),
    v3: W.windows.v3(view.windows.v3.since),
  }
  return {
    figureLabel: W.figureLabel,
    windowGroup: W.windowGroup,
    windows,
    drawn: perWindow((_, w) => W.drawn(windows[w])),
    hint: W.hint,
    kinds,
    practiceName: perPractice(practiceName),
    persona: perPractice((p) => ECOLOGY_V3.practices[p].persona),
    bandLabel: perWindow((m) =>
      Object.fromEntries(
        m.bands.map((b) => [b.id, W.bandLabel(practiceName(b.giver), practiceName(b.taker), kindSummary(b.counts, kinds))]),
      ),
    ),
    bandCounts: perWindow((m) => Object.fromEntries(m.bands.map((b) => [b.id, kindSummary(b.counts, kinds)]))),
    // Before the relay reports, a corner carries its name and nothing else: "built on 0" would
    // be a measurement nobody made.
    nodeLabel: perWindow(
      (m) =>
        Object.fromEntries(
          m.nodes.map((n) => [
            n.practice,
            view.status === 'ok'
              ? W.nodeLabel(
                  practiceName(n.practice),
                  ECOLOGY_V3.practices[n.practice].persona,
                  kindSummary(n.totals.given, kinds),
                  kindSummary(n.totals.received, kinds),
                )
              : W.nodeName(practiceName(n.practice), ECOLOGY_V3.practices[n.practice].persona),
          ]),
        ) as Record<PracticeId, string>,
    ),
    // the shorter truth: the empty directions while they are the fewer, the carrying ones after
    isolation: perWindow((m) => {
      const pair = (p: { giver: PracticeId; taker: PracticeId }) =>
        W.isolation.pair(practiceName(p.giver), practiceName(p.taker))
      const carrying = m.bands.filter((b) => !b.empty)
      if (m.isolation.length === 0) return W.isolation.none
      if (carrying.length === 0) return W.isolation.all
      return m.isolation.length > carrying.length
        ? W.isolation.only(carrying.map(pair))
        : W.isolation.some(m.isolation.map(pair))
    }),
    notReported:
      view.status === 'ok'
        ? null
        : view.status === 'invalid'
          ? { title: W.invalid.title, body: W.invalid.body(view.reason ?? '') }
          : W.notReported,
    card: W.card,
  }
}
