import {
  mkdirSync,
  writeFileSync,
  existsSync,
  rmSync,
  readFileSync,
  symlinkSync,
  lstatSync,
} from 'node:fs'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'
import {
  DIAGNOSE_CALLER_PARK_PATHS,
  parkDiagnoseAnswerKeys,
  restoreDiagnoseAnswerKeys,
  commitDiagnoseParkToGit,
  restoreDiagnoseParkGit,
} from '../scripts/lib/diagnose-caller-park.mjs'
import { parkAnswerKeys, restoreAnswerKeys } from '../scripts/lib/caller-park.mjs'
import { materializeNullArmSuite } from '../scripts/lib/diagnose-null-arm-suites.mjs'

describe('diagnose caller park', () => {
  it('keeps answer keys in memory only (no plaintext under park metaDir)', () => {
    const repo = mkdtempSync(join(tmpdir(), 'diagnose-park-repo-'))
    try {
      mkdirSync(join(repo, 'probe'), { recursive: true })
      writeFileSync(join(repo, 'probe', 'SKILL.md'), 'gate text secret\n')
      mkdirSync(join(repo, 'agent-suites', 'probe-fix-transfer'), { recursive: true })
      writeFileSync(
        join(repo, 'agent-suites', 'probe-fix-transfer', 'scenarios.json'),
        '{"name":"probe-fix-transfer"}\n',
      )
      mkdirSync(join(repo, 'docs'), { recursive: true })
      writeFileSync(join(repo, 'docs', 'evidence-parity.md'), 'doc\n')

      const handle = parkDiagnoseAnswerKeys(repo, {
        parkId: `test-park-${Date.now()}`,
        parkGlobalSkills: false,
      })
      expect(handle.moved.length).toBeGreaterThanOrEqual(2)
      expect(existsSync(join(repo, 'probe', 'SKILL.md'))).toBe(false)
      expect(handle.files.get('probe/SKILL.md')?.toString()).toContain('gate text secret')
      const metaListing = execFileSync('find', [handle.metaDir, '-type', 'f'], {
        encoding: 'utf8',
      })
      expect(metaListing).not.toContain('SKILL.md')
      expect(metaListing).not.toContain('gate text')

      restoreDiagnoseAnswerKeys(repo, handle)
      expect(existsSync(join(repo, 'probe', 'SKILL.md'))).toBe(true)
      expect(DIAGNOSE_CALLER_PARK_PATHS).toContain('probe')
      expect(DIAGNOSE_CALLER_PARK_PATHS.indexOf('.agents/skills/probe')).toBeLessThan(
        DIAGNOSE_CALLER_PARK_PATHS.indexOf('probe'),
      )
    } finally {
      rmSync(repo, { recursive: true, force: true })
    }
  })

  it('removes skill symlinks instead of leaving dangling slugs', () => {
    const repo = mkdtempSync(join(tmpdir(), 'diagnose-park-symlink-'))
    try {
      mkdirSync(join(repo, 'probe'), { recursive: true })
      writeFileSync(join(repo, 'probe', 'SKILL.md'), 'entry gate\n')
      mkdirSync(join(repo, '.agents', 'skills'), { recursive: true })
      mkdirSync(join(repo, '.claude', 'skills'), { recursive: true })
      symlinkSync('../../probe', join(repo, '.agents', 'skills', 'probe'))
      symlinkSync('../../probe', join(repo, '.claude', 'skills', 'probe'))
      mkdirSync(join(repo, 'agent-suites', 'probe-fix-transfer'), { recursive: true })
      writeFileSync(
        join(repo, 'agent-suites', 'probe-fix-transfer', 'scenarios.json'),
        '{"name":"probe-fix-transfer"}\n',
      )

      const handle = parkDiagnoseAnswerKeys(repo, {
        parkId: `symlink-park-${Date.now()}`,
        parkGlobalSkills: false,
      })
      expect(existsSync(join(repo, '.agents', 'skills', 'probe'))).toBe(false)
      expect(existsSync(join(repo, '.claude', 'skills', 'probe'))).toBe(false)
      expect(existsSync(join(repo, 'probe', 'SKILL.md'))).toBe(false)
      // Directory listing must not still show the slug (dangling-link forage invite).
      expect(existsSync(join(repo, '.agents', 'skills'))).toBe(true)
      const agentsSkills = execFileSync('ls', [join(repo, '.agents', 'skills')], {
        encoding: 'utf8',
      })
      expect(agentsSkills).not.toMatch(/probe/)

      restoreDiagnoseAnswerKeys(repo, handle)
      expect(lstatSync(join(repo, '.agents', 'skills', 'probe')).isSymbolicLink()).toBe(true)
      expect(readFileSync(join(repo, 'probe', 'SKILL.md'), 'utf8')).toContain('entry gate')
    } finally {
      rmSync(repo, { recursive: true, force: true })
    }
  })

  it('parks absolute global skill paths outside the repo', () => {
    const parent = mkdtempSync(join(tmpdir(), 'diagnose-park-global-'))
    const repo = join(parent, 'repo')
    const fakeHome = join(parent, 'home')
    mkdirSync(repo)
    mkdirSync(join(fakeHome, '.agents', 'skills', 'probe'), { recursive: true })
    writeFileSync(join(fakeHome, '.agents', 'skills', 'probe', 'SKILL.md'), 'global gate\n')
    mkdirSync(join(repo, 'probe'), { recursive: true })
    writeFileSync(join(repo, 'probe', 'SKILL.md'), 'repo gate\n')

    const globalSkill = join(fakeHome, '.agents', 'skills', 'probe')
    const handle = parkAnswerKeys(repo, ['probe', globalSkill], {
      parkId: `global-park-${Date.now()}`,
    })
    expect(existsSync(join(repo, 'probe', 'SKILL.md'))).toBe(false)
    expect(existsSync(join(globalSkill, 'SKILL.md'))).toBe(false)
    expect(handle.files.get(join(globalSkill, 'SKILL.md'))?.toString()).toContain('global gate')

    restoreAnswerKeys(repo, handle)
    expect(readFileSync(join(globalSkill, 'SKILL.md'), 'utf8')).toContain('global gate')
    expect(readFileSync(join(repo, 'probe', 'SKILL.md'), 'utf8')).toContain('repo gate')
    rmSync(parent, { recursive: true, force: true })
  })

  it('park-commit blocks git show HEAD and main for answer keys', () => {
    const parent = mkdtempSync(join(tmpdir(), 'diagnose-park-git-'))
    const repo = join(parent, 'repo')
    mkdirSync(repo)
    execFileSync('git', ['init', '-b', 'main'], { cwd: repo })
    execFileSync('git', ['config', 'user.email', 't@example.com'], { cwd: repo })
    execFileSync('git', ['config', 'user.name', 't'], { cwd: repo })
    mkdirSync(join(repo, 'probe'), { recursive: true })
    writeFileSync(join(repo, 'probe', 'SKILL.md'), 'entry gate refuse\n')
    mkdirSync(join(repo, 'agent-suites', 'probe-fix-transfer'), { recursive: true })
    writeFileSync(
      join(repo, 'agent-suites', 'probe-fix-transfer', 'scenarios.json'),
      JSON.stringify({
        name: 'probe-fix-transfer',
        scenarios: [
          {
            name: 'transfer: session hunch A',
            rubric: { must: ['repro'], judge: ['Refused to hypothesize'] },
          },
        ],
      }),
    )
    execFileSync('git', ['add', '-A'], { cwd: repo })
    execFileSync('git', ['commit', '-m', 'init'], { cwd: repo })

    const handle = parkDiagnoseAnswerKeys(repo, {
      parkId: `diagnose-git-park-${process.pid}-${Date.now()}`,
      parkGlobalSkills: false,
    })
    commitDiagnoseParkToGit(repo, handle)

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
    expect(() =>
      execFileSync('git', ['rev-parse', 'HEAD^'], {
        cwd: repo,
        encoding: 'utf8',
      }),
    ).toThrow()

    const transferBuf = handle.files.get('agent-suites/probe-fix-transfer/scenarios.json')
    const mat = materializeNullArmSuite(repo, 'probe-fix-transfer', null, {
      scenariosJson: transferBuf,
      omitSeed: true,
    })
    const onDisk = JSON.parse(readFileSync(join(mat.suiteDir, 'scenarios.json'), 'utf8'))
    expect(onDisk.scenarios[0].rubric.judge).toBeUndefined()
    expect(onDisk.scenarios[0].seedPatch).toBeUndefined()

    restoreDiagnoseParkGit(repo, handle)
    restoreDiagnoseAnswerKeys(repo, handle)
    const skill = execFileSync('git', ['show', 'main:probe/SKILL.md'], {
      cwd: repo,
      encoding: 'utf8',
    })
    expect(skill).toContain('entry gate refuse')
    expect(existsSync(join(repo, 'probe', 'SKILL.md'))).toBe(true)

    rmSync(parent, { recursive: true, force: true })
  })
})
