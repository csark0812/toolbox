import { afterEach, describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { archiveAll, loadArchived, uniqueEpisodes } from '../scripts/lib/skill-usage/archive.mjs'
import {
  judgeSample,
  loadJudgments,
  parseJudgment,
  parseMiss,
  renderEpisode,
  sampleCases,
} from '../scripts/lib/skill-usage/judge.mjs'
import { buildReport, rate, renderReport } from '../scripts/lib/skill-usage/report.mjs'

const root = join(import.meta.dirname, '..')
const projectsDir = join(root, 'agent-suites/fixtures/skill-usage/projects')
const skills = new Set([
  'evidence-based-debugging',
  'workflow',
  'refactor-companion',
  'taste',
  'tdd',
])
let dir

afterEach(() => dir && rmSync(dir, { recursive: true, force: true }))

function archived() {
  dir = mkdtempSync(join(tmpdir(), 'skill-usage-'))
  archiveAll({ projectsDir, dir, skills })
  return {
    episodes: uniqueEpisodes(loadArchived(dir)),
    candidates: loadArchived(dir, 'candidates'),
  }
}

const FAILURE = JSON.stringify({
  intent: 'fix duplicate export rows',
  routing_fit: 'good',
  better_skill: 'none',
  followed_skill: 'partly',
  outcome: 'failure',
  score: 2,
  failure_mode: 'wrong-assumption',
  evidence: ["No, that's wrong, the totals are still doubled"],
  skill_sentence: 'Reproduce first.',
  summary: 'Fixed the export but not the totals the user cared about.',
})

/** A judge that answers by file name: episodes get FAILURE, candidates get a yes for taste. */
const fakeJudge =
  (calls = []) =>
  async (files) => {
    calls.push(Object.keys(files))
    if (files['episode.md']) return `Here you go:\n${FAILURE}`
    return JSON.stringify({
      verdicts: [
        {
          skill: 'taste',
          should_have_called: 'yes',
          matching_phrase: 'landing page',
          reason: 'new page',
        },
      ],
    })
  }

describe('skill usage judge', () => {
  it('reads the last judgment object and rejects replies without one', () => {
    expect(parseJudgment(`thinking {"a":1}\n${FAILURE}`)).toMatchObject({
      outcome: 'failure',
      failureMode: 'wrong-assumption',
      routingFit: 'good',
      betterSkill: null,
      score: 2,
    })
    expect(() => parseJudgment('no idea')).toThrow(/no judgment JSON/)
    expect(() => parseJudgment('{"outcome":"great"}')).toThrow(/bad outcome/)
    expect(
      parseMiss('{"verdicts":[{"skill":"taste","should_have_called":"maybe"}]}').verdicts,
    ).toEqual([])
  })

  it('samples across skills, troubled and newest first, skipping judged cases', () => {
    const cases = [
      { id: 'a1', skill: 'a', timestamp: '1', bad: 0 },
      { id: 'a2', skill: 'a', timestamp: '2', bad: 0 },
      { id: 'a3', skill: 'a', timestamp: '0', bad: 5 },
      { id: 'b1', skill: 'b', timestamp: '1', bad: 0 },
    ]
    const picked = sampleCases(cases, {
      limit: 3,
      judged: new Map([['a2', {}]]),
      skillOf: (item) => item.skill,
      priority: (item) => item.bad,
    })
    expect(picked.map((item) => item.id)).toEqual(['a3', 'b1', 'a1'])
  })

  it('renders what the judge needs: request, reasoning, errors and the next message', () => {
    const [debug] = archived().episodes.filter((e) => e.skill === 'evidence-based-debugging')
    const text = renderEpisode(debug)
    expect(text).toContain('the agent chose it on its own')
    expect(text).toContain('The export lists every order twice')
    expect(text).toContain('ERROR: 1 failing')
    expect(text).toContain("No, that's wrong")
  })

  it('records judgments, caches them, and logs a bad reply without caching it', async () => {
    const { episodes, candidates } = archived()
    const calls = []
    const first = await judgeSample({
      dir,
      root,
      episodes,
      candidates,
      limit: 2,
      missed: 5,
      ask: fakeJudge(calls),
    })
    expect(first).toEqual({ episodes: 2, misses: 2, errors: 0 })
    expect(calls[0]).toEqual(['episode.md', 'skill.md'])

    const again = await judgeSample({
      dir,
      root,
      episodes,
      candidates,
      limit: 5,
      missed: 5,
      ask: fakeJudge(),
    })
    expect(again).toEqual({ episodes: 1, misses: 0, errors: 0 })

    rmSync(join(dir, 'judgments.jsonl'))
    const broken = await judgeSample({
      dir,
      root,
      episodes,
      candidates,
      limit: 1,
      missed: 0,
      ask: async () => 'sorry',
    })
    expect(broken).toEqual({ episodes: 0, misses: 0, errors: 1 })
    expect(loadJudgments(dir, 'judgments.jsonl').size).toBe(0)
    expect(readFileSync(join(dir, 'judge-errors.jsonl'), 'utf8')).toContain('no judgment JSON')
  })
})

describe('skill usage report', () => {
  it('shows counts below five cases and percentages from five up', () => {
    expect(rate(1, 4)).toBe('1/4')
    expect(rate(1, 5)).toBe('1/5 (20%)')
    expect(rate(0, 0)).toBe('–')
  })

  it('reports use, failures, routing and missed triggers', async () => {
    const { episodes, candidates } = archived()
    await judgeSample({ dir, root, episodes, candidates, limit: 10, missed: 10, ask: fakeJudge() })
    const report = buildReport({
      episodes,
      candidates,
      judgments: loadJudgments(dir, 'judgments.jsonl'),
      misses: loadJudgments(dir, 'misses.jsonl'),
      versions: new Map(),
    })
    const debug = report.rows.find((row) => row.skill === 'evidence-based-debugging')
    expect(debug).toMatchObject({ calls: 1, interrupted: 0, shipped: 1, next: { correction: 1 } })
    expect(debug.judged).toMatchObject({ n: 1, failure: 1 })
    expect(report.rows.find((row) => row.skill === 'taste').missed).toMatchObject({
      candidates: 1,
      confirmed: 1,
      otherSkills: { 'taste-skill:redesign-skill': 1 },
    })
    expect(report.benchCandidates.length).toBeGreaterThan(0)

    const markdown = renderReport(report)
    expect(markdown).toContain('## Missed triggers (recall)')
    expect(markdown).toContain('ran taste-skill:redesign-skill instead')
    expect(markdown).toContain('| taste-skill:redesign-skill ×1 |')
    expect(markdown).toContain('wrong-assumption ×')
    expect(markdown).toContain('shop-session.jsonl:')
    expect(existsSync(join(dir, 'report.md'))).toBe(false)
  })
})
