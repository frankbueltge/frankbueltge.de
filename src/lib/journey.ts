/**
 * Data Journey — 2D-canvas particle engine (framework-agnostic).
 * Particles morph through four formations as scroll progress goes 0 → 1:
 *   scatter (raw data) → grid (structure) → curve (insight) → text "FRANK BÜLTGE".
 * Brand gradient via CSS vars (--rgb-accent / --rgb-cyan), pointer repulsion, additive glow.
 */

type RGB = [number, number, number]

const SEGMENTS = 3
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function readVar(name: string, fallback: RGB): RGB {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim().split(/\s+/).map(Number)
  return v.length === 3 && v.every(Number.isFinite) ? (v as RGB) : fallback
}

export function createDataJourney(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d')!
  let W = 0, H = 0, N = 0
  let px = new Float32Array(0), py = new Float32Array(0), vx = new Float32Array(0), vy = new Float32Array(0)
  let fScatter = new Float32Array(0), fGrid = new Float32Array(0), fCurve = new Float32Array(0), fText = new Float32Array(0)
  let mix = new Float32Array(0)
  let accent: RGB = [124, 92, 252], cyan: RGB = [34, 211, 238], bg: RGB = [8, 9, 13]
  const pointer = { x: 0, y: 0, active: false }

  const rand = (s: number) => { const r = Math.sin(s * 127.1 + 311.7) * 43758.5453; return r - Math.floor(r) }

  function buildScatter() { for (let i = 0; i < N; i++) { fScatter[i * 2] = rand(i + 1) * W; fScatter[i * 2 + 1] = rand(i + 99) * H } }
  function buildGrid() {
    const cols = Math.ceil(Math.sqrt(N * (W / H))), rows = Math.ceil(N / cols)
    const gw = Math.min(W * 0.7, 900), gh = Math.min(H * 0.58, 480), ox = (W - gw) / 2, oy = (H - gh) / 2
    for (let i = 0; i < N; i++) {
      const c = i % cols, r = Math.floor(i / cols)
      fGrid[i * 2] = ox + (cols <= 1 ? gw / 2 : (c / (cols - 1)) * gw)
      fGrid[i * 2 + 1] = oy + (rows <= 1 ? gh / 2 : (r / (rows - 1)) * gh)
    }
  }
  function buildCurve() {
    const cw = Math.min(W * 0.78, 1000), ox = (W - cw) / 2, midY = H * 0.52, amp = Math.min(H * 0.2, 190)
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1)
      const base = Math.sin(t * Math.PI * 2.2) * 0.6 + Math.sin(t * Math.PI * 5.3 + 1) * 0.25
      fCurve[i * 2] = ox + t * cw
      fCurve[i * 2 + 1] = midY - base * amp + (rand(i + 7) - 0.5) * 24
    }
  }
  function buildText() {
    const off = document.createElement('canvas'); off.width = W; off.height = H
    const o = off.getContext('2d')!
    o.fillStyle = '#fff'; o.textAlign = 'center'; o.textBaseline = 'middle'
    const fs = Math.min(W * 0.15, H * 0.26, 190)
    o.font = `700 ${fs}px "Space Grotesk", system-ui, sans-serif`
    o.fillText('FRANK', W / 2, H / 2 - fs * 0.55)
    o.fillText('BÜLTGE', W / 2, H / 2 + fs * 0.55)
    const img = o.getImageData(0, 0, W, H).data
    const stride = Math.max(3, Math.round(fs / 26))
    const pts: number[] = []
    for (let y = 0; y < H; y += stride) for (let x = 0; x < W; x += stride) if (img[(y * W + x) * 4 + 3] > 128) pts.push(x, y)
    const count = pts.length / 2
    if (count === 0) { fText.set(fGrid); return }
    for (let i = 0; i < N; i++) {
      const s = Math.floor((i / N) * count)
      fText[i * 2] = pts[s * 2] + (rand(i + 31) - 0.5) * stride
      fText[i * 2 + 1] = pts[s * 2 + 1] + (rand(i + 53) - 0.5) * stride
    }
  }

  function allocate() {
    const target = Math.round((W * H) / 1700)
    N = Math.max(600, Math.min(target, W < 700 ? 1400 : 2600))
    px = new Float32Array(N); py = new Float32Array(N); vx = new Float32Array(N); vy = new Float32Array(N)
    fScatter = new Float32Array(N * 2); fGrid = new Float32Array(N * 2); fCurve = new Float32Array(N * 2); fText = new Float32Array(N * 2)
    mix = new Float32Array(N); for (let i = 0; i < N; i++) mix[i] = rand(i + 17)
    buildScatter(); buildGrid(); buildCurve(); buildText()
    for (let i = 0; i < N; i++) { px[i] = fScatter[i * 2]; py[i] = fScatter[i * 2 + 1] }
  }

  let tx = 0, ty = 0
  function targetAt(p: number, i: number) {
    const seg = Math.min(SEGMENTS - 1, Math.floor(p * SEGMENTS))
    const local = easeInOut(Math.min(1, p * SEGMENTS - seg))
    let a: Float32Array, b: Float32Array
    if (seg === 0) { a = fScatter; b = fGrid } else if (seg === 1) { a = fGrid; b = fCurve } else { a = fCurve; b = fText }
    tx = lerp(a[i * 2], b[i * 2], local); ty = lerp(a[i * 2 + 1], b[i * 2 + 1], local)
  }

  return {
    resize(w: number, h: number, dpr: number) {
      W = w; H = h
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      allocate()
    },
    readColors() { accent = readVar('--rgb-accent', accent); cyan = readVar('--rgb-cyan', cyan); bg = readVar('--rgb-bg', bg) },
    setPointer(x: number, y: number, active: boolean) { pointer.x = x; pointer.y = y; pointer.active = active },
    render(progress: number, dtMs: number) {
      if (W === 0 || N === 0) return
      const dt = Math.min(dtMs, 50) / 16.67
      const stiffness = lerp(0.045, 0.14, progress), damping = 0.82, drift = lerp(1, 0.04, progress)
      const size = lerp(1.7, 1.25, progress), alpha = lerp(0.5, 0.92, progress)
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      for (let i = 0; i < N; i++) {
        targetAt(progress, i)
        let ax = (tx - px[i]) * stiffness, ay = (ty - py[i]) * stiffness
        if (drift > 0.05) { ax += Math.sin((px[i] + i) * 0.01 + progress * 6) * drift * 0.5; ay += Math.cos((py[i] - i) * 0.01 + progress * 6) * drift * 0.5 }
        if (pointer.active) {
          const dx = px[i] - pointer.x, dy = py[i] - pointer.y, d2 = dx * dx + dy * dy
          if (d2 < 18000 && d2 > 0.01) { const f = (18000 - d2) / 18000, inv = 1 / Math.sqrt(d2); ax += dx * inv * f * 6; ay += dy * inv * f * 6 }
        }
        vx[i] = (vx[i] + ax * dt) * damping; vy[i] = (vy[i] + ay * dt) * damping
        px[i] += vx[i] * dt; py[i] += vy[i] * dt
        const m = mix[i]
        const r = Math.round(lerp(accent[0], cyan[0], m)), g = Math.round(lerp(accent[1], cyan[1], m)), b2 = Math.round(lerp(accent[2], cyan[2], m))
        ctx.fillStyle = `rgba(${r},${g},${b2},${alpha})`
        ctx.fillRect(px[i] - size / 2, py[i] - size / 2, size, size)
      }
      ctx.globalCompositeOperation = 'source-over'
    },
  }
}
