// @ts-nocheck
// GET|POST /api/reception/moderate — the architect alone: read the hidden notes, restore one, or
// remove an entry (2026-10-17). See src/lib/reception/handlers.ts.
import { handleModerate } from '../../../src/lib/reception/handlers'
import { deps } from './_deps'

export const onRequestGet = (context) => handleModerate(context.request, context.env, deps)
export const onRequestPost = (context) => handleModerate(context.request, context.env, deps)
