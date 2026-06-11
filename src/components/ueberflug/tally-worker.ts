/// <reference lib="webworker" />
import * as satellite from 'satellite.js'
import type { Omm } from '@/lib/ueberflug/types'

/** Spec §3: > 10° Sichtkontakt möglich — inlined to avoid alias resolution in worker build. */
const CONTACT_MIN_RAD = (10 * Math.PI) / 180

interface TallyRequest {
  omms: Omm[]
  observer: { latDeg: number; lonDeg: number; heightKm: number }
  startMs: number // Mitternacht lokal
  endMs: number   // jetzt
}

self.onmessage = (ev: MessageEvent<TallyRequest>) => {
  const { omms, observer, startMs, endMs } = ev.data
  const gd = {
    latitude: satellite.degreesToRadians(observer.latDeg),
    longitude: satellite.degreesToRadians(observer.lonDeg),
    height: observer.heightKm,
  }
  const satrecs = omms
    .map((o) => { try { return satellite.json2satrec(o as never) } catch { return null } })
    .filter((r) => r !== null)
  let contacts = 0
  const stepMs = 30_000
  const above = new Array(satrecs.length).fill(false)
  for (let t = startMs; t <= endMs; t += stepMs) {
    const date = new Date(t)
    const gmst = satellite.gstime(date)
    for (let i = 0; i < satrecs.length; i++) {
      const pv = satellite.propagate(satrecs[i]!, date)
      const pos = pv?.position
      if (!pos || typeof pos === 'boolean') { above[i] = false; continue }
      const look = satellite.ecfToLookAngles(gd, satellite.eciToEcf(pos, gmst))
      const isAbove = look.elevation > CONTACT_MIN_RAD
      if (isAbove && !above[i]) contacts++ // steigende Flanke = neuer Sichtkontakt
      above[i] = isAbove
    }
    if ((t - startMs) % (stepMs * 60) === 0) {
      self.postMessage({ type: 'progress', done: t - startMs, total: endMs - startMs })
    }
  }
  self.postMessage({ type: 'result', contacts })
}
