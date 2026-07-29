import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const seedPath = join(
	root,
	'agent-suites/diagnose-outcomes/fixtures/seeds/null-arm-hygiene.patch',
)

describe('diagnose null-arm hygiene seed', () => {
	it('deletes skill + answer-key paths that leaked into transfer', () => {
		const patch = readFileSync(seedPath, 'utf8')
		expect(patch).toMatch(/deleted file mode/)
		expect(patch).toMatch(/diagnose\/SKILL\.md/)
		expect(patch).toMatch(/agent-suites\/diagnose-outcomes\/scenarios\.json/)
		expect(patch).toMatch(/agent-suites\/diagnose-outcomes\/fixtures\/replays\/no-repro-refuse\.json/)
		expect(patch).toMatch(/docs\/evidence-parity\.md/)
		// Seed itself must remain applyable — never delete the seeds file via a diff header
		expect(patch).not.toMatch(/^diff --git a\/.*null-arm-hygiene\.patch/m)
	})

	it('applies cleanly against a detached HEAD worktree (live layout)', () => {
		const parent = mkdtempSync(join(tmpdir(), 'diagnose-hygiene-'))
		try {
			const add = spawnSync('git', ['worktree', 'add', '--detach', parent, 'HEAD'], {
				cwd: root,
				encoding: 'utf8',
			})
			expect(add.status, add.stderr || add.stdout).toBe(0)
			const check = spawnSync('git', ['apply', '--check', seedPath], {
				cwd: parent,
				encoding: 'utf8',
			})
			expect(check.status, check.stderr || check.stdout).toBe(0)
		} finally {
			spawnSync('git', ['worktree', 'remove', '--force', parent], {
				cwd: root,
				encoding: 'utf8',
			})
			rmSync(parent, { recursive: true, force: true })
		}
	})
})
