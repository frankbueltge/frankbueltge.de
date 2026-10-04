// attractor engine — the same recursive character-Markov collapse mechanism verified in
// works/2026-07-03-generation-loss (order-k char model, train on own output), extended with:
//   (1) a controllable synthetic source generator (tail density set by vocabulary size),
//   (2) a data-mixing variant: keep a proportion pi of the ORIGINAL text in the training
//       corpus at every generation — the "clean data" that Dohmatob et al. (2024) and
//       Gerstgrasser et al. (2024) show arrests collapse. pi = 0 is pure replacement.
// Deterministic: same seed + same text + same pi => same run. The system is the work.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// order-k character model: context (k chars) -> array of following chars (with multiplicity)
export function train(text, k) {
  const model = new Map();
  const padded = text + text.slice(0, k); // torus so every position has a context
  for (let i = 0; i + k < padded.length; i++) {
    const ctx = padded.slice(i, i + k);
    const next = padded[i + k];
    if (!model.has(ctx)) model.set(ctx, []);
    model.get(ctx).push(next);
  }
  return model;
}

export function generate(model, k, len, rnd, startCtx) {
  const contexts = [...model.keys()];
  if (contexts.length === 0) return "";
  let ctx = startCtx && model.has(startCtx) ? startCtx : contexts[Math.floor(rnd() * contexts.length)];
  let out = ctx;
  while (out.length < len) {
    const choices = model.get(ctx);
    if (!choices || choices.length === 0) { ctx = contexts[Math.floor(rnd() * contexts.length)]; continue; }
    out += choices[Math.floor(rnd() * choices.length)];
    ctx = out.slice(-k);
  }
  return out.slice(0, len);
}

// distinct k-grams present = a direct read of how much "tail" the text carries
export function distinctKgrams(text, k) {
  const grams = new Set();
  for (let i = 0; i + k <= text.length; i++) grams.add(text.slice(i, i + k));
  return grams.size;
}

export function distinctWords(text) {
  const words = text.toLowerCase().match(/[a-z']+/g) || [];
  return new Set(words).size;
}

// One recursive run under one of two regimes:
//   mode "replace"    : train only on the previous generation's output (the CLOSED loop;
//                       the original real data is discarded — Shumailov et al.'s setup).
//   mode "accumulate" : train on the ORIGINAL source PLUS every generation produced so far
//                       (the real data is never discarded — Gerstgrasser et al.'s setup).
// The generated sample is always length L, so the two regimes are measured identically.
// Returns per-generation distinct-k-gram counts of the freshly generated sample.
export function collapseSeries(source, { k = 6, seed = 20260704, generations = 12, len = null, mode = "replace" } = {}) {
  const L = len || source.length;
  const rnd = mulberry32(seed);
  let text = source.slice(0, L);
  let corpus = text;                       // the training corpus for the next generation
  const series = [{ gen: 0, kgrams: distinctKgrams(text, k), words: distinctWords(text) }];
  for (let g = 1; g <= generations; g++) {
    const model = train(corpus, k);
    text = generate(model, k, L, rnd, corpus.slice(0, k));
    corpus = mode === "accumulate" ? corpus + text : text;  // keep the past, or discard it
    series.push({ gen: g, kgrams: distinctKgrams(text, k), words: distinctWords(text) });
  }
  return series;
}

// A synthetic source whose tail density is set by vocabulary size: few words repeated
// (small vocab) => light tail; many distinct words (large vocab) => heavy tail. Uniform
// sampling keeps the knob clean and unconfounded.
export function makeSource(vocabSize, seed, L) {
  const rnd = mulberry32(seed);
  const vocab = [];
  for (let i = 0; i < vocabSize; i++) {
    const wl = 3 + Math.floor(rnd() * 6);
    let w = "";
    for (let j = 0; j < wl; j++) w += String.fromCharCode(97 + Math.floor(rnd() * 26));
    vocab.push(w);
  }
  let out = "";
  while (out.length < L) out += vocab[Math.floor(rnd() * vocabSize)] + " ";
  return out.slice(0, L);
}

// Average a metric over several PRNG seeds (robustness to sampling, not to source).
export function meanCollapse(source, opts, seeds) {
  const runs = seeds.map((s) => collapseSeries(source, { ...opts, seed: s }));
  const G = runs[0].length;
  const avg = [];
  for (let g = 0; g < G; g++) {
    const kg = runs.reduce((a, r) => a + r[g].kgrams, 0) / runs.length;
    const wd = runs.reduce((a, r) => a + r[g].words, 0) / runs.length;
    avg.push({ gen: g, kgrams: kg, words: wd });
  }
  return avg;
}
