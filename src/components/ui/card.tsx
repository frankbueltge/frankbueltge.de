// src/components/ui/card.tsx — shadcn/ui's card, copied in by hand (visual layer, Phase 1,
// 2026-09-02). Same three house edits as button.tsx, for the same reasons:
//
//   · no `destructive` anything — the status-colour taboo (.claude/rules/dataviz-figures.md)
//     holds in the frame as well as in the figures;
//   · colours come only from the token bridge in src/styles/global.css (`bg-card`,
//     `text-muted-foreground`), never a hex here and never a style attribute (drift-check rule 3
//     walks .tsx since 2026-09-02);
//   · the registry's `rounded-xl` becomes `rounded-sm`. shadcn's radius scale is deliberately
//     NOT bridged yet (design doc §6: bridging it would silently re-round more than a hundred
//     existing `rounded-*` usages), so a copied primitive uses the radius this house already
//     draws rather than importing a second one through the back door.
import * as React from 'react'

import { cn } from '@/lib/ui/cn'

function Card({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'flex flex-col gap-4 rounded-sm border border-border bg-card py-4 text-card-foreground shadow-sm',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'grid auto-rows-min items-start gap-1.5 px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto]',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('font-semibold leading-snug', className)} {...props} />
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('px-4', className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn('flex items-center px-4', className)} {...props} />
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
