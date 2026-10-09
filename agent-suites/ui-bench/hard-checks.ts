import { cp, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
// The grader uses the same render core as the agents' render_page tool.
import { renderPage } from './render-core.mjs'
import { taskDir, type BenchTask } from './tasks'

export interface Defect {
  check: string
  view: string
  detail: string
}

export interface HardCheckResult {
  /** No page existed to render: an infrastructure-level miss, not a quality score. */
  pageMissing: boolean
  defects: Defect[]
  screenshots: Record<string, string>
}

/**
 * Grade one finished workspace: render findings, task checks and invariants.
 * `sourceRoot` is the checkout holding the pristine fixture used for invariants.
 */
export async function runHardChecks(
  workspaceRoot: string,
  task: BenchTask,
  outDir: string,
  sourceRoot = process.cwd(),
): Promise<HardCheckResult> {
  const dir = join(workspaceRoot, taskDir(task))
  const page = join(dir, task.page)
  if (!(await exists(page))) return { pageMissing: true, defects: [], screenshots: {} }

  const rendered = await renderPage({
    page,
    outDir,
    primarySelector: task.primarySelector,
    taskChecks: task.taskChecks ?? [],
  })
  const defects: Defect[] = [...rendered.findings]

  for (const file of task.invariants.unchangedFiles) {
    const original = await readFile(resolve(sourceRoot, taskDir(task), file), 'utf8')
    const current = await readFile(join(dir, file), 'utf8').catch(() => null)
    if (current !== original)
      defects.push({ check: 'invariant-file', view: 'source', detail: `${file} was changed` })
  }
  const normalizedText = normalize(rendered.text)
  for (const text of task.invariants.requiredText)
    if (!normalizedText.includes(normalize(text)))
      defects.push({ check: 'invariant-text', view: '1440', detail: `missing "${text}"` })

  return { pageMissing: false, defects, screenshots: rendered.screenshots }
}

/**
 * Known-gap control material: the run's own page with every stylesheet and style block removed.
 * A healthy judge must prefer the styled page over this in both orders.
 */
export async function renderDegraded(workspaceRoot: string, task: BenchTask, outDir: string) {
  const copy = await mkdtemp(join(tmpdir(), 'ui-bench-degraded-'))
  try {
    const dir = join(copy, taskDir(task))
    await cp(join(workspaceRoot, taskDir(task)), dir, { recursive: true })
    const page = join(dir, task.page)
    const html = await readFile(page, 'utf8')
    await writeFile(
      page,
      html
        .replace(/<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/\sstyle=("[^"]*"|'[^']*')/gi, ''),
    )
    const { screenshots } = await renderPage({ page, outDir })
    return screenshots
  } finally {
    await rm(copy, { recursive: true, force: true })
  }
}

function normalize(text: string) {
  return text.replace(/\s+/g, ' ').toLowerCase()
}

async function exists(path: string) {
  return stat(path).then(
    () => true,
    () => false,
  )
}
