import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EXPECTED_SKILLS } from '../src/expected-skills.ts'
import {
  blindingLeaks,
  checksDir,
  degrade,
  FRAME_GROUPS,
  frameName,
  HELD_OUT_SETS,
  maskSkillNames,
  OMITTED_NOTES,
  parseVerdict,
  pictureSections,
  planPairs,
  renderRun,
  screenshotName,
  withoutPaths,
} from '../scripts/lib/skill-bench-material.mjs'
import { ALL_TASKS, buildReport, requiredBar, strongClaim } from '../scripts/skill-bench-report.mjs'
import { verdict } from '../scripts/lib/pairwise-stats.mjs'

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

  it('a visual run lists its screenshots under neutral names; its twin has none', () => {
    const shots = [
      { file: '.agent-test/x/full__0.shots/phone-1.jpg', viewport: 'phone', screen: 1 },
      { file: '.agent-test/x/full__0.shots/desktop-1.jpg', viewport: 'desktop', screen: 1 },
    ]
    const visual = run({ screenshots: shots, screenshotsTruncated: ['phone'] })
    const names = shots.map((shot) => screenshotName('A', shot))
    expect(names).toEqual(['A-phone-1.jpg', 'A-desktop-1.jpg'])
    const view = renderRun(visual, 'A', { screenshotNames: names })
    expect(view).toContain('- A-phone-1.jpg')
    expect(view).toContain('longer than the screens shown at phone width')
    expect(view).not.toContain('.agent-test')
    expect(renderRun(degrade(visual), 'A')).toContain('the page did not render')
    expect(renderRun(run(), 'A')).not.toContain('Rendered page')
  })

  it('a visual run lists its motion frames by group under neutral names', () => {
    const frames = [
      {
        file: '.agent-test/x/full__0.frames/frame-load-0ms.jpg',
        group: 'entrance',
        step: 'load-0ms',
      },
      {
        file: '.agent-test/x/full__0.frames/frame-action-hover.jpg',
        group: 'action',
        step: 'action-hover',
      },
      {
        file: '.agent-test/x/full__0.frames/frame-reduced-motion.jpg',
        group: 'reduced-motion',
        step: 'reduced-motion',
      },
    ]
    const visual = run({
      screenshots: [],
      frames,
      frameNotes: ['Only 1 section(s) were found below the first screen.'],
    })
    const names = frames.map((frame) => frameName('B', frame))
    expect(names[0]).toBe('B-frame-load-0ms.jpg')
    const view = renderRun(visual, 'B', { frameNames: names })
    expect(view).toContain('## Motion and interaction')
    expect(view).toContain(`### ${FRAME_GROUPS.entrance}`)
    expect(view).toContain(`### ${FRAME_GROUPS.action}`)
    expect(view).not.toContain(`### ${FRAME_GROUPS.scroll}`)
    expect(view.indexOf('B-frame-load-0ms.jpg')).toBeLessThan(view.indexOf('B-frame-action-hover'))
    expect(view).toContain('Note: Only 1 section(s)')
    expect(view).not.toContain('.agent-test')
    // A frame whose file could not be copied is left out.
    expect(renderRun(visual, 'B', { frameNames: [names[0], null, names[2]] })).not.toContain(
      'action-hover',
    )
    expect(degrade(visual).frames).toEqual([])
    expect(renderRun(run({ screenshots: [] }), 'A')).not.toContain('Motion and interaction')
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
    expect(failing([...skills, row(ALL_TASKS, 'better', { rate: 0.89 })])).toEqual([
      'pooled win rate ≥ 90%',
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

describe('judge family', async () => {
  const { JUDGE_MODEL, judgeFor } = await import('../scripts/skill-bench-judge.mjs')

  it('judges with the other family by default and honours an explicit override', () => {
    expect(judgeFor('claude', undefined).name).toBe('codex')
    expect(judgeFor('codex', undefined).name).toBe(JUDGE_MODEL)
    expect(judgeFor('claude', 'claude').name).toBe(JUDGE_MODEL)
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

describe('required bar', () => {
  const row = (skill, verdict) => ({ skill, focus: 'full', verdict })
  const healthy = { healthy: true }
  const met = (rows, health = healthy) => requiredBar({ rows, health }, 'full').met

  it('needs a better pooled verdict and every skill better or saturated', () => {
    const pooled = row(ALL_TASKS, 'better')
    expect(met([row('a', 'better'), row('b', 'saturated'), pooled])).toBe(true)
    expect(met([row('a', 'better'), row('b', 'inconclusive'), pooled])).toBe(false)
    expect(met([row('a', 'better'), row(ALL_TASKS, 'inconclusive')])).toBe(false)
    expect(met([row('a', 'better'), pooled], { healthy: false })).toBe(false)
  })

  it('names the skills that fall short', () => {
    const names = requiredBar(
      { rows: [row('tdd', 'not-better'), row(ALL_TASKS, 'better')], health: healthy },
      'full',
    ).checks.map((check) => check.name)
    expect(names.join(' ')).toContain('tdd not-better')
  })
})

describe('saturated verdict', () => {
  const none = { focus: 0, other: 0 }
  const cheaper = { focus: 80, other: 100 }
  const base = { rate: 0.5, lower: 0.2, upper: 0.8, repeats: 4 }

  it('marks an undecided skill saturated when nearly every pair ties and it is not behind', () => {
    expect(verdict({ ...base, wins: 4, losses: 4, ties: 40 }, none, cheaper)).toBe('saturated')
    expect(
      verdict(
        { ...base, rate: null, lower: null, upper: null, wins: 0, losses: 0, ties: 48 },
        none,
        cheaper,
      ),
    ).toBe('saturated')
  })

  it('stays inconclusive when it costs as many tokens or more', () => {
    expect(
      verdict({ ...base, wins: 4, losses: 4, ties: 40 }, none, { focus: 100, other: 100 }),
    ).toBe('inconclusive')
    expect(verdict({ ...base, wins: 4, losses: 4, ties: 40 }, none)).toBe('inconclusive')
  })

  it('stays inconclusive when ties are fewer, it trails, or it fails more checks', () => {
    expect(verdict({ ...base, wins: 16, losses: 15, ties: 17 }, none)).toBe('inconclusive')
    expect(verdict({ ...base, wins: 3, losses: 6, ties: 39 }, none)).toBe('inconclusive')
    expect(verdict({ ...base, wins: 5, losses: 5, ties: 38 }, { focus: 1, other: 0 })).toBe(
      'inconclusive',
    )
  })
})

describe('motion and interaction frames', async () => {
  const { captureFrames, chromePath, FRAME_PLAN } = await import('../scripts/lib/bench-render.mjs')
  const { mkdtempSync, writeFileSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const page = `<!doctype html><html><head><style>
    body { margin: 0; font: 18px sans-serif }
    header { height: 900px } section { height: 700px }
    h1 { animation: rise 1s ease-out both } @keyframes rise { from { opacity: 0 } }
    nav a { padding: 0 } .cta { display: inline-block; padding: 12px 20px; background: #135; color: #fff }
    .cta:hover { background: #246 } .cta:focus-visible { outline: 3px solid #f80 }
    @media (prefers-reduced-motion: reduce) { h1 { animation: none } }
  </style></head><body><header><nav><a href="#a">Plain link</a></nav><h1>Title</h1>
  <a class="cta" href="#order">Order bread</a></header>
  <main><section id="a">Two</section><section>Three</section><section>Four</section></main></body></html>`

  it.skipIf(!chromePath())(
    'takes every planned frame, finds the button-styled link and the next two sections',
    async () => {
      const dir = mkdtempSync(join(tmpdir(), 'frames-'))
      writeFileSync(join(dir, 'index.html'), page)
      const { frames, notes } = await captureFrames(dir, 'index.html', join(dir, 'out'))
      expect(notes).toEqual([])
      expect(frames.map((frame) => frame.step)).toEqual(FRAME_PLAN.map((frame) => frame.step))
      for (const frame of frames) expect(existsSync(frame.file)).toBe(true)
    },
    60000,
  )
})

describe('missing skills in the report', () => {
  const tasks = [
    { id: 't1', targetSkill: 'hillclimb', set: 'holdout-x' },
    { id: 't2', targetSkill: 'tdd', set: 'holdout-x' },
    { id: 'other', targetSkill: 'probe', set: 'tasks' },
  ]
  const judged = (task) => [
    { pairId: task, task, first: `${task}|full|0`, second: `${task}|none|0`, winner: 'first' },
    { pairId: task, task, first: `${task}|none|0`, second: `${task}|full|0`, winner: 'second' },
  ]
  const skills = (report) => report.rows.map((row) => `${row.skill}:${row.verdict}`)

  it('reports a skill whose runs were all lost as missing, from the set the runs came from', () => {
    const report = buildReport({
      runs: [
        run({ arm: 'none' }),
        run(),
        { task: 't2', arm: 'full', repetition: 0, infrastructure: 'escape' },
        { task: 't2', arm: 'none', repetition: 0, infrastructure: 'escape' },
      ],
      tasks,
      judgments: judged('t1'),
    })
    expect(skills(report)).toEqual([
      'hillclimb:signal only (1 run per arm)',
      'tdd:missing',
      `${ALL_TASKS}:signal only (0 runs per arm)`,
    ])
    expect(report.rows[1]).toMatchObject({ wins: 0, repeats: 0, rate: null })
  })

  it('reports a skill of the set that never ran or was never judged as missing', () => {
    const report = buildReport({
      runs: [run({ arm: 'none' }), run()],
      tasks,
      judgments: judged('t1'),
    })
    expect(skills(report)).toContain('tdd:missing')
    expect(skills(report).join(' ')).not.toContain('probe')
  })

  it('fails the required bar and the strong claim on a missing skill', () => {
    const rows = [
      { skill: 'hillclimb', focus: 'full', verdict: 'better', cost: { tokens: {} } },
      { skill: 'tdd', focus: 'full', verdict: 'missing', cost: { tokens: {} } },
      { skill: ALL_TASKS, focus: 'full', verdict: 'better', rate: 1, lower: 1 },
    ]
    const bar = requiredBar({ rows, health: { healthy: true } }, 'full')
    expect(bar.met).toBe(false)
    expect(bar.checks.map((check) => check.name).join(' ')).toContain('tdd missing')
    expect(strongClaim({ rows, health: { healthy: true } }, 'full').met).toBe(false)
  })
})

describe('saturated token margin', () => {
  const none = { focus: 0, other: 0 }
  const tied = { rate: null, lower: null, upper: null, repeats: 4, wins: 0, losses: 0, ties: 48 }

  it('needs median tokens at least 10% below the baseline', () => {
    expect(verdict(tied, none, { focus: 90, other: 100 })).toBe('saturated')
    expect(verdict(tied, none, { focus: 91, other: 100 })).toBe('inconclusive')
    expect(verdict(tied, none, { focus: 9999, other: 10000 })).toBe('inconclusive')
  })
})

describe('masking skill names in paths', () => {
  const names = ['taste', 'how', 'taste-skill', 'babysit-pr']

  it('masks plain-word names used as path segments', () => {
    expect(
      maskSkillNames('Read: /tmp/w/projects/ledger-launch/.taste/look/1440-01.jpg', names),
    ).toBe('Read: /tmp/w/projects/ledger-launch/.<skill>/look/1440-01.jpg')
    expect(maskSkillNames('grep -E "FAIL"; rm -rf .taste; git status --short', names)).toBe(
      'grep -E "FAIL"; rm -rf .<skill>; git status --short',
    )
    expect(maskSkillNames('ls taste/look/1.jpg and a/how/b.md', names)).toBe(
      'ls <skill>/look/1.jpg and a/<skill>/b.md',
    )
  })

  it('masks underscore and upper-case spellings of hyphenated names', () => {
    expect(maskSkillNames('TASTE_SKILL_HISTORY=/x node draw.mjs', names)).toBe(
      '<skill>_HISTORY=/x node draw.mjs',
    )
    expect(maskSkillNames('taste_skill notes and BABYSIT_PR', names)).toBe(
      '<skill> notes and <skill>',
    )
  })

  it('leaves ordinary prose alone', () => {
    const prose =
      'This is how it works: how/why it broke, a matter of taste. The taste is fine; file.taste stays.'
    expect(maskSkillNames(prose, names)).toBe(prose)
  })

  it('masks the real smoke-design actions', () => {
    const actions = [
      '- Read: /tmp/agent-harness-seal-7IIXbH/workspace/projects/ledger-launch/.taste/look/390-01.jpg',
      '- Bash: node ../../.claude/skills/taste/scripts/look.mjs . 2>&1 | grep -E "FAIL|WARN h1|overflow"; rm -rf .taste; git status --short',
      '- Bash: S=/tmp/agent-harness-seal-P27tkm/workspace/.claude/skills/taste-skill && node $S/scripts/draw.mjs --out .taste-skill/app',
    ].join('\n')
    expect(maskSkillNames(actions, names)).not.toMatch(/taste/i)
  })
})

describe('frame notes in the judge view', () => {
  it('masks names and drops paths in frame notes', () => {
    const view = renderRun(
      run({
        frames: [{ file: 'f', group: 'entrance', step: 'load-0ms' }],
        frameNotes: [
          'The motion frames could not be taken: Error: ENOENT .agent-test/skill-bench/b/runs/t1__pack-taste-skill__0.frames/frame-x.jpg',
          'The how skill page had no button.',
        ],
      }),
      'A',
      { skillNames: ['how', 'taste-skill'], frameNames: ['A-frame-load-0ms.jpg'] },
    )
    expect(view).toContain('Note: The motion frames could not be taken: Error: ENOENT <path>')
    expect(view).toContain('Note: The <skill> skill page had no button.')
    expect(view).not.toMatch(/taste|pack-|\.agent-test/)
  })

  it('withoutPaths keeps the message and drops absolute and relative paths', () => {
    expect(
      withoutPaths("Error: ENOENT: no such file, open '/tmp/x/a__only-how__0.frames/y.jpg'"),
    ).toBe("Error: ENOENT: no such file, open '<path>'")
    expect(withoutPaths('TimeoutError: page.goto: Timeout 30000ms exceeded.')).toBe(
      'TimeoutError: page.goto: Timeout 30000ms exceeded.',
    )
  })
})

describe('picture sections in a mixed bench', () => {
  const shots = [{ file: 's', viewport: 'phone', screen: 1 }]
  const frames = [{ file: 'f', group: 'entrance', step: 'load-0ms' }]

  it('shows a section only when both runs recorded it', () => {
    expect(
      pictureSections(run({ screenshots: shots, frames }), run({ screenshots: shots })),
    ).toEqual({ screenshots: 'show', frames: 'omit' })
    expect(pictureSections(run(), run())).toEqual({ screenshots: 'none', frames: 'none' })
    // A degraded twin's empty lists are evidence (nothing rendered), so they still show.
    const visual = run({ screenshots: shots, frames })
    expect(pictureSections(visual, degrade(visual))).toEqual({
      screenshots: 'show',
      frames: 'show',
    })
  })

  it('leaves an omitted section out of both views with the same neutral note', () => {
    const views = [run({ screenshots: shots, frames }), run({ screenshots: shots })].map(
      (version, index) =>
        renderRun(version, 'AB'[index], {
          screenshotNames: ['x.jpg'],
          frameNames: ['f.jpg'],
          omitted: ['frames'],
        }),
    )
    for (const view of views) {
      expect(view).not.toContain('## Motion and interaction')
      expect(view).toContain(OMITTED_NOTES.frames)
      expect(view).toContain('## Rendered page')
    }
  })

  it('skips picture files that are gone and notes it for that version', () => {
    const version = run({ screenshots: [...shots, ...shots], frames: [...frames, ...frames] })
    const view = renderRun(version, 'A', {
      screenshotNames: ['A-phone-1.jpg', null],
      frameNames: [null, 'A-frame-load-0ms.jpg'],
    })
    expect(view).toContain('- A-phone-1.jpg')
    expect(view).toContain('1 screenshot of this version could not be found')
    expect(view).toContain('1 frame of this version could not be found')
    expect(view).not.toContain('null')
  })
})

describe('claude bench wrapper', async () => {
  const { benchArgs, signalStatus } = await import('../scripts/lib/claude-bench-bin.mjs')
  const settings = JSON.stringify({ sandbox: { filesystem: { denyRead: ['/tmp'] } } })
  const parsed = (args) =>
    JSON.parse(args.find((arg) => arg.startsWith('{')) ?? args[0].slice('--settings='.length))
  const sockets = ['/var/run/docker.sock', '/run/user/1000/bus']

  it('allows Unix sockets only on Linux and denies the escape sockets', () => {
    const linux = parsed(benchArgs(['-p', '--settings', settings], { platform: 'linux', sockets }))
    expect(linux.sandbox.network.allowAllUnixSockets).toBe(true)
    expect(linux.sandbox.filesystem.denyRead).toEqual(['/tmp', ...sockets])
    expect(linux.sandbox.filesystem.denyWrite).toEqual(sockets)
    const mac = parsed(benchArgs(['--settings', settings], { platform: 'darwin', sockets }))
    expect(mac.sandbox.network).toBeUndefined()
    expect(mac.sandbox.filesystem.denyRead).toEqual(['/tmp', ...sockets])
  })

  it('reads --settings from a file and accepts --settings=', () => {
    const fromFile = benchArgs(['--settings', '/x/settings.json'], {
      platform: 'linux',
      sockets: [],
      readFile: () => settings,
    })
    expect(parsed(fromFile).sandbox.network.allowAllUnixSockets).toBe(true)
    const inline = benchArgs([`--settings=${settings}`, '-p'], { platform: 'linux', sockets: [] })
    expect(inline[0].startsWith('--settings={')).toBe(true)
    expect(parsed(inline).sandbox.network.allowAllUnixSockets).toBe(true)
    expect(inline[1]).toBe('-p')
  })

  it('leaves arguments without settings alone', () => {
    expect(benchArgs(['-p', 'hi'], { sockets })).toEqual(['-p', 'hi'])
  })

  it('reports a killed CLI as killed, not as a clean exit', async () => {
    const { spawnSync } = await import('node:child_process')
    const { chmodSync, mkdtempSync, writeFileSync } = await import('node:fs')
    const { tmpdir } = await import('node:os')
    const fake = join(mkdtempSync(join(tmpdir(), 'bench-bin-')), 'claude')
    writeFileSync(fake, '#!/bin/sh\nkill -TERM $$\n')
    chmodSync(fake, 0o755)
    const result = spawnSync(
      process.execPath,
      [join(root, 'scripts/lib/claude-bench-bin.mjs'), '-p', 'hi'],
      { env: { ...process.env, TOOLBOX_REAL_CLAUDE_BIN: fake } },
    )
    expect(result.status === signalStatus('SIGTERM') || result.signal === 'SIGTERM').toBe(true)
    expect(result.status).not.toBe(0)
  })
})

describe('sections found by position', async () => {
  const { chromePath, launchBrowser, openPage, sectionTops, serve } =
    await import('../scripts/lib/bench-render.mjs')
  const { mkdirSync, mkdtempSync, writeFileSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const body = `<header style="height:900px">Hero</header>
    <section style="height:800px">Two</section><section style="height:800px">Three</section>`
  const pages = {
    main: `<main>${body}</main>`,
    root: `<div id="root">${body}</div>`,
    deep: `<div id="root"><div class="app"><div>${body.replaceAll('section', 'div')}</div></div></div>`,
  }

  it.skipIf(!chromePath())(
    'finds the same sections whether the page sits in main or in wrapper divs',
    async () => {
      const dir = mkdtempSync(join(tmpdir(), 'tops-'))
      for (const [name, html] of Object.entries(pages)) {
        mkdirSync(join(dir, name))
        writeFileSync(
          join(dir, name, 'index.html'),
          `<!doctype html><html><body style="margin:0">${html}</body></html>`,
        )
      }
      const server = await serve(dir)
      const browser = await launchBrowser()
      try {
        const tops = {}
        for (const name of Object.keys(pages)) {
          const tab = await browser.newPage({ viewport: { width: 1440, height: 900 } })
          await openPage(tab, `${server.url}/${name}/index.html`)
          tops[name] = await tab.evaluate(sectionTops)
          await tab.close()
        }
        expect(tops).toEqual({ main: [900, 1700], root: [900, 1700], deep: [900, 1700] })
        // A malformed address is a bad request, not a crash.
        expect((await fetch(`${server.url}/%E0%A4%A`)).status).toBe(400)
      } finally {
        await browser.close()
        await server.close()
      }
    },
    60000,
  )
})
