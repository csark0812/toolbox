/**
 * Materialize null-arm suite JSON under `_agent/null-arm-suites/` (gitignored).
 *
 * agent-test preflight does `join(repoRoot, suitesDir)`, so `--suites-dir` must be
 * relative. After a park-commit, omit answer-bearing seedPatch (HEAD already lacks
 * keys). Strip `judge` and `mustNotReadPath` from on-disk rubric so forage of this
 * file cannot crib the LLM criterion or teach forbidden skill paths; keep lexical
 * must/mustNot for harness settlement. Optional `extraMustNot` adds skill-body
 * crib phrases (successful skill content) without naming SKILL.md paths.
 *
 * Investigate null arms still need guard-only debug-app seeds — pass
 * `seedPatchByCompareId` (relative paths under `_agent/`, no answer-key hunks).
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * @param {string} repoRoot
 * @param {string} suiteName
 * @param {string | null} absoluteSeedPath
 * @param {{
 *   scenariosPath?: string,
 *   scenariosJson?: string | Buffer,
 *   omitSeed?: boolean,
 *   seedPatchByCompareId?: Record<string, string>,
 *   omitMustNotReadPath?: boolean,
 *   extraMustNot?: string[],
 * }} [options]
 * @returns {{ suitesDir: string, suitesDirArg: string, suiteDir: string }}
 */
export function materializeNullArmSuite(repoRoot, suiteName, absoluteSeedPath, options = {}) {
  const srcText = options.scenariosJson
    ? String(options.scenariosJson)
    : readFileSync(
        options.scenariosPath ?? join(repoRoot, 'agent-suites', suiteName, 'scenarios.json'),
        'utf8',
      )
  const suitesDir = join(repoRoot, '_agent', 'null-arm-suites', `${suiteName}-${Date.now()}`)
  const suiteDir = join(suitesDir, suiteName)
  mkdirSync(suiteDir, { recursive: true })
  const doc = JSON.parse(srcText)
  const byCompareId = options.seedPatchByCompareId ?? null
  const omitMustNotReadPath = options.omitMustNotReadPath !== false
  const extraMustNot = options.extraMustNot ?? []
  for (const scenario of doc.scenarios ?? []) {
    if (byCompareId && scenario.compareId && byCompareId[scenario.compareId]) {
      scenario.seedPatch = byCompareId[scenario.compareId]
    } else if (options.omitSeed || !absoluteSeedPath) {
      delete scenario.seedPatch
    } else {
      scenario.seedPatch = absoluteSeedPath
    }
    if (scenario.rubric && typeof scenario.rubric === 'object') {
      delete scenario.rubric.judge
      if (omitMustNotReadPath) {
        delete scenario.rubric.mustNotReadPath
      }
      if (extraMustNot.length > 0) {
        const existing = Array.isArray(scenario.rubric.mustNot) ? scenario.rubric.mustNot : []
        scenario.rubric.mustNot = [...new Set([...existing, ...extraMustNot])]
      }
    }
  }
  writeFileSync(join(suiteDir, 'scenarios.json'), `${JSON.stringify(doc, null, '\t')}\n`)
  return {
    suitesDir,
    suitesDirArg: relative(repoRoot, suitesDir),
    suiteDir,
  }
}
