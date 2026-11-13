// src/components/comma/sound.ts — Comma's audio graph (2026-11-13). Browser only, and it claims nothing: every time
// and every level it plays was decided in src/lib/comma/, this only puts it on the audio clock.
//
// Six organ tones loop for as long as sound is on, one for each kind of page, each behind two gains: how many tests
// of that kind just ran (the asking), and a short dip when a blockpage cuts it. A suspicion is the same organ
// recording played a syntonic comma lower for a moment, so it beats against its row. A blockpage is a tubular bell
// on the row's tone. Suspicions and bells stand where their country lies, west to the left; the six tones stand in
// the middle. A compressor catches the moments when many sound at once.

import { bellFile, COMMA, GROUPS, LOOP, organFile } from '@/lib/comma/groups'

/** Levels heard together in the sketches of 2026-11-12: a full suspicion about as loud as its row, so they beat. */
const DRONE = 0.3
const SUSPICION = 0.3
const BELL = 0.32
const MASTER = 0.9
const FADE_IN = 1.2

interface Row {
  asking: GainNode
  dip: GainNode
  last: number
}

export class CommaSound {
  readonly ctx: AudioContext
  private readonly master: GainNode
  private readonly organs: AudioBuffer[] = []
  private readonly bells: AudioBuffer[] = []
  private readonly rows: Row[] = []

  /** Must be built inside the click that asked for sound, or a phone keeps it muted. */
  constructor() {
    // On an iPhone the silent switch would mute all of this. Sound was asked for with a button.
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
    if (session) session.type = 'playback'
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Context({ latencyHint: 'playback' })
    void this.ctx.resume()
    const squeeze = this.ctx.createDynamicsCompressor()
    squeeze.threshold.value = -14
    squeeze.ratio.value = 3
    squeeze.attack.value = 0.01
    squeeze.release.value = 0.25
    this.master = this.ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(squeeze).connect(this.ctx.destination)
  }

  private async decode(url: string): Promise<AudioBuffer> {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`${url}: ${response.status}`)
    return this.ctx.decodeAudioData(await response.arrayBuffer())
  }

  async load(): Promise<void> {
    const organs = await Promise.all(GROUPS.map((_, g) => this.decode(organFile(g))))
    const bells = await Promise.all(GROUPS.map((_, g) => this.decode(bellFile(g))))
    this.organs.push(...organs)
    this.bells.push(...bells)
  }

  /** The six tones begin, silent until the asking lifts them. */
  startTones(): void {
    const at = this.ctx.currentTime + 0.05
    this.organs.forEach((buffer) => {
      const source = this.ctx.createBufferSource()
      source.buffer = buffer
      source.loop = true
      source.loopStart = LOOP.from
      source.loopEnd = LOOP.to
      const asking = this.ctx.createGain()
      asking.gain.value = 0
      const dip = this.ctx.createGain()
      dip.gain.value = 1
      source.connect(asking).connect(dip).connect(this.master)
      source.start(at, LOOP.from)
      this.rows.push({ asking, dip, last: 0 })
    })
    this.master.gain.setTargetAtTime(MASTER, at, FADE_IN / 3)
  }

  /** The row's loudness from `at` on: it rises quickly and falls slowly, like a room filling and emptying. */
  asking(group: number, level: number, at: number): void {
    const row = this.rows[group]
    if (!row) return
    row.asking.gain.setTargetAtTime(level * DRONE, at, level > row.last ? 0.4 : 1.5)
    row.last = level
  }

  private placed(node: AudioNode, pan: number): AudioNode {
    const panner = this.ctx.createStereoPanner()
    panner.pan.value = pan
    node.connect(panner).connect(this.master)
    return panner
  }

  /** Suspicion: the row's own recording a syntonic comma lower, `seconds` long, as loud as its weight. */
  suspicion(group: number, at: number, weight: number, seconds: number, pan: number): void {
    const buffer = this.organs[group]
    if (!buffer || weight <= 0) return
    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.playbackRate.value = COMMA
    const gain = this.ctx.createGain()
    const level = SUSPICION * Math.min(1, weight)
    gain.gain.setValueAtTime(0, at)
    gain.gain.linearRampToValueAtTime(level, at + 0.15)
    gain.gain.setValueAtTime(level, Math.max(at + 0.15, at + seconds - 0.45))
    gain.gain.linearRampToValueAtTime(0, at + seconds)
    source.connect(gain)
    this.placed(gain, pan)
    source.start(at, LOOP.from)
    source.stop(at + seconds + 0.05)
  }

  /** Proof: a bell on the row's tone, and the row's tone cut for a moment. */
  blockpage(group: number, at: number, pan: number): void {
    const buffer = this.bells[group]
    const row = this.rows[group]
    if (!buffer || !row) return
    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    const gain = this.ctx.createGain()
    gain.gain.value = BELL
    source.connect(gain)
    this.placed(gain, pan)
    source.start(at)
    const dip = row.dip.gain
    dip.setValueAtTime(1, at)
    dip.linearRampToValueAtTime(0.3, at + 0.3)
    dip.linearRampToValueAtTime(1, at + 0.6)
  }

  close(): void {
    void this.ctx.close()
  }
}
