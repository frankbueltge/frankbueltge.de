// src/lib/ui/cn.ts — the one class-name helper the shadcn primitives in src/components/ui use.
//
// clsx joins conditional class lists; tailwind-merge resolves conflicts between Tailwind
// utilities so a consumer's `className` can override a primitive's defaults ("p-4" beats "p-2")
// instead of both being emitted and source order deciding. Behaviour only — no appearance lives
// here (ADR 0010: shared code carries no visual grammar).
//
// The type scale is TAUGHT to the merger (re-skin 2c, 2026-09-02). tailwind-merge knows
// Tailwind's own font sizes (text-sm, text-xl …) but not this house's `--text-*` tokens from
// global.css; an unknown `text-…` counts as a colour, so `cn('text-h1 text-fg')` returned
// `text-fg` alone and every head cut through cn() fell back to 16 px — the sheet heads, the
// shelf's quiet links (`text-mono-sm` lost against `text-fg-muted`), the ecology rooms' before
// them. Listing the scale here keeps size and colour in their own groups. src/lib/ui/cn.test.ts
// guards it; a new step in the scale is added in both places.
import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/** the steps of the type scale declared in src/styles/global.css (`--text-<step>`) */
export const TYPE_SCALE_STEPS = ['display', 'h1', 'h2', 'h3', 'body', 'small', 'mono', 'mono-sm', 'mono-xs'] as const

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: [...TYPE_SCALE_STEPS] }],
    },
  },
})

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
