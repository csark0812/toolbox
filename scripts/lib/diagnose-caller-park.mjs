/**
 * Park diagnose answer keys off the open (caller) tree during null-arm live runs.
 *
 * Live Cursor agents often Shell against the IDE-open repo root, not the seeded
 * scenario worktree — so worktree-only deletes cannot stop forage. Move answer
 * keys out of the open tree, then commit those deletions on a detached HEAD and
 * temporarily retarget main / origin/main so `git show HEAD|main|origin/main:…`
 * cannot recover skill or fixture answer keys.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, renameSync, existsSync, rmSync, writeFileSync, readFileSync } from 'node:fs'
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

const PARK_COMMIT_MESSAGE = 'agent-test: temporary diagnose answer-key park'

/**
 * @param {string} repoRoot
 * @param {{ parkId?: string }} [options]
 * @returns {{ parkRoot: string, moved: Array<{ from: string, to: string, rel: string }> }}
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

function git(repoRoot, args, opts = {}) {
	return execFileSync('git', args, {
		cwd: repoRoot,
		encoding: 'utf8',
		...opts,
	}).trim()
}

function tryRevParse(repoRoot, rev) {
	try {
		return git(repoRoot, ['rev-parse', rev])
	} catch {
		return null
	}
}

/**
 * After working-tree park, commit deletions on detached HEAD and retarget
 * main / origin/main so typical `git show` forage fails.
 *
 * @param {string} repoRoot
 * @param {{ moved: Array<{ rel: string }>, parkRoot: string }} parkHandle
 */
export function commitDiagnoseParkToGit(repoRoot, parkHandle) {
	const branch = (() => {
		try {
			return git(repoRoot, ['symbolic-ref', '--short', 'HEAD'])
		} catch {
			return null
		}
	})()
	const previousHead = git(repoRoot, ['rev-parse', 'HEAD'])
	const previousMain = tryRevParse(repoRoot, 'refs/heads/main')
	const previousOriginMain = tryRevParse(repoRoot, 'refs/remotes/origin/main')

	const meta = {
		branch,
		previousHead,
		previousMain,
		previousOriginMain,
		parkCommit: null,
	}
	writeFileSync(join(parkHandle.parkRoot, 'git-ref-backup.json'), `${JSON.stringify(meta, null, 2)}\n`)

	git(repoRoot, ['checkout', '--detach', 'HEAD'])
	for (const { rel } of parkHandle.moved) {
		try {
			git(repoRoot, ['add', '-u', '--', rel])
		} catch {
			// path may already be absent from index
		}
	}
	const status = git(repoRoot, ['status', '--porcelain'])
	if (!status.trim()) {
		throw new Error('diagnose park commit: expected staged deletions after park, got empty status')
	}
	git(repoRoot, [
		'-c',
		'user.email=agent-test@agent-spec.local',
		'-c',
		'user.name=agent-test',
		'commit',
		'--no-verify',
		'-m',
		PARK_COMMIT_MESSAGE,
	])
	const parkCommit = git(repoRoot, ['rev-parse', 'HEAD'])
	meta.parkCommit = parkCommit
	writeFileSync(join(parkHandle.parkRoot, 'git-ref-backup.json'), `${JSON.stringify(meta, null, 2)}\n`)

	if (previousMain) {
		git(repoRoot, ['update-ref', 'refs/heads/main', parkCommit])
	}
	if (previousOriginMain) {
		git(repoRoot, ['update-ref', 'refs/remotes/origin/main', parkCommit])
	}

	return meta
}

/**
 * Restore branch tip / remote-tracking refs and leave HEAD on the original tip.
 * Caller should restore parked files afterward.
 *
 * @param {string} repoRoot
 * @param {{ parkRoot: string }} parkHandle
 */
export function restoreDiagnoseParkGit(repoRoot, parkHandle) {
	const backupPath = join(parkHandle.parkRoot, 'git-ref-backup.json')
	if (!existsSync(backupPath)) return
	const meta = JSON.parse(readFileSync(backupPath, 'utf8'))

	if (meta.previousMain) {
		git(repoRoot, ['update-ref', 'refs/heads/main', meta.previousMain])
	}
	if (meta.previousOriginMain) {
		git(repoRoot, ['update-ref', 'refs/remotes/origin/main', meta.previousOriginMain])
	}

	if (meta.branch) {
		git(repoRoot, ['checkout', '-f', meta.branch])
	} else if (meta.previousHead) {
		git(repoRoot, ['checkout', '--detach', meta.previousHead])
	}
}
