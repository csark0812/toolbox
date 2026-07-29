import { describe, expect, it } from 'vitest'
import { mkdtemp, writeFile, mkdir, readFile, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  mergeRowsByNorm,
  normalizeScenarioName,
  totalTokensFromRow,
} from '../scripts/lib/agent-test-artifacts.mjs'
import { writeComparisonReport } from '../scripts/lib/compare-agent-runs-core.mjs'
import { suiteReportFromSession } from '../scripts/lib/suite-report-from-session.mjs'

async function writeResultJson(debugDir, payload) {
  await mkdir(debugDir, { recursive: true })
  await writeFile(join(debugDir, 'result.json'), JSON.stringify(payload))
}

describe('normalizeScenarioName', () => {
  it('strips outcome: and transfer: band prefixes', () => {
    expect(normalizeScenarioName('outcome: founded session guard comparator')).toBe(
      'founded session guard comparator',
    )
    expect(normalizeScenarioName('transfer: founded session guard comparator')).toBe(
      'founded session guard comparator',
    )
  })

  it('strips slugified band prefixes and hash suffix', () => {
    expect(
      normalizeScenarioName('outcome-founded-session-guard-comparator-9e78173f'),
    ).toBe('founded session guard comparator')
    expect(
      normalizeScenarioName('transfer-founded-session-guard-comparato-1dd53178'),
    ).toBe('founded session guard comparato')
  })
})

describe('mergeRowsByNorm', () => {
  it('pairs outcome and transfer rows by normalized name', () => {
    const left = new Map([
      [
        'investigate-outcomes::outcome: founded session guard comparator',
        {
          suite: 'investigate-outcomes',
          scenario: 'outcome: founded session guard comparator',
          norm: 'founded session guard comparator',
          pass: true,
          durationMs: 35_100,
        },
      ],
    ])
    const right = new Map([
      [
        'investigate-transfer::transfer: founded session guard comparator',
        {
          suite: 'investigate-transfer',
          scenario: 'transfer: founded session guard comparator',
          norm: 'founded session guard comparator',
          pass: true,
          durationMs: 34_000,
        },
      ],
    ])
    const merged = mergeRowsByNorm(left, right, 'full', 'none')
    expect(merged).toHaveLength(1)
    expect(merged[0].full?.pass).toBe(true)
    expect(merged[0].none?.pass).toBe(true)
  })

  it('pairs rows by compareId when present', () => {
    const left = new Map([
      [
        'a::x',
        {
          suite: 'investigate-outcomes',
          scenario: 'outcome: foo',
          compareId: 'foo-id',
          norm: 'foo-id',
          pass: true,
        },
      ],
    ])
    const right = new Map([
      [
        'b::y',
        {
          suite: 'investigate-transfer',
          scenario: 'transfer: foo',
          compareId: 'foo-id',
          norm: 'foo-id',
          pass: true,
        },
      ],
    ])
    const merged = mergeRowsByNorm(left, right, 'full', 'none')
    expect(merged).toHaveLength(1)
    expect(merged[0].norm).toBe('foo-id')
  })
})

describe('totalTokensFromRow', () => {
  it('reads usage.total.totalTokens', () => {
    expect(
      totalTokensFromRow({
        usage: { total: { totalTokens: 42_000 } },
      }),
    ).toBe(42_000)
  })

  it('sums agent and judge when total absent', () => {
    expect(
      totalTokensFromRow({
        agentUsage: { totalTokens: 30_000 },
        judgeUsage: { totalTokens: 5_000 },
      }),
    ).toBe(35_000)
  })

  it('returns null when usage absent', () => {
    expect(totalTokensFromRow({})).toBeNull()
  })
})

describe('suiteReportFromSession', () => {
  it('builds SuiteRunReport from debug bundles', async () => {
    const root = await mkdtemp(join(tmpdir(), 'toolbox-suite-report-'))
    const session = join(root, 'session')
    await writeResultJson(join(session, 'investigate-outcomes', 'outcome-x.debug'), {
      suite: 'investigate-outcomes',
      scenario: 'outcome: fix invention pressure',
      compareId: 'fix-invention-pressure',
      passed: true,
      durationMs: 30_000,
      usage: { total: { totalTokens: 10_000 } },
    })

    const report = await suiteReportFromSession(session)
    expect(report.suite).toBe('investigate-outcomes')
    expect(report.results).toHaveLength(1)
    expect(report.results[0].compareId).toBe('fix-invention-pressure')
    expect(report.passed).toBe(1)
  })
})

describe('writeComparisonReport', () => {
  it('writes agent-test compare HTML with paired compareId rows', async () => {
    const root = await mkdtemp(join(tmpdir(), 'toolbox-compare-'))
    const leftSession = join(root, 'left')
    const rightSession = join(root, 'right')

    await writeResultJson(
      join(leftSession, 'investigate-outcomes', 'outcome-fix.debug'),
      {
        suite: 'investigate-outcomes',
        scenario: 'outcome: fix invention pressure',
        compareId: 'fix-invention-pressure',
        passed: true,
        durationMs: 30_000,
        usage: { total: { totalTokens: 10_000 } },
      },
    )
    await writeResultJson(
      join(leftSession, 'investigate-outcomes', 'outcome-leave.debug'),
      {
        suite: 'investigate-outcomes',
        scenario: 'outcome: leave redirect',
        compareId: 'leave-redirect',
        passed: true,
        durationMs: 20_000,
        usage: { total: { totalTokens: 5_000 } },
      },
    )
    await writeResultJson(
      join(rightSession, 'investigate-transfer', 'transfer-fix.debug'),
      {
        suite: 'investigate-transfer',
        scenario: 'transfer: fix invention pressure',
        compareId: 'fix-invention-pressure',
        passed: false,
        durationMs: 25_000,
        usage: { total: { totalTokens: 8_000 } },
      },
    )
    await writeResultJson(
      join(rightSession, 'investigate-transfer', 'transfer-leave.debug'),
      {
        suite: 'investigate-transfer',
        scenario: 'transfer: leave redirect',
        compareId: 'leave-redirect',
        passed: true,
        durationMs: 18_000,
        usage: { total: { totalTokens: 4_000 } },
      },
    )

    const reportDir = join(root, 'reports')
    const result = await writeComparisonReport({
      repoRoot: root,
      left: leftSession,
      right: rightSession,
      leftLabel: 'full',
      rightLabel: 'none',
      reportDir,
    })

    expect(result.comparable).toBe(2)
    expect(result.report.summary.pairedCount).toBe(2)
    expect(result.report.onlyInA).toEqual([])
    expect(result.report.onlyInB).toEqual([])

    await access(result.reportPath)
    await access(result.reportMdPath)
    const html = await readFile(result.reportPath, 'utf8')
    expect(html).toContain('fix-invention-pressure')
    expect(html).toContain('leave-redirect')

    const md = await readFile(result.reportMdPath, 'utf8')
    expect(md).toContain('Paired scenarios: 2')

    await access(result.aDumpPath)
    await access(result.bDumpPath)
  })
})
