// @ts-nocheck
// GET /api/reading/status — whether the current round takes readings now, and how many it holds
// (2026-10-26). Cached at the edge for half a minute; the page asks once per visit.
import { handleStatus } from '../../../src/lib/reading/handlers'
import { cachedGet, deps } from '../reception/_deps'

export const onRequestGet = (context) => cachedGet(context, 30, () => handleStatus(context.request, context.env, deps))
