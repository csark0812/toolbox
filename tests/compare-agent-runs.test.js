import { describe, expect, it } from 'vitest'
import { mkdtemp, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  mergeRowsByNorm,
  normalizeScenarioName,
  totalTokensFromRow,
} from '../scripts/lib/agent-test-artifacts.mjs'
import { writeComparisonReport } from '../scripts/lib/compare-agent-runs-core.mjs'

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

describe('writeComparisonReport', () => {
  it('includes token columns and comparable pairing', async () => {
    const root = await mkdtemp(join(tmpdir(), 'toolbox-compare-'))
    const leftSession = join(root, 'left')
    const rightSession = join(root, 'right')
    const leftDebug = join(leftSession, 'investigate-outcomes', 'outcome-x.debug')
    const rightDebug = join(rightSession, 'investigate-transfer', 'transfer-x.debug')
    await mkdir(leftDebug, { recursive: true })
    await mkdir(rightDebug, { recursive: true })
    await writeFile(
      join(leftDebug, 'result.json'),
      JSON.stringify({
        suite: 'investigate-outcomes',
        scenario: 'outcome: founded session guard comparator',
        compareId: 'founded-session-guard',
        passed: true,
        durationMs: 30_000,
        usage: { total: { totalTokens: 10_000 } },
      }),
    )
    await writeFile(
      join(rightDebug, 'result.json'),
      JSON.stringify({
        suite: 'investigate-transfer',
        scenario: 'transfer: founded session guard comparator',
        compareId: 'founded-session-guard',
        passed: true,
        durationMs: 25_000,
        usage: { total: { totalTokens: 8_000 } },
      }),
    )

    const { body, comparable } = await writeComparisonReport({
      repoRoot: root,
      left: leftSession,
      right: rightSession,
      leftLabel: 'full',
      rightLabel: 'none',
      align: 'normalized',
      reportDir: join(root, 'reports'),
    })
    expect(comparable).toBe(1)
    expect(body).toContain('Comparable scenarios: 1')
    expect(body).toContain('full tok')
    expect(body).toContain('Δ tok')
    expect(body).toContain('Token delta')
  })
})
