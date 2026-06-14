/** Spiegel des kanonischen register.json der Parallaxe-Pipeline. */
export type ClaimMark = 'nennt' | 'verschweigt' | 'widerspricht'

export interface ParallaxeClaim {
  aussage: string
  by_lang: Record<string, ClaimMark>
}

export interface ParallaxeTopic {
  en_title: string
  lang_count: number
  protection: string
  langs: string[]
  lemma: Record<string, string>
  name_umstritten: boolean
  claims: ParallaxeClaim[]
  omission_by_lang: Record<string, number>
  mean_omission: number
}

export interface ParallaxeRegister {
  generated_at: string
  rule: {
    source: string[]
    min_langs: number
    cap: number
    model: string
  }
  mean_omission_index: number | null
  topics: ParallaxeTopic[]
}
