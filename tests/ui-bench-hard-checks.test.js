import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { renderPage } from '../agent-suites/ui-bench/render-core.mjs'
import { runHardChecks } from '../agent-suites/ui-bench/hard-checks.ts'
import { loadTasks } from '../agent-suites/ui-bench/tasks.ts'

// Needs a local Chromium (`npx playwright install chromium`); CI has none, so this is opt-in:
// TOOLBOX_BROWSER_TESTS=1 npx vitest run tests/ui-bench-hard-checks.test.js
const browser = describe.skipIf(!process.env.TOOLBOX_BROWSER_TESTS)
const SURFACE = resolve('agent-suites/fixtures/rendered-surface')
const scratch = await mkdtemp(join(tmpdir(), 'ui-bench-checks-'))
afterAll(() => rm(scratch, { recursive: true, force: true }))

const checksFor = async (file, primarySelector = '#primary') =>
  (
    await renderPage({ page: join(SURFACE, file), outDir: join(scratch, file), primarySelector })
  ).findings.map((finding) => finding.check)

/** A throwaway workspace holding the pristine ui-bench fixtures. */
async function workspace() {
  const root = await mkdtemp(join(scratch, 'ws-'))
  await cp(
    resolve('agent-suites/fixtures/ui-bench'),
    join(root, 'agent-suites/fixtures/ui-bench'),
    {
      recursive: true,
    },
  )
  return root
}

browser('ui-bench render checks', { timeout: 120000 }, () => {
  it('passes the known-good surface on overflow, contrast and focus', async () => {
    const checks = await checksFor('good.html')
    expect(checks).not.toContain('page-overflow')
    expect(checks).not.toContain('axe:color-contrast')
    expect(checks).not.toContain('focus-indicator')
  })

  it.each([
    ['overflow.html', 'page-overflow'],
    ['low-contrast.html', 'axe:color-contrast'],
    ['no-focus.html', 'focus-indicator'],
  ])('flags %s with %s', async (file, check) => {
    expect(await checksFor(file)).toContain(check)
  })
})

browser('ui-bench seeded fixtures', { timeout: 300000 }, () => {
  const tasks = loadTasks()

  it.each(tasks.filter((task) => task.skill === 'css-craft').map((task) => [task.id, task]))(
    'untouched %s fails its hard checks as seeded',
    async (_id, task) => {
      const root = await workspace()
      const result = await runHardChecks(root, task, join(root, '_out'))
      expect(result.pageMissing).toBe(false)
      expect(result.defects.length).toBeGreaterThan(0)
    },
  )

  it('treats a missing interface-design page as missing, not graded', async () => {
    const task = tasks.find((candidate) => candidate.id === 'paper-library')
    const result = await runHardChecks(await workspace(), task, join(scratch, 'missing'))
    expect(result.pageMissing).toBe(true)
  })

  it('reports an edited design system as an invariant defect', async () => {
    const task = tasks.find((candidate) => candidate.id === 'card-grid')
    const root = await workspace()
    await writeFile(
      join(root, 'agent-suites/fixtures/ui-bench/shared/design-system.css'),
      ':root{}',
    )
    const result = await runHardChecks(root, task, join(root, '_out'))
    expect(result.defects.map((defect) => defect.check)).toContain('invariant-file')
  })
})
