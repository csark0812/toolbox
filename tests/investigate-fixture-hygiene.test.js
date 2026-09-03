import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  INVESTIGATE_NULL_ARM_HYGIENE_SEED,
  regenerateInvestigateNullArmHygieneSeed,
} from '../scripts/regenerate-investigate-null-arm-hygiene.mjs'

const root = join(import.meta.dirname, '..')

describe('investigate null-arm hygiene seed', () => {
  it('writes seed under _agent/ (outside HEAD worktrees) with answer-key deletes', () => {
    const { out, pathCount } = regenerateInvestigateNullArmHygieneSeed({})
    expect(out.endsWith(INVESTIGATE_NULL_ARM_HYGIENE_SEED)).toBe(true)
    expect(pathCount).toBeGreaterThan(5)
    const patch = readFileSync(out, 'utf8')
    expect(patch).toMatch(/deleted file mode/)
    expect(patch).toMatch(/probe\/SKILL\.md/)
    expect(patch).toMatch(/agent-suites\/probe-evidence-outcomes\/scenarios\.json/)
    expect(patch).toMatch(/agent-suites\/probe-evidence-transfer\/scenarios\.json/)
    expect(patch).toMatch(/docs\/evidence-parity\.md/)
  })

  it('applies cleanly against a detached HEAD worktree and is absent from that tree', () => {
    regenerateInvestigateNullArmHygieneSeed({})
    const seedPath = join(root, INVESTIGATE_NULL_ARM_HYGIENE_SEED)
    const parent = mkdtempSync(join(tmpdir(), 'investigate-hygiene-'))
    try {
      const add = spawnSync('git', ['worktree', 'add', '--detach', parent, 'HEAD'], {
        cwd: root,
        encoding: 'utf8',
      })
      expect(add.status, add.stderr || add.stdout).toBe(0)
      expect(existsSync(join(parent, INVESTIGATE_NULL_ARM_HYGIENE_SEED))).toBe(false)
      const check = spawnSync('git', ['apply', '--check', seedPath], {
        cwd: parent,
        encoding: 'utf8',
      })
      expect(check.status, check.stderr || check.stdout).toBe(0)
      const apply = spawnSync('git', ['apply', seedPath], {
        cwd: parent,
        encoding: 'utf8',
      })
      expect(apply.status, apply.stderr || apply.stdout).toBe(0)
      expect(existsSync(join(parent, 'probe/SKILL.md'))).toBe(false)
      expect(existsSync(join(parent, 'agent-suites/probe-evidence-outcomes/scenarios.json'))).toBe(
        false,
      )
      expect(existsSync(join(parent, '_agent/probe-evidence-null-arm-hygiene.patch'))).toBe(false)
    } finally {
      spawnSync('git', ['worktree', 'remove', '--force', parent], {
        cwd: root,
        encoding: 'utf8',
      })
      rmSync(parent, { recursive: true, force: true })
    }
  })
})
