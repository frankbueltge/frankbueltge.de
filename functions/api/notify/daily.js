// @ts-nocheck
// POST /api/notify/daily — the previous day's ratings, readings and study answers, counted, as one mail
// to the operator; GET says whether the bells are armed (2026-11-02). Asked once a day by
// .github/workflows/notify-daily.yml. The chain and why anyone may ask: src/lib/notify/handlers.ts.
import { handleDaily, handleDailyStatus } from '../../../src/lib/notify/handlers'
import { deps } from '../reception/_deps'

export const onRequestPost = (context) => handleDaily(context.request, context.env, deps)
export const onRequestGet = (context) => handleDailyStatus(context.env)
