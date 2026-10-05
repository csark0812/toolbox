import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const claims = JSON.parse(readFileSync(join(root, 'agent-suites/retro/claims.json'), 'utf8'))
const index = JSON.parse(readFileSync(join(root, 'agent-suites/migration-index.json'), 'utf8'))

describe('retro conformance inputs', () => {
  it('maps every executable claim and provides its selected public evidence', () => {
    const mappings = index.scenarios.filter((row) => row.suite === 'retro')
    expect(mappings).toHaveLength(claims.scenarios.length)
    for (const [number, scenario] of claims.scenarios.entries()) {
      const mapping = mappings.find((row) => row.id === `retro:${number + 1}`)
      expect(mapping.name).toBe(scenario.name)
      expect(mapping.rubric).toEqual(scenario.rubric)
      expect(mapping.skipped).toBe(false)
      expect(mapping.judgeInput).toContain('toolCalls')
      expect(mapping.judgeInput).toContain('changedPaths')
      expect(scenario.prompt).toMatch(/Do not edit files/)
      expect(scenario.rubric.mustInvokeSkill).toEqual(['retro'])
      for (const path of scenario.evidencePaths) {
        expect(path).toMatch(/^agent-suites\/fixtures\/retro\//)
        expect(existsSync(join(root, path))).toBe(true)
      }
    }
    expect(existsSync(join(root, 'agent-suites/fixtures/retro/missing-session.md'))).toBe(false)
  })

  it('the existing mechanical checker catches the recorded violation and accepts the correction', () => {
    const temporary = mkdtempSync(join(tmpdir(), 'toolbox-retro-check-'))
    try {
      cpSync(join(root, 'agent-suites/fixtures/retro/mechanical'), temporary, {
        recursive: true,
      })
      execFileSync(process.execPath, ['lint.mjs'], { cwd: temporary })
      const sourcePath = join(temporary, 'src/session.mjs')
      writeFileSync(
        sourcePath,
        readFileSync(sourcePath, 'utf8').replace('const label', 'var label'),
      )
      const rejected = spawnSync(process.execPath, ['lint.mjs'], {
        cwd: temporary,
        encoding: 'utf8',
      })
      expect(rejected.status).toBe(1)
      expect(rejected.stderr).toContain('Use const or let declarations')
      // The behavior test alone misses the mechanical violation, as the session records.
      execFileSync(process.execPath, ['test.mjs'], { cwd: temporary })
    } finally {
      rmSync(temporary, { recursive: true, force: true })
    }
  })

  it('ships the formatted skill hash and its upstream license inside the standalone package', () => {
    const lock = JSON.parse(readFileSync(join(root, 'skills-lock.json'), 'utf8'))
    const hash = createHash('sha256')
      .update(readFileSync(join(root, 'retro/SKILL.md')))
      .digest('hex')
    expect(lock.skills.retro.computedHash).toBe(hash)
    const license = readFileSync(join(root, 'retro/LICENSE'), 'utf8')
    expect(license).toContain('Copyright (c) 2026 Matt Pocock')
    expect(license).toContain('The above copyright notice and this permission notice')
  })
})
