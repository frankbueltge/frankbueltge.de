// @ts-nocheck
// GET /api/reading/record?round= — every reading of a round, as stored (2026-10-26). Read by the
// nightly snapshot (.github/workflows/reading-snapshot.yml), which commits it as open data. Cached at
// the edge for a minute.
import { handleRecord } from '../../../src/lib/reading/handlers'
import { cachedGet } from '../reception/_deps'

export const onRequestGet = (context) => cachedGet(context, 60, () => handleRecord(context.request, context.env))
