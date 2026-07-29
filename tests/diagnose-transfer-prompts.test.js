import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(import.meta.dirname, '..')
const transferPath = join(root, 'agent-suites/diagnose-transfer/scenarios.json')
const outcomePath = join(root, 'agent-suites/diagnose-outcomes/scenarios.json')

const HYGIENE_SEED =
	'agent-suites/diagnose-outcomes/fixtures/seeds/null-arm-hygiene.patch'

/** Diagnose-protocol phrases that should not appear in the null (transfer) arm. */
const TRANSFER_LEAKAGE = [
	/SKILL\.md/i,
	/\.claude\/skills\/diagnose/i,
	/Read `.claude\/skills\/diagnose/i,
	/Diagnose with the diagnose skill/i,
	/Diagnose it\./i,
	/no repro refuse/i,
	/loop before cause/i,
]

describe('diagnose transfer null baseline', () => {
	const transfer = JSON.parse(readFileSync(transferPath, 'utf8'))
	const outcome = JSON.parse(readFileSync(outcomePath, 'utf8'))

	it('pairs every outcome scenario with a transfer row by compareId', () => {
		const outcomeIds = outcome.scenarios.map((s) => s.compareId).sort()
		const transferIds = transfer.scenarios.map((s) => s.compareId).sort()
		expect(transferIds).toEqual(outcomeIds)
	})

	it('transfer defaults to skills:none', () => {
		expect(transfer.defaults.skills).toBe('none')
	})

	it('transfer prompts do not leak diagnose skill framing', () => {
		for (const scenario of transfer.scenarios) {
			for (const pattern of TRANSFER_LEAKAGE) {
				expect(scenario.prompt, `${scenario.name}: ${pattern}`).not.toMatch(pattern)
			}
			expect(scenario.name, scenario.name).not.toMatch(/no.?repro|refuse|loop.?before/i)
		}
	})

	it('outcome prompts require reading the diagnose skill', () => {
		for (const scenario of outcome.scenarios) {
			expect(scenario.prompt).toMatch(/\.claude\/skills\/diagnose\/SKILL\.md/)
		}
	})

	it('outcome arm still requires diagnose invocation', () => {
		for (const scenario of outcome.scenarios) {
			expect(scenario.rubric.mustInvokeSkill).toEqual(['diagnose'])
		}
	})

	it('transfer uses null-arm hygiene seed; outcomes do not', () => {
		for (const scenario of outcome.scenarios) {
			expect(scenario.seedPatch, scenario.name).toBeUndefined()
		}
		for (const scenario of transfer.scenarios) {
			expect(scenario.seedPatch, scenario.name).toBe(HYGIENE_SEED)
			expect(scenario.rubric.mustNotReadPath?.length ?? 0).toBeGreaterThan(0)
		}
	})

	it('shared replayTrace paths match per compareId', () => {
		for (const compareId of outcome.scenarios.map((s) => s.compareId)) {
			const outcomeRow = outcome.scenarios.find((s) => s.compareId === compareId)
			const transferRow = transfer.scenarios.find((s) => s.compareId === compareId)
			expect(transferRow.replayTrace).toBe(outcomeRow.replayTrace)
		}
	})
})
