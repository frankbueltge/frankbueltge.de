/** Pure layout for the digit histogram: observed bars vs the Benford expectation,
 *  heights normalised to the largest value so the component can scale freely. */
export interface Bar {
  digit: number
  obs: number // 0..1
  exp: number // 0..1
}

export function bars(observed: number[], expected: number[]): Bar[] {
  const max = Math.max(...observed, ...expected)
  const norm = (v: number) => (max > 0 ? v / max : 0)
  return observed.map((o, i) => ({
    digit: i + 1,
    obs: norm(o),
    exp: norm(expected[i] ?? 0),
  }))
}
