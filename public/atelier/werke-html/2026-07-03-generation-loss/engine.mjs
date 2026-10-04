// generation-loss engine — a recursive character-level Markov process that trains on its own output.
// Enacts the mechanism of Model Collapse (Shumailov et al. 2024, Nature 631:755-759):
// in a finite generated corpus a k-gram whose probability q <= 1/M is expected to appear < 1 time,
// so the tails of the distribution vanish; over generations the process converges toward repetition.
// Deterministic: same seed + same text => same run. The system is the work, including its collapsed output.

// --- deterministic PRNG (mulberry32) — no Math.random, so the archive is exact ---
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build an order-k character model: map from k-gram context -> array of following chars (with multiplicity).
export function train(text, k) {
  const model = new Map();
  // wrap so every position has a context (torus over the text)
  const padded = text + text.slice(0, k);
  for (let i = 0; i + k < padded.length; i++) {
    const ctx = padded.slice(i, i + k);
    const next = padded[i + k];
    if (!model.has(ctx)) model.set(ctx, []);
    model.get(ctx).push(next);
  }
  return model;
}

// Generate `len` characters from the model, starting from a seed context, using the PRNG.
export function generate(model, k, len, rnd, startCtx) {
  const contexts = [...model.keys()];
  if (contexts.length === 0) return "";
  let ctx = startCtx && model.has(startCtx) ? startCtx : contexts[Math.floor(rnd() * contexts.length)];
  let out = ctx;
  while (out.length < len) {
    const choices = model.get(ctx);
    if (!choices || choices.length === 0) {
      // dead end: jump to a random known context (rare once collapse sets in)
      ctx = contexts[Math.floor(rnd() * contexts.length)];
      continue;
    }
    const c = choices[Math.floor(rnd() * choices.length)];
    out += c;
    ctx = (out.slice(-k));
  }
  return out.slice(0, len);
}

// Metrics that reveal collapse.
export function metrics(text, k) {
  // distinct k-grams present = richness of the "distribution tails"
  const grams = new Set();
  for (let i = 0; i + k <= text.length; i++) grams.add(text.slice(i, i + k));
  // distinct words
  const words = text.toLowerCase().match(/[a-z']+/g) || [];
  const vocab = new Set(words);
  // character entropy (Shannon, base 2)
  const counts = new Map();
  for (const ch of text) counts.set(ch, (counts.get(ch) || 0) + 1);
  let H = 0;
  for (const n of counts.values()) { const p = n / text.length; H -= p * Math.log2(p); }
  // longest immediately-repeated substring run (a crude "delta function" / repetition detector)
  let maxRun = 0;
  for (let period = 1; period <= 40; period++) {
    let run = 0;
    for (let i = period; i < text.length; i++) {
      if (text[i] === text[i - period]) { run++; if (run > maxRun) maxRun = run; }
      else run = 0;
    }
  }
  return {
    distinctKgrams: grams.size,
    distinctWords: vocab.size,
    totalWords: words.length,
    entropy: +H.toFixed(4),
    longestRepeatRun: maxRun,
  };
}

// Run the full recursive loop. Returns an array of generations {gen, text, metrics}.
export function runCollapse(seedText, { k = 6, seed = 20260703, generations = 12, len = null } = {}) {
  const L = len || seedText.length;
  const rnd = mulberry32(seed);
  const out = [];
  let text = seedText;
  out.push({ gen: 0, text, metrics: metrics(text, k) });
  for (let g = 1; g <= generations; g++) {
    const model = train(text, k);
    // start context: the first k chars of the previous generation, to keep runs comparable
    text = generate(model, k, L, rnd, text.slice(0, k));
    out.push({ gen: g, text, metrics: metrics(text, k) });
  }
  return out;
}
