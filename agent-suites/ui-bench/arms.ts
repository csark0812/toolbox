import { cp, readdir, rm } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { EXPECTED_SKILLS } from '../../src/expected-skills'
import { TASKS_DIR, type BenchTask } from './tasks'

/** The three conditions every task runs under. Only the prompt suffix and skill files differ. */
export const ARMS = ['none', 'one-liner', 'skill'] as const
export type Arm = (typeof ARMS)[number]

const SKILL_MIRRORS = ['.claude/skills', '.agents/skills']

export const ONE_LINER =
  'Make it well crafted: accessible, responsive from 320px, consistent with the existing design system, and check the rendered result.'

/** Identical for every arm, so tool awareness never differs between arms. */
export const BASE_PROMPT =
  'This is an isolated benchmark fixture. Use only files inside the current workspace. ' +
  'The `render_page` tool renders a workspace HTML page at 320/390/768/1440px (light and dark) ' +
  'and returns layout and accessibility findings with screenshots.\n\n'

export function armPrompt(task: BenchTask, arm: Arm): string {
  const suffix =
    arm === 'one-liner'
      ? `\n\n${ONE_LINER}`
      : arm === 'skill'
        ? `\n\nUse the ${task.skill} skill (\`.claude/skills/${task.skill}/SKILL.md\`).`
        : ''
  return `${BASE_PROMPT}${task.prompt}${suffix}`
}

/**
 * Shape the agent workspace for one arm:
 * - only the target skill exists, and only in the skill arm;
 * - only the current task's fixture remains, without its grader-facing task.json;
 * The render_page MCP tool is attached to every arm by ui-bench.config.ts.
 */
export async function prepareArm(workspacePath: string, task: BenchTask, arm: Arm) {
  for (const slug of EXPECTED_SKILLS)
    if (!(arm === 'skill' && slug === task.skill))
      await rm(join(workspacePath, slug), { recursive: true, force: true })
  for (const mirror of SKILL_MIRRORS) {
    await rm(join(workspacePath, mirror), { recursive: true, force: true })
    if (arm === 'skill')
      await cp(join(workspacePath, task.skill), join(workspacePath, mirror, task.skill), {
        recursive: true,
      })
  }
  if (arm === 'skill') await rm(join(workspacePath, task.skill), { recursive: true, force: true })

  await removeOtherFixtures(workspacePath, task)

  execFileSync('git', ['init', '-q'], { cwd: workspacePath })
  execFileSync('git', ['add', '.'], { cwd: workspacePath })
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Toolbox Fixture',
      '-c',
      'user.email=fixture@example.invalid',
      'commit',
      '-qm',
      'Fixture baseline',
    ],
    { cwd: workspacePath },
  )
}

async function removeOtherFixtures(workspacePath: string, task: BenchTask) {
  const fixtures = join(workspacePath, 'agent-suites/fixtures')
  for (const name of await readdir(fixtures))
    if (name !== 'ui-bench') await rm(join(fixtures, name), { recursive: true, force: true })
  for (const name of await readdir(join(workspacePath, TASKS_DIR)))
    if (name !== task.id)
      await rm(join(workspacePath, TASKS_DIR, name), { recursive: true, force: true })
  // task.json lists the grader's checks; agents get the task only through the prompt.
  await rm(join(workspacePath, TASKS_DIR, task.id, 'task.json'), { force: true })
}
