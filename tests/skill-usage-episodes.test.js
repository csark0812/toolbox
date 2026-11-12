import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { isBenchPath, readTranscript } from '../scripts/lib/skill-usage/claude-transcript.mjs'
import { buildEpisodes, normalizeSkillBody } from '../scripts/lib/skill-usage/episodes.mjs'

const fixtures = join(import.meta.dirname, '..', 'agent-suites/fixtures/skill-usage/projects')
const shop = join(fixtures, '-work-shop/shop-session.jsonl')
const toolboxSkills = new Set([
  'evidence-based-debugging',
  'workflow',
  'refactor-companion',
  'taste',
])

const load = () => {
  const { records, unparsable } = readTranscript(shop)
  return { unparsable, ...buildEpisodes(records, { toolboxSkills, transcript: shop }) }
}

describe('skill usage episodes', () => {
  it('treats briefs from other sessions as prompts from an agent', async () => {
    const { userRecordKind } = await import('../scripts/lib/skill-usage/claude-transcript.mjs')
    const user = (content, extra = {}) => ({ type: 'user', message: { content }, ...extra })
    expect(
      userRecordKind(user('<cross-session-message from="x">Fix it</cross-session-message>')),
    ).toBe('relay')
    expect(userRecordKind(user('<relay from="coordinator">Go</relay>', { isMeta: true }))).toBe(
      'relay',
    )
    expect(userRecordKind(user('<system-reminder>worktree</system-reminder>\nFix the bug'))).toBe(
      'prompt',
    )
  })

  it('counts a broken line instead of failing', () => {
    expect(load().unparsable).toBe(1)
  })

  it('finds each toolbox skill call with how it was triggered', () => {
    const { episodes } = load()
    expect(episodes.map((episode) => [episode.skill, episode.trigger])).toEqual([
      ['evidence-based-debugging', 'model-proactive'],
      ['workflow', 'user-slash'],
      ['refactor-companion', 'nested'],
    ])
  })

  it('records why the skill was called: prompt, args and rationale', () => {
    const [debug] = load().episodes
    expect(debug.prompt).toBe('The export lists every order twice, please fix it')
    expect(debug.args).toBe('duplicate orders in export')
    expect(debug.rationale).toContain('evidence-based-debugging fits')
    expect(debug.line).toBeGreaterThan(1)
  })

  it('keeps the work until the next real prompt, through notifications', () => {
    const [debug] = load().episodes
    expect(debug.actions.map((action) => action.name)).toEqual(['Bash', 'Edit', 'Bash', 'Bash'])
    expect(debug.actions[0]).toMatchObject({
      isError: true,
      result: expect.stringContaining('failing'),
    })
    expect(debug.reply).toContain('joined orders twice')
    expect(debug.next.text).toBe("No, that's wrong, the totals are still doubled")
    expect(debug.tokens.output).toBeGreaterThan(0)
    expect(debug.durationMs).toBeGreaterThan(0)
  })

  it('reads a typed /skill and its arguments, and flags it as typed after unassisted work', () => {
    const workflow = load().episodes[1]
    expect(workflow.prompt).toBe('/workflow tidy the names and add a --since flag')
    expect(workflow.args).toBe('tidy the names and add a --since flag')
    expect(workflow.lateSlash).toBe(true)
    expect(workflow.skillsAfter).toEqual(['refactor-companion', 'poteto-mode'])
  })

  it('hashes the injected skill text so versions can be compared', () => {
    const { episodes, bodies } = load()
    expect(episodes[0].skillBodySha).toMatch(/^[0-9a-f]{16}$/)
    expect(bodies.get(episodes[0].skillBodySha)).toContain('Reproduce first.')
    expect(normalizeSkillBody('a   \n\n\n\nb\n')).toBe('a\n\nb')
  })

  it('keeps turns without a toolbox skill as tasks, ignoring /model and interrupts', () => {
    const { tasks } = load()
    expect(tasks.map((task) => task.prompt)).toEqual([
      "No, that's wrong, the totals are still doubled",
      'Make a landing page for my café',
      'thanks',
    ])
    expect(tasks[1].otherSkills).toEqual(['taste-skill:redesign-skill'])
    expect(tasks[2].next).toBeNull()
  })

  it('recognises bench and harness workspaces', () => {
    expect(isBenchPath('/private/var/folders/T/agent-harness-seal-AB12CD-workspace')).toBe(true)
    expect(isBenchPath('-private-var-folders-T-skill-bench-judge-x1')).toBe(true)
    expect(isBenchPath('/Users/me/Repositories/shop')).toBe(false)
  })
})
