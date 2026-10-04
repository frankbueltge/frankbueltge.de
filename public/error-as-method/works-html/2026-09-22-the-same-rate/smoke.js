// smoke.js -- open index.html in a real browser and drive it, because a page this line publishes
// and never runs is a page it has not checked (F-145, Session 91; F-151, Session 94, where the
// figure overflowed at 1100px because the stylesheet sized `svg` and the page embeds an `img`).
//
// No test framework and no driver library: Node 22 has a global WebSocket, so the browser is
// driven over the DevTools protocol directly.
//
//   CHROME=/path/to/headless_shell node smoke.js
//
// Ten checks. The load-bearing ones are 4 to 7: this page's whole point is that a visitor can
// answer a row before seeing either verdict, and that only means anything if the reveal really
// happens in a browser and really carries both verdicts and the reason.

const { spawn } = require("node:child_process");
const path = require("node:path");

const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const PAGE = "file://" + path.join(__dirname, "index.html");
const PORT = 9336;
let fails = 0;

const ok = (label, good, detail = "") => {
  if (!good) fails++;
  console.log(`  ${good ? "PASS" : "FAIL"}  ${label}${detail ? " -- " + detail : ""}`);
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const chrome = spawn(CHROME, ["--headless", "--no-sandbox", "--disable-gpu",
    `--remote-debugging-port=${PORT}`, "--window-size=1100,900", "about:blank"],
    { stdio: "ignore" });
  let targets = null;
  for (let i = 0; i < 50 && !targets; i++) {
    await sleep(200);
    try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json(); }
    catch { /* not up yet */ }
  }
  if (!targets || !targets.length) { console.log("  FAIL  browser did not start"); process.exit(1); }

  const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const pending = new Map();
  const consoleErrors = [];
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === "Runtime.exceptionThrown") consoleErrors.push(JSON.stringify(msg.params));
    if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error")
      consoleErrors.push(JSON.stringify(msg.params.args));
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });
  const send = (method, params = {}) => new Promise((res) => {
    const n = ++id;
    pending.set(n, res);
    ws.send(JSON.stringify({ id: n, method, params }));
  });
  const evaluate = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true });
    if (r.result && r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails));
    return r.result.result.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Page.navigate", { url: PAGE });
  await sleep(900);

  // 1-3: it renders, at three widths, with the figure inside the page rather than pushing it wide.
  for (const [w, h, name] of [[390, 844, "phone"], [1100, 900, "desktop"], [1180, 900, "wide"]]) {
    await send("Emulation.setDeviceMetricsOverride",
      { width: w, height: h, deviceScaleFactor: 1, mobile: w < 500 });
    await sleep(250);
    const overflow = await evaluate("document.documentElement.scrollWidth - window.innerWidth");
    ok(`renders at ${name} width (${w}px) with no sideways scroll`, overflow <= 1,
      `overflow ${overflow}px`);
  }

  // 4: a row is on screen before anything is clicked, and neither verdict is.
  const hiddenFirst = await evaluate(
    `document.getElementById('verdicts').hidden && document.getElementById('para').textContent.length > 40`);
  ok("a row is shown and both verdicts are hidden before the visitor answers", hiddenFirst === true);

  // 5: the obligation sentence is marked inside its paragraph.
  const marked = await evaluate(
    `(function () { var m = document.querySelector('#para mark');
       return m ? m.textContent.length : 0; })()`);
  ok("the obligation sentence is marked inside its paragraph", marked > 10, `${marked} chars`);

  // 6: answering reveals the carrier, this practice's verdict with its reason, and the rule's.
  await evaluate(`document.querySelector('.choices button[data-v="yes"]').click()`);
  await sleep(150);
  const revealed = await evaluate("document.getElementById('verdicts').textContent");
  ok("answering reveals the term the rule picked, the reader's verdict and the rule's",
    /the term the rule picked/.test(revealed) && /reader/.test(revealed) && /rule R3/.test(revealed),
    revealed.slice(0, 70).replace(/\s+/g, " ") + "...");

  // 7: the tally counts the visitor against both, and moving on restores the blind state.
  const tally = await evaluate("document.getElementById('tally').textContent");
  ok("the tally counts the visitor against both reader and rule",
    /after 1 row/.test(tally) && /rule on [01]/.test(tally), tally);
  await evaluate("document.getElementById('next').click()");
  await sleep(150);
  const blindAgain = await evaluate("document.getElementById('verdicts').hidden");
  ok("the next row is blind again", blindAgain === true);

  // 8: the slider is the night's finding as a handle -- more rows, a smaller visible gap.
  const at40 = await evaluate(
    `(function () { var s = document.getElementById('rows'); s.value = 40;
       s.dispatchEvent(new Event('input')); return document.getElementById('price').textContent; })()`);
  const at300 = await evaluate(
    `(function () { var s = document.getElementById('rows'); s.value = 300;
       s.dispatchEvent(new Event('input')); return document.getElementById('price').textContent; })()`);
  const g = (t) => parseFloat((t.match(/([\d.]+) points/) || [0, "999"])[1]);
  ok("the smallest visible gap falls as rows are added", g(at300) < g(at40),
    `40 rows: ${g(at40)} points, 300 rows: ${g(at300)} points`);

  ok("no uncaught errors or console errors", consoleErrors.length === 0,
    consoleErrors.slice(0, 2).join(" | "));

  ws.close();
  chrome.kill();
  console.log(fails ? `\n${fails} failure(s)` : "\nall checks pass");
  process.exit(fails ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
