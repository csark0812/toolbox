/**
 * Materialize null-arm suite JSON under `_agent/null-arm-suites/` (gitignored).
 *
 * agent-test preflight does `join(repoRoot, suitesDir)`, so `--suites-dir` must be
 * relative. After a park-commit, omit seedPatch (HEAD already lacks answer keys).
 * Strip `judge` from on-disk rubric so forage of this file cannot crib the LLM
 * criterion; keep lexical must/mustNot/mustNotReadPath for harness settlement.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * @param {string} repoRoot
 * @param {'diagnose-transfer' | 'diagnose-prompt'} suiteName
 * @param {string | null} absoluteSeedPath
 * @param {{ scenariosPath?: string, omitSeed?: boolean }} [options]
 * @returns {{ suitesDir: string, suitesDirArg: string, suiteDir: string }}
 */
export function materializeNullArmSuite(repoRoot, suiteName, absoluteSeedPath, options = {}) {
	const src =
		options.scenariosPath ?? join(repoRoot, 'agent-suites', suiteName, 'scenarios.json')
	const suitesDir = join(repoRoot, '_agent', 'null-arm-suites', `${suiteName}-${Date.now()}`)
	const suiteDir = join(suitesDir, suiteName)
	mkdirSync(suiteDir, { recursive: true })
	const doc = JSON.parse(readFileSync(src, 'utf8'))
	for (const scenario of doc.scenarios ?? []) {
		if (options.omitSeed || !absoluteSeedPath) {
			delete scenario.seedPatch
		} else {
			scenario.seedPatch = absoluteSeedPath
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
