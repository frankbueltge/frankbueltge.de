// @ts-nocheck
// POST /api/reading/submit — one visitor's reading of the current round (2026-10-26).
// The chain and its invariants: src/lib/reading/handlers.ts.
import { handleSubmit } from '../../../src/lib/reading/handlers'
import { deps } from '../reception/_deps'

export const onRequestPost = (context) => handleSubmit(context.request, context.env, deps)
