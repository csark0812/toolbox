/**
 * Materialize null-arm suite JSON under `_agent/null-arm-suites/` (gitignored).
 *
 * agent-test preflight does `join(repoRoot, suitesDir)`, so `--suites-dir` must be
 * relative. After a park-commit, diagnose omits seedPatch (HEAD already lacks answer
 * keys). Investigate passes per-compareId guard-only seeds from outside the tree.
 * Strip `judge` from on-disk rubric so forage of this file cannot crib the LLM
 * criterion; keep lexical must/mustNot/mustNotReadPath for harness settlement.
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
 *   seedByCompareId?: Record<string, string>,
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
	for (const scenario of doc.scenarios ?? []) {
		const byId =
			scenario.compareId && options.seedByCompareId
				? options.seedByCompareId[scenario.compareId]
				: undefined
		if (options.omitSeed) {
			delete scenario.seedPatch
		} else if (byId) {
			scenario.seedPatch = byId
		} else if (absoluteSeedPath) {
			scenario.seedPatch = absoluteSeedPath
		} else {
			delete scenario.seedPatch
		}
		delete scenario.replayTrace
		if (scenario.rubric && typeof scenario.rubric === 'object') {
			delete scenario.rubric.judge
		}
	}
	writeFileSync(join(suiteDir, 'scenarios.json'), `${JSON.stringify(doc, null, '\t')}\n`)
	return {
		suitesDir,
		suitesDirArg: relative(repoRoot, suitesDir),
		suiteDir,
	}
}
