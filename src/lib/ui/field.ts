// src/lib/ui/field.ts — the one recipe for a form field on this site (re-skin 2d, 2026-09-02).
//
// shadcn's Input and Textarea are React components, and this house's forms are Astro markup
// with plain <input>/<textarea>/<select> elements that the pages' own scripts read by name.
// Rewriting those forms as React would have hydrated a runtime for a text box. So the recipe
// lives here as class strings, the way buttonVariants does for the chrome: the React
// primitives in src/components/ui/{input,textarea}.tsx wear them, and the Astro forms
// (/contact, /seed, /post) wear the same strings — one field, one look, wherever it stands.
//
// Colours only through the token bridge (border-line, bg-panel, ring); the hover lifts the
// hairline the way every panel of the frame does; no status colour (an invalid field says so
// in words next to it, and takes the ring — never a warning red).
import { cva, type VariantProps } from 'class-variance-authority'

export const fieldVariants = cva(
  'flex w-full min-w-0 rounded-sm border border-line bg-panel px-3 text-fg outline-none placeholder:text-fg-faint transition-[color,background-color,border-color,box-shadow] hover:border-line-lift focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-ring',
  {
    variants: {
      kind: {
        input: 'h-9 py-1 text-sm',
        textarea: 'min-h-16 py-2 text-sm leading-relaxed field-sizing-content',
        select: 'h-9 py-1 pr-8 text-sm appearance-none',
      },
      size: {
        default: '',
        sm: 'text-xs',
      },
    },
    defaultVariants: {
      kind: 'input',
      size: 'default',
    },
  },
)

export type FieldVariants = VariantProps<typeof fieldVariants>

/** The small mono label above a field — the kicker's voice at the field's own size. */
export const fieldLabel = 'block font-mono text-mono-sm uppercase tracking-[0.12em] text-fg-muted'
