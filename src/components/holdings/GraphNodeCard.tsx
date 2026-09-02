// src/components/holdings/GraphNodeCard.tsx — the card a node of the knowledge-graph explorer
// opens (visual layer, Phase 3a, 2026-09-02).
//
// It says what the node is and then lists its RECEIPTS: every edge that touches it, the node at
// the other end, the committed file the edge was read out of, and the words it was read from.
// A graph that cannot show its receipts is not this house's graph — the receipts are the point,
// not an appendix. It carries no geometry and reads no data: everything here is a field of the
// view (src/lib/graph/graph-explorer-model.ts) or a string the frame resolved from the wording
// canon. No hex, no style attribute; the voice arrives as a `gx-v-<voice>` class the stylesheet
// inks.
import * as React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Receipt, ViewNode } from '@/lib/graph/graph-explorer-model'
import type { EdgeKind, NodeKind } from '@/lib/graph/types'

export interface NodeCardWording {
  kindLabel: string
  voiceLabel: string
  dateLabel: string
  degreeLabel: string
  open: string
  close: string
  receipts: string
  receiptsLoading: string
  receiptsFailed: string
  noEdges: string
  quoteCut: string
  out: string
  in: string
  hint: string
}

export type ReceiptsState = { status: 'loading' } | { status: 'failed' } | { status: 'ready'; receipts: Receipt[] }

export interface GraphNodeCardProps {
  node: ViewNode
  receipts: ReceiptsState
  kindName: string
  kindWhat: string
  voiceName: string
  degreeText: string
  edgeKindName: Record<EdgeKind, string>
  kindNames: Record<NodeKind, string>
  wording: NodeCardWording
  onClose(): void
  /** a name in the receipts opens that node */
  onPick(id: string): void
}

const GraphNodeCard = React.forwardRef<HTMLDivElement, GraphNodeCardProps>(function GraphNodeCard(
  { node, receipts, kindName, kindWhat, voiceName, degreeText, edgeKindName, kindNames, wording, onClose, onPick },
  ref,
) {
  return (
    <Card
      ref={ref}
      tabIndex={-1}
      role="group"
      aria-label={node.label}
      className={`gx-card gx-v-${node.voice} outline-none`}
      data-kind={node.kind}
      data-node-card={node.id}
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gx-voice-badge">
            {voiceName}
          </Badge>
          <Badge variant="secondary">{kindName}</Badge>
          {node.date && <span className="font-mono text-xs text-fg-faint">{node.date}</span>}
        </div>
        <CardTitle className="text-base text-fg">{node.label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-fg-muted">{kindWhat}</p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-[11px] text-fg-faint">
          <dt>{wording.kindLabel}</dt>
          <dd className="text-fg-muted">{kindName}</dd>
          <dt>{wording.voiceLabel}</dt>
          <dd className="text-fg-muted">{voiceName}</dd>
          {node.date && (
            <>
              <dt>{wording.dateLabel}</dt>
              <dd className="text-fg-muted">{node.date}</dd>
            </>
          )}
          <dt>{wording.degreeLabel}</dt>
          <dd className="text-fg-muted">{degreeText}</dd>
        </dl>
        <div className="flex flex-wrap items-center gap-3">
          {node.href && (
            <Button asChild size="sm" variant="outline">
              <a href={node.href} rel={node.href.startsWith('http') ? 'noopener nofollow' : undefined}>
                {wording.open}
              </a>
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onClose}>
            {wording.close}
          </Button>
          <span className="font-mono text-[11px] text-fg-faint">{wording.hint}</span>
        </div>

        <section aria-label={wording.receipts}>
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint">{wording.receipts}</p>
          {receipts.status === 'loading' && <p className="mt-2 text-sm text-fg-faint">{wording.receiptsLoading}</p>}
          {receipts.status === 'failed' && <p className="mt-2 text-sm text-fg-faint">{wording.receiptsFailed}</p>}
          {receipts.status === 'ready' && receipts.receipts.length === 0 && (
            <p className="mt-2 text-sm text-fg-faint">{wording.noEdges}</p>
          )}
          {receipts.status === 'ready' && receipts.receipts.length > 0 && (
            <ol className="gx-receipts mt-2">
              {receipts.receipts.map((r) => (
                <li key={r.index} className="gx-receipt" data-edge-kind={r.edge.kind}>
                  <div className="gx-receipt-head">
                    <span className="gx-receipt-kind">
                      {r.direction === 'out' ? wording.out : wording.in} {edgeKindName[r.edge.kind]}
                    </span>
                    <button type="button" className={`gx-receipt-other gx-v-${r.other.voice}`} onClick={() => onPick(r.other.id)}>
                      {r.other.label}
                    </button>
                    <span className="gx-receipt-kind">{kindNames[r.other.kind]}</span>
                  </div>
                  {r.edge.note && <p className="mt-1 text-fg-muted">{r.edge.note}</p>}
                  <p className="gx-receipt-quote">
                    “{r.edge.quote}”{r.edge.cut && <span className="not-italic text-fg-faint"> · {wording.quoteCut}</span>}
                  </p>
                  <code className="gx-receipt-file">{r.edge.file}</code>
                </li>
              ))}
            </ol>
          )}
        </section>
      </CardContent>
    </Card>
  )
})

export default GraphNodeCard
