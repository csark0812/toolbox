import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const index = JSON.parse(readFileSync(join(root, 'agent-suites/migration-index.json'), 'utf8'))

describe('claim-file suites', () => {
  for (const suite of ['hillclimb', 'babysit-pr'])
    it(`${suite} migration rows mirror claims.json and cover routing both ways`, () => {
      const claims = JSON.parse(
        readFileSync(join(root, `agent-suites/${suite}/claims.json`), 'utf8'),
      )
      const rows = index.scenarios.filter((row) => row.suite === suite)
      expect(rows.map((row) => row.id)).toEqual(claims.scenarios.map((_, i) => `${suite}:${i + 1}`))
      for (const [i, scenario] of claims.scenarios.entries()) {
        expect(rows[i].name).toBe(scenario.name)
        expect(rows[i].rubric).toEqual(scenario.rubric)
      }
      const triggers = claims.scenarios.filter((s) => s.rubric.mustInvokeSkill?.includes(suite))
      const nearMisses = claims.scenarios.filter((s) =>
        s.rubric.mustNotReadPath?.includes(`${suite}/SKILL.md`),
      )
      expect(triggers.length).toBeGreaterThanOrEqual(3)
      expect(nearMisses.length).toBeGreaterThanOrEqual(3)
      for (const scenario of claims.scenarios)
        expect(scenario.prompt, 'routing prompts must not name the skill').not.toMatch(
          new RegExp(`${suite}|SKILL\\.md`),
        )
    })
})
