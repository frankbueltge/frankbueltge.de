/** Third Reading — the reader's part (2026-10-26; docs/design/2026-10-26-third-reading.md).
 *
 *  Consent first, then the round's pairs and estimates, drawn at random in this browser, then — only
 *  after the reading is sent or declined — where the reader stands between the other two readings.
 *  The web's counts and the briefing's "urgent but quiet" list are never shown before the last choice:
 *  a reading that saw them first measures the page, not the reader. If the reader opens the page's
 *  three readings during this visit anyway, the reading says so (`primed`), and the open data carries
 *  it. The bot check starts only with the last button, so a reader who keeps the reading sends nothing.
 *
 *  Every number and every sentence that judges an answer comes from src/lib/reading/*; this file
 *  draws, times, sends and words what the libs return. No style attribute anywhere (CSP). */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cryptoRand, drawPairs, drawSome } from '@/lib/reading/draw'
import { SCALES, fmtValue, judge, parseNumber, verdictLine } from '@/lib/reading/estimate'
import { louderTally, ownOrder, quietTally } from '@/lib/reading/position'
import { MAX_MS, type EstimateTuple, type Pick, type VoteTuple } from '@/lib/reading/reading'
import { ESTIMATE_RANGE, type EstimateItem } from '@/lib/reading/round'

export interface IslandRound {
  id: string
  question: string
  consentVersion: string
  pairs: number
  estimatesPer: number
  matters: { id: string; title: string; gist: string }[]
  estimates: EstimateItem[]
}

export interface ReadingIslandProps {
  round: IslandRound
  /** signals per matter, for the reader's result only */
  signals: Record<string, number>
  /** the briefing's "urgent but quiet" matters, best first, for the reader's result only */
  quiet: string[]
  consent: { label: string; text: string }[]
  /** Turnstile's public site key; empty where the build has none */
  siteKey: string
  /** id of the <details> that holds the page's three readings */
  readingsId: string
}

type Stage = 'intro' | 'pairs' | 'estimates' | 'send' | 'done'
type Status = { state: 'unknown' } | { state: 'open'; readings: number } | { state: 'closed'; why: string }
type Sent = { stored: true; readings: number } | { stored: false; why: string }

const elapsed = (since: number): number => Math.min(MAX_MS, Math.max(0, Math.round(performance.now() - since)))

declare global {
  interface Window {
    turnstile?: {
      render(el: HTMLElement, opts: Record<string, unknown>): string
      reset(id?: string): void
    }
  }
}

const CLOSED_WHY: Record<string, string> = {
  store: 'the store behind this page is not connected',
  'bot-check': 'the bot check is not configured',
  'daily-cap': 'today’s readings have reached the daily limit',
}

/** What each refusal of the store means to the reader. */
const REFUSED: Record<string, string> = {
  'once-a-day': 'you have already given a reading in this round today',
  'address-limit': 'this connection has given as many readings today as one place may',
  turnstile: 'the bot check did not pass',
  round: 'a new round opened while you were reading; reload the page to take part in it',
  consent: 'the consent text changed while you were reading; reload the page to take part',
  'too-fast': 'this connection sent too many requests in a short time',
  origin: 'the request did not come from this page',
}

/** A choice made sooner than this after a pair appeared is the second half of a double click. */
const SETTLE_MS = 400

