import { describe, expect, it } from 'vitest'
import {
  clusterBootstrap,
  contrastOutcomes,
  judgeHealth,
  mulberry32,
  resolveOrders,
  verdict,
  winRate,
} from '../scripts/lib/ui-bench-stats.mjs'

const run = (task, arm, rep) => `${task}|${arm}|${rep}`

/** Cross-paired skill-vs-one-liner rows where each pair is won independently with probability p. */
function syntheticRows({ p, tasks = 5, reps = 6, seed = 7 }) {
  const random = mulberry32(seed)
  const rows = []
  for (let t = 0; t < tasks; t++)
    for (let i = 0; i < reps; i++)
      for (let j = 0; j < reps; j++)
        rows.push({
          task: `t${t}`,
          focusRun: run(`t${t}`, 'skill', i),
          otherRun: run(`t${t}`, 'one-liner', j),
          outcome: random() < p ? 'win' : 'loss',
        })
  return rows
}

function decide(rows, defects = { focus: 0, other: 0 }) {
  const { rate } = winRate(rows)
  const repeats = new Set(rows.map((row) => row.focusRun.split('|')[2])).size
  return verdict({ rate, repeats, ...clusterBootstrap(rows, { samples: 2000 }) }, defects)
}

describe('ui-bench order resolution', () => {
  it('counts a winner only when both shown orders agree', () => {
    const a = run('t', 'skill', 0)
    const b = run('t', 'one-liner', 0)
    const agree = resolveOrders([
      { pairId: 'p', task: 't', first: a, second: b, winner: 'first' },
      { pairId: 'p', task: 't', first: b, second: a, winner: 'second' },
    ])
    expect(agree[0].winner).toBe(a)
    const disagree = resolveOrders([
      { pairId: 'p', task: 't', first: a, second: b, winner: 'first' },
      { pairId: 'p', task: 't', first: b, second: a, winner: 'first' },
    ])
    expect(disagree[0].winner).toBe('tie')
  })

  it('maps resolved pairs onto the requested contrast', () => {
    const a = run('t', 'skill', 0)
    const b = run('t', 'none', 0)
    const rows = contrastOutcomes(
      [{ pairId: 'p', task: 't', a, b, winner: b, complete: true }],
      'skill',
      'none',
    )
    expect(rows).toEqual([{ task: 't', focusRun: a, otherRun: b, outcome: 'loss' }])
    expect(
      contrastOutcomes([{ pairId: 'p', task: 't', a, b, winner: b }], 'skill', 'one-liner'),
    ).toEqual([])
  })
})

describe('ui-bench verdict', () => {
  it('calls a true 75% win rate over 5 tasks × 6 repeats better', () => {
    expect(decide(syntheticRows({ p: 0.75 }))).toBe('better')
  })

  it('calls a clearly losing skill not better', () => {
    expect(decide(syntheticRows({ p: 0.4 }))).toBe('not-better')
  })

  it('never decides before 4 repeats, even on a lucky 80% sample', () => {
    const rows = syntheticRows({ p: 0.7, reps: 2, seed: 7 })
    expect(winRate(rows).rate).toBe(0.8)
    expect(decide(rows)).toBe('inconclusive')
  })

  it('stays inconclusive on a 65% observed rate with 4 repeats', () => {
    expect(decide(syntheticRows({ p: 0.62, reps: 4, seed: 11 }))).toBe('inconclusive')
  })

  it('refuses better when the skill arm has more hard-check defects', () => {
    expect(decide(syntheticRows({ p: 0.75 }), { focus: 3, other: 1 })).toBe('inconclusive')
  })

  it('widens the interval when outcomes are driven by shared runs', () => {
    const independent = syntheticRows({ p: 0.6, reps: 4 })
    // Same marginal rate, but each skill run either wins all its pairs or none.
    const random = mulberry32(3)
    const runQuality = new Map()
    const clustered = independent.map((row) => {
      if (!runQuality.has(row.focusRun)) runQuality.set(row.focusRun, random() < 0.6)
      return { ...row, outcome: runQuality.get(row.focusRun) ? 'win' : 'loss' }
    })
    const width = (rows) => {
      const { lower, upper } = clusterBootstrap(rows, { samples: 2000 })
      return upper - lower
    }
    expect(width(clustered)).toBeGreaterThan(width(independent))
  })
})

describe('ui-bench judge health', () => {
  const a = run('t', 'skill', 0)
  const b = run('t', 'one-liner', 0)

  it('flags a judge that always prefers the first image', () => {
    const judgments = Array.from({ length: 10 }, (_, index) => ({
      pairId: `p${index}`,
      task: 't',
      first: index % 2 ? a : b,
      second: index % 2 ? b : a,
      winner: 'first',
    }))
    const health = judgeHealth(judgments)
    expect(health.checks.find((check) => check.name === 'position bias').ok).toBe(false)
    expect(health.healthy).toBe(false)
  })

  it('treats missing controls as unhealthy, not as passing', () => {
    const judgments = [
      { pairId: 'p', task: 't', first: a, second: b, winner: 'first' },
      { pairId: 'p', task: 't', first: b, second: a, winner: 'second' },
    ]
    expect(judgeHealth(judgments).healthy).toBe(false)
    const withControls = [
      ...judgments,
      { pairId: 'i', task: 't', first: a, second: a, winner: 'tie', control: 'identical' },
      ...Array.from({ length: 5 }, (_, index) => ({
        pairId: `k${index}`,
        task: 't',
        first: 'clean',
        second: 'broken',
        winner: 'first',
        expected: 'clean',
        control: 'known-gap',
      })),
    ]
    expect(judgeHealth(withControls).healthy).toBe(true)
  })
})
