import { describe, expect, it } from 'vitest'
import {
  DIAGNOSE_PARITY_COMPARE_PAIR,
  DIAGNOSE_PROMPT_COMPARE_PAIR,
  DIAGNOSE_OUTCOMES_SUITE,
  DIAGNOSE_TRANSFER_SUITE,
  DIAGNOSE_PROMPT_SUITE,
  compareReportPaths,
  costFromCompareReport,
  findParitySession,
  aggregateBatchD1,
} from '../scripts/lib/agent-test-artifacts.mjs'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const DIAGNOSE_SUITE_NAMES = {
  outcomesSuite: DIAGNOSE_OUTCOMES_SUITE,
  transferSuite: DIAGNOSE_TRANSFER_SUITE,
  promptSuite: DIAGNOSE_PROMPT_SUITE,
}

describe('compareReportPaths', () => {
  it('maps agent-test compare artifact names for diagnose suites', () => {
    const paths = compareReportPaths('/tmp/diagnose-1', DIAGNOSE_SUITE_NAMES)
    expect(paths.html).toBe('/tmp/diagnose-1/compare-report.html')
    expect(paths.suiteReports.outcomes).toBe('/tmp/diagnose-1/diagnose-outcomes.suite-report.json')
    expect(paths.suiteReports.transfer).toBe('/tmp/diagnose-1/diagnose-transfer.suite-report.json')
    expect(paths.suiteReports.prompt).toBe('/tmp/diagnose-1/diagnose-prompt.suite-report.json')
  })
})

describe('costFromCompareReport', () => {
  it('sums paired token usage for outcomes vs transfer arms', () => {
    const cost = costFromCompareReport({
      paired: [
        { a: { totalTokens: 10_000 }, b: { totalTokens: 8_000 } },
        { a: { totalTokens: 5_000 }, b: { totalTokens: 4_000 } },
      ],
    })
    expect(cost.full.totalTokens).toBe(15_000)
    expect(cost.none.totalTokens).toBe(12_000)
    expect(cost.deltaTokens).toBe(-3_000)
    expect(cost.full.scenarioCount).toBe(2)
  })
})

describe('findParitySession', () => {
  it('returns newest session with both diagnose suites when configured', async () => {
    const root = await mkdtemp(join(tmpdir(), 'toolbox-diagnose-parity-session-'))
    const sessionsParent = join(root, 'sessions')
    const older = join(sessionsParent, 'older')
    const newer = join(sessionsParent, 'newer')
    await mkdir(join(older, 'diagnose-outcomes', 'x.debug'), { recursive: true })
    await mkdir(join(newer, 'diagnose-outcomes', 'x.debug'), { recursive: true })
    await mkdir(join(newer, 'diagnose-transfer', 'y.debug'), { recursive: true })
    await writeFile(join(older, 'diagnose-outcomes', 'x.debug', 'result.json'), '{}')
    await writeFile(join(newer, 'diagnose-outcomes', 'x.debug', 'result.json'), '{}')
    await writeFile(join(newer, 'diagnose-transfer', 'y.debug', 'result.json'), '{}')

    const session = await findParitySession(sessionsParent, DIAGNOSE_SUITE_NAMES)
    expect(session?.name).toBe('newer')
  })
})

describe('DIAGNOSE_PARITY_COMPARE_PAIR', () => {
  it('matches diagnose evidence-parity suite names', () => {
    expect(DIAGNOSE_PARITY_COMPARE_PAIR).toBe('diagnose-outcomes:diagnose-transfer')
    expect(DIAGNOSE_PROMPT_COMPARE_PAIR).toBe('diagnose-outcomes:diagnose-prompt')
  })
})

describe('aggregateBatchD1', () => {
  it('counts D1 wins across diagnose batch manifests', () => {
    const agg = aggregateBatchD1([
      { d1: { fullPass: true, nonePass: false, promptPass: false } },
      { d1: { fullPass: false, nonePass: true, promptPass: true } },
      { d1: { fullPass: true, nonePass: true, promptPass: true } },
    ])
    expect(agg.d1FullWins).toBe(1)
    expect(agg.d1NoneWins).toBe(1)
    expect(agg.d1Ties).toBe(1)
    expect(agg.d1PromptBeatsFull).toBe(1)
    expect(agg.d1FullBeatsPrompt).toBe(1)
    expect(agg.runs).toBe(3)
  })
})
