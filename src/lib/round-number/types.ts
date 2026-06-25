export interface Benford {
  n: number
  observed: number[]
  expected: number[]
  chi2: number
  mad: number
  verdict: 'close' | 'acceptable' | 'marginal' | 'nonconformity'
}

export interface LastDigit {
  n: number
  observed: number[]
  chi2: number
  verdict: 'uniform' | 'heaped'
}

export interface Control {
  method: string
  seed: number
  samples: number
  threshold: number
  false_positive_rate: number
  verdict_on_clean: string
}

export interface Series {
  id: string
  name: string
  institution: string
  synthetic: boolean
  source: { name: string; url: string; license: string; retrieved: string }
  n: number
  benford: Benford
  last_digit: LastDigit
  control: Control
}

export interface RoundNumberData {
  date: string
  generated_at: string
  schema_version: string
  pipeline_version: string
  method_version: string
  pick: string | null
  series: Series[]
}
