import type { ParallaxeRegister, ParallaxeTopic } from './types'
import register from '@/data/parallaxe/register.json'

// JSON-Import wird von TS strukturell zu eng inferiert (by_lang-Werte als string,
// leere Arrays als never[]) — Cast über unknown ist hier der korrekte Weg.
const reg = register as unknown as ParallaxeRegister

export function getRegister(): ParallaxeRegister {
  return reg
}

/** Themen nach mittlerem Auslassungsindex absteigend — die größte Distanz ist der Befund. */
export function getTopicsSorted(): ParallaxeTopic[] {
  return [...reg.topics].sort((a, b) => b.mean_omission - a.mean_omission)
}
