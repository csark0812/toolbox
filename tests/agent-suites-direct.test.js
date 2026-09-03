import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const suitesRoot = join(root, 'agent-suites')
const suiteDirectories = readdirSync(suitesRoot, { withFileTypes: true })
  .filter(
    (entry) => entry.isDirectory() && existsSync(join(suitesRoot, entry.name, 'scenarios.json')),
  )
  .map((entry) => entry.name)

describe('direct agent suites', () => {
  it('uses only Cursor or Claude execution hosts', () => {
    for (const directory of suiteDirectories) {
      const path = join(suitesRoot, directory, 'scenarios.json')
      const suite = JSON.parse(readFileSync(path, 'utf8'))
      expect(['cursor', 'claude'], `${directory}: defaults.host`).toContain(suite.defaults?.host)

      for (const scenario of suite.scenarios) {
        expect(scenario, `${directory}: ${scenario.name}`).not.toHaveProperty('replayTrace')
        if (scenario.host !== undefined) {
          expect(['cursor', 'claude'], `${directory}: ${scenario.name}: host`).toContain(
            scenario.host,
          )
        }
      }
    }
  })

  it('does not commit replay fixture directories', () => {
    for (const directory of suiteDirectories) {
      expect(existsSync(join(suitesRoot, directory, 'fixtures', 'replays')), directory).toBe(false)
    }
  })
})
