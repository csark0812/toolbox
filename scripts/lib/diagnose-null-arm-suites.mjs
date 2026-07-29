/**
 * Materialize null-arm suite JSON under `_agent/null-arm-suites/` (gitignored).
 *
 * agent-test preflight does `join(repoRoot, suitesDir)`, so `--suites-dir` must be
 * relative (absolute $TMPDIR paths resolve incorrectly). Seed stays absolute under
 * $TMPDIR so parked/null arms cannot forage deleted hunk text via `_agent/`.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'

/**
 * @param {string} repoRoot
 * @param {'diagnose-transfer' | 'diagnose-prompt'} suiteName
 * @param {string} absoluteSeedPath
 * @param {{ scenariosPath?: string }} [options]
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
		scenario.seedPatch = absoluteSeedPath
		// Replay paths are unused on --live; drop paths that invite forage.
		delete scenario.replayTrace
	}
	writeFileSync(join(suiteDir, 'scenarios.json'), `${JSON.stringify(doc, null, '\t')}\n`)
	return {
		suitesDir,
		suitesDirArg: relative(repoRoot, suitesDir),
		suiteDir,
	}
}
