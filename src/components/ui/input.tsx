// src/components/ui/input.tsx — shadcn/ui's input, copied in by hand (re-skin 2d, 2026-09-02).
// The house edits: the classes come from src/lib/ui/field.ts so the Astro forms and this
// primitive cannot drift apart; no `destructive` state (an invalid field takes the ring and a
// sentence, never a warning red); colours only through the token bridge, never a hex, never a
// style attribute.
import * as React from 'react'

import { fieldVariants, type FieldVariants } from '@/lib/ui/field'
import { cn } from '@/lib/ui/cn'

export interface InputProps extends Omit<React.ComponentProps<'input'>, 'size'>, Pick<FieldVariants, 'size'> {}

function Input({ className, type, size, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(fieldVariants({ kind: 'input', size }), className)}
      {...props}
    />
  )
}

export { Input }
