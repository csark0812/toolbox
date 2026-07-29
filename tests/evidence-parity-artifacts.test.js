import { describe, expect, it } from 'vitest'
import {
  PARITY_COMPARE_PAIR,
  compareReportPaths,
  costFromCompareReport,
  findParitySession,
  aggregateBatchC1,
} from '../scripts/lib/agent-test-artifacts.mjs'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

describe('compareReportPaths', () => {
  it('maps agent-test compare artifact names', () => {
    const paths = compareReportPaths('/tmp/run-1')
    expect(paths.html).toBe('/tmp/run-1/compare-report.html')
    expect(paths.suiteReports.outcomes).toBe(
      '/tmp/run-1/investigate-outcomes.suite-report.json',
    )
    expect(paths.suiteReports.transfer).toBe(
      '/tmp/run-1/investigate-transfer.suite-report.json',
    )
    expect(paths.suiteReports.prompt).toBe(
      '/tmp/run-1/investigate-prompt.suite-report.json',
    )
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
    await mkdir(join(older, 'investigate-outcomes', 'x.debug'), { recursive: true })
    await mkdir(join(newer, 'investigate-outcomes', 'x.debug'), { recursive: true })
    await mkdir(join(newer, 'investigate-transfer', 'y.debug'), { recursive: true })
    await writeFile(join(older, 'investigate-outcomes', 'x.debug', 'result.json'), '{}')
    await writeFile(join(newer, 'investigate-outcomes', 'x.debug', 'result.json'), '{}')
    await writeFile(join(newer, 'investigate-transfer', 'y.debug', 'result.json'), '{}')

    const session = await findParitySession(sessionsParent)
    expect(session?.name).toBe('newer')
  })
})

describe('PARITY_COMPARE_PAIR', () => {
  it('matches evidence-parity suite names', () => {
    expect(PARITY_COMPARE_PAIR).toBe('investigate-outcomes:investigate-transfer')
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
