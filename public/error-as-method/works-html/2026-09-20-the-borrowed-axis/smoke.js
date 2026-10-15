// smoke.js -- open index.html in a real browser and drive it, because Session 91 found that
// twelve pages had been published by this line and none had ever been run (F-145).
//
// No test framework and no driver library: Node 22 has a global WebSocket, so the browser is
// driven over the DevTools protocol directly. Point it at a Chromium binary:
//
//   CHROME=/path/to/headless_shell node smoke.js
//
// It checks four things: the page renders at phone width and at desktop width; clicking a
// quadrant reveals that case's note; placing all eight cases with one in the judged-and-unknown
// corner produces the verdict this night argues for; and placing all eight with none there
// produces the opposite verdict, which is the reader's to reach.

const { spawn } = require("node:child_process");
const path = require("node:path");

const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const PAGE = "file://" + path.join(__dirname, "index.html");
const PORT = 9333;
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
  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
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

  for (const [w, h, name] of [[390, 844, "phone"], [1100, 900, "desktop"]]) {
    await send("Emulation.setDeviceMetricsOverride",
      { width: w, height: h, deviceScaleFactor: 1, mobile: w < 500 });
    await sleep(250);
    const overflow = await evaluate("document.documentElement.scrollWidth - window.innerWidth");
    ok(`renders at ${name} width (${w}px) with no sideways scroll`, overflow <= 1, `overflow ${overflow}px`);
  }

  const cases = await evaluate("document.querySelectorAll('li.case').length");
  ok("eight cases on the page", cases === 8, String(cases));

  await evaluate("document.querySelector('li.case button.q[data-q=\"ll\"]').click()");
  const revealed = await evaluate("!document.querySelector('li.case p.mine').hidden");
  ok("a placement reveals that case's note", revealed);

  // all eight placed, one of them in the judged-and-unknown corner
  await evaluate(`Array.from(document.querySelectorAll('li.case')).forEach(function(li,i){
    li.querySelector('button.q[data-q="' + (i === 1 ? 'ul' : 'lr') + '"]').click(); })`);
  let verdict = await evaluate("document.getElementById('verdict').textContent");
  ok("one in the contested corner gives the night's verdict",
    /wrong join/.test(verdict), verdict.slice(0, 60) + "...");

  // all eight placed, none in that corner
  await evaluate(`Array.from(document.querySelectorAll('li.case')).forEach(function(li){
    li.querySelector('button.q[data-q="lr"]').click(); })`);
  verdict = await evaluate("document.getElementById('verdict').textContent");
  ok("none in that corner gives the reader the opposite verdict",
    /survives tonight/.test(verdict), verdict.slice(0, 60) + "...");

  ws.close();
  chrome.kill();
  console.log(fails ? `\n${fails} failure(s)` : "\nall checks pass");
  process.exit(fails ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
