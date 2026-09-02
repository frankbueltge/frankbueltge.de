// src/lib/ui/cn.ts — the one class-name helper the shadcn primitives in src/components/ui use.
//
// clsx joins conditional class lists; tailwind-merge resolves conflicts between Tailwind
// utilities so a consumer's `className` can override a primitive's defaults ("p-4" beats "p-2")
// instead of both being emitted and source order deciding. Behaviour only — no appearance lives
// here (ADR 0010: shared code carries no visual grammar).
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
