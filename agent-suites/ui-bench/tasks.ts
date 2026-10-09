import { readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const FIXTURE_ROOT = 'agent-suites/fixtures/ui-bench'
export const TASKS_DIR = `${FIXTURE_ROOT}/tasks`

export type BenchSkill = 'css-craft' | 'interface-design'

export type TaskCheck =
  | { type: 'anchor-visible'; hash: string; heading?: string; widths?: number[] }
  | {
      type: 'computed-style'
      selector: string
      property: string
      oneOf: string[]
      label: string
      widths?: number[]
    }
  | { type: 'text-at'; query: string; text: string; label: string; widths?: number[] }
  | {
      type: 'luminance'
      scheme: 'light' | 'dark'
      selector: string
      property: string
      max: number
      label: string
      widths?: number[]
    }

export interface BenchTask {
  id: string
  skill: BenchSkill
  page: string
  primarySelector: string
  prompt: string
  editable: string[]
  invariants: { unchangedFiles: string[]; requiredText: string[] }
  judgeShots: string[]
  taskChecks?: TaskCheck[]
}

/** Every benchmark task, read from its fixture `task.json`, in stable order. */
export function loadTasks(root = process.cwd()): BenchTask[] {
  const dir = resolve(root, TASKS_DIR)
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => JSON.parse(readFileSync(join(dir, entry.name, 'task.json'), 'utf8')))
    .sort((a, b) => a.skill.localeCompare(b.skill) || a.id.localeCompare(b.id))
}

export function taskDir(task: BenchTask): string {
  return `${TASKS_DIR}/${task.id}`
}
