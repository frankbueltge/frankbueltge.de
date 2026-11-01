// src/components/ducking/sound.ts — the desk's audio graph (2026-11-01). Browser only, and it claims nothing.
//
// Every channel loops its own recording for as long as sound is on, heard or not, the way a desk's
// channels keep running with their faders down. Tuning in means arriving in the middle of a sentence.
// The only thing that moves is gain, and the gain comes from the share (toGain in src/lib/ducking/mix.ts).
//
// Two things are added. A small room: a quiet channel sits further away in it than a loud one, which
// is what makes a voice seem to walk towards you as its fader comes up. It is generated here so no
// recording of anybody's room ships with the page. And a filter on the crowd, which closes as a hand
// raises a matter, the way a room blurs when you listen closely to one person. There is no other
// sound: no motor, no noise.

const ROOM_SECONDS = 1.7
/** How much of a channel reaches the room, far away and close up. Dry takes the rest of the power,
 *  so distance changes how a level sounds, and not how large it is. */
const WET_FAR = 0.65
const WET_NEAR = 0.05
const FADE_IN = 0.8
/** Makes up for the headroom the recordings are rendered with. The compressor catches the peaks. */
const MASTER = 1.8
const SMOOTHING = 0.035

interface Strip {
  gain: GainNode
  dry: GainNode
  wet: GainNode
  meter: AnalyserNode
  samples: Float32Array<ArrayBuffer>
}

export interface Loaded {
  buffer: AudioBuffer
  /** seconds into the buffer the loop starts and ends */
  from: number
  to: number
  /** seconds into the reading this channel is at when sound starts */
  at: number
  /** −1 left … 1 right */
  pan: number
  /** heard through the filter that closes as a hand raises a matter */
  muffled?: boolean
}

function room(ctx: AudioContext): AudioBuffer {
  const length = Math.round(ctx.sampleRate * ROOM_SECONDS)
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate)
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel)
    let soft = 0
    for (let i = 0; i < length; i++) {
      // Decaying noise, darkened as it decays: walls take the highs first.
      const t = i / length
      soft += (Math.random() * 2 - 1 - soft) * (0.5 - 0.42 * t)
      data[i] = soft * Math.exp(-5.5 * t)
    }
  }
  return buffer
}

export class Desk {
  private readonly ctx: AudioContext
  private readonly master: GainNode
  private readonly strips: Strip[] = []
  private readonly sources: AudioBufferSourceNode[] = []
  private muffler: BiquadFilterNode | null = null

  /** Must be built inside the click that turned sound on, or a phone keeps it muted. */
  constructor() {
    // On an iPhone the silent switch would mute all of this. Sound was asked for with a button.
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
    if (session) session.type = 'playback'
    const Context = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    this.ctx = new Context({ latencyHint: 'interactive' })
    void this.ctx.resume()
    const squeeze = this.ctx.createDynamicsCompressor()
    squeeze.threshold.value = -12
    squeeze.ratio.value = 3
    squeeze.attack.value = 0.01
    squeeze.release.value = 0.2
    this.master = this.ctx.createGain()
    this.master.gain.value = 0
    this.master.connect(squeeze).connect(this.ctx.destination)
  }

  async decode(url: string): Promise<AudioBuffer> {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`${url}: ${response.status}`)
    return this.ctx.decodeAudioData(await response.arrayBuffer())
  }

  start(channels: readonly Loaded[]): void {
    const hall = this.ctx.createConvolver()
    hall.buffer = room(this.ctx)
    hall.connect(this.master)
    for (const channel of channels) {
      const source = this.ctx.createBufferSource()
      source.buffer = channel.buffer
      source.loop = true
      source.loopStart = channel.from
      source.loopEnd = channel.to

      const gain = this.ctx.createGain()
      gain.gain.value = 0
      const pan = this.ctx.createStereoPanner()
      pan.pan.value = channel.pan
      const dry = this.ctx.createGain()
      const wet = this.ctx.createGain()
      const meter = this.ctx.createAnalyser()
      meter.fftSize = 512
      if (channel.muffled) {
        this.muffler = this.ctx.createBiquadFilter()
        this.muffler.type = 'lowpass'
        this.muffler.Q.value = 0.5
        source.connect(this.muffler).connect(gain)
      } else {
        source.connect(gain)
      }
      gain.connect(pan)
      pan.connect(dry).connect(this.master)
      pan.connect(wet).connect(hall)
      gain.connect(meter)
      source.start(0, channel.at)
      this.sources.push(source)
      this.strips.push({ gain, dry, wet, meter, samples: new Float32Array(meter.fftSize) })
    }
    this.master.gain.setTargetAtTime(MASTER, this.ctx.currentTime, FADE_IN / 3)
  }

  /** One frame of the mix: an amplitude per channel, how near it stands (0 far … 1 close), and where
   *  the crowd's filter is, in Hz. */
  set(gains: readonly number[], near: readonly number[], cutoff: number): void {
    const now = this.ctx.currentTime
    this.muffler?.frequency.setTargetAtTime(cutoff, now, SMOOTHING * 3)
    this.strips.forEach((strip, c) => {
      strip.gain.gain.setTargetAtTime(gains[c]!, now, SMOOTHING)
      const wet = WET_NEAR + (WET_FAR - WET_NEAR) * (1 - near[c]!)
      strip.wet.gain.setTargetAtTime(wet, now, SMOOTHING * 3)
      strip.dry.gain.setTargetAtTime(Math.sqrt(1 - wet * wet), now, SMOOTHING * 3)
    })
  }

  /** The level actually leaving a channel right now, 0 to 1, for its meter. */
  level(c: number): number {
    const strip = this.strips[c]
    if (!strip) return 0
    strip.meter.getFloatTimeDomainData(strip.samples)
    let energy = 0
    for (const v of strip.samples) energy += v * v
    return Math.sqrt(energy / strip.samples.length)
  }

  close(): void {
    for (const source of this.sources) source.stop()
    void this.ctx.close()
  }
}
