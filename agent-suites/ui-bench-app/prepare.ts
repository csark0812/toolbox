import { cp, mkdir, rename, rm } from 'node:fs/promises'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { TASK_BUNDLE_DIR } from '../ui-bench/app-build.mjs'
import { SOURCE_SKILLS } from '../ui-bench/arms'

export interface AppTask {
  id: string
  kind: 'app-screen'
  route: string
  screenFile: string
  prompt: string
  invariants: { unchangedFiles: string[]; requiredText: string[] }
  judgeShots: string[]
}

/** App arms: the bare task, the one-liner, or a skill (original or candidate). */
export function appArmPrompt(task: AppTask, arm: string) {
  const base =
    'This is an isolated benchmark copy of the app (source only; dependencies are not installed, so you ' +
    'cannot run the app, its tests or type checkers here). Run commands from the workspace root and use ' +
    'workspace-relative paths without `..`. The `render_screen` tool builds your current source and renders ' +
    'a route at phone and desktop widths, returning build errors or screenshots.\n\n'
  const suffix = SOURCE_SKILLS[arm]
    ? `Use the ${arm} skill (\`.claude/skills/${arm}/SKILL.md\`).`
    : arm === 'one-liner'
      ? 'Make it well crafted: accessible, responsive from 320px, consistent with the existing design system, and check the rendered result.'
      : ''
  return `${base}${task.prompt}${suffix ? `\n\n${suffix}` : ''}`
}

/** Keep only the current task (brief + sample data in place) and install the arm's skill. */
export async function prepareAppArm(
  workspacePath: string,
  task: AppTask,
  arm: string,
  dataDir: string,
) {
  const bundle = join(workspacePath, TASK_BUNDLE_DIR, task.id)
  await mkdir(join(workspacePath, 'bench-task'), { recursive: true })
  await rename(join(bundle, 'brief.md'), join(workspacePath, 'bench-task/brief.md'))
  await mkdir(join(workspacePath, dataDir), { recursive: true })
  await rename(join(bundle, 'sample-data.ts'), join(workspacePath, dataDir, `${task.id}.ts`))
  await rm(join(workspacePath, TASK_BUNDLE_DIR), { recursive: true, force: true })
  if (SOURCE_SKILLS[arm])
    for (const mirror of ['.claude/skills', '.agents/skills'])
      await cp(resolve(SOURCE_SKILLS[arm]), join(workspacePath, mirror, arm), { recursive: true })
  execFileSync('git', ['init', '-q'], { cwd: workspacePath })
  execFileSync('git', ['add', '.'], { cwd: workspacePath })
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Bench',
      '-c',
      'user.email=bench@example.invalid',
      'commit',
      '-qm',
      'Fixture baseline',
    ],
    { cwd: workspacePath },
  )
}
