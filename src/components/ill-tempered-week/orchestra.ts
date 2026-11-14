// src/components/ill-tempered-week/orchestra.ts — the browser performs a piece of the ill-tempered week from its score
// (2026-11-14). No audio file of the piece is played: the notes of a performance (src/lib/ill-tempered-week/
// perform-overlooked.ts, mirrored from the renderer) are started one by one on the Web Audio clock, each a recorded
// note of the VSCO 2 Community Edition read at the exact ratio of its pitch, as the press's sampler reads it.
//
// This file loads, connects and starts; every decision that carries a claim (which recording, how fast, how loud,
// how long, when, and the levels of hall and room) is made in src/lib/ill-tempered-week/perform*.ts and tested there.
// What differs from the pressing, and is said on the page: the recordings are mono, a browser's compressor stands in
// for its limiter, the murmur is not performed. Hall and room are the pressing's own reverb, built again (reverb.ts).
import { firstFrom, firstOrderHighpass, makeupFor, neededRegions, peakFor, pickRegion, rateFor, soundingFor, type InstrumentIndex } from '@/lib/ill-tempered-week/perform'
import { duckAt, PLAY, saidUrl, type Bus, type Performance, type PlayNote } from '@/lib/ill-tempered-week/perform-overlooked'
import { dryGain, reverbResponse, type ReverbSettings } from '@/lib/ill-tempered-week/reverb'

const INSTRUMENTS = '/ill-tempered-week/instruments/'
/** Notes are handed to the audio clock this far ahead; a timer that a hidden tab slows to once a second still keeps up. */
const AHEAD = 2.5
const EVERY = 400
/** Where the record holds no mix (a record before 2026-11-15 without a derived file): the first album's factors. */
const DEFAULT_MIX = { ens: 0.42, voice: 1.28 }

export interface Progress {
  done: number
  total: number
}

interface Slice {
  buffer: AudioBuffer
}

export class Orchestra {
  readonly ctx: AudioContext
  private index: InstrumentIndex | null = null
  /** instrument → region index → the recording, cut to what the notes read */
  private slices = new Map<string, Map<number, Slice>>()
  private said = new Map<number, AudioBuffer>()
  private buses: Record<Bus, GainNode>
  private lanes = new Map<string, GainNode>()
  private panners = new Map<string, StereoPannerNode>()
  private sounding = new Set<AudioScheduledSourceNode>()
  private muted = new Set<string>()
  private timer: ReturnType<typeof setInterval> | undefined
  private nextNote = 0
  private nextClip = 0
  /** the piece's time `from` sounds at the context's time `at` */
  private from = 0
  private at = 0
  private running = false
  private loaded = false
  /** called once when the piece has played to its end */
  onEnd: (() => void) | undefined

  /** `ctx` is made and resumed by the caller inside the visitor's own click: a context made after an await, as this
   *  lazily loaded class is, would stay silent on browsers that ask for a gesture. */
  constructor(private readonly performance: Performance, ctx: AudioContext) {
    this.ctx = ctx
    const mix = performance.mix ?? DEFAULT_MIX
    // a limiter at the end, as the pressing has one: it works only on the loudest moments. A browser's compressor
    // raises everything by a fixed amount; that is taken away before it, so a quiet passage leaves as it came
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = PLAY.limiter.threshold
    limiter.knee.value = 0
    limiter.ratio.value = PLAY.limiter.ratio
    limiter.attack.value = PLAY.limiter.attack
    limiter.release.value = PLAY.limiter.release
    limiter.connect(ctx.destination)
    const out = ctx.createGain()
    out.gain.value = 1 / makeupFor(PLAY.limiter.threshold, PLAY.limiter.ratio)
    out.connect(limiter)
    const ensemble = ctx.createGain()
    ensemble.gain.value = mix.ens
    this.space(ensemble, PLAY.hall, out)
    const aged = ctx.createGain()
    aged.connect(ensemble)
    const voice = ctx.createGain()
    voice.gain.value = mix.voice
    this.space(voice, PLAY.room, out)
    this.buses = { ensemble, aged, voice }
  }

  /** A group's way out, as the press sends it: through a highpass, then direct and through its reverb, which takes
   *  the two channels' sum and gives two channels back. */
  private space(group: GainNode, room: ReverbSettings & { highpass: number; seconds: number }, out: AudioNode): void {
    const ctx = this.ctx
    const { feedforward, feedback } = firstOrderHighpass(room.highpass, ctx.sampleRate)
    const highpass = ctx.createIIRFilter(feedforward, feedback)
    const dry = ctx.createGain()
    dry.gain.value = dryGain(room)
    const sum = ctx.createGain()
    sum.channelCount = 1
    sum.channelCountMode = 'explicit'
    sum.channelInterpretation = 'speakers'
    // the two channels' sum, where a browser's own mix to one channel is their mean
    sum.gain.value = 2
    const reverb = ctx.createConvolver()
    // the answer is the reverb's own, level included; the browser's levelling of a response would change it
    reverb.normalize = false
    const [left, right] = reverbResponse(room, ctx.sampleRate, room.seconds)
    const answer = ctx.createBuffer(2, left.length, ctx.sampleRate)
    answer.copyToChannel(left, 0)
    answer.copyToChannel(right, 1)
    reverb.buffer = answer
    group.connect(highpass)
    highpass.connect(dry).connect(out)
    highpass.connect(sum).connect(reverb).connect(out)
  }

