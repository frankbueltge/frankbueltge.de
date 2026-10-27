// Study 34 page: the public's B / L (r) priced from five stated values, on a log axis beside the
// Atelier's band and the chance each class of warning comes true. Hand owes the precaution where P > r.
(function () {
  const S = window.S34;
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  const CENTRAL = { vsl: 9.1, inj: 0.047, e: 0.5, min: 15, v: 15, whole: false };
  const NAMES = { R: "radar indicated", O: "observed", RC: "radar, considerable", OC: "observed, considerable", CAT: "catastrophic", N: "no tag" };
  const st = { ...CENTRAL, rec: "later" };
  const svg = document.getElementById("price"), out = document.getElementById("pricedet");
  const fmt = (x, d = 2) => x.toFixed(d);
  const money = x => "$" + (x >= 1e6 ? fmt(x / 1e6, 1) + " million" : Math.round(x).toLocaleString("en-US"));

  function r() {
    const ph = st.whole ? S.sum_person_hours_whole : S.sum_people * st.min / 60;
    const B = ph * st.v / S.n_warnings;                                         // burden per warning
    const L = st.e * st.vsl * 1e6 * (S.deaths + st.inj * S.injuries) / (S.P_met[st.rec] * S.n_warnings); // averted loss per met warning
    return { r: B / L, B, L };
  }
  function draw() {
    const { r: rv, B, L } = r();
    svg.innerHTML = "";
    const narrow = svg.parentNode.getBoundingClientRect().width < 600;
    const W = narrow ? 380 : 900, H = narrow ? 300 : 230, x0 = 14, x1 = W - 14, lo = 0.02, hi = 5;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const X = v => x0 + (Math.log(Math.min(hi, Math.max(lo, v))) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)) * (x1 - x0);
    const axisY = H - 34;
    el("rect", { class: "band", x: X(S.band[0]), y: 14, width: X(S.band[1]) - X(S.band[0]), height: axisY - 14 }, svg);
    for (const v of [0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5]) {
      el("line", { class: "grid", x1: X(v), x2: X(v), y1: 14, y2: axisY }, svg);
      el("text", { x: X(v), y: axisY + 16, "text-anchor": "middle" }, svg).textContent = v;
    }
    el("text", { x: X(Math.sqrt(S.band[0] * S.band[1])), y: 10, "text-anchor": "middle" }, svg).textContent = "the Atelier's band";
    // each class's chance of coming true, on the record chosen
    const ks = Object.keys(S.classes).sort((a, b) => S.classes[a][st.rec] - S.classes[b][st.rec]);
    ks.forEach((k, i) => {
      const p = S.classes[k][st.rec], y = 34 + i * ((axisY - 70) / (ks.length - 1));
      const owed = p > rv;
      el("circle", { class: "pt" + (owed ? " above" : ""), cx: X(p), cy: y, r: 5 }, svg);
      const left = X(p) > W * (narrow ? 0.5 : 0.7);
      const t = el("text", { class: "lab", x: X(p) + (left ? -9 : 9), y: y + 4, "text-anchor": left ? "end" : "start" }, svg);
      t.textContent = `${NAMES[k]} ${fmt(p)}`;
    });
    el("line", { class: "w", x1: X(rv), x2: X(rv), y1: 14, y2: axisY }, svg);
    el("text", { class: "lab", x: X(rv) + (X(rv) > W * 0.7 ? -6 : 6), y: axisY - 6, "text-anchor": X(rv) > W * 0.7 ? "end" : "start" }, svg).textContent = `B / L = ${fmt(rv)}`;
    const owed = ks.filter(k => S.classes[k][st.rec] > rv);
    const share = owed.reduce((s, k) => s + S.classes[k].n, 0) / ks.reduce((s, k) => s + S.classes[k].n, 0);
    out.textContent = `Burden per warning ${money(B)}; loss a precaution averts per warning that comes true ${money(L)}. ` +
      `B / L = ${fmt(rv)}. Hand owes the precaution for ${owed.length ? owed.map(k => NAMES[k]).join(", ") : "no class"} ` +
      `(${fmt(100 * share, 1)} % of the Atelier's warnings). ` +
      `By this record, Hand owes a radar-indicated warning while an hour is worth less than $${fmt(S.classes.R[st.rec] * st.v / rv)}. ` +
      (rv > S.band[1] ? "The price lies above the band: radar-indicated warnings are not owed." : rv < S.band[0] ? "The price lies below the band: every radar-indicated warning is owed." : "The price lies inside the band: the verdict on radar-indicated warnings turns on the record.");
    for (const [k, f] of [["vsl", v => `$${fmt(v, 1)} M`], ["inj", v => fmt(v, 3)], ["e", v => fmt(v, 2)], ["min", v => `${v} min`], ["v", v => `$${v}`]])
      document.getElementById("o-" + k).textContent = f(st[k]);
  }
  for (const k of ["vsl", "inj", "e", "min", "v"]) {
    const inp = document.getElementById("s-" + k);
    inp.value = CENTRAL[k];
    inp.addEventListener("input", () => { st[k] = +inp.value; draw(); });
  }
  const wh = document.getElementById("s-whole");
  wh.addEventListener("change", () => { st.whole = wh.checked; document.getElementById("s-min").disabled = wh.checked; draw(); });
  document.querySelectorAll("#seg-rec button").forEach(b => b.addEventListener("click", () => {
    st.rec = b.dataset.v; document.querySelectorAll("#seg-rec button").forEach(x => x.setAttribute("aria-pressed", x === b)); draw();
  }));
  document.getElementById("s-reset").addEventListener("click", () => {
    Object.assign(st, CENTRAL); wh.checked = false; document.getElementById("s-min").disabled = false;
    for (const k of ["vsl", "inj", "e", "min", "v"]) document.getElementById("s-" + k).value = CENTRAL[k];
    draw();
  });
  const tb = document.querySelector("#pred34 tbody");
  const TEXT = {
    P1: "The median warning puts more than 10,000 people under its polygon.",
    P2: "At the central values, B / L < 0.240: owed even for radar indicated.",
    P3: "At the central values, deaths carry more than half of the loss.",
    P4: "Across the stated bounds, B / L spans more than a factor of 10.",
    P5: "The ten costliest warned tornadoes carry more than half the loss; without them B / L > 0.297."};
  for (const [k, t] of Object.entries(TEXT)) {
    const tr = document.createElement("tr"), held = S.predictions[k];
    tr.innerHTML = `<td>${k}</td><td>${t}</td><td class="${held ? "held" : "failed"}">${held ? "held" : "failed"}</td>`;
    tb.appendChild(tr);
  }
  addEventListener("resize", draw);
  draw();
})();
