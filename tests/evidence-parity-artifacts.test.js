import { describe, expect, it } from 'vitest'
import {
  PARITY_COMPARE_PAIR,
  DIAGNOSE_PARITY_COMPARE_PAIR,
  DIAGNOSE_PROMPT_COMPARE_PAIR,
  DIAGNOSE_OUTCOMES_SUITE,
  DIAGNOSE_TRANSFER_SUITE,
  DIAGNOSE_PROMPT_SUITE,
  compareReportPaths,
  costFromCompareReport,
  findParitySession,
  aggregateBatchC1,
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
  it('maps agent-test compare artifact names', () => {
    const paths = compareReportPaths('/tmp/run-1')
    expect(paths.html).toBe('/tmp/run-1/compare-report.html')
    expect(paths.suiteReports.outcomes).toBe('/tmp/run-1/probe-evidence-outcomes.suite-report.json')
    expect(paths.suiteReports.transfer).toBe('/tmp/run-1/probe-evidence-transfer.suite-report.json')
    expect(paths.suiteReports.prompt).toBe('/tmp/run-1/probe-evidence-prompt.suite-report.json')
  })

  it('resolves diagnose suite-report paths when suite names are passed', () => {
    const paths = compareReportPaths('/tmp/diagnose-1', DIAGNOSE_SUITE_NAMES)
    expect(paths.suiteReports.outcomes).toBe('/tmp/diagnose-1/probe-fix-outcomes.suite-report.json')
    expect(paths.suiteReports.transfer).toBe('/tmp/diagnose-1/probe-fix-transfer.suite-report.json')
    expect(paths.suiteReports.prompt).toBe('/tmp/diagnose-1/probe-fix-prompt.suite-report.json')
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
  it('returns newest session with both investigate suites', async () => {
    const root = await mkdtemp(join(tmpdir(), 'toolbox-parity-session-'))
    const sessionsParent = join(root, 'sessions')
    const older = join(sessionsParent, 'older')
    const newer = join(sessionsParent, 'newer')
    await mkdir(join(older, 'probe-evidence-outcomes', 'x.debug'), { recursive: true })
    await mkdir(join(newer, 'probe-evidence-outcomes', 'x.debug'), { recursive: true })
    await mkdir(join(newer, 'probe-evidence-transfer', 'y.debug'), { recursive: true })
    await writeFile(join(older, 'probe-evidence-outcomes', 'x.debug', 'result.json'), '{}')
    await writeFile(join(newer, 'probe-evidence-outcomes', 'x.debug', 'result.json'), '{}')
    await writeFile(join(newer, 'probe-evidence-transfer', 'y.debug', 'result.json'), '{}')

    const session = await findParitySession(sessionsParent)
    expect(session?.name).toBe('newer')
  })

  it('returns newest session with both diagnose suites when configured', async () => {
    const root = await mkdtemp(join(tmpdir(), 'toolbox-diagnose-parity-session-'))
    const sessionsParent = join(root, 'sessions')
    const older = join(sessionsParent, 'older')
    const newer = join(sessionsParent, 'newer')
    await mkdir(join(older, 'probe-fix-outcomes', 'x.debug'), { recursive: true })
    await mkdir(join(newer, 'probe-fix-outcomes', 'x.debug'), { recursive: true })
    await mkdir(join(newer, 'probe-fix-transfer', 'y.debug'), { recursive: true })
    await writeFile(join(older, 'probe-fix-outcomes', 'x.debug', 'result.json'), '{}')
    await writeFile(join(newer, 'probe-fix-outcomes', 'x.debug', 'result.json'), '{}')
    await writeFile(join(newer, 'probe-fix-transfer', 'y.debug', 'result.json'), '{}')

    const session = await findParitySession(sessionsParent, DIAGNOSE_SUITE_NAMES)
    expect(session?.name).toBe('newer')
  })
})

describe('PARITY_COMPARE_PAIR', () => {
  it('matches evidence-parity suite names', () => {
    expect(PARITY_COMPARE_PAIR).toBe('probe-evidence-outcomes:probe-evidence-transfer')
  })
})

describe('DIAGNOSE_PARITY_COMPARE_PAIR', () => {
  it('matches diagnose evidence-parity suite names', () => {
    expect(DIAGNOSE_PARITY_COMPARE_PAIR).toBe('probe-fix-outcomes:probe-fix-transfer')
    expect(DIAGNOSE_PROMPT_COMPARE_PAIR).toBe('probe-fix-outcomes:probe-fix-prompt')
  })
})

describe('aggregateBatchC1', () => {
  it('counts C1 wins across batch manifests', () => {
    const agg = aggregateBatchC1([
      { c1: { fullPass: true, nonePass: false, promptPass: false } },
      { c1: { fullPass: false, nonePass: true, promptPass: true } },
      { c1: { fullPass: true, nonePass: true, promptPass: true } },
    ])
    expect(agg.c1FullWins).toBe(1)
    expect(agg.c1NoneWins).toBe(1)
    expect(agg.c1Ties).toBe(1)
    expect(agg.c1PromptBeatsFull).toBe(1)
    expect(agg.c1FullBeatsPrompt).toBe(1)
    expect(agg.runs).toBe(3)
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
