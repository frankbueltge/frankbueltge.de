// What this guard must get right is a distinction, not a match: this repository writes ABOUT AI
// constantly — the works are about it — and a commit message that discusses a trailer, names a
// model as the material under study, or credits a practice persona is legal. What is forbidden
// is a line that credits a product as a party to the work. These tests pin that line.
import { describe, expect, it } from 'vitest'
import { findAiCredits, report } from './ai-credits.mjs'

const rules = (message: string) => findAiCredits(message).map((f) => f.rule)

describe('it catches the credits the harness writes unasked', () => {
  it('catches the product trailer that reached main on 2026-09-28', () => {
    expect(rules('Work teasers — 7 added\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>')).toEqual([
      'credit-trailer',
    ])
  })

  it('catches a session trailer', () => {
    expect(rules('subject\n\nClaude-Session: https://example.invalid/s/1')).toEqual(['session-trailer'])
  })

  it('catches a "generated with" footer and its product link', () => {
    expect(rules('subject\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)')).toEqual([
      'generated-with',
    ])
  })

  it('catches a bare product link on its own line', () => {
    expect(rules('subject\n\nhttps://claude.ai/code/session_01ABC')).toEqual(['product-link'])
  })

  it('catches a vendor address even where the name is absent', () => {
    expect(rules('subject\n\nCo-authored-by: the assistant <bot@openai.com>')).toEqual(['credit-trailer'])
  })

  it('reports every offending commit, not just the first', () => {
    const commits = [
      { sha: 'aaaaaaaa1', subject: 'one', findings: findAiCredits('one\n\nClaude-Session: x') },
      { sha: 'bbbbbbbb2', subject: 'two', findings: findAiCredits('two') },
      { sha: 'cccccccc3', subject: 'three', findings: findAiCredits('three\n\nCo-Authored-By: Claude <a@anthropic.com>') },
    ]
    const text = report(commits)
    expect(text).toContain('aaaaaaaa')
    expect(text).toContain('cccccccc')
    expect(text).not.toContain('bbbbbbbb')
    expect(text).toContain('2 commit(s)')
  })
})

describe('it leaves legitimate messages alone', () => {
  it('passes a commit that talks about the rule without obeying a trailer shape', () => {
    expect(rules('Drop the Co-Authored-By trailer the harness added\n\nThe rule of 2026-07-12 forbids it.')).toEqual([])
  })

  it('passes prose naming a model as the material under study', () => {
    expect(rules('foreknown: the notary run reads what Claude and Gemini refused, counted per day')).toEqual([])
  })

  it('passes a practice persona co-author, which is not a product', () => {
    expect(rules('discovery: 2026-09-25\n\nCo-authored-by: Machine Attention <attention@machine-attention.invalid>')).toEqual([])
  })

  it('passes a human sign-off', () => {
    expect(rules('subject\n\nSigned-off-by: Frank Bueltge <f.bueltge@gmail.com>')).toEqual([])
  })

  it('says so plainly when nothing is wrong', () => {
    expect(report([{ sha: 'deadbeef', subject: 's', findings: [] }])).toMatch(/^clean:/)
  })

  it('survives an empty or absent message', () => {
    expect(findAiCredits('')).toEqual([])
    expect(findAiCredits(undefined as unknown as string)).toEqual([])
  })
})
