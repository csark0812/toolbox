/**
 * Park debugging answer keys off the open (caller) tree during null-arm live runs.
 *
 * Thin wrapper over shared caller-park with evidence-based-debugging path list.
 *
 * Skill mirrors are listed *before* `evidence-based-debugging/` so symlinks are unlinked while
 * still resolvable (lstat); parking the target first left dangling slugs that
 * `ls .agents/skills` still showed — agents then Read SKILL.md and failed
 * mustNotReadPath.
 *
 * Absolute home paths (opt-in via `parkGlobalSkills`) block Cursor from
 * re-injecting the global debugging skill during null-arm runs.
 */
import { homedir } from 'node:os'
import { join } from 'node:path'
import {
  parkAnswerKeys,
  restoreAnswerKeys,
  commitParkToGit,
  restoreParkGit,
} from './caller-park.mjs'

/** Repo-relative paths that teach the D1 refuse gate or leak fixtures. */
export const DIAGNOSE_CALLER_PARK_PATHS = [
  // Mirrors first (symlinks) — see file header.
  '.claude/skills/evidence-based-debugging',
  '.agents/skills/evidence-based-debugging',
  'evidence-based-debugging',
  'agent-suites/evidence-based-debugging',
  'agent-suites/evidence-based-debugging-outcomes',
  'agent-suites/evidence-based-debugging-outcomes-ceiling',
  'agent-suites/evidence-based-debugging-transfer',
  'agent-suites/evidence-based-debugging-prompt',
  'docs/evidence-parity.md',
  '_agent/evidence-based-debugging-null-arm-hygiene.patch',
  // Prior-run cribs (gitignored but Shell-visible on the open tree).
  // Do NOT park `_agent/eval-reports` / `evidence-runs` mid-cadence — outcomes
  // suite-report JSON under eval-reports is required for transfer compare-pairs.
  '_agent/skill-evolution',
  '_agent/null-arm-suites',
  'tests/diagnose-caller-park.test.js',
  'tests/diagnose-transfer-prompts.test.js',
  'tests/diagnose-prompt-baseline.test.js',
  'tests/diagnose-fixture-hygiene.test.js',
  'tests/diagnose-d1-decision.test.js',
  'scripts/lib/diagnose-d1-decision.mjs',
]

/** Global skill installs Cursor may surface even when project keys are parked. */
export function diagnoseGlobalSkillParkPaths(home = homedir()) {
  return [
    join(home, '.agents', 'skills', 'evidence-based-debugging'),
    join(home, '.claude', 'skills', 'evidence-based-debugging'),
    join(home, '.cursor', 'skills', 'evidence-based-debugging'),
    join(home, '.codex', 'skills', 'evidence-based-debugging'),
  ]
}

const PARK_COMMIT_MESSAGE = 'agent-test: temporary evidence-based-debugging answer-key park'

/**
 * @param {string} repoRoot
 * @param {{ parkId?: string, parkGlobalSkills?: boolean }} [options]
 */
export function parkDiagnoseAnswerKeys(repoRoot, options = {}) {
  const paths =
    options.parkGlobalSkills === true
      ? [...DIAGNOSE_CALLER_PARK_PATHS, ...diagnoseGlobalSkillParkPaths()]
      : DIAGNOSE_CALLER_PARK_PATHS
  return parkAnswerKeys(repoRoot, paths, options)
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
