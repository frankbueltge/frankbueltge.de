// src/components/experiments/ThumbMarkShape.tsx — one mark of an experiment's miniature, as an SVG
// element. Moved out of ExperimentGallery.tsx on 2026-11-02, unchanged, so that the entrance's lab
// carousel (src/components/ops/LabCarousel.tsx) draws a miniature through the very mapping
// /experiments uses rather than a second copy of it.
//
// The marks arrive from src/lib/experiments/thumbnails.ts with geometry and at most one flag ("this
// is the mark today's reading is about"); everything about how they look is a class, inked by the
// stylesheet of the page that shows them.
import * as React from 'react'

import type { ThumbMark } from '@/lib/experiments/thumbnails'

/** One mark of the miniature. Geometry only — every appearance decision is a class. */
export function ThumbMarkShape({ mark }: { mark: ThumbMark }): React.ReactElement | null {
  switch (mark.t) {
    case 'bar':
      return <rect className={mark.on ? 'tm-bar tm-on' : 'tm-bar'} x={mark.x} y={mark.y} width={mark.w} height={mark.h} />
    case 'gap':
      return <rect className="tm-gap" x={mark.x} y={mark.y} width={mark.w} height={mark.h} />
    case 'line':
      return <path className={mark.on ? 'tm-line tm-on' : 'tm-line'} d={mark.d} />
    case 'area':
      return <path className="tm-area" d={mark.d} />
    case 'dot':
      return <circle className={mark.on ? 'tm-dot tm-on' : 'tm-dot'} cx={mark.x} cy={mark.y} r={mark.r} />
    case 'seg':
      return <line className={mark.on ? 'tm-seg tm-on' : 'tm-seg'} x1={mark.x1} y1={mark.y1} x2={mark.x2} y2={mark.y2} />
    case 'rule':
      return <line className="tm-rule" x1={mark.x1} y1={mark.y1} x2={mark.x2} y2={mark.y2} />
    default:
      return null
  }
}
