import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  DIAGNOSE_NULL_ARM_HYGIENE_SEED,
  regenerateDiagnoseNullArmHygieneSeed,
} from '../scripts/regenerate-diagnose-null-arm-hygiene.mjs'

const root = join(import.meta.dirname, '..')

describe('diagnose null-arm hygiene seed', () => {
  it('writes seed under _agent/ (outside HEAD worktrees) with answer-key deletes', () => {
    const { out, pathCount } = regenerateDiagnoseNullArmHygieneSeed({})
    expect(out.endsWith(DIAGNOSE_NULL_ARM_HYGIENE_SEED)).toBe(true)
    expect(pathCount).toBeGreaterThan(5)
    const patch = readFileSync(out, 'utf8')
    expect(patch).toMatch(/deleted file mode/)
    expect(patch).toMatch(/probe\/SKILL\.md/)
    expect(patch).toMatch(/agent-suites\/probe-fix-outcomes\/scenarios\.json/)
    expect(patch).toMatch(/docs\/evidence-parity\.md/)
  })

  it('applies cleanly against a detached HEAD worktree and is absent from that tree', () => {
    regenerateDiagnoseNullArmHygieneSeed({})
    const seedPath = join(root, DIAGNOSE_NULL_ARM_HYGIENE_SEED)
    const parent = mkdtempSync(join(tmpdir(), 'diagnose-hygiene-'))
    try {
      const add = spawnSync('git', ['worktree', 'add', '--detach', parent, 'HEAD'], {
        cwd: root,
        encoding: 'utf8',
      })
      expect(add.status, add.stderr || add.stdout).toBe(0)
      expect(existsSync(join(parent, DIAGNOSE_NULL_ARM_HYGIENE_SEED))).toBe(false)
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
      expect(existsSync(join(parent, 'agent-suites/probe-fix-outcomes/scenarios.json'))).toBe(false)
      // Applied tree must not still contain the seed file (patch text = crib).
      expect(existsSync(join(parent, '_agent/probe-fix-null-arm-hygiene.patch'))).toBe(false)
    } finally {
      spawnSync('git', ['worktree', 'remove', '--force', parent], {
        cwd: root,
        encoding: 'utf8',
      })
      rmSync(parent, { recursive: true, force: true })
    }
  })
})
