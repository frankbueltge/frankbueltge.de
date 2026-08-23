/**
 * The reader — applies Mersch's published criteria (CRITERIA.md) to a digital work.
 *
 *   npx tsx reader.ts <url>                  read one page, write verdicts/<date>-<slug>.md
 *   npx tsx reader.ts <path/to/file.html>    read a local page (file://)
 *   npx tsx reader.ts house                  read every work on /experiments (live site)
 *   npx tsx reader.ts house <id> [<id> …]    read only the named works
 *
 * Inputs per work: first-screen screenshot, full-page screenshot, visible text — and, read last,
 * the house's own description where one exists. Credentials: the active `ant auth` profile or
 * ANTHROPIC_API_KEY. Browser: the Playwright Chromium already in ~/Library/Caches/ms-playwright.
 */
import Anthropic from "@anthropic-ai/sdk";
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const MODEL = "claude-opus-5";
const EFFORT = "xhigh" as const;
const SYSTEM = [
  fs.readFileSync(path.join(here, "PROMPT.md"), "utf8"),
  "\n\n---\n\n# CRITERIA\n\n",
  fs.readFileSync(path.join(here, "CRITERIA.md"), "utf8"),
].join("");

type Work = { id: string; title: string; href: string; description?: string };

async function loadHouse(ids: string[]): Promise<Work[]> {
  const mod = await import(path.join(here, "../../../src/data/werke.ts"));
  const all = (mod.WERKE as any[])
    .filter((w) => w.line || w.id === "on-record")
    .map((w) => ({
      id: w.id,
      title: typeof w.title === "string" ? w.title : w.title.en,
      href: "https://frankbueltge.de" + w.href,
      description: w.description?.en,
    }));
  return ids.length ? all.filter((w) => ids.includes(w.id)) : all;
}

async function capture(url: string, id: string) {
  const shots = path.join(here, "shots");
  fs.mkdirSync(shots, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500);
  const view = path.join(shots, `${id}-view.jpg`);
  const full = path.join(shots, `${id}-full.jpg`);
  await page.screenshot({ path: view, type: "jpeg", quality: 70 });
  await page.screenshot({ path: full, type: "jpeg", quality: 60, fullPage: true });
  const text: string = await page.evaluate(() => (document.querySelector("main") || document.body).innerText);
  const title = await page.title();
  await browser.close();
  return { view, full, text, title };
}

const b64 = (p: string) => fs.readFileSync(p).toString("base64");

async function read(client: Anthropic, work: Work, date: string) {
  const cap = await capture(work.href, work.id);
  const content: Anthropic.Beta.BetaContentBlockParam[] = [
    { type: "text", text: `Work: ${work.title}\nURL: ${work.href}\nDate of reading: ${date}\n\nFirst screen, as a stranger meets it:` },
    { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64(cap.view) } },
    { type: "text", text: "The full page:" },
    { type: "image", source: { type: "base64", media_type: "image/jpeg", data: b64(cap.full) } },
    { type: "text", text: `The page's visible text:\n\n${cap.text.slice(0, 30000)}` },
  ];
  if (work.description) {
    content.push({ type: "text", text: `Read last — the house's own description of this work, as it appears on the /experiments shelf:\n\n${work.description}` });
  }
  content.push({ type: "text", text: "Write the verdict now, in the exact structure required." });

  const res = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 8000,
    output_config: { effort: EFFORT },
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content }],
  });

  if (res.stop_reason === "refusal") {
    throw new Error(`refused: ${res.stop_details?.category ?? "?"} — ${res.stop_details?.explanation ?? ""}`);
  }
  const text = res.content.filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text").map((b) => b.text).join("\n");
  const apparatus = [
    "",
    "---",
    "",
    "## Apparatus",
    `Model \`${res.model}\` · effort ${EFFORT} · ${date} · inputs: first-screen and full-page screenshots at 1280 px, visible text${work.description ? ", the shelf description read last" : ""} · URL ${work.href} · tokens in/out ${res.usage.input_tokens + (res.usage.cache_read_input_tokens ?? 0) + (res.usage.cache_creation_input_tokens ?? 0)}/${res.usage.output_tokens}. The reader applies CRITERIA.md and nothing else; it sees screenshots and text, it does not experience the work — a reading, not an encounter.`,
    "",
  ].join("\n");
  const out = path.join(here, "verdicts", `${date}-${work.id}.md`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, text.trim() + "\n" + apparatus);
  const verdict = /## Verdict: (\w+)/.exec(text)?.[1] ?? "?";
  console.log(`${verdict.padEnd(10)} ${work.id.padEnd(14)} → ${path.relative(process.cwd(), out)}`);
  return verdict;
}

async function main() {
  const [cmd, ...rest] = process.argv.slice(2);
  if (!cmd) {
    console.error("usage: npx tsx reader.ts <url|file|house> [ids…]");
    process.exit(1);
  }
  const date = new Date().toISOString().slice(0, 10);
  const client = new Anthropic();
  let works: Work[];
  if (cmd === "house") {
    works = await loadHouse(rest);
  } else if (fs.existsSync(cmd)) {
    const id = path.basename(cmd).replace(/\.[^.]+$/, "");
    works = [{ id, title: id, href: pathToFileURL(path.resolve(cmd)).href }];
  } else {
    const u = new URL(cmd);
    const id = (u.pathname.replace(/\/+$/, "").split("/").pop() || u.hostname).replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    works = [{ id, title: cmd, href: cmd }];
  }
  const tally: Record<string, number> = {};
  for (const w of works) {
    try {
      const v = await read(client, w, date);
      tally[v] = (tally[v] ?? 0) + 1;
    } catch (e) {
      if (e instanceof Anthropic.RateLimitError) console.error(`rate limited on ${w.id} — retry later`);
      else if (e instanceof Anthropic.APIError) console.error(`API error ${e.status} on ${w.id}: ${e.message}`);
      else console.error(`failed ${w.id}: ${(e as Error).message}`);
    }
  }
  console.log("\n" + Object.entries(tally).map(([k, v]) => `${k} ${v}`).join(" · "));
}

main();
