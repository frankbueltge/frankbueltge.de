// src/components/ui/button.tsx — the first shadcn/ui primitive in this house (visual layer,
// Phase 0, 2026-09-02). Copied in, not installed: shadcn components are owned source, so this
// file may drift from the registry on purpose. Two deliberate edits against the registry:
//
//   · the `accent` slot is renamed `hover`. This site's `--color-accent` is INK (the muted
//     light-grey used by text-accent-soft, border-accent and friends in ~60 places), while
//     shadcn's `accent` is a hover SURFACE. Sharing the name would silently repaint every
//     hover state with ink. The bridge in src/styles/global.css defines --color-hover instead.
//   · no `destructive` variant. The house's status-colour taboo (.claude/rules/dataviz-
//     figures.md) has no warning red anywhere in the frame; a button that needs to say "this
//     cannot be undone" says so in words.
//
// Colours come only from the token bridge (bg-primary, text-primary-foreground, …), never from
// a hex here, and never from a style attribute (drift-check rule 3 now walks .tsx as well).
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/ui/cn'

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-medium outline-none transition-[color,background-color,border-color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-ring [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-border bg-background hover:bg-hover hover:text-hover-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-hover hover:text-hover-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  /** render the child element with the button's classes instead of a <button> (e.g. an <a>) */
  asChild?: boolean
}

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
