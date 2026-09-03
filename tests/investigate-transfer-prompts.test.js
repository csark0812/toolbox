import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const transferPath = join(root, 'agent-suites/probe-evidence-transfer/scenarios.json')
const outcomePath = join(root, 'agent-suites/probe-evidence-outcomes/scenarios.json')

const HYGIENE_SEED = '_agent/probe-evidence-null-arm-hygiene.patch'

/** Investigate-protocol phrases that should not appear in the null (transfer) arm. */
const TRANSFER_LEAKAGE = [
  /SKILL\.md/i,
  /\.claude\/skills\/probe/i,
  /falsifiable hypotheses/i,
  /kill tests?/i,
  /confirmatory (reading|forage)/i,
  /leave after dead forage/i,
  /discriminating checks?/i,
  /re-?rank/i,
  /forage/i,
  /fix.?invention/i,
  /leave.?redirect/i,
]

describe('investigate transfer null baseline', () => {
  const transfer = JSON.parse(readFileSync(transferPath, 'utf8'))
  const outcome = JSON.parse(readFileSync(outcomePath, 'utf8'))

  it('pairs every outcome scenario with a transfer row by compareId', () => {
    const outcomeIds = outcome.scenarios.map((s) => s.compareId).sort()
    const transferIds = transfer.scenarios.map((s) => s.compareId).sort()
    expect(transferIds).toEqual(outcomeIds)
  })

  it('transfer defaults to skills:none', () => {
    expect(transfer.defaults.skills).toBe('none')
  })

  it('transfer prompts do not leak investigate protocol language', () => {
    for (const scenario of transfer.scenarios) {
      for (const pattern of TRANSFER_LEAKAGE) {
        expect(scenario.prompt, `${scenario.name}: ${pattern}`).not.toMatch(pattern)
      }
      expect(scenario.name, scenario.name).not.toMatch(/fix.?invention|leave.?redirect/i)
    }
  })

  it('outcome prompts require reading the investigate skill', () => {
    for (const scenario of outcome.scenarios) {
      expect(scenario.prompt).toMatch(/\.claude\/skills\/probe\/SKILL\.md/)
    }
  })

  it('outcome arm still requires investigate invocation', () => {
    for (const scenario of outcome.scenarios) {
      expect(scenario.rubric.mustInvokeSkill).toEqual(['probe'])
    }
  })

  it('transfer uses null-arm hygiene seed; outcomes keep guard-only seeds', () => {
    for (const scenario of outcome.scenarios) {
      expect(scenario.seedPatch, scenario.name).toMatch(/guard-only\.patch$/)
    }
    for (const scenario of transfer.scenarios) {
      expect(scenario.seedPatch, scenario.name).toBe(HYGIENE_SEED)
      expect(scenario.rubric.mustNotReadPath?.length ?? 0).toBeGreaterThan(0)
    }
  })

  it('both arms use direct Cursor runs', () => {
    expect(outcome.defaults.host).toBe('cursor')
    expect(transfer.defaults.host).toBe('cursor')
  })
})
