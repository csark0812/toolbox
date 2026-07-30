import { mkdirSync, writeFileSync, existsSync, rmSync, readFileSync } from 'node:fs'
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
import { materializeNullArmSuite } from '../scripts/lib/diagnose-null-arm-suites.mjs'

describe('diagnose caller park', () => {
	it('keeps answer keys in memory only (no plaintext under park metaDir)', () => {
		const repo = mkdtempSync(join(tmpdir(), 'diagnose-park-repo-'))
		try {
			mkdirSync(join(repo, 'diagnose'), { recursive: true })
			writeFileSync(join(repo, 'diagnose', 'SKILL.md'), 'gate text secret\n')
			mkdirSync(join(repo, 'agent-suites', 'diagnose-transfer'), { recursive: true })
			writeFileSync(
				join(repo, 'agent-suites', 'diagnose-transfer', 'scenarios.json'),
				'{"name":"diagnose-transfer"}\n',
			)
			mkdirSync(join(repo, 'docs'), { recursive: true })
			writeFileSync(join(repo, 'docs', 'evidence-parity.md'), 'doc\n')

			const handle = parkDiagnoseAnswerKeys(repo, { parkId: `test-park-${Date.now()}` })
			expect(handle.moved.length).toBeGreaterThanOrEqual(2)
			expect(existsSync(join(repo, 'diagnose', 'SKILL.md'))).toBe(false)
			expect(handle.files.get('diagnose/SKILL.md')?.toString()).toContain('gate text secret')
			const metaListing = execFileSync('find', [handle.metaDir, '-type', 'f'], {
				encoding: 'utf8',
			})
			expect(metaListing).not.toContain('SKILL.md')
			expect(metaListing).not.toContain('gate text')

			restoreDiagnoseAnswerKeys(repo, handle)
			expect(existsSync(join(repo, 'diagnose', 'SKILL.md'))).toBe(true)
			expect(DIAGNOSE_CALLER_PARK_PATHS).toContain('diagnose')
		} finally {
			rmSync(repo, { recursive: true, force: true })
		}
	})

	it('park-commit blocks git show HEAD and main for answer keys', () => {
		const parent = mkdtempSync(join(tmpdir(), 'diagnose-park-git-'))
		const repo = join(parent, 'repo')
		mkdirSync(repo)
		execFileSync('git', ['init', '-b', 'main'], { cwd: repo })
		execFileSync('git', ['config', 'user.email', 't@example.com'], { cwd: repo })
		execFileSync('git', ['config', 'user.name', 't'], { cwd: repo })
		mkdirSync(join(repo, 'diagnose'), { recursive: true })
		writeFileSync(join(repo, 'diagnose', 'SKILL.md'), 'entry gate refuse\n')
		mkdirSync(join(repo, 'agent-suites', 'diagnose-transfer'), { recursive: true })
		writeFileSync(
			join(repo, 'agent-suites', 'diagnose-transfer', 'scenarios.json'),
			JSON.stringify({
				name: 'diagnose-transfer',
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
		})
		commitDiagnoseParkToGit(repo, handle)

		expect(() =>
			execFileSync('git', ['show', 'HEAD:diagnose/SKILL.md'], {
				cwd: repo,
				encoding: 'utf8',
			}),
		).toThrow()
		expect(() =>
			execFileSync('git', ['show', 'main:diagnose/SKILL.md'], {
				cwd: repo,
				encoding: 'utf8',
			}),
		).toThrow()

		expect(() =>
			execFileSync('git', ['show', 'HEAD^:diagnose/SKILL.md'], {
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

		const transferBuf = handle.files.get('agent-suites/diagnose-transfer/scenarios.json')
		const mat = materializeNullArmSuite(repo, 'diagnose-transfer', null, {
			scenariosJson: transferBuf,
			omitSeed: true,
		})
		const onDisk = JSON.parse(readFileSync(join(mat.suiteDir, 'scenarios.json'), 'utf8'))
		expect(onDisk.scenarios[0].rubric.judge).toBeUndefined()
		expect(onDisk.scenarios[0].seedPatch).toBeUndefined()

		restoreDiagnoseParkGit(repo, handle)
		restoreDiagnoseAnswerKeys(repo, handle)
		const skill = execFileSync('git', ['show', 'main:diagnose/SKILL.md'], {
			cwd: repo,
			encoding: 'utf8',
		})
		expect(skill).toContain('entry gate refuse')
		expect(existsSync(join(repo, 'diagnose', 'SKILL.md'))).toBe(true)

		rmSync(parent, { recursive: true, force: true })
	})
})
