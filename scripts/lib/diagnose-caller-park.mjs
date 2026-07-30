/**
 * Park diagnose answer keys off the open (caller) tree during null-arm live runs.
 *
 * Live Cursor agents often Shell against the IDE-open repo root, not the seeded
 * scenario worktree. Store parked file bytes in process memory (no $TMPDIR
 * plaintext), delete from the tree, then commit those deletions on a detached
 * HEAD and temporarily retarget main / origin/main so `git show` cannot recover
 * keys. Restore refs + bytes afterward.
 */
import { execFileSync } from 'node:child_process'
import {
	mkdirSync,
	existsSync,
	rmSync,
	writeFileSync,
	readFileSync,
	readdirSync,
	statSync,
} from 'node:fs'
import { dirname, join, relative } from 'node:path'
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
 * @param {string} absDir
 * @param {string} repoRoot
 * @param {Map<string, Buffer>} files
 */
function collectFilesRecursive(absDir, repoRoot, files) {
	for (const name of readdirSync(absDir)) {
		const abs = join(absDir, name)
		const st = statSync(abs)
		if (st.isDirectory()) {
			collectFilesRecursive(abs, repoRoot, files)
		} else if (st.isFile() || st.isSymbolicLink()) {
			files.set(relative(repoRoot, abs), readFileSync(abs))
		}
	}
}

/**
 * @param {string} repoRoot
 * @param {{ parkId?: string }} [options]
 * @returns {{
 *   parkId: string,
 *   metaDir: string,
 *   parkRoot: string,
 *   moved: Array<{ rel: string }>,
 *   files: Map<string, Buffer>,
 * }}
 */
export function parkDiagnoseAnswerKeys(repoRoot, options = {}) {
	const parkId =
		options.parkId ??
		`diagnose-park-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`
	/** Only stores git-ref backup JSON — never answer-key bytes. */
	const metaDir = join(tmpdir(), parkId)
	mkdirSync(metaDir, { recursive: true })

	const files = new Map()
	const moved = []
	for (const rel of DIAGNOSE_CALLER_PARK_PATHS) {
		const from = join(repoRoot, rel)
		if (!existsSync(from)) continue
		const st = statSync(from)
		if (st.isDirectory()) {
			collectFilesRecursive(from, repoRoot, files)
		} else {
			files.set(rel, readFileSync(from))
		}
		rmSync(from, { recursive: true, force: true })
		moved.push({ rel })
	}
	return { parkId, metaDir, parkRoot: metaDir, moved, files }
}

/**
 * @param {string} repoRoot
 * @param {{ files: Map<string, Buffer>, moved?: unknown[] }} handle
 */
export function restoreDiagnoseAnswerKeys(repoRoot, handle) {
	if (!handle?.files?.size) {
		if (handle) handle.moved = []
		return
	}
	for (const [rel, body] of handle.files) {
		const abs = join(repoRoot, rel)
		mkdirSync(dirname(abs), { recursive: true })
		writeFileSync(abs, body)
	}
	handle.files.clear()
	handle.moved = []
}

function git(repoRoot, args) {
	return execFileSync('git', args, {
		cwd: repoRoot,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
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
 * @param {string} repoRoot
 * @param {{ moved: Array<{ rel: string }>, metaDir?: string, parkRoot?: string }} parkHandle
 */
export function commitDiagnoseParkToGit(repoRoot, parkHandle) {
	const metaDir = parkHandle.metaDir ?? parkHandle.parkRoot
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
	writeFileSync(join(metaDir, 'git-ref-backup.json'), `${JSON.stringify(meta, null, 2)}\n`)

	git(repoRoot, ['checkout', '--detach', 'HEAD'])
	for (const { rel } of parkHandle.moved) {
		try {
			git(repoRoot, ['add', '-u', '--', rel])
		} catch {
			// untracked / already absent
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
	writeFileSync(join(metaDir, 'git-ref-backup.json'), `${JSON.stringify(meta, null, 2)}\n`)

	if (previousMain) {
		git(repoRoot, ['update-ref', 'refs/heads/main', parkCommit])
	}
	if (previousOriginMain) {
		git(repoRoot, ['update-ref', 'refs/remotes/origin/main', parkCommit])
	}

	return meta
}

/**
 * @param {string} repoRoot
 * @param {{ metaDir?: string, parkRoot?: string }} parkHandle
 */
export function restoreDiagnoseParkGit(repoRoot, parkHandle) {
	const metaDir = parkHandle.metaDir ?? parkHandle.parkRoot
	const backupPath = join(metaDir, 'git-ref-backup.json')
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
