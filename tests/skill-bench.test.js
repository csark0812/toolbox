import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EXPECTED_SKILLS } from '../src/expected-skills.ts'
import {
  blindingLeaks,
  degrade,
  maskSkillNames,
  parseVerdict,
  planPairs,
  renderRun,
} from '../scripts/lib/skill-bench-material.mjs'
import { buildReport } from '../scripts/skill-bench-report.mjs'

const root = join(import.meta.dirname, '..')
const { tasks } = JSON.parse(
  readFileSync(join(root, 'agent-suites/skill-bench/tasks.json'), 'utf8'),
)
const scenarioOf = (task) =>
  JSON.parse(readFileSync(join(root, `agent-suites/${task.suite}/claims.json`), 'utf8')).scenarios[
    task.scenario - 1
  ]

const run = (overrides = {}) => ({
  task: 't1',
  arm: 'full',
  repetition: 0,
  id: 't1|full|0',
  output: 'Fixed the comparison and ran the tests.',
  diff: '-  return expiresAt >= now\n+  return expiresAt > now',
  commits: 'abc123 fix: expiry boundary',
  toolCalls: [
    { name: 'Read', args: { file_path: '.claude/skills/hillclimb/SKILL.md' } },
    { name: 'Bash', args: { command: 'node --test' } },
  ],
  hardCheck: { passed: true, failure: null },
  ...overrides,
})

describe('skill bench blinding', () => {
  it('flags measurement words as whole words only', () => {
    expect(blindingLeaks('Please evaluate the candidate against the rubric')).toEqual([
      'rubric',
      'candidate',
    ])
    expect(blindingLeaks('Make the benchmark faster and retrieve evaluated values')).toEqual([])
  })

  for (const task of tasks)
    it(`${task.id} prompt, criteria owner and workspace framing reveal no measurement`, () => {
      const scenario = scenarioOf(task)
      expect(scenario, `${task.suite} scenario ${task.scenario}`).toBeTruthy()
      const prompt = task.prompt ?? scenario.prompt
      expect(blindingLeaks(prompt)).toEqual([])
      expect(prompt).not.toMatch(new RegExp(`\\b${task.targetSkill}\\b`))
      expect(EXPECTED_SKILLS).toContain(task.targetSkill)
      expect(task.criteria.length).toBeGreaterThanOrEqual(3)
      expect(task.criteria.length).toBeLessThanOrEqual(6)
    })

  it('masks skill and pack names without mangling ordinary words', () => {
    const names = ['hillclimb', 'how', 'babysit-pr', 'poteto-mode']
    const masked = maskSkillNames(
      'I used the hillclimb skill via /poteto-mode and babysit-pr. This is how it works. pstack too.',
      names,
    )
    expect(masked).toBe(
      'I used the <skill> skill via <skill> and <skill>. This is how it works. <skill> too.',
    )
  })

  it('the judge view names no arm, skill or model', () => {
    const view = renderRun(run({ output: 'Ran the hillclimb skill.' }), 'A', {
      skillNames: ['hillclimb'],
    })
    expect(view).not.toMatch(/full|none|hillclimb|only:|without:|opus|codex/i)
    expect(view).toContain('.claude/skills/<skill>')
    expect(view).toContain('node --test')
  })
})

describe('skill bench pairs and controls', () => {
  it('pairs every run of one arm with every run of another within a task', () => {
    const runs = [
      run({ arm: 'none', repetition: 0 }),
      run({ arm: 'none', repetition: 1 }),
      run({ arm: 'full', repetition: 0 }),
      run({ arm: 'full', repetition: 1 }),
      run({ task: 't2', arm: 'none' }),
    ]
    const pairs = planPairs(runs, ['full', 'none'])
    expect(pairs).toHaveLength(4)
    expect(new Set(pairs.map((pair) => pair.pairId)).size).toBe(4)
    expect(pairs.every((pair) => pair.task === 't1')).toBe(true)
  })

  it('matched mode pairs equal repetitions only', () => {
    const runs = [0, 1].flatMap((repetition) => [
      run({ arm: 'none', repetition }),
      run({ arm: 'full', repetition }),
    ])
    const pairs = planPairs(runs, ['full', 'none'], { matched: true })
    expect(pairs.map((pair) => pair.pairId)).toEqual(['t1|full|0~t1|none|0', 't1|full|1~t1|none|1'])
  })

  it('a degraded twin has no work, no actions and a failed check', () => {
    const twin = degrade(run())
    expect(twin.id).toBe('t1|full|0|degraded')
    expect(twin.diff).toBe('')
    expect(twin.toolCalls).toEqual([])
    expect(twin.hardCheck.passed).toBe(false)
  })

  it('parses the last verdict object and rejects a bad winner', () => {
    expect(parseVerdict('notes {"winner":"A"} then {"scoreA":4,"scoreB":2,"winner":"A"}')).toEqual({
      scoreA: 4,
      scoreB: 2,
      winner: 'A',
    })
    expect(() => parseVerdict('{"winner":"C"}')).toThrow(/bad winner/)
    expect(
      parseVerdict(
        '{"scoreA":4,"scoreB":3,"winner":"A","reasons":["uses `{ kind: \\"done\\" }` model"]}',
      ),
    ).toMatchObject({ winner: 'A', scoreA: 4 })
  })
})

describe('skill bench report', () => {
  const tasks = [{ id: 't1', targetSkill: 'hillclimb' }]
  const judgments = [
    { pairId: 'p', task: 't1', first: 't1|full|0', second: 't1|none|0', winner: 'first' },
    { pairId: 'p', task: 't1', first: 't1|none|0', second: 't1|full|0', winner: 'second' },
  ]

  it('never pairs or counts infrastructure exclusions', () => {
    const report = buildReport({
      runs: [
        run({ arm: 'none' }),
        run(),
        { task: 't1', arm: 'none', repetition: 1, infrastructure: 'escape' },
      ],
      tasks,
      judgments,
    })
    expect(report.excluded).toBe(1)
    expect(report.rows[0].verdict).toBe('signal only (1 run per arm)')
  })

  it('reports median tokens and time beside the verdict', () => {
    const report = buildReport({
      runs: [
        run({ arm: 'none', tokens: 300, durationMs: 9000 }),
        run({ tokens: 100, durationMs: 3000 }),
      ],
      tasks,
      judgments,
    })
    expect(report.rows[0].cost).toEqual({
      tokens: { focus: 100, other: 300 },
      seconds: { focus: 3, other: 9 },
    })
  })

  it('labels fewer than four runs per arm as signal only', () => {
    const report = buildReport({ runs: [run({ arm: 'none' }), run()], tasks, judgments })
    expect(report.rows[0]).toMatchObject({
      focus: 'full',
      wins: 1,
      verdict: 'signal only (1 run per arm)',
    })
  })

  it('withholds verdicts when the judge has no identical-pair control', () => {
    const runs = [0, 1, 2, 3].flatMap((repetition) => [
      run({ arm: 'none', repetition }),
      run({ repetition }),
    ])
    const report = buildReport({ runs, tasks, judgments })
    expect(report.health.healthy).toBe(false)
    expect(report.rows[0]).toMatchObject({ skill: 'hillclimb', verdict: 'withheld' })
  })
})
