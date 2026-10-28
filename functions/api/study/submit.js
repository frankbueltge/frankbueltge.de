// @ts-nocheck
// POST /api/study/submit — one reader's answers to a practice's open study (2026-10-27).
// Sent only by the house's consent frame (/study/frame/). The chain: src/lib/study/handlers.ts.
import { handleSubmit } from '../../../src/lib/study/handlers'
import { deps } from '../reception/_deps'

export const onRequestPost = (context) => handleSubmit(context.request, context.env, deps)
