/**
 * Park investigate answer keys off the open (caller) tree during null-arm live runs.
 *
 * Live Cursor Shell often targets the IDE-open root — worktree-only deletes do not
 * stop forage. Guard-only debug-app seeds are re-materialized under `_agent/` for
 * the harness; answer-bearing hygiene patches stay out of the agent-visible tree.
 */
import {
  parkAnswerKeys,
  restoreAnswerKeys,
  commitParkToGit,
  restoreParkGit,
} from './caller-park.mjs'

/** Paths relative to repo root that teach the C1 verdict gate or leak fixtures. */
export const INVESTIGATE_CALLER_PARK_PATHS = [
  'investigate',
  'agent-suites/investigate',
  'agent-suites/investigate-outcomes',
  'agent-suites/investigate-outcomes-ceiling',
  'agent-suites/investigate-transfer',
  'agent-suites/investigate-prompt',
  'agent-suites/investigate-transfer-ceiling',
  'docs/evidence-parity.md',
  '_agent/investigate-null-arm-hygiene.patch',
  'tests/investigate-transfer-prompts.test.js',
  'tests/investigate-prompt-baseline.test.js',
  'tests/investigate-fixture-seeds.test.js',
  'tests/investigate-caller-park.test.js',
  'tests/investigate-fixture-hygiene.test.js',
  '.claude/skills/investigate',
  '.agents/skills/investigate',
]

/** Guard-only fixture seeds (bug plant only — not answer keys). */
export const INVESTIGATE_GUARD_ONLY_SEEDS = {
  'leave-redirect-red-herring':
    'agent-suites/investigate-outcomes/fixtures/seeds/leave-redirect-guard-only.patch',
  'fix-invention-pressure':
    'agent-suites/investigate-outcomes/fixtures/seeds/fix-invention-guard-only.patch',
}

const PARK_COMMIT_MESSAGE = 'agent-test: temporary investigate answer-key park'

/**
 * @param {string} repoRoot
 * @param {{ parkId?: string }} [options]
 */
export function parkInvestigateAnswerKeys(repoRoot, options = {}) {
  return parkAnswerKeys(repoRoot, INVESTIGATE_CALLER_PARK_PATHS, options)
}

export function restoreInvestigateAnswerKeys(repoRoot, handle) {
  return restoreAnswerKeys(repoRoot, handle)
}

/**
 * @param {string} repoRoot
 * @param {{ moved: Array<{ rel: string }>, metaDir?: string, parkRoot?: string }} parkHandle
 */
export function commitInvestigateParkToGit(repoRoot, parkHandle) {
  return commitParkToGit(repoRoot, parkHandle, { commitMessage: PARK_COMMIT_MESSAGE })
}

export function restoreInvestigateParkGit(repoRoot, parkHandle) {
  return restoreParkGit(repoRoot, parkHandle)
}
