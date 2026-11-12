import { afterEach, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  archiveAll,
  loadArchived,
  skillVersions,
  toolboxSkills,
} from '../scripts/lib/skill-usage/archive.mjs'
import { candidateSkills } from '../scripts/lib/skill-usage/fingerprints.mjs'
import { artifactsOf, classifyNextPrompt } from '../scripts/lib/skill-usage/signals.mjs'

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

const archive = (options = {}) => {
  dir ??= mkdtempSync(join(tmpdir(), 'skill-usage-'))
  return archiveAll({ projectsDir, dir, skills, ...options })
}

describe('skill usage archive', () => {
  it('archives real sessions and skips bench workspaces', () => {
    const totals = archive()
    expect(totals).toMatchObject({ transcripts: 1, episodes: 3, unparsable: 1 })
    const episodes = loadArchived(dir)
    expect(episodes.map((episode) => episode.skill).sort()).toEqual([
      'evidence-based-debugging',
      'refactor-companion',
      'workflow',
    ])
    expect(readdirSync(join(dir, 'bodies'))).toHaveLength(3)
  })

  it('adds nothing on a rerun', () => {
    archive()
    expect(archive()).toMatchObject({ transcripts: 0, unchanged: 1, episodes: 0 })
    expect(archive({ refresh: true })).toMatchObject({ transcripts: 1, episodes: 3 })
  })

  it('judges bench sessions by where they started, and reads relay briefs as prompts', () => {
    dir = mkdtempSync(join(tmpdir(), 'skill-usage-'))
    const projects = join(dir, 'projects')
    mkdirSync(join(projects, '-work-app'), { recursive: true })
    const record = (fields) => JSON.stringify({ sessionId: 's1', isSidechain: false, ...fields })
    writeFileSync(
      join(projects, '-work-app', 's1.jsonl'),
      [
        record({
          type: 'user',
          uuid: 'a',
          cwd: '/work/app',
          isMeta: true,
          message: { content: '<relay from="coordinator">Grill the sync plan</relay>' },
        }),
        record({
          type: 'assistant',
          cwd: '/work/app/.agent-test/executions/x',
          message: {
            id: 'm1',
            content: [
              { type: 'tool_use', id: 't1', name: 'Skill', input: { skill: 'taste', args: '' } },
            ],
          },
        }),
      ].join('\n'),
    )
    const totals = archiveAll({ projectsDir: projects, dir: join(dir, 'out'), skills })
    expect(totals).toMatchObject({ episodes: 1, bench: 0 })
    expect(loadArchived(join(dir, 'out'))[0]).toMatchObject({
      promptFrom: 'agent',
      trigger: 'model-proactive',
    })
  })

  it('stores free signals with each episode', () => {
    archive()
    const debug = loadArchived(dir).find((episode) => episode.skill === 'evidence-based-debugging')
    expect(debug.signals).toMatchObject({
      nextPrompt: 'correction',
      namedInPrompt: false,
      toolErrors: 1,
      commits: 1,
      testsRun: 2,
      lastTestPassed: true,
    })
  })

  it('keeps tasks a toolbox skill should probably have handled, with competing skills', () => {
    archive()
    const candidates = loadArchived(dir, 'candidates')
    const byPrompt = Object.fromEntries(candidates.map((task) => [task.prompt, task]))
    expect(byPrompt['Make a landing page for my café']).toMatchObject({
      candidates: ['taste'],
      competitor: true,
      otherSkills: ['taste-skill:redesign-skill'],
    })
    expect(byPrompt["No, that's wrong, the totals are still doubled"].candidates).toEqual([
      'evidence-based-debugging',
    ])
    expect(byPrompt.thanks).toBeUndefined()
  })
})

describe('skill usage signals', () => {
  it('classifies what the person said next', () => {
    expect(classifyNextPrompt(null, 'x')).toBe('none')
    expect(classifyNextPrompt({ text: 'No, the totals are still doubled' }, 'x')).toBe('correction')
    expect(classifyNextPrompt({ text: 'great, commit it' }, 'x')).toBe('accept')
    expect(
      classifyNextPrompt(
        { text: 'please fix the duplicate rows in the order export' },
        'fix the duplicate rows in the export of orders',
      ),
    ).toBe('repeat')
    expect(classifyNextPrompt({ text: 'now add a dark theme' }, 'fix the export')).toBe('new-topic')
  })

  it('reads commits, PRs and the last test result', () => {
    const bash = (command, isError = false) => ({ name: 'Bash', args: { command }, isError })
    expect(
      artifactsOf([
        bash('npm test', true),
        bash('git commit -m x'),
        bash('gh pr create'),
        bash('npm test'),
      ]),
    ).toEqual({ commits: 1, prCreated: true, testsRun: 2, lastTestPassed: true })
    expect(artifactsOf([bash('git commit -m x', true)])).toMatchObject({
      commits: 0,
      lastTestPassed: null,
    })
  })

  it('does not flag a one-line answer as a taste task', () => {
    const task = { prompt: 'what does this regex do?', actions: [] }
    expect(candidateSkills(task)).toEqual([])
  })
})

describe('skill versions', () => {
  it('maps every toolbox skill text in git history to a commit', () => {
    const versions = skillVersions(root, ['grill'])
    expect(versions.size).toBeGreaterThan(0)
    for (const version of versions.values()) expect(version.skill).toBe('grill')
    expect(toolboxSkills(root).has('grill')).toBe(true)
  })
})

describe('skill usage archive entry point', () => {
  it('takes the transcript from a SessionEnd hook payload or --session', async () => {
    const { sessionToArchive } = await import('../scripts/skill-usage.mjs')
    const payload = JSON.stringify({ hook_event_name: 'SessionEnd', transcript_path: '/t/s.jsonl' })
    expect(sessionToArchive(['--hook'], () => payload)).toBe('/t/s.jsonl')
    expect(sessionToArchive(['--hook'], () => '')).toBeNull()
    expect(sessionToArchive(['--session', '/t/x.jsonl'])).toBe('/t/x.jsonl')
    expect(sessionToArchive([])).toBeNull()
  })
})
