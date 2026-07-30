import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const promptPath = join(root, 'agent-suites/diagnose-prompt/scenarios.json')
const outcomePath = join(root, 'agent-suites/diagnose-outcomes/scenarios.json')
const transferPath = join(root, 'agent-suites/diagnose-transfer/scenarios.json')

const HYGIENE_SEED = '_agent/diagnose-null-arm-hygiene.patch'

/** Skill-file references that must not appear in the prompt baseline arm. */
const PROMPT_LEAKAGE = [
  /SKILL\.md/i,
  /\.claude\/skills\/diagnose/i,
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

  it('prompt no-repro includes entry-gate rule in prompt text', () => {
    const gate = prompt.scenarios.find((s) => s.compareId === 'no-repro-refuse')
    expect(gate.prompt).toMatch(/do not hypothesize/i)
    expect(gate.prompt).toMatch(/ask for a repro|route to investigate/i)
  })

  it('prompt loop-before-cause includes ordering rule in prompt text', () => {
    const loop = prompt.scenarios.find((s) => s.compareId === 'loop-before-cause')
    expect(loop.prompt).toMatch(/npm test/i)
    expect(loop.prompt).toMatch(/before naming a cause|before.*editing production/i)
  })

  it('prompt and transfer share hygiene seed and replayTrace with outcomes', () => {
    for (const compareId of outcome.scenarios.map((s) => s.compareId)) {
      const outcomeRow = outcome.scenarios.find((s) => s.compareId === compareId)
      const promptRow = prompt.scenarios.find((s) => s.compareId === compareId)
      const transferRow = transfer.scenarios.find((s) => s.compareId === compareId)
      expect(promptRow.seedPatch).toBe(HYGIENE_SEED)
      expect(transferRow.seedPatch).toBe(HYGIENE_SEED)
      expect(promptRow.replayTrace).toBe(outcomeRow.replayTrace)
      expect(transferRow.replayTrace).toBe(outcomeRow.replayTrace)
    }
  })
})
