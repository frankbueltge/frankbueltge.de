// @ts-nocheck
// GET /api/reception/owner — the architect's device link (?k=…), its sign-out (?logout) and the
// question "does this request carry his cookie?" (no parameter). 2026-10-17; the cookie is described
// in src/lib/reception/crypto.ts. The key is never logged or echoed.
import { handleOwner } from '../../../src/lib/reception/handlers'
import { deps } from './_deps'

export const onRequestGet = (context) => handleOwner(context.request, context.env, deps)
