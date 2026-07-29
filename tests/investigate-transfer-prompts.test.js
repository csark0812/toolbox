import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const transferPath = join(root, 'agent-suites/investigate-transfer/scenarios.json')
const outcomePath = join(root, 'agent-suites/investigate-outcomes/scenarios.json')

/** Investigate-protocol phrases that should not appear in the null (transfer) arm. */
const TRANSFER_LEAKAGE = [
  /SKILL\.md/i,
  /falsifiable hypotheses/i,
  /kill tests?/i,
  /confirmatory (reading|forage)/i,
  /leave after dead forage/i,
  /discriminating checks?/i,
  /re-?rank/i,
  /forage/i,
]

describe('investigate transfer null baseline', () => {
  const transfer = JSON.parse(readFileSync(transferPath, 'utf8'))
  const outcome = JSON.parse(readFileSync(outcomePath, 'utf8'))

  it('pairs every outcome scenario with a transfer row by compareId', () => {
    const outcomeIds = outcome.scenarios.map((s) => s.compareId).sort()
    const transferIds = transfer.scenarios.map((s) => s.compareId).sort()
    expect(transferIds).toEqual(outcomeIds)
  })

  it('transfer prompts do not leak investigate protocol language', () => {
    for (const scenario of transfer.scenarios) {
      for (const pattern of TRANSFER_LEAKAGE) {
        expect(scenario.prompt, `${scenario.name}: ${pattern}`).not.toMatch(pattern)
      }
    }
  })

  it('outcome arm still requires investigate invocation', () => {
    for (const scenario of outcome.scenarios) {
      expect(scenario.rubric.mustInvokeSkill).toEqual(['investigate'])
    }
  })
})
