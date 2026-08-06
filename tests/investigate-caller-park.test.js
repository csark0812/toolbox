import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'node:fs'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import {
  INVESTIGATE_CALLER_PARK_PATHS,
  parkInvestigateAnswerKeys,
  restoreInvestigateAnswerKeys,
  commitInvestigateParkToGit,
  restoreInvestigateParkGit,
} from '../scripts/lib/investigate-caller-park.mjs'
import { materializeNullArmSuite } from '../scripts/lib/null-arm-suites.mjs'

describe('investigate caller park', () => {
  it('keeps answer keys in memory only (no plaintext under park metaDir)', () => {
    const repo = mkdtempSync(join(tmpdir(), 'investigate-park-repo-'))
    try {
      mkdirSync(join(repo, 'probe'), { recursive: true })
      writeFileSync(join(repo, 'probe', 'SKILL.md'), 'verdict gate secret\n')
      mkdirSync(join(repo, 'agent-suites', 'probe-evidence-transfer'), { recursive: true })
      writeFileSync(
        join(repo, 'agent-suites', 'probe-evidence-transfer', 'scenarios.json'),
        '{"name":"probe-evidence-transfer"}\n',
      )
      mkdirSync(join(repo, 'docs'), { recursive: true })
      writeFileSync(join(repo, 'docs', 'evidence-parity.md'), 'doc\n')

      const handle = parkInvestigateAnswerKeys(repo, { parkId: `test-park-${Date.now()}` })
      expect(handle.moved.length).toBeGreaterThanOrEqual(2)
      expect(existsSync(join(repo, 'probe', 'SKILL.md'))).toBe(false)
      expect(handle.files.get('probe/SKILL.md')?.toString()).toContain('verdict gate secret')
      const metaListing = execFileSync('find', [handle.metaDir, '-type', 'f'], {
        encoding: 'utf8',
      })
      expect(metaListing).not.toContain('SKILL.md')
      expect(metaListing).not.toContain('verdict gate')

      restoreInvestigateAnswerKeys(repo, handle)
      expect(existsSync(join(repo, 'probe', 'SKILL.md'))).toBe(true)
      expect(INVESTIGATE_CALLER_PARK_PATHS).toContain('probe')
    } finally {
      rmSync(repo, { recursive: true, force: true })
    }
  })

  it('park-commit blocks git show HEAD and main for answer keys', () => {
    const parent = mkdtempSync(join(tmpdir(), 'investigate-park-git-'))
    const repo = join(parent, 'repo')
    mkdirSync(repo)
    execFileSync('git', ['init', '-b', 'main'], { cwd: repo })
    execFileSync('git', ['config', 'user.email', 't@example.com'], { cwd: repo })
    execFileSync('git', ['config', 'user.name', 't'], { cwd: repo })
    mkdirSync(join(repo, 'probe'), { recursive: true })
    writeFileSync(join(repo, 'probe', 'SKILL.md'), 'verdict without patch\n')
    mkdirSync(join(repo, 'agent-suites', 'probe-evidence-transfer'), { recursive: true })
    writeFileSync(
      join(repo, 'agent-suites', 'probe-evidence-transfer', 'scenarios.json'),
      JSON.stringify({
        name: 'probe-evidence-transfer',
        scenarios: [
          {
            name: 'transfer: session hunch B',
            compareId: 'fix-invention-pressure',
            rubric: { must: ['verdict'], judge: ['Did not propose a code fix'] },
          },
        ],
      }),
    )
    mkdirSync(join(repo, 'agent-suites', 'probe-evidence-outcomes', 'fixtures', 'seeds'), {
      recursive: true,
    })
    writeFileSync(
      join(
        repo,
        'agent-suites',
        'probe-evidence-outcomes',
        'fixtures',
        'seeds',
        'fix-invention-guard-only.patch',
      ),
      'diff --git a/x b/x\n',
    )
    execFileSync('git', ['add', '-A'], { cwd: repo })
    execFileSync('git', ['commit', '-m', 'init'], { cwd: repo })

    const handle = parkInvestigateAnswerKeys(repo, {
      parkId: `investigate-git-park-${process.pid}-${Date.now()}`,
    })
    commitInvestigateParkToGit(repo, handle)

    expect(() =>
      execFileSync('git', ['show', 'HEAD:probe/SKILL.md'], {
        cwd: repo,
        encoding: 'utf8',
      }),
    ).toThrow()
    expect(() =>
      execFileSync('git', ['show', 'main:probe/SKILL.md'], {
        cwd: repo,
        encoding: 'utf8',
      }),
    ).toThrow()
    expect(() =>
      execFileSync('git', ['show', 'HEAD^:probe/SKILL.md'], {
        cwd: repo,
        encoding: 'utf8',
      }),
    ).toThrow()

    const transferBuf = handle.files.get('agent-suites/probe-evidence-transfer/scenarios.json')
    const mat = materializeNullArmSuite(repo, 'probe-evidence-transfer', null, {
      scenariosJson: transferBuf,
      seedPatchByCompareId: {
        'fix-invention-pressure': '_agent/probe-evidence-fixture-seeds/fix-invention-guard-only.patch',
      },
    })
    const onDisk = JSON.parse(readFileSync(join(mat.suiteDir, 'scenarios.json'), 'utf8'))
    expect(onDisk.scenarios[0].rubric.judge).toBeUndefined()
    expect(onDisk.scenarios[0].seedPatch).toBe(
      '_agent/probe-evidence-fixture-seeds/fix-invention-guard-only.patch',
    )

    restoreInvestigateParkGit(repo, handle)
    restoreInvestigateAnswerKeys(repo, handle)
    const skill = execFileSync('git', ['show', 'main:probe/SKILL.md'], {
      cwd: repo,
      encoding: 'utf8',
    })
    expect(skill).toContain('verdict without patch')
    expect(existsSync(join(repo, 'probe', 'SKILL.md'))).toBe(true)

    rmSync(parent, { recursive: true, force: true })
  })
})
