/**
 * Park diagnose answer keys off the open (caller) tree during null-arm live runs.
 *
 * Thin wrapper over shared caller-park with diagnose path list.
 */
import {
	parkAnswerKeys,
	restoreAnswerKeys,
	commitParkToGit,
	restoreParkGit,
} from './caller-park.mjs'

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
	'tests/diagnose-caller-park.test.js',
	'tests/diagnose-transfer-prompts.test.js',
	'tests/diagnose-prompt-baseline.test.js',
	'tests/diagnose-fixture-hygiene.test.js',
	'.claude/skills/diagnose',
	'.agents/skills/diagnose',
]

const PARK_COMMIT_MESSAGE = 'agent-test: temporary diagnose answer-key park'

/**
 * @param {string} repoRoot
 * @param {{ parkId?: string }} [options]
 */
export function parkDiagnoseAnswerKeys(repoRoot, options = {}) {
	return parkAnswerKeys(repoRoot, DIAGNOSE_CALLER_PARK_PATHS, options)
}

export function restoreDiagnoseAnswerKeys(repoRoot, handle) {
	return restoreAnswerKeys(repoRoot, handle)
}

/**
 * @param {string} repoRoot
 * @param {{ moved: Array<{ rel: string }>, metaDir?: string, parkRoot?: string }} parkHandle
 */
export function commitDiagnoseParkToGit(repoRoot, parkHandle) {
	return commitParkToGit(repoRoot, parkHandle, { commitMessage: PARK_COMMIT_MESSAGE })
}

export function restoreDiagnoseParkGit(repoRoot, parkHandle) {
	return restoreParkGit(repoRoot, parkHandle)
}
