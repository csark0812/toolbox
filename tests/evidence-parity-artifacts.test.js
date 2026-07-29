import { describe, expect, it } from 'vitest'
import {
  PARITY_COMPARE_PAIR,
  compareReportPaths,
  costFromCompareReport,
  findParitySession,
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
