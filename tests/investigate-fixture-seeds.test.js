import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const seedsDir = join(root, 'agent-suites/probe-evidence-outcomes/fixtures/seeds')

function patchApplies(name) {
  const patchPath = join(seedsDir, name)
  const result = spawnSync('git', ['apply', '--check', patchPath], {
    cwd: root,
    encoding: 'utf8',
  })
  expect(result.status, result.stderr || result.stdout).toBe(0)
  return readFileSync(patchPath, 'utf8')
}

describe('investigate discriminating fixture seeds', () => {
  it('guard-only seed applies cleanly and removes sessionCookie scale bug', () => {
    const guardOnlyPatch = patchApplies('fix-invention-guard-only.patch')
    expect(guardOnlyPatch).toMatch(/sessionCookie\.ts/)
    expect(guardOnlyPatch).toMatch(/Math\.floor\(stored \/ 1000\)/)
    expect(guardOnlyPatch).toMatch(/const expiresAt = stored/)
  })

  it('leave-redirect guard-only seed applies cleanly with redirect comment + cookie fix', () => {
    const leaveGuardPatch = patchApplies('leave-redirect-guard-only.patch')
    expect(leaveGuardPatch).toMatch(/redirect\.ts/)
    expect(leaveGuardPatch).toMatch(/legacy path cleared session cookie/)
    expect(leaveGuardPatch).toMatch(/sessionCookie\.ts/)
    expect(leaveGuardPatch).toMatch(/const expiresAt = stored/)
  })
})
