import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EXPECTED_SKILLS } from '../src/expected-skills.ts'
import {
  blindingLeaks,
  checksDir,
  degrade,
  HELD_OUT_SETS,
  maskSkillNames,
  parseVerdict,
  planPairs,
  renderRun,
} from '../scripts/lib/skill-bench-material.mjs'
import { ALL_TASKS, buildReport, strongClaim } from '../scripts/skill-bench-report.mjs'

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
      const scenario = task.claim ?? scenarioOf(task)
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

  it('counts only tasks this bench ran when a skill also targets other tasks', () => {
    const report = buildReport({
      runs: [run({ arm: 'none' }), run()],
      tasks: [...tasks, { id: 'not-run', targetSkill: 'hillclimb' }],
      judgments,
    })
    expect(report.rows[0].repeats).toBe(1)
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

const heldOut = HELD_OUT_SETS.filter((set) =>
  existsSync(join(root, `agent-suites/skill-bench/${set}.lock.json`)),
).map((set) => ({
  set,
  tasks: JSON.parse(readFileSync(join(root, `agent-suites/skill-bench/${set}.json`), 'utf8')).tasks,
}))

for (const { set, tasks: frozen } of heldOut)
  describe(`held-out set ${set}`, () => {
    it('matches its frozen hash (re-freeze only on purpose, never after seeing results)', async () => {
      const { holdoutDigest } = await import('../scripts/freeze-holdout.mjs')
      const lock = JSON.parse(
        readFileSync(join(root, `agent-suites/skill-bench/${set}.lock.json`), 'utf8'),
      )
      expect(holdoutDigest(set)).toBe(lock.sha256)
    })

    for (const task of frozen)
      it(`${task.id} is blind, checked and scored on 3-6 criteria`, () => {
        expect(blindingLeaks(task.claim.prompt)).toEqual([])
        expect(task.claim.prompt).not.toMatch(new RegExp(`\\b${task.targetSkill}\\b|holdout`))
        expect(EXPECTED_SKILLS).toContain(task.targetSkill)
        expect(existsSync(join(root, `${checksDir(set)}/${task.check}.mjs`))).toBe(true)
        expect(task.criteria.length).toBeGreaterThanOrEqual(3)
        expect(task.criteria.length).toBeLessThanOrEqual(6)
      })
  })

describe('strong claim bar', () => {
  const row = (skill, verdict, { rate = 0.95, lower = 0.7, tokens = [1, 2] } = {}) => ({
    skill,
    focus: 'full',
    verdict,
    rate,
    lower,
    cost: { tokens: { focus: tokens[0], other: tokens[1] } },
  })
  const healthy = { healthy: true }
  const skills = ['a', 'b', 'c'].map((skill) => row(skill, 'better'))
  const failing = (rows, health = healthy) =>
    strongClaim({ rows, health }, 'full')
      .checks.filter((check) => !check.ok)
      .map((check) => check.name)

  it('is met only when every condition holds', () => {
    expect(failing([...skills, row(ALL_TASKS, 'better')])).toEqual([])
  })

  it('needs a 90% pooled win rate and a 60% lower bound', () => {
    expect(failing([...skills, row(ALL_TASKS, 'better', { rate: 0.79 })])).toEqual([
      'pooled win rate ≥ 80%',
    ])
    expect(failing([...skills, row(ALL_TASKS, 'better', { lower: 0.55 })])).toEqual([
      'pooled lower bound ≥ 60%',
    ])
  })

  it('needs every skill better, 20% fewer tokens and a healthy judge', () => {
    expect(
      failing([...skills.slice(0, 2), row('c', 'inconclusive'), row(ALL_TASKS, 'better')]),
    ).toEqual(['every skill better'])
    const pricey = ['a', 'b', 'c'].map((skill) => row(skill, 'better', { tokens: [17, 20] }))
    expect(failing([...pricey, row(ALL_TASKS, 'better')])).toEqual(['median token ratio ≤ 0.8'])
    expect(failing([...skills, row(ALL_TASKS, 'better')], { healthy: false })).toEqual([
      'judge healthy',
    ])
  })
})

describe('task sets', () => {
  it('have unique ids across development and every held-out set', () => {
    const ids = [tasks, ...heldOut.map(({ tasks }) => tasks)].flat().map((task) => task.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('development tasks with a hidden check have it outside the workspace', () => {
    for (const task of tasks.filter((task) => task.check))
      expect(existsSync(join(root, `${checksDir('tasks')}/${task.check}.mjs`))).toBe(true)
  })
})

describe('judge threshold calibration', async () => {
  const { calibrationTable, chooseThreshold, meanGap, weaken } =
    await import('../scripts/skill-bench-calibrate.mjs')

  it('weakens a run by removing its shown evidence, not its changes', () => {
    const twin = weaken(
      run({ toolCalls: [{ name: 'Edit' }, { name: 'Bash', args: { command: 'node --test' } }] }),
    )
    expect(twin.diff).toBe(run().diff)
    expect(twin.output).toBe('Fixed it. Tests pass.')
    expect(twin.toolCalls).toEqual([{ name: 'Edit' }])
  })

  it('averages the original-minus-twin gap over both orders', () => {
    const judgments = [
      { first: 'o', second: 't', scores: { first: 4, second: 3 } },
      { first: 't', second: 'o', scores: { first: 2, second: 4 } },
    ]
    expect(meanGap(judgments, 'o')).toBe(1.5)
  })

  it('picks the smallest threshold with at most 10% false calls on identical pairs', () => {
    const table = calibrationTable([1, 1, 0.5, 0.25, 0], [0, 0.25, 0, 0, 0, 0, 0, 0, 0, 0.5])
    expect(table.map((row) => row.falseCalls)).toEqual([0.2, 0.1, 0, 0])
    expect(chooseThreshold(table)).toMatchObject({ threshold: 0.5, sensitivity: 0.6 })
  })
})
