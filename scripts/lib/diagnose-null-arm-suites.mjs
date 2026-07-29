/**
 * Materialize null-arm suite JSON under $TMPDIR (outside the IDE-open tree)
 * with an absolute seedPatch so agent-test can apply hygiene after caller park.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

/**
 * @param {string} repoRoot
 * @param {'diagnose-transfer' | 'diagnose-prompt'} suiteName
 * @param {string} absoluteSeedPath
 * @returns {{ suitesDir: string, suiteDir: string }}
 */
export function materializeNullArmSuite(repoRoot, suiteName, absoluteSeedPath) {
	const src = join(repoRoot, 'agent-suites', suiteName, 'scenarios.json')
	const suitesDir = join(
		tmpdir(),
		`toolbox-diagnose-null-suites-${suiteName}-${Date.now()}`,
	)
	const suiteDir = join(suitesDir, suiteName)
	mkdirSync(suiteDir, { recursive: true })
	const doc = JSON.parse(readFileSync(src, 'utf8'))
	for (const scenario of doc.scenarios ?? []) {
		scenario.seedPatch = absoluteSeedPath
		// Replay paths are unused on --live; drop absolute leakage into agent forage via suite file.
		delete scenario.replayTrace
	}
	writeFileSync(join(suiteDir, 'scenarios.json'), `${JSON.stringify(doc, null, '\t')}\n`)
	return { suitesDir, suiteDir }
}
