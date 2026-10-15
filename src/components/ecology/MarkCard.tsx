// src/components/ecology/MarkCard.tsx — the card a mark of the cycle partitur opens
// (visual layer, Phase 1, 2026-09-02).
//
// It says four things and stops: what kind of record this is, on whose lane and on which day it
// stands, the record's own words, and the committed file it was read from. The last one is the
// point — a figure that opens a card and does not name its source is asking to be believed.
//
// It carries no geometry and reads no data: everything it shows is a field of the CycleMark the
// model built (src/lib/ecology/cycle-model.ts) and a string the frame resolved from the wording
// canon. No hex, no style attribute; the identity hue arrives as the `pr-<persona>` class the
// score grammar has used since 2026-07-15, and score-map.css inks it.
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CycleMark, LanePersona, MarkKind } from '@/lib/ecology/cycle-model'

export interface MarkCardWording {
  kindLabel: string
  laneLabel: string
  dateLabel: string
  sourceLabel: string
  open: string
  close: string
  hint: string
}

export interface MarkCardProps {
  mark: CycleMark
  persona: LanePersona
  /** the lane's own name, as the wording canon spells it */
  laneName: string
  /** what this kind of record is, in words */
  kindName: string
  kindWhat: string
  wording: MarkCardWording
  onClose(): void
}

const MarkCard = React.forwardRef<HTMLDivElement, MarkCardProps>(function MarkCard(
  { mark, persona, laneName, kindName, kindWhat, wording, onClose },
  ref,
) {
  return (
    <Card
      ref={ref}
      tabIndex={-1}
      role="group"
      aria-label={mark.title}
      className="score-card mt-4 outline-none"
      data-kind={mark.kind}
      data-lane={mark.lane}
      data-mark={mark.id}
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={`score-card-lane pr-${persona}`}>
            {laneName}
          </Badge>
          <Badge variant="secondary">{kindName}</Badge>
          <span className="font-mono text-xs text-fg-faint">{mark.date}</span>
        </div>
        <CardTitle className="text-base text-fg">{mark.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-fg-muted">{kindWhat}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px] text-fg-faint">
          <dt>{wording.laneLabel}</dt>
          <dd className="text-fg-muted">{laneName}</dd>
          <dt>{wording.kindLabel}</dt>
          <dd className="text-fg-muted">{kindName}</dd>
          <dt>{wording.dateLabel}</dt>
          <dd className="text-fg-muted">{mark.date}</dd>
          <dt>{wording.sourceLabel}</dt>
          <dd className="break-all text-fg-muted">{mark.source}</dd>
        </dl>
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" variant="outline">
            <a href={mark.href}>{wording.open}</a>
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose}>
            {wording.close}
          </Button>
          <span className="font-mono text-[11px] text-fg-faint">{wording.hint}</span>
        </div>
      </CardContent>
    </Card>
  )
})

export default MarkCard
export type { CycleMark, MarkKind }