export default function ReadingIsland({ round, signals, quiet, consent, siteKey, readingsId }: ReadingIslandProps) {
  const [stage, setStage] = useState<Stage>('intro')
  const [agreed, setAgreed] = useState(false)
  const [status, setStatus] = useState<Status>({ state: 'unknown' })
  const [pairs, setPairs] = useState<[string, string][]>([])
  const [votes, setVotes] = useState<VoteTuple[]>([])
  const [items, setItems] = useState<EstimateItem[]>([])
  const [answers, setAnswers] = useState<EstimateTuple[]>([])
  const [revealed, setRevealed] = useState<number | null | undefined>(undefined)
  const [text, setText] = useState('')
  const [scale, setScale] = useState(1e6)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState<Sent | null>(null)
  const primed = useRef(false)
  const shownAt = useRef(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const widget = useRef<HTMLDivElement>(null)
  const honeypot = useRef<HTMLInputElement>(null)

  const byId = useMemo(() => new Map(round.matters.map((m) => [m.id, m])), [round.matters])

  // Is the round open? Asked once; a closed round still lets the reader take part, and says so.
  useEffect(() => {
    let live = true
    fetch('/api/reading/status', { headers: { accept: 'application/json' } })
      .then((r) => r.json().catch(() => null))
      .then((s) => {
        if (!live) return
        if (s?.ok && s.open && s.round === round.id) setStatus({ state: 'open', readings: s.readings })
        else setStatus({ state: 'closed', why: CLOSED_WHY[s?.standby ?? s?.detail] ?? 'collection is not open yet' })
      })
      .catch(() => live && setStatus({ state: 'closed', why: 'the page could not reach its store' }))
    return () => {
      live = false
    }
  }, [round.id])

  // Did the reader open the three readings before sending? Watched from the first render to the send.
  useEffect(() => {
    const el = document.getElementById(readingsId) as HTMLDetailsElement | null
    if (!el) return
    const watch = () => {
      if (el.open && !sent) primed.current = true
    }
    watch()
    el.addEventListener('toggle', watch)
    return () => el.removeEventListener('toggle', watch)
  }, [readingsId, sent])

  // A new stage or a new question moves the reader's focus to its heading.
  useEffect(() => {
    if (stage !== 'intro') heading.current?.focus()
    shownAt.current = performance.now()
  }, [stage, votes.length, answers.length, revealed])

  function start() {
    const rand = cryptoRand()
    setPairs(drawPairs(round.matters.map((m) => m.id), round.pairs, rand))
    setItems(drawSome(round.estimates, round.estimatesPer, rand))
    setStage('pairs')
  }

  function choose(pick: Pick) {
    if (performance.now() - shownAt.current < SETTLE_MS) return
    const [a, b] = pairs[votes.length]!
    const next: VoteTuple[] = [...votes, [a, b, pick, elapsed(shownAt.current)]]
    setVotes(next)
    if (next.length === round.pairs) setStage(round.estimatesPer > 0 ? 'estimates' : 'send')
  }

  // While an answer is revealed, the question on screen is the one just answered.
  const index = revealed !== undefined ? answers.length - 1 : answers.length
  const item = items[index] ?? null
  const typed = parseNumber(text)
  const value = item && typed !== null ? (item.kind === 'count' ? typed * scale : typed) : null
  const inRange = item && value !== null ? value >= ESTIMATE_RANGE[item.kind].min && value <= ESTIMATE_RANGE[item.kind].max : false

  function answer(v: number | null) {
    if (!item) return
    setAnswers([...answers, [item.id, v, elapsed(shownAt.current)]])
    setRevealed(v)
  }

  function nextEstimate() {
    setRevealed(undefined)
    setText('')
    setScale(1e6)
    if (answers.length === items.length) setStage('send')
  }

  /** Turnstile, loaded and run only now: until this button, nothing has left the browser. */
  function botCheck(): Promise<string> {
    return new Promise((resolve, reject) => {
      const render = () => {
        if (!widget.current || !window.turnstile) return reject(new Error('no bot check'))
        window.turnstile.render(widget.current, {
          sitekey: siteKey,
          theme: 'auto',
          callback: (t: string) => resolve(t),
          'error-callback': () => reject(new Error('bot check')),
          'expired-callback': () => reject(new Error('bot check expired')),
        })
      }
      if (window.turnstile) return render()
      const s = document.createElement('script')
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      s.async = true
      s.onload = render
      s.onerror = () => reject(new Error('bot check script'))
      document.head.appendChild(s)
    })
  }

  async function send() {
    setSending(true)
    let token = ''
    if (siteKey) {
      try {
        token = await botCheck()
      } catch {
        setSent({ stored: false, why: 'the bot check could not run' })
        setSending(false)
        setStage('done')
        return
      }
    }
    try {
      const res = await fetch('/api/reading/submit', {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({
          round: round.id,
          consent: round.consentVersion,
          primed: primed.current,
          votes,
          estimates: answers,
          turnstileToken: token,
          website: honeypot.current?.value ?? '',
        }),
      })
      const body = await res.json().catch(() => null)
      if (res.ok && body?.status === 'stored') setSent({ stored: true, readings: body.readings })
      else if (body?.reason === 'standby') setSent({ stored: false, why: CLOSED_WHY[body.detail] ?? 'collection is closed right now' })
      else setSent({ stored: false, why: REFUSED[body?.reason] ?? 'the store did not answer' })
    } catch {
      setSent({ stored: false, why: 'the page could not reach its store' })
    } finally {
      setSending(false)
      setStage('done')
    }
  }

  function decline(why: string) {
    setSent({ stored: false, why })
    setStage('done')
  }

  function openReadings() {
    const el = document.getElementById(readingsId) as HTMLDetailsElement | null
    if (!el) return
    el.open = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── render ────────────────────────────────────────────────────────────────────────────────

  if (stage === 'intro') {
    return (
      <div className="rd-card">
        <p className="kicker">Give your reading</p>
        <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">
          {round.pairs} choices between two of the matters, then {round.estimatesPer} estimates. About three minutes. Every choice asks the
          same question: <b className="text-fg">{round.question}</b>
        </p>
        <dl className="rd-consent mt-5">
          {consent.map((c) => (
            <div key={c.label}>
              <dt>{c.label}</dt>
              <dd>{c.text}</dd>
            </div>
          ))}
        </dl>
        <label className="mt-5 flex items-start gap-3 text-sm text-fg">
          <input type="checkbox" className="rd-check" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>I am 16 or older and agree that my reading is kept and published as described above.</span>
        </label>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button onClick={start} disabled={!agreed}>
            Start the reading
          </Button>
          <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-fg-faint" aria-live="polite">
            {status.state === 'open'
              ? `open · ${status.readings} ${status.readings === 1 ? 'reading' : 'readings'} stored so far`
              : status.state === 'closed'
                ? `not stored at the moment: ${status.why}`
                : 'asking whether the round is open …'}
          </span>
        </div>
      </div>
    )
  }

  if (stage === 'pairs') {
    const [a, b] = pairs[votes.length]!
    const left = byId.get(a)!
    const right = byId.get(b)!
    return (
      <div className="rd-card">
        <p className="kicker">
          Choice {votes.length + 1} of {round.pairs}
        </p>
        <h3 ref={heading} tabIndex={-1} className="mt-2 text-lg font-semibold text-fg outline-none">
          {round.question}
        </h3>
        <div className="rd-pair mt-5">
          {[left, right].map((m, side) => (
            <button key={m.id} type="button" className="rd-option" onClick={() => choose(side as 0 | 1)}>
              <span className="rd-option-title">{m.title}</span>
              <span className="rd-option-gist">{m.gist}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="outline" size="sm" onClick={() => choose(2)}>
            Equally urgent
          </Button>
          <Button variant="ghost" size="sm" onClick={() => choose(null)}>
            Can’t say
          </Button>
        </div>
        <progress className="rd-progress mt-6" max={round.pairs} value={votes.length} aria-label="Choices made" />
      </div>
    )
  }

  if (stage === 'estimates' && item) {
    const answered = revealed !== undefined
    return (
      <div className="rd-card">
        <p className="kicker">
          Estimate {index + 1} of {items.length}
        </p>
        <h3 ref={heading} tabIndex={-1} className="mt-2 max-w-2xl text-lg font-semibold leading-snug text-fg outline-none">
          {item.question}
        </h3>
        {!answered ? (
          <form
            className="mt-5 flex flex-wrap items-end gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (inRange) answer(value)
            }}
          >
            <label className="flex flex-col gap-1 text-sm text-fg-muted">
              Your estimate
              <input className="rd-input" inputMode="decimal" autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} aria-describedby="rd-unit" />
            </label>
            {item.kind === 'count' ? (
              <label className="flex flex-col gap-1 text-sm text-fg-muted">
                in
                <select className="rd-input" value={scale} onChange={(e) => setScale(Number(e.target.value))}>
                  {SCALES.map((s) => (
                    <option key={s.factor} value={s.factor}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <span id="rd-unit" className="pb-2 text-sm text-fg-muted">
              {item.unit}
            </span>
            <Button type="submit" disabled={!inRange}>
              Answer
            </Button>
            <Button type="button" variant="ghost" onClick={() => answer(null)}>
              I don’t know
            </Button>
            {text && !inRange ? <p className="w-full text-sm text-fg-muted">That is not a number this question can take.</p> : null}
          </form>
        ) : (
          <div className="mt-5">
            <p className="leading-relaxed text-fg" aria-live="polite">
              {revealed === null ? `The figure is ${item.truth_label}.` : verdictLine(item, revealed!)}
            </p>
            <p className="mt-1 text-sm text-fg-muted">
              Source:{' '}
              <a className="underline decoration-line underline-offset-4 hover:decoration-fg" href={item.source.url} rel="noopener" target="_blank">
                {item.source.label}
              </a>
            </p>
            <Button className="mt-4" onClick={nextEstimate}>
              {answers.length === items.length ? 'Finish' : 'Next estimate'}
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (stage === 'send') {
    return (
      <div className="rd-card">
        <p className="kicker">Your reading is ready</p>
        <h3 ref={heading} tabIndex={-1} className="mt-2 text-lg font-semibold text-fg outline-none">
          Add it to the record?
        </h3>
        {status.state === 'open' ? (
          <>
            <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">
              Nothing has left this browser yet. Sending runs the bot check and adds your choices and estimates to the record, as
              the text above described; afterwards you see where you stand.
            </p>
            <input ref={honeypot} type="text" name="website" className="rd-hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            {siteKey ? <div ref={widget} className="mt-4" /> : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={send} disabled={sending}>
                {sending ? 'Sending …' : 'Add my reading to the record'}
              </Button>
              <Button variant="ghost" onClick={() => decline('you chose not to send it')}>
                Keep it to myself
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-3 max-w-2xl leading-relaxed text-fg-muted">
              {status.state === 'closed' ? `This reading cannot be stored at the moment: ${status.why}.` : 'The page has not heard back from its store.'} Nothing
              has left this browser.
            </p>
            <Button className="mt-4" onClick={() => decline(status.state === 'closed' ? status.why : 'the store did not answer')}>
              See where I stand
            </Button>
          </>
        )}
      </div>
    )
  }

  // done: where the reader stands
  const louder = louderTally(votes, signals)
  const quietSet = new Set(quiet)
  const quietT = quietTally(votes, { matters: round.matters.map((m) => ({ id: m.id, quiet_rank: quietSet.has(m.id) ? 1 : null })) })
  const top = ownOrder(votes)
    .filter((r) => r.chosen > 0)
    .slice(0, 3)
    .map((r) => byId.get(r.id)!.title)
  const lean = louder.of === 0 ? null : louder.went / louder.of
  return (
    <div className="rd-card">
      <p className="kicker">Where you stand</p>
      <h3 ref={heading} tabIndex={-1} className="mt-2 text-lg font-semibold text-fg outline-none">
        {sent?.stored ? `Your reading is stored, one of ${sent.readings} in this round.` : `Your reading was not stored: ${sent?.why ?? 'not sent'}.`}
      </h3>
      {sent?.stored ? (
        <p className="mt-2 max-w-2xl text-sm text-fg-muted">
          It joins the open record once its day is over, in the next full batch of five, without its day.
        </p>
      ) : null}
      <ul className="rd-stand mt-5">
        <li>
          <span className="rd-stand-label">Against the noise</span>
          {louder.of === 0 ? (
            <span>None of your choices set a clearly louder matter against a quieter one.</span>
          ) : (
            <span>
              Of your {louder.of} choices between two matters one of which the web was clearly louder about (twice the signals or more), you gave{' '}
              <b className="text-fg">{louder.went}</b> to the louder one{lean! > 0.65 ? ' — your urgency mostly followed the noise' : lean! < 0.35 ? ' — you mostly chose against the noise' : ' — loudness did not decide it for you'}.
            </span>
          )}
        </li>
        <li>
          <span className="rd-stand-label">Urgent but quiet</span>
          <span>
            The briefing names {quiet.length} matters as urgent and least attended: {quiet.map((id) => byId.get(id)!.title).join('; ')}.{' '}
            {quietT.of === 0 ? 'None of them met a matter off that list in your pairs.' : `Where one of them met a matter off that list, you chose it ${quietT.went} of ${quietT.of} times.`}
          </span>
        </li>
        {top.length ? (
          <li>
            <span className="rd-stand-label">Your most chosen</span>
            <span>{top.join('; ')}.</span>
          </li>
        ) : null}
        {answers.length ? (
          <li>
            <span className="rd-stand-label">Your estimates</span>
            <span>
              {answers.map(([id, v]) => {
                const it = items.find((x) => x.id === id)!
                const d = v === null ? null : judge(it.kind, v, it.truth).direction
                return (
                  <span key={id} className="block">
                    <b className="font-semibold text-fg">{it.label}:</b>{' '}
                    {v === null
                      ? `no guess; the figure is ${it.truth_label}.`
                      : `${fmtValue(it.kind, v)} against ${it.truth_label} (${d === 'close' ? 'close' : d === 'under' ? 'too low' : 'too high'}).`}
                  </span>
                )
              })}
            </span>
          </li>
        ) : null}
      </ul>
      <Button className="mt-6" onClick={openReadings}>
        Now see the three readings
      </Button>
    </div>
  )
}