  /** Fetches and decodes what the performance needs: the instruments its notes name and each day's sentence. Keeps
   *  only the stretches of recording the notes read. */
  async load(onProgress: (p: Progress) => void): Promise<void> {
    if (this.loaded) return
    const ctx = this.ctx
    const index = (await (await fetch(`${INSTRUMENTS}index.json`)).json()) as InstrumentIndex
    this.index = index
    const need = neededRegions(this.performance.notes, index)
    const days = [...new Set(this.performance.clips.map((c) => c.day))]
    const total = need.size + days.length
    let done = 0
    onProgress({ done, total })
    const step = (): void => onProgress({ done: ++done, total })
    // everything is fetched at once and decoded one file after another: a decoded instrument is tens of megabytes
    // until it is cut down to what the notes read
    const get = async (url: string): Promise<ArrayBuffer | null> => {
      const answer = await fetch(url)
      return answer.ok ? answer.arrayBuffer() : null
    }
    const files = await Promise.all([
      ...[...need.keys()].map(async (name) => ({ name, day: -1, data: await get(`${INSTRUMENTS}${index.instruments[name]!.file}`) })),
      ...days.map(async (day) => ({ name: '', day, data: await get(saidUrl(this.performance.week, day)) })),
    ])
    for (const { name, day, data } of files) {
      if (data) {
        const whole = await ctx.decodeAudioData(data)
        if (day >= 0) {
          this.said.set(day, whole)
        } else {
          const file = index.instruments[name]!
          const samples = whole.getChannelData(0)
          const start = clickAt(samples, whole.sampleRate) + index.click
          const kept = new Map<number, Slice>()
          for (const [i, seconds] of need.get(name)!) {
            const a = Math.round((start + file.regions[i]!.at) * whole.sampleRate)
            const frames = Math.max(1, Math.min(Math.round(seconds * whole.sampleRate), samples.length - a))
            const buffer = ctx.createBuffer(1, frames, whole.sampleRate)
            buffer.copyToChannel(samples.subarray(a, a + frames), 0)
            kept.set(i, { buffer })
          }
          this.slices.set(name, kept)
        }
      }
      step()
    }
    this.loaded = true
  }

  /** The instruments and sentences that could not be fetched: their notes stay silent. */
  missing(): string[] {
    const out = this.performance.instruments.filter((name) => !this.slices.has(name))
    const days = [...new Set(this.performance.clips.map((c) => c.day))].filter((day) => !this.said.has(day))
    return days.length > 0 ? [...out, 'voice'] : out
  }

  /** Where the performance is in the piece, in seconds. */
  time(): number {
    return this.running ? Math.min(this.performance.end, this.from + (this.ctx.currentTime - this.at)) : this.from
  }

  isPlaying(): boolean {
    return this.running && this.ctx.state === 'running'
  }

  /** Plays from a moment of the piece: whatever sounds then is stopped, and the notes from there on are started. */
  play(from: number): void {
    this.silence()
    const ctx = this.ctx
    void ctx.resume()
    this.from = Math.max(0, Math.min(from, this.performance.end))
    this.at = ctx.currentTime + 0.06
    this.running = true
    // a note that began up to fourteen seconds earlier may still sound (the tutti's chord, a bell): it joins mid-way
    this.nextNote = firstFrom(this.performance.notes, this.from - 14)
    this.nextClip = firstFrom(this.performance.clips, this.from - 30)
    // the older motifs' level from here on
    const duck = this.buses.aged.gain
    duck.cancelScheduledValues(0)
    duck.setValueAtTime(duckAt(this.performance.duck, this.from), this.at)
    for (const point of this.performance.duck) if (point.t > this.from) duck.linearRampToValueAtTime(point.v, this.when(point.t))
    this.pump()
    this.timer = setInterval(() => this.pump(), EVERY)
  }

  /** Holds the performance where it is; resume() goes on from there. */
  pause(): void {
    if (this.running) void this.ctx.suspend()
  }

  resume(): void {
    if (this.running) void this.ctx.resume()
  }

  /** Stops and forgets where it was. */
  stop(): void {
    this.from = this.time()
    this.silence()
  }

  /** The voices to leave out, by the score's lanes. */
  mute(lanes: ReadonlySet<string>): void {
    this.muted = new Set(lanes)
    for (const [key, node] of this.lanes) {
      node.gain.setTargetAtTime(this.muted.has(key.split('|')[0]!) ? 0 : 1, this.ctx.currentTime, 0.015)
    }
  }

