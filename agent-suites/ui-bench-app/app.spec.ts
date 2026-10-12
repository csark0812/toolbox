import { describe, expect } from '@post-print/agent-test'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { buildAndRender, loadFixture } from '../ui-bench/app-build.mjs'
import { renderUsage, type ToolCall } from '../ui-bench/render-usage'
import { appArmPrompt, prepareAppArm, type AppTask } from './prepare'

// App-fixture benchmark: agents build a new screen inside a real project copy (kept local and
// git-ignored). Like the page bench it is not a gate: a test fails only when the run breaks or the
// screen does not build.
const appName = process.env.UI_BENCH_APP
const fixture = appName ? loadFixture(appName) : null
const arms = (process.env.UI_BENCH_ARMS ?? 'none,ux-principles').split(',').map((arm) => arm.trim())
const tasks: AppTask[] = fixture
  ? readdirSync(fixture.tasksRoot)
      .filter((id) => existsSync(join(fixture.tasksRoot, id, 'task.json')))
      .sort()
      .map((id) => JSON.parse(readFileSync(join(fixture.tasksRoot, id, 'task.json'), 'utf8')))
  : []

const test = describe('ui-bench-app', ({ agent }) => ({ coder: agent() }))

const normalize = (text: string) => text.replace(/\s+/g, ' ').toLowerCase()

for (const task of tasks)
  for (const arm of arms)
    test(
      `${task.id} · ${arm}`,
      {
        description: `${appName} screen ${task.id}, ${arm} arm`,
        criteria: ['The agent finished and the screen built and rendered'],
      },
      async ({ coder }, info) => {
        if (!fixture)
          throw new Error('Set UI_BENCH_APP to a fixture under agent-suites/ui-bench/local/')
        const run = await coder
          .setup((workspace) => prepareAppArm(workspace.path, task, arm, fixture.dataDir))
          .run({ prompt: appArmPrompt(task, arm), includeGlobalSkills: false })

        const screenExists = existsSync(join(run.workspace.root, task.screenFile))
        const rendered = screenExists
          ? await buildAndRender({
              fixture,
              workspace: run.workspace.root,
              route: task.route,
              outDir: info.outputPath('render'),
            })
          : null
        const text = normalize(rendered?.text ?? '')
        const defects = [
          ...(rendered?.findings ?? []),
          ...task.invariants.requiredText
            .filter((required) => !text.includes(normalize(required)))
            .map((required) => ({
              check: 'invariant-text',
              view: '1440',
              detail: `missing "${required}"`,
            })),
        ]
        const outcome = !screenExists
          ? 'page-missing'
          : rendered?.buildFailed
            ? 'build-failed'
            : !text.trim()
              ? 'blank-render'
              : 'graded'
        const evidence = {
          schemaVersion: 1,
          bench: 'ui-bench-app',
          app: appName,
          task: task.id,
          kind: task.kind,
          arm,
          repetition: info.repeatEachIndex,
          outcome,
          defects,
          screenshots: rendered?.screenshots ?? {},
          degradedScreenshots: {},
          judgeShots: task.judgeShots,
          renderUsage: renderUsage(run.toolCalls as ToolCall[]),
          changedPaths: run.workspace.changedPaths,
          output: run.output,
          buildLog: rendered?.buildFailed ? rendered.buildLog : undefined,
          measurements: { durationMs: run.durationMs, tokens: run.usage.tokens.total ?? null },
        }
        await mkdir(info.outputDir, { recursive: true })
        const evidencePath = info.outputPath('ui-bench-evidence.json')
        await writeFile(evidencePath, JSON.stringify(evidence, null, 2))
        await info.attach('UI bench evidence', {
          path: evidencePath,
          contentType: 'application/json',
        })
        for (const shot of task.judgeShots)
          if (rendered?.screenshots[shot])
            await info.attach(`${arm} ${shot}`, {
              path: rendered.screenshots[shot],
              contentType: 'image/png',
            })

        expect(outcome, `${task.screenFile} builds and renders`).toBe('graded')
      },
    )
