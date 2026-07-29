import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
	DIAGNOSE_CALLER_PARK_PATHS,
	parkDiagnoseAnswerKeys,
	restoreDiagnoseAnswerKeys,
} from '../scripts/lib/diagnose-caller-park.mjs'

describe('diagnose caller park', () => {
	it('moves listed paths out and restores them', () => {
		const repo = mkdtempSync(join(tmpdir(), 'diagnose-park-repo-'))
		try {
			mkdirSync(join(repo, 'diagnose'), { recursive: true })
			writeFileSync(join(repo, 'diagnose', 'SKILL.md'), 'gate text\n')
			mkdirSync(join(repo, 'agent-suites', 'diagnose-transfer'), { recursive: true })
			writeFileSync(
				join(repo, 'agent-suites', 'diagnose-transfer', 'scenarios.json'),
				'{}\n',
			)
			mkdirSync(join(repo, 'docs'), { recursive: true })
			writeFileSync(join(repo, 'docs', 'evidence-parity.md'), 'doc\n')

			const handle = parkDiagnoseAnswerKeys(repo, { parkId: `test-park-${Date.now()}` })
			expect(handle.moved.length).toBeGreaterThanOrEqual(2)
			expect(existsSync(join(repo, 'diagnose', 'SKILL.md'))).toBe(false)
			expect(existsSync(join(repo, 'agent-suites', 'diagnose-transfer', 'scenarios.json'))).toBe(
				false,
			)

			restoreDiagnoseAnswerKeys(handle)
			expect(existsSync(join(repo, 'diagnose', 'SKILL.md'))).toBe(true)
			expect(existsSync(join(repo, 'agent-suites', 'diagnose-transfer', 'scenarios.json'))).toBe(
				true,
			)
			expect(DIAGNOSE_CALLER_PARK_PATHS).toContain('diagnose')
		} finally {
			rmSync(repo, { recursive: true, force: true })
		}
	})
})
