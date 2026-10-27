// @ts-nocheck
// GET /api/reception/record — the public record: every work's totals, every visible note, the hidden
// notes without their text, the daily counts (2026-10-17). Read by /reception and by the nightly
// snapshot (.github/workflows/reception-snapshot.yml). Cached at the edge for a minute.
import { handleRecord } from '../../../src/lib/reception/handlers'
import { cachedGet, deps } from './_deps'

export const onRequestGet = (context) => cachedGet(context, 60, () => handleRecord(context.request, context.env, deps))
