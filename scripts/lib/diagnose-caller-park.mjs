/**
 * Park diagnose answer keys off the open (caller) tree during null-arm live runs.
 *
 * Thin wrapper over shared caller-park with diagnose path list.
 *
 * Skill mirrors are listed *before* `diagnose/` so symlinks are unlinked while
 * still resolvable (lstat); parking the target first left dangling slugs that
 * `ls .agents/skills` still showed — agents then Read SKILL.md and failed
 * mustNotReadPath.
 *
 * Absolute home paths (opt-in via `parkGlobalSkills`) block Cursor from
 * re-injecting the global diagnose skill during null-arm runs.
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
  '.claude/skills/diagnose',
  '.agents/skills/diagnose',
  'diagnose',
  'agent-suites/diagnose',
  'agent-suites/diagnose-outcomes',
  'agent-suites/diagnose-outcomes-ceiling',
  'agent-suites/diagnose-transfer',
  'agent-suites/diagnose-prompt',
  'docs/evidence-parity.md',
  '_agent/diagnose-null-arm-hygiene.patch',
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
    join(home, '.agents', 'skills', 'diagnose'),
    join(home, '.claude', 'skills', 'diagnose'),
    join(home, '.cursor', 'skills', 'diagnose'),
    join(home, '.codex', 'skills', 'diagnose'),
  ]
}

const PARK_COMMIT_MESSAGE = 'agent-test: temporary diagnose answer-key park'

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
