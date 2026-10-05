import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const promptPath = join(root, 'agent-suites/evidence-based-debugging-prompt/claims.json')
const outcomePath = join(root, 'agent-suites/evidence-based-debugging-outcomes/claims.json')
const transferPath = join(root, 'agent-suites/evidence-based-debugging-transfer/claims.json')

const HYGIENE_SEED = '_agent/evidence-based-debugging-null-arm-hygiene.patch'

/** Skill-file references that must not appear in the prompt baseline arm. */
const PROMPT_LEAKAGE = [
  /SKILL\.md/i,
  /\.claude\/skills\/evidence-based-debugging/i,
  /mustInvokeSkill/i,
  /no repro refuse/i,
  /loop before cause/i,
]

describe('diagnose prompt baseline', () => {
  const prompt = JSON.parse(readFileSync(promptPath, 'utf8'))
  const outcome = JSON.parse(readFileSync(outcomePath, 'utf8'))
  const transfer = JSON.parse(readFileSync(transferPath, 'utf8'))

  it('pairs every outcome scenario with a prompt row by compareId', () => {
    const outcomeIds = outcome.scenarios.map((s) => s.compareId).sort()
    const promptIds = prompt.scenarios.map((s) => s.compareId).sort()
    expect(promptIds).toEqual(outcomeIds)
  })

  it('prompt arm uses skills:none defaults', () => {
    expect(prompt.defaults.skills).toBe('none')
  })

  it('prompt prompts do not leak diagnose skill file paths', () => {
    for (const scenario of prompt.scenarios) {
      for (const pattern of PROMPT_LEAKAGE) {
        expect(scenario.prompt, `${scenario.name}: ${pattern}`).not.toMatch(pattern)
      }
      expect(scenario.name, scenario.name).not.toMatch(/no.?repro|refuse|loop.?before/i)
    }
  })

  it('prompt insufficient-evidence includes observation and uncertainty rules', () => {
    const gate = prompt.scenarios.find((s) => s.compareId === 'insufficient-evidence')
    expect(gate.prompt).toMatch(/Distinguish observations from hypotheses/i)
    expect(gate.prompt).toMatch(/name specific missing evidence/i)
  })

  it('prompt demonstrated-repair includes ordering rule in prompt text', () => {
    const loop = prompt.scenarios.find((s) => s.compareId === 'demonstrated-repair')
    expect(loop.prompt).toMatch(/Run the relevant test/i)
    expect(loop.prompt).toMatch(/Repair only a demonstrated cause/i)
  })

  it('prompt and transfer share hygiene seed with outcomes', () => {
    for (const compareId of outcome.scenarios.map((s) => s.compareId)) {
      const promptRow = prompt.scenarios.find((s) => s.compareId === compareId)
      const transferRow = transfer.scenarios.find((s) => s.compareId === compareId)
      expect(promptRow.seedPatch).toBe(HYGIENE_SEED)
      expect(transferRow.seedPatch).toBe(HYGIENE_SEED)
    }
  })
})