  close(): void {
    this.silence()
    void this.ctx.close()
  }

  private when(t: number): number {
    return this.at + (t - this.from)
  }

  private silence(): void {
    clearInterval(this.timer)
    this.timer = undefined
    this.running = false
    for (const source of this.sounding) {
      try {
        source.stop()
      } catch {
        // a source that never started
      }
    }
    this.sounding.clear()
  }

  private lane(lane: string, bus: Bus): GainNode {
    const key = `${lane}|${bus}`
    let node = this.lanes.get(key)
    if (!node) {
      node = this.ctx.createGain()
      node.gain.value = this.muted.has(lane) ? 0 : 1
      node.connect(this.buses[bus])
      this.lanes.set(key, node)
    }
    return node
  }

  private panner(lane: string, bus: Bus, pan: number): StereoPannerNode {
    const key = `${lane}|${bus}|${pan}`
    let node = this.panners.get(key)
    if (!node) {
      node = this.ctx.createStereoPanner()
      node.pan.value = pan
      node.connect(this.lane(lane, bus))
      this.panners.set(key, node)
    }
    return node
  }

  /** Hands the audio clock every note and sentence that begins within the next seconds. */
  private pump(): void {
    if (!this.running) return
    const now = this.time()
    if (now >= this.performance.end) {
      this.from = this.performance.end
      this.silence()
      this.onEnd?.()
      return
    }
    const until = now + AHEAD
    const notes = this.performance.notes
    while (this.nextNote < notes.length && notes[this.nextNote]!.t < until) {
      // a note the audio clock refuses stays silent; it must not hold back the notes after it
      try {
        this.start(notes[this.nextNote++]!)
      } catch (error) {
        console.warn('the ill-tempered week: a note could not be started', error)
      }
    }
    const clips = this.performance.clips
    while (this.nextClip < clips.length && clips[this.nextClip]!.t < until) {
      const clip = clips[this.nextClip++]!
      const buffer = this.said.get(clip.day)
      if (!buffer) continue
      const late = Math.max(0, this.from - clip.t)
      if (late >= buffer.duration) continue
      const source = this.ctx.createBufferSource()
      source.buffer = buffer
      const gain = this.ctx.createGain()
      gain.gain.value = clip.gain
      source.connect(gain).connect(this.lane(clip.lane, 'voice'))
      this.keep(source)
      source.start(this.when(Math.max(clip.t, this.from)), late)
    }
  }

  private start(note: PlayNote): void {
    const index = this.index
    if (!index) return
    const file = index.instruments[note.instrument]
    const slices = this.slices.get(note.instrument)
    if (!file || !slices) return
    const region = pickRegion(file.regions, note.hz, note.velocity, note.key)
    const slice = slices.get(file.regions.indexOf(region))
    if (!slice) return
    const rate = rateFor(region, note.hz)
    const { held, release } = soundingFor(region, note.hz, note.seconds, note.release)
    // the note's own end, or the cut where the ensemble breaks off
    const end = Math.min(note.t + held + release, note.until ?? Infinity)
    const begin = Math.max(note.t, this.from)
    if (end - begin < 0.02 || begin >= note.t + held) return
    const ctx = this.ctx
    const peak = peakFor(region, note.velocity, note.gain)
    const source = ctx.createBufferSource()
    source.buffer = slice.buffer
    source.playbackRate.value = rate
    const gain = ctx.createGain()
    const t0 = this.when(begin)
    const fall = this.when(Math.min(note.t + held, end - 0.005))
    // three milliseconds in (ten for a note joined mid-way), held, then a cosine out over the release
    // (no event may lie inside a curve's span, so the level simply holds from the end of the rise to the fall)
    const out = Math.max(fall, t0 + 0.011)
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(peak, t0 + (begin > note.t ? 0.01 : 0.003))
    gain.gain.setValueCurveAtTime(fadeOf(peak), out, Math.max(0.005, this.when(end) - out))
    source.connect(gain).connect(this.panner(note.lane, note.bus, note.pan))
    this.keep(source)
    source.start(t0, (begin - note.t) * rate)
    source.stop(this.when(end) + 0.02)
  }

  private keep(source: AudioScheduledSourceNode): void {
    this.sounding.add(source)
    source.onended = () => this.sounding.delete(source)
  }
}

/** Where the click at a file's start is, in seconds: the first sample over a third of full scale. */
function clickAt(data: Float32Array, rate: number): number {
  const limit = Math.min(data.length, Math.round(0.6 * rate))
  for (let i = 0; i < limit; i++) if (Math.abs(data[i]!) > 0.3) return i / rate
  return 0.05
}

/** A half cosine from a level down to nothing, for a note's release. */
function fadeOf(peak: number): Float32Array {
  const curve = new Float32Array(16)
  for (let k = 0; k < 16; k++) curve[k] = peak * 0.5 * (1 + Math.cos((Math.PI * k) / 15))
  return curve
}
