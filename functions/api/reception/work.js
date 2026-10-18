// @ts-nocheck
// GET /api/reception/work?id=<practice>:<slug> — one work's ratings and newest notes (2026-10-17).
// The chain and its invariants: src/lib/reception/handlers.ts.
import { handleWork } from '../../../src/lib/reception/handlers'
import { cachedGet, deps } from './_deps'

export const onRequestGet = (context) => cachedGet(context, 30, () => handleWork(context.request, context.env, deps))
