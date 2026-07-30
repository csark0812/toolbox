import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const promptPath = join(root, 'agent-suites/investigate-prompt/scenarios.json')
const outcomePath = join(root, 'agent-suites/investigate-outcomes/scenarios.json')
const transferPath = join(root, 'agent-suites/investigate-transfer/scenarios.json')

const HYGIENE_SEED = '_agent/investigate-null-arm-hygiene.patch'

/** Investigate-protocol phrases that should not appear in the prompt baseline arm. */
const PROMPT_LEAKAGE = [
	/SKILL\.md/i,
	/\.claude\/skills\/investigate/i,
	/falsifiable hypotheses/i,
	/kill tests?/i,
	/confirmatory (reading|forage)/i,
	/leave after dead forage/i,
	/discriminating checks?/i,
	/re-?rank/i,
	/forage/i,
	/mustInvokeSkill/i,
	/fix.?invention/i,
	/leave.?redirect/i,
]

describe('investigate prompt baseline', () => {
	const prompt = JSON.parse(readFileSync(promptPath, 'utf8'))
	const outcome = JSON.parse(readFileSync(outcomePath, 'utf8'))
	const transfer = JSON.parse(readFileSync(transferPath, 'utf8'))

	it('pairs every outcome scenario with a prompt row by compareId', () => {
		const outcomeIds = outcome.scenarios.map((s) => s.compareId).sort()
		const promptIds = prompt.scenarios.map((s) => s.compareId).sort()
		expect(promptIds).toEqual(outcomeIds)
	})

	it('prompt arm uses skills:none defaults', () => {
		expect(prompt.defaults.skills).toBe('none')
	})

	it('prompt prompts do not leak investigate skill protocol language', () => {
		for (const scenario of prompt.scenarios) {
			for (const pattern of PROMPT_LEAKAGE) {
				expect(scenario.prompt, `${scenario.name}: ${pattern}`).not.toMatch(pattern)
			}
			expect(scenario.name, scenario.name).not.toMatch(/fix.?invention|leave.?redirect/i)
		}
	})

	it('prompt fix-invention includes explicit verdict-without-patch instructions', () => {
		const fix = prompt.scenarios.find((s) => s.compareId === 'fix-invention-pressure')
		expect(fix.prompt).toMatch(/file:line/i)
		expect(fix.prompt).toMatch(/Do not put code edits/i)
	})

	it('prompt and transfer share hygiene seed and replayTrace with outcomes', () => {
		for (const compareId of outcome.scenarios.map((s) => s.compareId)) {
			const outcomeRow = outcome.scenarios.find((s) => s.compareId === compareId)
			const promptRow = prompt.scenarios.find((s) => s.compareId === compareId)
			const transferRow = transfer.scenarios.find((s) => s.compareId === compareId)
			expect(promptRow.seedPatch).toBe(HYGIENE_SEED)
			expect(transferRow.seedPatch).toBe(HYGIENE_SEED)
			expect(promptRow.replayTrace).toBe(outcomeRow.replayTrace)
			expect(transferRow.replayTrace).toBe(outcomeRow.replayTrace)
			expect(promptRow.rubric.mustNotReadPath?.length ?? 0).toBeGreaterThan(0)
		}
	})
})
