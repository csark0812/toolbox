import { describe, expect } from '@post-print/agent-test'
import { mkdir, writeFile } from 'node:fs/promises'
import { armAppliesTo, armPrompt, armsFromEnv, prepareArm } from './arms'
import { critiqueAndRevise } from './critic'
import { renderDegraded, runHardChecks } from './hard-checks'
import { renderUsage, type ToolCall } from './render-usage'
import { loadTasks } from './tasks'

// Benchmark, not a gate: quality is graded later by blind pairwise judging.
// A test fails only when the run itself breaks or leaves no page to grade.
const test = describe('ui-bench', ({ agent }) => ({ coder: agent() }))

const arms = armsFromEnv()
for (const task of loadTasks())
  for (const arm of arms.filter((candidate) => armAppliesTo(task, candidate)))
    test(
      `${task.id} · ${arm}`,
      {
        description: `${task.kind} benchmark task ${task.id}, ${arm} arm`,
        criteria: ['The agent finished and left a page the hard checks could render'],
      },
      async ({ coder }, info) => {
        const run = await coder
          .setup((workspace) => prepareArm(workspace.path, task, arm))
          .run({ prompt: armPrompt(task, arm), includeGlobalSkills: false })

        const renderDir = info.outputPath('render')
        const firstChecks = await runHardChecks(run.workspace.root, task, renderDir)
        const critic =
          arm === 'critic' && !firstChecks.pageMissing
            ? await critiqueAndRevise({
                run,
                task,
                checks: firstChecks,
                outDir: info.outputPath('render-revised'),
              })
            : null
        const keptRevision = critic?.kept === 'revised'
        const checks = keptRevision ? critic.revisedChecks : firstChecks
        const finalRun = critic ? critic.revised : run
        const degraded = checks.pageMissing
          ? {}
          : await renderDegraded(finalRun.workspace.root, task, info.outputPath('degraded'))
        const evidence = {
          schemaVersion: 1,
          bench: 'ui-bench',
          task: task.id,
          kind: task.kind,
          arm,
          repetition: info.repeatEachIndex,
          outcome: checks.pageMissing ? 'page-missing' : 'graded',
          defects: checks.defects,
          screenshots: checks.screenshots,
          degradedScreenshots: degraded,
          judgeShots: task.judgeShots,
          renderUsage: renderUsage(run.toolCalls as ToolCall[]),
          changedPaths: finalRun.workspace.changedPaths,
          output: run.output,
          critic: critic
            ? {
                fixes: critic.fixes,
                verdict: critic.verdict,
                kept: critic.kept,
                originalScreenshots: firstChecks.screenshots,
                revisedScreenshots: critic.revisedChecks.screenshots,
              }
            : null,
          // Builder cost only; the critic and keep-if-better judge are Opus calls on top.
          measurements: {
            durationMs: run.durationMs + (critic?.revised.durationMs ?? 0),
            tokens:
              (run.usage.tokens.total ?? 0) + (critic?.revised.usage.tokens.total ?? 0) || null,
          },
        }
        await mkdir(info.outputDir, { recursive: true })
        const evidencePath = info.outputPath('ui-bench-evidence.json')
        await writeFile(evidencePath, JSON.stringify(evidence, null, 2))
        await info.attach('UI bench evidence', {
          path: evidencePath,
          contentType: 'application/json',
        })
        for (const shot of task.judgeShots)
          if (checks.screenshots[shot])
            await info.attach(`${arm} ${shot}`, {
              path: checks.screenshots[shot],
              contentType: 'image/png',
            })

        expect(checks.pageMissing, `${task.page} exists after the run`).toBe(false)
      },
    )
