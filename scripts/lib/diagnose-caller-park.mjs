/**
 * Park diagnose answer keys off the open (caller) tree during null-arm live runs.
 *
 * Live Cursor agents often Shell against the IDE-open repo root, not the seeded
 * scenario worktree — so worktree-only deletes cannot stop forage. Move answer
 * keys out of the open tree while transfer/prompt run, then restore.
 */
import { mkdirSync, renameSync, existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

/** Paths relative to repo root that teach the D1 refuse gate or leak fixtures. */
export const DIAGNOSE_CALLER_PARK_PATHS = [
	'diagnose',
	'agent-suites/diagnose',
	'agent-suites/diagnose-outcomes',
	'agent-suites/diagnose-outcomes-ceiling',
	'agent-suites/diagnose-transfer',
	'agent-suites/diagnose-prompt',
	'docs/evidence-parity.md',
	'_agent/diagnose-null-arm-hygiene.patch',
	'.claude/skills/diagnose',
	'.agents/skills/diagnose',
]

/**
 * @param {string} repoRoot
 * @param {{ parkId?: string }} [options]
 * @returns {{ parkRoot: string, moved: Array<{ from: string, to: string }> }}
 */
export function parkDiagnoseAnswerKeys(repoRoot, options = {}) {
	const parkId =
		options.parkId ??
		`diagnose-park-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`
	const parkRoot = join(tmpdir(), parkId)
	mkdirSync(parkRoot, { recursive: true })
	const moved = []
	for (const rel of DIAGNOSE_CALLER_PARK_PATHS) {
		const from = join(repoRoot, rel)
		if (!existsSync(from)) continue
		const to = join(parkRoot, rel.replaceAll('/', '__'))
		renameSync(from, to)
		moved.push({ from, to, rel })
	}
	return { parkRoot, moved }
}

/**
 * @param {{ moved: Array<{ from: string, to: string }> }} handle
 */
export function restoreDiagnoseAnswerKeys(handle) {
	if (!handle?.moved?.length) return
	for (const { from, to } of [...handle.moved].reverse()) {
		if (!existsSync(to)) continue
		mkdirSync(join(from, '..'), { recursive: true })
		if (existsSync(from)) {
			rmSync(from, { recursive: true, force: true })
		}
		renameSync(to, from)
	}
	handle.moved = []
}
