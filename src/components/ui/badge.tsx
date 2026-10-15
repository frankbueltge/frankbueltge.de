// src/components/ui/badge.tsx — shadcn/ui's badge, copied in by hand (visual layer, Phase 1,
// 2026-09-02). The house edits are button.tsx's, unchanged:
//
//   · the registry's `accent` slot is `hover` here — this site's `--color-accent` is INK, and
//     borrowing the name would repaint hover surfaces with it (see button.tsx's header);
//   · no `destructive` variant (status-colour taboo);
//   · `rounded-md` becomes `rounded-sm`: the shadcn radius scale is not bridged (design doc §6);
//   · colours only through the token bridge, never a hex and never a style attribute.
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/ui/cn'

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-sm border px-2 py-0.5 text-xs font-medium transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'text-foreground hover:bg-hover hover:text-hover-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {
  /** render the child element with the badge's classes instead of a <span> */
  asChild?: boolean
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'span'
  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
