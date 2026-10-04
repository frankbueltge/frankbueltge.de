// smoke.js -- open index.html in a real browser and drive it, because a page this line publishes
// and never runs is a page it has not checked (F-145, Session 91).
//
// No test framework and no driver library: Node 22 has a global WebSocket, so the browser is
// driven over the DevTools protocol directly. Point it at a Chromium binary:
//
//   CHROME=/path/to/headless_shell node smoke.js
//
// Seven checks. The load-bearing ones are 3 to 5: the page's whole argument is that the verdict on
// a falsifier moves when the declared vocabulary moves, and that is only true if it actually moves
// in a browser.

const { spawn } = require("node:child_process");
const path = require("node:path");

const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell";
const PAGE = "file://" + path.join(__dirname, "index.html");
const PORT = 9334;
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
  const pick = async (list) => {
    await evaluate(`document.querySelector('input[name=list][value="${list}"]').click()`);
    await sleep(120);
    return evaluate("document.getElementById('verdict').textContent");
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

  const narrow = await evaluate("document.getElementById('verdict').textContent");
  ok("the default view is the verdict of record: falsified, by the RFCs",
    /FALSIFIED/.test(narrow) && /RFCs/.test(narrow), narrow.slice(0, 74) + "...");

  await pick("base");
  const baseHead = await evaluate("document.querySelector('#verdict b').textContent");
  ok("on the base vocabulary the same row survives",
    /survive/.test(baseHead) && !/FALSIFIED/.test(baseHead), baseHead);

  const wide = await pick("wide");
  ok("on the wide vocabulary it is falsified again",
    /FALSIFIED/.test(wide) && /RFCs/.test(wide), wide.slice(0, 74) + "...");

  await pick("narrow");
  const rows = await evaluate("document.querySelectorAll('#tbl tbody tr').length");
  ok("four corpora in the table, three tested and one calibration", rows === 4, String(rows));

  const flagged = await evaluate(
    `Array.from(document.querySelectorAll('#tbl tbody tr'))
       .filter(function (tr) { return tr.querySelector('td.in'); })
       .map(function (tr) { return tr.children[0].textContent; }).join('|')`);
  ok("exactly one row is flagged as inside the band, and it is the RFCs",
    flagged === "RFCs", flagged || "(none)");

  const firstChip = await evaluate(
    `(function () {
       var ps = Array.from(document.querySelectorAll('#carriers p'));
       var h = ps.find(function (p) { return p.textContent === 'WHATWG standards'; });
       return h.nextElementSibling.querySelector('.chip').textContent.trim();
     })()`);
  ok("the WHATWG carriers the declared list put in reach lead with a markup noun",
    /^attribute/.test(firstChip), firstChip);

  ok("no uncaught errors or console errors", consoleErrors.length === 0,
    consoleErrors.slice(0, 2).join(" | "));

  ws.close();
  chrome.kill();
  console.log(fails ? `\n${fails} failure(s)` : "\nall checks pass");
  process.exit(fails ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
