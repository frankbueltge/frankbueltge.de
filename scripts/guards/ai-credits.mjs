#!/usr/bin/env node
// The house rule with no lock on it (team rule, 2026-07-12): AI product credits never appear in
// commits, PR texts or content — "Co-Authored-By" naming a product, a "Generated with ..."
// footer, a session link. CLAUDE.md states it as "niemals" and says it overrides the harness
// default, which is exactly the problem: the harness writes those trailers by default, the rule
// lived only in prose, and nothing in this repository ever checked.
//
// It cost a commit. On 2026-09-28 the nightly teaser routine wrote a product trailer into
// d3e84d1d ("Work teasers — 7 added"); CI was green, teaser-automerge.yml merged it, and the
// forbidden line is in main's history permanently. History is not rewritten here — the commit
// stands and this check exists so the next one does not join it.
//
// Scope: commit messages, not files. The repository legitimately WRITES about AI — the works
// are about it — so a mention is not a credit. What is forbidden has a shape: a trailer line
// that credits a product as a party to the work. Every rule below is anchored to that shape.
//
// Used by the `credits` job in ci.yml. It sits in CI rather than in a workflow of its own
// because teaser-automerge.yml gates on CI alone: a check outside CI would have gone red on
// 2026-09-28 and the merge would still have happened.

/** Products and vendors whose name in a credit line makes it a product credit. */
const VENDOR = /\b(claude|anthropic|copilot|chatgpt|openai|gpt-[0-9]|gemini|codex|cursor|devin|llama|mistral)\b/i

/** Addresses that credit a product rather than a person or a practice persona. */
const VENDOR_ADDRESS = /@(anthropic|openai)\.com\b/i

/** Product links used as footers. */
const PRODUCT_LINK = /\b(claude\.ai\/code|claude\.com\/claude-code|cursor\.com|github\.com\/features\/copilot)/i

const RULES = [
  {
    id: 'credit-trailer',
    // "Co-Authored-By: <product>" and its neighbours. Anchored: prose ABOUT a trailer
    // ("drop the Co-Authored-By line") is not itself a trailer and must stay legal.
    test: (line) => {
      const m = /^\s*(co-authored-by|authored-by|assisted-by|generated-by|signed-off-by)\s*:(.*)$/i.exec(line)
      return Boolean(m) && (VENDOR.test(m[2]) || VENDOR_ADDRESS.test(m[2]))
    },
    why: 'credits an AI product as a party to the commit',
  },
  {
    id: 'session-trailer',
    test: (line) => /^\s*(claude|copilot|chatgpt|gemini|codex|cursor)[-\s]?(session|code)\s*:/i.test(line),
    why: 'links the commit to a product session',
  },
  {
    id: 'generated-with',
    test: (line) => /generated (with|by)\b/i.test(line) && (VENDOR.test(line) || PRODUCT_LINK.test(line)),
    why: 'is a "generated with <product>" footer',
  },
  {
    id: 'product-link',
    test: (line) => PRODUCT_LINK.test(line),
    why: 'carries a product link',
  },
]

/**
 * Findings for one commit message. Pure: no git, no clock, no network.
 * @param {string} message a full commit message (subject and body)
 * @returns {{rule: string, why: string, line: string}[]}
 */
export function findAiCredits(message) {
  const out = []
  for (const line of String(message ?? '').split(/\r?\n/)) {
    if (!line.trim()) continue
    for (const rule of RULES) {
      if (rule.test(line)) {
        out.push({ rule: rule.id, why: rule.why, line: line.trim() })
        break // one finding per line — the line is the thing to remove, not each way of seeing it
      }
    }
  }
  return out
}

/**
 * The report a person reads in a red job: which commit, which line, and what to do.
 * @param {{sha: string, subject: string, findings: ReturnType<findAiCredits>}[]} commits
 */
export function report(commits) {
  const bad = commits.filter((c) => c.findings.length > 0)
  if (bad.length === 0) return 'clean: no AI product credits in the commits under test.'
  const lines = []
  for (const c of bad) {
    lines.push(`FAIL: ${c.sha.slice(0, 8)} ${c.subject}`)
    for (const f of c.findings) lines.push(`        ${f.line}   [${f.rule}] — ${f.why}`)
  }
  lines.push('')
  lines.push(`${bad.length} commit(s) carry an AI product credit. The team rule of 2026-07-12 is`)
  lines.push('absolute and overrides the harness default, which writes these trailers unasked:')
  lines.push('no "Co-Authored-By" naming a product, no "generated with" footer, no session link.')
  lines.push('AI involvement is stated by the site itself (AuthorshipNote), not by git.')
  lines.push('Fix: rewrite the message on this branch (git rebase -i / commit --amend) and push.')
  return lines.join('\n')
}
