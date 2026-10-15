import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const suite = (name) =>
  JSON.parse(readFileSync(join(root, `agent-suites/${name}/claims.json`), 'utf8'))

/**
 * Each family pairs a skill-on outcomes arm with two skill-off arms (prompt baseline and transfer).
 * The skill-off arms must match the outcomes by compareId and must not leak the skill's protocol.
 */
const FAMILIES = [
  {
    family: 'probe-evidence',
    skill: 'probe',
    outcomeSeed: /guard-only\.patch$/,
    leakage: [
      /SKILL\.md/i,
      /\.claude\/skills\/probe/i,
      /falsifiable hypotheses/i,
      /kill tests?/i,
      /confirmatory (reading|forage)/i,
      /discriminating checks?/i,
      /re-?rank/i,
      /forage/i,
      /mustInvokeSkill/i,
    ],
    namesLeak: /fix.?invention|leave.?redirect/i,
  },
  {
    family: 'evidence-based-debugging',
    skill: 'evidence-based-debugging',
    outcomeSeed: undefined,
    leakage: [
      /SKILL\.md/i,
      /\.claude\/skills\/evidence-based-debugging/i,
      /Diagnose with the diagnose skill/i,
      /mustInvokeSkill/i,
      /no repro refuse/i,
      /loop before cause/i,
    ],
    namesLeak: /no.?repro|refuse|loop.?before/i,
  },
]

for (const { family, skill, outcomeSeed, leakage, namesLeak } of FAMILIES)
  describe(`${family} evidence arms`, () => {
    const outcome = suite(`${family}-outcomes`)
    const outcomeIds = outcome.scenarios.map((scenario) => scenario.compareId).sort()

    it('the outcomes arm reads and invokes the skill', () => {
      for (const scenario of outcome.scenarios) {
        expect(scenario.prompt).toContain(`.claude/skills/${skill}/SKILL.md`)
        expect(scenario.rubric.mustInvokeSkill).toEqual([skill])
        if (outcomeSeed) expect(scenario.seedPatch, scenario.name).toMatch(outcomeSeed)
        else expect(scenario.seedPatch, scenario.name).toBeUndefined()
      }
    })

    for (const arm of ['prompt', 'transfer'])
      it(`the ${arm} arm pairs with outcomes, runs without skills and leaks no protocol`, () => {
        const baseline = suite(`${family}-${arm}`)
        expect(baseline.defaults.skills).toBe('none')
        expect(baseline.scenarios.map((scenario) => scenario.compareId).sort()).toEqual(outcomeIds)
        for (const scenario of baseline.scenarios) {
          for (const pattern of leakage)
            expect(scenario.prompt, `${scenario.name}: ${pattern}`).not.toMatch(pattern)
          expect(scenario.name).not.toMatch(namesLeak)
          if (arm === 'transfer') expect(scenario.rubric.mustNotReadPath?.length).toBeGreaterThan(0)
        }
      })
  })

describe('prompt baselines carry the rule text the skill would add', () => {
  it('probe evidence: the fix-invention prompt asks for a verdict without a patch', () => {
    const fix = suite('probe-evidence-prompt').scenarios.find(
      (scenario) => scenario.compareId === 'fix-invention-pressure',
    )
    expect(fix.prompt).toMatch(/file:line/i)
    expect(fix.prompt).toMatch(/Do not put code edits/i)
  })

  it('debugging: insufficient evidence and demonstrated repair carry their rules', () => {
    const scenarios = suite('evidence-based-debugging-prompt').scenarios
    const gate = scenarios.find((scenario) => scenario.compareId === 'insufficient-evidence')
    const repair = scenarios.find((scenario) => scenario.compareId === 'demonstrated-repair')
    expect(gate.prompt).toMatch(/Distinguish observations from hypotheses/i)
    expect(gate.prompt).toMatch(/name specific missing evidence/i)
    expect(repair.prompt).toMatch(/Run the relevant test/i)
    expect(repair.prompt).toMatch(/Repair only a demonstrated cause/i)
  })
})
