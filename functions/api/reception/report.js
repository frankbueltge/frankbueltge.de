// @ts-nocheck
// POST /api/reception/report — one report of a visitor's note; three from different day hashes hide
// it until the architect restores it (2026-10-17). See src/lib/reception/handlers.ts.
import { handleReport } from '../../../src/lib/reception/handlers'
import { deps } from './_deps'

export const onRequestPost = (context) => handleReport(context.request, context.env, deps)
