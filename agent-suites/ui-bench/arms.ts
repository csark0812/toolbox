import { cp, readdir, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { EXPECTED_SKILLS } from '../../src/expected-skills'
import { FIXTURE_ROOT, TASKS_DIR, type BenchTask } from './tasks'

/**
 * An arm is one condition a task runs under; only the prompt suffix and skill files differ.
 * - `one-liner`: the baseline every skill must beat.
 * - `none`: the bare task prompt; checks that a task leaves room for instructions to matter.
 * - `exemplar`: the one-liner plus reference screenshots of preferred pages and a density spec.
 * - `critic`: the one-liner build, then a separate critic's fixes, kept only if the revision wins
 *   (the critique step lives in ui-bench.spec.ts).
 * - a source skill name: an original skill from the local archive, for head-to-head comparison.
 * Select arms with UI_BENCH_ARMS (comma-separated); the default is one-liner and none.
 */
export type Arm = string
export const DEFAULT_ARMS: Arm[] = ['one-liner', 'none']
/** Strategies beyond prompt text; like source skills, they run only on page-build tasks. */
export const STRATEGY_ARMS = ['exemplar', 'critic']
const EXEMPLAR_DIR = 'agent-suites/ui-bench/exemplars'
/** Workspace folder the exemplar arm reads its references from. */
export const EXEMPLAR_WORKSPACE_DIR = 'ui-reference'

/**
 * Skills compared head to head, from the local, git-ignored archive; they run only on page-build
 * tasks. Add a candidate skill folder here to test it against the one-liner.
 */
export const SOURCE_SKILLS: Record<string, string> = {
  'ux-principles': 'agent-suites/ui-bench/candidates/ux-principles',
  'web-designer': 'references/original-skills/web-designer-local/web-designer',
  'app-designer': 'references/original-skills/app-designer-local/app-designer',
}

export function armsFromEnv(env = process.env.UI_BENCH_ARMS): Arm[] {
  const arms = env
    ? env
        .split(',')
        .map((arm) => arm.trim())
        .filter(Boolean)
    : DEFAULT_ARMS
  for (const arm of arms)
    if (!['one-liner', 'none', ...STRATEGY_ARMS].includes(arm) && !SOURCE_SKILLS[arm])
      throw new Error(`Unknown UI bench arm ${arm}`)
  return arms
}

export function armAppliesTo(task: BenchTask, arm: Arm) {
  return (!SOURCE_SKILLS[arm] && !STRATEGY_ARMS.includes(arm)) || task.kind === 'page-build'
}

/** Skill folder name and source directory installed for an arm, if any. */
function armSkill(task: BenchTask, arm: Arm): { name: string; source: string } | null {
  if (SOURCE_SKILLS[arm]) return { name: arm, source: SOURCE_SKILLS[arm] }
  return null
}

const SKILL_MIRRORS = ['.claude/skills', '.agents/skills']

export const ONE_LINER =
  'Make it well crafted: accessible, responsive from 320px, consistent with the existing design system, and check the rendered result.'

/** Identical for every arm, so tool awareness never differs between arms. */
export const BASE_PROMPT =
  'This is an isolated benchmark fixture. Use only files inside the current workspace. ' +
  'Run commands from the workspace root and name files by workspace-relative paths, without `..`. ' +
  'The `render_page` tool renders a workspace HTML page at 320/390/768/1440px (light and dark) ' +
  'and returns layout and accessibility findings with screenshots.\n\n'

export function armPrompt(task: BenchTask, arm: Arm): string {
  const installed = armSkill(task, arm)
  const suffix = installed
    ? `Use the ${installed.name} skill (\`.claude/skills/${installed.name}/SKILL.md\`).`
    : arm === 'none'
      ? ''
      : arm === 'exemplar'
        ? `${ONE_LINER} Before building, open every screenshot in \`${EXEMPLAR_WORKSPACE_DIR}/\` with Read and follow \`${EXEMPLAR_WORKSPACE_DIR}/spec.md\`: they show the density and separation the reviewer prefers.`
        : ONE_LINER
  return `${BASE_PROMPT}${task.prompt}${suffix ? `\n\n${suffix}` : ''}`
}

/**
 * Shape the agent workspace for one arm:
 * - only the arm's skill exists (none for the one-liner);
 * - only the current task's fixture remains, without its grader-facing task.json;
 * The render_page MCP tool is attached to every arm by ui-bench.config.ts.
 */
export async function prepareArm(workspacePath: string, task: BenchTask, arm: Arm) {
  const installed = armSkill(task, arm)
  // Source skills come from the caller's local archive, outside the prepared workspace.
  const source = installed ? resolve(installed.source) : null
  if (source && !existsSync(source))
    throw new Error(`${source} is missing; source skills live in the local, git-ignored archive.`)
  for (const mirror of SKILL_MIRRORS) {
    await rm(join(workspacePath, mirror), { recursive: true, force: true })
    if (installed && source)
      await cp(source, join(workspacePath, mirror, installed.name), { recursive: true })
  }
  for (const slug of EXPECTED_SKILLS)
    await rm(join(workspacePath, slug), { recursive: true, force: true })

  await removeOtherFixtures(workspacePath, task)
  if (arm === 'exemplar')
    await cp(resolve(EXEMPLAR_DIR), join(workspacePath, EXEMPLAR_WORKSPACE_DIR), {
      recursive: true,
    })
  for (const file of task.sharedFiles ?? [])
    await cp(
      join(workspacePath, FIXTURE_ROOT, 'shared', file),
      join(workspacePath, TASKS_DIR, task.id, file),
    )

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
