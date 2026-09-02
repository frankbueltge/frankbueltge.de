// src/components/ui/textarea.tsx — shadcn/ui's textarea, copied in by hand (re-skin 2d,
// 2026-09-02). Same house edits as input.tsx: classes from src/lib/ui/field.ts, no destructive
// state, colours only through the token bridge, never a style attribute.
import * as React from 'react'

import { fieldVariants, type FieldVariants } from '@/lib/ui/field'
import { cn } from '@/lib/ui/cn'

export interface TextareaProps extends React.ComponentProps<'textarea'>, Pick<FieldVariants, 'size'> {}

function Textarea({ className, size, ...props }: TextareaProps) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldVariants({ kind: 'textarea', size }), className)}
      {...props}
    />
  )
}

export { Textarea }
