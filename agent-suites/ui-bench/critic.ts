import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Run } from '@post-print/agent-test'
// The critic and the keep-if-better comparison share the judge's sealed Opus sessions.
import { compareVersions, critiquePage } from '../../scripts/ui-bench-judge.mjs'
import { runHardChecks, type HardCheckResult } from './hard-checks'
import { taskDir, type BenchTask } from './tasks'

export interface CriticOutcome {
  fixes: string[]
  /** Which version the bench keeps: the revision only when it beats the original. */
  kept: 'original' | 'revised'
  verdict: 'a' | 'b' | 'tie' | 'revision-missing'
  revised: Run
  revisedChecks: HardCheckResult
}

/** The critic sees what the judge sees: the brief (or task prompt) and screenshots. */
function judgeTask(task: BenchTask) {
  const briefPath = resolve(taskDir(task), 'brief.md')
  return { ...task, brief: existsSync(briefPath) ? readFileSync(briefPath, 'utf8') : task.prompt }
}

export function revisionPrompt(fixes: string[]) {
  return (
    'A design reviewer looked at your rendered page and asked for these changes:\n' +
    fixes.map((fix, index) => `${index + 1}. ${fix}`).join('\n') +
    '\n\nApply them, render the page again, and check the result.'
  )
}

/**
 * Critique → revise → keep-if-better, one round. A separate Opus critic proposes fixes from the
 * screenshots; the builder applies them in the same conversation; the revision is kept only if
 * it wins a both-orders comparison against the original.
 */
export async function critiqueAndRevise(input: {
  run: Run
  task: BenchTask
  checks: HardCheckResult
  outDir: string
}): Promise<CriticOutcome> {
  const { run, task, checks, outDir } = input
  const reviewed = judgeTask(task)
  const fixes: string[] = await critiquePage({
    task: reviewed,
    screenshots: checks.screenshots,
    shots: task.judgeShots,
  })
  const revised = await run.continue({ prompt: revisionPrompt(fixes) })
  const revisedChecks = await runHardChecks(revised.workspace.root, task, outDir)
  if (revisedChecks.pageMissing)
    return { fixes, kept: 'original', verdict: 'revision-missing', revised, revisedChecks }
  const verdict: 'a' | 'b' | 'tie' = await compareVersions({
    task: reviewed,
    a: checks.screenshots,
    b: revisedChecks.screenshots,
    shots: task.judgeShots,
  })
  return { fixes, kept: verdict === 'b' ? 'revised' : 'original', verdict, revised, revisedChecks }
}
